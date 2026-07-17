import type {
  LocalAiAccessTier,
  LocalAiDeviceTier,
  LocalAiDeviceTierGateResult,
  LocalAiModelTier,
  LocalAiTierBenchmarkStatus,
  LocalAiWebGpuStatus,
  LocalAiConnectionKind,
  LocalAiThermalStatus,
} from './localAiDeviceTierTypes.ts';
import type {
  LocalModelArtifactChecksumStatus,
  LocalModelArtifactDownloadLocationStatus,
  LocalModelCachePolicyResult,
  LocalModelStorageQuotaStatus,
} from './localModelArtifactTypes.ts';
import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';
import type { LocalRuntimeCapabilityResult } from './localRuntimeCapabilityTypes.ts';

export type LocalModelAcquisitionConfirmationStatus =
  | 'not-requested'
  | 'confirmed'
  | 'declined';

export type LocalModelAcquisitionPreflightStatus =
  | 'blocked'
  | 'awaiting-user-confirmation'
  | 'preflight-passed';

export type LocalModelAcquisitionBlockerId =
  | 'candidate-not-selected'
  | 'candidate-not-found'
  | 'artifact-not-found'
  | 'candidate-artifact-mismatch'
  | 'candidate-tier-mismatch'
  | 'model-approval-pending'
  | 'license-approval-pending'
  | 'artifact-approval-pending'
  | 'artifact-not-downloadable'
  | 'artifact-not-cacheable'
  | 'artifact-runtime-not-ready'
  | 'checksum-missing'
  | 'download-location-absent'
  | 'benchmark-not-passed'
  | 'device-tier-blocked'
  | 'candidate-tier-not-allowed'
  | 'webgpu-not-supported'
  | 'connection-not-wifi'
  | 'battery-unsafe'
  | 'thermal-hot'
  | 'storage-unknown'
  | 'storage-insufficient'
  | 'cache-policy-blocked'
  | 'user-confirmation-not-requested'
  | 'user-confirmation-declined';

export interface LocalModelAcquisitionPreflightInput {
  readonly candidateId: string | null;
  readonly candidateTier: LocalModelApprovalTier | null;
  readonly candidateSelected: boolean;
  readonly candidateExists: boolean;
  readonly artifactExists: boolean;
  readonly candidateArtifactMatches: boolean;
  readonly candidateTierMatches: boolean;
  readonly modelApproved: boolean;
  readonly licenseApproved: boolean;
  readonly artifactApproved: boolean;
  readonly artifactDownloadable: boolean;
  readonly artifactCacheable: boolean;
  readonly artifactRuntimeReady: boolean;
  readonly checksumStatus: LocalModelArtifactChecksumStatus;
  readonly downloadLocationStatus: LocalModelArtifactDownloadLocationStatus;
  readonly benchmarkStatus: LocalAiTierBenchmarkStatus;
  readonly deviceTier: LocalAiDeviceTier;
  readonly deviceGateAllowsCandidate: boolean;
  readonly candidateTierEligible: boolean;
  readonly candidateTierAllowed: boolean;
  readonly webGpuStatus: LocalAiWebGpuStatus;
  readonly connectionKind: LocalAiConnectionKind;
  readonly batteryLevelPercent: number | null;
  readonly thermalStatus: LocalAiThermalStatus;
  readonly storageQuotaStatus: LocalModelStorageQuotaStatus;
  readonly confirmationStatus: LocalModelAcquisitionConfirmationStatus;
  readonly cachePolicyResult: LocalModelCachePolicyResult;
  readonly featureAvailability: 'full-ui';
}

export interface LocalModelAcquisitionPreflightResult {
  readonly status: LocalModelAcquisitionPreflightStatus;
  readonly candidateId: string | null;
  readonly candidateTier: LocalModelApprovalTier | null;
  readonly blockers: readonly LocalModelAcquisitionBlockerId[];
  readonly warnings: readonly string[];
  readonly canOfferUserConfirmation: boolean;
  readonly canPlanFutureAcquisition: boolean;
  readonly requiresExplicitUserConfirmation: boolean;
  readonly coreAppFallback: 'unaffected';
  readonly featureAvailability: 'full-ui';
  readonly policyOnly: true;
  readonly downloadStarted: false;
  readonly cacheWritten: false;
  readonly runtimeInitialized: false;
  readonly modelReady: false;
  readonly modelActive: false;
  readonly generatedOutputProduced: false;
}

export interface BuildCurrentLocalModelAcquisitionPreflightInput {
  readonly candidateId: string | null;
  readonly runtimeCapability: LocalRuntimeCapabilityResult;
  readonly accessTier?: LocalAiAccessTier;
  readonly benchmarkStatusByModelTier?: Partial<Record<LocalAiModelTier, LocalAiTierBenchmarkStatus>>;
  readonly confirmationStatus?: LocalModelAcquisitionConfirmationStatus;
}

export interface CurrentLocalModelAcquisitionPreflightResult
  extends LocalModelAcquisitionPreflightResult {
  readonly candidateDisplayName: string;
  readonly parameterScaleLabel: string | null;
  readonly artifactId: string | null;
  readonly storageQuotaStatus: LocalModelStorageQuotaStatus;
  readonly benchmarkStatus: LocalAiTierBenchmarkStatus;
  readonly deviceGate: LocalAiDeviceTierGateResult;
  readonly cachePolicy: LocalModelCachePolicyResult;
}
