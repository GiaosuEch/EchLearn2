export interface LocalModelGovernanceRecordApplicationViewModel {
  readonly heading: string;
  readonly phaseSummary: string;
  readonly verificationSummary: string;
  readonly actionGateSummary: string;
  readonly scopeSummary: string;
  readonly outcomeSummary: string;
  readonly eligibilitySummary: string;
  readonly productionStateSummary: string;
  readonly documentPath: string;
  readonly aggregate: {
    readonly totalCandidates: 3;
    readonly applicationBoundaryAuthored: true;
    readonly automaticApplications: 0;
    readonly explicitProductionApplicationAttempts: 0;
    readonly acceptedVerifications: 0;
    readonly eligibleApplicationDecisions: 0;
    readonly replayedApplicationDecisions: 0;
    readonly staleVerifications: 0;
    readonly rejectedOutcomes: 0;
    readonly moreEvidenceOutcomes: 0;
    readonly persistedApplicationRecords: 0;
    readonly recordsAppliedDownstream: 0;
    readonly artifactSelectionReviewsEligible: 0;
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
  readonly applicationBoundaryOnly: true;
  readonly applicationAttempts: 0;
  readonly persistedApplicationRecords: 0;
  readonly activeModels: 0;
}

export function buildLocalModelGovernanceRecordApplicationViewModel():
LocalModelGovernanceRecordApplicationViewModel {
  return {
    heading: 'Phase 6.8 Explicit Persisted Governance Record Application Boundary',
    phaseSummary: 'Explicit application boundary is authored.',
    verificationSummary: 'Only a fully verified Phase 6.7 result may enter evaluation.',
    actionGateSummary: 'Application requires a literal explicit human action.',
    scopeSummary: 'Verification and candidate scope are revalidated before eligibility.',
    outcomeSummary: 'Rejected and more-evidence outcomes remain blocked.',
    eligibilitySummary: 'Eligible means downstream review may begin; no artifact is selected.',
    productionStateSummary: 'No application decision has been persisted. No production application attempt has occurred. No governance record has been applied downstream. No model is active.',
    documentPath: 'docs/ai/phase-6-governance-record-application-boundary.md',
    aggregate: {
      totalCandidates: 3,
      applicationBoundaryAuthored: true,
      automaticApplications: 0,
      explicitProductionApplicationAttempts: 0,
      acceptedVerifications: 0,
      eligibleApplicationDecisions: 0,
      replayedApplicationDecisions: 0,
      staleVerifications: 0,
      rejectedOutcomes: 0,
      moreEvidenceOutcomes: 0,
      persistedApplicationRecords: 0,
      recordsAppliedDownstream: 0,
      artifactSelectionReviewsEligible: 0,
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
      'explicit-production-governance-application-action-not-requested',
      'production-governance-verification-not-supplied',
    ]),
    warnings: Object.freeze([
      'no-persisted-application-decision',
      'no-downstream-governance-record-application',
      'no-artifact-selection',
    ]),
    applicationBoundaryOnly: true,
    applicationAttempts: 0,
    persistedApplicationRecords: 0,
    activeModels: 0,
  };
}
