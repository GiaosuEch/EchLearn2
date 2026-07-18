import { listCurrentLocalModelArtifactApprovalIntegrityResults } from './localModelArtifactApprovalIntegrityPolicy.ts';
import type { LocalModelArtifactApprovalIntegrityResult } from './localModelArtifactApprovalIntegrityTypes.ts';
import {
  LOCAL_AI_DEVICE_TIER_POLICY_REVISION,
  LOCAL_MODEL_BENCHMARK_FOUNDATION_REVISION,
  LOCAL_MODEL_SELECTED_ARTIFACT_BENCHMARK_PLAN_POLICY_REVISION,
} from './localModelSelectedArtifactBenchmarkPlanTypes.ts';
import type {
  LocalModelSelectedArtifactBenchmarkMeasurementKind,
  LocalModelSelectedArtifactBenchmarkPlan,
  LocalModelSelectedArtifactBenchmarkPlanInput,
  LocalModelSelectedArtifactBenchmarkPlanResult,
  LocalModelSelectedArtifactBenchmarkPlanScope,
  LocalModelSelectedArtifactBenchmarkPlanValidation,
  LocalModelSelectedArtifactBenchmarkScenarioCategory,
  LocalModelSelectedArtifactBenchmarkScenarioPlan,
} from './localModelSelectedArtifactBenchmarkPlanTypes.ts';

export { LOCAL_AI_DEVICE_TIER_POLICY_REVISION, LOCAL_MODEL_BENCHMARK_FOUNDATION_REVISION, LOCAL_MODEL_SELECTED_ARTIFACT_BENCHMARK_PLAN_POLICY_REVISION };

const CATEGORIES: readonly LocalModelSelectedArtifactBenchmarkScenarioCategory[] = [
  'runtime-initialization','ai-tutor-single-turn','ai-tutor-short-context','practice-generator-five-items',
  'writing-coach-short-feedback','speaking-coach-transcript-feedback','learner-memory-context-read','fallback-continuity',
] as const;
const MEASUREMENTS: readonly LocalModelSelectedArtifactBenchmarkMeasurementKind[] = [
  'initialization-duration-ms','first-output-latency-ms','total-duration-ms','output-token-count','output-tokens-per-second',
  'peak-memory-mb','steady-memory-mb','execution-error','crash-detected','fallback-available','output-contract-valid',
] as const;

function appendUnique(values: string[], value: string): void { if (!values.includes(value)) values.push(value); }
function unique<T>(values: readonly T[]): readonly T[] { return [...new Set(values)]; }
function canonical(values: readonly string[]): readonly string[] { return [...new Set(values)].sort(); }
function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  const a = canonical(left); const b = canonical(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}
function approvalComplete(result: LocalModelArtifactApprovalIntegrityResult | null): result is LocalModelArtifactApprovalIntegrityResult {
  return Boolean(result && result.status === 'artifact-approval-complete' && result.artifactApprovalComplete
    && result.artifactApproved && result.checksumPinned && !result.checksumVerified
    && result.canProceedToBenchmarkPlanning && result.selectedArtifactScope);
}

