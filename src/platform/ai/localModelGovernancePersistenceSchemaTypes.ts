export type LocalModelGovernancePersistenceSchemaStatus =
  | 'migration-authored-not-applied'
  | 'local-database-verified'
  | 'attention-required';

export const LOCAL_MODEL_GOVERNANCE_PERSISTENCE_SCHEMA_MIGRATION_PATH =
  'supabase/migrations/20260714_create_local_model_governance_records.sql' as const;

export const LOCAL_MODEL_GOVERNANCE_PERSISTENCE_TABLE_NAME =
  'public.local_model_governance_records' as const;

export const LOCAL_MODEL_GOVERNANCE_PERSISTENCE_APPEND_RPC_NAME =
  'public.append_local_model_governance_record' as const;

export interface LocalModelGovernancePersistenceSchemaState {
  readonly status: LocalModelGovernancePersistenceSchemaStatus;
  readonly prerequisiteRbacRuntimeVerifiedLocally: boolean;
  readonly migrationAuthored: boolean;
  readonly migrationAppliedByApplication: boolean;
  readonly localDatabaseVerified: boolean;
  readonly remoteDatabaseApplied: boolean;
  readonly rlsAuthored: boolean;
  readonly appendRpcAuthored: boolean;
  readonly immutableTriggerAuthored: boolean;
  readonly repositoryConfigured: boolean;
  readonly applicationPersistenceAttempts: number;
  readonly applicationRepositoryWrites: number;
  readonly applicationPersistedRecords: number;
  readonly recordsAppliedDownstream: number;
  readonly approvedModels: number;
  readonly approvedArtifacts: number;
  readonly downloadableArtifacts: number;
  readonly runtimeReadyArtifacts: number;
  readonly modelActive: boolean;
}

export const LOCAL_MODEL_GOVERNANCE_PERSISTENCE_SCHEMA_STATE:
LocalModelGovernancePersistenceSchemaState = Object.freeze({
  status: 'migration-authored-not-applied',
  prerequisiteRbacRuntimeVerifiedLocally: true,
  migrationAuthored: true,
  migrationAppliedByApplication: false,
  localDatabaseVerified: false,
  remoteDatabaseApplied: false,
  rlsAuthored: true,
  appendRpcAuthored: true,
  immutableTriggerAuthored: true,
  repositoryConfigured: false,
  applicationPersistenceAttempts: 0,
  applicationRepositoryWrites: 0,
  applicationPersistedRecords: 0,
  recordsAppliedDownstream: 0,
  approvedModels: 0,
  approvedArtifacts: 0,
  downloadableArtifacts: 0,
  runtimeReadyArtifacts: 0,
  modelActive: false,
});
