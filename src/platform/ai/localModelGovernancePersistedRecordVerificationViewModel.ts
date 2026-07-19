export interface LocalModelGovernancePersistedRecordVerificationViewModel {
  readonly heading: string;
  readonly phaseSummary: string;
  readonly rlsSummary: string;
  readonly actionGateSummary: string;
  readonly expectedEnvelopeSummary: string;
  readonly verificationSummary: string;
  readonly productionStateSummary: string;
  readonly documentPath: string;
  readonly aggregate: {
    readonly totalCandidates: 3;
    readonly verificationBoundaryAuthored: true;
    readonly productionReadClientConnected: false;
    readonly automaticReadCalls: 0;
    readonly explicitVerificationAttempts: 0;
    readonly readInvocations: 0;
    readonly visibleRecords: 0;
    readonly verifiedRecords: 0;
    readonly notFoundOrNotVisibleResults: 0;
    readonly malformedRecords: 0;
    readonly verificationMismatches: 0;
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
  readonly verificationBoundaryOnly: true;
  readonly productionReadClientConnected: false;
  readonly verificationAttempts: 0;
  readonly verifiedRecords: 0;
  readonly activeModels: 0;
}

export function buildLocalModelGovernancePersistedRecordVerificationViewModel():
LocalModelGovernancePersistedRecordVerificationViewModel {
  return {
    heading: 'Phase 6.7 Persisted Governance Record Verification Boundary',
    phaseSummary: 'Persisted-record verification boundary is authored.',
    rlsSummary: 'Reads remain subject to Phase 6.5 forced RLS. Zero rows mean not found or not visible.',
    actionGateSummary: 'Only explicit verification requests may query.',
    expectedEnvelopeSummary: 'The Phase 6.4 expected envelope is required.',
    verificationSummary: 'Persisted rows are verified without exposing raw records.',
    productionStateSummary: 'No production read attempt has occurred. No persisted record is claimed verified by the app. No verified record has been applied downstream. No model is active.',
    documentPath: 'docs/ai/phase-6-persisted-governance-record-verification-boundary.md',
    aggregate: {
      totalCandidates: 3,
      verificationBoundaryAuthored: true,
      productionReadClientConnected: false,
      automaticReadCalls: 0,
      explicitVerificationAttempts: 0,
      readInvocations: 0,
      visibleRecords: 0,
      verifiedRecords: 0,
      notFoundOrNotVisibleResults: 0,
      malformedRecords: 0,
      verificationMismatches: 0,
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
      'production-governance-persisted-record-read-client-not-connected',
      'explicit-production-verification-action-not-requested',
    ]),
    warnings: Object.freeze([
      'no-app-visible-governance-record',
      'no-app-verified-governance-record',
      'no-downstream-record-application',
    ]),
    verificationBoundaryOnly: true,
    productionReadClientConnected: false,
    verificationAttempts: 0,
    verifiedRecords: 0,
    activeModels: 0,
  };
}
