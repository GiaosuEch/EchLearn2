import { createUnavailableLocalRuntimeAdapter } from './localRuntimeAdapter.ts';
import { RUNTIME_PROVIDER_IDS } from './runtimeProviderTypes.ts';
import type {
  LocalRuntimeProvider,
  RuntimeProviderCapability,
  RuntimeProviderFactory,
  RuntimeProviderId,
  RuntimeProviderStatus,
} from './runtimeProviderTypes.ts';

interface PlaceholderProviderDefinition {
  id: RuntimeProviderId;
  status: RuntimeProviderStatus;
  capability: RuntimeProviderCapability;
}

function createPlaceholderProvider(
  definition: PlaceholderProviderDefinition,
): LocalRuntimeProvider {
  return {
    id: definition.id,
    status: definition.status,
    capability: definition.capability,
    createAdapter: createUnavailableLocalRuntimeAdapter,
  };
}

export function createUnavailableRuntimeProvider(): LocalRuntimeProvider {
  return createPlaceholderProvider({
    id: 'unavailable',
    status: 'unavailable',
    capability: {
      minimumTier: 'unavailable',
      requiresWebGPU: false,
      requiresWasm: false,
      supportsOffline: true,
      runtimeIds: [],
      artifactFormats: [],
    },
  });
}

export function createWebLLMRuntimeProvider(): LocalRuntimeProvider {
  return createPlaceholderProvider({
    id: 'webllm',
    status: 'not-implemented',
    capability: {
      minimumTier: 'standard-local',
      requiresWebGPU: true,
      requiresWasm: false,
      supportsOffline: true,
      runtimeIds: ['webllm'],
      artifactFormats: ['webllm', 'mlc'],
    },
  });
}

export function createTransformersJSRuntimeProvider(): LocalRuntimeProvider {
  return createPlaceholderProvider({
    id: 'transformers-js',
    status: 'not-implemented',
    capability: {
      minimumTier: 'light-local',
      requiresWebGPU: false,
      requiresWasm: true,
      supportsOffline: true,
      runtimeIds: ['transformers-js'],
      artifactFormats: ['onnx', 'transformers-js'],
    },
  });
}

export function createWasmFallbackRuntimeProvider(): LocalRuntimeProvider {
  return createPlaceholderProvider({
    id: 'wasm-fallback',
    status: 'not-implemented',
    capability: {
      minimumTier: 'light-local',
      requiresWebGPU: false,
      requiresWasm: true,
      supportsOffline: true,
      runtimeIds: ['wasm-fallback'],
      artifactFormats: ['wasm'],
    },
  });
}

export function createCloudBoostRuntimeProvider(): LocalRuntimeProvider {
  return createPlaceholderProvider({
    id: 'cloud-boost',
    status: 'not-implemented',
    capability: {
      minimumTier: 'basic',
      requiresWebGPU: false,
      requiresWasm: false,
      supportsOffline: false,
      runtimeIds: ['cloud-boost'],
      artifactFormats: ['remote'],
    },
  });
}

const providerCreators: Record<RuntimeProviderId, () => LocalRuntimeProvider> = {
  unavailable: createUnavailableRuntimeProvider,
  webllm: createWebLLMRuntimeProvider,
  'transformers-js': createTransformersJSRuntimeProvider,
  'wasm-fallback': createWasmFallbackRuntimeProvider,
  'cloud-boost': createCloudBoostRuntimeProvider,
};

export function createRuntimeProviderFactory(): RuntimeProviderFactory {
  return {
    create(providerId: RuntimeProviderId): LocalRuntimeProvider {
      return providerCreators[providerId]();
    },
    list(): readonly LocalRuntimeProvider[] {
      return RUNTIME_PROVIDER_IDS.map(providerId => providerCreators[providerId]());
    },
  };
}