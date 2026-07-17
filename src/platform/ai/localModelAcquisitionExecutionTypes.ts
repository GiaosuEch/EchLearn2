import type {
  LocalAiAccessTier,
  LocalAiDeviceTier,
  LocalAiModelTier,
  LocalAiTierBenchmarkStatus,
} from './localAiDeviceTierTypes.ts';
import type {
  LocalModelAcquisitionAuthorizationPolicyInput,
  LocalModelAcquisitionAuthorizationScope,
  LocalModelAcquisitionAuthorizationSession,
} from './localModelAcquisitionAuthorizationTypes.ts';

export type LocalModelAcquisitionExecutorAvailability = 'unavailable' | 'available';

export type LocalModelAcquisitionHandoffOutcome =
  | 'not-requested'
  | 'blocked'
  | 'executor-unavailable'
  | 'rejected'
  | 'handoff-accepted'
  | 'failed';

export interface LocalModelAcquisitionExecutionRequest {
  readonly candidateId: string;
  readonly candidateTier: LocalAiModelTier;
  readonly artifactCandidateId: string;
  readonly estimatedDownloadSizeMb: number;
  readonly expectedStorageImpactMb: number;
  readonly disclosureRevision: number;
  readonly authorizationPolicyRevision: number;
  readonly executionBoundaryRevision: number;
  readonly accessTier: LocalAiAccessTier;
  readonly assignedDeviceTier: LocalAiDeviceTier;
  readonly benchmarkStatus: LocalAiTierBenchmarkStatus;
  readonly authorizationScope: LocalModelAcquisitionAuthorizationScope;
  readonly oneAttemptOnly: true;
}

export interface LocalModelAcquisitionExecutorResponse {
  readonly outcome: LocalModelAcquisitionHandoffOutcome;
  readonly requestAccepted: boolean;
  readonly executorAvailable: boolean;
  readonly reasons: readonly string[];
  readonly warnings: readonly string[];
}

export interface LocalModelAcquisitionExecutor {
  readonly availability: LocalModelAcquisitionExecutorAvailability;

  acceptHandoff(
    request: LocalModelAcquisitionExecutionRequest,
  ): Promise<LocalModelAcquisitionExecutorResponse>;
}

export interface LocalModelAcquisitionExecutorBoundaryInput {
  readonly authorizationSession: LocalModelAcquisitionAuthorizationSession;
  readonly currentAuthorizationInput: LocalModelAcquisitionAuthorizationPolicyInput;
}

export interface LocalModelAcquisitionExecutionBoundaryResult {
  readonly outcome: LocalModelAcquisitionHandoffOutcome;
  readonly request: LocalModelAcquisitionExecutionRequest | null;
  readonly requestBuilt: boolean;
  readonly executorInvoked: boolean;
  readonly executorAcceptedHandoff: boolean;
  readonly authorizationConsumed: boolean;
  readonly originalAuthorizationSession: LocalModelAcquisitionAuthorizationSession;
  readonly resultingAuthorizationSession: LocalModelAcquisitionAuthorizationSession;
  readonly reasons: readonly string[];
  readonly warnings: readonly string[];
  readonly policyOnly: true;
  readonly boundaryOnly: true;
  readonly networkUsed: false;
  readonly downloadStarted: false;
  readonly downloadCompleted: false;
  readonly cacheWritten: false;
  readonly checksumVerified: false;
  readonly runtimeInitialized: false;
  readonly modelReady: false;
  readonly modelActive: false;
  readonly generatedOutputProduced: false;
}
