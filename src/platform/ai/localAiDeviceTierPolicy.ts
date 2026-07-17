import { AI_FEATURE_REGISTRY } from './aiFeatureRegistry.ts';
import type {
  LocalAiAccessTier,
  LocalAiDeviceProfile,
  LocalAiDeviceTier,
  LocalAiDeviceTierGateResult,
  LocalAiModelTier,
  LocalAiTierBenchmarkStatus,
} from './localAiDeviceTierTypes.ts';

export interface EvaluateLocalAiDeviceTierGateInput {
  readonly profile: LocalAiDeviceProfile;
  readonly accessTier?: LocalAiAccessTier;
  readonly benchmarkStatusByModelTier?: Partial<Record<LocalAiModelTier, LocalAiTierBenchmarkStatus>>;
}

const MODEL_TIERS: readonly LocalAiModelTier[] = ['light', 'standard', 'pro'] as const;

const modelTierRank: Record<LocalAiModelTier, number> = {
  light: 1,
  standard: 2,
  pro: 3,
};

const entitlementMaxTier: Record<LocalAiAccessTier, LocalAiModelTier> = {
  free: 'light',
  starter: 'light',
  plus: 'standard',
  pro: 'pro',
  lifetime: 'pro',
  'admin-granted': 'pro',
};

function classifyDevice(profile: LocalAiDeviceProfile): {
  tier: LocalAiDeviceTier;
  maxModelTier: LocalAiModelTier | null;
  reasons: string[];
} {
  const ram = profile.approxRamGb;

  if (ram === null || !Number.isFinite(ram) || ram < 0) {
    return {
      tier: 'ultra-low',
      maxModelTier: null,
      reasons: ['Approximate memory is unknown or invalid, so the policy applies the ultra-low tier conservatively.'],
    };
  }

  if (ram <= 2) {
    return {
      tier: 'ultra-low',
      maxModelTier: null,
      reasons: [`The profile reports ${ram} GB memory, so local model download is disabled.`],
    };
  }

  if (ram <= 4) {
    const storageReason = profile.storageKind === 'hdd' ? ' with HDD storage' : '';
    return {
      tier: 'light',
      maxModelTier: 'light',
      reasons: [`A ${ram} GB profile${storageReason} is limited to the light device tier.`],
    };
  }

  const desktopClass = profile.deviceKind === 'desktop' || profile.deviceKind === 'laptop';
  if (
    ram >= 16
    && profile.storageKind === 'ssd'
    && desktopClass
    && profile.webGpuStatus === 'supported'
  ) {
    return {
      tier: 'pro',
      maxModelTier: 'pro',
      reasons: ['At least 16 GB memory, SSD storage, desktop-class hardware, and confirmed WebGPU support permit pro-tier evaluation.'],
    };
  }

  if (ram >= 8 && profile.storageKind === 'ssd') {
    return {
      tier: 'standard',
      maxModelTier: 'standard',
      reasons: ['At least 8 GB memory with SSD storage permits standard-tier evaluation.'],
    };
  }

  return {
    tier: 'light',
    maxModelTier: 'light',
    reasons: ['The profile does not meet the standard-tier memory and SSD combination, so it remains light.'],
  };
}

function modelTiersAtOrBelow(maxTier: LocalAiModelTier | null): LocalAiModelTier[] {
  if (maxTier === null) return [];
  return MODEL_TIERS.filter((tier) => modelTierRank[tier] <= modelTierRank[maxTier]);
}

function buildUserFacingSummary(
  assignedTier: LocalAiDeviceTier,
  canAttemptModelDownload: boolean,
): string {
  if (assignedTier === 'ultra-low') {
    return 'Full AI feature UI remains available. This device uses deterministic fallback and does not attempt a local model.';
  }

  if (canAttemptModelDownload) {
    return `Full AI feature UI remains available. The ${assignedTier} device tier may attempt only benchmark-verified model tiers; no model is active by this policy alone.`;
  }

  return `Full AI feature UI remains available. The ${assignedTier} device tier is a candidate classification only; no model is active until browser checks, approval, and benchmark gates pass.`;
}

