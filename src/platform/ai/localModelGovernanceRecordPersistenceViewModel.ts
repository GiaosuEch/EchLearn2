import { getLocalModelGovernanceEvidenceClosure } from './localModelGovernanceEvidenceClosureRegistry.ts';
import {
  listCurrentLocalModelGovernanceRecordPersistenceResults,
} from './localModelGovernanceRecordPersistencePolicy.ts';
import type {
  LocalModelGovernanceRecordPersistenceDuplicateState,
  LocalModelGovernanceRecordPersistenceResult,
  LocalModelGovernanceRecordPersistenceStatus,
} from './localModelGovernanceRecordPersistenceTypes.ts';

export interface LocalModelGovernanceRecordPersistenceRow {
  readonly candidateId: string;
  readonly candidateTier: LocalModelGovernanceRecordPersistenceResult['candidateTier'];
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly status: LocalModelGovernanceRecordPersistenceStatus;
  readonly statusLabel: string;
  readonly finalizedRecordPresent: boolean;
  readonly persistenceRequestReady: boolean;
  readonly duplicateState: LocalModelGovernanceRecordPersistenceDuplicateState;
  readonly recordPersisted: false;
  readonly modelActive: false;
}

export interface LocalModelGovernanceRecordPersistenceViewModel {
  readonly heading: string;
  readonly phaseSummary: string;
  readonly canonicalRecordBoundarySummary: string;
  readonly immutableEnvelopeSummary: string;
  readonly appendOnlySummary: string;
  readonly idempotencySummary: string;
  readonly repositoryBoundarySummary: string;
  readonly persistenceStateSummary: string;
  readonly downstreamBoundarySummary: string;
  readonly candidateRows: readonly LocalModelGovernanceRecordPersistenceRow[];
  readonly aggregate: {
    readonly totalCandidates: number;
    readonly awaitingFinalizedRecordCandidates: number;
    readonly persistenceRequestsReady: number;
    readonly invalidatedRequests: number;
    readonly attentionRequiredRequests: number;
    readonly finalizedRecordsPresent: number;
    readonly identicalDuplicateEnvelopes: number;
    readonly conflictingDuplicateEnvelopes: number;
    readonly persistenceAttempts: number;
    readonly repositoryWrites: number;
    readonly persistedRecords: number;
    readonly signedRecords: number;
    readonly recordsAppliedDownstream: number;
    readonly approvedModels: number;
    readonly approvedLicenses: number;
    readonly selectedArtifacts: number;
    readonly approvedArtifacts: number;
    readonly checksumVerifiedArtifacts: number;
    readonly benchmarkPassedCandidates: number;
    readonly downloadableArtifacts: number;
    readonly runtimeReadyArtifacts: number;
    readonly activeModels: number;
  };
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly documentPath: string;
  readonly persistenceContractOnly: true;
  readonly persistenceAttempts: 0;
  readonly persistedRecords: 0;
  readonly activeModels: 0;
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

function statusLabel(status: LocalModelGovernanceRecordPersistenceStatus): string {
  switch (status) {
    case 'awaiting-finalized-record':
      return 'A canonical finalized governance record is required before a persistence request can be prepared.';
    case 'persistence-request-ready':
      return 'An immutable append-only request is ready for future repository handoff review only.';
    case 'invalidated':
      return 'The canonical record, actor, candidate, evidence, or policy scope changed.';
    case 'attention-required':
      return 'The canonical record or persistence contract requires attention.';
    default:
      return 'The persistence contract is unavailable.';
  }
}

export function buildLocalModelGovernanceRecordPersistenceViewModel(
  results: readonly LocalModelGovernanceRecordPersistenceResult[] = listCurrentLocalModelGovernanceRecordPersistenceResults(),
): LocalModelGovernanceRecordPersistenceViewModel {
  const candidateRows = results.map((result): LocalModelGovernanceRecordPersistenceRow => {
    const record = getLocalModelGovernanceEvidenceClosure(result.candidateId);
    return {
      candidateId: result.candidateId,
      candidateTier: result.candidateTier,
      modelClass: record?.modelClass ?? '',
      exactModelName: record?.exactModelName ?? '',
      status: result.status,
      statusLabel: statusLabel(result.status),
      finalizedRecordPresent: result.finalizedRecordPresent,
      persistenceRequestReady: result.persistenceRequestReady,
      duplicateState: result.duplicateState,
      recordPersisted: false,
      modelActive: false,
    };
  });

  return {
    heading: 'Trusted Governance Record Persistence Contract Boundary',
    phaseSummary: 'Phase 6.4 defines an immutable provider-neutral persistence request contract without a repository implementation',
    canonicalRecordBoundarySummary: 'No canonical governance record has been finalized',
    immutableEnvelopeSummary: 'Persistence envelopes are append-only and immutable',
    appendOnlySummary: 'Append is the only allowed operation; update, delete, replace, and overwrite remain forbidden',
    idempotencySummary: 'Identical records use deterministic idempotency · Conflicting records must be rejected',
    repositoryBoundarySummary: 'No persistence repository is configured',
    persistenceStateSummary: 'Persistence requests are awaiting finalized records · No persistence attempt has occurred · No governance record has been persisted',
    downstreamBoundarySummary: 'No record has been signed · No record has been applied downstream · No model approved · No artifact selected · No download available · No model active · Production execution remains unavailable',
    candidateRows,
    aggregate: {
      totalCandidates: results.length,
      awaitingFinalizedRecordCandidates: results.filter((result) => result.status === 'awaiting-finalized-record').length,
      persistenceRequestsReady: results.filter((result) => result.persistenceRequestReady).length,
      invalidatedRequests: results.filter((result) => result.status === 'invalidated').length,
      attentionRequiredRequests: results.filter((result) => result.status === 'attention-required').length,
      finalizedRecordsPresent: results.filter((result) => result.finalizedRecordPresent).length,
      identicalDuplicateEnvelopes: results.filter((result) => result.duplicateState === 'identical-existing-envelope').length,
      conflictingDuplicateEnvelopes: results.filter((result) => result.duplicateState === 'conflicting-existing-envelope').length,
      persistenceAttempts: results.filter((result) => result.persistenceAttempted).length,
      repositoryWrites: results.filter((result) => result.repositoryWritePerformed).length,
      persistedRecords: results.filter((result) => result.recordPersisted).length,
      signedRecords: results.filter((result) => result.recordSigned).length,
      recordsAppliedDownstream: results.filter((result) => result.recordAppliedDownstream).length,
      approvedModels: results.filter((result) => result.modelApproved).length,
      approvedLicenses: results.filter((result) => result.licenseApproved).length,
      selectedArtifacts: results.filter((result) => result.artifactSelected).length,
      approvedArtifacts: results.filter((result) => result.artifactApproved).length,
      checksumVerifiedArtifacts: results.filter((result) => result.checksumVerified).length,
      benchmarkPassedCandidates: results.filter((result) => result.benchmarkVerified).length,
      downloadableArtifacts: results.filter((result) => result.downloadable).length,
      runtimeReadyArtifacts: results.filter((result) => result.runtimeReady).length,
      activeModels: results.filter((result) => result.modelActive).length,
    },
    blockers: unique(results.flatMap((result) => result.blockers)),
    warnings: unique(results.flatMap((result) => result.warnings)),
    documentPath: 'docs/ai/phase-6-governance-record-persistence-contract.md',
    persistenceContractOnly: true,
    persistenceAttempts: 0,
    persistedRecords: 0,
    activeModels: 0,
  };
}
