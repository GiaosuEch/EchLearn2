import {
  listCurrentLocalModelHumanGovernanceDecisions,
} from './localModelHumanGovernanceDecisionPolicy.ts';
import type {
  LocalModelHumanGovernanceDecisionResult,
  LocalModelHumanGovernanceDecisionSessionStatus,
} from './localModelHumanGovernanceDecisionTypes.ts';

export interface LocalModelHumanGovernanceDecisionRow {
  readonly candidateId: string;
  readonly candidateTier: LocalModelHumanGovernanceDecisionResult['candidateTier'];
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly status: LocalModelHumanGovernanceDecisionSessionStatus;
  readonly statusLabel: string;
  readonly decisionSummary: string;
  readonly recordedDecisionItems: number;
  readonly totalDecisionItems: number;
  readonly canProceedToArtifactSelectionReview: boolean;
  readonly modelApproved: false;
  readonly artifactSelected: false;
  readonly modelActive: false;
}

export interface LocalModelHumanGovernanceDecisionViewModel {
  readonly heading: string;
  readonly boundarySummary: string;
  readonly evidenceSummary: string;
  readonly decisionSummary: string;
  readonly artifactSelectionBoundarySummary: string;
  readonly approvalBoundarySummary: string;
  readonly candidateRows: readonly LocalModelHumanGovernanceDecisionRow[];
  readonly aggregate: {
    readonly totalCandidates: number;
    readonly totalDecisionItems: number;
    readonly availableDecisionSessions: number;
    readonly awaitingHumanDecisionCandidates: number;
    readonly partiallyRecordedCandidates: number;
    readonly moreEvidenceRequestedCandidates: number;
    readonly governanceDecisionsCompleteCandidates: number;
    readonly rejectedCandidates: number;
    readonly invalidatedCandidates: number;
    readonly attentionRequiredCandidates: number;
    readonly recordedDecisionItems: number;
    readonly proceedDecisionItems: number;
    readonly rejectedDecisionItems: number;
    readonly moreEvidenceDecisionItems: number;
    readonly candidatesEligibleForArtifactSelectionReview: number;
    readonly modelApprovedCandidates: number;
    readonly licenseApprovedCandidates: number;
    readonly selectedArtifacts: number;
    readonly approvedArtifacts: number;
    readonly downloadableArtifacts: number;
    readonly activeModels: number;
  };
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly documentPath: string;
  readonly governanceDecisionBoundaryOnly: true;
  readonly modelApproved: false;
  readonly modelActive: false;
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

function statusLabel(status: LocalModelHumanGovernanceDecisionSessionStatus): string {
  switch (status) {
    case 'awaiting-human-decision':
      return 'Awaiting four explicit human governance decisions.';
    case 'partially-recorded':
      return 'Some governance decisions are recorded, but the session is incomplete.';
    case 'more-evidence-requested':
      return 'A human reviewer requested more evidence.';
    case 'governance-decisions-complete':
      return 'Governance decisions are complete for future artifact-selection review only.';
    case 'rejected':
      return 'A human governance decision rejected this candidate scope.';
    case 'invalidated':
      return 'Recorded decisions are invalid for the current evidence scope.';
    case 'attention-required':
      return 'The decision input or evidence scope requires attention.';
    default:
      return 'The governance decision boundary is unavailable.';
  }
}

export function buildLocalModelHumanGovernanceDecisionViewModel(
  results: readonly LocalModelHumanGovernanceDecisionResult[] = listCurrentLocalModelHumanGovernanceDecisions(),
): LocalModelHumanGovernanceDecisionViewModel {
  const candidateRows = results.map((result): LocalModelHumanGovernanceDecisionRow => ({
    candidateId: result.candidateId,
    candidateTier: result.candidateTier,
    modelClass: result.scope.modelClass,
    exactModelName: result.scope.exactModelName,
    status: result.status,
    statusLabel: statusLabel(result.status),
    decisionSummary: `${result.recordedDecisionItems} of ${result.totalDecisionItems} decisions recorded · ${result.proceedDecisionItems} proceed · ${result.rejectedDecisionItems} rejected · ${result.moreEvidenceDecisionItems} request more evidence`,
    recordedDecisionItems: result.recordedDecisionItems,
    totalDecisionItems: result.totalDecisionItems,
    canProceedToArtifactSelectionReview: result.canProceedToArtifactSelectionReview,
    modelApproved: false,
    artifactSelected: false,
    modelActive: false,
  }));

  return {
    heading: 'Explicit Human Governance Decision Boundary',
    boundarySummary: 'Human decisions are not recorded',
    evidenceSummary: 'Governance evidence is available for review',
    decisionSummary: 'Twelve explicit requirement decisions are required',
    artifactSelectionBoundarySummary: 'No governance decision session is complete · No candidate can proceed to artifact selection review',
    approvalBoundarySummary: 'No model approved · No license approved · No artifact selected · No artifact approved · No benchmark passed · No download available · No model active · Production execution remains unavailable',
    candidateRows,
    aggregate: {
      totalCandidates: results.length,
      totalDecisionItems: results.reduce((sum, result) => sum + result.totalDecisionItems, 0),
      availableDecisionSessions: results.filter((result) => result.canRecordDecision).length,
      awaitingHumanDecisionCandidates: results.filter((result) => result.status === 'awaiting-human-decision').length,
      partiallyRecordedCandidates: results.filter((result) => result.status === 'partially-recorded').length,
      moreEvidenceRequestedCandidates: results.filter((result) => result.status === 'more-evidence-requested').length,
      governanceDecisionsCompleteCandidates: results.filter((result) => result.status === 'governance-decisions-complete').length,
      rejectedCandidates: results.filter((result) => result.status === 'rejected').length,
      invalidatedCandidates: results.filter((result) => result.status === 'invalidated').length,
      attentionRequiredCandidates: results.filter((result) => result.status === 'attention-required').length,
      recordedDecisionItems: results.reduce((sum, result) => sum + result.recordedDecisionItems, 0),
      proceedDecisionItems: results.reduce((sum, result) => sum + result.proceedDecisionItems, 0),
      rejectedDecisionItems: results.reduce((sum, result) => sum + result.rejectedDecisionItems, 0),
      moreEvidenceDecisionItems: results.reduce((sum, result) => sum + result.moreEvidenceDecisionItems, 0),
      candidatesEligibleForArtifactSelectionReview: results.filter((result) => result.canProceedToArtifactSelectionReview).length,
      modelApprovedCandidates: results.filter((result) => result.modelApproved).length,
      licenseApprovedCandidates: results.filter((result) => result.licenseApproved).length,
      selectedArtifacts: results.filter((result) => result.artifactSelected).length,
      approvedArtifacts: results.filter((result) => result.artifactApproved).length,
      downloadableArtifacts: results.filter((result) => result.downloadable).length,
      activeModels: results.filter((result) => result.modelActive).length,
    },
    blockers: unique(results.flatMap((result) => result.blockers)),
    warnings: unique(results.flatMap((result) => result.warnings)),
    documentPath: 'docs/ai/phase-5-model-human-governance-decision-boundary.md',
    governanceDecisionBoundaryOnly: true,
    modelApproved: false,
    modelActive: false,
  };
}
