import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import { AI_FEATURE_REGISTRY } from '../../src/platform/ai/aiFeatureRegistry.ts';
import { probeLocalRuntimeCapabilities } from '../../src/platform/ai/localRuntimeCapabilityProbe.ts';
import type { LocalRuntimeCapabilityEnvironment } from '../../src/platform/ai/localRuntimeCapabilityTypes.ts';
import { buildLocalRuntimeCapabilityViewModel } from '../../src/platform/ai/localRuntimeCapabilityViewModel.ts';

const require = createRequire(import.meta.url);
const { scanAISafetyRegression } = require('../../scripts/verify_ai_safety_regression.cjs') as {
  scanAISafetyRegression(options: { root: string }): {
    files: string[];
    violations: Array<{ path: string; ruleId: string; message: string }>;
  };
};
const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

async function probe(overrides: Partial<LocalRuntimeCapabilityEnvironment>) {
  return probeLocalRuntimeCapabilities({
    hasWindow: true,
    secureContext: true,
    navigator: {},
    ...overrides,
  });
}

describe('Phase 4.6 runtime capability view model', () => {
  it('uses the existing device gate with free access and all benchmarks not-run', async () => {
    const result = await probe({
      navigator: {
        deviceMemory: 16,
        gpu: {},
        userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/150.0 Safari/537.36',
        platform: 'Win32',
        connection: { type: 'wifi' },
      },
      trustedDeviceKindHint: 'desktop',
      trustedStorageKindHint: 'ssd',
      trustedThermalStatusHint: 'normal',
    });
    const viewModel = buildLocalRuntimeCapabilityViewModel(result);

    assert.equal(viewModel.candidateDeviceTier, 'pro');
    assert.deepEqual(viewModel.tierGate.eligibleModelTiers, ['light']);
    assert.deepEqual(viewModel.tierGate.allowedModelTiers, []);
    assert.equal(viewModel.tierGate.canAttemptModelDownload, false);
    assert.equal(viewModel.tierGate.canAttempt4B, false);
    assert.equal(viewModel.benchmarkVerified, false);
    assert.match(viewModel.benchmarkSummary, /still required/i);
  });

  it('blocks model attempts and adds policy warnings for cellular metadata', async () => {
    const result = await probe({
      navigator: {
        deviceMemory: 8,
        gpu: {},
        connection: { type: 'cellular' },
      },
      trustedDeviceKindHint: 'desktop',
      trustedStorageKindHint: 'ssd',
    });
    const viewModel = buildLocalRuntimeCapabilityViewModel(result, { accessTier: 'pro' });

    assert.equal(viewModel.tierGate.canAttemptModelDownload, false);
    assert.match(viewModel.warnings.join(' '), /cellular/i);
  });

  it('blocks model attempts and adds policy warnings below 15 percent battery', async () => {
    const result = await probe({
      navigator: {
        deviceMemory: 8,
        gpu: {},
        connection: { type: 'wifi' },
        getBattery: async () => ({ level: 0.14, charging: false }),
      },
      trustedDeviceKindHint: 'laptop',
      trustedStorageKindHint: 'ssd',
    });
    const viewModel = buildLocalRuntimeCapabilityViewModel(result, { accessTier: 'pro' });

    assert.equal(viewModel.tierGate.canAttemptModelDownload, false);
    assert.match(viewModel.warnings.join(' '), /battery.*15/i);
  });

  it('preserves the data-saver warning in the combined view model', async () => {
    const result = await probe({
      navigator: {
        deviceMemory: 8,
        gpu: {},
        connection: { type: 'wifi', saveData: true },
      },
      trustedDeviceKindHint: 'desktop',
      trustedStorageKindHint: 'ssd',
    });
    const viewModel = buildLocalRuntimeCapabilityViewModel(result);

    assert.match(viewModel.warnings.join(' '), /data saver/i);
  });

  it('maps an Oppo A5x-like profile to ultra-low deterministic fallback with full UI', async () => {
    const result = await probe({
      navigator: {
        deviceMemory: 2,
        userAgent: 'Mozilla/5.0 (Linux; Android 15; Mobile) Chrome/150.0 Mobile Safari/537.36',
        platform: 'Linux armv8l',
      },
      trustedDeviceKindHint: 'mobile',
      trustedStorageKindHint: 'flash',
    });
    const viewModel = buildLocalRuntimeCapabilityViewModel(result, { accessTier: 'pro' });

    assert.equal(viewModel.candidateDeviceTier, 'ultra-low');
    assert.equal(viewModel.tierGate.fallbackMode, 'unavailable-safe');
    assert.equal(viewModel.tierGate.canAttemptModelDownload, false);
    assert.equal(viewModel.tierGate.featureAvailability, 'full-ui');
    assert.deepEqual(
      viewModel.tierGate.visibleFeatureIds,
      AI_FEATURE_REGISTRY.map((feature) => feature.id),
    );
    assert.match(viewModel.fallbackSummary, /deterministic fallback remains available/i);
  });

  it('maps a valid i3 4 GB HDD-like injected profile to light and blocks larger tiers', async () => {
    const result = await probe({
      navigator: {
        deviceMemory: 4,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/150.0 Safari/537.36',
        platform: 'Win32',
        connection: { type: 'wifi' },
      },
      trustedDeviceKindHint: 'laptop',
      trustedStorageKindHint: 'hdd',
    });
    const viewModel = buildLocalRuntimeCapabilityViewModel(result, { accessTier: 'pro' });

    assert.equal(viewModel.candidateDeviceTier, 'light');
    assert.deepEqual(viewModel.tierGate.allowedModelTiers, []);
    assert.ok(viewModel.tierGate.blockedModelTiers.includes('standard'));
    assert.ok(viewModel.tierGate.blockedModelTiers.includes('pro'));
    assert.equal(viewModel.tierGate.canAttempt4B, false);
    assert.equal(viewModel.modelActive, false);
  });

  it('maps a strong desktop to a pro candidate while keeping every model tier locked', async () => {
    const result = await probe({
      navigator: {
        deviceMemory: 16,
        gpu: {},
        userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/150.0 Safari/537.36',
        platform: 'Win32',
        connection: { type: 'wifi' },
        getBattery: async () => ({ level: 0.8, charging: true }),
      },
      trustedDeviceKindHint: 'desktop',
      trustedStorageKindHint: 'ssd',
      trustedThermalStatusHint: 'normal',
    });
    const viewModel = buildLocalRuntimeCapabilityViewModel(result, { accessTier: 'pro' });

    assert.equal(viewModel.candidateDeviceTier, 'pro');
    assert.deepEqual(viewModel.tierGate.eligibleModelTiers, ['light', 'standard', 'pro']);
    assert.deepEqual(viewModel.tierGate.allowedModelTiers, []);
    assert.equal(viewModel.tierGate.canAttempt4B, false);
    assert.equal(viewModel.tierGate.requiresBenchmarkBeforeModel, true);
    assert.equal(viewModel.modelActive, false);
    assert.equal(viewModel.benchmarkVerified, false);
  });

  it('describes candidate classification without model or runtime readiness claims', async () => {
    const result = await probe({ navigator: { deviceMemory: 8 } });
    const viewModel = buildLocalRuntimeCapabilityViewModel(result);
    const serialized = JSON.stringify(viewModel);

    assert.equal(viewModel.heading, 'Runtime Capability Probe');
    assert.equal(viewModel.metadataSummary, 'Metadata only');
    assert.equal(viewModel.modelStateSummary, 'No model active');
    assert.match(viewModel.candidateTierLabel, /Candidate device tier/i);
    assert.match(viewModel.coreAppSummary, /Core app remains available/i);
    assert.match(viewModel.fallbackSummary, /Deterministic fallback remains available/i);
    assert.doesNotMatch(serialized, /model is ready|runtime is ready|4B active|benchmark passed|model downloaded|download completed|AI recommendation generated|AI score generated/i);
  });

  it('integrates the Phase 4.6 card after mount with cancellation-safe async state', () => {
    const shell = read('../../src/components/ai/LocalAIReadinessShell.tsx');

    assert.match(shell, /useState\(createUncheckedLocalRuntimeCapabilityResult\(\)\)/);
    assert.match(shell, /useEffect\(\(\) =>/);
    assert.match(shell, /cancelled/);
    assert.match(shell, /probeLocalRuntimeCapabilities\(\)/);
    assert.match(shell, /Phase 4\.6 runtime capability probe/);
    assert.match(shell, /Runtime Capability Probe/);
    assert.match(shell, /Metadata only/);
    assert.match(shell, /No model active/);
    assert.match(shell, /candidateDeviceTier/);
    assert.doesNotMatch(shell, /setTimeout|fetch\s*\(|XMLHttpRequest|WebSocket|indexedDB|caches\.|AIService|\.execute\(/);
  });

  it('registers both Phase 4.6 tests in test and test:platform scripts', () => {
    const packageJson = JSON.parse(read('../../package.json')) as {
      scripts: Record<string, string>;
    };
    for (const scriptName of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[scriptName], /test\/platform\/localRuntimeCapabilityProbe\.test\.ts/);
      assert.match(packageJson.scripts[scriptName], /test\/platform\/localRuntimeCapabilityViewModel\.test\.ts/);
    }
  });

  it('documents the metadata-only boundary and all required sections', () => {
    const doc = read('../../docs/ai/phase-4-runtime-capability-probe.md');
    for (const heading of [
      'Status',
      'Purpose',
      'Observed metadata',
      'Unknown metadata',
      'Injected environment boundary',
      'Secure context and WebGPU',
      'Storage estimate',
      'Network and battery metadata',
      'Device-profile mapping',
      'Adaptive tier integration',
      'Privacy and persistence',
      'Failure handling',
      'Safety invariants',
      'Non-goals',
    ]) {
      assert.match(doc, new RegExp(`## ${heading}`, 'i'), heading);
    }
    assert.match(doc, /metadata only/i);
    assert.match(doc, /does not benchmark|no benchmark/i);
    assert.match(doc, /does not download|no model download/i);
    assert.match(doc, /does not cache|no model cache/i);
    assert.match(doc, /no network request/i);
    assert.match(doc, /HDD.*SSD|SSD.*HDD/i);
    assert.match(doc, /laptop.*desktop|desktop.*laptop/i);
    assert.match(doc, /thermal status.*unknown/i);
    assert.match(doc, /candidate device tier.*does not|not.*model eligibility/i);
    assert.match(doc, /WebGPU presence.*does not|not.*runtime readiness/i);
  });

  it('keeps the AI safety regression scan green with Phase 4.6 sources', () => {
    const result = scanAISafetyRegression({ root: process.cwd() });

    assert.ok(result.files.some((path) => path.endsWith('localRuntimeCapabilityProbe.ts')));
    assert.ok(result.files.some((path) => path.endsWith('localRuntimeCapabilityViewModel.ts')));
    assert.ok(result.files.some((path) => path.endsWith('LocalAIReadinessShell.tsx')));
    assert.deepEqual(result.violations, []);
  });
});
