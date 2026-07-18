import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from '../../src/platform/ai/localModelArtifactManifest.ts';
import { buildCurrentLocalModelAcquisitionCloseout } from '../../src/platform/ai/localModelAcquisitionCloseout.ts';
import {
  listCurrentLocalModelCandidateReviewDecisions,
} from '../../src/platform/ai/localModelCandidateReviewDecisionPolicy.ts';
import type { LocalModelCandidateReviewDecisionResult } from '../../src/platform/ai/localModelCandidateReviewDecisionTypes.ts';
import {
  listLocalModelArtifactEvidence,
} from '../../src/platform/ai/localModelArtifactEvidenceRegistry.ts';
import type { LocalModelArtifactEvidenceRecord } from '../../src/platform/ai/localModelArtifactEvidenceTypes.ts';
import {
  LOCAL_MODEL_ARTIFACT_SELECTION_POLICY_REVISION,
  buildLocalModelArtifactSelectionScope,
  buildCurrentLocalModelArtifactSelections,
  createUnselectedLocalModelArtifactInput,
  evaluateLocalModelArtifactSelection,
  isSameLocalModelArtifactSelectionScope,
  validateLocalModelArtifactSelectionInputs,
} from '../../src/platform/ai/localModelArtifactSelectionPolicy.ts';
import type {
  LocalModelArtifactSelectionInput,
  LocalModelArtifactSelectionScope,
} from '../../src/platform/ai/localModelArtifactSelectionTypes.ts';

function completeEvidence(): LocalModelArtifactEvidenceRecord {
  const record = structuredClone(listLocalModelArtifactEvidence()[1]);
  return {
    ...record,
    evidenceStatus: 'evidence-collected',
    missingEvidence: [],
    conflicts: [],
    aggregateSizeEvidenceStatus: 'confirmed',
  };
}

function passedReview(candidateId: string): LocalModelCandidateReviewDecisionResult {
  const current = listCurrentLocalModelCandidateReviewDecisions().find(
    (result) => result.candidateId === candidateId,
  );
  assert.ok(current);
  return {
    ...structuredClone(current),
    status: 'approved-for-artifact-review',
    blockers: [],
    missingEvidence: [],
    unresolvedReviewItems: [],
    canProceedToArtifactReview: true,
    humanDecisionRecorded: true,
    evidenceComplete: true,
    evidenceConflictFree: true,
    humanReviewStillRequired: false,
  };
}

function eligibleInput(): LocalModelArtifactSelectionInput {
  const evidence = completeEvidence();
  return createUnselectedLocalModelArtifactInput(evidence, passedReview(evidence.candidateId));
}

function selectedInput(): LocalModelArtifactSelectionInput {
  const input = eligibleInput();
  return {
    ...input,
    decision: 'selected',
    decisionRecorded: true,
    selectedScope: buildLocalModelArtifactSelectionScope(input.artifactEvidenceRecord!, 'official-base'),
  };
}

