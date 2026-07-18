import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';
import type {
  LocalModelGovernanceEvidenceClosureCandidateRecord,
  LocalModelGovernanceEvidenceClosureRequirementId,
  LocalModelGovernanceEvidenceClosureStatus,
} from './localModelGovernanceEvidenceClosureTypes.ts';

export type LocalModelHumanGovernanceItemDecision =
  | 'not-recorded'
  | 'proceed'
  | 'reject'
  | 'request-more-evidence';

export type LocalModelHumanGovernanceDecisionSessionStatus =
  | 'unavailable'
  | 'awaiting-human-decision'
  | 'partially-recorded'
  | 'more-evidence-requested'
  | 'governance-decisions-complete'
  | 'rejected'
  | 'invalidated'
  | 'attention-required';

export interface LocalModelHumanGovernanceDecisionItem {
  readonly requirementId: LocalModelGovernanceEvidenceClosureRequirementId;
  readonly evidenceClosureStatus: LocalModelGovernanceEvidenceClosureStatus;
  readonly decision: LocalModelHumanGovernanceItemDecision;
  readonly decisionRecorded: boolean;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
}

export interface LocalModelHumanGovernanceDecisionScope {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly officialRepositoryId: string;
  readonly observedRevision: string | null;
  readonly tokenizerLicenseClosureStatus: LocalModelGovernanceEvidenceClosureStatus;
  readonly acceptableUseClosureStatus: LocalModelGovernanceEvidenceClosureStatus;
  readonly derivedHostingClosureStatus: LocalModelGovernanceEvidenceClosureStatus;
  readonly quantizationClosureStatus: LocalModelGovernanceEvidenceClosureStatus;
  readonly evidenceClosureRevision: number;
  readonly governanceDecisionPolicyRevision: number;
}

export interface LocalModelHumanGovernanceDecisionInput {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly closureRecord: LocalModelGovernanceEvidenceClosureCandidateRecord | null;
  readonly scope: LocalModelHumanGovernanceDecisionScope;
  readonly decisions: readonly LocalModelHumanGovernanceDecisionItem[];
  readonly sessionPreviouslyInvalidated: boolean;
  readonly claimedModelApproved: boolean;
  readonly claimedLicenseApproved: boolean;
  readonly claimedArtifactSelected: boolean;
  readonly claimedArtifactApproved: boolean;
  readonly claimedChecksumPinned: boolean;
  readonly claimedChecksumVerified: boolean;
  readonly claimedBenchmarkVerified: boolean;
  readonly claimedDownloadable: boolean;
  readonly claimedRuntimeReady: boolean;
  readonly claimedModelActive: boolean;
}

export interface LocalModelHumanGovernanceDecisionInputValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
}

export interface LocalModelHumanGovernanceDecisionResult {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly status: LocalModelHumanGovernanceDecisionSessionStatus;
  readonly scope: LocalModelHumanGovernanceDecisionScope;
  readonly decisions: readonly LocalModelHumanGovernanceDecisionItem[];
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly totalDecisionItems: number;
  readonly recordedDecisionItems: number;
  readonly proceedDecisionItems: number;
  readonly rejectedDecisionItems: number;
  readonly moreEvidenceDecisionItems: number;
  readonly canRecordDecision: boolean;
  readonly allRequiredDecisionsRecorded: boolean;
  readonly decisionValidForCurrentScope: boolean;
  readonly canProceedToArtifactSelectionReview: boolean;
  readonly humanDecisionRecorded: boolean;
  readonly governanceDecisionBoundaryOnly: true;
  readonly modelApproved: false;
  readonly licenseApproved: false;
  readonly artifactSelected: false;
  readonly artifactApproved: false;
  readonly checksumPinned: false;
  readonly checksumVerified: false;
  readonly benchmarkVerified: false;
  readonly downloadable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
}
