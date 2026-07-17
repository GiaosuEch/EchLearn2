import { evaluateLocalAiDeviceTierGate } from './localAiDeviceTierPolicy.ts';
import type {
  LocalAiAccessTier,
  LocalAiDeviceProfile,
  LocalAiDeviceTier,
  LocalAiDeviceTierGateResult,
} from './localAiDeviceTierTypes.ts';
import { mapLocalRuntimeCapabilityToDeviceProfile } from './localRuntimeCapabilityProbe.ts';
import type { LocalRuntimeCapabilityResult } from './localRuntimeCapabilityTypes.ts';

export interface BuildLocalRuntimeCapabilityViewModelOptions {
  readonly accessTier?: LocalAiAccessTier;
}

export interface LocalRuntimeCapabilityViewModel {
  readonly heading: 'Runtime Capability Probe';
  readonly probeStatusLabel: string;
  readonly metadataSummary: 'Metadata only';
  readonly modelStateSummary: 'No model active';
  readonly candidateTierLabel: 'Candidate device tier';
  readonly candidateDeviceTier: LocalAiDeviceTier;
  readonly benchmarkSummary: 'Benchmark still required';
  readonly coreAppSummary: 'Core app remains available';
  readonly fallbackSummary: 'Deterministic fallback remains available';
  readonly documentPath: 'docs/ai/phase-4-runtime-capability-probe.md';
  readonly deviceProfile: LocalAiDeviceProfile;
  readonly tierGate: LocalAiDeviceTierGateResult;
  readonly warnings: readonly string[];
  readonly reasons: readonly string[];
  readonly metadataOnly: true;
  readonly modelActive: false;
  readonly benchmarkVerified: false;
  readonly canAttempt4B: false;
}

function unique(items: readonly string[]): string[] {
  return [...new Set(items)];
}

function statusLabel(status: LocalRuntimeCapabilityResult['probeStatus']): string {
  if (status === 'not-run') return 'Not run';
  if (status === 'completed') return 'Completed';
  return 'Metadata unavailable';
}

export function buildLocalRuntimeCapabilityViewModel(
  result: LocalRuntimeCapabilityResult,
  options: BuildLocalRuntimeCapabilityViewModelOptions = {},
): LocalRuntimeCapabilityViewModel {
  const deviceProfile = mapLocalRuntimeCapabilityToDeviceProfile(result);
  const tierGate = evaluateLocalAiDeviceTierGate({
    profile: deviceProfile,
    accessTier: options.accessTier ?? 'free',
    benchmarkStatusByModelTier: {
      light: 'not-run',
      standard: 'not-run',
      pro: 'not-run',
    },
  });

  return {
    heading: 'Runtime Capability Probe',
    probeStatusLabel: statusLabel(result.probeStatus),
    metadataSummary: 'Metadata only',
    modelStateSummary: 'No model active',
    candidateTierLabel: 'Candidate device tier',
    candidateDeviceTier: tierGate.assignedTier,
    benchmarkSummary: 'Benchmark still required',
    coreAppSummary: 'Core app remains available',
    fallbackSummary: 'Deterministic fallback remains available',
    documentPath: 'docs/ai/phase-4-runtime-capability-probe.md',
    deviceProfile,
    tierGate,
    warnings: unique([...result.warnings, ...tierGate.warnings]),
    reasons: unique([...result.reasons, ...tierGate.reasons]),
    metadataOnly: true,
    modelActive: false,
    benchmarkVerified: false,
    canAttempt4B: false,
  };
}
