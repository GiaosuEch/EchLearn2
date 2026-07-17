import { evaluateLocalAiDeviceTierGate } from './localAiDeviceTierPolicy.ts';
import type {
  LocalAiModelTier,
  LocalAiTierBenchmarkStatus,
} from './localAiDeviceTierTypes.ts';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from './localModelApprovalRegistry.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from './localModelArtifactManifest.ts';
import { evaluateLocalModelCachePolicy } from './localModelCachePolicy.ts';
import type { LocalModelStorageQuotaStatus } from './localModelArtifactTypes.ts';
import {
  mapLocalRuntimeCapabilityToDeviceProfile,
} from './localRuntimeCapabilityProbe.ts';
import type {
  BuildCurrentLocalModelAcquisitionPreflightInput,
  CurrentLocalModelAcquisitionPreflightResult,
  LocalModelAcquisitionBlockerId,
  LocalModelAcquisitionPreflightInput,
  LocalModelAcquisitionPreflightResult,
} from './localModelAcquisitionTypes.ts';

function appendUnique<T>(items: T[], item: T): void {
  if (!items.includes(item)) items.push(item);
}

function isBatteryUnsafe(value: number | null): boolean {
  return value !== null
    && (!Number.isFinite(value) || value < 15 || value > 100);
}

function isManifestArtifactApproved(status: string | undefined): boolean {
  return status === 'approved';
}

export function deriveLocalModelStorageQuotaStatus(
  estimatedRemainingMb: number | null,
  requiredArtifactSizeMb: number | null,
): LocalModelStorageQuotaStatus {
  if (
    estimatedRemainingMb === null
    || requiredArtifactSizeMb === null
    || !Number.isFinite(estimatedRemainingMb)
    || !Number.isFinite(requiredArtifactSizeMb)
    || estimatedRemainingMb < 0
    || requiredArtifactSizeMb < 0
  ) {
    return 'unknown';
  }

  return estimatedRemainingMb >= requiredArtifactSizeMb
    ? 'sufficient'
    : 'insufficient';
}

