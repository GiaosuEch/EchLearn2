import type { AIFeatureId } from './aiFeatureRegistry.ts';
import type { LocalAiModelTier } from './localAiDeviceTierTypes.ts';
import {
  buildLocalModelAcquisitionAuthorizationViewModel,
} from './localModelAcquisitionAuthorizationViewModel.ts';
import type {
  BuildLocalModelAcquisitionAuthorizationViewModelOptions,
  LocalModelAcquisitionAuthorizationViewModel,
} from './localModelAcquisitionAuthorizationViewModel.ts';
import type {
  LocalModelAcquisitionExecutionBoundaryResult,
  LocalModelAcquisitionExecutorAvailability,
  LocalModelAcquisitionHandoffOutcome,
} from './localModelAcquisitionExecutionTypes.ts';
import type { LocalRuntimeCapabilityResult } from './localRuntimeCapabilityTypes.ts';

export interface BuildLocalModelAcquisitionExecutionViewModelOptions
  extends Pick<
    BuildLocalModelAcquisitionAuthorizationViewModelOptions,
    | 'accessTier'
    | 'benchmarkStatusByModelTier'
    | 'consentSessionsByCandidateId'
    | 'authorizationSessionsByCandidateId'
    | 'consentViewModel'
  > {
  readonly authorizationViewModel?: LocalModelAcquisitionAuthorizationViewModel;
  readonly executorAvailability?: LocalModelAcquisitionExecutorAvailability;
  readonly boundaryResultsByCandidateId?: Readonly<Record<string, LocalModelAcquisitionExecutionBoundaryResult>>;
}

export interface LocalModelAcquisitionExecutionCandidateViewModel {
  readonly candidateId: string;
  readonly candidateTier: LocalAiModelTier;
  readonly modelClassLabel: string;
  readonly authorizationState: string;
  readonly executionEligible: boolean;
  readonly executorAvailability: LocalModelAcquisitionExecutorAvailability;
  readonly outcome: LocalModelAcquisitionHandoffOutcome;
  readonly statusLabel: string;
  readonly requestBuilt: boolean;
  readonly executorInvoked: boolean;
  readonly executorAcceptedHandoff: boolean;
  readonly authorizationConsumed: boolean;
  readonly reasons: readonly string[];
  readonly downloadStarted: false;
  readonly modelActive: false;
}

export interface LocalModelAcquisitionExecutionViewModel {
  readonly heading: 'Local Model Acquisition Executor Boundary';
  readonly boundarySummary: 'Boundary only';
  readonly executorSummary: 'Production executor unavailable';
  readonly authorizationSummary: 'Authorization required before handoff';
  readonly requestSummary: 'No execution request created';
  readonly handoffSummary: 'No executor handoff accepted';
  readonly downloadSummary: 'No download started';
  readonly cacheSummary: 'No cache written';
  readonly modelSummary: 'No model active';
  readonly coreAppSummary: 'Core app remains available';
  readonly fallbackSummary: 'Deterministic fallback remains available';
  readonly documentPath: 'docs/ai/phase-4-local-model-acquisition-executor-boundary.md';
  readonly candidates: readonly LocalModelAcquisitionExecutionCandidateViewModel[];
  readonly aggregate: {
    readonly totalCandidates: number;
    readonly executionEligibleCandidates: number;
    readonly requestsBuilt: number;
    readonly executorInvocations: number;
    readonly acceptedHandoffs: number;
    readonly rejectedHandoffs: number;
    readonly unavailableExecutors: number;
    readonly consumedAuthorizations: number;
    readonly downloadStartedCandidates: 0;
    readonly activeModels: 0;
  };
  readonly authorizationViewModel: LocalModelAcquisitionAuthorizationViewModel;
  readonly candidateDeviceTier: LocalModelAcquisitionAuthorizationViewModel['candidateDeviceTier'];
  readonly featureAvailability: 'full-ui';
  readonly visibleFeatureIds: readonly AIFeatureId[];
  readonly policyOnly: true;
  readonly boundaryOnly: true;
  readonly modelActive: false;
}

export interface LocalModelAcquisitionExecutionResultViewModel {
  readonly outcome: LocalModelAcquisitionHandoffOutcome;
  readonly summary: string;
  readonly authorizationConsumed: boolean;
  readonly downloadStarted: false;
  readonly downloadCompleted: false;
  readonly cacheWritten: false;
  readonly runtimeInitialized: false;
  readonly modelReady: false;
  readonly modelActive: false;
}

function statusLabel(
  authorizationState: string,
  executorAvailability: LocalModelAcquisitionExecutorAvailability,
  outcome: LocalModelAcquisitionHandoffOutcome,
): string {
  if (outcome === 'handoff-accepted') return 'Executor accepted the boundary handoff';
  if (outcome === 'rejected') return 'Executor rejected the boundary handoff';
  if (outcome === 'failed') return 'Executor boundary failed safely';
  if (outcome === 'executor-unavailable' || executorAvailability === 'unavailable') {
    return 'Production executor unavailable';
  }
  if (authorizationState === 'authorized') return 'Authorization available for a future handoff';
  return 'Authorization required before handoff';
}

