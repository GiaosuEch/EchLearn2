import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';
import type {
  LocalModelGovernanceEvidenceClosureCandidateRecord,
  LocalModelGovernanceEvidenceClosureRequirementId,
  LocalModelGovernanceEvidenceClosureStatus,
} from './localModelGovernanceEvidenceClosureTypes.ts';
import type {
  LocalModelGovernanceDecisionRecord,
  LocalModelGovernanceDecisionRecordClock,
  LocalModelGovernanceDecisionRecordDraftDecision,
} from './localModelGovernanceDecisionRecordTypes.ts';
import type {
  LocalModelTrustedActorAssertionScope,
  LocalModelTrustedActorContextAdapterResult,
} from './localModelTrustedActorContextAdapterTypes.ts';

export type LocalModelGovernanceReviewWorkspaceStatus =
  | 'unavailable'
  | 'locked-no-trusted-context'
  | 'ready-for-review'
  | 'draft-in-progress'
  | 'ready-to-finalize'
  | 'finalize-requested'
  | 'finalized-proceed'
  | 'finalized-rejected'
  | 'finalized-more-evidence'
  | 'invalidated'
  | 'attention-required';

export type LocalModelGovernanceReviewWorkspaceDecision =
  LocalModelGovernanceDecisionRecordDraftDecision;

export interface LocalModelGovernanceReviewWorkspaceRequirementState {
  readonly requirementId: LocalModelGovernanceEvidenceClosureRequirementId;
  readonly evidenceClosureStatus: LocalModelGovernanceEvidenceClosureStatus;
  readonly decision: LocalModelGovernanceReviewWorkspaceDecision;
  readonly explicitlyRecorded: boolean;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
}

export interface LocalModelGovernanceReviewWorkspaceScope {
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
  readonly governanceDecisionRecordPolicyRevision: number;
  readonly externalAuthAssertionRevision: number;
  readonly trustedActorContextRevision: number;
  readonly trustedActorAdapterPolicyRevision: number;
  readonly workspacePolicyRevision: number;
  readonly actorAssertionScope: LocalModelTrustedActorAssertionScope;
}

export interface LocalModelGovernanceReviewWorkspaceInput {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly closureRecord: LocalModelGovernanceEvidenceClosureCandidateRecord | null;
  readonly adapterResult: LocalModelTrustedActorContextAdapterResult;
  readonly actorAssertionScope: LocalModelTrustedActorAssertionScope | null;
  readonly requirements: readonly LocalModelGovernanceReviewWorkspaceRequirementState[];
  readonly status: LocalModelGovernanceReviewWorkspaceStatus;
  readonly reviewStarted: boolean;
  readonly finalizeRequested: boolean;
  readonly finalizedRecord: LocalModelGovernanceDecisionRecord | null;
  readonly currentScope: LocalModelGovernanceReviewWorkspaceScope | null;
  readonly previousScope: LocalModelGovernanceReviewWorkspaceScope | null;
  readonly previouslyInvalidated: boolean;
  readonly clock: LocalModelGovernanceDecisionRecordClock | null;
  readonly claimedDraftPersisted: boolean;
  readonly claimedRecordPersisted: boolean;
  readonly claimedRecordSigned: boolean;
  readonly claimedRecordAppliedDownstream: boolean;
  readonly claimedModelApproved: boolean;
  readonly claimedLicenseApproved: boolean;
  readonly claimedArtifactSelected: boolean;
  readonly claimedArtifactApproved: boolean;
  readonly claimedChecksumVerified: boolean;
  readonly claimedBenchmarkVerified: boolean;
  readonly claimedDownloadable: boolean;
  readonly claimedRuntimeReady: boolean;
  readonly claimedModelActive: boolean;
}

export type LocalModelGovernanceReviewWorkspaceEvent =
  | { readonly type: 'begin-review' }
  | {
    readonly type: 'set-decision';
    readonly requirementId: LocalModelGovernanceEvidenceClosureRequirementId;
    readonly decision: Exclude<LocalModelGovernanceReviewWorkspaceDecision, 'not-recorded'>;
  }
  | {
    readonly type: 'clear-decision';
    readonly requirementId: LocalModelGovernanceEvidenceClosureRequirementId;
  }
  | { readonly type: 'request-finalize' }
  | { readonly type: 'cancel-finalize' }
  | { readonly type: 'reset-draft' }
  | { readonly type: 'revalidate-scope' };

export interface LocalModelGovernanceReviewWorkspaceValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
  readonly scopeInvalid: boolean;
}

export interface LocalModelGovernanceReviewWorkspaceResult {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly status: LocalModelGovernanceReviewWorkspaceStatus;
  readonly requirements: readonly LocalModelGovernanceReviewWorkspaceRequirementState[];
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly trustedContextReady: boolean;
  readonly reviewStarted: boolean;
  readonly recordedDecisionCount: number;
  readonly allDecisionsExplicit: boolean;
  readonly finalizeRequested: boolean;
  readonly finalizedRecord: LocalModelGovernanceDecisionRecord | null;
  readonly workspaceValidForCurrentScope: boolean;
  readonly canBeginReview: boolean;
  readonly canEditDraft: boolean;
  readonly canRequestFinalize: boolean;
  readonly canFinalizeThroughDecisionRecordPolicy: boolean;
  readonly canonicalRecordFinalized: boolean;
  readonly canProceedToTrustedPersistenceReview: boolean;
  readonly canProceedToArtifactSelectionRecordingReview: boolean;
  readonly workspaceBoundaryOnly: true;
  readonly draftPersisted: false;
  readonly recordPersisted: false;
  readonly recordSigned: false;
  readonly recordAppliedDownstream: false;
  readonly modelApproved: false;
  readonly licenseApproved: false;
  readonly artifactSelected: false;
  readonly artifactApproved: false;
  readonly checksumVerified: false;
  readonly benchmarkVerified: false;
  readonly downloadable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
}
