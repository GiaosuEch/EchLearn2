import type {
  LocalAiBrowserName,
  LocalAiDeviceKind,
  LocalAiDeviceProfile,
  LocalAiOsName,
  LocalAiStorageKind,
  LocalAiThermalStatus,
} from './localAiDeviceTierTypes.ts';
import type {
  LocalRuntimeBatteryLike,
  LocalRuntimeCapabilityEnvironment,
  LocalRuntimeCapabilityResult,
  LocalRuntimeNavigatorLike,
  LocalRuntimeStorageEstimateLike,
  LocalRuntimeStorageManagerLike,
} from './localRuntimeCapabilityTypes.ts';

type Mutable<T> = {
  -readonly [Key in keyof T]: T[Key] extends readonly string[] ? string[] : T[Key];
};

const BYTES_PER_MIB = 1024 * 1024;
const DEVICE_KINDS: readonly LocalAiDeviceKind[] = ['desktop', 'laptop', 'mobile', 'tablet', 'unknown'];
const STORAGE_KINDS: readonly LocalAiStorageKind[] = ['ssd', 'hdd', 'flash', 'unknown'];
const THERMAL_STATUSES: readonly LocalAiThermalStatus[] = ['normal', 'warm', 'hot', 'unknown'];

function unique(items: readonly string[]): string[] {
  return [...new Set(items)];
}

function createDefaultEnvironment(): LocalRuntimeCapabilityEnvironment {
  const hasWindow = typeof window !== 'undefined';
  const browserNavigator = typeof navigator === 'undefined'
    ? null
    : navigator as unknown as LocalRuntimeNavigatorLike;

  return {
    hasWindow,
    secureContext: hasWindow ? window.isSecureContext : undefined,
    navigator: browserNavigator,
  };
}

function readSafely<T>(
  read: () => T,
  warnings: string[],
  warning: string,
): { readonly ok: true; readonly value: T } | { readonly ok: false; readonly value: undefined } {
  try {
    return { ok: true, value: read() };
  } catch {
    warnings.push(warning);
    return { ok: false, value: undefined };
  }
}

function normalizedString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function validPositiveNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function validNonNegativeNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function bytesToMib(value: unknown): number | null {
  const bytes = validNonNegativeNumber(value);
  return bytes === null ? null : bytes / BYTES_PER_MIB;
}

