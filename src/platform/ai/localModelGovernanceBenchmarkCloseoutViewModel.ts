import { buildLocalModelGovernanceBenchmarkCloseout } from './localModelGovernanceBenchmarkCloseout.ts';
import type {
  LocalModelGovernanceBenchmarkCloseoutAggregate,
  LocalModelGovernanceBenchmarkCloseoutFinding,
  LocalModelGovernanceBenchmarkCloseoutResult,
  LocalModelGovernanceBenchmarkCloseoutStatus,
} from './localModelGovernanceBenchmarkCloseoutTypes.ts';

export interface LocalModelGovernanceBenchmarkCloseoutViewModel {
  readonly heading: string;
  readonly status: LocalModelGovernanceBenchmarkCloseoutStatus;
  readonly phaseStatusSummary: string;
  readonly governanceSummary: string;
  readonly artifactReviewSummary: string;
  readonly integritySummary: string;
  readonly benchmarkPlanningSummary: string;
  readonly benchmarkExecutionSummary: string;
  readonly runtimeBoundarySummary: string;
  readonly fallbackSummary: string;
  readonly featureParitySummary: string;
  readonly candidateRows: readonly {
    candidateId: string; candidateTier: string; modelClass: string; exactModelName: string;
    repositoryId: string | null; revision: string | null; identityConsistent: boolean;
    fallbackAvailable: boolean; featureParityPreserved: boolean; modelActive: false;
  }[];
  readonly aggregate: LocalModelGovernanceBenchmarkCloseoutAggregate;
  readonly findings: readonly LocalModelGovernanceBenchmarkCloseoutFinding[];
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly documentPath: string;
  readonly closeoutOnly: true;
  readonly modelReadinessEstablished: false;
  readonly runtimeReadinessEstablished: false;
  readonly modelActive: false;
}

export function buildLocalModelGovernanceBenchmarkCloseoutViewModel(
  result: LocalModelGovernanceBenchmarkCloseoutResult = buildLocalModelGovernanceBenchmarkCloseout(),
): LocalModelGovernanceBenchmarkCloseoutViewModel {
  return {
    heading: 'Model Governance & Benchmark Planning Safety Closeout',
    status: result.status,
    phaseStatusSummary: result.phase5FoundationComplete
      ? 'Phase 5 foundation is complete · Production remains blocked-safe'
      : 'Phase 5 closeout requires attention',
    governanceSummary: 'Governance evidence and review boundaries are connected · Human governance decisions are not recorded',
    artifactReviewSummary: 'No artifact has been selected or approved',
    integritySummary: 'No checksum has been verified',
    benchmarkPlanningSummary: 'No benchmark plan has been approved',
    benchmarkExecutionSummary: 'No benchmark has started · No benchmark measurements are recorded · No benchmark has passed',
    runtimeBoundarySummary: 'Model readiness is not established · Runtime readiness is not established · No download available · No model active · Production execution remains unavailable',
    fallbackSummary: 'Deterministic fallback remains available',
    featureParitySummary: 'AI feature parity remains preserved',
    candidateRows: result.candidates.map((candidate) => ({
      candidateId: candidate.candidateId,
      candidateTier: candidate.candidateTier,
      modelClass: candidate.modelClass,
      exactModelName: candidate.exactModelName,
      repositoryId: candidate.officialRepositoryId,
      revision: candidate.observedRevision,
      identityConsistent: candidate.candidateIdentityConsistent,
      fallbackAvailable: candidate.deterministicFallbackAvailable,
      featureParityPreserved: candidate.featureParityPreserved,
      modelActive: false,
    })),
    aggregate: result.aggregate,
    findings: result.findings,
    blockers: result.blockers,
    warnings: result.warnings,
    documentPath: 'docs/ai/phase-5-model-governance-benchmark-closeout.md',
    closeoutOnly: true,
    modelReadinessEstablished: false,
    runtimeReadinessEstablished: false,
    modelActive: false,
  };
}
