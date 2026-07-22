export interface LocalModelGovernanceApplicationArtifactSelectionBridgeViewModel {
  readonly heading: string;
  readonly phaseSummary: string;
  readonly readBoundarySummary: string;
  readonly rlsSummary: string;
  readonly verificationSummary: string;
  readonly bridgeSummary: string;
  readonly staleScopeSummary: string;
  readonly productionStateSummary: string;
  readonly downstreamSummary: string;
  readonly documentPath: string;
  readonly aggregate: {
    readonly totalCandidates: 3;
    readonly persistedApplicationVerificationBoundaryAuthored: true;
    readonly artifactSelectionReviewBridgeAuthored: true;
    readonly automaticReads: 0;
    readonly automaticBridges: 0;
    readonly explicitProductionReadAttempts: 0;
    readonly explicitProductionBridgeAttempts: 0;
    readonly productionReadInvocations: 0;
    readonly verifiedApplicationRecords: 0;
    readonly eligibleBridgeDecisions: 0;
    readonly replayedBridgeDecisions: 0;
    readonly staleApplicationRecords: 0;
    readonly persistedBridgeDecisions: 0;
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
  readonly productionReadAttempts: 0;
  readonly productionBridgeAttempts: 0;
  readonly verifiedProductionApplicationRecords: 0;
  readonly eligibleProductionBridgeDecisions: 0;
  readonly selectedArtifacts: 0;
  readonly activeModels: 0;
}

export function buildLocalModelGovernanceApplicationArtifactSelectionBridgeViewModel():
LocalModelGovernanceApplicationArtifactSelectionBridgeViewModel {
  return {
    heading: 'Phase 7.2 Verified Governance Application Record to Artifact Selection Review Bridge',
    phaseSummary: 'The persisted Phase 7.1 application record can be read through a narrow RLS-respecting boundary.',
    readBoundarySummary: 'Verification requires a literal explicit action and never runs automatically.',
    rlsSummary: 'Zero visible rows mean not found or not visible because forced RLS remains authoritative.',
    verificationSummary: 'The exact application envelope and immutable database fields are revalidated without exposing raw records.',
    bridgeSummary: 'A separate explicit bridge action is required. Eligibility only permits a later artifact-selection review.',
    staleScopeSummary: 'Stale candidate or revision scope is blocked before review eligibility.',
    productionStateSummary: 'No production application record has been read or verified by this boundary.',
    downstreamSummary: 'No bridge decision has been persisted. No application record has been applied downstream. No artifact is selected or approved. No model is active.',
    documentPath: 'docs/ai/phase-7-verified-governance-application-artifact-selection-bridge.md',
    aggregate: {
      totalCandidates: 3,
      persistedApplicationVerificationBoundaryAuthored: true,
      artifactSelectionReviewBridgeAuthored: true,
      automaticReads: 0,
      automaticBridges: 0,
      explicitProductionReadAttempts: 0,
      explicitProductionBridgeAttempts: 0,
      productionReadInvocations: 0,
      verifiedApplicationRecords: 0,
      eligibleBridgeDecisions: 0,
      replayedBridgeDecisions: 0,
      staleApplicationRecords: 0,
      persistedBridgeDecisions: 0,
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
      'production-application-record-verification-not-requested',
      'production-artifact-selection-review-bridge-not-requested',
    ]),
    warnings: Object.freeze([
      'forced-rls-zero-row-ambiguity-remains',
      'no-production-application-record-verified',
      'no-artifact-selected',
      'no-model-active',
    ]),
    productionReadAttempts: 0,
    productionBridgeAttempts: 0,
    verifiedProductionApplicationRecords: 0,
    eligibleProductionBridgeDecisions: 0,
    selectedArtifacts: 0,
    activeModels: 0,
  };
}
