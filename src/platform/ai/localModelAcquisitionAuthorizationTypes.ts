import type {
  LocalAiAccessTier,
  LocalAiConnectionKind,
  LocalAiDeviceTier,
  LocalAiModelTier,
  LocalAiThermalStatus,
  LocalAiTierBenchmarkStatus,
  LocalAiWebGpuStatus,
} from './localAiDeviceTierTypes.ts';
import type { LocalModelStorageQuotaStatus } from './localModelArtifactTypes.ts';
import type { LocalModelAcquisitionConsentSession } from './localModelAcquisitionConsentTypes.ts';
import type { LocalModelAcquisitionPreflightResult } from './localModelAcquisitionTypes.ts';

export type LocalModelAcquisitionAuthorizationState =
  | 'unavailable'
  | 'awaiting-action-request'
  | 'authorized'
  | 'cancelled'
  | 'invalidated'
  | 'consumed';

export type LocalModelAcquisitionBatterySafety = 'safe' | 'unsafe' | 'unknown';

export interface LocalModelAcquisitionAuthorizationScope {
  readonly candidateId: string | null;
  readonly candidateTier: LocalAiModelTier | null;
  readonly artifactCandidateId: string | null;
  readonly estimatedDownloadSizeMb: number | null;
  readonly expectedStorageImpactMb: number | null;
  readonly disclosureRevision: number;
  readonly authorizationPolicyRevision: number;
  readonly accessTier: LocalAiAccessTier;
  readonly assignedDeviceTier: LocalAiDeviceTier;
  readonly benchmarkStatus: LocalAiTierBenchmarkStatus;
  readonly webGpuStatus: LocalAiWebGpuStatus;
  readonly connectionKind: LocalAiConnectionKind;
  readonly batterySafety: LocalModelAcquisitionBatterySafety;
  readonly thermalStatus: LocalAiThermalStatus;
  readonly storageQuotaStatus: LocalModelStorageQuotaStatus;
}

export interface BuildLocalModelAcquisitionAuthorizationScopeInput
  extends Omit<LocalModelAcquisitionAuthorizationScope, 'authorizationPolicyRevision'> {
  readonly authorizationPolicyRevision?: number;
}

export interface LocalModelAcquisitionAuthorizationPreflightSnapshot
  extends Pick<
    LocalModelAcquisitionPreflightResult,
    'status' | 'blockers' | 'canPlanFutureAcquisition'
  > {
  readonly warnings?: readonly string[];
}

export interface LocalModelAcquisitionAuthorizationPolicyInput {
  readonly preflight: LocalModelAcquisitionAuthorizationPreflightSnapshot;
  readonly consent: LocalModelAcquisitionConsentSession;
  readonly scope: LocalModelAcquisitionAuthorizationScope;
}

export type LocalModelAcquisitionAuthorizationEvent =
  | { readonly type: 'request-authorization' }
  | { readonly type: 'cancel' }
  | { readonly type: 'reset' }
  | { readonly type: 'consume' }
  | {
      readonly type: 'scope-changed';
      readonly scope: LocalModelAcquisitionAuthorizationScope;
    }
  | { readonly type: 'current-facts-changed' };

export interface LocalModelAcquisitionAuthorizationSession {
  readonly state: LocalModelAcquisitionAuthorizationState;
  readonly scope: LocalModelAcquisitionAuthorizationScope;
  readonly actionRequestRecorded: boolean;
  readonly authorizationGranted: boolean;
  readonly authorizationValidForCurrentScope: boolean;
  readonly authorizationConsumed: boolean;
  readonly canRequestAuthorization: boolean;
  readonly canCancel: boolean;
  readonly canReset: boolean;
  readonly canConsume: boolean;
  readonly reasons: readonly string[];
  readonly warnings: readonly string[];
  readonly policyOnly: true;
  readonly oneAttemptOnly: true;
  readonly futureExecutorHandoffAllowed: boolean;
  readonly downloadStarted: false;
  readonly downloadCompleted: false;
  readonly cacheWritten: false;
  readonly runtimeInitialized: false;
  readonly modelReady: false;
  readonly modelActive: false;
  readonly generatedOutputProduced: false;
}
