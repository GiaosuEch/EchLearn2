import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';
import type { LocalModelArtifactFormat } from './localModelArtifactEvidenceTypes.ts';
import type { LocalModelHumanArtifactVariantKind } from './localModelHumanArtifactSelectionTypes.ts';
import type { LocalModelArtifactApprovalIntegrityResult } from './localModelArtifactApprovalIntegrityTypes.ts';

export const LOCAL_MODEL_BENCHMARK_FOUNDATION_REVISION = 1 as const;
export const LOCAL_AI_DEVICE_TIER_POLICY_REVISION = 1 as const;
export const LOCAL_MODEL_SELECTED_ARTIFACT_BENCHMARK_PLAN_POLICY_REVISION = 1 as const;

export type LocalModelSelectedArtifactBenchmarkPlanDecision = 'not-recorded' | 'approve-plan-for-future-execution' | 'reject' | 'request-more-evidence';
export type LocalModelSelectedArtifactBenchmarkPlanSessionStatus = 'unavailable' | 'awaiting-plan-review' | 'benchmark-plan-approved' | 'more-evidence-requested' | 'rejected' | 'invalidated' | 'attention-required';
export type LocalModelSelectedArtifactBenchmarkScenarioCategory = 'runtime-initialization' | 'ai-tutor-single-turn' | 'ai-tutor-short-context' | 'practice-generator-five-items' | 'writing-coach-short-feedback' | 'speaking-coach-transcript-feedback' | 'learner-memory-context-read' | 'fallback-continuity';
export type LocalModelSelectedArtifactBenchmarkMeasurementKind = 'initialization-duration-ms' | 'first-output-latency-ms' | 'total-duration-ms' | 'output-token-count' | 'output-tokens-per-second' | 'peak-memory-mb' | 'steady-memory-mb' | 'execution-error' | 'crash-detected' | 'fallback-available' | 'output-contract-valid';

export interface LocalModelSelectedArtifactBenchmarkScenarioPlan {
  readonly scenarioId: string;
  readonly category: LocalModelSelectedArtifactBenchmarkScenarioCategory;
  readonly enabled: boolean;
  readonly requiredForTier: LocalModelApprovalTier;
  readonly syntheticInputFixtureId: string;
  readonly expectedFeatureContract: string;
  readonly measurementRequirements: readonly LocalModelSelectedArtifactBenchmarkMeasurementKind[];
  readonly failureCriteria: string;
  readonly fallbackRequirement: 'deterministic-fallback-required';
  readonly userContentIncluded: false;
}

export interface LocalModelSelectedArtifactBenchmarkPlanScope {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly selectedOptionId: string;
  readonly officialRepositoryId: string;
  readonly observedRevision: string;
  readonly artifactFormat: Exclude<LocalModelArtifactFormat, 'unknown'>;
  readonly variantKind: LocalModelHumanArtifactVariantKind;
  readonly quantizationLabel: string | null;
  readonly weightShardCount: number;
  readonly exactWeightBytes: number;
  readonly artifactApprovalPolicyRevision: number;
  readonly pinPlanRevision: number;
  readonly artifactSelectionRevision: number;
  readonly integrityEvidenceRevision: number;
  readonly benchmarkFoundationRevision: number;
  readonly deviceTierPolicyRevision: number;
  readonly benchmarkPlanPolicyRevision: number;
}

export interface LocalModelSelectedArtifactBenchmarkPlan {
  readonly planId: string;
  readonly scope: LocalModelSelectedArtifactBenchmarkPlanScope;
  readonly targetExecutionTier: LocalModelApprovalTier;
  readonly scenarioPlans: readonly LocalModelSelectedArtifactBenchmarkScenarioPlan[];
  readonly requiredMeasurementKinds: readonly LocalModelSelectedArtifactBenchmarkMeasurementKind[];
  readonly minimumRunCount: number;
  readonly warmupRunCount: number;
  readonly stopOnCrash: boolean;
  readonly requireFallbackContinuity: boolean;
  readonly requireNoCoreAppCrash: boolean;
  readonly hardwareThresholdsOwnedByDeviceTierPolicy: true;
  readonly benchmarkThresholdsOwnedByExistingBenchmarkPolicy: true;
  readonly benchmarkExecutionStarted: false;
  readonly benchmarkExecutionCompleted: false;
  readonly benchmarkMeasurementsRecorded: false;
  readonly benchmarkPassed: false;
  readonly benchmarkFailed: false;
}

export interface LocalModelSelectedArtifactBenchmarkPlanInput {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly artifactApprovalResult: LocalModelArtifactApprovalIntegrityResult | null;
  readonly decision: LocalModelSelectedArtifactBenchmarkPlanDecision;
  readonly decisionRecorded: boolean;
  readonly proposedPlan: LocalModelSelectedArtifactBenchmarkPlan | null;
  readonly sessionPreviouslyInvalidated: boolean;
  readonly claimedBenchmarkExecutionStarted: boolean;
  readonly claimedBenchmarkExecutionCompleted: boolean;
  readonly claimedBenchmarkMeasurementsRecorded: boolean;
  readonly claimedBenchmarkVerified: boolean;
  readonly claimedBenchmarkPassed: boolean;
  readonly claimedBenchmarkFailed: boolean;
  readonly claimedChecksumVerified: boolean;
  readonly claimedDownloadable: boolean;
  readonly claimedRuntimeReady: boolean;
  readonly claimedModelActive: boolean;
}

export interface LocalModelSelectedArtifactBenchmarkPlanValidation { readonly valid: boolean; readonly issues: readonly string[]; }

export interface LocalModelSelectedArtifactBenchmarkPlanResult {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly status: LocalModelSelectedArtifactBenchmarkPlanSessionStatus;
  readonly decision: LocalModelSelectedArtifactBenchmarkPlanDecision;
  readonly proposedPlan: LocalModelSelectedArtifactBenchmarkPlan | null;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly artifactApprovalComplete: boolean;
  readonly benchmarkPlanAvailable: boolean;
  readonly planValidForCurrentScope: boolean;
  readonly humanPlanDecisionRecorded: boolean;
  readonly benchmarkPlanApproved: boolean;
  readonly canProceedToFutureBenchmarkExecutionReview: boolean;
  readonly benchmarkPlanBoundaryOnly: true;
  readonly benchmarkExecutionStarted: false;
  readonly benchmarkExecutionCompleted: false;
  readonly benchmarkMeasurementsRecorded: false;
  readonly benchmarkVerified: false;
  readonly benchmarkPassed: false;
  readonly benchmarkFailed: false;
  readonly checksumVerified: false;
  readonly downloadable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
}
