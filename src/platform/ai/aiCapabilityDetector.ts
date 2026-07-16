export type AITier = 'basic' | 'light-local' | 'standard-local' | 'pro-local' | 'unavailable';

export type AIUnavailableReason =
  | 'browser-unsupported'
  | 'webgpu-unavailable'
  | 'wasm-unavailable'
  | 'insufficient-capability'
  | 'capability-unknown'
  | 'storage-unavailable'
  | 'model-not-installed'
  | 'model-not-approved'
  | 'model-corrupted'
  | 'model-update-required'
  | 'runtime-not-installed';

export type BrowserName = 'chrome' | 'edge' | 'firefox' | 'safari' | 'other' | 'unknown';

export interface LocalRuntimeCapability {
  browser: {
    supported: boolean;
    name: BrowserName;
    userAgent?: string;
  };
  webgpu: {
    supported: boolean;
    adapterAvailable: boolean | null;
  };
  wasm: {
    supported: boolean;
  };
  device: {
    memoryGb?: number;
    hardwareConcurrency?: number;
  };
  network: {
    online: boolean;
  };
  storage: {
    localStorageAvailable: boolean;
    cacheStorageAvailable: boolean;
  };
}

export interface AICapabilityReport {
  tier: AITier;
  localAIAvailable: boolean;
  capability: LocalRuntimeCapability;
  limitations: AIUnavailableReason[];
}

export interface AICapabilityProbe {
  browserSupported?: boolean;
  userAgent?: string;
  webgpuSupported?: boolean;
  webgpuAdapterAvailable?: boolean | null;
  wasmSupported?: boolean;
  online?: boolean;
  localStorageAvailable?: boolean;
  cacheStorageAvailable?: boolean;
  deviceMemoryGb?: number;
  hardwareConcurrency?: number;
}

const MIN_MEMORY_GB = 1;
const MIN_CORES = 2;
const LIGHT_MEMORY_GB = 2;
const LIGHT_CORES = 2;
const STANDARD_MEMORY_GB = 4;
const STANDARD_CORES = 4;
const PRO_MEMORY_GB = 8;
const PRO_CORES = 8;

function isFinitePositive(value: number | undefined): value is number {
  return value !== undefined && Number.isFinite(value) && value > 0;
}

function browserName(userAgent?: string): BrowserName {
  if (!userAgent) return 'unknown';
  if (/edg\//i.test(userAgent)) return 'edge';
  if (/chrome|crios/i.test(userAgent)) return 'chrome';
  if (/firefox|fxios/i.test(userAgent)) return 'firefox';
  if (/safari/i.test(userAgent)) return 'safari';
  return 'other';
}

function canUseLocalStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage !== null;
  } catch {
    return false;
  }
}

function canUseCacheStorage(): boolean {
  return typeof caches !== 'undefined';
}

function defaultProbe(): AICapabilityProbe {
  const runtimeNavigator = typeof navigator === 'undefined'
    ? undefined
    : navigator as Navigator & { deviceMemory?: number; gpu?: unknown };

  return {
    browserSupported: typeof window !== 'undefined' && runtimeNavigator !== undefined,
    userAgent: runtimeNavigator?.userAgent,
    webgpuSupported: Boolean(runtimeNavigator?.gpu),
    webgpuAdapterAvailable: null,
    wasmSupported: typeof WebAssembly !== 'undefined',
    online: runtimeNavigator?.onLine ?? false,
    localStorageAvailable: canUseLocalStorage(),
    cacheStorageAvailable: canUseCacheStorage(),
    deviceMemoryGb: isFinitePositive(runtimeNavigator?.deviceMemory)
      ? runtimeNavigator.deviceMemory
      : undefined,
    hardwareConcurrency: isFinitePositive(runtimeNavigator?.hardwareConcurrency)
      ? runtimeNavigator.hardwareConcurrency
      : undefined,
  };
}

function normalizedProbe(probe?: AICapabilityProbe) {
  const merged = { ...defaultProbe(), ...(probe ?? {}) };
  return {
    browserSupported: Boolean(merged.browserSupported),
    userAgent: merged.userAgent,
    webgpuSupported: Boolean(merged.webgpuSupported),
    webgpuAdapterAvailable: merged.webgpuAdapterAvailable ?? null,
    wasmSupported: Boolean(merged.wasmSupported),
    online: Boolean(merged.online),
    localStorageAvailable: Boolean(merged.localStorageAvailable),
    cacheStorageAvailable: Boolean(merged.cacheStorageAvailable),
    deviceMemoryGb: isFinitePositive(merged.deviceMemoryGb) ? merged.deviceMemoryGb : undefined,
    hardwareConcurrency: isFinitePositive(merged.hardwareConcurrency)
      ? Math.floor(merged.hardwareConcurrency)
      : undefined,
  };
}