export function evaluateLocalModelAcquisitionPreflight(
  input: LocalModelAcquisitionPreflightInput,
): LocalModelAcquisitionPreflightResult {
  const prerequisiteBlockers: LocalModelAcquisitionBlockerId[] = [];

  if (!input.candidateSelected) {
    appendUnique(prerequisiteBlockers, 'candidate-not-selected');
  } else if (!input.candidateExists) {
    appendUnique(prerequisiteBlockers, 'candidate-not-found');
  }

  if (!input.artifactExists) {
    appendUnique(prerequisiteBlockers, 'artifact-not-found');
  } else {
    if (!input.candidateArtifactMatches) {
      appendUnique(prerequisiteBlockers, 'candidate-artifact-mismatch');
    }
    if (!input.candidateTierMatches) {
      appendUnique(prerequisiteBlockers, 'candidate-tier-mismatch');
    }
  }

  if (!input.modelApproved) appendUnique(prerequisiteBlockers, 'model-approval-pending');
  if (!input.licenseApproved) appendUnique(prerequisiteBlockers, 'license-approval-pending');
  if (!input.artifactApproved) appendUnique(prerequisiteBlockers, 'artifact-approval-pending');

  if (!input.artifactDownloadable) appendUnique(prerequisiteBlockers, 'artifact-not-downloadable');
  if (!input.artifactCacheable) appendUnique(prerequisiteBlockers, 'artifact-not-cacheable');
  if (!input.artifactRuntimeReady) appendUnique(prerequisiteBlockers, 'artifact-runtime-not-ready');
  if (input.checksumStatus !== 'verified') appendUnique(prerequisiteBlockers, 'checksum-missing');
  if (input.downloadLocationStatus !== 'approved') appendUnique(prerequisiteBlockers, 'download-location-absent');

  if (input.benchmarkStatus !== 'passed') appendUnique(prerequisiteBlockers, 'benchmark-not-passed');

  if (input.deviceTier === 'ultra-low' || !input.deviceGateAllowsCandidate) {
    appendUnique(prerequisiteBlockers, 'device-tier-blocked');
  }
  if (!input.candidateTierAllowed) {
    appendUnique(prerequisiteBlockers, 'candidate-tier-not-allowed');
  }

  if (input.webGpuStatus !== 'supported') appendUnique(prerequisiteBlockers, 'webgpu-not-supported');
  if (input.connectionKind !== 'wifi') appendUnique(prerequisiteBlockers, 'connection-not-wifi');
  if (isBatteryUnsafe(input.batteryLevelPercent)) appendUnique(prerequisiteBlockers, 'battery-unsafe');
  if (input.thermalStatus === 'hot') appendUnique(prerequisiteBlockers, 'thermal-hot');

  if (input.storageQuotaStatus === 'unknown') {
    appendUnique(prerequisiteBlockers, 'storage-unknown');
  } else if (input.storageQuotaStatus === 'insufficient') {
    appendUnique(prerequisiteBlockers, 'storage-insufficient');
  }

  const blockers = [...prerequisiteBlockers];
  const prerequisitesPassed = prerequisiteBlockers.length === 0;

  if (prerequisitesPassed && input.confirmationStatus === 'confirmed') {
    if (!input.cachePolicyResult.canPlanFutureDownloadAttempt) {
      appendUnique(blockers, 'cache-policy-blocked');
    }
  } else if (prerequisitesPassed && input.confirmationStatus === 'not-requested') {
    appendUnique(blockers, 'user-confirmation-not-requested');
  } else if (input.confirmationStatus === 'declined') {
    appendUnique(blockers, 'user-confirmation-declined');
  }

  const canOfferUserConfirmation =
    prerequisitesPassed
    && input.confirmationStatus !== 'declined';
  const canPlanFutureAcquisition =
    prerequisitesPassed
    && input.confirmationStatus === 'confirmed'
    && input.cachePolicyResult.canPlanFutureDownloadAttempt;
  const status = canPlanFutureAcquisition
    ? 'preflight-passed'
    : canOfferUserConfirmation && input.confirmationStatus === 'not-requested'
      ? 'awaiting-user-confirmation'
      : 'blocked';

  return {
    status,
    candidateId: input.candidateId,
    candidateTier: input.candidateTier,
    blockers,
    warnings: [...input.cachePolicyResult.warnings],
    canOfferUserConfirmation,
    canPlanFutureAcquisition,
    requiresExplicitUserConfirmation: true,
    coreAppFallback: 'unaffected',
    featureAvailability: input.featureAvailability,
    policyOnly: true,
    downloadStarted: false,
    cacheWritten: false,
    runtimeInitialized: false,
    modelReady: false,
    modelActive: false,
    generatedOutputProduced: false,
  };
}

