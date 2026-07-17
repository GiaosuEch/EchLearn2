import { LOCAL_MODEL_ARTIFACT_MANIFEST } from './localModelArtifactManifest.ts';
import {
  LOCAL_MODEL_CACHE_BUDGETS,
  LOCAL_MODEL_CACHE_CONTROL_ACTIONS,
} from './localModelCachePolicy.ts';

export interface LocalModelArtifactCandidateViewModel {
  readonly artifactId: string;
  readonly displayName: string;
  readonly tierLabel: string;
  readonly statusLabel: string;
}

export interface LocalModelArtifactViewModel {
  readonly heading: string;
  readonly currentState: string;
  readonly cacheSummary: string;
  readonly recoverySummary: string;
  readonly integritySummary: string;
  readonly documentPath: string;
  readonly summary: {
    readonly totalArtifacts: number;
    readonly downloadableArtifacts: number;
    readonly cacheableArtifacts: number;
    readonly runtimeReadyArtifacts: number;
    readonly userDeletionRequired: true;
  };
  readonly artifacts: readonly LocalModelArtifactCandidateViewModel[];
  readonly cacheBudgetLabels: readonly string[];
  readonly plannedActions: readonly string[];
}

const tierLabels = {
  light: 'Light artifact candidate',
  standard: 'Standard artifact candidate',
  pro: 'Pro artifact candidate',
} as const;

export function buildLocalModelArtifactViewModel(): LocalModelArtifactViewModel {
  return {
    heading: 'Local model artifact and cache policy',
    currentState:
      'No artifact is approved, downloadable, cacheable, or ready for runtime use. Size, quantization, location, and integrity metadata remain unselected.',
    cacheSummary:
      'Ultra-low devices have zero model cache budget. Light and standard budgets are bounded planning limits; pro storage remains subject to artifact and benchmark review.',
    recoverySummary:
      'User-controlled deletion is required. A future corrupted-cache flow must delete invalid data before an approved re-download while the core app remains available.',
    integritySummary:
      'Integrity verification is required, but no approved value or artifact location exists in this phase.',
    documentPath: 'docs/ai/phase-4-model-artifact-cache-policy.md',
    summary: {
      totalArtifacts: LOCAL_MODEL_ARTIFACT_MANIFEST.length,
      downloadableArtifacts: LOCAL_MODEL_ARTIFACT_MANIFEST.filter((artifact) => artifact.downloadable).length,
      cacheableArtifacts: LOCAL_MODEL_ARTIFACT_MANIFEST.filter((artifact) => artifact.cacheable).length,
      runtimeReadyArtifacts: LOCAL_MODEL_ARTIFACT_MANIFEST.filter((artifact) => artifact.runtimeReady).length,
      userDeletionRequired: true,
    },
    artifacts: LOCAL_MODEL_ARTIFACT_MANIFEST.map((artifact) => ({
      artifactId: artifact.artifactId,
      displayName: artifact.displayName,
      tierLabel: tierLabels[artifact.modelTier],
      statusLabel: 'Candidate only · not downloadable',
    })),
    cacheBudgetLabels: Object.values(LOCAL_MODEL_CACHE_BUDGETS).map((budget) => (
      budget.maximumModelCacheMb === null
        ? `${budget.tier}: requires artifact and benchmark review`
        : `${budget.tier}: up to ${budget.maximumModelCacheMb} MB`
    )),
    plannedActions: LOCAL_MODEL_CACHE_CONTROL_ACTIONS.map((action) => (
      `${action.plannedAction}: ${action.status}`
    )),
  };
}
