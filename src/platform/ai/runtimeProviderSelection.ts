import type { AICapabilityReport, AITier } from './aiCapabilityDetector.ts';
import {
  evaluateModelArtifactApproval,
  evaluateModelArtifactReadiness,
} from './modelArtifactManager.ts';
import type { ModelArtifact } from './modelArtifactManifest.ts';
import { createRuntimeProviderFactory } from './runtimeProviders.ts';
import type {
  LocalRuntimeProvider,
  RuntimeProviderFactory,
  RuntimeProviderId,
  RuntimeProviderSelectionFailure,
  RuntimeProviderSelectionInput,
  RuntimeProviderSelectionResult,
} from './runtimeProviderTypes.ts';

const selectableProviderIds: readonly Exclude<RuntimeProviderId, 'unavailable'>[] = [
  'webllm',
  'transformers-js',
  'wasm-fallback',
  'cloud-boost',
];

const tierRank: Record<AITier, number> = {
  unavailable: -1,
  basic: 0,
  'light-local': 1,
  'standard-local': 2,
  'pro-local': 3,
};

function addReason(
  reasons: RuntimeProviderSelectionFailure[],
  reason: RuntimeProviderSelectionFailure,
): void {
  if (!reasons.includes(reason)) reasons.push(reason);
}

function nonEmpty(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function unavailableResult(
  factory: RuntimeProviderFactory,
  reasons: RuntimeProviderSelectionFailure[],
  artifact?: ModelArtifact,
): RuntimeProviderSelectionResult {
  return {
    status: 'unavailable',
    providerId: 'unavailable',
    provider: factory.create('unavailable'),
    artifact,
    reasons,
  };
}

function collectGovernanceReasons(
  input: RuntimeProviderSelectionInput,
): RuntimeProviderSelectionFailure[] {
  const reasons: RuntimeProviderSelectionFailure[] = [];
  const artifact = input.artifact;

  if (!artifact) {
    addReason(reasons, 'artifact-not-approved');
  } else {
    const approval = evaluateModelArtifactApproval(artifact);
    if (approval.status === 'not-approved') {
      addReason(
        reasons,
        approval.reason === 'license-not-verified'
          ? 'license-not-verified'
          : 'artifact-not-approved',
      );
    }
  }

  if (
    input.benchmark?.status !== 'passed'
    || !nonEmpty(input.benchmark.evidenceRef)
  ) {
    addReason(reasons, 'benchmark-not-passed');
  }

  if (input.userApproval?.runtimeUse !== true) {
    addReason(reasons, 'user-approval-required');
  }
  if (input.userApproval?.download !== true) {
    addReason(reasons, 'download-permission-required');
  }

  return reasons;
}

function collectReadinessReasons(
  report: AICapabilityReport,
  artifact: ModelArtifact,
  reasons: RuntimeProviderSelectionFailure[],
): void {
  const readiness = evaluateModelArtifactReadiness(report, artifact);
  if (readiness.status === 'ready') return;

  if (readiness.status === 'not-installed') {
    addReason(reasons, 'artifact-not-installed');
    return;
  }

  switch (readiness.reason) {
    case 'model-not-approved':
      addReason(reasons, 'artifact-not-approved');
      break;
    case 'model-corrupted':
    case 'model-update-required':
      addReason(reasons, 'artifact-integrity-invalid');
      break;
    case 'model-not-installed':
    case 'storage-unavailable':
      addReason(reasons, 'artifact-not-installed');
      break;
    default:
      addReason(reasons, 'insufficient-capability');
  }
}

function providerMatchesArtifact(
  provider: LocalRuntimeProvider,
  artifact: ModelArtifact,
): boolean {
  return (
    provider.capability.runtimeIds.includes(artifact.runtime.runtimeId)
    && provider.capability.artifactFormats.includes(artifact.runtime.format)
  );
}

function providerMatchesDevice(
  provider: LocalRuntimeProvider,
  report: AICapabilityReport,
): boolean {
  const capability = provider.capability;
  if (tierRank[report.tier] < tierRank[capability.minimumTier]) return false;
  if (
    capability.requiresWebGPU
    && (!report.capability.webgpu.supported
      || report.capability.webgpu.adapterAvailable !== true)
  ) {
    return false;
  }
  if (capability.requiresWasm && !report.capability.wasm.supported) return false;
  if (!capability.supportsOffline && !report.capability.network.online) return false;
  return true;
}

function requestedProviderIds(
  preferred: readonly RuntimeProviderId[] | undefined,
): readonly Exclude<RuntimeProviderId, 'unavailable'>[] {
  if (!preferred) return selectableProviderIds;
  return [...new Set(preferred)]
    .filter((providerId): providerId is Exclude<RuntimeProviderId, 'unavailable'> => (
      providerId !== 'unavailable'
    ));
}

export function selectRuntimeProvider(
  input: RuntimeProviderSelectionInput,
): RuntimeProviderSelectionResult {
  const factory = input.factory ?? createRuntimeProviderFactory();
  const reasons = collectGovernanceReasons(input);
  const artifact = input.artifact;

  if (!artifact) return unavailableResult(factory, reasons);
  if (evaluateModelArtifactApproval(artifact).status === 'approved') {
    collectReadinessReasons(input.capabilityReport, artifact, reasons);
  }
  if (reasons.length > 0) return unavailableResult(factory, reasons, artifact);

  let foundRuntimeMatch = false;
  let foundDeviceMatch = false;
  let foundUnimplementedProvider = false;

  for (const providerId of requestedProviderIds(input.preferredProviderIds)) {
    const provider = factory.create(providerId);
    if (!providerMatchesArtifact(provider, artifact)) continue;
    foundRuntimeMatch = true;
    if (!providerMatchesDevice(provider, input.capabilityReport)) continue;
    foundDeviceMatch = true;
    if (provider.status !== 'implemented') {
      foundUnimplementedProvider = true;
      continue;
    }

    return {
      status: 'selected',
      providerId,
      provider,
      artifact,
      reasons: [],
    };
  }

  if (!foundRuntimeMatch) addReason(reasons, 'runtime-not-compatible');
  else if (!foundDeviceMatch) addReason(reasons, 'insufficient-capability');
  else if (foundUnimplementedProvider) addReason(reasons, 'runtime-not-implemented');
  else addReason(reasons, 'runtime-not-compatible');

  return unavailableResult(factory, reasons, artifact);
}