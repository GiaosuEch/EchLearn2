import type {
  LocalModelGovernanceRecordPersistenceEnvelope,
} from './localModelGovernanceRecordPersistenceTypes.ts';

export type LocalModelGovernancePersistenceRepositoryAvailability =
  | 'unavailable'
  | 'available';

export type LocalModelGovernancePersistenceRepositoryAttemptStatus =
  | 'not-requested'
  | 'invalid-envelope'
  | 'repository-unavailable'
  | 'inserted'
  | 'identical-existing-envelope'
  | 'authentication-required'
  | 'authorization-required'
  | 'conflicting-duplicate'
  | 'database-validation-rejected'
  | 'transport-unavailable'
  | 'malformed-response'
  | 'failed-safe';

export interface LocalModelGovernancePersistenceRpcClient {
  rpc(
    functionName: string,
    args: Readonly<Record<string, unknown>>,
  ): PromiseLike<{
    readonly data: unknown;
    readonly error: unknown;
  }>;
}

export interface LocalModelGovernancePersistenceRepositoryRequest {
  readonly envelope: LocalModelGovernanceRecordPersistenceEnvelope;
  readonly explicitActionRequested: boolean;
}

export interface LocalModelGovernancePersistenceRepositoryResult {
  readonly status: LocalModelGovernancePersistenceRepositoryAttemptStatus;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly explicitActionRequested: boolean;
  readonly envelopeValid: boolean;
  readonly repositoryAvailable: boolean;
  readonly rpcAttempted: boolean;
  readonly rpcInvocationCount: 0 | 1;
  readonly rpcName: 'append_local_model_governance_record';
  readonly newRecordInserted: boolean;
  readonly existingRecordConfirmed: boolean;
  readonly persistenceAcknowledged: boolean;
  readonly recordId: string | null;
  readonly persistenceKey: string | null;
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

export interface LocalModelGovernancePersistenceRepository {
  readonly availability: LocalModelGovernancePersistenceRepositoryAvailability;
  append(
    request: LocalModelGovernancePersistenceRepositoryRequest,
  ): Promise<LocalModelGovernancePersistenceRepositoryResult>;
}
