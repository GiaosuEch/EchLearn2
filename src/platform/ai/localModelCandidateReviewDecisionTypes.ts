import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';
import type { LocalModelCandidateEvidenceRecord } from './localModelCandidateEvidenceTypes.ts';

export const LOCAL_MODEL_CANDIDATE_REVIEW_DECISION_REVISION = 1 as const;

export const LOCAL_MODEL_CANDIDATE_REQUIRED_REVIEW_CATEGORIES = [
  'exactModelIdentity',
  'baseLicense',
  'commercialUse',
  'redistribution',
  'derivedArtifactHosting',
  'derivativeWorks',
  'quantizationAndConversion',
  'attributionAndNotice',
  'tokenizerTerms',
  'acceptableUseScope',
] as const;

export type LocalModelCandidateReviewCategory =
  typeof LOCAL_MODEL_CANDIDATE_REQUIRED_REVIEW_CATEGORIES[number];

export type LocalModelCandidateReviewItemDecision =
  | 'not-reviewed'
  | 'needs-more-evidence'
  | 'approved'
  | 'rejected'
  | 'not-applicable';

export type LocalModelCandidateReviewGateStatus =
  | 'needs-more-evidence'
  | 'awaiting-human-decision'
  | 'approved-for-artifact-review'
  | 'rejected'
  | 'attention-required';

export type LocalModelCandidateReviewDecisions = Readonly<Record<
  LocalModelCandidateReviewCategory,
  LocalModelCandidateReviewItemDecision
>>;

export interface LocalModelCandidateReviewDecisionInput {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly evidenceRecord: LocalModelCandidateEvidenceRecord | null;
  readonly decisions: LocalModelCandidateReviewDecisions;
  readonly decisionRecorded: boolean;
  readonly decisionRevision: number;
}

export interface LocalModelCandidateReviewDecisionInputValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
}

export interface LocalModelCandidateReviewDecisionResult {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly status: LocalModelCandidateReviewGateStatus;
  readonly decisions: LocalModelCandidateReviewDecisions;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly missingEvidence: readonly string[];
  readonly unresolvedReviewItems: readonly LocalModelCandidateReviewCategory[];
  readonly canProceedToArtifactReview: boolean;
  readonly humanDecisionRecorded: boolean;
  readonly evidenceComplete: boolean;
  readonly evidenceConflictFree: boolean;
  readonly humanReviewStillRequired: boolean;
  readonly evidenceOnly: false;
  readonly decisionGateOnly: true;
  readonly modelApproved: false;
  readonly licenseApproved: false;
  readonly artifactApproved: false;
  readonly benchmarkVerified: false;
  readonly downloadable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
}
