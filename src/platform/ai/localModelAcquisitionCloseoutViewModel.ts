import type {
  LocalModelAcquisitionCloseoutCheck,
  LocalModelAcquisitionCloseoutResult,
} from './localModelAcquisitionCloseoutTypes.ts';

export interface LocalModelAcquisitionCloseoutViewModel {
  readonly heading: 'Phase 4 Local Model Acquisition Safety Closeout';
  readonly statusLabel: 'Safety closeout passed' | 'Safety closeout requires attention';
  readonly foundationSummary: 'Phase 4 acquisition foundation complete' | 'Phase 4 acquisition foundation requires attention';
  readonly productionExecutionSummary: 'Production model execution remains unavailable';
  readonly executorSummary: 'Production executor unavailable';
  readonly approvalSummary: 'No model approved';
  readonly benchmarkSummary: 'No benchmark passed';
  readonly downloadSummary: 'No download started';
  readonly cacheSummary: 'No cache written';
  readonly runtimeSummary: 'No runtime initialized';
  readonly modelStateSummary: 'No model active';
  readonly coreAppSummary: 'Core app remains available';
  readonly fallbackSummary: 'Deterministic fallback remains available';
  readonly checks: readonly LocalModelAcquisitionCloseoutCheck[];
  readonly aggregate: {
    readonly totalChecks: number;
    readonly passedChecks: number;
    readonly warningChecks: number;
    readonly failedChecks: number;
    readonly approvedCandidates: number;
    readonly downloadableCandidates: number;
    readonly consentAvailableCandidates: number;
    readonly authorizedCandidates: number;
    readonly executionEligibleCandidates: number;
    readonly downloadsStarted: number;
    readonly activeModels: number;
  };
  readonly warnings: readonly string[];
  readonly blockingIssues: readonly string[];
  readonly policyOnly: true;
  readonly documentPath: 'docs/ai/phase-4-local-model-acquisition-closeout.md';
}

export function buildLocalModelAcquisitionCloseoutViewModel(
  result: LocalModelAcquisitionCloseoutResult,
): LocalModelAcquisitionCloseoutViewModel {
  return {
    heading: 'Phase 4 Local Model Acquisition Safety Closeout',
    statusLabel: result.phaseFoundationComplete
      ? 'Safety closeout passed'
      : 'Safety closeout requires attention',
    foundationSummary: result.phaseFoundationComplete
      ? 'Phase 4 acquisition foundation complete'
      : 'Phase 4 acquisition foundation requires attention',
    productionExecutionSummary: 'Production model execution remains unavailable',
    executorSummary: 'Production executor unavailable',
    approvalSummary: 'No model approved',
    benchmarkSummary: 'No benchmark passed',
    downloadSummary: 'No download started',
    cacheSummary: 'No cache written',
    runtimeSummary: 'No runtime initialized',
    modelStateSummary: 'No model active',
    coreAppSummary: 'Core app remains available',
    fallbackSummary: 'Deterministic fallback remains available',
    checks: result.checks,
    aggregate: {
      totalChecks: result.checks.length,
      passedChecks: result.passedChecks,
      warningChecks: result.warningChecks,
      failedChecks: result.failedChecks,
      approvedCandidates: result.approvedCandidates,
      downloadableCandidates: result.downloadableCandidates,
      consentAvailableCandidates: result.consentAvailableCandidates,
      authorizedCandidates: result.authorizedCandidates,
      executionEligibleCandidates: result.executionEligibleCandidates,
      downloadsStarted: result.downloadsStarted,
      activeModels: result.activeModels,
    },
    warnings: result.warnings,
    blockingIssues: result.blockingIssues,
    policyOnly: true,
    documentPath: 'docs/ai/phase-4-local-model-acquisition-closeout.md',
  };
}