function scenarios(tier: LocalModelSelectedArtifactBenchmarkPlanScope['candidateTier']): readonly LocalModelSelectedArtifactBenchmarkScenarioPlan[] {
  const shared = { enabled: true, requiredForTier: tier, fallbackRequirement: 'deterministic-fallback-required' as const, userContentIncluded: false as const };
  return [
    { ...shared, scenarioId: 'runtime-initialization-contract', category: 'runtime-initialization', syntheticInputFixtureId: 'fixture-runtime-initialization-empty', expectedFeatureContract: 'Initialize the approved artifact only in a future isolated benchmark.', measurementRequirements: ['initialization-duration-ms','peak-memory-mb','execution-error','crash-detected','fallback-available'], failureCriteria: 'Any crash, execution error, or unavailable deterministic fallback fails the future run.' },
    { ...shared, scenarioId: 'ai-tutor-single-turn-contract', category: 'ai-tutor-single-turn', syntheticInputFixtureId: 'fixture-ai-tutor-single-turn', expectedFeatureContract: 'Return one structured tutor response for synthetic language-learning input.', measurementRequirements: ['first-output-latency-ms','total-duration-ms','output-token-count','output-tokens-per-second','output-contract-valid','execution-error'], failureCriteria: 'Invalid structured output, execution error, or core-app crash fails the future run.' },
    { ...shared, scenarioId: 'ai-tutor-short-context-contract', category: 'ai-tutor-short-context', syntheticInputFixtureId: 'fixture-ai-tutor-short-context-3-5-turns', expectedFeatureContract: 'Preserve the low-resource 3–5 turn context contract without learner content.', measurementRequirements: ['first-output-latency-ms','total-duration-ms','peak-memory-mb','steady-memory-mb','output-contract-valid','execution-error'], failureCriteria: 'Context loss, invalid output, execution error, or core-app crash fails the future run.' },
    { ...shared, scenarioId: 'practice-generator-five-items-contract', category: 'practice-generator-five-items', syntheticInputFixtureId: 'fixture-practice-generator-five-items', expectedFeatureContract: 'Practice Generator returns exactly 5 answerable items.', measurementRequirements: ['first-output-latency-ms','total-duration-ms','output-token-count','output-contract-valid','execution-error'], failureCriteria: 'Item-count mismatch, invalid structure, execution error, or core-app crash fails the future run.' },
    { ...shared, scenarioId: 'writing-coach-three-part-contract', category: 'writing-coach-short-feedback', syntheticInputFixtureId: 'fixture-writing-coach-short-feedback', expectedFeatureContract: 'Writing Coach returns Đánh giá, Lỗi sai, and Câu mẫu viết lại.', measurementRequirements: ['first-output-latency-ms','total-duration-ms','output-contract-valid','execution-error'], failureCriteria: 'Missing a required section, execution error, or core-app crash fails the future run.' },
    { ...shared, scenarioId: 'speaking-coach-transcript-only-contract', category: 'speaking-coach-transcript-feedback', syntheticInputFixtureId: 'fixture-speaking-coach-transcript-only', expectedFeatureContract: 'Speaking Coach consumes transcript text only and does not imply audio recognition.', measurementRequirements: ['first-output-latency-ms','total-duration-ms','output-contract-valid','execution-error'], failureCriteria: 'Audio assumptions, invalid output, execution error, or core-app crash fails the future run.' },
    { ...shared, scenarioId: 'learner-memory-consent-context-contract', category: 'learner-memory-context-read', syntheticInputFixtureId: 'fixture-learner-memory-consented-metadata', expectedFeatureContract: 'Learner Memory reads only consented metadata and bounded context.', measurementRequirements: ['total-duration-ms','output-contract-valid','execution-error'], failureCriteria: 'Unexpected learner-content access, invalid output, execution error, or core-app crash fails the future run.' },
    { ...shared, scenarioId: 'deterministic-fallback-continuity-contract', category: 'fallback-continuity', syntheticInputFixtureId: 'fixture-forced-local-model-failure', expectedFeatureContract: 'Deterministic fallback keeps the core app usable after future benchmark failure.', measurementRequirements: ['execution-error','crash-detected','fallback-available','output-contract-valid'], failureCriteria: 'Unavailable fallback or a core-app crash fails the future run.' },
  ] as const;
}

