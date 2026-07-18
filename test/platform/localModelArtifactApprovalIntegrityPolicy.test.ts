import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildCurrentLocalModelArtifactApprovalIntegrityResults,
  buildLocalModelArtifactApprovalScope,
  createUnrecordedLocalModelArtifactApprovalInput,
  evaluateLocalModelArtifactApprovalIntegrity,
  isSameLocalModelArtifactApprovalScope,
  validateLocalModelArtifactApprovalIntegrityInputs,
  validateLocalModelArtifactIntegrityPinPlan,
} from '../../src/platform/ai/localModelArtifactApprovalIntegrityPolicy.ts';
import {
  LOCAL_MODEL_ARTIFACT_APPROVAL_POLICY_REVISION,
  LOCAL_MODEL_ARTIFACT_INTEGRITY_PIN_PLAN_REVISION,
} from '../../src/platform/ai/localModelArtifactApprovalIntegrityTypes.ts';
import type {
  LocalModelArtifactApprovalIntegrityInput,
  LocalModelArtifactApprovalScope,
  LocalModelArtifactIntegrityPinPlan,
} from '../../src/platform/ai/localModelArtifactApprovalIntegrityTypes.ts';
import {
  buildLocalModelHumanArtifactSelectionScope,
  buildSelectableLocalModelArtifactOptions,
  createUnrecordedLocalModelHumanArtifactSelectionInput,
  evaluateLocalModelHumanArtifactSelection,
  listCurrentLocalModelHumanArtifactSelections,
} from '../../src/platform/ai/localModelHumanArtifactSelectionPolicy.ts';
import { listCurrentLocalModelHumanGovernanceDecisions } from '../../src/platform/ai/localModelHumanGovernanceDecisionPolicy.ts';
import { listLocalModelArtifactIntegrityEvidence } from '../../src/platform/ai/localModelArtifactIntegrityEvidenceRegistry.ts';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from '../../src/platform/ai/localModelArtifactManifest.ts';
import { buildCurrentLocalModelAcquisitionCloseout } from '../../src/platform/ai/localModelAcquisitionCloseout.ts';

