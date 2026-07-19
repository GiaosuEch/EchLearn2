import {
  buildLocalModelGovernancePhase6CloseoutInput,
  evaluateLocalModelGovernancePhase6Closeout,
} from './localModelGovernancePhase6CloseoutPolicy.ts';

export interface LocalModelGovernancePhase6CloseoutViewModel {
  readonly heading: string;
  readonly phaseSummary: string;
  readonly inventorySummary: string;
  readonly authoritySummary: string;
  readonly explicitFlowSummary: string;
  readonly productionStateSummary: string;
  readonly downstreamSummary: string;
  readonly phase7Summary: string;
  readonly documentPath: string;
  readonly aggregate: {
    readonly totalPhase6Boundaries: 9;
    readonly completedPhase6Boundaries: 9;
    readonly phase6Closed: true;
    readonly phase7DesignEntryEligible: true;
    readonly automaticWrites: 0;
    readonly automaticReads: 0;
    readonly automaticApplications: 0;
    readonly productionPersistenceAttempts: 0;
    readonly productionVerificationAttempts: 0;
    readonly productionApplicationAttempts: 0;
    readonly persistedGovernanceRecordsClaimed: 0;
    readonly verifiedGovernanceRecordsClaimed: 0;
    readonly persistedApplicationDecisions: 0;
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
  readonly phase6CloseoutOnly: true;
  readonly productionGovernanceAttempts: 0;
  readonly persistedApplicationDecisions: 0;
  readonly activeModels: 0;
}

export function buildLocalModelGovernancePhase6CloseoutViewModel():
LocalModelGovernancePhase6CloseoutViewModel {
  const closeout = evaluateLocalModelGovernancePhase6Closeout(
    buildLocalModelGovernancePhase6CloseoutInput(),
  );

  return {
    heading: 'Phase 6.9 Governance Persistence and Application Safety Closeout',
    phaseSummary: 'Phase 6 governance source contracts are closed.',
    inventorySummary: 'Nine Phase 6 boundaries are authored and regression-checked.',
    authoritySummary: 'Server-authoritative RBAC, forced RLS and append-only persistence remain required.',
    explicitFlowSummary: 'Persistence, verification and application remain explicit.',
    productionStateSummary: 'No production governance flow has executed. No application decision is persisted. No governance record is applied downstream.',
    downstreamSummary: 'No artifact is selected or approved. No model is active.',
    phase7Summary: 'Phase 7 may begin as a separate artifact-selection and execution program.',
    documentPath: 'docs/ai/phase-6-governance-persistence-application-safety-closeout.md',
    aggregate: {
      totalPhase6Boundaries: 9,
      completedPhase6Boundaries: 9,
      phase6Closed: true,
      phase7DesignEntryEligible: true,
      automaticWrites: 0,
      automaticReads: 0,
      automaticApplications: 0,
      productionPersistenceAttempts: 0,
      productionVerificationAttempts: 0,
      productionApplicationAttempts: 0,
      persistedGovernanceRecordsClaimed: 0,
      verifiedGovernanceRecordsClaimed: 0,
      persistedApplicationDecisions: 0,
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
    blockers: Object.freeze([]),
    warnings: closeout.warnings,
    phase6CloseoutOnly: true,
    productionGovernanceAttempts: 0,
    persistedApplicationDecisions: 0,
    activeModels: 0,
  };
}
