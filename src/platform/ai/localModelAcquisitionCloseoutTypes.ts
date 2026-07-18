import type { AIFeatureId } from './aiFeatureRegistry.ts';
import type { LocalAiDeviceTier } from './localAiDeviceTierTypes.ts';

export type LocalModelAcquisitionCloseoutCheckStatus = 'pass' | 'fail' | 'warning';

export type LocalModelAcquisitionCloseoutStatus =
  | 'foundation-complete'
  | 'attention-required';

export type LocalModelAcquisitionCloseoutCheckId =
  | 'runtime-decision-safe'
  | 'approval-registry-safe'
  | 'benchmark-state-safe'
  | 'tier-matrix-compatible'
  | 'artifact-manifest-safe'
  | 'cache-policy-safe'
  | 'capability-probe-metadata-only'
  | 'preflight-production-blocked'
  | 'consent-production-unavailable'
  | 'authorization-production-unavailable'
  | 'executor-production-unavailable'
  | 'execution-request-production-zero'
  | 'accepted-handoff-production-zero'
  | 'download-production-zero'
  | 'cache-write-production-zero'
  | 'runtime-initialization-production-zero'
  | 'model-active-production-zero'
  | 'fallback-available'
  | 'full-feature-ui-preserved'
  | 'no-runtime-side-effects';

export interface LocalModelAcquisitionCloseoutCheck {
  readonly id: LocalModelAcquisitionCloseoutCheckId;
  readonly status: LocalModelAcquisitionCloseoutCheckStatus;
  readonly summary: string;
  readonly reasons: readonly string[];
  readonly blocking: boolean;
}

export interface LocalModelAcquisitionCloseoutInput {
  readonly totalCandidates: number;
  readonly approvedCandidates: number;
  readonly benchmarkPassedCandidates: number;
  readonly downloadableCandidates: number;
  readonly runtimeDecisionSafe: boolean;
  readonly approvalRegistrySafe: boolean;
  readonly benchmarkStateSafe: boolean;
  readonly tierMatrixCompatible: boolean;
  readonly ultraLowNoModel: boolean;
  readonly artifactManifestSafe: boolean;
  readonly cachePolicySafe: boolean;
  readonly metadataOnlyProbe: boolean;
  readonly preflightBlockedCandidates: number;
  readonly preflightPassedCandidates: number;
  readonly consentAvailableCandidates: number;
  readonly confirmedConsentCandidates: number;
  readonly authorizedCandidates: number;
  readonly consumedAuthorizations: number;
  readonly executionEligibleCandidates: number;
  readonly executionRequestsBuilt: number;
  readonly executorInvocations: number;
  readonly acceptedHandoffs: number;
  readonly downloadsStarted: number;
  readonly downloadsCompleted: number;
  readonly cachesWritten: number;
  readonly checksumsVerified: number;
  readonly runtimeInitializations: number;
  readonly activeModels: number;
  readonly productionExecutorAvailable: boolean;
  readonly productionExecutionAvailable: boolean;
  readonly modelReady: boolean;
  readonly modelActive: boolean;
  readonly coreAppAvailable: boolean;
  readonly deterministicFallbackAvailable: boolean;
  readonly fullFeatureUiPreserved: boolean;
  readonly visibleFeatureIds: readonly AIFeatureId[];
  readonly candidateDeviceTier: LocalAiDeviceTier;
  readonly noRuntimeSideEffects: boolean;
}

export interface LocalModelAcquisitionCloseoutResult {
  readonly status: LocalModelAcquisitionCloseoutStatus;
  readonly checks: readonly LocalModelAcquisitionCloseoutCheck[];
  readonly passedChecks: number;
  readonly warningChecks: number;
  readonly failedChecks: number;
  readonly blockingIssues: readonly string[];
  readonly warnings: readonly string[];
  readonly phaseFoundationComplete: boolean;
  readonly totalCandidates: number;
  readonly productionExecutionAvailable: boolean;
  readonly productionExecutorAvailable: boolean;
  readonly approvedCandidates: number;
  readonly benchmarkPassedCandidates: number;
  readonly downloadableCandidates: number;
  readonly preflightPassedCandidates: number;
  readonly consentAvailableCandidates: number;
  readonly confirmedConsentCandidates: number;
  readonly authorizedCandidates: number;
  readonly consumedAuthorizations: number;
  readonly executionEligibleCandidates: number;
  readonly executionRequestsBuilt: number;
  readonly executorInvocations: number;
  readonly acceptedHandoffs: number;
  readonly downloadsStarted: number;
  readonly downloadsCompleted: number;
  readonly cachesWritten: number;
  readonly checksumsVerified: number;
  readonly runtimeInitializations: number;
  readonly activeModels: number;
  readonly tierMatrixCompatible: boolean;
  readonly ultraLowNoModel: boolean;
  readonly candidateDeviceTier: LocalAiDeviceTier;
  readonly featureAvailability: 'full-ui';
  readonly visibleFeatureIds: readonly AIFeatureId[];
  readonly policyOnly: true;
  readonly metadataOnlyProbe: true;
  readonly networkUsed: false;
  readonly modelReady: false;
  readonly modelActive: false;
  readonly coreAppAvailable: true;
  readonly deterministicFallbackAvailable: true;
}
