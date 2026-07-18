import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';
import type { LocalModelArtifactFormat } from './localModelArtifactEvidenceTypes.ts';
import type {
  LocalModelArtifactIntegrityAlgorithmKind,
  LocalModelArtifactIntegrityCandidateRecord,
  LocalModelArtifactIntegrityEvidenceStatus,
  LocalModelArtifactIntegrityFileRole,
} from './localModelArtifactIntegrityEvidenceTypes.ts';
import type {
  LocalModelHumanArtifactSelectionResult,
  LocalModelHumanArtifactVariantKind,
} from './localModelHumanArtifactSelectionTypes.ts';

export const LOCAL_MODEL_ARTIFACT_INTEGRITY_PIN_PLAN_REVISION = 1 as const;
export const LOCAL_MODEL_ARTIFACT_APPROVAL_POLICY_REVISION = 1 as const;

export type LocalModelHumanArtifactApprovalDecision =
  | 'not-recorded'
  | 'approve-for-benchmark-planning'
  | 'reject'
  | 'request-more-evidence';

export type LocalModelHumanIntegrityPinningDecision =
  | 'not-recorded'
  | 'approve-pin-plan'
  | 'reject'
  | 'request-more-evidence';

export type LocalModelArtifactApprovalIntegritySessionStatus =
  | 'unavailable'
  | 'awaiting-human-approval'
  | 'partially-recorded'
  | 'more-evidence-requested'
  | 'artifact-approval-complete'
  | 'rejected'
  | 'invalidated'
  | 'attention-required';

export interface LocalModelArtifactIntegrityPinItem {
  readonly fileName: string;
  readonly fileRole: LocalModelArtifactIntegrityFileRole;
  readonly exactSizeBytes: number;
  readonly algorithm: LocalModelArtifactIntegrityAlgorithmKind;
  readonly expectedDigest: string;
  readonly sourceRevision: string;
  readonly sourceEvidenceId: string;
  readonly pinnedForSelectedScope: boolean;
  readonly verified: false;
}

export interface LocalModelArtifactIntegrityPinPlan {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly selectedOptionId: string;
  readonly officialRepositoryId: string;
  readonly observedRevision: string;
  readonly artifactFormat: Exclude<LocalModelArtifactFormat, 'unknown'>;
  readonly variantKind: LocalModelHumanArtifactVariantKind;
  readonly quantizationLabel: string | null;
  readonly requiredFiles: readonly string[];
  readonly pinItems: readonly LocalModelArtifactIntegrityPinItem[];
  readonly artifactSelectionRevision: number;
  readonly integrityEvidenceRevision: number;
  readonly pinPlanRevision: number;
}

export interface LocalModelArtifactApprovalScope {
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
  readonly tokenizerProvenanceStatus: string;
  readonly configProvenanceStatus: string;
  readonly integrityEvidenceStatus: LocalModelArtifactIntegrityEvidenceStatus;
  readonly integrityAlgorithmsObserved: readonly LocalModelArtifactIntegrityAlgorithmKind[];
  readonly governanceDecisionRevision: number;
  readonly artifactSelectionRevision: number;
  readonly artifactEvidenceRevision: number;
  readonly integrityEvidenceRevision: number;
  readonly pinPlanRevision: number;
  readonly artifactApprovalPolicyRevision: number;
  readonly requiredFiles: readonly string[];
  readonly pinItems: readonly LocalModelArtifactIntegrityPinItem[];
}

export interface LocalModelArtifactApprovalIntegrityInput {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly selectionResult: LocalModelHumanArtifactSelectionResult | null;
  readonly integrityEvidenceRecord: LocalModelArtifactIntegrityCandidateRecord | null;
  readonly artifactApprovalDecision: LocalModelHumanArtifactApprovalDecision;
  readonly artifactApprovalDecisionRecorded: boolean;
  readonly integrityPinningDecision: LocalModelHumanIntegrityPinningDecision;
  readonly integrityPinningDecisionRecorded: boolean;
  readonly selectedArtifactScope: LocalModelArtifactApprovalScope | null;
  readonly integrityPinPlan: LocalModelArtifactIntegrityPinPlan | null;
  readonly sessionPreviouslyInvalidated: boolean;
  readonly claimedModelApproved: boolean;
  readonly claimedLicenseApproved: boolean;
  readonly claimedChecksumVerified: boolean;
  readonly claimedDownloadLocationConfigured: boolean;
  readonly claimedBenchmarkVerified: boolean;
  readonly claimedDownloadable: boolean;
  readonly claimedCacheable: boolean;
  readonly claimedRuntimeReady: boolean;
  readonly claimedModelActive: boolean;
}

export interface LocalModelArtifactApprovalIntegrityValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
}

export interface LocalModelArtifactApprovalIntegrityResult {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly status: LocalModelArtifactApprovalIntegritySessionStatus;
  readonly artifactApprovalDecision: LocalModelHumanArtifactApprovalDecision;
  readonly integrityPinningDecision: LocalModelHumanIntegrityPinningDecision;
  readonly selectedArtifactScope: LocalModelArtifactApprovalScope | null;
  readonly integrityPinPlan: LocalModelArtifactIntegrityPinPlan | null;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly canRecordApproval: boolean;
  readonly artifactSelectionRecorded: boolean;
  readonly integrityPinPlanComplete: boolean;
  readonly approvalValidForCurrentScope: boolean;
  readonly humanArtifactApprovalRecorded: boolean;
  readonly humanIntegrityPinningDecisionRecorded: boolean;
  readonly artifactApprovalComplete: boolean;
  readonly canProceedToBenchmarkPlanning: boolean;
  readonly artifactApprovalBoundaryOnly: true;
  readonly modelApproved: false;
  readonly licenseApproved: false;
  readonly artifactSelected: boolean;
  readonly artifactApproved: boolean;
  readonly checksumPinned: boolean;
  readonly checksumVerified: false;
  readonly downloadLocationConfigured: false;
  readonly benchmarkVerified: false;
  readonly downloadable: false;
  readonly cacheable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
}
