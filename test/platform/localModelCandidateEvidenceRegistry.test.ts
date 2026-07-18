import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { buildCurrentLocalModelAcquisitionCloseout } from '../../src/platform/ai/localModelAcquisitionCloseout.ts';
import {
  LOCAL_MODEL_CANDIDATE_EVIDENCE_REGISTRY,
  evaluateLocalModelCandidateEvidence,
  getLocalModelCandidateEvidence,
  listLocalModelCandidateEvidence,
  validateLocalModelCandidateEvidenceRegistry,
} from '../../src/platform/ai/localModelCandidateEvidenceRegistry.ts';
import type { LocalModelCandidateEvidenceRecord } from '../../src/platform/ai/localModelCandidateEvidenceTypes.ts';

function cloneRecord(record: LocalModelCandidateEvidenceRecord): LocalModelCandidateEvidenceRecord {
  return structuredClone(record);
}

function read(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Phase 5.1 exact model candidate evidence registry', () => {
  it('has exactly one evidence record for each current approval candidate and no orphan', () => {
    const approvalIds = LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) => candidate.candidateId);
    const evidenceIds = listLocalModelCandidateEvidence().map((record) => record.candidateId);
    assert.deepEqual(evidenceIds, approvalIds);
    assert.equal(new Set(evidenceIds).size, 3);
    assert.equal(LOCAL_MODEL_CANDIDATE_EVIDENCE_REGISTRY.length, 3);
    assert.equal(getLocalModelCandidateEvidence('missing-candidate'), null);
  });

  it('preserves exact identity, tier, and the 0.6B/1.7B/4B matrix without ultra-low evidence', () => {
    const expected = new Map([
      ['qwen3-0-6b-candidate', ['light', '0.6B', 'Qwen3-0.6B']],
      ['qwen3-1-7b-candidate', ['standard', '1.7B', 'Qwen3-1.7B']],
      ['qwen3-4b-candidate', ['pro', '4B', 'Qwen3-4B']],
    ]);
    for (const record of LOCAL_MODEL_CANDIDATE_EVIDENCE_REGISTRY) {
      assert.deepEqual(
        [record.candidateTier, record.modelClass, record.exactModelName],
        expected.get(record.candidateId),
      );
      assert.equal(record.officialIdentityConfirmed, true);
    }
    assert.equal(LOCAL_MODEL_CANDIDATE_EVIDENCE_REGISTRY.some((record) => String(record.candidateTier) === 'ultra-low'), false);
  });

  it('uses only official primary references and never stores artifact downloads or credentials', () => {
    for (const record of LOCAL_MODEL_CANDIDATE_EVIDENCE_REGISTRY) {
      assert.ok(record.sources.some((source) => source.sourceKind === 'official-model-card'));
      assert.ok(record.sources.some((source) => source.sourceKind === 'official-license'));
      assert.ok(record.sources.every((source) => source.officialPublisher));
      assert.ok(record.sources.every((source) => /^(https:\/\/(?:huggingface\.co\/Qwen\/|github\.com\/QwenLM\/|qwenlm\.github\.io\/))/.test(source.reference)));
      assert.ok(record.sources.every((source) => !/[?&](?:token|signature|sig|expires|key)=/i.test(source.reference)));
      assert.ok(record.sources.every((source) => !/resolve\/|\.safetensors|\.gguf|tokenizer\.(?:json|model)/i.test(source.reference)));
    }
  });

  it('records Apache-2.0 evidence conservatively without deriving unrelated rights', () => {
    for (const record of LOCAL_MODEL_CANDIDATE_EVIDENCE_REGISTRY) {
      assert.equal(record.licenseIdentifier, 'Apache-2.0');
      assert.equal(record.licenseTextLocated, true);
      assert.equal(record.licenseFacts.commercialUse, 'yes');
      assert.equal(record.licenseFacts.redistribution, 'yes');
      assert.equal(record.licenseFacts.derivativeWorks, 'yes');
      assert.equal(record.licenseFacts.quantizationAllowed, 'unknown');
      assert.equal(record.licenseFacts.separateTokenizerTerms, 'unknown');
      assert.equal(record.licenseFacts.acceptableUsePolicyApplies, 'unknown');
      assert.equal(record.evidenceStatus, 'evidence-incomplete');
      assert.ok(record.missingEvidence.includes('quantization-product-review'));
      assert.ok(record.missingEvidence.includes('tokenizer-license-scope'));
      assert.ok(record.missingEvidence.includes('acceptable-use-policy-scope'));
    }
  });

  it('keeps every approval, benchmark, runtime, download, and activation flag false', () => {
    for (const record of LOCAL_MODEL_CANDIDATE_EVIDENCE_REGISTRY) {
      assert.equal(record.humanReviewRequired, true);
      assert.equal(record.modelApproved, false);
      assert.equal(record.licenseApproved, false);
      assert.equal(record.artifactApproved, false);
      assert.equal(record.benchmarkVerified, false);
      assert.equal(record.runtimeReady, false);
      assert.equal(record.downloadable, false);
      assert.equal(record.modelActive, false);
    }
    assert.equal(buildCurrentLocalModelAcquisitionCloseout().phaseFoundationComplete, true);
    assert.equal(buildCurrentLocalModelAcquisitionCloseout().approvedCandidates, 0);
  });

  it('evaluates missing and conflicting evidence without mutating records', () => {
    const original = LOCAL_MODEL_CANDIDATE_EVIDENCE_REGISTRY[0];
    const before = cloneRecord(original);
    const missing = { ...cloneRecord(original), officialIdentityConfirmed: false, missingEvidence: [] };
    const conflict = { ...cloneRecord(original), conflicts: ['official-license-metadata-conflict'] };
    assert.equal(evaluateLocalModelCandidateEvidence(missing).evidenceStatus, 'evidence-incomplete');
    assert.ok(evaluateLocalModelCandidateEvidence(missing).missingEvidence.includes('exact-model-identity'));
    assert.equal(evaluateLocalModelCandidateEvidence(conflict).evidenceStatus, 'conflicting-evidence');
    assert.deepEqual(original, before);
  });

  it('validates deterministically and rejects community-only primary evidence', () => {
    const first = validateLocalModelCandidateEvidenceRegistry();
    const second = validateLocalModelCandidateEvidenceRegistry();
    assert.deepEqual(first, second);
    assert.equal(first.valid, true);
    assert.deepEqual(first.issues, []);

    const communityOnly: LocalModelCandidateEvidenceRecord = {
      ...cloneRecord(LOCAL_MODEL_CANDIDATE_EVIDENCE_REGISTRY[0]),
      sources: [{
      sourceId: 'community-source',
      sourceKind: 'official-documentation',
      officialPublisher: false,
      title: 'Community mirror',
      reference: 'https://example.invalid/community',
      retrievedOn: '2026-07-18',
      supportsFields: ['exactModelName'],
        notes: 'Not primary evidence.',
      }],
    };
    const evaluated = evaluateLocalModelCandidateEvidence(communityOnly);
    assert.equal(evaluated.evidenceStatus, 'evidence-incomplete');
    assert.ok(evaluated.missingEvidence.includes('official-model-card'));
    assert.ok(evaluated.missingEvidence.includes('official-license-source'));
  });

  it('contains no runtime network, persistence, inference, or direct artifact behavior', () => {
    const source = [
      read('../../src/platform/ai/localModelCandidateEvidenceTypes.ts'),
      read('../../src/platform/ai/localModelCandidateEvidenceRegistry.ts'),
      read('../../src/platform/ai/localModelCandidateEvidenceViewModel.ts'),
    ].join('\n');
    for (const pattern of [
      /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /indexedDB/, /CacheStorage/, /caches\.open/,
      /localStorage/, /sessionStorage/, /requestAdapter\s*\(/, /requestDevice\s*\(/,
      /AIService/, /\.execute\s*\(/, /Math\.random/, /Date\.now/, /setTimeout\s*\(/,
      /Worker\s*\(/, /SharedWorker\s*\(/, /serviceWorker\.register/,
      /(?:https?:\/\/|reference:\s*['"`])[^'"`\s]*(?:resolve\/|\.safetensors|\.gguf|[?&](?:token|signature|sig|expires|key)=)/i,
    ]) assert.doesNotMatch(source, pattern);
  });
});
