import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { detectAICapabilities } from '../../src/platform/ai/aiCapabilityDetector.ts';
import {
  evaluateAIReadiness,
  type LocalModelDescriptor,
} from '../../src/platform/ai/aiReadiness.ts';

const capableReport = detectAICapabilities({
  browserSupported: true,
  webgpuSupported: false,
  wasmSupported: true,
  online: true,
  localStorageAvailable: true,
  cacheStorageAvailable: true,
  deviceMemoryGb: 4,
  hardwareConcurrency: 4,
});

function model(overrides: Partial<LocalModelDescriptor> = {}): LocalModelDescriptor {
  return {
    modelId: 'language-light-v1',
    tier: 'light-local',
    installed: true,
    ...overrides,
  };
}

describe('AI model readiness', () => {
  it('reports not-installed without fabricating a model response', () => {
    const state = evaluateAIReadiness(capableReport, model({ installed: false }));

    assert.deepEqual(state, {
      status: 'not-installed',
      reason: 'model-not-installed',
      modelId: 'language-light-v1',
      requiredTier: 'light-local',
    });
  });

  it('reports insufficient capability when an installed model exceeds the tier', () => {
    const weakReport = detectAICapabilities({
      browserSupported: true,
      webgpuSupported: true,
      wasmSupported: true,
      online: true,
      localStorageAvailable: true,
      cacheStorageAvailable: true,
      deviceMemoryGb: 2,
      hardwareConcurrency: 2,
    });
    const state = evaluateAIReadiness(weakReport, model({ tier: 'standard-local' }));

    assert.deepEqual(state, {
      status: 'unavailable',
      reason: 'insufficient-capability',
      modelId: 'language-light-v1',
      requiredTier: 'standard-local',
    });
  });

  it('allows a compatible WASM model without claiming WebGPU', () => {
    const state = evaluateAIReadiness(capableReport, model());

    assert.deepEqual(state, {
      status: 'ready',
      modelId: 'language-light-v1',
      tier: 'light-local',
    });
  });

  it('does not claim standard-local readiness from a light-local report', () => {
    const state = evaluateAIReadiness(capableReport, model({ tier: 'standard-local' }));

    assert.equal(state.status, 'unavailable');
    if (state.status === 'unavailable') assert.equal(state.reason, 'insufficient-capability');
  });

  it('keeps exam-track concepts out of platform AI core', () => {
    const source = [
      new URL('../../src/platform/ai/aiCapabilityDetector.ts', import.meta.url),
      new URL('../../src/platform/ai/aiReadiness.ts', import.meta.url),
    ].map(file => readFileSync(file, 'utf8')).join('\n');

    assert.doesNotMatch(
      source,
      /\bIELTS\b|Task Response|Speaking Part [123]|Writing Task [12]/i,
    );
  });
  it('keeps a compatible installed model ready while offline', () => {
    const offlineReport = detectAICapabilities({
      browserSupported: true,
      webgpuSupported: true,
      wasmSupported: true,
      online: false,
      localStorageAvailable: true,
      cacheStorageAvailable: true,
      deviceMemoryGb: 4,
      hardwareConcurrency: 4,
    });
    const state = evaluateAIReadiness(offlineReport, model({ tier: 'standard-local' }));

    assert.equal(offlineReport.capability.network.online, false);
    assert.equal(state.status, 'ready');
  });
});