function hasUsableWebGPU(capability: LocalRuntimeCapability): boolean {
  return capability.webgpu.supported && capability.webgpu.adapterAvailable !== false;
}

function hasKnownMinimumResources(capability: LocalRuntimeCapability): boolean {
  const memoryOkay = capability.device.memoryGb === undefined
    || capability.device.memoryGb >= MIN_MEMORY_GB;
  const coresOkay = capability.device.hardwareConcurrency === undefined
    || capability.device.hardwareConcurrency >= MIN_CORES;
  return memoryOkay && coresOkay;
}

function hasKnownInsufficientResources(capability: LocalRuntimeCapability): boolean {
  return (
    (capability.device.memoryGb !== undefined && capability.device.memoryGb < MIN_MEMORY_GB)
    || (capability.device.hardwareConcurrency !== undefined
      && capability.device.hardwareConcurrency < MIN_CORES)
  );
}

function hasResourceEvidence(capability: LocalRuntimeCapability): boolean {
  return capability.device.memoryGb !== undefined
    && capability.device.hardwareConcurrency !== undefined;
}

function meetsLightProfile(capability: LocalRuntimeCapability): boolean {
  return (
    (capability.device.memoryGb ?? 0) >= LIGHT_MEMORY_GB
    && (capability.device.hardwareConcurrency ?? 0) >= LIGHT_CORES
  );
}

function meetsStandardProfile(capability: LocalRuntimeCapability): boolean {
  return (
    (capability.device.memoryGb ?? 0) >= STANDARD_MEMORY_GB
    && (capability.device.hardwareConcurrency ?? 0) >= STANDARD_CORES
  );
}

function meetsProProfile(capability: LocalRuntimeCapability): boolean {
  return (
    (capability.device.memoryGb ?? 0) >= PRO_MEMORY_GB
    && (capability.device.hardwareConcurrency ?? 0) >= PRO_CORES
  );
}

export function decideAITier(capability: LocalRuntimeCapability): AITier {
  if (!capability.browser.supported || !hasKnownMinimumResources(capability)) {
    return 'unavailable';
  }

  if (!capability.storage.localStorageAvailable && !capability.storage.cacheStorageAvailable) {
    return 'unavailable';
  }

  const webgpu = hasUsableWebGPU(capability);
  const wasm = capability.wasm.supported;

  if (!webgpu && !wasm) return 'unavailable';
  if (webgpu && hasResourceEvidence(capability) && meetsProProfile(capability)) {
    return 'pro-local';
  }
  if (webgpu && hasResourceEvidence(capability) && meetsStandardProfile(capability)) {
    return 'standard-local';
  }
  if (wasm && hasResourceEvidence(capability) && meetsLightProfile(capability)) {
    return 'light-local';
  }

  return 'basic';
}

function collectLimitations(
  capability: LocalRuntimeCapability,
  tier: AITier,
): AIUnavailableReason[] {
  const limitations: AIUnavailableReason[] = [];
  const add = (reason: AIUnavailableReason) => {
    if (!limitations.includes(reason)) limitations.push(reason);
  };

  if (!capability.browser.supported) add('browser-unsupported');
  if (!capability.webgpu.supported || capability.webgpu.adapterAvailable === false) {
    add('webgpu-unavailable');
  }
  if (!capability.wasm.supported) add('wasm-unavailable');
  if (hasKnownInsufficientResources(capability)) add('insufficient-capability');
  if (!capability.storage.localStorageAvailable && !capability.storage.cacheStorageAvailable) {
    add('storage-unavailable');
  }
  if (tier === 'basic' && !hasResourceEvidence(capability)) add('capability-unknown');
  if (tier === 'unavailable' && limitations.length === 0) add('runtime-not-installed');

  return limitations;
}

export function detectAICapabilities(probe?: AICapabilityProbe): AICapabilityReport {
  const source = normalizedProbe(probe);
  const capability: LocalRuntimeCapability = {
    browser: {
      supported: source.browserSupported,
      name: browserName(source.userAgent),
      userAgent: source.userAgent,
    },
    webgpu: {
      supported: source.webgpuSupported,
      adapterAvailable: source.webgpuAdapterAvailable,
    },
    wasm: {
      supported: source.wasmSupported,
    },
    device: {
      memoryGb: source.deviceMemoryGb,
      hardwareConcurrency: source.hardwareConcurrency,
    },
    network: {
      online: source.online,
    },
    storage: {
      localStorageAvailable: source.localStorageAvailable,
      cacheStorageAvailable: source.cacheStorageAvailable,
    },
  };
  const tier = decideAITier(capability);

  return {
    tier,
    localAIAvailable: tier === 'light-local' || tier === 'standard-local' || tier === 'pro-local',
    capability,
    limitations: collectLimitations(capability, tier),
  };
}