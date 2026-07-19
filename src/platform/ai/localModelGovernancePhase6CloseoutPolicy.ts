import {
  LOCAL_MODEL_GOVERNANCE_PHASE_6_BOUNDARY_IDS,
  LOCAL_MODEL_GOVERNANCE_PHASE_6_CLOSEOUT_POLICY_REVISION,
} from './localModelGovernancePhase6CloseoutTypes.ts';
export {
  LOCAL_MODEL_GOVERNANCE_PHASE_6_BOUNDARY_IDS,
  LOCAL_MODEL_GOVERNANCE_PHASE_6_CLOSEOUT_POLICY_REVISION,
} from './localModelGovernancePhase6CloseoutTypes.ts';
import type {
  LocalModelGovernancePhase6BoundaryInventoryItem,
  LocalModelGovernancePhase6CloseoutInput,
  LocalModelGovernancePhase6CloseoutResult,
  LocalModelGovernancePhase6CloseoutStatus,
} from './localModelGovernancePhase6CloseoutTypes.ts';

const SUCCESS_WARNINGS = Object.freeze([
  'phase-7-requires-separate-authoritative-application-persistence',
  'phase-7-requires-separate-explicit-artifact-selection',
  'no-production-governance-flow-executed',
  'no-model-active',
]);

const GLOBAL_COUNTER_FIELDS = Object.freeze([
  'automaticWrites',
  'automaticReads',
  'automaticApplications',
  'productionPersistenceAttempts',
  'productionVerificationAttempts',
  'productionApplicationAttempts',
  'appClaimedPersistedRecords',
  'appClaimedVerifiedRecords',
  'persistedApplicationDecisions',
  'recordsAppliedDownstream',
  'artifactSelectionReviewsEligible',
  'selectedArtifacts',
  'approvedArtifacts',
  'approvedModels',
  'approvedLicenses',
  'checksumsVerified',
  'benchmarksPassed',
  'downloadableArtifacts',
  'runtimeReadyArtifacts',
  'activeModels',
] as const);

const REQUIRED_BOOLEAN_FIELDS = Object.freeze([
  'serverAuthoritativeRbac',
  'forcedRls',
  'appendOnlyPersistence',
  'exactPersistenceEnvelopeRequired',
  'clientRoleTrusted',
  'genericAdminBypassAllowed',
  'serviceCredentialPresent',
] as const);

const SAFE_PRODUCTION_FLAGS = Object.freeze({
  productionGovernanceFlowExecuted: false as const,
  productionRecordPersisted: false as const,
  productionRecordVerified: false as const,
  productionApplicationDecisionPersisted: false as const,
  productionRecordAppliedDownstream: false as const,
  artifactSelected: false as const,
  artifactApproved: false as const,
  modelApproved: false as const,
  licenseApproved: false as const,
  checksumVerified: false as const,
  benchmarkVerified: false as const,
  downloadable: false as const,
  runtimeReady: false as const,
  modelActive: false as const,
});

