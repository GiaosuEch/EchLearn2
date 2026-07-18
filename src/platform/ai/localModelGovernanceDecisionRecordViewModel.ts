import {
  listCurrentLocalModelGovernanceDecisionRecordResults,
} from './localModelGovernanceDecisionRecordPolicy.ts';
import type {
  LocalModelGovernanceDecisionRecordResult,
  LocalModelGovernanceDecisionRecordStatus,
} from './localModelGovernanceDecisionRecordTypes.ts';

export interface LocalModelGovernanceDecisionRecordRow {
  readonly candidateId: string;
  readonly candidateTier: LocalModelGovernanceDecisionRecordResult['candidateTier'];
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly status: LocalModelGovernanceDecisionRecordStatus;
  readonly statusLabel: string;
  readonly actorContextPresent: boolean;
  readonly recordedDecisionItems: number;
  readonly finalized: boolean;
  readonly eligibleForTrustedPersistence: boolean;
  readonly appliedToArtifactSelection: false;
  readonly modelActive: false;
}

export interface LocalModelGovernanceDecisionRecordViewModel {
  readonly heading: string;
  readonly phaseSummary: string;
  readonly actorBoundarySummary: string;
  readonly decisionBoundarySummary: string;
  readonly recordBoundarySummary: string;
  readonly persistenceBoundarySummary: string;
  readonly artifactSelectionBoundarySummary: string;
  readonly candidateRows: readonly LocalModelGovernanceDecisionRecordRow[];
  readonly aggregate: {
    readonly totalCandidates: number;
    readonly recordContractsAvailable: number;
    readonly awaitingTrustedActorCandidates: number;
    readonly awaitingExplicitDecisionCandidates: number;
    readonly validDraftCandidates: number;
    readonly draftedRecords: number;
    readonly finalizedProceedRecords: number;
    readonly finalizedRejectedRecords: number;
    readonly finalizedMoreEvidenceRecords: number;
    readonly invalidatedRecords: number;
    readonly attentionRequiredRecords: number;
    readonly trustedActorContexts: number;
    readonly explicitDecisionItemsRecorded: number;
    readonly finalizedRecords: number;
    readonly recordsEligibleForTrustedPersistence: number;
    readonly recordsAppliedToArtifactSelection: number;
    readonly approvedModels: number;
    readonly approvedLicenses: number;
    readonly selectedArtifacts: number;
    readonly approvedArtifacts: number;
    readonly downloadableArtifacts: number;
    readonly runtimeReadyArtifacts: number;
    readonly activeModels: number;
  };
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly documentPath: string;
  readonly decisionRecordContractOnly: true;
  readonly recordsPersisted: 0;
  readonly modelActive: false;
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

function statusLabel(status: LocalModelGovernanceDecisionRecordStatus): string {
  switch (status) {
    case 'awaiting-trusted-actor':
      return 'A trusted external actor context is required before decisions can be recorded.';
    case 'awaiting-explicit-decisions':
      return 'Four explicit governance decisions are still required.';
    case 'draft-valid':
      return 'The draft is structurally valid but has not been explicitly finalized.';
    case 'finalized-proceed':
      return 'A canonical proceed record exists for future trusted persistence review only.';
    case 'finalized-rejected':
      return 'A canonical rejected record exists for future trusted persistence review only.';
    case 'finalized-more-evidence':
      return 'A canonical more-evidence record exists for future trusted persistence review only.';
    case 'invalidated':
      return 'The record scope is stale or does not match current evidence.';
    case 'attention-required':
      return 'The actor, decisions, clock, or record claims require attention.';
    default:
      return 'The decision-record contract is unavailable.';
  }
}

export function buildLocalModelGovernanceDecisionRecordViewModel(
  results: readonly LocalModelGovernanceDecisionRecordResult[] = listCurrentLocalModelGovernanceDecisionRecordResults(),
): LocalModelGovernanceDecisionRecordViewModel {
  const candidateRows = results.map((result): LocalModelGovernanceDecisionRecordRow => ({
    candidateId: result.candidateId,
    candidateTier: result.candidateTier,
    modelClass: result.scope.modelClass,
    exactModelName: result.scope.exactModelName,
    status: result.status,
    statusLabel: statusLabel(result.status),
    actorContextPresent: result.actorContext !== null,
    recordedDecisionItems: result.recordedDecisionItems,
    finalized: result.canonicalRecord !== null,
    eligibleForTrustedPersistence: result.eligibleForTrustedPersistence,
    appliedToArtifactSelection: false,
    modelActive: false,
  }));

  const finalizedRecords = results.filter((result) => result.canonicalRecord !== null).length;

  return {
    heading: 'Trusted Human Governance Decision Record Contract',
    phaseSummary: 'Phase 6.1 defines a canonical decision-record contract only',
    actorBoundarySummary: 'No trusted actor context is present',
    decisionBoundarySummary: 'Human governance decisions are not recorded',
    recordBoundarySummary: 'No canonical governance record has been finalized',
    persistenceBoundarySummary: 'No record has been persisted · No record has been signed',
    artifactSelectionBoundarySummary: 'No record has been applied to artifact selection · No model approved · No license approved · No artifact selected · No download available · No model active · Production execution remains unavailable',
    candidateRows,
    aggregate: {
      totalCandidates: results.length,
      recordContractsAvailable: results.length,
      awaitingTrustedActorCandidates: results.filter((result) => result.status === 'awaiting-trusted-actor').length,
      awaitingExplicitDecisionCandidates: results.filter((result) => result.status === 'awaiting-explicit-decisions').length,
      validDraftCandidates: results.filter((result) => result.status === 'draft-valid').length,
      draftedRecords: results.filter((result) => result.recordedDecisionItems > 0 && result.canonicalRecord === null).length,
      finalizedProceedRecords: results.filter((result) => result.status === 'finalized-proceed').length,
      finalizedRejectedRecords: results.filter((result) => result.status === 'finalized-rejected').length,
      finalizedMoreEvidenceRecords: results.filter((result) => result.status === 'finalized-more-evidence').length,
      invalidatedRecords: results.filter((result) => result.status === 'invalidated').length,
      attentionRequiredRecords: results.filter((result) => result.status === 'attention-required').length,
      trustedActorContexts: results.filter((result) => result.trustedActorContextValid).length,
      explicitDecisionItemsRecorded: results.reduce((sum, result) => sum + result.recordedDecisionItems, 0),
      finalizedRecords,
      recordsEligibleForTrustedPersistence: results.filter((result) => result.eligibleForTrustedPersistence).length,
      recordsAppliedToArtifactSelection: results.filter((result) => result.appliedToArtifactSelection).length,
      approvedModels: results.filter((result) => result.modelApproved).length,
      approvedLicenses: results.filter((result) => result.licenseApproved).length,
      selectedArtifacts: results.filter((result) => result.artifactSelected).length,
      approvedArtifacts: results.filter((result) => result.artifactApproved).length,
      downloadableArtifacts: results.filter((result) => result.downloadable).length,
      runtimeReadyArtifacts: results.filter((result) => result.runtimeReady).length,
      activeModels: results.filter((result) => result.modelActive).length,
    },
    blockers: unique(results.flatMap((result) => result.blockers)),
    warnings: unique(results.flatMap((result) => result.warnings)),
    documentPath: 'docs/ai/phase-6-trusted-governance-decision-record.md',
    decisionRecordContractOnly: true,
    recordsPersisted: 0,
    modelActive: false,
  };
}
