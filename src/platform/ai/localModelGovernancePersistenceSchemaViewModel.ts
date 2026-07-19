import {
  LOCAL_MODEL_GOVERNANCE_PERSISTENCE_APPEND_RPC_NAME,
  LOCAL_MODEL_GOVERNANCE_PERSISTENCE_SCHEMA_MIGRATION_PATH,
  LOCAL_MODEL_GOVERNANCE_PERSISTENCE_SCHEMA_STATE,
  LOCAL_MODEL_GOVERNANCE_PERSISTENCE_TABLE_NAME,
  type LocalModelGovernancePersistenceSchemaStatus,
} from './localModelGovernancePersistenceSchemaTypes.ts';

export interface LocalModelGovernancePersistenceSchemaViewModel {
  readonly heading: string;
  readonly phaseSummary: string;
  readonly migrationSummary: string;
  readonly remoteDeploymentSummary: string;
  readonly authorizationSummary: string;
  readonly rlsSummary: string;
  readonly appendOnlySummary: string;
  readonly immutabilitySummary: string;
  readonly rpcSummary: string;
  readonly databaseVerificationSummary: string;
  readonly repositoryBoundarySummary: string;
  readonly productionStateSummary: string;
  readonly documentPath: string;
  readonly migrationPath: string;
  readonly status: LocalModelGovernancePersistenceSchemaStatus;
  readonly aggregate: {
    readonly totalCandidates: number;
    readonly migrationAuthored: number;
    readonly remoteMigrationsApplied: number;
    readonly repositoriesConfigured: number;
    readonly persistenceAttempts: number;
    readonly repositoryWrites: number;
    readonly persistedRecords: number;
    readonly recordsAppliedDownstream: number;
    readonly approvedModels: number;
    readonly approvedArtifacts: number;
    readonly downloadableArtifacts: number;
    readonly runtimeReadyArtifacts: number;
    readonly activeModels: number;
  };
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly schemaBoundaryOnly: true;
  readonly migrationAppliedByApplication: false;
  readonly remoteDatabaseApplied: false;
  readonly repositoryConfigured: false;
  readonly persistedRecords: 0;
  readonly activeModels: 0;
}

export function buildLocalModelGovernancePersistenceSchemaViewModel():
LocalModelGovernancePersistenceSchemaViewModel {
  const state = LOCAL_MODEL_GOVERNANCE_PERSISTENCE_SCHEMA_STATE;
  return {
    heading: 'Supabase Governance Persistence Schema & RLS',
    phaseSummary: 'Server-authoritative RBAC prerequisite was verified locally; this phase authors the governance persistence schema boundary.',
    migrationSummary: 'Governance record migration is authored but not applied by the app.',
    remoteDeploymentSummary: 'Remote migration deployment has not occurred.',
    authorizationSummary: 'Append and reviewer SELECT require the exact server-side governance authorization helper.',
    rlsSummary: `Forced RLS is authored for ${LOCAL_MODEL_GOVERNANCE_PERSISTENCE_TABLE_NAME}; direct client inserts are prohibited.`,
    appendOnlySummary: 'Append-only writes require exact server authorization and identical duplicates are idempotent.',
    immutabilitySummary: 'Update, delete, overwrite, and upsert are prohibited by privileges and an immutable trigger.',
    rpcSummary: `${LOCAL_MODEL_GOVERNANCE_PERSISTENCE_APPEND_RPC_NAME} is authored and is not called by application source.`,
    databaseVerificationSummary: 'The governance migration is not claimed active on a remote database by static application source.',
    repositoryBoundarySummary: 'No frontend persistence repository is configured.',
    productionStateSummary: 'No persistence attempt has occurred, no governance record is claimed persisted by the app, and no record has been applied downstream.',
    documentPath: 'docs/ai/phase-6-governance-persistence-schema-rls.md',
    migrationPath: LOCAL_MODEL_GOVERNANCE_PERSISTENCE_SCHEMA_MIGRATION_PATH,
    status: state.status,
    aggregate: {
      totalCandidates: 3,
      migrationAuthored: state.migrationAuthored ? 1 : 0,
      remoteMigrationsApplied: state.remoteDatabaseApplied ? 1 : 0,
      repositoriesConfigured: state.repositoryConfigured ? 1 : 0,
      persistenceAttempts: state.applicationPersistenceAttempts,
      repositoryWrites: state.applicationRepositoryWrites,
      persistedRecords: state.applicationPersistedRecords,
      recordsAppliedDownstream: state.recordsAppliedDownstream,
      approvedModels: state.approvedModels,
      approvedArtifacts: state.approvedArtifacts,
      downloadableArtifacts: state.downloadableArtifacts,
      runtimeReadyArtifacts: state.runtimeReadyArtifacts,
      activeModels: state.modelActive ? 1 : 0,
    },
    blockers: Object.freeze([
      'governance-migration-not-applied-by-application',
      'remote-governance-migration-not-applied',
      'frontend-persistence-repository-not-configured',
    ]),
    warnings: Object.freeze([
      'no-production-governance-record',
      'no-downstream-record-application',
    ]),
    schemaBoundaryOnly: true,
    migrationAppliedByApplication: false,
    remoteDatabaseApplied: false,
    repositoryConfigured: false,
    persistedRecords: 0,
    activeModels: 0,
  };
}