function unique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSafeCounter(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isBoundaryShape(value: unknown): value is LocalModelGovernancePhase6BoundaryInventoryItem {
  if (!isRecord(value) || typeof value.phaseId !== 'string') return false;
  if (typeof value.boundaryAuthored !== 'boolean'
    || typeof value.sourceContractPresent !== 'boolean'
    || typeof value.testsRegistered !== 'boolean') return false;
  return isSafeCounter(value.automaticActions)
    && isSafeCounter(value.productionAttempts)
    && isSafeCounter(value.downstreamMutations)
    && isSafeCounter(value.approvals)
    && isSafeCounter(value.activeModels);
}

function hasValidInputShape(value: unknown): value is LocalModelGovernancePhase6CloseoutInput {
  if (!isRecord(value) || !Array.isArray(value.boundaries)) return false;
  if (!Number.isSafeInteger(value.closeoutPolicyRevision)) return false;
  for (const field of REQUIRED_BOOLEAN_FIELDS) {
    if (typeof value[field] !== 'boolean') return false;
  }
  for (const field of GLOBAL_COUNTER_FIELDS) {
    if (!isSafeCounter(value[field])) return false;
  }
  return value.boundaries.every(isBoundaryShape);
}

interface ResultState {
  readonly status: LocalModelGovernancePhase6CloseoutStatus;
  readonly blockers?: readonly string[];
  readonly warnings?: readonly string[];
  readonly boundaryCount?: number;
  readonly completedBoundaryCount?: number;
  readonly allBoundariesAuthored?: boolean;
  readonly allSourceContractsPresent?: boolean;
  readonly allTestsRegistered?: boolean;
  readonly serverAuthorityVerifiedByContract?: boolean;
  readonly automationClosed?: boolean;
  readonly productionClaimsClosed?: boolean;
  readonly downstreamStateClosed?: boolean;
  readonly phase6Closed?: boolean;
  readonly phase7DesignEntryEligible?: boolean;
}

function result(state: ResultState): LocalModelGovernancePhase6CloseoutResult {
  return {
    status: state.status,
    blockers: unique(state.blockers ?? []),
    warnings: unique(state.warnings ?? []),
    closeoutPolicyRevision: LOCAL_MODEL_GOVERNANCE_PHASE_6_CLOSEOUT_POLICY_REVISION,
    boundaryCount: state.boundaryCount ?? 0,
    completedBoundaryCount: state.completedBoundaryCount ?? 0,
    allBoundariesAuthored: state.allBoundariesAuthored ?? false,
    allSourceContractsPresent: state.allSourceContractsPresent ?? false,
    allTestsRegistered: state.allTestsRegistered ?? false,
    serverAuthorityVerifiedByContract: state.serverAuthorityVerifiedByContract ?? false,
    automationClosed: state.automationClosed ?? false,
    productionClaimsClosed: state.productionClaimsClosed ?? false,
    downstreamStateClosed: state.downstreamStateClosed ?? false,
    phase6Closed: state.phase6Closed ?? false,
    phase7DesignEntryEligible: state.phase7DesignEntryEligible ?? false,
    ...SAFE_PRODUCTION_FLAGS,
  };
}

export function buildLocalModelGovernancePhase6BoundaryInventory():
readonly LocalModelGovernancePhase6BoundaryInventoryItem[] {
  return Object.freeze(LOCAL_MODEL_GOVERNANCE_PHASE_6_BOUNDARY_IDS.map((phaseId) => Object.freeze({
    phaseId,
    boundaryAuthored: true,
    sourceContractPresent: true,
    testsRegistered: true,
    automaticActions: 0,
    productionAttempts: 0,
    downstreamMutations: 0,
    approvals: 0,
    activeModels: 0,
  })));
}

export function buildLocalModelGovernancePhase6CloseoutInput():
LocalModelGovernancePhase6CloseoutInput {
  return Object.freeze({
    closeoutPolicyRevision: LOCAL_MODEL_GOVERNANCE_PHASE_6_CLOSEOUT_POLICY_REVISION,
    boundaries: buildLocalModelGovernancePhase6BoundaryInventory(),
    serverAuthoritativeRbac: true,
    forcedRls: true,
    appendOnlyPersistence: true,
    exactPersistenceEnvelopeRequired: true,
    clientRoleTrusted: false,
    genericAdminBypassAllowed: false,
    serviceCredentialPresent: false,
    automaticWrites: 0,
    automaticReads: 0,
    automaticApplications: 0,
    productionPersistenceAttempts: 0,
    productionVerificationAttempts: 0,
    productionApplicationAttempts: 0,
    appClaimedPersistedRecords: 0,
    appClaimedVerifiedRecords: 0,
    persistedApplicationDecisions: 0,
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
  });
}

function evaluateValidated(
  input: LocalModelGovernancePhase6CloseoutInput,
): LocalModelGovernancePhase6CloseoutResult {
  if (input.closeoutPolicyRevision !== LOCAL_MODEL_GOVERNANCE_PHASE_6_CLOSEOUT_POLICY_REVISION) {
    return result({
      status: 'invalid-input',
      blockers: ['phase-6-closeout-policy-revision-invalid'],
    });
  }

  const boundaryCount = input.boundaries.length;
  const phaseIds = input.boundaries.map((item) => item.phaseId);
  const exactBoundarySet = boundaryCount === LOCAL_MODEL_GOVERNANCE_PHASE_6_BOUNDARY_IDS.length
    && new Set(phaseIds).size === LOCAL_MODEL_GOVERNANCE_PHASE_6_BOUNDARY_IDS.length
    && LOCAL_MODEL_GOVERNANCE_PHASE_6_BOUNDARY_IDS.every((phaseId) => phaseIds.includes(phaseId));
  const allBoundariesAuthored = input.boundaries.every((item) => item.boundaryAuthored);
  const allSourceContractsPresent = input.boundaries.every((item) => item.sourceContractPresent);
  const allTestsRegistered = input.boundaries.every((item) => item.testsRegistered);
  const completedBoundaryCount = input.boundaries.filter((item) => (
    item.boundaryAuthored
    && item.sourceContractPresent
    && item.testsRegistered
    && item.automaticActions === 0
    && item.productionAttempts === 0
    && item.downstreamMutations === 0
    && item.approvals === 0
    && item.activeModels === 0
  )).length;

  if (!exactBoundarySet || !allBoundariesAuthored || !allSourceContractsPresent || !allTestsRegistered) {
    const blockers = [
      ...(!exactBoundarySet ? ['phase-6-closeout-boundary-set-invalid'] : []),
      ...(!allBoundariesAuthored || !allSourceContractsPresent || !allTestsRegistered
        ? ['phase-6-closeout-boundary-contract-incomplete'] : []),
    ];
    return result({
      status: 'phase-contract-incomplete',
      blockers,
      boundaryCount,
      completedBoundaryCount,
      allBoundariesAuthored,
      allSourceContractsPresent,
      allTestsRegistered,
    });
  }

  const serverAuthorityVerifiedByContract = input.serverAuthoritativeRbac
    && input.forcedRls
    && input.appendOnlyPersistence
    && input.exactPersistenceEnvelopeRequired
    && !input.clientRoleTrusted
    && !input.genericAdminBypassAllowed
    && !input.serviceCredentialPresent;
  if (!serverAuthorityVerifiedByContract) {
    return result({
      status: 'server-authority-incomplete',
      blockers: [
        ...(!input.serverAuthoritativeRbac
          || !input.forcedRls
          || !input.appendOnlyPersistence
          || !input.exactPersistenceEnvelopeRequired
          ? ['phase-6-closeout-server-authority-incomplete'] : []),
        ...(input.clientRoleTrusted ? ['phase-6-closeout-client-role-trust-detected'] : []),
        ...(input.genericAdminBypassAllowed ? ['phase-6-closeout-generic-admin-bypass-detected'] : []),
        ...(input.serviceCredentialPresent ? ['phase-6-closeout-service-credential-detected'] : []),
      ],
      boundaryCount,
      completedBoundaryCount,
      allBoundariesAuthored,
      allSourceContractsPresent,
      allTestsRegistered,
    });
  }

  const boundaryAutomaticActions = input.boundaries.reduce((sum, item) => sum + item.automaticActions, 0);
  const automationClosed = input.automaticWrites === 0
    && input.automaticReads === 0
    && input.automaticApplications === 0
    && boundaryAutomaticActions === 0;
  if (!automationClosed) {
    return result({
      status: 'unsafe-automation-detected',
      blockers: [
        ...(input.automaticWrites > 0 ? ['phase-6-closeout-automatic-write-detected'] : []),
        ...(input.automaticReads > 0 ? ['phase-6-closeout-automatic-read-detected'] : []),
        ...(input.automaticApplications > 0 ? ['phase-6-closeout-automatic-application-detected'] : []),
        ...(boundaryAutomaticActions > 0 ? ['phase-6-closeout-boundary-automatic-action-detected'] : []),
      ],
      boundaryCount,
      completedBoundaryCount,
      allBoundariesAuthored,
      allSourceContractsPresent,
      allTestsRegistered,
      serverAuthorityVerifiedByContract,
    });
  }

  const boundaryProductionAttempts = input.boundaries.reduce((sum, item) => sum + item.productionAttempts, 0);
  const productionClaimsClosed = input.productionPersistenceAttempts === 0
    && input.productionVerificationAttempts === 0
    && input.productionApplicationAttempts === 0
    && input.appClaimedPersistedRecords === 0
    && input.appClaimedVerifiedRecords === 0
    && input.persistedApplicationDecisions === 0
    && boundaryProductionAttempts === 0;
  if (!productionClaimsClosed) {
    return result({
      status: 'unsafe-production-claim-detected',
      blockers: [
        ...(input.productionPersistenceAttempts > 0 || input.appClaimedPersistedRecords > 0
          ? ['phase-6-closeout-production-persistence-claim-detected'] : []),
        ...(input.productionVerificationAttempts > 0 || input.appClaimedVerifiedRecords > 0
          ? ['phase-6-closeout-production-verification-claim-detected'] : []),
        ...(input.productionApplicationAttempts > 0 || input.persistedApplicationDecisions > 0
          ? ['phase-6-closeout-production-application-claim-detected'] : []),
        ...(boundaryProductionAttempts > 0 ? ['phase-6-closeout-boundary-production-attempt-detected'] : []),
      ],
      boundaryCount,
      completedBoundaryCount,
      allBoundariesAuthored,
      allSourceContractsPresent,
      allTestsRegistered,
      serverAuthorityVerifiedByContract,
      automationClosed,
    });
  }

  const boundaryDownstream = input.boundaries.reduce((sum, item) => (
    sum + item.downstreamMutations + item.approvals + item.activeModels
  ), 0);
  const downstreamStateClosed = input.recordsAppliedDownstream === 0
    && input.artifactSelectionReviewsEligible === 0
    && input.selectedArtifacts === 0
    && input.approvedArtifacts === 0
    && input.approvedModels === 0
    && input.approvedLicenses === 0
    && input.checksumsVerified === 0
    && input.benchmarksPassed === 0
    && input.downloadableArtifacts === 0
    && input.runtimeReadyArtifacts === 0
    && input.activeModels === 0
    && boundaryDownstream === 0;
  if (!downstreamStateClosed) {
    return result({
      status: 'downstream-state-not-closed',
      blockers: [
        ...(input.recordsAppliedDownstream > 0 ? ['phase-6-closeout-downstream-application-detected'] : []),
        ...(input.artifactSelectionReviewsEligible > 0
          || input.selectedArtifacts > 0
          || input.approvedArtifacts > 0
          ? ['phase-6-closeout-artifact-state-not-zero'] : []),
        ...(input.approvedModels > 0 || input.approvedLicenses > 0
          ? ['phase-6-closeout-approval-state-not-zero'] : []),
        ...(input.checksumsVerified > 0
          || input.benchmarksPassed > 0
          || input.downloadableArtifacts > 0
          || input.runtimeReadyArtifacts > 0
          || input.activeModels > 0
          ? ['phase-6-closeout-runtime-state-not-zero'] : []),
        ...(boundaryDownstream > 0 ? ['phase-6-closeout-boundary-downstream-state-not-zero'] : []),
      ],
      boundaryCount,
      completedBoundaryCount,
      allBoundariesAuthored,
      allSourceContractsPresent,
      allTestsRegistered,
      serverAuthorityVerifiedByContract,
      automationClosed,
      productionClaimsClosed,
    });
  }

  return result({
    status: 'governance-phase-6-closed',
    warnings: SUCCESS_WARNINGS,
    boundaryCount,
    completedBoundaryCount,
    allBoundariesAuthored,
    allSourceContractsPresent,
    allTestsRegistered,
    serverAuthorityVerifiedByContract,
    automationClosed,
    productionClaimsClosed,
    downstreamStateClosed,
    phase6Closed: true,
    phase7DesignEntryEligible: true,
  });
}

export function evaluateLocalModelGovernancePhase6Closeout(
  input: LocalModelGovernancePhase6CloseoutInput,
): LocalModelGovernancePhase6CloseoutResult {
  try {
    if (!hasValidInputShape(input)) {
      return result({
        status: 'invalid-input',
        blockers: ['phase-6-closeout-input-invalid'],
      });
    }
    return evaluateValidated(input);
  } catch {
    return result({
      status: 'failed-safe',
      blockers: ['phase-6-closeout-failed-safe'],
    });
  }
}
