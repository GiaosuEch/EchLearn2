import type {
  LocalModelGovernanceApplicationRecordPersistenceEnvelope,
} from './localModelGovernanceApplicationRecordPersistenceTypes.ts';

export const LOCAL_MODEL_GOVERNANCE_APPLICATION_ARTIFACT_SELECTION_BRIDGE_POLICY_REVISION = 1;
export const LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_TABLE =
  'local_model_governance_application_records' as const;

export type LocalModelGovernanceApplicationRecordVerificationRepositoryAvailability =
  | 'unavailable'
  | 'available';

export type LocalModelGovernanceApplicationRecordVerificationStatus =
  | 'not-requested'
  | 'invalid-expected-envelope'
  | 'repository-unavailable'
  | 'verified'
  | 'not-found-or-not-visible'
  | 'authentication-required'
  | 'authorization-required'
  | 'transport-unavailable'
  | 'malformed-response'
  | 'malformed-record'
  | 'verification-mismatch'
  | 'failed-safe';

export type LocalModelGovernanceApplicationArtifactSelectionBridgeStatus =
  | 'not-requested'
  | 'invalid-expected-envelope'
  | 'verification-not-verified'
  | 'verification-incomplete'
  | 'stale-application-record'
  | 'candidate-scope-mismatch'
  | 'revision-mismatch'
  | 'previous-decision-conflict'
  | 'eligible-for-artifact-selection-review'
  | 'failed-safe';

export type LocalModelGovernanceApplicationRecordSelectColumns =
  'id,application_decision_key,application_idempotency_key,schema_revision,application_policy_revision,source_governance_persistence_key,canonical_record_key,canonical_record_revision,canonical_outcome,candidate_id,candidate_tier,observed_revision,application_status,artifact_selection_review_eligible,application_actor_user_id,application_envelope,created_at';

export interface LocalModelGovernanceApplicationRecordReadResponse {
  readonly data: unknown;
  readonly error: unknown;
}

export interface LocalModelGovernanceApplicationRecordLimitBuilder extends
  PromiseLike<LocalModelGovernanceApplicationRecordReadResponse> {}

export interface LocalModelGovernanceApplicationRecordFilterBuilder {
  limit(limit: 2): LocalModelGovernanceApplicationRecordLimitBuilder;
}

export interface LocalModelGovernanceApplicationRecordSelectBuilder {
  eq(
    column: 'application_decision_key',
    value: string,
  ): LocalModelGovernanceApplicationRecordFilterBuilder;
}

export interface LocalModelGovernanceApplicationRecordFromBuilder {
  select(
    columns: LocalModelGovernanceApplicationRecordSelectColumns,
  ): LocalModelGovernanceApplicationRecordSelectBuilder;
}

export interface LocalModelGovernanceApplicationRecordReadClient {
  from(
    relation: typeof LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_TABLE,
  ): LocalModelGovernanceApplicationRecordFromBuilder;
}

export interface LocalModelGovernanceApplicationRecordVerificationRequest {
  readonly expectedApplicationEnvelope: LocalModelGovernanceApplicationRecordPersistenceEnvelope;
  readonly explicitVerificationRequested: boolean;
}

export interface LocalModelGovernanceApplicationRecordVerificationResult {
  readonly status: LocalModelGovernanceApplicationRecordVerificationStatus;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly explicitVerificationRequested: boolean;
  readonly expectedEnvelopeValid: boolean;
  readonly repositoryAvailable: boolean;
  readonly readAttempted: boolean;
  readonly readInvocationCount: 0 | 1;
  readonly recordVisible: boolean;
  readonly recordVerified: boolean;
  readonly recordId: string | null;
  readonly applicationDecisionKey: string | null;
  readonly applicationIdempotencyKey: string | null;
  readonly sourceGovernancePersistenceKey: string | null;
  readonly canonicalRecordKey: string | null;
  readonly canonicalRecordRevision: number | null;
  readonly canonicalOutcome: LocalModelGovernanceApplicationRecordPersistenceEnvelope['canonicalOutcome'] | null;
  readonly candidateId: string | null;
  readonly candidateTier: LocalModelGovernanceApplicationRecordPersistenceEnvelope['candidateTier'] | null;
  readonly observedRevision: string | null;
  readonly schemaRevision: number | null;
  readonly applicationPolicyRevision: number | null;
  readonly applicationStatus: LocalModelGovernanceApplicationRecordPersistenceEnvelope['applicationStatus'] | null;
  readonly artifactSelectionReviewEligible: boolean;
  readonly envelopeMatched: boolean;
  readonly immutableFieldsMatched: boolean;
  readonly actorColumnValid: boolean;
  readonly createdAtValid: boolean;
  readonly rawRowExposed: false;
  readonly rawErrorExposed: false;
  readonly applicationRecordAppliedDownstream: false;
  readonly bridgeDecisionPersisted: false;
  readonly artifactSelected: false;
  readonly artifactApproved: false;
  readonly modelApproved: false;
  readonly licenseApproved: false;
  readonly checksumVerified: false;
  readonly benchmarkVerified: false;
  readonly downloadable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
}

