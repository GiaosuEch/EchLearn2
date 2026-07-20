export interface LocalModelGovernanceApplicationRecordPersistenceViewModel {
  readonly heading: string;
  readonly phaseSummary: string;
  readonly authorizationSummary: string;
  readonly actorSummary: string;
  readonly sourceBindingSummary: string;
  readonly immutabilitySummary: string;
  readonly productionStateSummary: string;
  readonly downstreamSummary: string;
  readonly documentPath: string;
  readonly migrationPath: string;
  readonly aggregate: {
    readonly totalCandidates: 3;
    readonly applicationPersistenceBoundaryAuthored: true;
    readonly existingReviewerRoleReused: true;
    readonly separateApplicationPermissionAuthored: true;
    readonly newRolesCreated: 0;
    readonly seededReviewerAssignments: 0;
    readonly seededApplicationRecords: 0;
    readonly automaticPersistenceAttempts: 0;
    readonly explicitProductionPersistenceAttempts: 0;
    readonly productionRpcInvocations: 0;
    readonly appAcknowledgedInsertedRecords: 0;
    readonly appAcknowledgedExistingRecords: 0;
    readonly persistedApplicationRecordsClaimed: 0;
    readonly recordsAppliedDownstream: 0;
    readonly artifactSelectionReviewsEligible: 0;
    readonly selectedArtifacts: 0;
    readonly approvedArtifacts: 0;
    readonly approvedModels: 0;
    readonly approvedLicenses: 0;
    readonly checksumsVerified: 0;
    readonly benchmarksPassed: 0;
    readonly downloadableArtifacts: 0;
    readonly runtimeReadyArtifacts: 0;
    readonly activeModels: 0;
  };
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly applicationPersistenceBoundaryOnly: true;
  readonly productionPersistenceAttempts: 0;
  readonly persistedApplicationRecords: 0;
  readonly activeModels: 0;
}

export function buildLocalModelGovernanceApplicationRecordPersistenceViewModel():
LocalModelGovernanceApplicationRecordPersistenceViewModel {
  return {
    heading: 'Phase 7.1 Authoritative Governance Application Record',
    phaseSummary: 'Authoritative application-record persistence contract is authored.',
    authorizationSummary: 'The existing model-governance-reviewer role receives a separate application-record permission.',
    actorSummary: 'Application actor identity remains server-derived.',
    sourceBindingSummary: 'Only eligible finalized-proceed application decisions may be appended. The source governance record is revalidated by the database.',
    immutabilitySummary: 'Application records are append-only and immutable.',
    productionStateSummary: 'No production application record has been persisted by the app.',
    downstreamSummary: 'No application record has been applied downstream. No artifact is selected. No model is active.',
    documentPath: 'docs/ai/phase-7-authoritative-governance-application-record.md',
    migrationPath: 'supabase/migrations/20260715_create_local_model_governance_application_records.sql',
    aggregate: {
      totalCandidates: 3,
      applicationPersistenceBoundaryAuthored: true,
      existingReviewerRoleReused: true,
      separateApplicationPermissionAuthored: true,
      newRolesCreated: 0,
      seededReviewerAssignments: 0,
      seededApplicationRecords: 0,
      automaticPersistenceAttempts: 0,
      explicitProductionPersistenceAttempts: 0,
      productionRpcInvocations: 0,
      appAcknowledgedInsertedRecords: 0,
      appAcknowledgedExistingRecords: 0,
      persistedApplicationRecordsClaimed: 0,
      recordsAppliedDownstream: 0,
      artifactSelectionReviewsEligible: 0,
      selectedArtifacts: 0,
      approvedArtifacts: 0,
      approvedModels: 0,
      approvedLicenses: 0,
      checksumsVerified: 0,
      benchmarksPassed: 0,
      downloadableArtifacts: 0,
      runtimeReadyArtifacts: 0,
      activeModels: 0,
    },
    blockers: Object.freeze([
      'production-application-persistence-not-requested',
      'artifact-selection-remains-separate',
    ]),
    warnings: Object.freeze([
      'migration-authored-not-remote-deployed',
      'no-production-application-record-persisted',
      'no-model-active',
    ]),
    applicationPersistenceBoundaryOnly: true,
    productionPersistenceAttempts: 0,
    persistedApplicationRecords: 0,
    activeModels: 0,
  };
}
