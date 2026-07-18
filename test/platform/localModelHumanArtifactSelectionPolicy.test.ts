import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildCurrentLocalModelHumanArtifactSelections,
  buildLocalModelHumanArtifactSelectionScope,
  buildSelectableLocalModelArtifactOptions,
  createUnrecordedLocalModelHumanArtifactSelectionInput,
  evaluateLocalModelHumanArtifactSelection,
  isSameLocalModelHumanArtifactSelectionScope,
  validateLocalModelHumanArtifactSelectionInputs,
} from '../../src/platform/ai/localModelHumanArtifactSelectionPolicy.ts';
import type {
  LocalModelHumanArtifactSelectionInput,
  LocalModelHumanArtifactSelectionScope,
} from '../../src/platform/ai/localModelHumanArtifactSelectionTypes.ts';
import {
  listCurrentLocalModelHumanGovernanceDecisions,
} from '../../src/platform/ai/localModelHumanGovernanceDecisionPolicy.ts';
import { listLocalModelArtifactEvidence } from '../../src/platform/ai/localModelArtifactEvidenceRegistry.ts';
import { listLocalModelArtifactIntegrityEvidence } from '../../src/platform/ai/localModelArtifactIntegrityEvidenceRegistry.ts';
import { listCurrentLocalModelArtifactSelections } from '../../src/platform/ai/localModelArtifactSelectionPolicy.ts';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from '../../src/platform/ai/localModelArtifactManifest.ts';
import { buildCurrentLocalModelAcquisitionCloseout } from '../../src/platform/ai/localModelAcquisitionCloseout.ts';

function completedGovernance(candidateId = 'qwen3-0-6b-candidate') {
  const current = listCurrentLocalModelHumanGovernanceDecisions().find((item) => item.candidateId === candidateId);
  assert.ok(current);
  return {
    ...current,
    status: 'governance-decisions-complete' as const,
    decisions: current.decisions.map((item) => ({
      ...item,
      decision: 'proceed' as const,
      decisionRecorded: true,
    })),
    recordedDecisionItems: 4,
    proceedDecisionItems: 4,
    rejectedDecisionItems: 0,
    moreEvidenceDecisionItems: 0,
    allRequiredDecisionsRecorded: true,
    canProceedToArtifactSelectionReview: true,
    humanDecisionRecorded: true,
    blockers: [],
  };
}

function governanceCompleteInput(candidateId = 'qwen3-0-6b-candidate'): LocalModelHumanArtifactSelectionInput {
  const input = createUnrecordedLocalModelHumanArtifactSelectionInput(candidateId);
  return { ...input, governanceDecisionResult: completedGovernance(candidateId) };
}

function selectedInput(candidateId = 'qwen3-0-6b-candidate'): LocalModelHumanArtifactSelectionInput {
  const input = governanceCompleteInput(candidateId);
  const option = buildSelectableLocalModelArtifactOptions(candidateId)[0];
  assert.ok(option);
  return {
    ...input,
    decision: 'select',
    decisionRecorded: true,
    selectedOptionId: option.optionId,
    selectedScope: buildLocalModelHumanArtifactSelectionScope(input.governanceDecisionResult!, option),
  };
}

function mutateScope(
  input: LocalModelHumanArtifactSelectionInput,
  change: Partial<LocalModelHumanArtifactSelectionScope>,
): LocalModelHumanArtifactSelectionInput {
  assert.ok(input.selectedScope);
  return { ...input, selectedScope: { ...input.selectedScope, ...change } };
}