export function buildCurrentLocalModelAcquisitionPreflight(
  input: BuildCurrentLocalModelAcquisitionPreflightInput,
): CurrentLocalModelAcquisitionPreflightResult {
  const candidate = input.candidateId === null
    ? undefined
    : LOCAL_MODEL_APPROVAL_REGISTRY.find((item) => item.candidateId === input.candidateId);
  const artifact = candidate === undefined
    ? undefined
    : LOCAL_MODEL_ARTIFACT_MANIFEST.find((item) => item.candidateId === candidate.candidateId);
  const profile = mapLocalRuntimeCapabilityToDeviceProfile(input.runtimeCapability);
  const requestedBenchmarkStatus: Record<LocalAiModelTier, LocalAiTierBenchmarkStatus> = {
    light: input.benchmarkStatusByModelTier?.light ?? 'not-run',
    standard: input.benchmarkStatusByModelTier?.standard ?? 'not-run',
    pro: input.benchmarkStatusByModelTier?.pro ?? 'not-run',
  };
  const effectiveBenchmarkStatus: Record<LocalAiModelTier, LocalAiTierBenchmarkStatus> = {
    light: 'not-run',
    standard: 'not-run',
    pro: 'not-run',
  };

  if (candidate?.benchmarkApproved) {
    effectiveBenchmarkStatus[candidate.tier] = requestedBenchmarkStatus[candidate.tier];
  }

  const deviceGate = evaluateLocalAiDeviceTierGate({
    profile,
    accessTier: input.accessTier ?? 'free',
    benchmarkStatusByModelTier: effectiveBenchmarkStatus,
  });
  const candidateTier = candidate?.tier ?? null;
  const benchmarkStatus = candidateTier === null
    ? 'not-run'
    : effectiveBenchmarkStatus[candidateTier];
  const candidateTierEligible = candidateTier !== null
    && deviceGate.eligibleModelTiers.includes(candidateTier);
  const candidateTierAllowed = candidateTier !== null
    && deviceGate.allowedModelTiers.includes(candidateTier);
  const deviceGateAllowsCandidate = candidateTierAllowed
    && deviceGate.canAttemptModelDownload;
  const storageQuotaStatus = deriveLocalModelStorageQuotaStatus(
    input.runtimeCapability.estimatedRemainingMb,
    artifact?.estimatedDownloadSizeMb ?? null,
  );
  const artifactApproved = Boolean(
    candidate?.artifactApproved
    && isManifestArtifactApproved(artifact?.approvalStatus),
  );
  const confirmationStatus = input.confirmationStatus ?? 'not-requested';
  const cachePolicy = evaluateLocalModelCachePolicy({
    deviceTier: deviceGate.assignedTier,
    deviceGateAllowsModelAttempt: deviceGateAllowsCandidate,
    artifactApproved,
    benchmarkApproved: benchmarkStatus === 'passed',
    userConfirmedDownload: confirmationStatus === 'confirmed',
    connectionKind: profile.connectionKind ?? 'unknown',
    batteryLevelPercent: profile.batteryLevelPercent ?? null,
    thermalStatus: profile.thermalStatus ?? 'unknown',
    webGpuStatus: profile.webGpuStatus,
    storageQuotaStatus,
  });
  const preflight = evaluateLocalModelAcquisitionPreflight({
    candidateId: input.candidateId,
    candidateTier,
    candidateSelected: input.candidateId !== null,
    candidateExists: candidate !== undefined,
    artifactExists: artifact !== undefined,
    candidateArtifactMatches: Boolean(candidate && artifact && candidate.candidateId === artifact.candidateId),
    candidateTierMatches: Boolean(candidate && artifact && candidate.tier === artifact.modelTier),
    modelApproved: candidate?.approved ?? false,
    licenseApproved: candidate?.licenseApproved ?? false,
    artifactApproved,
    artifactDownloadable: Boolean(candidate?.downloadable && artifact?.downloadable),
    artifactCacheable: artifact?.cacheable ?? false,
    artifactRuntimeReady: Boolean(
      candidate?.runtimeReady
      && candidate.configuredForRuntime
      && artifact?.runtimeReady,
    ),
    checksumStatus: artifact?.checksumStatus ?? 'missing',
    downloadLocationStatus: artifact?.downloadUrlStatus ?? 'absent',
    benchmarkStatus,
    deviceTier: deviceGate.assignedTier,
    deviceGateAllowsCandidate,
    candidateTierEligible,
    candidateTierAllowed,
    webGpuStatus: profile.webGpuStatus,
    connectionKind: profile.connectionKind ?? 'unknown',
    batteryLevelPercent: profile.batteryLevelPercent ?? null,
    thermalStatus: profile.thermalStatus ?? 'unknown',
    storageQuotaStatus,
    confirmationStatus,
    cachePolicyResult: cachePolicy,
    featureAvailability: deviceGate.featureAvailability,
  });
  const warnings = [...preflight.warnings];
  for (const warning of deviceGate.warnings) appendUnique(warnings, warning);

  return {
    ...preflight,
    warnings,
    candidateDisplayName: candidate?.displayName ?? 'No candidate selected',
    parameterScaleLabel: candidate?.parameterScaleLabel ?? null,
    artifactId: artifact?.artifactId ?? null,
    storageQuotaStatus,
    benchmarkStatus,
    deviceGate,
    cachePolicy,
  };
}
