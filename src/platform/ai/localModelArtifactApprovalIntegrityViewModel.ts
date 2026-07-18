import { listCurrentLocalModelArtifactApprovalIntegrityResults } from './localModelArtifactApprovalIntegrityPolicy.ts';
import type {
  LocalModelArtifactApprovalIntegrityResult,
  LocalModelArtifactApprovalIntegritySessionStatus,
} from './localModelArtifactApprovalIntegrityTypes.ts';

export interface LocalModelArtifactApprovalIntegrityRow {
  readonly candidateId: string;
  readonly candidateTier: LocalModelArtifactApprovalIntegrityResult['candidateTier'];
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly status: LocalModelArtifactApprovalIntegritySessionStatus;
  readonly statusLabel: string;
  readonly approvalSummary: string;
  readonly artifactApproved: boolean;
  readonly checksumPinned: boolean;
  readonly canProceedToBenchmarkPlanning: boolean;
  readonly checksumVerified: false;
  readonly modelActive: false;
}

export interface LocalModelArtifactApprovalIntegrityViewModel {
  readonly heading: string;
  readonly selectionBoundarySummary: string;
  readonly artifactApprovalSummary: string;
  readonly integrityPinningSummary: string;
  readonly verificationBoundarySummary: string;
  readonly benchmarkPlanningBoundarySummary: string;
  readonly candidateRows: readonly LocalModelArtifactApprovalIntegrityRow[];
  readonly aggregate: {
    readonly totalCandidates: number;
    readonly unavailableApprovalSessions: number;
    readonly awaitingHumanApprovalCandidates: number;
    readonly partiallyRecordedCandidates: number;
    readonly moreEvidenceRequestedCandidates: number;
    readonly artifactApprovalCompleteCandidates: number;
    readonly rejectedCandidates: number;
    readonly invalidatedCandidates: number;
    readonly attentionRequiredCandidates: number;
    readonly artifactApprovalDecisionsRecorded: number;
    readonly integrityPinningDecisionsRecorded: number;
    readonly approvedArtifacts: number;
    readonly approvedIntegrityPinPlans: number;
    readonly checksumPinnedArtifacts: number;
    readonly checksumVerifiedArtifacts: number;
    readonly candidatesEligibleForBenchmarkPlanning: number;
    readonly downloadableArtifacts: number;
    readonly runtimeReadyArtifacts: number;
    readonly activeModels: number;
  };
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly documentPath: string;
  readonly artifactApprovalBoundaryOnly: true;
  readonly checksumVerified: false;
  readonly modelActive: false;
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

function statusLabel(status: LocalModelArtifactApprovalIntegritySessionStatus): string {
  switch (status) {
    case 'awaiting-human-approval':
      return 'A selected artifact and complete pin plan await two explicit human approvals.';
    case 'partially-recorded':
      return 'Only one required human approval decision is recorded.';
    case 'more-evidence-requested':
      return 'A human reviewer requested more artifact or integrity evidence.';
    case 'artifact-approval-complete':
      return 'Artifact and pin-plan approvals are complete for benchmark-planning review only.';
    case 'rejected':
      return 'A human reviewer rejected the artifact or integrity pin plan.';
    case 'invalidated':
      return 'The recorded approval is stale or mismatched with the selected scope.';
    case 'attention-required':
      return 'The approval input or integrity evidence requires attention.';
    default:
      return 'No artifact selection is recorded, so approval is unavailable.';
  }
}

export function buildLocalModelArtifactApprovalIntegrityViewModel(
  results: readonly LocalModelArtifactApprovalIntegrityResult[] = listCurrentLocalModelArtifactApprovalIntegrityResults(),
): LocalModelArtifactApprovalIntegrityViewModel {
  const candidateRows = results.map((result): LocalModelArtifactApprovalIntegrityRow => ({
    candidateId: result.candidateId,
    candidateTier: result.candidateTier,
    modelClass: result.modelClass,
    exactModelName: result.exactModelName,
    status: result.status,
    statusLabel: statusLabel(result.status),
    approvalSummary: `${result.humanArtifactApprovalRecorded ? 1 : 0} artifact approval decisions · ${result.humanIntegrityPinningDecisionRecorded ? 1 : 0} integrity pinning decisions · ${result.artifactApproved ? 1 : 0} approved artifacts · ${result.checksumPinned ? 1 : 0} checksums pinned`,
    artifactApproved: result.artifactApproved,
    checksumPinned: result.checksumPinned,
    canProceedToBenchmarkPlanning: result.canProceedToBenchmarkPlanning,
    checksumVerified: false,
    modelActive: false,
  }));

  return {
    heading: 'Explicit Human Artifact Approval & Integrity Pinning Boundary',
    selectionBoundarySummary: 'No artifact selection has been recorded',
    artifactApprovalSummary: 'Artifact approval is unavailable · Human artifact approval is not recorded',
    integrityPinningSummary: 'Integrity pinning approval is not recorded · No checksum pinned',
    verificationBoundarySummary: 'No checksum verified',
    benchmarkPlanningBoundarySummary: 'No candidate can proceed to benchmark planning · No benchmark passed · No download available · No model active · Production execution remains unavailable',
    candidateRows,
    aggregate: {
      totalCandidates: results.length,
      unavailableApprovalSessions: results.filter((result) => result.status === 'unavailable').length,
      awaitingHumanApprovalCandidates: results.filter((result) => result.status === 'awaiting-human-approval').length,
      partiallyRecordedCandidates: results.filter((result) => result.status === 'partially-recorded').length,
      moreEvidenceRequestedCandidates: results.filter((result) => result.status === 'more-evidence-requested').length,
      artifactApprovalCompleteCandidates: results.filter((result) => result.status === 'artifact-approval-complete').length,
      rejectedCandidates: results.filter((result) => result.status === 'rejected').length,
      invalidatedCandidates: results.filter((result) => result.status === 'invalidated').length,
      attentionRequiredCandidates: results.filter((result) => result.status === 'attention-required').length,
      artifactApprovalDecisionsRecorded: results.filter((result) => result.humanArtifactApprovalRecorded).length,
      integrityPinningDecisionsRecorded: results.filter((result) => result.humanIntegrityPinningDecisionRecorded).length,
      approvedArtifacts: results.filter((result) => result.artifactApproved).length,
      approvedIntegrityPinPlans: results.filter((result) => result.artifactApprovalComplete && result.checksumPinned).length,
      checksumPinnedArtifacts: results.filter((result) => result.checksumPinned).length,
      checksumVerifiedArtifacts: results.filter((result) => result.checksumVerified).length,
      candidatesEligibleForBenchmarkPlanning: results.filter((result) => result.canProceedToBenchmarkPlanning).length,
      downloadableArtifacts: results.filter((result) => result.downloadable).length,
      runtimeReadyArtifacts: results.filter((result) => result.runtimeReady).length,
      activeModels: results.filter((result) => result.modelActive).length,
    },
    blockers: unique(results.flatMap((result) => result.blockers)),
    warnings: unique(results.flatMap((result) => result.warnings)),
    documentPath: 'docs/ai/phase-5-model-artifact-approval-integrity-boundary.md',
    artifactApprovalBoundaryOnly: true,
    checksumVerified: false,
    modelActive: false,
  };
}