export function buildLocalModelAcquisitionExecutionViewModel(
  runtimeCapability: LocalRuntimeCapabilityResult,
  options: BuildLocalModelAcquisitionExecutionViewModelOptions = {},
): LocalModelAcquisitionExecutionViewModel {
  const authorizationViewModel = options.authorizationViewModel
    ?? buildLocalModelAcquisitionAuthorizationViewModel(runtimeCapability, {
      accessTier: options.accessTier,
      benchmarkStatusByModelTier: options.benchmarkStatusByModelTier,
      consentSessionsByCandidateId: options.consentSessionsByCandidateId,
      authorizationSessionsByCandidateId: options.authorizationSessionsByCandidateId,
      consentViewModel: options.consentViewModel,
    });
  const executorAvailability = options.executorAvailability ?? 'unavailable';

  const candidates = authorizationViewModel.candidates.map((candidate) => {
    const result = options.boundaryResultsByCandidateId?.[candidate.candidateId];
    const outcome = result?.outcome ?? 'not-requested';
    const executionEligible = candidate.state === 'authorized'
      && candidate.authorizationGranted
      && candidate.futureExecutorHandoffAllowed;
    return {
      candidateId: candidate.candidateId,
      candidateTier: candidate.candidateTier,
      modelClassLabel: candidate.modelClassLabel,
      authorizationState: candidate.state,
      executionEligible,
      executorAvailability,
      outcome,
      statusLabel: statusLabel(candidate.state, executorAvailability, outcome),
      requestBuilt: result?.requestBuilt ?? false,
      executorInvoked: result?.executorInvoked ?? false,
      executorAcceptedHandoff: result?.executorAcceptedHandoff ?? false,
      authorizationConsumed: result?.authorizationConsumed ?? false,
      reasons: result?.reasons ?? candidate.reasons,
      downloadStarted: false as const,
      modelActive: false as const,
    };
  });

  return {
    heading: 'Local Model Acquisition Executor Boundary',
    boundarySummary: 'Boundary only',
    executorSummary: 'Production executor unavailable',
    authorizationSummary: 'Authorization required before handoff',
    requestSummary: 'No execution request created',
    handoffSummary: 'No executor handoff accepted',
    downloadSummary: 'No download started',
    cacheSummary: 'No cache written',
    modelSummary: 'No model active',
    coreAppSummary: 'Core app remains available',
    fallbackSummary: 'Deterministic fallback remains available',
    documentPath: 'docs/ai/phase-4-local-model-acquisition-executor-boundary.md',
    candidates,
    aggregate: {
      totalCandidates: candidates.length,
      executionEligibleCandidates: candidates.filter((candidate) => candidate.executionEligible).length,
      requestsBuilt: candidates.filter((candidate) => candidate.requestBuilt).length,
      executorInvocations: candidates.filter((candidate) => candidate.executorInvoked).length,
      acceptedHandoffs: candidates.filter((candidate) => candidate.outcome === 'handoff-accepted').length,
      rejectedHandoffs: candidates.filter((candidate) => candidate.outcome === 'rejected').length,
      unavailableExecutors: candidates.filter(
        (candidate) => candidate.executorAvailability === 'unavailable'
          || candidate.outcome === 'executor-unavailable',
      ).length,
      consumedAuthorizations: candidates.filter((candidate) => candidate.authorizationConsumed).length,
      downloadStartedCandidates: 0,
      activeModels: 0,
    },
    authorizationViewModel,
    candidateDeviceTier: authorizationViewModel.candidateDeviceTier,
    featureAvailability: authorizationViewModel.featureAvailability,
    visibleFeatureIds: authorizationViewModel.visibleFeatureIds,
    policyOnly: true,
    boundaryOnly: true,
    modelActive: false,
  };
}

export function buildLocalModelAcquisitionExecutionResultViewModel(
  result: LocalModelAcquisitionExecutionBoundaryResult,
): LocalModelAcquisitionExecutionResultViewModel {
  let summary = 'Boundary request remains blocked.';
  if (result.outcome === 'executor-unavailable') {
    summary = 'Executor unavailable; authorization remains unconsumed.';
  } else if (result.outcome === 'rejected') {
    summary = 'Executor rejected the contract handoff; authorization remains unconsumed.';
  } else if (result.outcome === 'handoff-accepted') {
    summary = 'Contract handoff accepted; execution remains outside this boundary.';
  } else if (result.outcome === 'failed') {
    summary = 'Executor boundary failed safely; authorization remains unconsumed.';
  }

  return {
    outcome: result.outcome,
    summary,
    authorizationConsumed: result.authorizationConsumed,
    downloadStarted: false,
    downloadCompleted: false,
    cacheWritten: false,
    runtimeInitialized: false,
    modelReady: false,
    modelActive: false,
  };
}
