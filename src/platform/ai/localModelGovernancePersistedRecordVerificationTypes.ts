import type {
  LocalModelGovernanceRecordPersistenceEnvelope,
} from './localModelGovernanceRecordPersistenceTypes.ts';

export type LocalModelGovernancePersistedRecordVerificationRepositoryAvailability =
  | 'unavailable'
  | 'available';

export type LocalModelGovernancePersistedRecordVerificationAttemptStatus =
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

export type LocalModelGovernancePersistedRecordCanonicalOutcome =
  LocalModelGovernanceRecordPersistenceEnvelope['canonicalOutcome'];

export type LocalModelGovernancePersistedRecordSelectColumns =
  'id,persistence_key,idempotency_key,schema_revision,policy_revision,canonical_record_key,canonical_record_revision,canonical_outcome,candidate_id,candidate_tier,model_class,exact_model_name,official_repository_id,observed_revision,actor_user_id,reviewed_at,persistence_envelope';

export interface LocalModelGovernancePersistedRecordReadResponse {
  readonly data: unknown;
  readonly error: unknown;
}

export interface LocalModelGovernancePersistedRecordLimitBuilder extends
  PromiseLike<LocalModelGovernancePersistedRecordReadResponse> {}

export interface LocalModelGovernancePersistedRecordFilterBuilder {
  limit(limit: 2): LocalModelGovernancePersistedRecordLimitBuilder;
}

export interface LocalModelGovernancePersistedRecordSelectBuilder {
  eq(
    column: 'persistence_key',
    value: string,
  ): LocalModelGovernancePersistedRecordFilterBuilder;
}

export interface LocalModelGovernancePersistedRecordFromBuilder {
  select(
    columns: LocalModelGovernancePersistedRecordSelectColumns,
  ): LocalModelGovernancePersistedRecordSelectBuilder;
}

export interface LocalModelGovernancePersistedRecordReadClient {
  from(
    relation: 'local_model_governance_records',
  ): LocalModelGovernancePersistedRecordFromBuilder;
}

export interface LocalModelGovernancePersistedRecordVerificationRequest {
  readonly expectedEnvelope: LocalModelGovernanceRecordPersistenceEnvelope;
  readonly explicitActionRequested: boolean;
}

export interface LocalModelGovernancePersistedRecordVerificationResult {
  readonly status: LocalModelGovernancePersistedRecordVerificationAttemptStatus;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly explicitActionRequested: boolean;
  readonly expectedEnvelopeValid: boolean;
  readonly repositoryAvailable: boolean;
  readonly readAttempted: boolean;
  readonly readInvocationCount: 0 | 1;
  readonly tableName: 'local_model_governance_records';
  readonly queryColumn: 'persistence_key';
  readonly queriedPersistenceKey: string | null;
  readonly recordVisible: boolean;
  readonly recordVerified: boolean;
  readonly recordId: string | null;
  readonly persistenceKey: string | null;
  readonly canonicalRecordKey: string | null;
  readonly canonicalOutcome: LocalModelGovernancePersistedRecordCanonicalOutcome | null;
  readonly schemaRevision: number | null;
  readonly policyRevision: number | null;
  readonly envelopeMatched: boolean;
  readonly candidateScopeVerified: boolean;
  readonly modelIdentityVerified: boolean;
  readonly actorBindingVerified: boolean;
  readonly reviewedAtVerified: boolean;
  readonly rawRowExposed: false;
  readonly rawErrorExposed: false;
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

export interface LocalModelGovernancePersistedRecordVerificationRepository {
  readonly availability: LocalModelGovernancePersistedRecordVerificationRepositoryAvailability;
  verify(
    request: LocalModelGovernancePersistedRecordVerificationRequest,
  ): Promise<LocalModelGovernancePersistedRecordVerificationResult>;
}