describe('Phase 5.4 human artifact variant selection policy', () => {
  it('builds exactly one blocked production result per candidate and no Ultra-low record', () => {
    const results = buildCurrentLocalModelArtifactSelections();
    assert.equal(results.length, 3);
    assert.deepEqual(
      results.map((result) => result.candidateId),
      LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) => candidate.candidateId),
    );
    assert.equal(new Set(results.map((result) => result.candidateId)).size, 3);
    assert.ok(results.every((result) => result.status === 'blocked-by-model-license-review'));
    assert.ok(results.every((result) => result.candidateTier !== ('ultra-low' as never)));
    assert.ok(results.every((result) => !result.humanSelectionRecorded));
    assert.ok(results.every((result) => !result.artifactSelected));
  });

  it('keeps the exact Light, Standard, and Pro candidate matrix', () => {
    const expected = new Map([
      ['qwen3-0-6b-candidate', ['light', '0.6B']],
      ['qwen3-1-7b-candidate', ['standard', '1.7B']],
      ['qwen3-4b-candidate', ['pro', '4B']],
    ]);
    for (const input of listLocalModelArtifactEvidence()) {
      assert.deepEqual([input.candidateTier, input.modelClass], expected.get(input.candidateId));
    }
  });

  it('blocks selection when Phase 5.2 has not passed or artifact evidence remains incomplete', () => {
    const evidence = listLocalModelArtifactEvidence()[1];
    const blockedReview = listCurrentLocalModelCandidateReviewDecisions()[1];
    assert.equal(evaluateLocalModelArtifactSelection(
      createUnselectedLocalModelArtifactInput(evidence, blockedReview),
    ).status, 'blocked-by-model-license-review');

    const incomplete = evaluateLocalModelArtifactSelection(
      createUnselectedLocalModelArtifactInput(evidence, passedReview(evidence.candidateId)),
    );
    assert.equal(incomplete.status, 'needs-more-artifact-evidence');
    assert.equal(incomplete.canSelectArtifact, false);
  });

  it('moves complete conflict-free evidence without a decision to awaiting-human-selection', () => {
    const result = evaluateLocalModelArtifactSelection(eligibleInput());
    assert.equal(result.status, 'awaiting-human-selection');
    assert.equal(result.canSelectArtifact, true);
    assert.equal(result.artifactSelected, false);
    assert.equal(result.canProceedToArtifactApprovalReview, false);
  });

  it('accepts only a recorded exact-scope selection for future artifact approval review', () => {
    const result = evaluateLocalModelArtifactSelection(selectedInput());
    assert.equal(result.status, 'selected-for-artifact-approval-review');
    assert.equal(result.humanSelectionRecorded, true);
    assert.equal(result.artifactSelected, true);
    assert.equal(result.canProceedToArtifactApprovalReview, true);
    assert.equal(result.artifactApproved, false);
    assert.equal(result.checksumPinned, false);
    assert.equal(result.checksumVerified, false);
    assert.equal(result.downloadLocationConfigured, false);
    assert.equal(result.benchmarkVerified, false);
    assert.equal(result.downloadable, false);
    assert.equal(result.cacheable, false);
    assert.equal(result.runtimeReady, false);
    assert.equal(result.modelActive, false);
  });

  it('handles explicit rejection without selecting or approving an artifact', () => {
    const input = eligibleInput();
    const result = evaluateLocalModelArtifactSelection({
      ...input,
      decision: 'rejected',
      decisionRecorded: true,
      rejectionReasonCode: 'human-artifact-selection-rejected',
    });
    assert.equal(result.status, 'rejected');
    assert.equal(result.artifactSelected, false);
    assert.equal(result.canProceedToArtifactApprovalReview, false);
  });

  it('rejects inconsistent decision recording and incomplete/conflicting selection attempts', () => {
    const selected = selectedInput();
    assert.equal(evaluateLocalModelArtifactSelection({ ...selected, decisionRecorded: false }).status, 'attention-required');
    assert.equal(evaluateLocalModelArtifactSelection({ ...selected, selectedScope: null }).status, 'attention-required');
    assert.equal(evaluateLocalModelArtifactSelection({
      ...eligibleInput(), decision: 'not-selected', selectedScope: selected.selectedScope,
    }).status, 'attention-required');

    const incomplete = listLocalModelArtifactEvidence()[1];
    assert.equal(evaluateLocalModelArtifactSelection({
      ...selected,
      artifactEvidenceRecord: incomplete,
      selectedScope: buildLocalModelArtifactSelectionScope(incomplete, 'official-base'),
    }).status, 'attention-required');

    const conflict = { ...completeEvidence(), conflicts: ['official-artifact-conflict'] };
    assert.equal(evaluateLocalModelArtifactSelection({
      ...selected,
      artifactEvidenceRecord: conflict,
      selectedScope: buildLocalModelArtifactSelectionScope(conflict, 'official-base'),
    }).status, 'attention-required');
  });

  it('compares every explicit selection-scope identity field', () => {
    const scope = selectedInput().selectedScope!;
    assert.equal(isSameLocalModelArtifactSelectionScope(scope, structuredClone(scope)), true);
    const changes: Array<[keyof LocalModelArtifactSelectionScope, unknown]> = [
      ['candidateId', 'different-candidate'],
      ['candidateTier', 'pro'],
      ['modelClass', '4B'],
      ['exactModelName', 'Different model'],
      ['officialRepositoryId', 'Qwen/Different'],
      ['observedRevision', 'different-revision'],
      ['artifactFormat', 'gguf'],
      ['variantKind', 'official-quantized'],
      ['quantizationLabel', 'q8_0'],
      ['weightShardCount', 99],
      ['aggregateWeightSizeBytes', 1],
      ['aggregateWeightSizeMb', 1],
      ['tokenizerEvidenceStatus', 'unknown'],
      ['configEvidenceStatus', 'unknown'],
      ['artifactEvidenceRevision', 2],
      ['selectionPolicyRevision', 2],
    ];
    for (const [key, value] of changes) {
      assert.equal(isSameLocalModelArtifactSelectionScope(scope, { ...scope, [key]: value }), false, key);
    }
  });

  it('invalidates candidate, tier, model, repository, revision, format, variant, quantization, shard, size and revision mismatches', () => {
    const input = selectedInput();
    const scope = input.selectedScope!;
    const mutations: Partial<Record<keyof LocalModelArtifactSelectionScope, unknown>>[] = [
      { candidateId: 'qwen3-4b-candidate' }, { candidateTier: 'pro' }, { modelClass: '4B' },
      { officialRepositoryId: 'Qwen/Qwen3-4B' }, { observedRevision: 'changed' },
      { artifactFormat: 'gguf' }, { variantKind: 'official-quantized' }, { quantizationLabel: 'q8_0' },
      { weightShardCount: 8 }, { aggregateWeightSizeBytes: 8 }, { artifactEvidenceRevision: 2 },
      { selectionPolicyRevision: LOCAL_MODEL_ARTIFACT_SELECTION_POLICY_REVISION + 1 },
    ];
    for (const mutation of mutations) {
      const result = evaluateLocalModelArtifactSelection({
        ...input,
        selectedScope: { ...scope, ...mutation } as LocalModelArtifactSelectionScope,
      });
      assert.equal(result.status, 'attention-required');
      assert.equal(result.artifactSelected, false);
    }
  });

  it('does not carry Light to Standard, Standard to Pro, base to quantized, or one evidence revision to another', () => {
    const records = listLocalModelArtifactEvidence();
    const light = buildLocalModelArtifactSelectionScope({ ...completeEvidence(), ...records[0] }, 'official-base');
    const standard = buildLocalModelArtifactSelectionScope(completeEvidence(), 'official-base');
    const pro = buildLocalModelArtifactSelectionScope({ ...completeEvidence(), ...records[2] }, 'official-base');
    assert.equal(isSameLocalModelArtifactSelectionScope(light, standard), false);
    assert.equal(isSameLocalModelArtifactSelectionScope(standard, pro), false);
    assert.equal(isSameLocalModelArtifactSelectionScope(standard, { ...standard, variantKind: 'official-quantized' }), false);
    assert.equal(isSameLocalModelArtifactSelectionScope(standard, { ...standard, artifactEvidenceRevision: 2 }), false);
  });

  it('fails closed for mismatched identity, unsupported format/variant, and claimed approval state', () => {
    const input = selectedInput();
    assert.equal(evaluateLocalModelArtifactSelection({ ...input, candidateId: 'unknown' }).status, 'attention-required');
    assert.equal(evaluateLocalModelArtifactSelection({ ...input, candidateTier: 'pro' }).status, 'attention-required');
    assert.equal(evaluateLocalModelArtifactSelection({ ...input, claimedArtifactApproved: true }).status, 'attention-required');
    assert.equal(evaluateLocalModelArtifactSelection({ ...input, claimedChecksumPinned: true }).status, 'attention-required');
    assert.equal(evaluateLocalModelArtifactSelection({ ...input, claimedDownloadable: true }).status, 'attention-required');
    assert.equal(evaluateLocalModelArtifactSelection({ ...input, claimedRuntimeReady: true }).status, 'attention-required');
    assert.equal(evaluateLocalModelArtifactSelection({ ...input, claimedModelActive: true }).status, 'attention-required');
  });

  it('rejects duplicate candidate inputs and keeps blockers deterministic and unique', () => {
    const input = eligibleInput();
    const validation = validateLocalModelArtifactSelectionInputs([input, structuredClone(input)]);
    assert.equal(validation.valid, false);
    assert.ok(validation.issues.some((issue) => issue.startsWith('duplicate-candidate-selection:')));

    const first = evaluateLocalModelArtifactSelection({ ...selectedInput(), decisionRecorded: false });
    const second = evaluateLocalModelArtifactSelection({ ...selectedInput(), decisionRecorded: false });
    assert.deepEqual(first.blockers, second.blockers);
    assert.equal(new Set(first.blockers).size, first.blockers.length);
  });

  it('does not mutate selection input or current foundation registries', () => {
    const input = selectedInput();
    const before = structuredClone(input);
    const approvals = structuredClone(LOCAL_MODEL_APPROVAL_REGISTRY);
    const manifest = structuredClone(LOCAL_MODEL_ARTIFACT_MANIFEST);
    evaluateLocalModelArtifactSelection(input);
    assert.deepEqual(input, before);
    assert.deepEqual(LOCAL_MODEL_APPROVAL_REGISTRY, approvals);
    assert.deepEqual(LOCAL_MODEL_ARTIFACT_MANIFEST, manifest);
    assert.equal(buildCurrentLocalModelAcquisitionCloseout().phaseFoundationComplete, true);
    assert.equal(buildCurrentLocalModelAcquisitionCloseout().activeModels, 0);
  });
});