export function evaluateLocalAiDeviceTierGate(
  input: EvaluateLocalAiDeviceTierGateInput,
): LocalAiDeviceTierGateResult {
  const profile = input.profile;
  const accessTier = input.accessTier ?? 'free';
  const benchmarkStatusByModelTier: Record<LocalAiModelTier, LocalAiTierBenchmarkStatus> = {
    light: input.benchmarkStatusByModelTier?.light ?? 'not-run',
    standard: input.benchmarkStatusByModelTier?.standard ?? 'not-run',
    pro: input.benchmarkStatusByModelTier?.pro ?? 'not-run',
  };

  const classification = classifyDevice(profile);
  const accessMaxTier = entitlementMaxTier[accessTier];
  const hardwareTiers = modelTiersAtOrBelow(classification.maxModelTier);
  const warnings: string[] = [];
  const reasons = [...classification.reasons];

  const eligibleModelTiers = hardwareTiers.filter(
    (tier) => modelTierRank[tier] <= modelTierRank[accessMaxTier],
  );

  if (classification.maxModelTier !== null && modelTierRank[accessMaxTier] < modelTierRank[classification.maxModelTier]) {
    reasons.push(`The ${accessTier} access tier caps evaluation at the ${accessMaxTier} model tier.`);
  } else {
    reasons.push(`The ${accessTier} access tier does not bypass the device hardware limit.`);
  }

  if (accessTier === 'admin-granted') {
    reasons.push('Admin-granted access permits evaluation only; hardware and benchmark gates remain mandatory.');
  }

  if (profile.webGpuStatus === 'unsupported') {
    warnings.push('WebGPU is unsupported, so browser-local model attempts are blocked and the shell stays unavailable-safe.');
  } else if (profile.webGpuStatus === 'unchecked') {
    warnings.push('WebGPU is unchecked; a later capability probe and benchmark are required before any model attempt.');
  }

  const connectionKind = profile.connectionKind ?? 'unknown';
  if (connectionKind === 'cellular') {
    warnings.push('A cellular connection blocks model download attempts.');
  } else if (connectionKind === 'offline') {
    warnings.push('The device is offline, so model download attempts are blocked.');
  } else if (connectionKind === 'unknown') {
    warnings.push('Connection metadata is unchecked; confirm Wi-Fi before a model download attempt.');
  }

  const batteryLevel = profile.batteryLevelPercent ?? null;
  const batteryMetadataInvalid = batteryLevel !== null
    && (!Number.isFinite(batteryLevel) || batteryLevel < 0 || batteryLevel > 100);
  if (batteryMetadataInvalid) {
    warnings.push('Battery metadata is invalid or unchecked, so model download attempts are blocked.');
  } else if (batteryLevel !== null && batteryLevel < 15) {
    warnings.push('Battery is below 15 percent, so model download attempts are blocked.');
  }

  const thermalStatus = profile.thermalStatus ?? 'unknown';
  if (thermalStatus === 'hot') {
    warnings.push('Thermal status is hot, so model download attempts are blocked.');
  }

  for (const tier of eligibleModelTiers) {
    const benchmarkStatus = benchmarkStatusByModelTier[tier];
    if (benchmarkStatus === 'failed') {
      warnings.push(`The ${tier} benchmark failed, so that model tier remains locked.`);
    }
  }

  const allowedModelTiers = profile.webGpuStatus === 'supported'
    ? eligibleModelTiers.filter((tier) => benchmarkStatusByModelTier[tier] === 'passed')
    : [];
  const blockedModelTiers = MODEL_TIERS.filter((tier) => !allowedModelTiers.includes(tier));
  const hasPendingOrFailedBenchmark = eligibleModelTiers.some(
    (tier) => benchmarkStatusByModelTier[tier] !== 'passed',
  );

  if (eligibleModelTiers.length > 0 && hasPendingOrFailedBenchmark) {
    warnings.push('A verified benchmark pass is required before each allowed model tier can be attempted.');
  }

  const unsafeDownloadCondition =
    profile.webGpuStatus !== 'supported'
    || connectionKind !== 'wifi'
    || batteryMetadataInvalid
    || (batteryLevel !== null && batteryLevel < 15)
    || thermalStatus === 'hot';

  const canAttemptModelDownload =
    allowedModelTiers.length > 0
    && !unsafeDownloadCondition;

  const canAttempt4B =
    canAttemptModelDownload
    && allowedModelTiers.includes('pro')
    && benchmarkStatusByModelTier.pro === 'passed';

  const requiresBenchmarkBeforeModel =
    eligibleModelTiers.length > 0
    && (profile.webGpuStatus !== 'supported' || hasPendingOrFailedBenchmark);

  const fallbackMode = profile.webGpuStatus === 'unsupported'
    ? 'unavailable-safe'
    : canAttemptModelDownload
      ? 'local-model-eligible'
      : 'deterministic-fallback';

  return {
    assignedTier: classification.tier,
    eligibleModelTiers,
    allowedModelTiers,
    blockedModelTiers,
    fallbackMode,
    warnings,
    reasons,
    userFacingSummary: buildUserFacingSummary(classification.tier, canAttemptModelDownload),
    canAttemptModelDownload,
    canAttempt4B,
    requiresBenchmarkBeforeModel,
    featureAvailability: 'full-ui',
    visibleFeatureIds: AI_FEATURE_REGISTRY.map((feature) => feature.id),
  };
}