function scopeFromApproval(result: LocalModelArtifactApprovalIntegrityResult): LocalModelSelectedArtifactBenchmarkPlanScope | null {
  const selected = result.selectedArtifactScope; if (!selected) return null;
  return {
    candidateId: result.candidateId, candidateTier: result.candidateTier, modelClass: result.modelClass, exactModelName: result.exactModelName,
    selectedOptionId: selected.selectedOptionId, officialRepositoryId: selected.officialRepositoryId, observedRevision: selected.observedRevision,
    artifactFormat: selected.artifactFormat, variantKind: selected.variantKind, quantizationLabel: selected.quantizationLabel,
    weightShardCount: selected.weightShardCount, exactWeightBytes: selected.exactWeightBytes,
    artifactApprovalPolicyRevision: selected.artifactApprovalPolicyRevision, pinPlanRevision: selected.pinPlanRevision,
    artifactSelectionRevision: selected.artifactSelectionRevision, integrityEvidenceRevision: selected.integrityEvidenceRevision,
    benchmarkFoundationRevision: LOCAL_MODEL_BENCHMARK_FOUNDATION_REVISION, deviceTierPolicyRevision: LOCAL_AI_DEVICE_TIER_POLICY_REVISION,
    benchmarkPlanPolicyRevision: LOCAL_MODEL_SELECTED_ARTIFACT_BENCHMARK_PLAN_POLICY_REVISION,
  };
}

export function isSameSelectedArtifactBenchmarkPlanScope(left: LocalModelSelectedArtifactBenchmarkPlanScope, right: LocalModelSelectedArtifactBenchmarkPlanScope): boolean {
  return left.candidateId === right.candidateId && left.candidateTier === right.candidateTier && left.modelClass === right.modelClass
    && left.exactModelName === right.exactModelName && left.selectedOptionId === right.selectedOptionId
    && left.officialRepositoryId === right.officialRepositoryId && left.observedRevision === right.observedRevision
    && left.artifactFormat === right.artifactFormat && left.variantKind === right.variantKind && left.quantizationLabel === right.quantizationLabel
    && left.weightShardCount === right.weightShardCount && left.exactWeightBytes === right.exactWeightBytes
    && left.artifactApprovalPolicyRevision === right.artifactApprovalPolicyRevision && left.pinPlanRevision === right.pinPlanRevision
    && left.artifactSelectionRevision === right.artifactSelectionRevision && left.integrityEvidenceRevision === right.integrityEvidenceRevision
    && left.benchmarkFoundationRevision === right.benchmarkFoundationRevision && left.deviceTierPolicyRevision === right.deviceTierPolicyRevision
    && left.benchmarkPlanPolicyRevision === right.benchmarkPlanPolicyRevision;
}

function sameScenarios(left: readonly LocalModelSelectedArtifactBenchmarkScenarioPlan[], right: readonly LocalModelSelectedArtifactBenchmarkScenarioPlan[]): boolean {
  const a = [...left].sort((x,y) => x.scenarioId.localeCompare(y.scenarioId));
  const b = [...right].sort((x,y) => x.scenarioId.localeCompare(y.scenarioId));
  return a.length === b.length && a.every((item,index) => { const other = b[index]; return item.scenarioId === other.scenarioId
    && item.category === other.category && item.enabled === other.enabled && item.requiredForTier === other.requiredForTier
    && item.syntheticInputFixtureId === other.syntheticInputFixtureId && item.expectedFeatureContract === other.expectedFeatureContract
    && sameStrings(item.measurementRequirements, other.measurementRequirements) && item.failureCriteria === other.failureCriteria
    && item.fallbackRequirement === other.fallbackRequirement && item.userContentIncluded === other.userContentIncluded; });
}
function samePlan(left: LocalModelSelectedArtifactBenchmarkPlan, right: LocalModelSelectedArtifactBenchmarkPlan): boolean {
  return left.planId === right.planId && isSameSelectedArtifactBenchmarkPlanScope(left.scope,right.scope)
    && left.targetExecutionTier === right.targetExecutionTier && sameScenarios(left.scenarioPlans,right.scenarioPlans)
    && sameStrings(left.requiredMeasurementKinds,right.requiredMeasurementKinds) && left.minimumRunCount === right.minimumRunCount
    && left.warmupRunCount === right.warmupRunCount && left.stopOnCrash === right.stopOnCrash
    && left.requireFallbackContinuity === right.requireFallbackContinuity && left.requireNoCoreAppCrash === right.requireNoCoreAppCrash
    && left.hardwareThresholdsOwnedByDeviceTierPolicy === right.hardwareThresholdsOwnedByDeviceTierPolicy
    && left.benchmarkThresholdsOwnedByExistingBenchmarkPolicy === right.benchmarkThresholdsOwnedByExistingBenchmarkPolicy
    && left.benchmarkExecutionStarted === right.benchmarkExecutionStarted && left.benchmarkExecutionCompleted === right.benchmarkExecutionCompleted
    && left.benchmarkMeasurementsRecorded === right.benchmarkMeasurementsRecorded && left.benchmarkPassed === right.benchmarkPassed
    && left.benchmarkFailed === right.benchmarkFailed;
}

