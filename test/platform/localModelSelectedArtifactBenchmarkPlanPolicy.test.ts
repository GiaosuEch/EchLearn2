import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildCurrentSelectedArtifactBenchmarkPlanResults,
  buildSelectedArtifactBenchmarkPlan,
  createUnrecordedSelectedArtifactBenchmarkPlanInput,
  evaluateSelectedArtifactBenchmarkPlan,
  isSameSelectedArtifactBenchmarkPlanScope,
  validateSelectedArtifactBenchmarkPlanInput,
} from '../../src/platform/ai/localModelSelectedArtifactBenchmarkPlanPolicy.ts';
import {
  LOCAL_AI_DEVICE_TIER_POLICY_REVISION,
  LOCAL_MODEL_BENCHMARK_FOUNDATION_REVISION,
  LOCAL_MODEL_SELECTED_ARTIFACT_BENCHMARK_PLAN_POLICY_REVISION,
} from '../../src/platform/ai/localModelSelectedArtifactBenchmarkPlanTypes.ts';
import type {
  LocalModelSelectedArtifactBenchmarkPlan,
  LocalModelSelectedArtifactBenchmarkPlanInput,
  LocalModelSelectedArtifactBenchmarkPlanScope,
} from '../../src/platform/ai/localModelSelectedArtifactBenchmarkPlanTypes.ts';
import { listCurrentLocalModelArtifactApprovalIntegrityResults } from '../../src/platform/ai/localModelArtifactApprovalIntegrityPolicy.ts';
import type { LocalModelArtifactApprovalIntegrityResult } from '../../src/platform/ai/localModelArtifactApprovalIntegrityTypes.ts';
import { listLocalModelArtifactIntegrityEvidence } from '../../src/platform/ai/localModelArtifactIntegrityEvidenceRegistry.ts';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from '../../src/platform/ai/localModelArtifactManifest.ts';
import { buildCurrentLocalModelAcquisitionCloseout } from '../../src/platform/ai/localModelAcquisitionCloseout.ts';
import { LOCAL_MODEL_BENCHMARK_DIMENSIONS } from '../../src/platform/ai/localModelBenchmarkPlan.ts';

function syntheticApprovedArtifact(candidateId = 'qwen3-0-6b-candidate'): LocalModelArtifactApprovalIntegrityResult {
  const current = listCurrentLocalModelArtifactApprovalIntegrityResults().find((item) => item.candidateId === candidateId);
  const integrity = listLocalModelArtifactIntegrityEvidence().find((item) => item.candidateId === candidateId);
  assert.ok(current);
  assert.ok(integrity);
  assert.ok(integrity.observedRevision);
  assert.ok(integrity.exactWeightBytes !== null);
  const requiredFiles = integrity.requiredWeightFiles.map((file) => file.fileName);
  return {
    ...current,
    status: 'artifact-approval-complete',
    selectedArtifactScope: {
      candidateId: current.candidateId,
      candidateTier: current.candidateTier,
      modelClass: current.modelClass,
      exactModelName: current.exactModelName,
      selectedOptionId: `${current.candidateId}:official-base:safetensors`,
      officialRepositoryId: integrity.officialRepositoryId,
      observedRevision: integrity.observedRevision,
      artifactFormat: 'safetensors',
      variantKind: 'official-base',
      quantizationLabel: null,
      weightShardCount: integrity.weightShardCount,
      exactWeightBytes: integrity.exactWeightBytes,
      tokenizerProvenanceStatus: 'confirmed',
      configProvenanceStatus: 'confirmed',
      integrityEvidenceStatus: integrity.evidenceStatus,
      integrityAlgorithmsObserved: integrity.integrityAlgorithmsObserved,
      governanceDecisionRevision: 1,
      artifactSelectionRevision: 1,
      artifactEvidenceRevision: 1,
      integrityEvidenceRevision: 1,
      pinPlanRevision: 1,
      artifactApprovalPolicyRevision: 1,
      requiredFiles,
      pinItems: [],
    },
    artifactSelectionRecorded: true,
    integrityPinPlanComplete: true,
    approvalValidForCurrentScope: true,
    humanArtifactApprovalRecorded: true,
    humanIntegrityPinningDecisionRecorded: true,
    artifactApprovalComplete: true,
    canProceedToBenchmarkPlanning: true,
    artifactSelected: true,
    artifactApproved: true,
    checksumPinned: true,
    blockers: [],
  };
}

