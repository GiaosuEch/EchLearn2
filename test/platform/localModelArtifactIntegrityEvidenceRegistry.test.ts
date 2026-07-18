import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from '../../src/platform/ai/localModelArtifactManifest.ts';
import { buildCurrentLocalModelAcquisitionCloseout } from '../../src/platform/ai/localModelAcquisitionCloseout.ts';
import { listCurrentLocalModelArtifactSelections } from '../../src/platform/ai/localModelArtifactSelectionPolicy.ts';
import { listLocalModelArtifactEvidence } from '../../src/platform/ai/localModelArtifactEvidenceRegistry.ts';
import {
  LOCAL_MODEL_ARTIFACT_INTEGRITY_EVIDENCE_REGISTRY,
  calculateExactArtifactFileBytes,
  evaluateLocalModelArtifactIntegrityEvidence,
  getLocalModelArtifactIntegrityEvidence,
  listLocalModelArtifactIntegrityEvidence,
  validateLocalModelArtifactIntegrityEvidenceRegistry,
  validateWeightIndexConsistency,
  validateWeightShardInventory,
} from '../../src/platform/ai/localModelArtifactIntegrityEvidenceRegistry.ts';
import type { LocalModelArtifactIntegrityCandidateRecord, LocalModelArtifactIntegrityFileEvidence } from '../../src/platform/ai/localModelArtifactIntegrityEvidenceTypes.ts';

