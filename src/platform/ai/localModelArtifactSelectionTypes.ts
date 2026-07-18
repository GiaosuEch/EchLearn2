import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';
import type {
  LocalModelArtifactEvidenceRecord,
  LocalModelArtifactEvidenceTruthStatus,
  LocalModelArtifactFormat,
} from './localModelArtifactEvidenceTypes.ts';
import type { LocalModelCandidateReviewDecisionResult } from './localModelCandidateReviewDecisionTypes.ts';

export const LOCAL_MODEL_ARTIFACT_SELECTION_POLICY_REVISION = 1 as const;
export const LOCAL_MODEL_ARTIFACT_EVIDENCE_SCOPE_REVISION = 1 as const;

export type LocalModelArtifactSelectionDecision =
  | 'not-selected'
  | 'selected'
  | 'rejected';

export type LocalModelArtifactSelectionGateStatus =
  | 'blocked-by-model-license-review'
  | 'needs-more-artifact-evidence'
  | 'awaiting-human-selection'
  | 'selected-for-artifact-approval-review'
  | 'rejected'
  | 'attention-required';

export type LocalModelArtifactSelectionVariantKind =
  | 'official-base'
  | 'official-quantized'
  | 'unknown';

export interface LocalModelArtifactSelectionScope {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly officialRepositoryId: string;
  readonly observedRevision: string;
  readonly artifactFormat: LocalModelArtifactFormat;
  readonly variantKind: LocalModelArtifactSelectionVariantKind;
  readonly quantizationLabel: string | null;
  readonly weightShardCount: number;
  readonly aggregateWeightSizeBytes: number;
  readonly aggregateWeightSizeMb: number;
  readonly tokenizerEvidenceStatus: LocalModelArtifactEvidenceTruthStatus;
  readonly configEvidenceStatus: LocalModelArtifactEvidenceTruthStatus;
  readonly artifactEvidenceRevision: number;
  readonly selectionPolicyRevision: number;
}

export interface LocalModelArtifactSelectionInput {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly modelLicenseReviewResult: LocalModelCandidateReviewDecisionResult | null;
  readonly artifactEvidenceRecord: LocalModelArtifactEvidenceRecord | null;
  readonly decision: LocalModelArtifactSelectionDecision;
  readonly decisionRecorded: boolean;
  readonly selectedScope: LocalModelArtifactSelectionScope | null;
  readonly rejectionReasonCode: string | null;
  readonly decisionRevision: number;
  readonly claimedArtifactApproved: boolean;
  readonly claimedChecksumPinned: boolean;
  readonly claimedDownloadable: boolean;
  readonly claimedRuntimeReady: boolean;
  readonly claimedModelActive: boolean;
}

export interface LocalModelArtifactSelectionInputValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
}

export interface LocalModelArtifactSelectionResult {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly status: LocalModelArtifactSelectionGateStatus;
  readonly decision: LocalModelArtifactSelectionDecision;
  readonly selectedScope: LocalModelArtifactSelectionScope | null;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly canSelectArtifact: boolean;
  readonly canProceedToArtifactApprovalReview: boolean;
  readonly humanSelectionRecorded: boolean;
  readonly modelLicenseReviewPassed: boolean;
  readonly artifactEvidenceComplete: boolean;
  readonly artifactEvidenceConflictFree: boolean;
  readonly selectionValidForCurrentEvidence: boolean;
  readonly selectionGateOnly: true;
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
