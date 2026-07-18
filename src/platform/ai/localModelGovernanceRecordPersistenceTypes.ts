import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';
import type {
  LocalModelGovernanceDecisionRecord,
  LocalModelGovernanceDecisionRecordFinalItem,
} from './localModelGovernanceDecisionRecordTypes.ts';
import type { LocalModelGovernanceReviewWorkspaceResult } from './localModelGovernanceReviewWorkspaceTypes.ts';

export type LocalModelGovernanceRecordPersistenceStatus =
  | 'unavailable'
  | 'awaiting-finalized-record'
  | 'persistence-request-ready'
  | 'invalidated'
  | 'attention-required';

export type LocalModelGovernanceRecordPersistenceOperation = 'append';

export interface LocalModelGovernanceRecordPersistenceDuplicatePolicy {
  readonly identical: 'idempotent-if-identical';
  readonly conflicting: 'reject-if-conflicting';
}

export type LocalModelGovernanceRecordPersistenceDuplicateState =
  | 'unchecked'
  | 'no-existing-envelope'
  | 'identical-existing-envelope'
  | 'conflicting-existing-envelope';

export type LocalModelGovernanceRecordPersistenceCanonicalOutcome =
  | 'finalized-proceed'
  | 'finalized-rejected'
  | 'finalized-more-evidence';

export interface LocalModelGovernanceRecordPersistenceScopeDecision {
  readonly requirementId: LocalModelGovernanceDecisionRecordFinalItem['requirementId'];
  readonly evidenceClosureStatus: LocalModelGovernanceDecisionRecordFinalItem['evidenceClosureStatus'];
  readonly decision: LocalModelGovernanceDecisionRecordFinalItem['decision'];
  readonly explicitlyRecorded: true;
}

export interface LocalModelGovernanceRecordPersistenceScope {
  readonly recordKey: string;
  readonly recordRevision: number;
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly officialRepositoryId: string;
  readonly observedRevision: string | null;
  readonly evidenceClosureRevision: number;
  readonly governanceDecisionPolicyRevision: number;
  readonly governanceDecisionRecordPolicyRevision: number;
  readonly persistenceSchemaRevision: number;
  readonly persistencePolicyRevision: number;
  readonly canonicalOutcome: LocalModelGovernanceRecordPersistenceCanonicalOutcome;
  readonly reviewedAt: string;
  readonly actorRole: LocalModelGovernanceDecisionRecord['actorRole'];
  readonly authorizationScope: 'record-model-governance-decision';
  readonly actorSubjectId: string;
  readonly decisions: readonly LocalModelGovernanceRecordPersistenceScopeDecision[];
}

export interface LocalModelGovernanceRecordPersistenceEnvelope {
  readonly persistenceKey: string;
  readonly idempotencyKey: string;
  readonly schemaRevision: number;
  readonly policyRevision: number;
  readonly operation: LocalModelGovernanceRecordPersistenceOperation;
  readonly duplicatePolicy: LocalModelGovernanceRecordPersistenceDuplicatePolicy;
  readonly canonicalRecord: LocalModelGovernanceDecisionRecord;
  readonly canonicalRecordKey: string;
  readonly canonicalRecordRevision: number;
  readonly canonicalOutcome: LocalModelGovernanceRecordPersistenceCanonicalOutcome;
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly createdFromReviewedAt: string;
  readonly immutable: true;
  readonly appendOnly: true;
  readonly updateAllowed: false;
  readonly deleteAllowed: false;
  readonly clientDeleteAllowed: false;
  readonly clientOverwriteAllowed: false;
  readonly persistenceBoundaryOnly: true;
}

export interface LocalModelGovernanceRecordPersistenceInput {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly workspaceResult: LocalModelGovernanceReviewWorkspaceResult;
  readonly finalizedRecord: LocalModelGovernanceDecisionRecord | null;
  readonly currentRecordScope: LocalModelGovernanceRecordPersistenceScope | null;
  readonly previousPersistenceScope: LocalModelGovernanceRecordPersistenceScope | null;
  readonly previousEnvelope: LocalModelGovernanceRecordPersistenceEnvelope | null;
  readonly previouslyInvalidated: boolean;
  readonly schemaRevision: number;
  readonly policyRevision: number;
  readonly requestedOperation: LocalModelGovernanceRecordPersistenceOperation;
  readonly claimedPersistenceAttempted: boolean;
  readonly claimedRepositoryWritePerformed: boolean;
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

export interface LocalModelGovernanceRecordPersistenceValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
  readonly scopeInvalid: boolean;
}

export interface LocalModelGovernanceRecordPersistenceEnvelopeValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
}

export interface LocalModelGovernanceRecordPersistenceComparison {
  readonly duplicateState: LocalModelGovernanceRecordPersistenceDuplicateState;
  readonly conflictDetected: boolean;
}

export interface LocalModelGovernanceRecordPersistenceResult {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly status: LocalModelGovernanceRecordPersistenceStatus;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly finalizedRecordPresent: boolean;
  readonly canonicalRecordValid: boolean;
  readonly recordValidForCurrentScope: boolean;
  readonly persistenceEnvelope: LocalModelGovernanceRecordPersistenceEnvelope | null;
  readonly persistenceRequestReady: boolean;
  readonly duplicateState: LocalModelGovernanceRecordPersistenceDuplicateState;
  readonly conflictDetected: boolean;
  readonly canProceedToRepositoryHandoffReview: boolean;
  readonly persistenceBoundaryOnly: true;
  readonly persistenceAttempted: false;
  readonly repositoryWritePerformed: false;
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
