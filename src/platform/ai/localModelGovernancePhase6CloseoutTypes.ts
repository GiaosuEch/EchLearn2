export const LOCAL_MODEL_GOVERNANCE_PHASE_6_CLOSEOUT_POLICY_REVISION = 1;

export const LOCAL_MODEL_GOVERNANCE_PHASE_6_BOUNDARY_IDS = Object.freeze([
  'phase-6.1-canonical-decision-record',
  'phase-6.2-trusted-actor-context',
  'phase-6.3-governance-review-workspace',
  'phase-6.4-persistence-envelope-contract',
  'phase-6.5a-server-rbac',
  'phase-6.5-persistence-schema-rls',
  'phase-6.6-append-repository',
  'phase-6.7-persisted-record-verification',
  'phase-6.8-explicit-record-application',
] as const);

export type LocalModelGovernancePhase6BoundaryId =
  (typeof LOCAL_MODEL_GOVERNANCE_PHASE_6_BOUNDARY_IDS)[number];

export type LocalModelGovernancePhase6CloseoutStatus =
  | 'invalid-input'
  | 'phase-contract-incomplete'
  | 'server-authority-incomplete'
  | 'unsafe-automation-detected'
  | 'unsafe-production-claim-detected'
  | 'downstream-state-not-closed'
  | 'governance-phase-6-closed'
  | 'failed-safe';

export interface LocalModelGovernancePhase6BoundaryInventoryItem {
  readonly phaseId: LocalModelGovernancePhase6BoundaryId;
  readonly boundaryAuthored: boolean;
  readonly sourceContractPresent: boolean;
  readonly testsRegistered: boolean;
  readonly automaticActions: number;
  readonly productionAttempts: number;
  readonly downstreamMutations: number;
  readonly approvals: number;
  readonly activeModels: number;
}

export interface LocalModelGovernancePhase6CloseoutInput {
  readonly closeoutPolicyRevision: number;
  readonly boundaries: readonly LocalModelGovernancePhase6BoundaryInventoryItem[];
  readonly serverAuthoritativeRbac: boolean;
  readonly forcedRls: boolean;
  readonly appendOnlyPersistence: boolean;
  readonly exactPersistenceEnvelopeRequired: boolean;
  readonly clientRoleTrusted: boolean;
  readonly genericAdminBypassAllowed: boolean;
  readonly serviceCredentialPresent: boolean;
  readonly automaticWrites: number;
  readonly automaticReads: number;
  readonly automaticApplications: number;
  readonly productionPersistenceAttempts: number;
  readonly productionVerificationAttempts: number;
  readonly productionApplicationAttempts: number;
  readonly appClaimedPersistedRecords: number;
  readonly appClaimedVerifiedRecords: number;
  readonly persistedApplicationDecisions: number;
  readonly recordsAppliedDownstream: number;
  readonly artifactSelectionReviewsEligible: number;
  readonly selectedArtifacts: number;
  readonly approvedArtifacts: number;
  readonly approvedModels: number;
  readonly approvedLicenses: number;
  readonly checksumsVerified: number;
  readonly benchmarksPassed: number;
  readonly downloadableArtifacts: number;
  readonly runtimeReadyArtifacts: number;
  readonly activeModels: number;
}

export interface LocalModelGovernancePhase6CloseoutResult {
  readonly status: LocalModelGovernancePhase6CloseoutStatus;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly closeoutPolicyRevision: number;
  readonly boundaryCount: number;
  readonly completedBoundaryCount: number;
  readonly allBoundariesAuthored: boolean;
  readonly allSourceContractsPresent: boolean;
  readonly allTestsRegistered: boolean;
  readonly serverAuthorityVerifiedByContract: boolean;
  readonly automationClosed: boolean;
  readonly productionClaimsClosed: boolean;
  readonly downstreamStateClosed: boolean;
  readonly phase6Closed: boolean;
  readonly phase7DesignEntryEligible: boolean;
  readonly productionGovernanceFlowExecuted: false;
  readonly productionRecordPersisted: false;
  readonly productionRecordVerified: false;
  readonly productionApplicationDecisionPersisted: false;
  readonly productionRecordAppliedDownstream: false;
  readonly artifactSelected: false;
  readonly artifactApproved: false;
  readonly modelApproved: false;
  readonly licenseApproved: false;
  readonly checksumVerified: false;
  readonly benchmarkVerified: false;
  readonly downloadable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
}