export function buildSelectedArtifactBenchmarkPlan(candidateId: string, approvalResult: LocalModelArtifactApprovalIntegrityResult | null): LocalModelSelectedArtifactBenchmarkPlan | null {
  if (!approvalComplete(approvalResult) || approvalResult.candidateId !== candidateId) return null;
  const scope = scopeFromApproval(approvalResult); if (!scope) return null;
  return {
    planId: `${candidateId}:selected-artifact-benchmark-plan:v${LOCAL_MODEL_SELECTED_ARTIFACT_BENCHMARK_PLAN_POLICY_REVISION}`,
    scope, targetExecutionTier: scope.candidateTier, scenarioPlans: scenarios(scope.candidateTier), requiredMeasurementKinds: MEASUREMENTS,
    minimumRunCount: 3, warmupRunCount: 1, stopOnCrash: true, requireFallbackContinuity: true, requireNoCoreAppCrash: true,
    hardwareThresholdsOwnedByDeviceTierPolicy: true, benchmarkThresholdsOwnedByExistingBenchmarkPolicy: true,
    benchmarkExecutionStarted: false, benchmarkExecutionCompleted: false, benchmarkMeasurementsRecorded: false,
    benchmarkPassed: false, benchmarkFailed: false,
  };
}

function validatePlanShape(plan: LocalModelSelectedArtifactBenchmarkPlan, issues: string[]): void {
  const scenarioIds = plan.scenarioPlans.map((item) => item.scenarioId);
  if (unique(scenarioIds).length !== scenarioIds.length) appendUnique(issues,'duplicate-scenario-id');
  if (!plan.scenarioPlans.some((item) => item.enabled)) appendUnique(issues,'empty-required-scenario-set');
  for (const scenario of plan.scenarioPlans) {
    if (!CATEGORIES.includes(scenario.category)) appendUnique(issues,'unknown-scenario-category');
    if (scenario.userContentIncluded) appendUnique(issues,'user-content-included');
    if (scenario.fallbackRequirement !== 'deterministic-fallback-required') appendUnique(issues,'fallback-requirement-missing');
    if (unique(scenario.measurementRequirements).length !== scenario.measurementRequirements.length) appendUnique(issues,'duplicate-scenario-measurement-requirement');
    if (scenario.measurementRequirements.some((kind) => !MEASUREMENTS.includes(kind))) appendUnique(issues,'unknown-measurement-requirement');
  }
  if (unique(plan.requiredMeasurementKinds).length !== plan.requiredMeasurementKinds.length) appendUnique(issues,'duplicate-measurement-requirement');
  if (plan.requiredMeasurementKinds.some((kind) => !MEASUREMENTS.includes(kind))) appendUnique(issues,'unknown-measurement-requirement');
  if (!Number.isInteger(plan.minimumRunCount) || plan.minimumRunCount <= 0) appendUnique(issues,'minimum-run-count-invalid');
  if (!Number.isInteger(plan.warmupRunCount) || plan.warmupRunCount < 0) appendUnique(issues,'warmup-run-count-invalid');
  const loose = plan as unknown as Record<string,unknown>;
  if ('hardwareThresholds' in loose || 'benchmarkThresholds' in loose) appendUnique(issues,'threshold-ownership-duplicated');
  if (!plan.hardwareThresholdsOwnedByDeviceTierPolicy) appendUnique(issues,'device-tier-threshold-ownership-missing');
  if (!plan.benchmarkThresholdsOwnedByExistingBenchmarkPolicy) appendUnique(issues,'benchmark-threshold-ownership-missing');
  if (!plan.requireFallbackContinuity || !plan.scenarioPlans.some((item) => item.category === 'fallback-continuity' && item.enabled)) appendUnique(issues,'fallback-continuity-scenario-missing');
  if (plan.benchmarkExecutionStarted || plan.benchmarkExecutionCompleted || plan.benchmarkMeasurementsRecorded || plan.benchmarkPassed || plan.benchmarkFailed) appendUnique(issues,'benchmark-result-claimed-in-plan');
}