function planningInput(candidateId = 'qwen3-0-6b-candidate'): LocalModelSelectedArtifactBenchmarkPlanInput {
  const approvalResult = syntheticApprovedArtifact(candidateId);
  const proposedPlan = buildSelectedArtifactBenchmarkPlan(candidateId, approvalResult);
  assert.ok(proposedPlan);
  return {
    ...createUnrecordedSelectedArtifactBenchmarkPlanInput(candidateId),
    artifactApprovalResult: approvalResult,
    proposedPlan,
  };
}

function approvedPlanInput(candidateId = 'qwen3-0-6b-candidate'): LocalModelSelectedArtifactBenchmarkPlanInput {
  return {
    ...planningInput(candidateId),
    decision: 'approve-plan-for-future-execution',
    decisionRecorded: true,
  };
}

function mutatePlan(
  input: LocalModelSelectedArtifactBenchmarkPlanInput,
  change: Partial<LocalModelSelectedArtifactBenchmarkPlan>,
): LocalModelSelectedArtifactBenchmarkPlanInput {
  assert.ok(input.proposedPlan);
  return { ...input, proposedPlan: { ...input.proposedPlan, ...change } };
}

function mutateScope(
  input: LocalModelSelectedArtifactBenchmarkPlanInput,
  change: Partial<LocalModelSelectedArtifactBenchmarkPlanScope>,
): LocalModelSelectedArtifactBenchmarkPlanInput {
  assert.ok(input.proposedPlan);
  return { ...input, proposedPlan: { ...input.proposedPlan, scope: { ...input.proposedPlan.scope, ...change } } };
}

