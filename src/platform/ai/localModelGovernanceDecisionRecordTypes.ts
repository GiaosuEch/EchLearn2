import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';
import type {
  LocalModelGovernanceEvidenceClosureCandidateRecord,
  LocalModelGovernanceEvidenceClosureRequirementId,
  LocalModelGovernanceEvidenceClosureStatus,
} from './localModelGovernanceEvidenceClosureTypes.ts';

export type LocalModelGovernanceDecisionRecordDraftDecision =
  | 'not-recorded'
  | 'proceed'
  | 'reject'
  | 'request-more-evidence';

export type LocalModelGovernanceDecisionRecordFinalDecision =
  | 'proceed'
  | 'reject'
  | 'request-more-evidence';

export type LocalModelGovernanceDecisionRecordStatus =
  | 'unavailable'
  | 'awaiting-trusted-actor'
  | 'awaiting-explicit-decisions'
  | 'draft-valid'
  | 'finalized-proceed'
  | 'finalized-rejected'
  | 'finalized-more-evidence'
  | 'invalidated'
  | 'attention-required';

export type LocalModelGovernanceDecisionRecordOutcome =
  | 'proceed'
  | 'rejected'
  | 'more-evidence';

export type LocalModelTrustedGovernanceActorRole = 'model-governance-reviewer';
export type LocalModelTrustedGovernanceAuthorizationScope = 'record-model-governance-decision';
export type LocalModelTrustedGovernanceAuthenticationSource =
  | 'external-auth-boundary'
  | 'synthetic-test-fixture';

export interface LocalModelTrustedGovernanceActorContext {
  readonly actorSubjectId: string;
  readonly actorRole: LocalModelTrustedGovernanceActorRole;
  readonly authenticated: boolean;
  readonly authorizationVerified: boolean;
  readonly authorizationScope: LocalModelTrustedGovernanceAuthorizationScope;
  readonly authenticationSource: LocalModelTrustedGovernanceAuthenticationSource;
  readonly actorContextRevision: number;
}

export interface LocalModelGovernanceDecisionRecordScope {
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
  readonly recordRevision: number;
}

export interface LocalModelGovernanceDecisionRecordDraftItem {
  readonly requirementId: LocalModelGovernanceEvidenceClosureRequirementId;
  readonly evidenceClosureStatus: LocalModelGovernanceEvidenceClosureStatus;
  readonly decision: LocalModelGovernanceDecisionRecordDraftDecision;
  readonly explicitlyRecorded: boolean;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
}

export interface LocalModelGovernanceDecisionRecordFinalItem {
  readonly requirementId: LocalModelGovernanceEvidenceClosureRequirementId;
  readonly evidenceClosureStatus: LocalModelGovernanceEvidenceClosureStatus;
  readonly decision: LocalModelGovernanceDecisionRecordFinalDecision;
  readonly explicitlyRecorded: true;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
}

export type LocalModelGovernanceDecisionRecordClock = () => string;

export interface LocalModelGovernanceDecisionRecordDraftInput {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly closureRecord: LocalModelGovernanceEvidenceClosureCandidateRecord | null;
  readonly actorContext: LocalModelTrustedGovernanceActorContext | null;
  readonly decisions: readonly LocalModelGovernanceDecisionRecordDraftItem[];
  readonly currentScope: LocalModelGovernanceDecisionRecordScope;
  readonly recordRevision: number;
  readonly finalizeRequested: boolean;
  readonly previouslyInvalidated: boolean;
  readonly clock: LocalModelGovernanceDecisionRecordClock | null;
  readonly claimedPersisted: boolean;
  readonly claimedSigned: boolean;
  readonly claimedAppliedToArtifactSelection: boolean;
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

export interface LocalModelGovernanceDecisionRecordInputValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
  readonly scopeInvalid: boolean;
}

export interface LocalModelGovernanceDecisionRecord {
  readonly recordKey: string;
  readonly recordRevision: number;
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly scope: LocalModelGovernanceDecisionRecordScope;
  readonly decisions: readonly LocalModelGovernanceDecisionRecordFinalItem[];
  readonly actorSubjectId: string;
  readonly actorRole: LocalModelTrustedGovernanceActorRole;
  readonly reviewedAt: string;
  readonly outcome: LocalModelGovernanceDecisionRecordOutcome;
  readonly allDecisionsExplicit: true;
  readonly recordValidForCurrentScope: true;
  readonly eligibleForTrustedPersistence: true;
  readonly eligibleForArtifactSelectionRecordingReview: boolean;
  readonly decisionRecordOnly: true;
  readonly persisted: false;
  readonly signed: false;
  readonly appliedToArtifactSelection: false;
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

export interface LocalModelGovernanceDecisionRecordResult {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly status: LocalModelGovernanceDecisionRecordStatus;
  readonly scope: LocalModelGovernanceDecisionRecordScope;
  readonly actorContext: LocalModelTrustedGovernanceActorContext | null;
  readonly decisions: readonly LocalModelGovernanceDecisionRecordDraftItem[];
  readonly canonicalRecord: LocalModelGovernanceDecisionRecord | null;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly trustedActorContextValid: boolean;
  readonly recordedDecisionItems: number;
  readonly allDecisionsExplicit: boolean;
  readonly finalizeRequested: boolean;
  readonly recordValidForCurrentScope: boolean;
  readonly eligibleForTrustedPersistence: boolean;
  readonly eligibleForArtifactSelectionRecordingReview: boolean;
  readonly decisionRecordContractOnly: true;
  readonly persisted: false;
  readonly signed: false;
  readonly appliedToArtifactSelection: false;
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