export function createUnrecordedSelectedArtifactBenchmarkPlanInput(candidateId: string): LocalModelSelectedArtifactBenchmarkPlanInput {
  const approvalResult = listCurrentLocalModelArtifactApprovalIntegrityResults().find((item) => item.candidateId === candidateId) ?? null;
  return {
    candidateId, candidateTier: approvalResult?.candidateTier ?? 'light', artifactApprovalResult: approvalResult,
    decision: 'not-recorded', decisionRecorded: false, proposedPlan: null, sessionPreviouslyInvalidated: false,
    claimedBenchmarkExecutionStarted: false, claimedBenchmarkExecutionCompleted: false, claimedBenchmarkMeasurementsRecorded: false,
    claimedBenchmarkVerified: false, claimedBenchmarkPassed: false, claimedBenchmarkFailed: false, claimedChecksumVerified: false,
    claimedDownloadable: false, claimedRuntimeReady: false, claimedModelActive: false,
  };
}

export function validateSelectedArtifactBenchmarkPlanInput(input: LocalModelSelectedArtifactBenchmarkPlanInput): LocalModelSelectedArtifactBenchmarkPlanValidation {
  const issues: string[] = []; const approval = input.artifactApprovalResult;
  if (!approval) appendUnique(issues,'unknown-candidate');
  if (approval) {
    if (approval.candidateId !== input.candidateId) appendUnique(issues,'candidate-mismatch');
    if (approval.candidateTier !== input.candidateTier) appendUnique(issues,'candidate-tier-mismatch');
  }
  if (!input.decisionRecorded && input.decision !== 'not-recorded') appendUnique(issues,'decision-recorded-flag-mismatch');
  if (input.decisionRecorded && input.decision === 'not-recorded') appendUnique(issues,'recorded-decision-is-not-recorded');
  if (input.sessionPreviouslyInvalidated) appendUnique(issues,'plan-session-previously-invalidated');
  if (input.decision === 'approve-plan-for-future-execution' && !input.proposedPlan) appendUnique(issues,'approved-plan-missing');
  const complete = approvalComplete(approval);
  if (!complete && input.decision === 'approve-plan-for-future-execution') appendUnique(issues,'plan-approval-before-artifact-approval');
  if (input.proposedPlan) {
    validatePlanShape(input.proposedPlan,issues);
    if (!complete) appendUnique(issues,'plan-proposed-before-artifact-approval');
    const expected = buildSelectedArtifactBenchmarkPlan(input.candidateId,approval);
    if (!expected || !samePlan(input.proposedPlan,expected)) appendUnique(issues,'benchmark-plan-scope-or-definition-mismatch');
  }
  if (input.claimedBenchmarkExecutionStarted) appendUnique(issues,'benchmark-execution-started-claim');
  if (input.claimedBenchmarkExecutionCompleted) appendUnique(issues,'benchmark-execution-completed-claim');
  if (input.claimedBenchmarkMeasurementsRecorded) appendUnique(issues,'benchmark-measurements-recorded-claim');
  if (input.claimedBenchmarkVerified) appendUnique(issues,'benchmark-verified-claim');
  if (input.claimedBenchmarkPassed) appendUnique(issues,'benchmark-passed-claim');
  if (input.claimedBenchmarkFailed) appendUnique(issues,'benchmark-failed-claim');
  if (input.claimedChecksumVerified) appendUnique(issues,'checksum-verified-claim');
  if (input.claimedDownloadable) appendUnique(issues,'downloadable-claim');
  if (input.claimedRuntimeReady) appendUnique(issues,'runtime-ready-claim');
  if (input.claimedModelActive) appendUnique(issues,'model-active-claim');
  return { valid: issues.length === 0, issues };
}