describe('Phase 5.9 explicit human artifact selection policy', () => {
  it('builds exactly three production-unavailable sessions with no selection or approval', () => {
    const results = buildCurrentLocalModelHumanArtifactSelections();
    assert.equal(results.length, 3);
    assert.deepEqual(results.map((item) => item.candidateId), LOCAL_MODEL_APPROVAL_REGISTRY.map((item) => item.candidateId));
    assert.deepEqual(results.map((item) => item.candidateTier), ['light', 'standard', 'pro']);
    assert.ok(results.every((item) => item.status === 'unavailable'));
    assert.ok(results.every((item) => !item.governanceDecisionsComplete && !item.canRecordSelection));
    assert.ok(results.every((item) => item.availableOptions.length === 0));
    assert.ok(results.every((item) => !item.humanSelectionRecorded && !item.artifactSelected));
    assert.ok(results.every((item) => !item.canProceedToArtifactApprovalReview));
    assert.ok(results.every((item) => !item.artifactApproved && !item.checksumPinned && !item.checksumVerified));
    assert.ok(results.every((item) => !item.downloadable && !item.runtimeReady && !item.modelActive));
    assert.equal(results.some((item) => item.candidateTier === ('ultra-low' as never)), false);
  });

  it('derives only evidence-backed deterministic base options without automatic selection', () => {
    const first = buildSelectableLocalModelArtifactOptions('qwen3-0-6b-candidate');
    const second = buildSelectableLocalModelArtifactOptions('qwen3-0-6b-candidate');
    assert.deepEqual(first, second);
    assert.equal(first.length, 1);
    const option = first[0];
    assert.equal(option.variantKind, 'official-base');
    assert.equal(option.artifactFormat, 'safetensors');
    assert.equal(option.exactWeightBytes, 1_503_300_328);
    assert.ok(option.observedRevision.length > 20);
    assert.ok(option.integrityAlgorithmsObserved.includes('lfs-sha256'));
    assert.doesNotMatch(JSON.stringify(option), /https?:\/\/|checksum|recommended|best|fastest|smallest/i);
  });

  it('opens an awaiting session only after synthetic complete governance with sufficient evidence', () => {
    const result = evaluateLocalModelHumanArtifactSelection(governanceCompleteInput());
    assert.equal(result.status, 'awaiting-human-selection');
    assert.equal(result.canRecordSelection, true);
    assert.equal(result.availableOptions.length, 1);
    assert.equal(result.artifactEvidenceSufficient, true);
    assert.equal(result.integrityEvidenceSufficient, true);
    assert.equal(result.artifactSelected, false);
  });

  it('records a valid explicit selection without creating approval or runtime readiness', () => {
    const result = evaluateLocalModelHumanArtifactSelection(selectedInput());
    assert.equal(result.status, 'selection-recorded');
    assert.equal(result.humanSelectionRecorded, true);
    assert.equal(result.artifactSelected, true);
    assert.equal(result.canProceedToArtifactApprovalReview, true);
    assert.equal(result.modelApproved, false);
    assert.equal(result.licenseApproved, false);
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

  it('supports explicit rejection and request-more-evidence without effective selection', () => {
    const base = governanceCompleteInput();
    const rejected = evaluateLocalModelHumanArtifactSelection({ ...base, decision: 'reject', decisionRecorded: true });
    assert.equal(rejected.status, 'rejected');
    assert.equal(rejected.artifactSelected, false);
    const more = evaluateLocalModelHumanArtifactSelection({ ...base, decision: 'request-more-evidence', decisionRecorded: true });
    assert.equal(more.status, 'more-evidence-requested');
    assert.equal(more.canProceedToArtifactApprovalReview, false);
  });

  it('keeps selection unavailable for insufficient evidence and attention-required for evidence conflict', () => {
    const base = governanceCompleteInput();
    assert.ok(base.integrityEvidenceRecord);
    assert.ok(base.artifactEvidenceRecord);
    const incomplete = evaluateLocalModelHumanArtifactSelection({
      ...base,
      integrityEvidenceRecord: { ...base.integrityEvidenceRecord, exactWeightBytes: null },
    });
    assert.equal(incomplete.status, 'unavailable');
    assert.equal(incomplete.canRecordSelection, false);

    const conflict = evaluateLocalModelHumanArtifactSelection({
      ...base,
      artifactEvidenceRecord: {
        ...base.artifactEvidenceRecord,
        evidenceStatus: 'conflicting-evidence',
        conflicts: ['synthetic-source-conflict'],
      },
    });
    assert.equal(conflict.status, 'attention-required');
    assert.equal(conflict.artifactSelected, false);
  });

  it('rejects every claimed approval, checksum, download, benchmark, cache, runtime, or active state', () => {
    const base = governanceCompleteInput();
    for (const claim of [
      'claimedModelApproved','claimedLicenseApproved','claimedArtifactSelected','claimedArtifactApproved',
      'claimedChecksumPinned','claimedChecksumVerified','claimedDownloadLocationConfigured',
      'claimedBenchmarkVerified','claimedDownloadable','claimedCacheable','claimedRuntimeReady','claimedModelActive',
    ] as const) {
      const result = evaluateLocalModelHumanArtifactSelection({ ...base, [claim]: true });
      assert.equal(result.status, 'attention-required', claim);
      assert.equal(result.artifactSelected, false, claim);
    }
  });

  it('rejects malformed decision-recording combinations and unknown options', () => {
    const base = governanceCompleteInput();
    for (const input of [
      { ...base, decision: 'select' as const, decisionRecorded: false },
      { ...base, decision: 'not-recorded' as const, decisionRecorded: true },
      { ...base, decision: 'select' as const, decisionRecorded: true, selectedOptionId: null },
      { ...base, decision: 'select' as const, decisionRecorded: true, selectedOptionId: 'unknown', selectedScope: null },
    ]) {
      assert.equal(evaluateLocalModelHumanArtifactSelection(input).status, 'attention-required');
    }
  });

  it('invalidates explicit selection when any identity, variant, size, evidence, or policy scope changes', () => {
    const input = selectedInput();
    const scope = input.selectedScope!;
    const cases: Partial<LocalModelHumanArtifactSelectionScope>[] = [
      { candidateId: 'qwen3-1-7b-candidate' },
      { candidateTier: 'standard' },
      { modelClass: '1.7B' },
      { exactModelName: 'Qwen3-1.7B' },
      { officialRepositoryId: 'Qwen/Qwen3-1.7B' },
      { observedRevision: `${scope.observedRevision}x` },
      { artifactFormat: 'gguf' },
      { variantKind: 'official-quantized' },
      { quantizationLabel: 'q8_0' },
      { weightShardCount: scope.weightShardCount + 1 },
      { exactWeightBytes: scope.exactWeightBytes + 1 },
      { tokenizerProvenanceStatus: 'unknown' },
      { configProvenanceStatus: 'unknown' },
      { integrityEvidenceStatus: 'conflicting-evidence' },
      { integrityAlgorithmsObserved: ['unknown'] },
      { governanceDecisionScopeRevision: scope.governanceDecisionScopeRevision + 1 },
      { governanceDecisionPolicyRevision: scope.governanceDecisionPolicyRevision + 1 },
      { artifactEvidenceRevision: scope.artifactEvidenceRevision + 1 },
      { integrityEvidenceRevision: scope.integrityEvidenceRevision + 1 },
      { artifactSelectionPolicyRevision: scope.artifactSelectionPolicyRevision + 1 },
    ];
    for (const change of cases) {
      const result = evaluateLocalModelHumanArtifactSelection(mutateScope(input, change));
      assert.equal(result.status, 'invalidated', JSON.stringify(change));
      assert.equal(result.artifactSelected, false);
      assert.equal(result.canProceedToArtifactApprovalReview, false);
    }
  });

  it('does not carry selection across candidate, tier, base/quantized, format, or property order', () => {
    const input = selectedInput();
    const scope = input.selectedScope!;
    assert.equal(isSameLocalModelHumanArtifactSelectionScope(scope, { ...scope }), true);
    const reordered = {
      artifactSelectionPolicyRevision: scope.artifactSelectionPolicyRevision,
      integrityEvidenceRevision: scope.integrityEvidenceRevision,
      artifactEvidenceRevision: scope.artifactEvidenceRevision,
      governanceDecisionPolicyRevision: scope.governanceDecisionPolicyRevision,
      governanceDecisionScopeRevision: scope.governanceDecisionScopeRevision,
      integrityAlgorithmsObserved: [...scope.integrityAlgorithmsObserved],
      integrityEvidenceStatus: scope.integrityEvidenceStatus,
      configProvenanceStatus: scope.configProvenanceStatus,
      tokenizerProvenanceStatus: scope.tokenizerProvenanceStatus,
      exactWeightBytes: scope.exactWeightBytes,
      weightShardCount: scope.weightShardCount,
      quantizationLabel: scope.quantizationLabel,
      variantKind: scope.variantKind,
      artifactFormat: scope.artifactFormat,
      observedRevision: scope.observedRevision,
      officialRepositoryId: scope.officialRepositoryId,
      exactModelName: scope.exactModelName,
      modelClass: scope.modelClass,
      candidateTier: scope.candidateTier,
      candidateId: scope.candidateId,
    } satisfies LocalModelHumanArtifactSelectionScope;
    assert.equal(isSameLocalModelHumanArtifactSelectionScope(scope, reordered), true);
    assert.equal(isSameLocalModelHumanArtifactSelectionScope(scope, { ...scope, candidateTier: 'standard' }), false);
    assert.equal(isSameLocalModelHumanArtifactSelectionScope(scope, { ...scope, variantKind: 'official-quantized' }), false);
    assert.equal(isSameLocalModelHumanArtifactSelectionScope(scope, { ...scope, artifactFormat: 'gguf' }), false);
  });

  it('detects duplicate candidate inputs and keeps blockers deterministic and unique', () => {
    const input = selectedInput();
    const validation = validateLocalModelHumanArtifactSelectionInputs([input, structuredClone(input)]);
    assert.equal(validation.valid, false);
    assert.ok(validation.issues.some((issue) => issue.startsWith('duplicate-candidate-selection-session:')));
    const first = evaluateLocalModelHumanArtifactSelection({ ...input, selectedOptionId: 'missing' });
    const second = evaluateLocalModelHumanArtifactSelection({ ...input, selectedOptionId: 'missing' });
    assert.deepEqual(first.blockers, second.blockers);
    assert.equal(new Set(first.blockers).size, first.blockers.length);
  });

  it('does not mutate input or historical Phase 5 and production foundations', () => {
    const input = selectedInput();
    const before = structuredClone(input);
    const phase54 = structuredClone(listCurrentLocalModelArtifactSelections());
    const phase58 = structuredClone(listCurrentLocalModelHumanGovernanceDecisions());
    const phase53 = structuredClone(listLocalModelArtifactEvidence());
    const phase55 = structuredClone(listLocalModelArtifactIntegrityEvidence());
    const approvals = structuredClone(LOCAL_MODEL_APPROVAL_REGISTRY);
    const manifest = structuredClone(LOCAL_MODEL_ARTIFACT_MANIFEST);
    evaluateLocalModelHumanArtifactSelection(input);
    assert.deepEqual(input, before);
    assert.deepEqual(listCurrentLocalModelArtifactSelections(), phase54);
    assert.deepEqual(listCurrentLocalModelHumanGovernanceDecisions(), phase58);
    assert.deepEqual(listLocalModelArtifactEvidence(), phase53);
    assert.deepEqual(listLocalModelArtifactIntegrityEvidence(), phase55);
    assert.deepEqual(LOCAL_MODEL_APPROVAL_REGISTRY, approvals);
    assert.deepEqual(LOCAL_MODEL_ARTIFACT_MANIFEST, manifest);
    assert.equal(buildCurrentLocalModelAcquisitionCloseout().phaseFoundationComplete, true);
    assert.equal(buildCurrentLocalModelAcquisitionCloseout().activeModels, 0);
  });
});
