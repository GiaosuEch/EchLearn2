import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';

export type LocalModelCandidateEvidenceStatus =
  | 'not-reviewed'
  | 'evidence-incomplete'
  | 'evidence-collected'
  | 'conflicting-evidence'
  | 'requires-human-review'
  | 'rejected';

export type LocalModelEvidenceTruthValue = 'yes' | 'no' | 'unknown';

export type LocalModelCandidateEvidenceSourceKind =
  | 'official-model-card'
  | 'official-license'
  | 'official-repository'
  | 'official-documentation'
  | 'official-acceptable-use-policy'
  | 'official-release-notes';

export interface LocalModelCandidateEvidenceSource {
  readonly sourceId: string;
  readonly sourceKind: LocalModelCandidateEvidenceSourceKind;
  readonly officialPublisher: boolean;
  readonly title: string;
  readonly reference: string;
  readonly retrievedOn: string;
  readonly supportsFields: readonly string[];
  readonly notes: string;
}

export interface LocalModelCandidateLicenseFacts {
  readonly commercialUse: LocalModelEvidenceTruthValue;
  readonly internalBusinessUse: LocalModelEvidenceTruthValue;
  readonly redistribution: LocalModelEvidenceTruthValue;
  readonly hostingDerivedArtifacts: LocalModelEvidenceTruthValue;
  readonly derivativeWorks: LocalModelEvidenceTruthValue;
  readonly quantizationAllowed: LocalModelEvidenceTruthValue;
  readonly attributionRequired: LocalModelEvidenceTruthValue;
  readonly noticeRequired: LocalModelEvidenceTruthValue;
  readonly gatedAccess: LocalModelEvidenceTruthValue;
  readonly separateTokenizerTerms: LocalModelEvidenceTruthValue;
  readonly acceptableUsePolicyApplies: LocalModelEvidenceTruthValue;
  readonly trademarkPermissionGranted: LocalModelEvidenceTruthValue;
}

export type LocalModelTokenizerEvidenceStatus =
  | 'not-reviewed'
  | 'official-files-present-license-scope-unresolved'
  | 'separate-terms-located';

export type LocalModelBrowserRuntimeEvidenceStatus =
  | 'not-reviewed'
  | 'official-browser-evidence-not-found'
  | 'official-browser-evidence-located';

export type LocalModelArtifactEvidenceStatus =
  | 'not-reviewed'
  | 'evidence-incomplete'
  | 'evidence-collected';

export interface LocalModelCandidateEvidenceRecord {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly publisher: string;
  readonly family: string;
  readonly versionOrRevision: string;
  readonly evidenceStatus: LocalModelCandidateEvidenceStatus;
  readonly officialIdentityConfirmed: boolean;
  readonly licenseIdentifier: string | null;
  readonly licenseTextLocated: boolean;
  readonly licenseFacts: LocalModelCandidateLicenseFacts;
  readonly attributionSummary: string;
  readonly restrictionSummary: string;
  readonly tokenizerEvidenceStatus: LocalModelTokenizerEvidenceStatus;
  readonly browserRuntimeEvidenceStatus: LocalModelBrowserRuntimeEvidenceStatus;
  readonly artifactEvidenceStatus: LocalModelArtifactEvidenceStatus;
  readonly sources: readonly LocalModelCandidateEvidenceSource[];
  readonly missingEvidence: readonly string[];
  readonly conflicts: readonly string[];
  readonly humanReviewRequired: true;
  readonly modelApproved: false;
  readonly licenseApproved: false;
  readonly artifactApproved: false;
  readonly benchmarkVerified: false;
  readonly runtimeReady: false;
  readonly downloadable: false;
  readonly modelActive: false;
}

export interface LocalModelCandidateEvidenceRegistryValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
}
