import {
  listCurrentLocalModelHumanArtifactSelections,
} from './localModelHumanArtifactSelectionPolicy.ts';
import type {
  LocalModelHumanArtifactSelectionResult,
  LocalModelHumanArtifactSelectionSessionStatus,
} from './localModelHumanArtifactSelectionTypes.ts';

export interface LocalModelHumanArtifactSelectionRow {
  readonly candidateId: string;
  readonly candidateTier: LocalModelHumanArtifactSelectionResult['candidateTier'];
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly status: LocalModelHumanArtifactSelectionSessionStatus;
  readonly statusLabel: string;
  readonly selectionSummary: string;
  readonly availableOptions: number;
  readonly artifactSelected: boolean;
  readonly canProceedToArtifactApprovalReview: boolean;
  readonly artifactApproved: false;
  readonly modelActive: false;
}

export interface LocalModelHumanArtifactSelectionViewModel {
  readonly heading: string;
  readonly governanceBoundarySummary: string;
  readonly artifactEvidenceSummary: string;
  readonly selectionSummary: string;
  readonly artifactApprovalBoundarySummary: string;
  readonly candidateRows: readonly LocalModelHumanArtifactSelectionRow[];
  readonly aggregate: {
    readonly totalCandidates: number;
    readonly unavailableSelectionSessions: number;
    readonly awaitingHumanSelectionCandidates: number;
    readonly selectionRecordedCandidates: number;
    readonly moreEvidenceRequestedCandidates: number;
    readonly rejectedCandidates: number;
    readonly invalidatedCandidates: number;
    readonly attentionRequiredCandidates: number;
    readonly humanSelectionsRecorded: number;
    readonly selectedArtifacts: number;
    readonly candidatesEligibleForArtifactApprovalReview: number;
    readonly approvedArtifacts: number;
    readonly checksumPinnedArtifacts: number;
    readonly checksumVerifiedArtifacts: number;
    readonly downloadableArtifacts: number;
    readonly runtimeReadyArtifacts: number;
    readonly activeModels: number;
  };
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly documentPath: string;
  readonly artifactSelectionBoundaryOnly: true;
  readonly artifactApproved: false;
  readonly modelActive: false;
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

function statusLabel(status: LocalModelHumanArtifactSelectionSessionStatus): string {
  switch (status) {
    case 'awaiting-human-selection':
      return 'Governance and evidence allow an explicit human artifact selection.';
    case 'selection-recorded':
      return 'An explicit artifact scope is recorded for future artifact approval review only.';
    case 'more-evidence-requested':
      return 'A human reviewer requested more artifact evidence.';
    case 'rejected':
      return 'A human reviewer rejected this artifact selection scope.';
    case 'invalidated':
      return 'The recorded selection is stale or mismatched with current evidence.';
    case 'attention-required':
      return 'The artifact-selection input or evidence requires attention.';
    default:
      return 'Governance decisions are incomplete, so artifact selection is unavailable.';
  }
}

export function buildLocalModelHumanArtifactSelectionViewModel(
  results: readonly LocalModelHumanArtifactSelectionResult[] = listCurrentLocalModelHumanArtifactSelections(),
): LocalModelHumanArtifactSelectionViewModel {
  const candidateRows = results.map((result): LocalModelHumanArtifactSelectionRow => ({
    candidateId: result.candidateId,
    candidateTier: result.candidateTier,
    modelClass: result.modelClass,
    exactModelName: result.exactModelName,
    status: result.status,
    statusLabel: statusLabel(result.status),
    selectionSummary: `${result.availableOptions.length} selectable options · ${result.humanSelectionRecorded ? 1 : 0} human decisions recorded · ${result.artifactSelected ? 1 : 0} artifacts selected`,
    availableOptions: result.availableOptions.length,
    artifactSelected: result.artifactSelected,
    canProceedToArtifactApprovalReview: result.canProceedToArtifactApprovalReview,
    artifactApproved: false,
    modelActive: false,
  }));

  return {
    heading: 'Explicit Human Artifact Selection Recording Boundary',
    governanceBoundarySummary: 'Governance decisions are not complete',
    artifactEvidenceSummary: 'Artifact selection is unavailable',
    selectionSummary: 'Human artifact selection is not recorded · No artifact selected',
    artifactApprovalBoundarySummary: 'No candidate can proceed to artifact approval review · No artifact approved · No checksum pinned · No checksum verified · No benchmark passed · No download available · No model active · Production execution remains unavailable',
    candidateRows,
    aggregate: {
      totalCandidates: results.length,
      unavailableSelectionSessions: results.filter((result) => result.status === 'unavailable').length,
      awaitingHumanSelectionCandidates: results.filter((result) => result.status === 'awaiting-human-selection').length,
      selectionRecordedCandidates: results.filter((result) => result.status === 'selection-recorded').length,
      moreEvidenceRequestedCandidates: results.filter((result) => result.status === 'more-evidence-requested').length,
      rejectedCandidates: results.filter((result) => result.status === 'rejected').length,
      invalidatedCandidates: results.filter((result) => result.status === 'invalidated').length,
      attentionRequiredCandidates: results.filter((result) => result.status === 'attention-required').length,
      humanSelectionsRecorded: results.filter((result) => result.humanSelectionRecorded).length,
      selectedArtifacts: results.filter((result) => result.artifactSelected).length,
      candidatesEligibleForArtifactApprovalReview: results.filter((result) => result.canProceedToArtifactApprovalReview).length,
      approvedArtifacts: results.filter((result) => result.artifactApproved).length,
      checksumPinnedArtifacts: results.filter((result) => result.checksumPinned).length,
      checksumVerifiedArtifacts: results.filter((result) => result.checksumVerified).length,
      downloadableArtifacts: results.filter((result) => result.downloadable).length,
      runtimeReadyArtifacts: results.filter((result) => result.runtimeReady).length,
      activeModels: results.filter((result) => result.modelActive).length,
    },
    blockers: unique(results.flatMap((result) => result.blockers)),
    warnings: unique(results.flatMap((result) => result.warnings)),
    documentPath: 'docs/ai/phase-5-model-human-artifact-selection-boundary.md',
    artifactSelectionBoundaryOnly: true,
    artifactApproved: false,
    modelActive: false,
  };
}