function completedGovernance(candidateId = 'qwen3-0-6b-candidate') {
  const current = listCurrentLocalModelHumanGovernanceDecisions().find((item) => item.candidateId === candidateId);
  assert.ok(current);
  return {
    ...current,
    status: 'governance-decisions-complete' as const,
    decisions: current.decisions.map((item) => ({ ...item, decision: 'proceed' as const, decisionRecorded: true })),
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

function selectedArtifactResult(candidateId = 'qwen3-0-6b-candidate') {
  const input = createUnrecordedLocalModelHumanArtifactSelectionInput(candidateId);
  const governance = completedGovernance(candidateId);
  const option = buildSelectableLocalModelArtifactOptions(candidateId)[0];
  assert.ok(option);
  return evaluateLocalModelHumanArtifactSelection({
    ...input,
    governanceDecisionResult: governance,
    decision: 'select',
    decisionRecorded: true,
    selectedOptionId: option.optionId,
    selectedScope: buildLocalModelHumanArtifactSelectionScope(governance, option),
  });
}

function validPinPlan(candidateId = 'qwen3-0-6b-candidate'): LocalModelArtifactIntegrityPinPlan {
  const selection = selectedArtifactResult(candidateId);
  const integrity = listLocalModelArtifactIntegrityEvidence().find((item) => item.candidateId === candidateId);
  assert.ok(integrity);
  assert.ok(selection.selectedScope);
  const pinItems = integrity.requiredWeightFiles.map((file, index) => ({
    fileName: file.fileName,
    fileRole: file.fileRole,
    exactSizeBytes: file.exactSizeBytes!,
    algorithm: 'lfs-sha256' as const,
    expectedDigest: `${'abcdef0123456789'[index % 16]}`.repeat(64),
    sourceRevision: integrity.observedRevision!,
    sourceEvidenceId: file.sourceIds[0] ?? `synthetic-source-${index}`,
    pinnedForSelectedScope: true as const,
    verified: false as const,
  }));
  return {
    candidateId: selection.candidateId,
    candidateTier: selection.candidateTier,
    selectedOptionId: selection.selectedOptionId!,
    officialRepositoryId: selection.selectedScope.officialRepositoryId,
    observedRevision: selection.selectedScope.observedRevision,
    artifactFormat: selection.selectedScope.artifactFormat,
    variantKind: selection.selectedScope.variantKind,
    quantizationLabel: selection.selectedScope.quantizationLabel,
    requiredFiles: pinItems.map((item) => item.fileName),
    pinItems,
    artifactSelectionRevision: selection.selectedScope.artifactSelectionPolicyRevision,
    integrityEvidenceRevision: selection.selectedScope.integrityEvidenceRevision,
    pinPlanRevision: LOCAL_MODEL_ARTIFACT_INTEGRITY_PIN_PLAN_REVISION,
  };
}

function approvalReadyInput(candidateId = 'qwen3-0-6b-candidate'): LocalModelArtifactApprovalIntegrityInput {
  const selection = selectedArtifactResult(candidateId);
  const integrity = listLocalModelArtifactIntegrityEvidence().find((item) => item.candidateId === candidateId);
  assert.ok(integrity);
  const plan = validPinPlan(candidateId);
  return {
    ...createUnrecordedLocalModelArtifactApprovalInput(candidateId),
    selectionResult: selection,
    integrityEvidenceRecord: integrity,
    selectedArtifactScope: buildLocalModelArtifactApprovalScope(selection, plan),
    integrityPinPlan: plan,
  };
}

function approvedInput(candidateId = 'qwen3-0-6b-candidate'): LocalModelArtifactApprovalIntegrityInput {
  return {
    ...approvalReadyInput(candidateId),
    artifactApprovalDecision: 'approve-for-benchmark-planning',
    artifactApprovalDecisionRecorded: true,
    integrityPinningDecision: 'approve-pin-plan',
    integrityPinningDecisionRecorded: true,
  };
}

function mutateScope(
  input: LocalModelArtifactApprovalIntegrityInput,
  change: Partial<LocalModelArtifactApprovalScope>,
): LocalModelArtifactApprovalIntegrityInput {
  assert.ok(input.selectedArtifactScope);
  return { ...input, selectedArtifactScope: { ...input.selectedArtifactScope, ...change } };
}

describe('Phase 5.10 artifact approval and integrity pinning policy', () => {
  it('builds exactly three production-unavailable sessions with zero approvals or pins', () => {
    const results = buildCurrentLocalModelArtifactApprovalIntegrityResults();
    assert.equal(results.length, 3);
    assert.deepEqual(results.map((item) => item.candidateId), LOCAL_MODEL_APPROVAL_REGISTRY.map((item) => item.candidateId));
    assert.deepEqual(results.map((item) => item.candidateTier), ['light', 'standard', 'pro']);
    assert.ok(results.every((item) => item.status === 'unavailable'));
    assert.ok(results.every((item) => !item.artifactSelectionRecorded && !item.canRecordApproval));
    assert.ok(results.every((item) => !item.humanArtifactApprovalRecorded && !item.humanIntegrityPinningDecisionRecorded));
    assert.ok(results.every((item) => !item.artifactApproved && !item.checksumPinned && !item.checksumVerified));
    assert.ok(results.every((item) => !item.canProceedToBenchmarkPlanning));
    assert.ok(results.every((item) => !item.downloadable && !item.runtimeReady && !item.modelActive));
    assert.equal(results.some((item) => item.candidateTier === ('ultra-low' as never)), false);
  });

  it('keeps current selection state at zero and does not derive approval or pin plan from evidence', () => {
    assert.equal(listCurrentLocalModelHumanArtifactSelections().filter((item) => item.artifactSelected).length, 0);
    const input = createUnrecordedLocalModelArtifactApprovalInput('qwen3-0-6b-candidate');
    assert.equal(input.integrityPinPlan, null);
    assert.equal(input.selectedArtifactScope, null);
    const result = evaluateLocalModelArtifactApprovalIntegrity(input);
    assert.equal(result.artifactApproved, false);
    assert.equal(result.checksumPinned, false);
  });

  it('requires a selected artifact and a complete pin plan before opening human approval', () => {
    const selected = selectedArtifactResult();
    const base = createUnrecordedLocalModelArtifactApprovalInput(selected.candidateId);
    const missingPlan = evaluateLocalModelArtifactApprovalIntegrity({ ...base, selectionResult: selected });
    assert.equal(missingPlan.status, 'unavailable');
    assert.equal(missingPlan.artifactApproved, false);

    const awaiting = evaluateLocalModelArtifactApprovalIntegrity(approvalReadyInput());
    assert.equal(awaiting.status, 'awaiting-human-approval');
    assert.equal(awaiting.canRecordApproval, true);
    assert.equal(awaiting.integrityPinPlanComplete, true);
    assert.equal(awaiting.artifactApproved, false);
    assert.equal(awaiting.checksumPinned, false);
  });

  it('records partial decisions without proceeding', () => {
    const result = evaluateLocalModelArtifactApprovalIntegrity({
      ...approvalReadyInput(),
      artifactApprovalDecision: 'approve-for-benchmark-planning',
      artifactApprovalDecisionRecorded: true,
    });
    assert.equal(result.status, 'partially-recorded');
    assert.equal(result.humanArtifactApprovalRecorded, true);
    assert.equal(result.humanIntegrityPinningDecisionRecorded, false);
    assert.equal(result.canProceedToBenchmarkPlanning, false);
  });

  it('completes only after two explicit approvals and preserves downstream safety boundaries', () => {
    const result = evaluateLocalModelArtifactApprovalIntegrity(approvedInput());
    assert.equal(result.status, 'artifact-approval-complete');
    assert.equal(result.artifactSelected, true);
    assert.equal(result.artifactApproved, true);
    assert.equal(result.checksumPinned, true);
    assert.equal(result.checksumVerified, false);
    assert.equal(result.canProceedToBenchmarkPlanning, true);
    assert.equal(result.modelApproved, false);
    assert.equal(result.licenseApproved, false);
    assert.equal(result.downloadLocationConfigured, false);
    assert.equal(result.benchmarkVerified, false);
    assert.equal(result.downloadable, false);
    assert.equal(result.cacheable, false);
    assert.equal(result.runtimeReady, false);
    assert.equal(result.modelActive, false);
  });

  it('supports explicit rejection and request-more-evidence from either decision', () => {
    const base = approvalReadyInput();
    for (const input of [
      { ...base, artifactApprovalDecision: 'reject' as const, artifactApprovalDecisionRecorded: true },
      { ...base, integrityPinningDecision: 'reject' as const, integrityPinningDecisionRecorded: true },
    ]) assert.equal(evaluateLocalModelArtifactApprovalIntegrity(input).status, 'rejected');
    for (const input of [
      { ...base, artifactApprovalDecision: 'request-more-evidence' as const, artifactApprovalDecisionRecorded: true },
      { ...base, integrityPinningDecision: 'request-more-evidence' as const, integrityPinningDecisionRecorded: true },
    ]) assert.equal(evaluateLocalModelArtifactApprovalIntegrity(input).status, 'more-evidence-requested');
  });

  it('validates complete file coverage, exact sizes, supported algorithms, digest form, and source revision', () => {
    const input = approvalReadyInput();
    assert.ok(input.integrityPinPlan && input.selectedArtifactScope && input.integrityEvidenceRecord);
    assert.equal(validateLocalModelArtifactIntegrityPinPlan(
      input.integrityPinPlan,
      input.selectedArtifactScope,
      input.integrityEvidenceRecord,
    ).valid, true);

    const plan = input.integrityPinPlan;
    const first = plan.pinItems[0];
    assert.ok(first);
    const invalidPlans: LocalModelArtifactIntegrityPinPlan[] = [
      { ...plan, requiredFiles: [...plan.requiredFiles, plan.requiredFiles[0]] },
      { ...plan, pinItems: [...plan.pinItems, first] },
      { ...plan, pinItems: plan.pinItems.slice(1) },
      { ...plan, pinItems: [...plan.pinItems, { ...first, fileName: 'extra.safetensors' }] },
      { ...plan, pinItems: plan.pinItems.map((item, index) => index ? item : { ...item, algorithm: 'xet-content-hash' }) },
      { ...plan, pinItems: plan.pinItems.map((item, index) => index ? item : { ...item, expectedDigest: 'abc' }) },
      { ...plan, pinItems: plan.pinItems.map((item, index) => index ? item : { ...item, expectedDigest: 'A'.repeat(64) }) },
      { ...plan, pinItems: plan.pinItems.map((item, index) => index ? item : { ...item, expectedDigest: 'g'.repeat(64) }) },
      { ...plan, pinItems: plan.pinItems.map((item, index) => index ? item : { ...item, exactSizeBytes: -1 }) },
      { ...plan, pinItems: plan.pinItems.map((item, index) => index ? item : { ...item, exactSizeBytes: 1.5 }) },
      { ...plan, pinItems: plan.pinItems.map((item, index) => index ? item : { ...item, exactSizeBytes: item.exactSizeBytes + 1 }) },
      { ...plan, pinItems: plan.pinItems.map((item, index) => index ? item : { ...item, sourceRevision: `${item.sourceRevision}x` }) },
      { ...plan, pinItems: plan.pinItems.map((item, index) => index ? item : { ...item, verified: true as never }) },
    ];
    for (const invalid of invalidPlans) {
      const validation = validateLocalModelArtifactIntegrityPinPlan(invalid, input.selectedArtifactScope, input.integrityEvidenceRecord);
      assert.equal(validation.valid, false);
    }
  });

  it('fails closed for malformed decision flags, missing plan, and forbidden claimed states', () => {
    const base = approvalReadyInput();
    const malformed = [
      { ...base, artifactApprovalDecision: 'approve-for-benchmark-planning' as const, artifactApprovalDecisionRecorded: false },
      { ...base, artifactApprovalDecision: 'not-recorded' as const, artifactApprovalDecisionRecorded: true },
      { ...base, integrityPinningDecision: 'approve-pin-plan' as const, integrityPinningDecisionRecorded: false },
      { ...base, integrityPinningDecision: 'not-recorded' as const, integrityPinningDecisionRecorded: true },
      { ...base, integrityPinningDecision: 'approve-pin-plan' as const, integrityPinningDecisionRecorded: true, integrityPinPlan: null },
    ];
    for (const input of malformed) assert.equal(evaluateLocalModelArtifactApprovalIntegrity(input).status, 'attention-required');

    for (const claim of [
      'claimedModelApproved','claimedLicenseApproved','claimedChecksumVerified','claimedDownloadLocationConfigured',
      'claimedBenchmarkVerified','claimedDownloadable','claimedCacheable','claimedRuntimeReady','claimedModelActive',
    ] as const) {
      const result = evaluateLocalModelArtifactApprovalIntegrity({ ...base, [claim]: true });
      assert.equal(result.status, 'attention-required', claim);
      assert.equal(result.artifactApproved, false, claim);
      assert.equal(result.checksumPinned, false, claim);
    }
  });

  it('invalidates approval when identity, evidence revisions, policy revisions, or pin values change', () => {
    const input = approvedInput();
    const scope = input.selectedArtifactScope!;
    const changes: Partial<LocalModelArtifactApprovalScope>[] = [
      { candidateId: 'qwen3-1-7b-candidate' },
      { candidateTier: 'standard' },
      { modelClass: '1.7B' },
      { exactModelName: 'Qwen3-1.7B' },
      { selectedOptionId: 'different-option' },
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
      { governanceDecisionRevision: scope.governanceDecisionRevision + 1 },
      { artifactSelectionRevision: scope.artifactSelectionRevision + 1 },
      { artifactEvidenceRevision: scope.artifactEvidenceRevision + 1 },
      { integrityEvidenceRevision: scope.integrityEvidenceRevision + 1 },
      { pinPlanRevision: scope.pinPlanRevision + 1 },
      { artifactApprovalPolicyRevision: scope.artifactApprovalPolicyRevision + 1 },
      { requiredFiles: [...scope.requiredFiles, 'extra.safetensors'] },
      { pinItems: scope.pinItems.map((item, index) => index ? item : { ...item, expectedDigest: 'f'.repeat(64) }) },
    ];
    for (const change of changes) {
      const result = evaluateLocalModelArtifactApprovalIntegrity(mutateScope(input, change));
      assert.equal(result.status, 'invalidated', JSON.stringify(change));
      assert.equal(result.artifactApproved, false);
      assert.equal(result.checksumPinned, false);
      assert.equal(result.canProceedToBenchmarkPlanning, false);
    }
  });

  it('compares scope explicitly and does not carry approval across tiers, candidates, formats, or variants', () => {
    const scope = approvedInput().selectedArtifactScope!;
    const reordered = {
      artifactApprovalPolicyRevision: scope.artifactApprovalPolicyRevision,
      pinPlanRevision: scope.pinPlanRevision,
      integrityEvidenceRevision: scope.integrityEvidenceRevision,
      artifactEvidenceRevision: scope.artifactEvidenceRevision,
      artifactSelectionRevision: scope.artifactSelectionRevision,
      governanceDecisionRevision: scope.governanceDecisionRevision,
      pinItems: [...scope.pinItems],
      requiredFiles: [...scope.requiredFiles],
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
      selectedOptionId: scope.selectedOptionId,
      exactModelName: scope.exactModelName,
      modelClass: scope.modelClass,
      candidateTier: scope.candidateTier,
      candidateId: scope.candidateId,
    } satisfies LocalModelArtifactApprovalScope;
    assert.equal(isSameLocalModelArtifactApprovalScope(scope, reordered), true);
    assert.equal(isSameLocalModelArtifactApprovalScope(scope, { ...scope, candidateTier: 'standard' }), false);
    assert.equal(isSameLocalModelArtifactApprovalScope(scope, { ...scope, artifactFormat: 'gguf' }), false);
    assert.equal(isSameLocalModelArtifactApprovalScope(scope, { ...scope, variantKind: 'official-quantized' }), false);
  });

  it('detects duplicate candidate inputs and keeps blockers deterministic, unique, and digest-free', () => {
    const input = approvedInput();
    const validation = validateLocalModelArtifactApprovalIntegrityInputs([input, structuredClone(input)]);
    assert.equal(validation.valid, false);
    assert.ok(validation.issues.some((issue) => issue.startsWith('duplicate-candidate-approval-session:')));
    const first = evaluateLocalModelArtifactApprovalIntegrity({ ...input, selectedArtifactScope: { ...input.selectedArtifactScope!, observedRevision: 'bad' } });
    const second = evaluateLocalModelArtifactApprovalIntegrity({ ...input, selectedArtifactScope: { ...input.selectedArtifactScope!, observedRevision: 'bad' } });
    assert.deepEqual(first.blockers, second.blockers);
    assert.equal(new Set(first.blockers).size, first.blockers.length);
    for (const item of input.integrityPinPlan!.pinItems) assert.doesNotMatch(first.blockers.join('\n'), new RegExp(item.expectedDigest));
  });

  it('does not mutate input or historical Phase 5 and production foundations', () => {
    const input = approvedInput();
    const before = structuredClone(input);
    const phase59 = structuredClone(listCurrentLocalModelHumanArtifactSelections());
    const integrity = structuredClone(listLocalModelArtifactIntegrityEvidence());
    const approvals = structuredClone(LOCAL_MODEL_APPROVAL_REGISTRY);
    const manifest = structuredClone(LOCAL_MODEL_ARTIFACT_MANIFEST);
    evaluateLocalModelArtifactApprovalIntegrity(input);
    assert.deepEqual(input, before);
    assert.deepEqual(listCurrentLocalModelHumanArtifactSelections(), phase59);
    assert.deepEqual(listLocalModelArtifactIntegrityEvidence(), integrity);
    assert.deepEqual(LOCAL_MODEL_APPROVAL_REGISTRY, approvals);
    assert.deepEqual(LOCAL_MODEL_ARTIFACT_MANIFEST, manifest);
    assert.equal(buildCurrentLocalModelAcquisitionCloseout().phaseFoundationComplete, true);
    assert.equal(buildCurrentLocalModelAcquisitionCloseout().activeModels, 0);
  });

  it('uses the declared deterministic policy revisions', () => {
    assert.equal(LOCAL_MODEL_ARTIFACT_INTEGRITY_PIN_PLAN_REVISION, 1);
    assert.equal(LOCAL_MODEL_ARTIFACT_APPROVAL_POLICY_REVISION, 1);
  });
});
