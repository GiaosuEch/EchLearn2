import {
  listCurrentLocalModelCandidateReviewDecisions,
} from './localModelCandidateReviewDecisionPolicy.ts';
import type {
  LocalModelCandidateReviewDecisionResult,
  LocalModelCandidateReviewGateStatus,
} from './localModelCandidateReviewDecisionTypes.ts';

export interface LocalModelCandidateReviewDecisionRow {
  readonly candidateId: string;
  readonly candidateTier: string;
  readonly status: LocalModelCandidateReviewGateStatus;
  readonly statusLabel: string;
  readonly blockers: readonly string[];
  readonly canProceedToArtifactReview: boolean;
  readonly humanDecisionRecorded: boolean;
  readonly modelApproved: false;
  readonly modelActive: false;
}

export interface LocalModelCandidateReviewDecisionViewModel {
  readonly heading: 'Human Model & License Review Decision Gate';
  readonly reviewSummary: 'Human decision not recorded';
  readonly evidenceSummary: 'More evidence is required';
  readonly decisionSummary: 'No candidate approved for artifact review';
  readonly approvalBoundarySummary: 'Approved-for-artifact-review does not approve a model, license, artifact, benchmark, runtime, or download';
  readonly modelApprovalSummary: 'No model approved';
  readonly licenseApprovalSummary: 'No license approved';
  readonly artifactApprovalSummary: 'No artifact approved';
  readonly benchmarkSummary: 'No benchmark passed';
  readonly downloadSummary: 'No download available';
  readonly modelStateSummary: 'No model active';
  readonly executionSummary: 'Production execution remains unavailable';
  readonly candidateRows: readonly LocalModelCandidateReviewDecisionRow[];
  readonly aggregate: {
    readonly totalCandidates: number;
    readonly needsMoreEvidenceCandidates: number;
    readonly awaitingHumanDecisionCandidates: number;
    readonly approvedForArtifactReviewCandidates: number;
    readonly rejectedCandidates: number;
    readonly attentionRequiredCandidates: number;
    readonly humanReviewRequiredCandidates: number;
    readonly modelApprovedCandidates: number;
    readonly licenseApprovedCandidates: number;
    readonly artifactApprovedCandidates: number;
    readonly downloadableCandidates: number;
    readonly activeModels: number;
  };
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly documentPath: 'docs/ai/phase-5-model-license-human-review-decision.md';
  readonly decisionGateOnly: true;
  readonly modelApproved: false;
  readonly modelActive: false;
}

function statusLabel(status: LocalModelCandidateReviewGateStatus): string {
  switch (status) {
    case 'awaiting-human-decision':
      return 'Evidence is complete; an explicit human decision is still required.';
    case 'approved-for-artifact-review':
      return 'Human review gate passed for a future artifact-review phase only.';
    case 'rejected':
      return 'A valid rejection blocks this candidate from artifact review.';
    case 'attention-required':
      return 'Review input is inconsistent or evidence conflicts require attention.';
    default:
      return 'More official evidence is required before a human decision can be accepted.';
  }
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

export function buildLocalModelCandidateReviewDecisionViewModel(
  results: readonly LocalModelCandidateReviewDecisionResult[] =
    listCurrentLocalModelCandidateReviewDecisions(),
): LocalModelCandidateReviewDecisionViewModel {
  const candidateRows = results.map((result): LocalModelCandidateReviewDecisionRow => ({
    candidateId: result.candidateId,
    candidateTier: result.candidateTier,
    status: result.status,
    statusLabel: statusLabel(result.status),
    blockers: result.blockers,
    canProceedToArtifactReview: result.canProceedToArtifactReview,
    humanDecisionRecorded: result.humanDecisionRecorded,
    modelApproved: false,
    modelActive: false,
  }));

  return {
    heading: 'Human Model & License Review Decision Gate',
    reviewSummary: 'Human decision not recorded',
    evidenceSummary: 'More evidence is required',
    decisionSummary: 'No candidate approved for artifact review',
    approvalBoundarySummary: 'Approved-for-artifact-review does not approve a model, license, artifact, benchmark, runtime, or download',
    modelApprovalSummary: 'No model approved',
    licenseApprovalSummary: 'No license approved',
    artifactApprovalSummary: 'No artifact approved',
    benchmarkSummary: 'No benchmark passed',
    downloadSummary: 'No download available',
    modelStateSummary: 'No model active',
    executionSummary: 'Production execution remains unavailable',
    candidateRows,
    aggregate: {
      totalCandidates: results.length,
      needsMoreEvidenceCandidates: results.filter((result) => result.status === 'needs-more-evidence').length,
      awaitingHumanDecisionCandidates: results.filter((result) => result.status === 'awaiting-human-decision').length,
      approvedForArtifactReviewCandidates: results.filter((result) => result.status === 'approved-for-artifact-review').length,
      rejectedCandidates: results.filter((result) => result.status === 'rejected').length,
      attentionRequiredCandidates: results.filter((result) => result.status === 'attention-required').length,
      humanReviewRequiredCandidates: results.filter((result) => result.humanReviewStillRequired).length,
      modelApprovedCandidates: results.filter((result) => result.modelApproved).length,
      licenseApprovedCandidates: results.filter((result) => result.licenseApproved).length,
      artifactApprovedCandidates: results.filter((result) => result.artifactApproved).length,
      downloadableCandidates: results.filter((result) => result.downloadable).length,
      activeModels: results.filter((result) => result.modelActive).length,
    },
    blockers: unique(results.flatMap((result) => result.blockers)),
    warnings: unique(results.flatMap((result) => result.warnings)),
    documentPath: 'docs/ai/phase-5-model-license-human-review-decision.md',
    decisionGateOnly: true,
    modelApproved: false,
    modelActive: false,
  };
}