export interface LocalModelGovernanceApplicationRecordVerificationRepository {
  readonly availability: LocalModelGovernanceApplicationRecordVerificationRepositoryAvailability;
  verify(
    request: LocalModelGovernanceApplicationRecordVerificationRequest,
  ): Promise<LocalModelGovernanceApplicationRecordVerificationResult>;
}

export interface LocalModelGovernanceApplicationArtifactSelectionBridgeScope {
  readonly candidateId: string;
  readonly candidateTier: LocalModelGovernanceApplicationRecordPersistenceEnvelope['candidateTier'];
  readonly observedRevision: string;
  readonly sourceGovernancePersistenceKey: string;
  readonly canonicalRecordKey: string;
  readonly canonicalRecordRevision: number;
  readonly canonicalOutcome: LocalModelGovernanceApplicationRecordPersistenceEnvelope['canonicalOutcome'];
  readonly applicationDecisionKey: string;
  readonly applicationIdempotencyKey: string;
  readonly applicationRecordSchemaRevision: number;
  readonly applicationPolicyRevision: number;
  readonly artifactSelectionBridgePolicyRevision: number;
}

export interface LocalModelGovernanceApplicationArtifactSelectionBridgeRequest {
  readonly expectedApplicationEnvelope: LocalModelGovernanceApplicationRecordPersistenceEnvelope;
  readonly verificationResult: LocalModelGovernanceApplicationRecordVerificationResult;
  readonly currentScope: LocalModelGovernanceApplicationArtifactSelectionBridgeScope;
  readonly explicitBridgeRequested: boolean;
  readonly previousBridgeDecision: LocalModelGovernanceApplicationArtifactSelectionBridgeDecision | null;
}

export interface LocalModelGovernanceApplicationArtifactSelectionBridgeDecision {
  readonly status: LocalModelGovernanceApplicationArtifactSelectionBridgeStatus;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly explicitBridgeRequested: boolean;
  readonly expectedEnvelopeValid: boolean;
  readonly verificationAccepted: boolean;
  readonly verificationCurrent: boolean;
  readonly bridgeEligible: boolean;
  readonly bridgeDecisionKey: string | null;
  readonly previousDecisionPresent: boolean;
  readonly replayDetected: boolean;
  readonly staleApplicationRecordDetected: boolean;
  readonly candidateScopeVerified: boolean;
  readonly revisionScopeVerified: boolean;
  readonly candidateId: string | null;
  readonly candidateTier: LocalModelGovernanceApplicationRecordPersistenceEnvelope['candidateTier'] | null;
  readonly observedRevision: string | null;
  readonly sourceGovernancePersistenceKey: string | null;
  readonly canonicalRecordKey: string | null;
  readonly canonicalRecordRevision: number | null;
  readonly canonicalOutcome: LocalModelGovernanceApplicationRecordPersistenceEnvelope['canonicalOutcome'] | null;
  readonly applicationDecisionKey: string | null;
  readonly applicationIdempotencyKey: string | null;
  readonly applicationRecordSchemaRevision: number | null;
  readonly applicationPolicyRevision: number | null;
  readonly artifactSelectionBridgePolicyRevision: number;
  readonly applicationRecordVerified: boolean;
  readonly artifactSelectionReviewEligible: boolean;
  readonly bridgeDecisionPersisted: false;
  readonly applicationRecordAppliedDownstream: false;
  readonly artifactSelected: false;
  readonly artifactApproved: false;
  readonly modelApproved: false;
  readonly licenseApproved: false;
  readonly checksumVerified: false;
  readonly benchmarkVerified: false;
  readonly downloadable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
}
