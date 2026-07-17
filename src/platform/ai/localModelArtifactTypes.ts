import type {
  LocalAiConnectionKind,
  LocalAiDeviceTier,
  LocalAiThermalStatus,
  LocalAiWebGpuStatus,
} from './localAiDeviceTierTypes.ts';
import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';

export type LocalModelArtifactId =
  | 'qwen3-0-6b-light-artifact-candidate'
  | 'qwen3-1-7b-standard-artifact-candidate'
  | 'qwen3-4b-pro-artifact-candidate';

export type LocalModelArtifactCandidateId =
  | 'qwen3-0-6b-candidate'
  | 'qwen3-1-7b-candidate'
  | 'qwen3-4b-candidate';

export type LocalModelArtifactApprovalStatus = 'candidate-unapproved';
export type LocalModelArtifactChecksumStatus = 'missing' | 'planned' | 'verified';
export type LocalModelArtifactDownloadLocationStatus = 'absent' | 'planned' | 'approved';

export interface LocalModelArtifactCandidate {
  readonly artifactId: LocalModelArtifactId;
  readonly candidateId: LocalModelArtifactCandidateId;
  readonly modelTier: LocalModelApprovalTier;
  readonly displayName: string;
  readonly parameterScaleLabel: string;
  readonly quantizationLabel: 'Not selected';
  readonly estimatedDownloadSizeMb: null;
  readonly estimatedInstalledSizeMb: null;
  readonly cacheBucket: 'planned-local-model-cache';
  readonly approvalStatus: LocalModelArtifactApprovalStatus;
  readonly licenseApprovalRequired: true;
  readonly artifactApprovalRequired: true;
  readonly benchmarkApprovalRequired: true;
  readonly checksumRequired: true;
  readonly checksumStatus: 'missing';
  readonly downloadUrlStatus: 'absent';
  readonly downloadable: false;
  readonly cacheable: false;
  readonly runtimeReady: false;
}

export type LocalModelCacheBudgetStatus =
  | 'fixed-zero'
  | 'bounded-candidate-budget'
  | 'requires-artifact-and-benchmark-review';

export interface LocalModelCacheBudget {
  readonly tier: LocalAiDeviceTier;
  readonly minimumModelCacheMb: number | null;
  readonly maximumModelCacheMb: number | null;
  readonly automaticEnable: false;
  readonly budgetStatus: LocalModelCacheBudgetStatus;
}

export type LocalModelStorageQuotaStatus = 'sufficient' | 'insufficient' | 'unknown';

export type LocalModelCacheControlActionId =
  | 'estimate-storage'
  | 'verify-checksum'
  | 'delete-artifact-cache'
  | 'recover-corrupted-cache';

export interface LocalModelCacheControlAction {
  readonly plannedAction: LocalModelCacheControlActionId;
  readonly status: 'not-implemented';
  readonly requiresExplicitUserAction: boolean;
  readonly summary: string;
}

export interface EvaluateLocalModelCachePolicyInput {
  readonly deviceTier: LocalAiDeviceTier;
  readonly deviceGateAllowsModelAttempt: boolean;
  readonly artifactApproved: boolean;
  readonly benchmarkApproved: boolean;
  readonly userConfirmedDownload: boolean;
  readonly connectionKind: LocalAiConnectionKind;
  readonly batteryLevelPercent: number | null;
  readonly thermalStatus: LocalAiThermalStatus;
  readonly webGpuStatus: LocalAiWebGpuStatus;
  readonly storageQuotaStatus: LocalModelStorageQuotaStatus;
}

export interface LocalModelCachePolicyResult {
  readonly cacheBudget: LocalModelCacheBudget;
  readonly canPlanFutureDownloadAttempt: boolean;
  readonly requiresUserConfirmation: boolean;
  readonly userDeletionRequired: true;
  readonly coreAppFallback: 'unaffected';
  readonly corruptedCacheRecovery: 'delete-and-redownload-after-approval';
  readonly warnings: readonly string[];
  readonly reasons: readonly string[];
  readonly userFacingSummary: string;
}
