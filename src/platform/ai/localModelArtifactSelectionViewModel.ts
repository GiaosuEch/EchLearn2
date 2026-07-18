import {
  listCurrentLocalModelArtifactSelections,
} from './localModelArtifactSelectionPolicy.ts';
import type {
  LocalModelArtifactSelectionGateStatus,
  LocalModelArtifactSelectionResult,
} from './localModelArtifactSelectionTypes.ts';

export interface LocalModelArtifactSelectionRow {
  readonly candidateId: string;
  readonly candidateTier: string;
  readonly status: LocalModelArtifactSelectionGateStatus;
  readonly statusLabel: string;
  readonly canSelectArtifact: boolean;
  readonly humanSelectionRecorded: boolean;
  readonly artifactSelected: boolean;
  readonly artifactApproved: false;
  readonly modelActive: false;
}

export interface LocalModelArtifactSelectionViewModel {
  readonly heading: 'Human Artifact Variant Selection Decision Gate';
  readonly modelLicenseReviewSummary: 'Model and license review has not passed';
  readonly artifactEvidenceSummary: 'More artifact evidence is required';
  readonly selectionSummary: 'Human artifact selection not recorded';
  readonly artifactSelectionSummary: 'No artifact selected';
  readonly artifactApprovalSummary: 'No artifact approved';
  readonly checksumSummary: 'No checksum pinned';
  readonly downloadLocationSummary: 'No download location configured';
  readonly benchmarkSummary: 'No benchmark passed';
  readonly downloadSummary: 'No download available';
  readonly modelStateSummary: 'No model active';
  readonly executionSummary: 'Production execution remains unavailable';
  readonly candidateRows: readonly LocalModelArtifactSelectionRow[];
  readonly aggregate: {
    readonly totalCandidates: number;
    readonly blockedByModelLicenseReviewCandidates: number;
    readonly needsMoreArtifactEvidenceCandidates: number;
    readonly awaitingHumanSelectionCandidates: number;
    readonly selectedForArtifactApprovalReviewCandidates: number;
    readonly rejectedCandidates: number;
    readonly attentionRequiredCandidates: number;
    readonly selectedArtifacts: number;
    readonly approvedArtifacts: number;
    readonly checksumPinnedArtifacts: number;
    readonly downloadableArtifacts: number;
    readonly runtimeReadyArtifacts: number;
    readonly activeModels: number;
  };
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly documentPath: 'docs/ai/phase-5-model-artifact-selection-decision.md';
  readonly selectionGateOnly: true;
  readonly artifactApproved: false;
  readonly modelActive: false;
}

function statusLabel(status: LocalModelArtifactSelectionGateStatus): string {
  switch (status) {
    case 'needs-more-artifact-evidence':
      return 'More official artifact evidence is required before a selection can be recorded.';
    case 'awaiting-human-selection':
      return 'Evidence prerequisites pass; an explicit human artifact selection is still required.';
    case 'selected-for-artifact-approval-review':
      return 'A human-selected scope may proceed to a future artifact approval review only.';
    case 'rejected':
      return 'A human rejection blocks this artifact scope.';
    case 'attention-required':
      return 'Selection input or current evidence is inconsistent and requires attention.';
    default:
      return 'Model and license review has not passed.';
  }
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

export function buildLocalModelArtifactSelectionViewModel(
  results: readonly LocalModelArtifactSelectionResult[] =
    listCurrentLocalModelArtifactSelections(),
): LocalModelArtifactSelectionViewModel {
  const candidateRows = results.map((result): LocalModelArtifactSelectionRow => ({
    candidateId: result.candidateId,
    candidateTier: result.candidateTier,
    status: result.status,
    statusLabel: statusLabel(result.status),
    canSelectArtifact: result.canSelectArtifact,
    humanSelectionRecorded: result.humanSelectionRecorded,
    artifactSelected: result.artifactSelected,
    artifactApproved: false,
    modelActive: false,
  }));

  return {
    heading: 'Human Artifact Variant Selection Decision Gate',
    modelLicenseReviewSummary: 'Model and license review has not passed',
    artifactEvidenceSummary: 'More artifact evidence is required',
    selectionSummary: 'Human artifact selection not recorded',
    artifactSelectionSummary: 'No artifact selected',
    artifactApprovalSummary: 'No artifact approved',
    checksumSummary: 'No checksum pinned',
    downloadLocationSummary: 'No download location configured',
    benchmarkSummary: 'No benchmark passed',
    downloadSummary: 'No download available',
    modelStateSummary: 'No model active',
    executionSummary: 'Production execution remains unavailable',
    candidateRows,
    aggregate: {
      totalCandidates: results.length,
      blockedByModelLicenseReviewCandidates: results.filter(
        (result) => result.status === 'blocked-by-model-license-review',
      ).length,
      needsMoreArtifactEvidenceCandidates: results.filter(
        (result) => !result.artifactEvidenceComplete,
      ).length,
      awaitingHumanSelectionCandidates: results.filter(
        (result) => result.status === 'awaiting-human-selection',
      ).length,
      selectedForArtifactApprovalReviewCandidates: results.filter(
        (result) => result.status === 'selected-for-artifact-approval-review',
      ).length,
      rejectedCandidates: results.filter((result) => result.status === 'rejected').length,
      attentionRequiredCandidates: results.filter(
        (result) => result.status === 'attention-required',
      ).length,
      selectedArtifacts: results.filter((result) => result.artifactSelected).length,
      approvedArtifacts: results.filter((result) => result.artifactApproved).length,
      checksumPinnedArtifacts: results.filter((result) => result.checksumPinned).length,
      downloadableArtifacts: results.filter((result) => result.downloadable).length,
      runtimeReadyArtifacts: results.filter((result) => result.runtimeReady).length,
      activeModels: results.filter((result) => result.modelActive).length,
    },
    blockers: unique(results.flatMap((result) => result.blockers)),
    warnings: unique(results.flatMap((result) => result.warnings)),
    documentPath: 'docs/ai/phase-5-model-artifact-selection-decision.md',
    selectionGateOnly: true,
    artifactApproved: false,
    modelActive: false,
  };
}
