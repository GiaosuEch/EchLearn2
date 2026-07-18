import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { buildCurrentLocalModelAcquisitionCloseout } from '../../src/platform/ai/localModelAcquisitionCloseout.ts';
import { buildCurrentLocalModelCandidateReviewDecisions } from '../../src/platform/ai/localModelCandidateReviewDecisionPolicy.ts';
import {
  LOCAL_MODEL_ARTIFACT_EVIDENCE_REGISTRY,
  calculateOfficialAggregateWeightSize,
  evaluateLocalModelArtifactEvidence,
  getLocalModelArtifactEvidence,
  listLocalModelArtifactEvidence,
  validateLocalModelArtifactEvidenceRegistry,
} from '../../src/platform/ai/localModelArtifactEvidenceRegistry.ts';
import type {
  LocalModelArtifactEvidenceRecord,
  LocalModelOfficialArtifactFileEvidence,
} from '../../src/platform/ai/localModelArtifactEvidenceTypes.ts';

function cloneRecord(record: LocalModelArtifactEvidenceRecord): LocalModelArtifactEvidenceRecord {
  return structuredClone(record);
}

function read(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Phase 5.3 official artifact provenance evidence registry', () => {
  it('has exactly one record per production candidate with exact tier and repository mapping', () => {
    const approvalIds = LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) => candidate.candidateId);
    const records = listLocalModelArtifactEvidence();
    assert.equal(records.length, 3);
    assert.deepEqual(records.map((record) => record.candidateId), approvalIds);
    assert.equal(new Set(records.map((record) => record.candidateId)).size, 3);
    assert.equal(getLocalModelArtifactEvidence('missing-candidate'), null);

    const expected = new Map([
      ['qwen3-0-6b-candidate', ['light', '0.6B', 'Qwen3-0.6B', 'Qwen/Qwen3-0.6B']],
      ['qwen3-1-7b-candidate', ['standard', '1.7B', 'Qwen3-1.7B', 'Qwen/Qwen3-1.7B']],
      ['qwen3-4b-candidate', ['pro', '4B', 'Qwen3-4B', 'Qwen/Qwen3-4B']],
    ]);
    for (const record of records) {
      assert.deepEqual(
        [record.candidateTier, record.modelClass, record.exactModelName, record.officialRepositoryId],
        expected.get(record.candidateId),
      );
      assert.equal(String(record.candidateTier) === 'ultra-low', false);
    }
  });

  it('records immutable official revisions and conservative safetensors inventories without selecting artifacts', () => {
    const expected = new Map([
      ['qwen3-0-6b-candidate', ['c1899de289a04d12100db370d81485cdf75e47ca', 1, 'absent']],
      ['qwen3-1-7b-candidate', ['70d244cc86ccca08cf5af4e1e306ecf908b1ad5e', 2, 'confirmed']],
      ['qwen3-4b-candidate', ['1cfa9a7208912126459214e8b04321603b3df60c', 3, 'confirmed']],
    ]);
    for (const record of LOCAL_MODEL_ARTIFACT_EVIDENCE_REGISTRY) {
      const [revision, shardCount, indexStatus] = expected.get(record.candidateId)!;
      assert.equal(record.officialRepositoryConfirmed, 'confirmed');
      assert.equal(record.observedRevision, revision);
      assert.match(record.observedRevision ?? '', /^[a-f0-9]{40}$/);
      assert.equal(record.immutableRevisionAvailable, 'confirmed');
      assert.equal(record.artifactFormat, 'safetensors');
      assert.equal(record.officialBaseVariantConfirmed, 'confirmed');
      assert.equal(record.weightFilesPresent, 'confirmed');
      assert.equal(record.weightShardCount, shardCount);
      assert.equal(record.weightIndexPresent, indexStatus);
      assert.equal(record.artifactSelected, false);
      assert.equal(record.directDownloadLocationRecorded, false);
    }
  });

  it('records config, tokenizer, license, model-card, LFS and official Qwen GGUF evidence conservatively', () => {
    for (const record of LOCAL_MODEL_ARTIFACT_EVIDENCE_REGISTRY) {
      assert.equal(record.configPresent, 'confirmed');
      assert.equal(record.generationConfigPresent, 'confirmed');
      assert.equal(record.tokenizerFilesPresent, 'confirmed');
      assert.equal(record.tokenizerConfigPresent, 'confirmed');
      assert.equal(record.licenseFilePresent, 'confirmed');
      assert.equal(record.noticeFilePresent, 'absent');
      assert.equal(record.modelCardPresent, 'confirmed');
      assert.equal(record.lfsMetadataAvailable, 'confirmed');
      assert.equal(record.officialQuantizedVariantAvailable, 'confirmed');
      assert.match(record.officialQuantizedRepositoryId ?? '', /^Qwen\/Qwen3-(?:0\.6B|1\.7B|4B)-GGUF$/);
      assert.match(record.quantizationLabel ?? '', /official Qwen GGUF/i);
      assert.equal(record.checksumValuesRecorded, false);
      assert.equal(record.checksumVerified, false);
    }
  });

  it('records exact aggregate bytes only when official index metadata provides them', () => {
    const expectedSizes = new Map<string, number | null>([
      ['qwen3-0-6b-candidate', null],
      ['qwen3-1-7b-candidate', 4_063_479_808],
      ['qwen3-4b-candidate', 8_044_936_192],
    ]);
    for (const record of LOCAL_MODEL_ARTIFACT_EVIDENCE_REGISTRY) {
      const expectedBytes = expectedSizes.get(record.candidateId)!;
      assert.equal(record.aggregateWeightSizeBytes, expectedBytes);
      assert.equal(
        record.aggregateWeightSizeMb,
        expectedBytes === null ? null : expectedBytes / (1024 * 1024),
      );
      assert.equal(record.aggregateSizeEvidenceStatus, expectedBytes === null ? 'unknown' : 'confirmed');
      assert.equal(record.evidenceStatus, 'evidence-incomplete');
      assert.equal(record.missingEvidence.includes('exact-aggregate-weight-size'), expectedBytes === null);
      assert.ok(record.weightFiles.every((file) => file.exactSizeBytes === null));
    }
  });

  it('calculates aggregate size only from unique official finite non-negative exact bytes', () => {
    const valid: LocalModelOfficialArtifactFileEvidence[] = [
      { fileName: 'weight-a.safetensors', exactSizeBytes: 1024, officialMetadata: true },
      { fileName: 'weight-b.safetensors', exactSizeBytes: 2048, officialMetadata: true },
    ];
    assert.equal(calculateOfficialAggregateWeightSize(valid), 3072);
    assert.equal(calculateOfficialAggregateWeightSize([...valid, valid[0]]), null);
    assert.equal(calculateOfficialAggregateWeightSize([{ ...valid[0], exactSizeBytes: null }]), null);
    assert.equal(calculateOfficialAggregateWeightSize([{ ...valid[0], exactSizeBytes: Number.NaN }]), null);
    assert.equal(calculateOfficialAggregateWeightSize([{ ...valid[0], exactSizeBytes: -1 }]), null);
    assert.equal(calculateOfficialAggregateWeightSize([{ ...valid[0], officialMetadata: false }]), null);
  });

  it('evaluates missing and conflicting evidence deterministically without mutating records', () => {
    const original = LOCAL_MODEL_ARTIFACT_EVIDENCE_REGISTRY[0];
    const before = cloneRecord(original);
    const missing = evaluateLocalModelArtifactEvidence({
      ...cloneRecord(original),
      observedRevision: null,
      immutableRevisionAvailable: 'unknown',
      missingEvidence: [],
    });
    assert.equal(missing.evidenceStatus, 'evidence-incomplete');
    assert.ok(missing.missingEvidence.includes('immutable-revision'));

    const conflict = evaluateLocalModelArtifactEvidence({
      ...cloneRecord(original),
      conflicts: ['official-file-inventory-conflict'],
    });
    assert.equal(conflict.evidenceStatus, 'conflicting-evidence');
    assert.deepEqual(original, before);

    const first = validateLocalModelArtifactEvidenceRegistry();
    const second = validateLocalModelArtifactEvidenceRegistry();
    assert.deepEqual(first, second);
    assert.equal(first.valid, true);
    assert.deepEqual(first.issues, []);
  });

  it('keeps Phase 5.2, Phase 4 closeout, and all production approval/runtime states blocked-safe', () => {
    assert.equal(buildCurrentLocalModelCandidateReviewDecisions().filter(
      (result) => result.status === 'approved-for-artifact-review',
    ).length, 0);
    assert.equal(buildCurrentLocalModelAcquisitionCloseout().phaseFoundationComplete, true);
    for (const record of LOCAL_MODEL_ARTIFACT_EVIDENCE_REGISTRY) {
      assert.equal(record.humanReviewRequired, true);
      assert.equal(record.modelApproved, false);
      assert.equal(record.licenseApproved, false);
      assert.equal(record.artifactApproved, false);
      assert.equal(record.benchmarkVerified, false);
      assert.equal(record.downloadable, false);
      assert.equal(record.cacheable, false);
      assert.equal(record.runtimeReady, false);
      assert.equal(record.modelActive, false);
    }
  });

  it('uses only official page references and contains no runtime network or direct artifact behavior', () => {
    for (const record of LOCAL_MODEL_ARTIFACT_EVIDENCE_REGISTRY) {
      assert.ok(record.sources.every((source) => source.officialPublisher));
      assert.ok(record.sources.every((source) => /^https:\/\/(?:huggingface\.co\/Qwen\/|github\.com\/QwenLM\/)/.test(source.reference)));
      assert.ok(record.sources.every((source) => !/[?&](?:token|signature|sig|expires|key)=/i.test(source.reference)));
      assert.ok(record.sources.every((source) => !/\/resolve\/|cdn-lfs|cas-bridge|\?download=/i.test(source.reference)));
      assert.ok(record.sources.every((source) => !/\.(?:safetensors|bin|gguf)(?:$|[?#])/i.test(source.reference)));
    }

    const source = [
      read('../../src/platform/ai/localModelArtifactEvidenceTypes.ts'),
      read('../../src/platform/ai/localModelArtifactEvidenceRegistry.ts'),
      read('../../src/platform/ai/localModelArtifactEvidenceViewModel.ts'),
    ].join('\n');
    for (const pattern of [
      /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /indexedDB/, /CacheStorage/, /caches\.open/,
      /localStorage/, /sessionStorage/, /requestAdapter\s*\(/, /requestDevice\s*\(/,
      /AIService/, /\.execute\s*\(/, /Math\.random/, /Date\.now/, /setTimeout\s*\(/,
      /Worker\s*\(/, /SharedWorker\s*\(/, /serviceWorker\.register/,
      /artifactApproved:\s*true/, /downloadable:\s*true/, /runtimeReady:\s*true/, /modelActive:\s*true/,
    ]) assert.doesNotMatch(source, pattern);
  });
});
