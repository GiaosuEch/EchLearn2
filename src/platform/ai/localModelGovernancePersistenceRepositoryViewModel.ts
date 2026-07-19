export interface LocalModelGovernancePersistenceRepositoryViewModel {
  readonly heading: string;
  readonly phaseSummary: string;
  readonly rpcSummary: string;
  readonly actionGateSummary: string;
  readonly validationSummary: string;
  readonly authorizationSummary: string;
  readonly productionStateSummary: string;
  readonly documentPath: string;
  readonly aggregate: {
    readonly totalCandidates: 3;
    readonly repositoryBoundaryAuthored: true;
    readonly productionRpcClientConnected: false;
    readonly automaticRpcCalls: 0;
    readonly explicitPersistenceAttempts: 0;
    readonly rpcInvocations: 0;
    readonly insertedRecordsAcknowledged: 0;
    readonly identicalExistingRecordsAcknowledged: 0;
    readonly persistenceFailures: 0;
    readonly recordsAppliedDownstream: 0;
    readonly approvedModels: 0;
    readonly approvedLicenses: 0;
    readonly selectedArtifacts: 0;
    readonly approvedArtifacts: 0;
    readonly checksumsVerified: 0;
    readonly benchmarksPassed: 0;
    readonly downloadableArtifacts: 0;
    readonly runtimeReadyArtifacts: 0;
    readonly activeModels: 0;
  };
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly repositoryBoundaryOnly: true;
  readonly productionRpcClientConnected: false;
  readonly persistenceAttempts: 0;
  readonly persistedRecords: 0;
  readonly activeModels: 0;
}

export function buildLocalModelGovernancePersistenceRepositoryViewModel():
LocalModelGovernancePersistenceRepositoryViewModel {
  return {
    heading: 'Phase 6.6 Typed Governance Persistence Repository and RPC Client Boundary',
    phaseSummary: 'Typed repository boundary is authored; the Phase 6.5 append RPC remains server-authoritative.',
    rpcSummary: 'The repository uses the exact append RPC and only the p_envelope argument.',
    actionGateSummary: 'RPC is not called automatically; a literal explicit action is required.',
    validationSummary: 'The exact Phase 6.4 envelope is required before an RPC attempt can occur.',
    authorizationSummary: 'Actor authorization remains derived by the database. No actor, role or permission is sent as a separate RPC argument.',
    productionStateSummary: 'No production persistence attempt has occurred. No governance record is claimed persisted by the app. No persisted record has been applied downstream. No model is active.',
    documentPath: 'docs/ai/phase-6-governance-persistence-repository-client-boundary.md',
    aggregate: {
      totalCandidates: 3,
      repositoryBoundaryAuthored: true,
      productionRpcClientConnected: false,
      automaticRpcCalls: 0,
      explicitPersistenceAttempts: 0,
      rpcInvocations: 0,
      insertedRecordsAcknowledged: 0,
      identicalExistingRecordsAcknowledged: 0,
      persistenceFailures: 0,
      recordsAppliedDownstream: 0,
      approvedModels: 0,
      approvedLicenses: 0,
      selectedArtifacts: 0,
      approvedArtifacts: 0,
      checksumsVerified: 0,
      benchmarksPassed: 0,
      downloadableArtifacts: 0,
      runtimeReadyArtifacts: 0,
      activeModels: 0,
    },
    blockers: Object.freeze([
      'production-governance-persistence-client-not-connected',
      'explicit-production-persistence-action-not-requested',
    ]),
    warnings: Object.freeze([
      'no-app-acknowledged-governance-record',
      'no-downstream-record-application',
    ]),
    repositoryBoundaryOnly: true,
    productionRpcClientConnected: false,
    persistenceAttempts: 0,
    persistedRecords: 0,
    activeModels: 0,
  };
}