describe('Phase 5.11 selected artifact benchmark plan policy', () => {
  it('builds exactly three production-unavailable plan sessions with zero benchmark activity', () => {
    const results = buildCurrentSelectedArtifactBenchmarkPlanResults();
    assert.equal(results.length, 3);
    assert.deepEqual(results.map((item) => item.candidateId), LOCAL_MODEL_APPROVAL_REGISTRY.map((item) => item.candidateId));
    assert.deepEqual(results.map((item) => item.candidateTier), ['light', 'standard', 'pro']);
    assert.ok(results.every((item) => item.status === 'unavailable'));
    assert.ok(results.every((item) => !item.artifactApprovalComplete && !item.benchmarkPlanAvailable));
    assert.ok(results.every((item) => !item.benchmarkPlanApproved && !item.canProceedToFutureBenchmarkExecutionReview));
    assert.ok(results.every((item) => !item.benchmarkExecutionStarted && !item.benchmarkMeasurementsRecorded));
    assert.ok(results.every((item) => !item.benchmarkPassed && !item.benchmarkFailed && !item.modelActive));
    assert.equal(results.some((item) => item.candidateTier === ('ultra-low' as never)), false);
  });

  it('keeps current Phase 5.10 approvals and all benchmark evidence at zero', () => {
    const approvals = listCurrentLocalModelArtifactApprovalIntegrityResults();
    assert.equal(approvals.filter((item) => item.artifactApprovalComplete).length, 0);
    assert.equal(approvals.filter((item) => item.canProceedToBenchmarkPlanning).length, 0);
    const results = buildCurrentSelectedArtifactBenchmarkPlanResults();
    assert.equal(results.filter((item) => item.benchmarkPlanApproved).length, 0);
    assert.equal(results.filter((item) => item.benchmarkExecutionStarted).length, 0);
    assert.equal(results.filter((item) => item.benchmarkMeasurementsRecorded).length, 0);
    assert.equal(results.filter((item) => item.benchmarkPassed).length, 0);
  });

  it('does not build a usable plan before artifact approval completes', () => {
    const input = createUnrecordedSelectedArtifactBenchmarkPlanInput('qwen3-0-6b-candidate');
    assert.equal(input.proposedPlan, null);
    assert.equal(buildSelectedArtifactBenchmarkPlan(input.candidateId, input.artifactApprovalResult), null);
    const result = evaluateSelectedArtifactBenchmarkPlan(input);
    assert.equal(result.status, 'unavailable');
    assert.equal(result.benchmarkPlanAvailable, false);
  });

  it('builds a deterministic exact-artifact plan and awaits explicit review', () => {
    const input = planningInput();
    const again = buildSelectedArtifactBenchmarkPlan(input.candidateId, input.artifactApprovalResult);
    assert.deepEqual(input.proposedPlan, again);
    const result = evaluateSelectedArtifactBenchmarkPlan(input);
    assert.equal(result.status, 'awaiting-plan-review');
    assert.equal(result.benchmarkPlanAvailable, true);
    assert.equal(result.benchmarkPlanApproved, false);
    assert.equal(result.benchmarkExecutionStarted, false);
    assert.equal(result.benchmarkMeasurementsRecorded, false);
  });

  it('approves only the future execution-review plan while preserving all execution and runtime boundaries', () => {
    const result = evaluateSelectedArtifactBenchmarkPlan(approvedPlanInput());
    assert.equal(result.status, 'benchmark-plan-approved');
    assert.equal(result.benchmarkPlanApproved, true);
    assert.equal(result.canProceedToFutureBenchmarkExecutionReview, true);
    assert.equal(result.benchmarkExecutionStarted, false);
    assert.equal(result.benchmarkExecutionCompleted, false);
    assert.equal(result.benchmarkMeasurementsRecorded, false);
    assert.equal(result.benchmarkVerified, false);
    assert.equal(result.benchmarkPassed, false);
    assert.equal(result.benchmarkFailed, false);
    assert.equal(result.checksumVerified, false);
    assert.equal(result.downloadable, false);
    assert.equal(result.runtimeReady, false);
    assert.equal(result.modelActive, false);
  });

  it('handles rejection and requests for more evidence without proceeding', () => {
    for (const decision of ['reject', 'request-more-evidence'] as const) {
      const result = evaluateSelectedArtifactBenchmarkPlan({ ...planningInput(), decision, decisionRecorded: true });
      assert.equal(result.status, decision === 'reject' ? 'rejected' : 'more-evidence-requested');
      assert.equal(result.benchmarkPlanApproved, false);
      assert.equal(result.canProceedToFutureBenchmarkExecutionReview, false);
    }
  });

  it('rejects inconsistent decision flags and approval without a plan', () => {
    const base = planningInput();
    assert.equal(evaluateSelectedArtifactBenchmarkPlan({ ...base, decision: 'approve-plan-for-future-execution' }).status, 'attention-required');
    assert.equal(evaluateSelectedArtifactBenchmarkPlan({ ...base, decision: 'not-recorded', decisionRecorded: true }).status, 'attention-required');
    assert.equal(evaluateSelectedArtifactBenchmarkPlan({ ...approvedPlanInput(), proposedPlan: null }).status, 'attention-required');
  });

  it('requires unique known scenarios, unique measurements, safe run counts, and no user content', () => {
    const input = planningInput();
    const plan = input.proposedPlan!;
    const duplicateScenario = { ...plan, scenarioPlans: [...plan.scenarioPlans, plan.scenarioPlans[0]] };
    const unknownScenario = { ...plan, scenarioPlans: [{ ...plan.scenarioPlans[0], category: 'unknown-scenario' as never }, ...plan.scenarioPlans.slice(1)] };
    const duplicateMeasurement = { ...plan, requiredMeasurementKinds: [...plan.requiredMeasurementKinds, plan.requiredMeasurementKinds[0]] };
    const userContent = { ...plan, scenarioPlans: [{ ...plan.scenarioPlans[0], userContentIncluded: true as never }, ...plan.scenarioPlans.slice(1)] };
    for (const bad of [duplicateScenario, unknownScenario, duplicateMeasurement, userContent]) {
      assert.equal(evaluateSelectedArtifactBenchmarkPlan({ ...input, proposedPlan: bad }).status, 'invalidated');
    }
    for (const bad of [
      { ...plan, minimumRunCount: 0 },
      { ...plan, minimumRunCount: 1.5 },
      { ...plan, warmupRunCount: -1 },
      { ...plan, warmupRunCount: 0.5 },
    ]) assert.equal(evaluateSelectedArtifactBenchmarkPlan({ ...input, proposedPlan: bad }).status, 'invalidated');
  });

  it('does not include fake measurements or duplicate hardware and benchmark thresholds', () => {
    const plan = planningInput().proposedPlan!;
    const serialized = JSON.stringify(plan);
    assert.doesNotMatch(serialized, /latencyValue|tokensPerSecondValue|memoryValue|qualityScore|measurementValue|passThreshold/i);
    assert.equal(plan.hardwareThresholdsOwnedByDeviceTierPolicy, true);
    assert.equal(plan.benchmarkThresholdsOwnedByExistingBenchmarkPolicy, true);
    assert.equal('hardwareThresholds' in plan, false);
    assert.equal('benchmarkThresholds' in plan, false);
  });

  it('preserves required product contracts and deterministic fallback continuity', () => {
    const plan = planningInput().proposedPlan!;
    const byCategory = new Map(plan.scenarioPlans.map((item) => [item.category, item]));
    assert.match(byCategory.get('ai-tutor-short-context')!.expectedFeatureContract, /3–5|3-5/);
    assert.match(byCategory.get('practice-generator-five-items')!.expectedFeatureContract, /exactly 5/i);
    assert.match(byCategory.get('writing-coach-short-feedback')!.expectedFeatureContract, /Đánh giá.*Lỗi sai.*Câu mẫu viết lại/i);
    assert.match(byCategory.get('speaking-coach-transcript-feedback')!.expectedFeatureContract, /transcript text only/i);
    assert.equal(byCategory.get('learner-memory-context-read')!.userContentIncluded, false);
    assert.equal(byCategory.get('fallback-continuity')!.enabled, true);
    assert.equal(byCategory.get('fallback-continuity')!.fallbackRequirement, 'deterministic-fallback-required');
  });

  it('invalidates stale scope fields across candidate, tier, repository, revision, format, variant, size, and revisions', () => {
    const input = planningInput();
    const scope = input.proposedPlan!.scope;
    const changes: Partial<LocalModelSelectedArtifactBenchmarkPlanScope>[] = [
      { candidateId: 'qwen3-1-7b-candidate' },
      { candidateTier: 'standard' },
      { modelClass: '1.7B' },
      { selectedOptionId: 'different-option' },
      { officialRepositoryId: 'Qwen/Other' },
      { observedRevision: 'different-revision' },
      { artifactFormat: 'gguf' },
      { variantKind: 'official-quantized' },
      { quantizationLabel: 'Q4_K_M' },
      { exactWeightBytes: scope.exactWeightBytes + 1 },
      { artifactApprovalPolicyRevision: scope.artifactApprovalPolicyRevision + 1 },
      { pinPlanRevision: scope.pinPlanRevision + 1 },
      { artifactSelectionRevision: scope.artifactSelectionRevision + 1 },
      { integrityEvidenceRevision: scope.integrityEvidenceRevision + 1 },
      { benchmarkFoundationRevision: scope.benchmarkFoundationRevision + 1 },
      { deviceTierPolicyRevision: scope.deviceTierPolicyRevision + 1 },
      { benchmarkPlanPolicyRevision: scope.benchmarkPlanPolicyRevision + 1 },
    ];
    for (const change of changes) {
      const result = evaluateSelectedArtifactBenchmarkPlan(mutateScope(input, change));
      assert.equal(result.status, 'invalidated', JSON.stringify(change));
      assert.equal(result.benchmarkPlanApproved, false);
    }
  });

  it('invalidates scenario, measurement, run-count, and fallback changes', () => {
    const input = planningInput();
    const plan = input.proposedPlan!;
    const changedScenario = { ...plan, scenarioPlans: plan.scenarioPlans.map((item, index) => index === 0 ? { ...item, enabled: !item.enabled } : item) };
    const changedMeasurements = { ...plan, requiredMeasurementKinds: plan.requiredMeasurementKinds.slice(1) };
    const changedRuns = { ...plan, minimumRunCount: plan.minimumRunCount + 1 };
    const changedWarmups = { ...plan, warmupRunCount: plan.warmupRunCount + 1 };
    const changedFallback = { ...plan, requireFallbackContinuity: false };
    for (const changed of [changedScenario, changedMeasurements, changedRuns, changedWarmups, changedFallback]) {
      assert.equal(evaluateSelectedArtifactBenchmarkPlan({ ...input, proposedPlan: changed }).status, 'invalidated');
    }
  });

  it('compares scope explicitly rather than by object identity', () => {
    const scope = planningInput().proposedPlan!.scope;
    const reordered: LocalModelSelectedArtifactBenchmarkPlanScope = {
      benchmarkPlanPolicyRevision: scope.benchmarkPlanPolicyRevision,
      deviceTierPolicyRevision: scope.deviceTierPolicyRevision,
      benchmarkFoundationRevision: scope.benchmarkFoundationRevision,
      integrityEvidenceRevision: scope.integrityEvidenceRevision,
      artifactSelectionRevision: scope.artifactSelectionRevision,
      pinPlanRevision: scope.pinPlanRevision,
      artifactApprovalPolicyRevision: scope.artifactApprovalPolicyRevision,
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
    };
    assert.equal(isSameSelectedArtifactBenchmarkPlanScope(scope, reordered), true);
    assert.equal(isSameSelectedArtifactBenchmarkPlanScope(scope, { ...scope, artifactFormat: 'gguf' }), false);
  });

  it('does not mutate inputs and returns deterministic unique blockers', () => {
    const input = mutatePlan(planningInput(), { minimumRunCount: 0 });
    const before = structuredClone(input);
    const first = evaluateSelectedArtifactBenchmarkPlan(input);
    const second = evaluateSelectedArtifactBenchmarkPlan(input);
    assert.deepEqual(input, before);
    assert.deepEqual(first.blockers, second.blockers);
    assert.equal(new Set(first.blockers).size, first.blockers.length);
  });

  it('validates revision ownership without modifying Phase 4 or Phase 5 foundations', () => {
    assert.equal(LOCAL_MODEL_BENCHMARK_FOUNDATION_REVISION, 1);
    assert.equal(LOCAL_AI_DEVICE_TIER_POLICY_REVISION, 1);
    assert.equal(LOCAL_MODEL_SELECTED_ARTIFACT_BENCHMARK_PLAN_POLICY_REVISION, 1);
    assert.ok(LOCAL_MODEL_BENCHMARK_DIMENSIONS.every((item) => item.status === 'planned'));
    assert.equal(validateSelectedArtifactBenchmarkPlanInput(approvedPlanInput()).valid, true);
    assert.equal(LOCAL_MODEL_ARTIFACT_MANIFEST.every((item) => !item.approvedForUse), true);
    assert.equal(buildCurrentLocalModelAcquisitionCloseout().status, 'foundation-complete');
  });
});