export function evaluateSelectedArtifactBenchmarkPlan(input: LocalModelSelectedArtifactBenchmarkPlanInput): LocalModelSelectedArtifactBenchmarkPlanResult {
  const validation = validateSelectedArtifactBenchmarkPlanInput(input);
  const approval = input.artifactApprovalResult; const complete = approvalComplete(approval);
  const expected = buildSelectedArtifactBenchmarkPlan(input.candidateId,approval);
  const planValid = Boolean(input.proposedPlan && expected && samePlan(input.proposedPlan,expected));
  const attention = validation.issues.some((issue) => issue.includes('decision-') || issue.includes('claim') || issue === 'unknown-candidate' || issue === 'approved-plan-missing');
  const planIssue = Boolean(input.proposedPlan && validation.issues.some((issue) => !issue.includes('decision-') && !issue.includes('claim') && issue !== 'unknown-candidate' && issue !== 'approved-plan-missing'));
  let status: LocalModelSelectedArtifactBenchmarkPlanResult['status'];
  if (input.sessionPreviouslyInvalidated || (complete && input.proposedPlan && (!planValid || planIssue))) status = 'invalidated';
  else if (attention || (validation.issues.length > 0 && complete)) status = 'attention-required';
  else if (!complete || !input.proposedPlan || !planValid) status = 'unavailable';
  else if (input.decision === 'request-more-evidence') status = 'more-evidence-requested';
  else if (input.decision === 'reject') status = 'rejected';
  else if (input.decision === 'approve-plan-for-future-execution' && input.decisionRecorded) status = 'benchmark-plan-approved';
  else status = 'awaiting-plan-review';
  const approved = status === 'benchmark-plan-approved'; const blockers = [...validation.issues];
  if (!complete) appendUnique(blockers,'artifact-approval-not-complete');
  if (!input.proposedPlan) appendUnique(blockers,'benchmark-plan-not-proposed');
  if (!approved) appendUnique(blockers,'benchmark-plan-not-approved');
  return {
    candidateId: input.candidateId, candidateTier: input.candidateTier, modelClass: approval?.modelClass ?? 'unknown', exactModelName: approval?.exactModelName ?? 'Unknown candidate',
    status, decision: input.decision, proposedPlan: input.proposedPlan, blockers,
    warnings: ['Benchmark planning is evidence-plan only; no execution, measurements, pass, download, runtime readiness, or model activation occurs in this phase.'],
    artifactApprovalComplete: complete, benchmarkPlanAvailable: complete && planValid, planValidForCurrentScope: planValid,
    humanPlanDecisionRecorded: input.decisionRecorded, benchmarkPlanApproved: approved,
    canProceedToFutureBenchmarkExecutionReview: approved, benchmarkPlanBoundaryOnly: true,
    benchmarkExecutionStarted: false, benchmarkExecutionCompleted: false, benchmarkMeasurementsRecorded: false,
    benchmarkVerified: false, benchmarkPassed: false, benchmarkFailed: false, checksumVerified: false,
    downloadable: false, runtimeReady: false, modelActive: false,
  };
}

export function buildCurrentSelectedArtifactBenchmarkPlanResults(): readonly LocalModelSelectedArtifactBenchmarkPlanResult[] {
  return listCurrentLocalModelArtifactApprovalIntegrityResults().map((item) => evaluateSelectedArtifactBenchmarkPlan(createUnrecordedSelectedArtifactBenchmarkPlanInput(item.candidateId)));
}
export function listCurrentSelectedArtifactBenchmarkPlanResults(): readonly LocalModelSelectedArtifactBenchmarkPlanResult[] { return buildCurrentSelectedArtifactBenchmarkPlanResults(); }
