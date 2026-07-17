import { LOCAL_MODEL_APPROVAL_REGISTRY } from './localModelApprovalRegistry.ts';
import {
  LOCAL_MODEL_BENCHMARK_BROWSER_CAPABILITY,
  LOCAL_MODEL_BENCHMARK_CORPUS,
  LOCAL_MODEL_BENCHMARK_DIMENSIONS,
  LOCAL_MODEL_BENCHMARK_LANGUAGES,
} from './localModelBenchmarkPlan.ts';

export interface LocalModelBenchmarkCandidateViewModel {
  readonly candidateId: string;
  readonly displayName: string;
  readonly tierLabel: string;
  readonly benchmarkStatusLabel: string;
  readonly benchmarkApproved: false;
}

export interface LocalModelBenchmarkViewModel {
  readonly heading: string;
  readonly currentState: string;
  readonly capabilityState: string;
  readonly nextRequiredAction: string;
  readonly documentPath: string;
  readonly summary: {
    readonly totalBenchmarkTasks: number;
    readonly languagesCovered: number;
    readonly completedBenchmarkResults: number;
    readonly approvedBenchmarkCandidates: number;
  };
  readonly candidates: readonly LocalModelBenchmarkCandidateViewModel[];
}

const tierLabels = {
  light: 'Light candidate',
  standard: 'Standard candidate',
  pro: 'Stronger-device candidate',
} as const;

export function buildLocalModelBenchmarkViewModel(): LocalModelBenchmarkViewModel {
  const completedBenchmarkResults = 0;
  const approvedBenchmarkCandidates = LOCAL_MODEL_APPROVAL_REGISTRY.filter(
    (candidate) => candidate.benchmarkApproved,
  ).length;

  return {
    heading: 'Local model benchmark plan',
    currentState:
      'Benchmark status is not run: no measurements have been recorded and no candidate has benchmark approval.',
    capabilityState:
      `Browser capability remains ${LOCAL_MODEL_BENCHMARK_BROWSER_CAPABILITY.navigatorGpuAvailable}; a later isolated probe must verify secure context, graphics support, adapter, device, and storage behavior.`,
    nextRequiredAction:
      'Run an isolated benchmark only after candidate, artifact, license, and runtime review gates receive approval.',
    documentPath: 'docs/ai/phase-4-local-model-benchmark-plan.md',
    summary: {
      totalBenchmarkTasks: LOCAL_MODEL_BENCHMARK_DIMENSIONS.length + LOCAL_MODEL_BENCHMARK_CORPUS.length,
      languagesCovered: LOCAL_MODEL_BENCHMARK_LANGUAGES.length,
      completedBenchmarkResults,
      approvedBenchmarkCandidates,
    },
    candidates: LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) => ({
      candidateId: candidate.candidateId,
      displayName: candidate.displayName,
      tierLabel: tierLabels[candidate.tier],
      benchmarkStatusLabel: 'Not run',
      benchmarkApproved: false,
    })),
  };
}
