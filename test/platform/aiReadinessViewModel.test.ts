import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { detectAICapabilities } from '../../src/platform/ai/aiCapabilityDetector.ts';
import {
  buildAIReadinessViewModel,
  type AIReadinessSnapshot,
} from '../../src/platform/ai/aiReadinessViewModel.ts';

function capabilityReport(overrides: Parameters<typeof detectAICapabilities>[0] = {}) {
  return detectAICapabilities({
    browserSupported: true,
    userAgent: 'Mozilla/5.0 Chrome/120.0',
    webgpuSupported: false,
    wasmSupported: true,
    online: true,
    localStorageAvailable: true,
    cacheStorageAvailable: true,
    deviceMemoryGb: 4,
    hardwareConcurrency: 4,
    ...overrides,
  });
}

function snapshot(overrides: Partial<AIReadinessSnapshot> = {}): AIReadinessSnapshot {
  return {
    capabilityReport: capabilityReport(),
    modelReadiness: {
      status: 'not-installed',
      reason: 'model-not-installed',
      modelId: 'language-light-v1',
      requiredTier: 'light-local',
    },
    runtimeStatus: 'unavailable',
    runtimeReason: 'runtime-not-implemented',
    ...overrides,
  };
}

describe('AI readiness view model', () => {
  it('explains that a capable device is not ready when no approved model is installed', () => {
    const view = buildAIReadinessViewModel(snapshot());

    assert.match(view.summary, /Local AI is not ready yet/i);
    assert.match(view.summary, /no approved model is installed/i);
    assert.equal(view.modelStatus, 'Not installed');
    assert.equal(view.runtimeStatus, 'Not implemented');
  });

  it('reports WebGPU fallback without claiming a stronger tier', () => {
    const view = buildAIReadinessViewModel(snapshot({
      capabilityReport: capabilityReport({ webgpuSupported: false }),
    }));

    assert.equal(view.tier, 'light-local');
    assert.match(view.items.find(item => item.id === 'webgpu')?.value ?? '', /unavailable/i);
    assert.equal(view.items.find(item => item.id === 'webgpu')?.tone, 'warning');
    assert.match(view.items.find(item => item.id === 'wasm')?.value ?? '', /fallback available/i);
    assert.doesNotMatch(view.summary, /Pro ready|AI active/i);
  });

  it('does not call WebGPU available until an adapter is confirmed', () => {
    const view = buildAIReadinessViewModel(snapshot({
      capabilityReport: capabilityReport({
        webgpuSupported: true,
        webgpuAdapterAvailable: null,
        deviceMemoryGb: 8,
        hardwareConcurrency: 8,
      }),
    }));
    const webgpu = view.items.find(item => item.id === 'webgpu');

    assert.equal(webgpu?.value, 'API detected');
    assert.equal(webgpu?.tone, 'neutral');
    assert.match(webgpu?.detail ?? '', /not confirmed/i);
    assert.match(view.summary, /not ready yet/i);
  });

  it('does not claim ready from a basic tier even when later states are inconsistent', () => {
    const view = buildAIReadinessViewModel(snapshot({
      capabilityReport: capabilityReport({
        webgpuSupported: true,
        deviceMemoryGb: undefined,
        hardwareConcurrency: undefined,
      }),
      modelReadiness: { status: 'ready', modelId: 'language-light-v1', tier: 'light-local' },
      runtimeStatus: 'ready',
      runtimeReason: undefined,
    }));

    assert.equal(view.tier, 'basic');
    assert.equal(view.statusLabel, 'Not ready');
    assert.match(view.summary, /not ready yet/i);
  });

  it('surfaces a runtime-not-implemented state even when the model is ready', () => {
    const view = buildAIReadinessViewModel(snapshot({
      modelReadiness: { status: 'ready', modelId: 'language-light-v1', tier: 'light-local' },
      runtimeStatus: 'unavailable',
      runtimeReason: 'runtime-not-implemented',
    }));

    assert.equal(view.statusLabel, 'Not ready');
    assert.match(view.runtimeDetail, /runtime is not implemented/i);
    assert.match(view.noOutputNotice, /No AI output is generated/i);
  });

  it('keeps optional memory and CPU evidence explicit when missing', () => {
    const view = buildAIReadinessViewModel(snapshot({
      capabilityReport: capabilityReport({
        deviceMemoryGb: undefined,
        hardwareConcurrency: undefined,
      }),
    }));

    const device = view.items.find(item => item.id === 'device');
    assert.equal(device?.value, 'Not reported');
    assert.match(device?.detail ?? '', /memory or CPU evidence/i);
  });

  it('does not introduce exam-track language or generated output', () => {
    const view = buildAIReadinessViewModel(snapshot());
    const text = JSON.stringify(view);

    assert.doesNotMatch(text, /IELTS|Task Response|Speaking Part|Writing Task/i);
    assert.doesNotMatch(text, /Here is your answer|band score|random/i);
  });

  it('uses visible text labels for status, so color is not the only signal', () => {
    const view = buildAIReadinessViewModel(snapshot());

    assert.ok(view.statusLabel.length > 0);
    for (const item of view.items) assert.ok(item.value.length > 0);
  });

  it('maps model integrity blockers to an explicit unavailable reason', () => {
    const view = buildAIReadinessViewModel(snapshot({
      modelReadiness: {
        status: 'unavailable',
        reason: 'model-corrupted',
        modelId: 'language-light-v1',
        requiredTier: 'light-local',
      },
    }));

    assert.equal(view.modelStatus, 'Unavailable');
    assert.ok(view.limitations.some(value => /integrity checks/i.test(value)));
  });

  it('keeps loading, error and status semantics explicit in the UI source', () => {
    const panelSource = readFileSync(
      new URL('../../src/components/ai/AIReadinessPanel.tsx', import.meta.url),
      'utf8',
    );
    const badgeSource = readFileSync(
      new URL('../../src/components/ai/AIStatusBadge.tsx', import.meta.url),
      'utf8',
    );
    const source = [panelSource, badgeSource].join('\n');

    assert.match(panelSource, /aria-busy="true"/);
    assert.match(panelSource, /role="alert"/);
    assert.match(panelSource, /aria-labelledby=/);
    assert.match(badgeSource, /role="status"/);
    assert.match(badgeSource, /\{label\}/);
    assert.doesNotMatch(source, /IELTS|Task Response|Speaking Part|Writing Task/i);
  });
});