import { LOCAL_MODEL_RUNTIME_DECISION } from './localModelRuntimeDecision.ts';

export interface LocalModelRuntimeDecisionViewModel {
  readonly statusLabel: string;
  readonly currentState: string;
  readonly candidateSummary: string;
  readonly candidateModelSummary: string;
  readonly phase42Summary: string;
  readonly phase43Summary: string;
  readonly rollbackSummary: string;
  readonly adrPath: string;
}

export function buildLocalModelRuntimeDecisionViewModel(): LocalModelRuntimeDecisionViewModel {
  const recommended = LOCAL_MODEL_RUNTIME_DECISION.runtimeOptions.find(
    (option) => option.id === LOCAL_MODEL_RUNTIME_DECISION.recommendedRuntimeId,
  );

  return {
    statusLabel: 'Proposed',
    currentState:
      'The runtime decision is not implemented, and no runtime or model candidate is approved.',
    candidateSummary:
      `${recommended?.label ?? 'Browser-local runtime'} is the leading candidate for validation, not an active runtime.`,
    candidateModelSummary:
      `${LOCAL_MODEL_RUNTIME_DECISION.modelCandidates.length} model tiers are research candidates only and remain unconfigured.`,
    phase42Summary:
      `${LOCAL_MODEL_RUNTIME_DECISION.phase42EntryCriteria.length} entry gates must pass before an isolated runtime proof of concept.`,
    phase43Summary:
      `${LOCAL_MODEL_RUNTIME_DECISION.phase43BenchmarkCriteria.length} benchmark checks are required before coach integration is considered.`,
    rollbackSummary: LOCAL_MODEL_RUNTIME_DECISION.rollbackPlan.description,
    adrPath: 'docs/ai/phase-4-local-model-runtime-adr.md',
  };
}
