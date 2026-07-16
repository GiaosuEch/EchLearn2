import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  detectAICapabilities,
  type AICapabilityProbe,
} from '../../src/platform/ai/aiCapabilityDetector.ts';

function probe(overrides: Partial<AICapabilityProbe> = {}): AICapabilityProbe {
  return {
    browserSupported: true,
    webgpuSupported: false,
    wasmSupported: true,
    online: true,
    localStorageAvailable: true,
    cacheStorageAvailable: true,
    deviceMemoryGb: 4,
    hardwareConcurrency: 4,
    ...overrides,
  };
}

describe('AI capability detector', () => {
  it('reports the WASM fallback when WebGPU is unavailable', () => {
    const report = detectAICapabilities(probe({ webgpuSupported: false }));

    assert.equal(report.capability.webgpu.supported, false);
    assert.equal(report.tier, 'light-local');
    assert.equal(report.localAIAvailable, true);
    assert.ok(report.limitations.includes('webgpu-unavailable'));
  });

  it('promotes to pro-local only when WebGPU and strong device evidence exist', () => {
    const report = detectAICapabilities(
      probe({ webgpuSupported: true, deviceMemoryGb: 16, hardwareConcurrency: 8 }),
    );

    assert.equal(report.capability.webgpu.supported, true);
    assert.equal(report.tier, 'pro-local');
  });

  it('preserves local capability while reporting offline status', () => {
    const report = detectAICapabilities(
      probe({ webgpuSupported: true, online: false, deviceMemoryGb: 4 }),
    );

    assert.equal(report.capability.network.online, false);
    assert.equal(report.tier, 'standard-local');
  });

  it('returns unavailable when local model storage and cache are unavailable', () => {
    const report = detectAICapabilities(
      probe({ localStorageAvailable: false, cacheStorageAvailable: false }),
    );

    assert.equal(report.tier, 'unavailable');
    assert.equal(report.localAIAvailable, false);
    assert.ok(report.limitations.includes('storage-unavailable'));
  });
  it('returns unavailable for a device below the minimum runtime profile', () => {
    const report = detectAICapabilities(
      probe({ deviceMemoryGb: 0.5, hardwareConcurrency: 1 }),
    );

    assert.equal(report.tier, 'unavailable');
    assert.equal(report.localAIAvailable, false);
    assert.ok(report.limitations.includes('insufficient-capability'));
  });

  it('returns unavailable when no browser runtime is present', () => {
    const report = detectAICapabilities(
      probe({ browserSupported: false, webgpuSupported: false, wasmSupported: false }),
    );

    assert.equal(report.tier, 'unavailable');
    assert.ok(report.limitations.includes('browser-unsupported'));
  });

  it('does not claim a higher tier when device evidence is unknown', () => {
    const report = detectAICapabilities(
      probe({ webgpuSupported: true, deviceMemoryGb: undefined, hardwareConcurrency: undefined }),
    );

    assert.equal(report.tier, 'basic');
    assert.notEqual(report.tier, 'standard-local');
    assert.notEqual(report.tier, 'pro-local');
  });
});