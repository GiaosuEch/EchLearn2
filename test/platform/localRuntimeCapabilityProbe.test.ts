import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import {
  createUncheckedLocalRuntimeCapabilityResult,
  mapLocalRuntimeCapabilityToDeviceProfile,
  probeLocalRuntimeCapabilities,
} from '../../src/platform/ai/localRuntimeCapabilityProbe.ts';
import type {
  LocalRuntimeCapabilityEnvironment,
  LocalRuntimeNavigatorLike,
  LocalRuntimeStorageManagerLike,
} from '../../src/platform/ai/localRuntimeCapabilityTypes.ts';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

function environment(
  navigator: LocalRuntimeNavigatorLike | null,
  overrides: Partial<LocalRuntimeCapabilityEnvironment> = {},
): LocalRuntimeCapabilityEnvironment {
  return {
    hasWindow: true,
    secureContext: true,
    navigator,
    ...overrides,
  };
}

describe('Phase 4.6 local runtime capability probe', () => {
  it('creates an honest unchecked metadata-only result', () => {
    const result = createUncheckedLocalRuntimeCapabilityResult();

    assert.equal(result.probeStatus, 'not-run');
    assert.equal(result.secureContext, 'unknown');
    assert.equal(result.webGpuStatus, 'unchecked');
    assert.equal(result.storageEstimateStatus, 'unknown');
    assert.equal(result.batteryStatus, 'unknown');
    assert.equal(result.approxRamGb, null);
    assert.equal(result.collectedAt, null);
    assert.equal(result.metadataOnly, true);
    assert.equal(result.modelActive, false);
    assert.equal(result.benchmarkVerified, false);
  });

  it('does not crash without window or navigator', async () => {
    const noWindow = await probeLocalRuntimeCapabilities({ hasWindow: false });
    const noNavigator = await probeLocalRuntimeCapabilities({
      hasWindow: true,
      secureContext: true,
      navigator: null,
    });

    assert.equal(noWindow.probeStatus, 'completed');
    assert.equal(noWindow.secureContext, 'unknown');
    assert.equal(noWindow.webGpuStatus, 'unchecked');
    assert.equal(noNavigator.probeStatus, 'completed');
    assert.equal(noNavigator.webGpuStatus, 'unchecked');
    assert.equal(noNavigator.modelActive, false);
  });

  it('treats an insecure context as unsupported even when navigator.gpu exists', async () => {
    const result = await probeLocalRuntimeCapabilities(environment({ gpu: {} }, {
      secureContext: false,
    }));

    assert.equal(result.secureContext, 'unsupported');
    assert.equal(result.webGpuStatus, 'unsupported');
    assert.match(result.webGpuReason ?? '', /secure context/i);
    assert.equal(result.modelActive, false);
  });

  it('feature-detects WebGPU without requesting an adapter', async () => {
    let requestAdapterCalls = 0;
    const result = await probeLocalRuntimeCapabilities(environment({
      gpu: {
        requestAdapter() {
          requestAdapterCalls += 1;
        },
      },
    }));

    assert.equal(result.webGpuStatus, 'supported');
    assert.equal(requestAdapterCalls, 0);
    assert.equal(result.benchmarkVerified, false);
    assert.equal(result.modelActive, false);
  });

  it('marks an absent checked WebGPU property as unsupported', async () => {
    const result = await probeLocalRuntimeCapabilities(environment({}));

    assert.equal(result.webGpuStatus, 'unsupported');
    assert.match(result.webGpuReason ?? '', /not exposed|unavailable/i);
  });

  it('handles unavailable storage estimation without crashing', async () => {
    const result = await probeLocalRuntimeCapabilities(environment({}));

    assert.equal(result.storageEstimateStatus, 'unsupported');
    assert.equal(result.estimatedQuotaMb, null);
    assert.equal(result.estimatedUsageMb, null);
    assert.equal(result.estimatedRemainingMb, null);
  });

  it('converts valid storage bytes to binary MiB and computes remaining space', async () => {
    const mib = 1024 * 1024;
    const result = await probeLocalRuntimeCapabilities(environment({
      storage: {
        estimate: async () => ({ quota: 100 * mib, usage: 25 * mib }),
      },
    }));

    assert.equal(result.storageEstimateStatus, 'supported');
    assert.equal(result.estimatedQuotaMb, 100);
    assert.equal(result.estimatedUsageMb, 25);
    assert.equal(result.estimatedRemainingMb, 75);
    assert.equal(result.storageKind, 'unknown');
  });

  it('isolates storage rejection and keeps the rest of the probe usable', async () => {
    const result = await probeLocalRuntimeCapabilities(environment({
      deviceMemory: 8,
      storage: {
        estimate: async () => {
          throw new Error('quota unavailable');
        },
      },
      getBattery: async () => ({ level: 0.8, charging: true }),
    }));

    assert.equal(result.probeStatus, 'completed');
    assert.equal(result.storageEstimateStatus, 'unknown');
    assert.equal(result.batteryStatus, 'supported');
    assert.equal(result.batteryLevelPercent, 80);
    assert.equal(result.approxRamGb, 8);
    assert.match(result.warnings.join(' '), /storage estimate/i);
  });

  it('isolates a throwing storage estimate getter from battery probing', async () => {
    const storage = {} as LocalRuntimeStorageManagerLike;
    Object.defineProperty(storage, 'estimate', {
      get() {
        throw new Error('estimate getter failed');
      },
    });
    const result = await probeLocalRuntimeCapabilities(environment({
      storage,
      getBattery: async () => ({ level: 0.6, charging: true }),
    }));

    assert.equal(result.probeStatus, 'completed');
    assert.equal(result.storageEstimateStatus, 'unknown');
    assert.equal(result.batteryStatus, 'supported');
    assert.equal(result.batteryLevelPercent, 60);
    assert.match(result.warnings.join(' '), /storage estimate/i);
  });

  it('maps invalid storage values to null without inferring a drive type', async () => {
    const result = await probeLocalRuntimeCapabilities(environment({
      storage: {
        estimate: async () => ({ quota: -1, usage: Number.NaN }),
      },
    }));

    assert.equal(result.storageEstimateStatus, 'supported');
    assert.equal(result.estimatedQuotaMb, null);
    assert.equal(result.estimatedUsageMb, null);
    assert.equal(result.estimatedRemainingMb, null);
    assert.equal(result.storageKind, 'unknown');
    assert.match(result.warnings.join(' '), /storage.*invalid/i);
  });

  it('normalizes offline, cellular, and Wi-Fi metadata without network calls', async () => {
    const offline = await probeLocalRuntimeCapabilities(environment({
      onLine: false,
      connection: { type: 'wifi', effectiveType: '4g' },
    }));
    const cellular = await probeLocalRuntimeCapabilities(environment({
      onLine: true,
      connection: { type: 'cellular', effectiveType: '4g' },
    }));
    const wifi = await probeLocalRuntimeCapabilities(environment({
      onLine: true,
      connection: { type: 'wifi', effectiveType: '4g' },
    }));

    assert.equal(offline.connectionKind, 'offline');
    assert.equal(cellular.connectionKind, 'cellular');
    assert.equal(wifi.connectionKind, 'wifi');
    assert.equal(cellular.effectiveConnectionType, '4g');
  });

  it('does not infer cellular from effectiveType and surfaces data saver', async () => {
    const result = await probeLocalRuntimeCapabilities(environment({
      onLine: true,
      connection: { effectiveType: '4g', saveData: true },
    }));

    assert.equal(result.connectionKind, 'unknown');
    assert.equal(result.effectiveConnectionType, '4g');
    assert.equal(result.saveDataEnabled, true);
    assert.match(result.warnings.join(' '), /data saver/i);
  });

  it('handles unavailable and rejected battery APIs independently', async () => {
    const unavailable = await probeLocalRuntimeCapabilities(environment({}));
    const rejected = await probeLocalRuntimeCapabilities(environment({
      getBattery: async () => {
        throw new Error('battery unavailable');
      },
      connection: { type: 'wifi' },
    }));

    assert.equal(unavailable.batteryStatus, 'unsupported');
    assert.equal(unavailable.batteryLevelPercent, null);
    assert.equal(rejected.batteryStatus, 'unknown');
    assert.equal(rejected.connectionKind, 'wifi');
    assert.match(rejected.warnings.join(' '), /battery metadata/i);
  });

  it('converts a valid battery level to percent and rejects invalid levels', async () => {
    const valid = await probeLocalRuntimeCapabilities(environment({
      getBattery: async () => ({ level: 0.14, charging: false }),
    }));
    const invalid = await probeLocalRuntimeCapabilities(environment({
      getBattery: async () => ({ level: 1.5, charging: 'yes' }),
    }));

    assert.equal(valid.batteryStatus, 'supported');
    assert.equal(valid.batteryLevelPercent, 14);
    assert.equal(valid.charging, false);
    assert.equal(invalid.batteryStatus, 'supported');
    assert.equal(invalid.batteryLevelPercent, null);
    assert.equal(invalid.charging, null);
    assert.match(invalid.warnings.join(' '), /battery level.*invalid/i);
  });

  it('accepts only finite positive device memory and an injected clock', async () => {
    const valid = await probeLocalRuntimeCapabilities(environment({ deviceMemory: 4 }, {
      nowIso: () => '2026-07-17T09:00:00.000Z',
    }));
    const invalid = await probeLocalRuntimeCapabilities(environment({ deviceMemory: 0 }));

    assert.equal(valid.approxRamGb, 4);
    assert.equal(valid.collectedAt, '2026-07-17T09:00:00.000Z');
    assert.equal(invalid.approxRamGb, null);
    assert.equal(invalid.collectedAt, null);
  });

  it('normalizes browser and OS labels with conservative precedence', async () => {
    const edge = await probeLocalRuntimeCapabilities(environment({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/150.0 Safari/537.36 Edg/150.0',
      platform: 'Win32',
    }));
    const android = await probeLocalRuntimeCapabilities(environment({
      userAgent: 'Mozilla/5.0 (Linux; Android 15; Mobile) AppleWebKit/537.36 Chrome/150.0 Mobile Safari/537.36',
      platform: 'Linux armv8l',
    }));
    const ipad = await probeLocalRuntimeCapabilities(environment({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
      platform: 'MacIntel',
      maxTouchPoints: 5,
    }));

    assert.equal(edge.browserName, 'edge');
    assert.equal(edge.osName, 'windows');
    assert.equal(android.browserName, 'chrome');
    assert.equal(android.osName, 'android');
    assert.equal(android.deviceKind, 'mobile');
    assert.equal(ipad.browserName, 'safari');
    assert.equal(ipad.osName, 'ios');
    assert.equal(ipad.deviceKind, 'tablet');
  });

  it('uses only explicit trusted hints for laptop, storage, and thermal metadata', async () => {
    const result = await probeLocalRuntimeCapabilities(environment({
      deviceMemory: 4,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/150.0 Safari/537.36',
      platform: 'Win32',
      storage: { estimate: async () => ({ quota: 500 * 1024 * 1024 }) },
    }, {
      trustedDeviceKindHint: 'laptop',
      trustedStorageKindHint: 'hdd',
      trustedThermalStatusHint: 'warm',
    }));

    assert.equal(result.deviceKind, 'laptop');
    assert.equal(result.storageKind, 'hdd');
    assert.equal(result.thermalStatus, 'warm');
  });

  it('keeps storage and thermal unknown in production-style probing', async () => {
    const result = await probeLocalRuntimeCapabilities(environment({
      deviceMemory: 16,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/150.0 Safari/537.36',
      storage: { estimate: async () => ({ quota: 1024 * 1024 * 1024 }) },
    }));

    assert.equal(result.deviceKind, 'unknown');
    assert.equal(result.storageKind, 'unknown');
    assert.equal(result.thermalStatus, 'unknown');
  });

  it('maps probe metadata conservatively into the existing device profile', async () => {
    const result = await probeLocalRuntimeCapabilities(environment({
      deviceMemory: 16,
      gpu: {},
      userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/150.0 Safari/537.36',
      platform: 'Win32',
      onLine: true,
      connection: { type: 'wifi' },
      getBattery: async () => ({ level: 0.75, charging: true }),
    }, {
      trustedDeviceKindHint: 'desktop',
      trustedStorageKindHint: 'ssd',
      trustedThermalStatusHint: 'normal',
    }));

    const profile = mapLocalRuntimeCapabilityToDeviceProfile(result);
    assert.deepEqual(profile, {
      deviceKind: 'desktop',
      approxRamGb: 16,
      storageKind: 'ssd',
      browserName: 'chrome',
      osName: 'windows',
      webGpuStatus: 'supported',
      batteryLevelPercent: 75,
      thermalStatus: 'normal',
      connectionKind: 'wifi',
    });
  });

  it('maps unknown WebGPU to unchecked and insecure context to unsupported', () => {
    const unchecked = createUncheckedLocalRuntimeCapabilityResult();
    const insecure = {
      ...unchecked,
      probeStatus: 'completed' as const,
      secureContext: 'unsupported' as const,
      webGpuStatus: 'unknown' as const,
    };

    assert.equal(mapLocalRuntimeCapabilityToDeviceProfile(unchecked).webGpuStatus, 'unchecked');
    assert.equal(mapLocalRuntimeCapabilityToDeviceProfile(insecure).webGpuStatus, 'unsupported');
  });

  it('does not serialize raw user-agent metadata', async () => {
    const rawUserAgent = 'SECRET-RAW-UA Chrome/150.0';
    const result = await probeLocalRuntimeCapabilities(environment({
      userAgent: rawUserAgent,
      platform: 'Win32',
    }));

    assert.equal(JSON.stringify(result).includes(rawUserAgent), false);
    assert.equal('userAgent' in result, false);
  });

  it('contains no network, cache, download, inference, adapter-request, or non-deterministic paths', () => {
    const sources = [
      read('../../src/platform/ai/localRuntimeCapabilityTypes.ts'),
      read('../../src/platform/ai/localRuntimeCapabilityProbe.ts'),
    ].join('\n');

    assert.doesNotMatch(sources, /fetch\s*\(|XMLHttpRequest|WebSocket|indexedDB|caches\.|CacheStorage/);
    assert.doesNotMatch(sources, /modelUrl|artifactUrl|downloadUrl|AIService|\.execute\(/);
    assert.doesNotMatch(sources, /Math\.random|Date\.now|setTimeout|requestAdapter\s*\(|requestDevice\s*\(/);
    assert.doesNotMatch(sources, /localStorage|sessionStorage/);
  });
});