function parseBrowserName(userAgent: string): LocalAiBrowserName {
  if (/Edg(?:A|iOS)?\//i.test(userAgent)) return 'edge';
  if (/(?:Chrome|CriOS)\//i.test(userAgent)) return 'chrome';
  if (/(?:Firefox|FxiOS)\//i.test(userAgent)) return 'firefox';
  if (/Safari\//i.test(userAgent) && /Version\//i.test(userAgent)) return 'safari';
  return 'unknown';
}

function parseOsName(
  userAgent: string,
  platform: string,
  maxTouchPoints: number | null,
): LocalAiOsName {
  if (/Android/i.test(userAgent)) return 'android';
  if (/(?:iPhone|iPad|iPod)/i.test(userAgent)) return 'ios';
  if (/MacIntel/i.test(platform) && (maxTouchPoints ?? 0) > 1) return 'ios';
  if (/Windows|Win32|Win64/i.test(`${userAgent} ${platform}`)) return 'windows';
  if (/Macintosh|Mac OS X|MacIntel/i.test(`${userAgent} ${platform}`)) return 'macos';
  if (/Linux/i.test(`${userAgent} ${platform}`)) return 'linux';
  return 'unknown';
}

function inferPortableDeviceKind(
  userAgent: string,
  platform: string,
  maxTouchPoints: number | null,
): LocalAiDeviceKind {
  if (/(?:iPad|Tablet)/i.test(userAgent)) return 'tablet';
  if (/MacIntel/i.test(platform) && (maxTouchPoints ?? 0) > 1) return 'tablet';
  if (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent)) return 'tablet';
  if (/(?:iPhone|iPod|Mobile)/i.test(userAgent)) return 'mobile';
  return 'unknown';
}

function trustedHint<T extends string>(value: T | undefined, allowed: readonly T[]): T | null {
  return value !== undefined && allowed.includes(value) ? value : null;
}

function failedProbeResult(): LocalRuntimeCapabilityResult {
  return {
    ...createUncheckedLocalRuntimeCapabilityResult(),
    probeStatus: 'failed',
    webGpuStatus: 'unknown',
    warnings: ['Runtime capability metadata could not be collected safely.'],
    reasons: ['The core app and deterministic fallback remain available when the capability probe fails.'],
  };
}

export function createUncheckedLocalRuntimeCapabilityResult(): LocalRuntimeCapabilityResult {
  return {
    probeStatus: 'not-run',
    secureContext: 'unknown',
    webGpuStatus: 'unchecked',
    webGpuReason: 'WebGPU has not been checked.',
    storageEstimateStatus: 'unknown',
    estimatedQuotaMb: null,
    estimatedUsageMb: null,
    estimatedRemainingMb: null,
    connectionKind: 'unknown',
    effectiveConnectionType: null,
    saveDataEnabled: null,
    batteryStatus: 'unknown',
    batteryLevelPercent: null,
    charging: null,
    thermalStatus: 'unknown',
    browserName: 'unknown',
    osName: 'unknown',
    deviceKind: 'unknown',
    storageKind: 'unknown',
    approxRamGb: null,
    warnings: [],
    reasons: ['Capability probe has not run.'],
    collectedAt: null,
    metadataOnly: true,
    modelActive: false,
    benchmarkVerified: false,
  };
}

async function probeStorage(
  storage: LocalRuntimeStorageManagerLike | null | undefined,
  result: Mutable<LocalRuntimeCapabilityResult>,
): Promise<void> {
  if (storage === null || storage === undefined) {
    result.storageEstimateStatus = 'unsupported';
    return;
  }

  const estimateFunctionRead = readSafely(
    () => storage.estimate,
    result.warnings,
    'Storage estimate API availability could not be read safely.',
  );
  const estimateFunction = estimateFunctionRead.ok ? estimateFunctionRead.value : undefined;
  if (!estimateFunctionRead.ok) {
    result.storageEstimateStatus = 'unknown';
    return;
  }
  if (typeof estimateFunction !== 'function') {
    result.storageEstimateStatus = 'unsupported';
    return;
  }

  let estimate: LocalRuntimeStorageEstimateLike;
  try {
    estimate = await estimateFunction.call(storage);
  } catch {
    result.storageEstimateStatus = 'unknown';
    result.warnings.push('Storage estimate metadata is unavailable because the browser API failed.');
    return;
  }

  result.storageEstimateStatus = 'supported';
  const quotaRead = readSafely(
    () => estimate?.quota,
    result.warnings,
    'Storage quota metadata could not be read safely.',
  );
  const usageRead = readSafely(
    () => estimate?.usage,
    result.warnings,
    'Storage usage metadata could not be read safely.',
  );
  const quota = quotaRead.ok ? quotaRead.value : undefined;
  const usage = usageRead.ok ? usageRead.value : undefined;
  result.estimatedQuotaMb = bytesToMib(quota);
  result.estimatedUsageMb = bytesToMib(usage);
  if (result.estimatedQuotaMb !== null && result.estimatedUsageMb !== null) {
    result.estimatedRemainingMb = Math.max(result.estimatedQuotaMb - result.estimatedUsageMb, 0);
  }

  const invalidQuota = quota !== undefined && result.estimatedQuotaMb === null;
  const invalidUsage = usage !== undefined && result.estimatedUsageMb === null;
  if (invalidQuota || invalidUsage) {
    result.warnings.push('Storage estimate metadata contains invalid values; invalid fields remain unknown.');
  }
}

function probeConnection(
  navigatorLike: LocalRuntimeNavigatorLike,
  result: Mutable<LocalRuntimeCapabilityResult>,
): void {
  const onlineRead = readSafely(
    () => navigatorLike.onLine,
    result.warnings,
    'Network online metadata could not be read safely.',
  );
  const connectionRead = readSafely(
    () => navigatorLike.connection,
    result.warnings,
    'Network Information metadata could not be read safely.',
  );
  const connection = connectionRead.ok ? connectionRead.value : null;

  if (onlineRead.ok && onlineRead.value === false) {
    result.connectionKind = 'offline';
  } else if (connection !== null && connection !== undefined) {
    const typeRead = readSafely(
      () => connection.type,
      result.warnings,
      'Connection type metadata could not be read safely.',
    );
    const connectionType = typeRead.ok ? normalizedString(typeRead.value) : null;
    if (connectionType === 'cellular') result.connectionKind = 'cellular';
    if (connectionType === 'wifi') result.connectionKind = 'wifi';
  }

  if (connection !== null && connection !== undefined) {
    const effectiveRead = readSafely(
      () => connection.effectiveType,
      result.warnings,
      'Effective connection metadata could not be read safely.',
    );
    const saveDataRead = readSafely(
      () => connection.saveData,
      result.warnings,
      'Data-saver metadata could not be read safely.',
    );
    result.effectiveConnectionType = effectiveRead.ok
      ? normalizedString(effectiveRead.value)
      : null;
    result.saveDataEnabled = saveDataRead.ok && typeof saveDataRead.value === 'boolean'
      ? saveDataRead.value
      : null;
  }

  if (result.saveDataEnabled === true) {
    result.warnings.push('Data saver is enabled; model download attempts remain blocked by later policy gates.');
  }
}

async function probeBattery(
  navigatorLike: LocalRuntimeNavigatorLike,
  result: Mutable<LocalRuntimeCapabilityResult>,
): Promise<void> {
  const getterRead = readSafely(
    () => navigatorLike.getBattery,
    result.warnings,
    'Battery API availability could not be read safely.',
  );
  const getBattery = getterRead.ok ? getterRead.value : null;
  if (typeof getBattery !== 'function') {
    result.batteryStatus = getterRead.ok ? 'unsupported' : 'unknown';
    return;
  }

  let battery: LocalRuntimeBatteryLike;
  try {
    battery = await getBattery.call(navigatorLike);
  } catch {
    result.batteryStatus = 'unknown';
    result.warnings.push('Battery metadata is unavailable because the browser API failed.');
    return;
  }

  if (battery === null || typeof battery !== 'object') {
    result.batteryStatus = 'unknown';
    result.warnings.push('Battery metadata is unavailable because the browser returned an invalid value.');
    return;
  }

  result.batteryStatus = 'supported';
  const levelRead = readSafely(
    () => battery.level,
    result.warnings,
    'Battery level metadata could not be read safely.',
  );
  const chargingRead = readSafely(
    () => battery.charging,
    result.warnings,
    'Battery charging metadata could not be read safely.',
  );
  const level = levelRead.ok ? levelRead.value : undefined;
  if (typeof level === 'number' && Number.isFinite(level) && level >= 0 && level <= 1) {
    result.batteryLevelPercent = Number((level * 100).toFixed(2));
  } else if (level !== undefined) {
    result.warnings.push('Battery level metadata is invalid; the level remains unknown.');
  }
  result.charging = chargingRead.ok && typeof chargingRead.value === 'boolean'
    ? chargingRead.value
    : null;
}

async function runProbe(
  environment: LocalRuntimeCapabilityEnvironment,
): Promise<LocalRuntimeCapabilityResult> {
  const result: Mutable<LocalRuntimeCapabilityResult> = {
    ...createUncheckedLocalRuntimeCapabilityResult(),
    probeStatus: 'completed',
    warnings: [],
    reasons: ['Probe result contains observed metadata only; no model state is inferred.'],
  };

  if (!environment.hasWindow) {
    result.webGpuReason = 'Window and navigator metadata are unavailable in this environment.';
    result.reasons.push('Browser globals are unavailable, so capability metadata remains unknown.');
    return result;
  }

  const secureContextRead = readSafely(
    () => environment.secureContext,
    result.warnings,
    'Secure-context metadata could not be read safely.',
  );
  if (secureContextRead.ok && secureContextRead.value === true) result.secureContext = 'supported';
  if (secureContextRead.ok && secureContextRead.value === false) result.secureContext = 'unsupported';

  const navigatorLike = environment.navigator ?? null;
  if (navigatorLike === null) {
    result.webGpuReason = 'Navigator metadata is unavailable in this environment.';
    result.reasons.push('Navigator is unavailable, so optional browser APIs remain unknown.');
    return result;
  }

  const userAgentRead = readSafely(
    () => navigatorLike.userAgent,
    result.warnings,
    'Browser identity metadata could not be read safely.',
  );
  const platformRead = readSafely(
    () => navigatorLike.platform,
    result.warnings,
    'Operating-system platform metadata could not be read safely.',
  );
  const touchRead = readSafely(
    () => navigatorLike.maxTouchPoints,
    result.warnings,
    'Touch-point metadata could not be read safely.',
  );
  const userAgent = typeof userAgentRead.value === 'string' ? userAgentRead.value : '';
  const platform = typeof platformRead.value === 'string' ? platformRead.value : '';
  const maxTouchPoints = typeof touchRead.value === 'number' && Number.isFinite(touchRead.value)
    ? touchRead.value
    : null;

  result.browserName = parseBrowserName(userAgent);
  result.osName = parseOsName(userAgent, platform, maxTouchPoints);
  result.deviceKind = trustedHint(environment.trustedDeviceKindHint, DEVICE_KINDS)
    ?? inferPortableDeviceKind(userAgent, platform, maxTouchPoints);
  result.storageKind = trustedHint(environment.trustedStorageKindHint, STORAGE_KINDS) ?? 'unknown';
  result.thermalStatus = trustedHint(environment.trustedThermalStatusHint, THERMAL_STATUSES) ?? 'unknown';

  const memoryRead = readSafely(
    () => navigatorLike.deviceMemory,
    result.warnings,
    'Approximate memory metadata could not be read safely.',
  );
  result.approxRamGb = memoryRead.ok ? validPositiveNumber(memoryRead.value) : null;
  if (memoryRead.ok && memoryRead.value !== undefined && result.approxRamGb === null) {
    result.warnings.push('Approximate memory metadata is invalid; memory remains unknown.');
  }

  const gpuRead = readSafely(
    () => navigatorLike.gpu,
    result.warnings,
    'WebGPU availability metadata could not be read safely.',
  );
  if (!gpuRead.ok) {
    result.webGpuStatus = 'unknown';
    result.webGpuReason = 'WebGPU presence could not be checked safely.';
  } else if (gpuRead.value === undefined || gpuRead.value === null) {
    result.webGpuStatus = 'unsupported';
    result.webGpuReason = 'WebGPU is unavailable because the checked navigator does not expose it.';
  } else if (result.secureContext === 'supported') {
    result.webGpuStatus = 'supported';
    result.webGpuReason = 'WebGPU is present in a secure context; benchmark and approval gates are still required.';
  } else if (result.secureContext === 'unsupported') {
    result.webGpuStatus = 'unsupported';
    result.webGpuReason = 'WebGPU cannot be treated as usable outside a secure context.';
  } else {
    result.webGpuStatus = 'unknown';
    result.webGpuReason = 'WebGPU is present but secure-context status is unknown.';
  }

  const storageRead = readSafely(
    () => navigatorLike.storage,
    result.warnings,
    'Storage API availability could not be read safely.',
  );
  if (storageRead.ok) {
    await probeStorage(storageRead.value, result);
  } else {
    result.storageEstimateStatus = 'unknown';
  }

  probeConnection(navigatorLike, result);
  await probeBattery(navigatorLike, result);

  if (typeof environment.nowIso === 'function') {
    const timeRead = readSafely(
      () => environment.nowIso?.() ?? null,
      result.warnings,
      'Injected collection time could not be read safely.',
    );
    result.collectedAt = timeRead.ok && typeof timeRead.value === 'string'
      ? timeRead.value
      : null;
  }

  result.warnings = unique(result.warnings);
  result.reasons = unique(result.reasons);
  return result;
}

export async function probeLocalRuntimeCapabilities(
  environment?: LocalRuntimeCapabilityEnvironment,
): Promise<LocalRuntimeCapabilityResult> {
  try {
    return await runProbe(environment ?? createDefaultEnvironment());
  } catch {
    return failedProbeResult();
  }
}

export function mapLocalRuntimeCapabilityToDeviceProfile(
  result: LocalRuntimeCapabilityResult,
): LocalAiDeviceProfile {
  const webGpuStatus = result.secureContext === 'unsupported'
    ? 'unsupported'
    : result.webGpuStatus === 'supported' || result.webGpuStatus === 'unsupported'
      ? result.webGpuStatus
      : 'unchecked';

  return {
    deviceKind: result.deviceKind,
    approxRamGb: result.approxRamGb,
    storageKind: result.storageKind,
    browserName: result.browserName,
    osName: result.osName,
    webGpuStatus,
    batteryLevelPercent: result.batteryLevelPercent,
    thermalStatus: result.thermalStatus,
    connectionKind: result.connectionKind,
  };
}
