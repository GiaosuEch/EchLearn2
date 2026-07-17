import type {
  EvaluateLocalModelCachePolicyInput,
  LocalModelCacheBudget,
  LocalModelCacheControlAction,
  LocalModelCachePolicyResult,
} from './localModelArtifactTypes.ts';

export const LOCAL_MODEL_CACHE_BUDGETS: Readonly<Record<
  EvaluateLocalModelCachePolicyInput['deviceTier'],
  LocalModelCacheBudget
>> = {
  'ultra-low': {
    tier: 'ultra-low',
    minimumModelCacheMb: 0,
    maximumModelCacheMb: 0,
    automaticEnable: false,
    budgetStatus: 'fixed-zero',
  },
  light: {
    tier: 'light',
    minimumModelCacheMb: 500,
    maximumModelCacheMb: 1024,
    automaticEnable: false,
    budgetStatus: 'bounded-candidate-budget',
  },
  standard: {
    tier: 'standard',
    minimumModelCacheMb: 1024,
    maximumModelCacheMb: 2048,
    automaticEnable: false,
    budgetStatus: 'bounded-candidate-budget',
  },
  pro: {
    tier: 'pro',
    minimumModelCacheMb: null,
    maximumModelCacheMb: null,
    automaticEnable: false,
    budgetStatus: 'requires-artifact-and-benchmark-review',
  },
} as const;

export const LOCAL_MODEL_CACHE_CONTROL_ACTIONS: readonly LocalModelCacheControlAction[] = [
  {
    plannedAction: 'estimate-storage',
    status: 'not-implemented',
    requiresExplicitUserAction: false,
    summary: 'A future storage probe must run before an artifact can be offered.',
  },
  {
    plannedAction: 'verify-checksum',
    status: 'not-implemented',
    requiresExplicitUserAction: false,
    summary: 'A future artifact manager must verify an approved integrity value before use.',
  },
  {
    plannedAction: 'delete-artifact-cache',
    status: 'not-implemented',
    requiresExplicitUserAction: true,
    summary: 'Users must be able to remove every local model artifact and its cache.',
  },
  {
    plannedAction: 'recover-corrupted-cache',
    status: 'not-implemented',
    requiresExplicitUserAction: true,
    summary: 'A future recovery flow deletes invalid cache data before an approved re-download.',
  },
] as const;

function hasValidBatteryMetadata(value: number | null): boolean {
  return value === null || (Number.isFinite(value) && value >= 0 && value <= 100);
}

export function evaluateLocalModelCachePolicy(
  input: EvaluateLocalModelCachePolicyInput,
): LocalModelCachePolicyResult {
  const cacheBudget = LOCAL_MODEL_CACHE_BUDGETS[input.deviceTier];
  const warnings: string[] = [];
  const reasons: string[] = [];

  if (input.deviceTier === 'ultra-low') {
    warnings.push('Ultra-low devices have a zero-megabyte local model cache budget.');
  }

  if (!input.deviceGateAllowsModelAttempt) {
    reasons.push('The adaptive device tier gate does not allow a model attempt.');
  }
  if (!input.artifactApproved) {
    reasons.push('Artifact approval is required before any future download attempt.');
  }
  if (!input.benchmarkApproved) {
    reasons.push('Benchmark approval is required before any future download attempt.');
  }
  if (!input.userConfirmedDownload) {
    reasons.push('Explicit user confirmation is required before any future artifact download.');
  }

  if (input.connectionKind === 'cellular') {
    warnings.push('Cellular connections block local model download attempts.');
  } else if (input.connectionKind === 'offline') {
    warnings.push('Offline devices cannot attempt an artifact download.');
  } else if (input.connectionKind === 'unknown') {
    warnings.push('Connection status is unknown, so download planning remains blocked.');
  }

  const batteryMetadataValid = hasValidBatteryMetadata(input.batteryLevelPercent);
  if (!batteryMetadataValid) {
    warnings.push('Battery metadata is invalid, so download planning remains blocked.');
  } else if (input.batteryLevelPercent !== null && input.batteryLevelPercent < 15) {
    warnings.push('Battery is below 15 percent, so download planning remains blocked.');
  }

  if (input.thermalStatus === 'hot') {
    warnings.push('Thermal status is hot, so download planning remains blocked.');
  }

  if (input.webGpuStatus === 'unsupported') {
    warnings.push('WebGPU is unsupported, so a browser-local model artifact is not offered.');
  } else if (input.webGpuStatus === 'unchecked') {
    warnings.push('WebGPU is unchecked, so a later capability probe is required.');
  }

  if (input.storageQuotaStatus === 'unknown') {
    warnings.push('Storage quota is unknown and requires user confirmation after a future estimate.');
  } else if (input.storageQuotaStatus === 'insufficient') {
    warnings.push('Available storage is insufficient for the planned cache budget.');
  }

  const requiresUserConfirmation =
    input.storageQuotaStatus === 'unknown'
    || !input.userConfirmedDownload;

  const canPlanFutureDownloadAttempt =
    input.deviceTier !== 'ultra-low'
    && input.deviceGateAllowsModelAttempt
    && input.artifactApproved
    && input.benchmarkApproved
    && input.userConfirmedDownload
    && input.connectionKind === 'wifi'
    && batteryMetadataValid
    && (input.batteryLevelPercent === null || input.batteryLevelPercent >= 15)
    && input.thermalStatus !== 'hot'
    && input.webGpuStatus === 'supported'
    && input.storageQuotaStatus === 'sufficient';

  return {
    cacheBudget,
    canPlanFutureDownloadAttempt,
    requiresUserConfirmation,
    userDeletionRequired: true,
    coreAppFallback: 'unaffected',
    corruptedCacheRecovery: 'delete-and-redownload-after-approval',
    warnings,
    reasons,
    userFacingSummary: canPlanFutureDownloadAttempt
      ? 'All policy prerequisites are represented, but this contract does not activate a model or perform a download.'
      : 'No model artifact action is active. The core app remains available through deterministic or unavailable-safe fallback.',
  };
}
