import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';
import type {
  LocalModelArtifactEvidenceRecord,
  LocalModelArtifactEvidenceStatus,
  LocalModelArtifactEvidenceTruthStatus,
  LocalModelArtifactFormat,
} from './localModelArtifactEvidenceTypes.ts';
import type {
  LocalModelArtifactIntegrityAlgorithmKind,
  LocalModelArtifactIntegrityCandidateRecord,
} from './localModelArtifactIntegrityEvidenceTypes.ts';
import type { LocalModelHumanGovernanceDecisionResult } from './localModelHumanGovernanceDecisionTypes.ts';

export const LOCAL_MODEL_HUMAN_ARTIFACT_SELECTION_POLICY_REVISION = 1 as const;
export const LOCAL_MODEL_ARTIFACT_INTEGRITY_EVIDENCE_REVISION = 1 as const;

export type LocalModelHumanArtifactSelectionDecision =
  | 'not-recorded'
  | 'select'
  | 'reject'
  | 'request-more-evidence';

export type LocalModelHumanArtifactSelectionSessionStatus =
  | 'unavailable'
  | 'awaiting-human-selection'
  | 'selection-recorded'
  | 'more-evidence-requested'
  | 'rejected'
  | 'invalidated'
  | 'attention-required';

export type LocalModelHumanArtifactVariantKind =
  | 'official-base'
  | 'official-quantized';

export interface LocalModelSelectableArtifactOption {
  readonly optionId: string;
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly officialRepositoryId: string;
  readonly observedRevision: string;
  readonly artifactFormat: Exclude<LocalModelArtifactFormat, 'unknown'>;
  readonly variantKind: LocalModelHumanArtifactVariantKind;
  readonly quantizationLabel: string | null;
  readonly weightShardCount: number;
  readonly exactWeightBytes: number;
  readonly exactWeightMiB: number;
  readonly tokenizerProvenanceStatus: LocalModelArtifactEvidenceTruthStatus;
  readonly configProvenanceStatus: LocalModelArtifactEvidenceTruthStatus;
  readonly integrityEvidenceStatus: LocalModelArtifactEvidenceStatus;
  readonly integrityAlgorithmsObserved: readonly LocalModelArtifactIntegrityAlgorithmKind[];
  readonly artifactEvidenceRevision: number;
  readonly integrityEvidenceRevision: number;
}

export interface LocalModelHumanArtifactSelectionScope {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly officialRepositoryId: string;
  readonly observedRevision: string;
  readonly artifactFormat: Exclude<LocalModelArtifactFormat, 'unknown'>;
  readonly variantKind: LocalModelHumanArtifactVariantKind;
  readonly quantizationLabel: string | null;
  readonly weightShardCount: number;
  readonly exactWeightBytes: number;
  readonly tokenizerProvenanceStatus: LocalModelArtifactEvidenceTruthStatus;
  readonly configProvenanceStatus: LocalModelArtifactEvidenceTruthStatus;
  readonly integrityEvidenceStatus: LocalModelArtifactEvidenceStatus;
  readonly integrityAlgorithmsObserved: readonly LocalModelArtifactIntegrityAlgorithmKind[];
  readonly governanceDecisionScopeRevision: number;
  readonly governanceDecisionPolicyRevision: number;
  readonly artifactEvidenceRevision: number;
  readonly integrityEvidenceRevision: number;
  readonly artifactSelectionPolicyRevision: number;
}

export interface LocalModelHumanArtifactSelectionInput {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly governanceDecisionResult: LocalModelHumanGovernanceDecisionResult | null;
  readonly artifactEvidenceRecord: LocalModelArtifactEvidenceRecord | null;
  readonly integrityEvidenceRecord: LocalModelArtifactIntegrityCandidateRecord | null;
  readonly decision: LocalModelHumanArtifactSelectionDecision;
  readonly decisionRecorded: boolean;
  readonly selectedOptionId: string | null;
  readonly selectedScope: LocalModelHumanArtifactSelectionScope | null;
  readonly sessionPreviouslyInvalidated: boolean;
  readonly claimedModelApproved: boolean;
  readonly claimedLicenseApproved: boolean;
  readonly claimedArtifactSelected: boolean;
  readonly claimedArtifactApproved: boolean;
  readonly claimedChecksumPinned: boolean;
  readonly claimedChecksumVerified: boolean;
  readonly claimedDownloadLocationConfigured: boolean;
  readonly claimedBenchmarkVerified: boolean;
  readonly claimedDownloadable: boolean;
  readonly claimedCacheable: boolean;
  readonly claimedRuntimeReady: boolean;
  readonly claimedModelActive: boolean;
}

export interface LocalModelHumanArtifactSelectionInputValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
}

export interface LocalModelHumanArtifactSelectionResult {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly status: LocalModelHumanArtifactSelectionSessionStatus;
  readonly decision: LocalModelHumanArtifactSelectionDecision;
  readonly availableOptions: readonly LocalModelSelectableArtifactOption[];
  readonly selectedOptionId: string | null;
  readonly selectedScope: LocalModelHumanArtifactSelectionScope | null;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly canRecordSelection: boolean;
  readonly governanceDecisionsComplete: boolean;
  readonly artifactEvidenceSufficient: boolean;
  readonly integrityEvidenceSufficient: boolean;
  readonly selectionValidForCurrentScope: boolean;
  readonly humanSelectionRecorded: boolean;
  readonly canProceedToArtifactApprovalReview: boolean;
  readonly artifactSelectionBoundaryOnly: true;
  readonly artifactSelected: boolean;
  readonly modelApproved: false;
  readonly licenseApproved: false;
  readonly artifactApproved: false;
  readonly checksumPinned: false;
  readonly checksumVerified: false;
  readonly downloadLocationConfigured: false;
  readonly benchmarkVerified: false;
  readonly downloadable: false;
  readonly cacheable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
}
