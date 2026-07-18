import { listCurrentSelectedArtifactBenchmarkPlanResults } from './localModelSelectedArtifactBenchmarkPlanPolicy.ts';
import type { LocalModelSelectedArtifactBenchmarkPlanResult, LocalModelSelectedArtifactBenchmarkPlanSessionStatus } from './localModelSelectedArtifactBenchmarkPlanTypes.ts';

export interface LocalModelSelectedArtifactBenchmarkPlanRow {
  readonly candidateId: string;
  readonly candidateTier: LocalModelSelectedArtifactBenchmarkPlanResult['candidateTier'];
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly status: LocalModelSelectedArtifactBenchmarkPlanSessionStatus;
  readonly statusLabel: string;
  readonly planSummary: string;
  readonly benchmarkPlanApproved: boolean;
  readonly benchmarkExecutionStarted: false;
  readonly benchmarkPassed: false;
  readonly modelActive: false;
}

export interface LocalModelSelectedArtifactBenchmarkPlanViewModel {
  readonly heading: string;
  readonly artifactApprovalSummary: string;
  readonly benchmarkPlanSummary: string;
  readonly measurementBoundarySummary: string;
  readonly executionBoundarySummary: string;
  readonly fallbackSummary: string;
  readonly candidateRows: readonly LocalModelSelectedArtifactBenchmarkPlanRow[];
  readonly aggregate: {
    readonly totalCandidates: number;
    readonly unavailablePlanSessions: number;
    readonly awaitingPlanReviewCandidates: number;
    readonly benchmarkPlanApprovedCandidates: number;
    readonly moreEvidenceRequestedCandidates: number;
    readonly rejectedCandidates: number;
    readonly invalidatedCandidates: number;
    readonly attentionRequiredCandidates: number;
    readonly benchmarkPlansRecorded: number;
    readonly candidatesEligibleForFutureBenchmarkExecutionReview: number;
    readonly benchmarkExecutionsStarted: number;
    readonly benchmarkExecutionsCompleted: number;
    readonly benchmarkMeasurementsRecorded: number;
    readonly benchmarkPassedCandidates: number;
    readonly benchmarkFailedCandidates: number;
    readonly checksumVerifiedArtifacts: number;
    readonly downloadableArtifacts: number;
    readonly runtimeReadyArtifacts: number;
    readonly activeModels: number;
  };
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly documentPath: string;
  readonly benchmarkPlanBoundaryOnly: true;
  readonly benchmarkExecutionStarted: false;
  readonly benchmarkPassed: false;
  readonly modelActive: false;
}

function unique(values: readonly string[]): readonly string[] { return [...new Set(values)]; }
function label(status: LocalModelSelectedArtifactBenchmarkPlanSessionStatus): string {
  switch (status) {
    case 'awaiting-plan-review': return 'A deterministic exact-artifact plan awaits explicit human review.';
    case 'benchmark-plan-approved': return 'The plan may proceed to future benchmark-execution review only.';
    case 'more-evidence-requested': return 'A reviewer requested more benchmark-planning evidence.';
    case 'rejected': return 'The proposed benchmark plan was rejected.';
    case 'invalidated': return 'The plan is stale or mismatched with current artifact approval scope.';
    case 'attention-required': return 'The plan input requires attention.';
    default: return 'No artifact approval is complete, so benchmark planning is unavailable.';
  }
}

export function buildLocalModelSelectedArtifactBenchmarkPlanViewModel(
  results: readonly LocalModelSelectedArtifactBenchmarkPlanResult[] = listCurrentSelectedArtifactBenchmarkPlanResults(),
): LocalModelSelectedArtifactBenchmarkPlanViewModel {
  const candidateRows = results.map((result): LocalModelSelectedArtifactBenchmarkPlanRow => ({
    candidateId: result.candidateId, candidateTier: result.candidateTier, modelClass: result.modelClass, exactModelName: result.exactModelName,
    status: result.status, statusLabel: label(result.status),
    planSummary: `${result.humanPlanDecisionRecorded ? 1 : 0} plan decisions · ${result.benchmarkPlanApproved ? 1 : 0} approved plans · ${result.benchmarkExecutionStarted ? 1 : 0} executions started · ${result.benchmarkMeasurementsRecorded ? 1 : 0} measurements recorded`,
    benchmarkPlanApproved: result.benchmarkPlanApproved, benchmarkExecutionStarted: false, benchmarkPassed: false, modelActive: false,
  }));
  return {
    heading: 'Selected Artifact Benchmark Evidence Plan Boundary',
    artifactApprovalSummary: 'No artifact approval is complete',
    benchmarkPlanSummary: 'Benchmark planning is unavailable · No benchmark plan has been approved',
    measurementBoundarySummary: 'No benchmark measurements are recorded',
    executionBoundarySummary: 'No benchmark has started · No benchmark has passed · No download available · No runtime ready · No model active · Production execution remains unavailable',
    fallbackSummary: 'Deterministic fallback remains required',
    candidateRows,
    aggregate: {
      totalCandidates: results.length,
      unavailablePlanSessions: results.filter((item) => item.status === 'unavailable').length,
      awaitingPlanReviewCandidates: results.filter((item) => item.status === 'awaiting-plan-review').length,
      benchmarkPlanApprovedCandidates: results.filter((item) => item.status === 'benchmark-plan-approved').length,
      moreEvidenceRequestedCandidates: results.filter((item) => item.status === 'more-evidence-requested').length,
      rejectedCandidates: results.filter((item) => item.status === 'rejected').length,
      invalidatedCandidates: results.filter((item) => item.status === 'invalidated').length,
      attentionRequiredCandidates: results.filter((item) => item.status === 'attention-required').length,
      benchmarkPlansRecorded: results.filter((item) => item.humanPlanDecisionRecorded).length,
      candidatesEligibleForFutureBenchmarkExecutionReview: results.filter((item) => item.canProceedToFutureBenchmarkExecutionReview).length,
      benchmarkExecutionsStarted: results.filter((item) => item.benchmarkExecutionStarted).length,
      benchmarkExecutionsCompleted: results.filter((item) => item.benchmarkExecutionCompleted).length,
      benchmarkMeasurementsRecorded: results.filter((item) => item.benchmarkMeasurementsRecorded).length,
      benchmarkPassedCandidates: results.filter((item) => item.benchmarkPassed).length,
      benchmarkFailedCandidates: results.filter((item) => item.benchmarkFailed).length,
      checksumVerifiedArtifacts: results.filter((item) => item.checksumVerified).length,
      downloadableArtifacts: results.filter((item) => item.downloadable).length,
      runtimeReadyArtifacts: results.filter((item) => item.runtimeReady).length,
      activeModels: results.filter((item) => item.modelActive).length,
    },
    blockers: unique(results.flatMap((item) => item.blockers)), warnings: unique(results.flatMap((item) => item.warnings)),
    documentPath: 'docs/ai/phase-5-selected-artifact-benchmark-plan.md', benchmarkPlanBoundaryOnly: true,
    benchmarkExecutionStarted: false, benchmarkPassed: false, modelActive: false,
  };
}
