import type { AICapabilityReport, AITier } from './aiCapabilityDetector.ts';
import type { LocalAIRuntimeAdapter } from './localRuntimeAdapter.ts';
import type { ModelArtifact } from './modelArtifactManifest.ts';

export const RUNTIME_PROVIDER_IDS = [
  'unavailable',
  'webllm',
  'transformers-js',
  'wasm-fallback',
  'cloud-boost',
] as const;

export type RuntimeProviderId = typeof RUNTIME_PROVIDER_IDS[number];

export type RuntimeProviderStatus =
  | 'unavailable'
  | 'not-implemented'
  | 'implemented';

export interface RuntimeProviderCapability {
  minimumTier: AITier;
  requiresWebGPU: boolean;
  requiresWasm: boolean;
  supportsOffline: boolean;
  runtimeIds: readonly string[];
  artifactFormats: readonly string[];
}

export interface LocalRuntimeProvider {
  readonly id: RuntimeProviderId;
  readonly status: RuntimeProviderStatus;
  readonly capability: RuntimeProviderCapability;
  createAdapter(): LocalAIRuntimeAdapter;
}

export interface RuntimeProviderFactory {
  create(providerId: RuntimeProviderId): LocalRuntimeProvider;
  list(): readonly LocalRuntimeProvider[];
}

export type RuntimeProviderBenchmarkStatus =
  | 'not-run'
  | 'pending'
  | 'passed'
  | 'failed';

export interface RuntimeProviderBenchmarkEvidence {
  status: RuntimeProviderBenchmarkStatus;
  evidenceRef?: string;
}

export interface RuntimeProviderUserApproval {
  runtimeUse: boolean;
  download: boolean;
}

export interface RuntimeProviderSelectionInput {
  capabilityReport: AICapabilityReport;
  artifact?: ModelArtifact;
  benchmark?: RuntimeProviderBenchmarkEvidence;
  userApproval?: RuntimeProviderUserApproval;
  preferredProviderIds?: readonly RuntimeProviderId[];
  factory?: RuntimeProviderFactory;
}

export type RuntimeProviderSelectionFailure =
  | 'artifact-not-approved'
  | 'artifact-not-installed'
  | 'artifact-integrity-invalid'
  | 'benchmark-not-passed'
  | 'license-not-verified'
  | 'user-approval-required'
  | 'download-permission-required'
  | 'insufficient-capability'
  | 'runtime-not-compatible'
  | 'runtime-not-implemented';

export type RuntimeProviderSelectionResult =
  | {
      status: 'selected';
      providerId: Exclude<RuntimeProviderId, 'unavailable'>;
      provider: LocalRuntimeProvider;
      artifact: ModelArtifact;
      reasons: readonly [];
    }
  | {
      status: 'unavailable';
      providerId: 'unavailable';
      provider: LocalRuntimeProvider;
      artifact?: ModelArtifact;
      reasons: readonly RuntimeProviderSelectionFailure[];
    };