function cloneRecord(record: LocalModelArtifactIntegrityCandidateRecord): LocalModelArtifactIntegrityCandidateRecord {
  return structuredClone(record);
}
function read(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Phase 5.5 official artifact integrity evidence registry', () => {
  it('has one record per production candidate with exact tier, class, repository, and immutable revision mapping', () => {
    const records = listLocalModelArtifactIntegrityEvidence();
    const phase53 = listLocalModelArtifactEvidence();
    assert.equal(records.length, 3);
    assert.deepEqual(records.map((record) => record.candidateId), LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) => candidate.candidateId));
    assert.equal(new Set(records.map((record) => record.candidateId)).size, 3);
    assert.equal(getLocalModelArtifactIntegrityEvidence('unknown-candidate'), null);
    assert.ok(records.every((record) => String(record.candidateTier) !== 'ultra-low'));
    for (const record of records) {
      const evidence = phase53.find((item) => item.candidateId === record.candidateId)!;
      assert.equal(record.candidateTier, evidence.candidateTier);
      assert.equal(record.modelClass, evidence.modelClass);
      assert.equal(record.exactModelName, evidence.exactModelName);
      assert.equal(record.officialRepositoryId, evidence.officialRepositoryId);
      assert.equal(record.observedRevision, evidence.observedRevision);
      assert.match(record.observedRevision ?? '', /^[a-f0-9]{40}$/);
      assert.notEqual(record.observedRevision, 'main');
      assert.equal(record.immutableRevisionConfirmed, 'confirmed');
    }
  });

  it('records the exact immutable weight inventory and exact official file bytes for all candidates', () => {
    const expected = new Map<string, { files: readonly [string, number][]; index: string; total: number }>([
      ['qwen3-0-6b-candidate', { files: [['model.safetensors', 1_503_300_328]], index: 'absent', total: 1_503_300_328 }],
      ['qwen3-1-7b-candidate', { files: [['model-00001-of-00002.safetensors', 3_441_185_608], ['model-00002-of-00002.safetensors', 622_329_984]], index: 'confirmed', total: 4_063_515_592 }],
      ['qwen3-4b-candidate', { files: [['model-00001-of-00003.safetensors', 3_957_900_840], ['model-00002-of-00003.safetensors', 3_987_450_520], ['model-00003-of-00003.safetensors', 99_630_640]], index: 'confirmed', total: 8_044_982_000 }],
    ]);
    for (const record of LOCAL_MODEL_ARTIFACT_INTEGRITY_EVIDENCE_REGISTRY) {
      const item = expected.get(record.candidateId)!;
      assert.deepEqual(record.requiredWeightFiles.map((file) => [file.fileName, file.exactSizeBytes]), item.files);
      assert.equal(record.weightShardCount, item.files.length);
      assert.equal(record.weightIndexStatus, item.index);
      assert.equal(record.exactWeightBytes, item.total);
      assert.equal(record.exactWeightMiB, item.total / (1024 * 1024));
      assert.equal(validateWeightShardInventory(record).valid, true);
      assert.equal(validateWeightIndexConsistency(record).valid, true);
    }
  });

  it('distinguishes exact file bytes from tensor payload totals and final download size', () => {
    const record06 = getLocalModelArtifactIntegrityEvidence('qwen3-0-6b-candidate')!;
    const record17 = getLocalModelArtifactIntegrityEvidence('qwen3-1-7b-candidate')!;
    const record4 = getLocalModelArtifactIntegrityEvidence('qwen3-4b-candidate')!;
    assert.equal(record06.exactWeightBytes, 1_503_300_328);
    assert.equal(record17.exactWeightBytes, 4_063_515_592);
    assert.equal(record4.exactWeightBytes, 8_044_982_000);
    assert.notEqual(record17.exactWeightBytes, 4_063_479_808);
    assert.notEqual(record4.exactWeightBytes, 8_044_936_192);
    for (const record of [record06, record17, record4]) {
      assert.equal(record.futureDownloadSizeBytes, null);
      assert.equal(record.futureDownloadSizeMb, null);
    }
  });

  it('calculates exact bytes only from unique official finite non-negative integer file evidence', () => {
    const valid: LocalModelArtifactIntegrityFileEvidence[] = [
      { fileName: 'weight-a.safetensors', fileRole: 'weight', exactSizeBytes: 1024, exactSizeStatus: 'confirmed', integrityMetadataStatus: 'confirmed', integrityAlgorithm: 'lfs-sha256', integrityValueAvailable: true, integrityValueRecordedInRuntime: false, checksumPinned: false, checksumVerified: false, sourceIds: ['a'], warnings: [], conflicts: [] },
      { fileName: 'weight-b.safetensors', fileRole: 'weight', exactSizeBytes: 2048, exactSizeStatus: 'confirmed', integrityMetadataStatus: 'confirmed', integrityAlgorithm: 'lfs-sha256', integrityValueAvailable: true, integrityValueRecordedInRuntime: false, checksumPinned: false, checksumVerified: false, sourceIds: ['b'], warnings: [], conflicts: [] },
    ];
    assert.equal(calculateExactArtifactFileBytes(valid), 3072);
    assert.equal(calculateExactArtifactFileBytes([...valid, valid[0]]), null);
    assert.equal(calculateExactArtifactFileBytes([{ ...valid[0], exactSizeBytes: null }]), null);
    assert.equal(calculateExactArtifactFileBytes([{ ...valid[0], exactSizeBytes: Number.NaN }]), null);
    assert.equal(calculateExactArtifactFileBytes([{ ...valid[0], exactSizeBytes: 1.5 }]), null);
    assert.equal(calculateExactArtifactFileBytes([{ ...valid[0], exactSizeBytes: -1 }]), null);
    assert.equal(calculateExactArtifactFileBytes([{ ...valid[0], exactSizeStatus: 'unknown' }]), null);
  });

  it('rejects duplicate, missing, and inconsistent shard/index inventories without mutating input', () => {
    const original = getLocalModelArtifactIntegrityEvidence('qwen3-1-7b-candidate')!;
    const before = cloneRecord(original);
    const duplicate = cloneRecord({ ...original, requiredWeightFiles: [...original.requiredWeightFiles, original.requiredWeightFiles[0]], weightShardCount: 3 });
    assert.equal(validateWeightShardInventory(duplicate).valid, false);
    assert.equal(evaluateLocalModelArtifactIntegrityEvidence(duplicate).evidenceStatus, 'evidence-incomplete');
    const missing = cloneRecord({ ...original, indexedWeightFiles: [...original.indexedWeightFiles, 'missing-shard.safetensors'] });
    assert.equal(validateWeightIndexConsistency(missing).valid, false);
    const single = getLocalModelArtifactIntegrityEvidence('qwen3-0-6b-candidate')!;
    assert.equal(single.weightIndexStatus, 'absent');
    assert.equal(validateWeightIndexConsistency(single).valid, true);
    assert.deepEqual(original, before);
  });

  it('keeps integrity algorithms distinct and never turns observed metadata into pinning or verification', () => {
    for (const record of LOCAL_MODEL_ARTIFACT_INTEGRITY_EVIDENCE_REGISTRY) {
      assert.ok(record.integrityAlgorithmsObserved.includes('lfs-sha256'));
      assert.ok(record.integrityAlgorithmsObserved.includes('xet-content-hash'));
      assert.ok(record.requiredWeightFiles.every((file) => file.integrityAlgorithm === 'lfs-sha256'));
      assert.ok(record.requiredWeightFiles.every((file) => file.integrityValueAvailable));
      assert.ok(record.requiredWeightFiles.every((file) => !file.integrityValueRecordedInRuntime));
      assert.equal(record.checksumValuesRecordedInRuntime, false);
      assert.equal(record.checksumPinned, false);
      assert.equal(record.checksumVerified, false);
    }
  });

  it('records support-file roles conservatively without treating support bytes as an approved bundle', () => {
    for (const record of LOCAL_MODEL_ARTIFACT_INTEGRITY_EVIDENCE_REGISTRY) {
      const roles = new Set(record.supportFiles.map((file) => file.fileRole));
      for (const role of ['config', 'generation-config', 'tokenizer', 'tokenizer-config', 'license', 'model-card']) assert.ok(roles.has(role as never));
      assert.equal(record.exactSupportFilesBytes, null);
      assert.equal(record.exactSupportFilesMiB, null);
      assert.equal(record.futureDownloadSizeBytes, null);
    }
  });

  it('keeps evidence review incomplete and every production approval/runtime invariant false', () => {
    for (const record of LOCAL_MODEL_ARTIFACT_INTEGRITY_EVIDENCE_REGISTRY) {
      assert.equal(record.evidenceStatus, 'evidence-incomplete');
      assert.ok(record.missingEvidence.includes('complete-support-file-integrity-review'));
      assert.equal(record.humanReviewRequired, true);
      assert.equal(record.artifactSelected, false);
      assert.equal(record.artifactApproved, false);
      assert.equal(record.downloadLocationConfigured, false);
      assert.equal(record.benchmarkVerified, false);
      assert.equal(record.downloadable, false);
      assert.equal(record.cacheable, false);
      assert.equal(record.runtimeReady, false);
      assert.equal(record.modelActive, false);
    }
  });

  it('validates deterministically and keeps Phase 5.4, approval registry, manifest, and Phase 4 closeout unchanged', () => {
    const approvalBefore = structuredClone(LOCAL_MODEL_APPROVAL_REGISTRY);
    const manifestBefore = structuredClone(LOCAL_MODEL_ARTIFACT_MANIFEST);
    assert.equal(listCurrentLocalModelArtifactSelections().filter((result) => result.artifactSelected).length, 0);
    assert.equal(buildCurrentLocalModelAcquisitionCloseout().phaseFoundationComplete, true);
    assert.deepEqual(validateLocalModelArtifactIntegrityEvidenceRegistry(), { valid: true, issues: [] });
    assert.deepEqual(validateLocalModelArtifactIntegrityEvidenceRegistry(), validateLocalModelArtifactIntegrityEvidenceRegistry());
    assert.deepEqual(LOCAL_MODEL_APPROVAL_REGISTRY, approvalBefore);
    assert.deepEqual(LOCAL_MODEL_ARTIFACT_MANIFEST, manifestBefore);
  });

  it('contains no runtime network, digest values, direct artifact locations, or unsafe execution patterns', () => {
    const source = [read('../../src/platform/ai/localModelArtifactIntegrityEvidenceTypes.ts'), read('../../src/platform/ai/localModelArtifactIntegrityEvidenceRegistry.ts'), read('../../src/platform/ai/localModelArtifactIntegrityEvidenceViewModel.ts')].join('\n');
    for (const pattern of [/fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /indexedDB/, /CacheStorage/, /caches\.open/, /localStorage/, /sessionStorage/, /requestAdapter\s*\(/, /requestDevice\s*\(/, /AIService/, /\.execute\s*\(/, /Math\.random/, /Date\.now/, /setTimeout/, /\bWorker\s*\(/, /SharedWorker\s*\(/, /serviceWorker\.register/, /\/resolve\//, /\?download=/, /cdn-lfs/i, /cas-bridge/i, /https?:\/\/[^\s'\"]+\.(?:safetensors|bin|gguf)(?:$|[?#])/i, /artifactApproved:\s*true/, /checksumPinned:\s*true/, /checksumVerified:\s*true/, /downloadable:\s*true/, /runtimeReady:\s*true/, /modelActive:\s*true/]) assert.equal(pattern.test(source), false, `forbidden pattern ${pattern}`);
    assert.equal(/\b[a-f0-9]{64}\b/i.test(source), false);
  });
});
