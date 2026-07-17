import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import { AI_FEATURE_REGISTRY } from '../../src/platform/ai/aiFeatureRegistry.ts';
import {
  evaluateLocalAiDeviceTierGate,
  type EvaluateLocalAiDeviceTierGateInput,
} from '../../src/platform/ai/localAiDeviceTierPolicy.ts';
import type { LocalAiDeviceProfile } from '../../src/platform/ai/localAiDeviceTierTypes.ts';
import { buildLocalAiDeviceTierPolicyOverview } from '../../src/platform/ai/localAiDeviceTierViewModel.ts';

const require = createRequire(import.meta.url);
const { scanAISafetyRegression } = require('../../scripts/verify_ai_safety_regression.cjs') as {
  scanAISafetyRegression(options: { root: string }): {
    files: string[];
    violations: Array<{ path: string; ruleId: string; message: string }>;
  };
};

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

const safeDesktopProfile: LocalAiDeviceProfile = {
  deviceKind: 'desktop',
  approxRamGb: 8,
  storageKind: 'ssd',
  browserName: 'chrome',
  osName: 'windows',
  webGpuStatus: 'supported',
  batteryLevelPercent: null,
  thermalStatus: 'normal',
  connectionKind: 'wifi',
};

const verifiedBenchmarkGates = {
  light: 'passed',
  standard: 'passed',
  pro: 'passed',
} as const;

function evaluate(
  profile: LocalAiDeviceProfile,
  overrides: Partial<Omit<EvaluateLocalAiDeviceTierGateInput, 'profile'>> = {},
) {
  return evaluateLocalAiDeviceTierGate({
    profile,
    accessTier: 'pro',
    benchmarkStatusByModelTier: {
      light: 'not-run',
      standard: 'not-run',
      pro: 'not-run',
    },
    ...overrides,
  });
}

describe('Phase 4.4 adaptive local AI device tier gate', () => {
  it('classifies an Oppo A5x-like 2 GB Android mobile profile as ultra-low with fallback only', () => {
    const result = evaluate({
      deviceKind: 'mobile',
      approxRamGb: 2,
      storageKind: 'flash',
      browserName: 'chrome',
      osName: 'android',
      webGpuStatus: 'unchecked',
      batteryLevelPercent: 80,
      thermalStatus: 'normal',
      connectionKind: 'wifi',
    });

    assert.equal(result.assignedTier, 'ultra-low');
    assert.deepEqual(result.allowedModelTiers, []);
    assert.deepEqual(result.blockedModelTiers, ['light', 'standard', 'pro']);
    assert.equal(result.canAttemptModelDownload, false);
    assert.equal(result.canAttempt4B, false);
    assert.equal(result.fallbackMode, 'deterministic-fallback');
    assert.match(result.reasons.join(' '), /2 GB|memory/i);
  });

  it('treats non-finite memory metadata as ultra-low instead of guessing a stronger tier', () => {
    const result = evaluate({
      ...safeDesktopProfile,
      approxRamGb: Number.NaN,
    }, {
      benchmarkStatusByModelTier: verifiedBenchmarkGates,
    });

    assert.equal(result.assignedTier, 'ultra-low');
    assert.deepEqual(result.eligibleModelTiers, []);
    assert.equal(result.canAttemptModelDownload, false);
    assert.match(result.reasons.join(' '), /invalid|unknown|memory/i);
  });

  it('classifies an older 4 GB HDD laptop profile as light and blocks the pro model tier', () => {
    const result = evaluate({
      deviceKind: 'laptop',
      approxRamGb: 4,
      storageKind: 'hdd',
      browserName: 'chrome',
      osName: 'windows',
      webGpuStatus: 'supported',
      batteryLevelPercent: 75,
      thermalStatus: 'normal',
      connectionKind: 'wifi',
    }, {
      benchmarkStatusByModelTier: verifiedBenchmarkGates,
    });

    assert.equal(result.assignedTier, 'light');
    assert.deepEqual(result.allowedModelTiers, ['light']);
    assert.ok(result.blockedModelTiers.includes('pro'));
    assert.equal(result.canAttempt4B, false);
    assert.match(result.reasons.join(' '), /4 GB|HDD|light/i);
  });

  it('classifies an 8 GB SSD profile as standard and blocks the pro tier', () => {
    const result = evaluate(safeDesktopProfile, {
      benchmarkStatusByModelTier: verifiedBenchmarkGates,
    });

    assert.equal(result.assignedTier, 'standard');
    assert.deepEqual(result.allowedModelTiers, ['light', 'standard']);
    assert.ok(result.blockedModelTiers.includes('pro'));
    assert.equal(result.canAttempt4B, false);
  });

  it('classifies a strong 16 GB profile as pro but does not permit 4B before benchmark verification', () => {
    const result = evaluate({
      ...safeDesktopProfile,
      approxRamGb: 16,
    });

    assert.equal(result.assignedTier, 'pro');
    assert.deepEqual(result.eligibleModelTiers, ['light', 'standard', 'pro']);
    assert.deepEqual(result.allowedModelTiers, []);
    assert.deepEqual(result.blockedModelTiers, ['light', 'standard', 'pro']);
    assert.equal(result.canAttempt4B, false);
    assert.equal(result.canAttemptModelDownload, false);
    assert.equal(result.requiresBenchmarkBeforeModel, true);
    assert.match(result.userFacingSummary, /no model is active|benchmark/i);
  });

  it('permits a future pro-tier attempt only after explicit benchmark verification on a safe pro profile', () => {
    const result = evaluate({
      ...safeDesktopProfile,
      approxRamGb: 16,
    }, {
      benchmarkStatusByModelTier: verifiedBenchmarkGates,
    });

    assert.equal(result.assignedTier, 'pro');
    assert.equal(result.canAttemptModelDownload, true);
    assert.equal(result.canAttempt4B, true);
    assert.equal(result.requiresBenchmarkBeforeModel, false);
  });

  it('uses unavailable-safe fallback when WebGPU is unsupported', () => {
    const result = evaluate({
      ...safeDesktopProfile,
      webGpuStatus: 'unsupported',
    }, {
      benchmarkStatusByModelTier: verifiedBenchmarkGates,
    });

    assert.deepEqual(result.eligibleModelTiers, ['light', 'standard']);
    assert.deepEqual(result.allowedModelTiers, []);
    assert.equal(result.canAttemptModelDownload, false);
    assert.equal(result.fallbackMode, 'unavailable-safe');
    assert.match(result.warnings.join(' '), /WebGPU.*unsupported/i);
  });

  it('does not claim readiness when WebGPU is unchecked', () => {
    const result = evaluate({
      ...safeDesktopProfile,
      webGpuStatus: 'unchecked',
    }, {
      benchmarkStatusByModelTier: verifiedBenchmarkGates,
    });

    assert.equal(result.canAttemptModelDownload, false);
    assert.equal(result.requiresBenchmarkBeforeModel, true);
    assert.match(result.warnings.join(' '), /probe|unchecked/i);
    assert.doesNotMatch(result.userFacingSummary, /model is ready|runtime is ready|active model/i);
  });

  it('blocks model download when connection metadata is unknown', () => {
    const result = evaluate({
      ...safeDesktopProfile,
      connectionKind: 'unknown',
    }, {
      benchmarkStatusByModelTier: verifiedBenchmarkGates,
    });

    assert.equal(result.canAttemptModelDownload, false);
    assert.match(result.warnings.join(' '), /connection.*unchecked|Wi-Fi/i);
  });

  it('blocks model download over a cellular connection', () => {
    const result = evaluate({
      ...safeDesktopProfile,
      connectionKind: 'cellular',
    }, {
      benchmarkStatusByModelTier: verifiedBenchmarkGates,
    });

    assert.equal(result.canAttemptModelDownload, false);
    assert.match(result.warnings.join(' '), /cellular/i);
  });

  it('blocks model download when provided battery metadata is invalid', () => {
    const result = evaluate({
      ...safeDesktopProfile,
      deviceKind: 'laptop',
      batteryLevelPercent: Number.NaN,
    }, {
      benchmarkStatusByModelTier: verifiedBenchmarkGates,
    });

    assert.equal(result.canAttemptModelDownload, false);
    assert.match(result.warnings.join(' '), /battery.*invalid|battery.*unchecked/i);
  });

  it('blocks model download below 15 percent battery', () => {
    const result = evaluate({
      ...safeDesktopProfile,
      deviceKind: 'laptop',
      batteryLevelPercent: 14,
    }, {
      benchmarkStatusByModelTier: verifiedBenchmarkGates,
    });

    assert.equal(result.canAttemptModelDownload, false);
    assert.match(result.warnings.join(' '), /battery/i);
  });

  it('blocks model download while the device is hot', () => {
    const result = evaluate({
      ...safeDesktopProfile,
      thermalStatus: 'hot',
    }, {
      benchmarkStatusByModelTier: verifiedBenchmarkGates,
    });

    assert.equal(result.canAttemptModelDownload, false);
    assert.match(result.warnings.join(' '), /thermal|hot/i);
  });

  it('caps a strong device at the light model tier for free access', () => {
    const result = evaluate({
      ...safeDesktopProfile,
      approxRamGb: 16,
    }, {
      accessTier: 'free',
      benchmarkStatusByModelTier: verifiedBenchmarkGates,
    });

    assert.equal(result.assignedTier, 'pro');
    assert.deepEqual(result.eligibleModelTiers, ['light']);
    assert.deepEqual(result.allowedModelTiers, ['light']);
    assert.equal(result.canAttempt4B, false);
    assert.match(result.reasons.join(' '), /free.*caps.*light/i);
  });

  it('does not let a pro entitlement bypass weak-device hardware limits', () => {
    const result = evaluate({
      ...safeDesktopProfile,
      deviceKind: 'laptop',
      approxRamGb: 4,
      storageKind: 'hdd',
    }, {
      accessTier: 'pro',
      benchmarkStatusByModelTier: verifiedBenchmarkGates,
    });

    assert.equal(result.assignedTier, 'light');
    assert.deepEqual(result.allowedModelTiers, ['light']);
    assert.equal(result.canAttempt4B, false);
  });

  it('does not let admin-granted access bypass weak-device hardware or benchmark gates', () => {
    const result = evaluate({
      ...safeDesktopProfile,
      deviceKind: 'laptop',
      approxRamGb: 4,
      storageKind: 'hdd',
    }, {
      accessTier: 'admin-granted',
    });

    assert.equal(result.assignedTier, 'light');
    assert.ok(result.blockedModelTiers.includes('pro'));
    assert.equal(result.canAttempt4B, false);
    assert.equal(result.canAttemptModelDownload, false);
    assert.equal(result.requiresBenchmarkBeforeModel, true);
  });

  it('keeps full AI feature UI visible and changes only execution policy', () => {
    const result = evaluate({
      deviceKind: 'mobile',
      approxRamGb: 2,
      storageKind: 'flash',
      browserName: 'chrome',
      osName: 'android',
      webGpuStatus: 'unsupported',
      batteryLevelPercent: 50,
      thermalStatus: 'normal',
      connectionKind: 'cellular',
    });

    assert.equal(result.featureAvailability, 'full-ui');
    assert.deepEqual(
      result.visibleFeatureIds,
      AI_FEATURE_REGISTRY.map((feature) => feature.id),
    );
  });

  it('keeps a failed benchmark locked even on a strong device', () => {
    const result = evaluate({
      ...safeDesktopProfile,
      approxRamGb: 16,
    }, {
      accessTier: 'admin-granted',
      benchmarkStatusByModelTier: {
        light: 'passed',
        standard: 'passed',
        pro: 'failed',
      },
    });

    assert.equal(result.canAttempt4B, false);
    assert.equal(result.requiresBenchmarkBeforeModel, true);
    assert.match(result.warnings.join(' '), /benchmark.*failed/i);
  });

  it('provides an honest policy overview for the readiness page', () => {
    const viewModel = buildLocalAiDeviceTierPolicyOverview();

    assert.equal(viewModel.tiers.length, 4);
    assert.match(viewModel.featureParitySummary, /full.*feature UI/i);
    assert.match(viewModel.currentState, /no device probe has run/i);
    assert.match(viewModel.safetySummary, /battery|thermal|WebGPU|cellular/i);
    assert.match(viewModel.entitlementSummary, /does not bypass/i);
    assert.doesNotMatch(
      JSON.stringify(viewModel),
      /model is ready|runtime is ready|4B is active|benchmark passed|generated recommendation/i,
    );
  });

  it('integrates a small honest device-tier card into Local AI Readiness and registers the test', () => {
    const shell = read('../../src/components/ai/LocalAIReadinessShell.tsx');
    const packageJson = read('../../package.json');

    assert.match(shell, /buildLocalAiDeviceTierPolicyOverview/);
    assert.match(shell, /Phase 4\.4 device tier gate/);
    assert.match(shell, /deviceTierPolicy\.featureParitySummary/);
    assert.match(shell, /deviceTierPolicy\.safetySummary/);
    assert.match(shell, /deviceTierPolicy\.entitlementSummary/);
    assert.match(shell, /deviceTierPolicy\.benchmarkSummary/);
    assert.doesNotMatch(shell, /navigator\.gpu|AIService|\.execute\(|Math\.random|Date\.now|setTimeout/);
    assert.match(packageJson, /test\/platform\/localAiDeviceTierPolicy\.test\.ts/);
  });

  it('does not call browser capability APIs or introduce forbidden runtime patterns', () => {
    const sources = [
      read('../../src/platform/ai/localAiDeviceTierTypes.ts'),
      read('../../src/platform/ai/localAiDeviceTierPolicy.ts'),
      read('../../src/platform/ai/localAiDeviceTierViewModel.ts'),
    ].join('\n');

    assert.doesNotMatch(sources, /navigator\.gpu|navigator\.getBattery|navigator\.storage/);
    assert.doesNotMatch(sources, /AIService|\.execute\(|Math\.random|Date\.now|setTimeout/);
    assert.doesNotMatch(sources, /modelUrl|downloadUrl|artifactUrl|API key|cloud sync/i);
    assert.doesNotMatch(sources, /IELTS|TOEIC|TOEFL|band score|Speaking Part|Writing Task/i);
  });

  it('documents the deterministic policy and preserves protected-path exclusions', () => {
    const doc = read('../../docs/ai/phase-4-device-tier-policy.md');
    assert.match(doc, /Status/i);
    assert.match(doc, /Device tiers/i);
    assert.match(doc, /Entitlement boundary/i);
    assert.match(doc, /Feature parity/i);
    assert.match(doc, /Fallback/i);
    assert.match(doc, /Non-goals/i);

    const result = scanAISafetyRegression({ root: process.cwd() });
    assert.ok(result.files.some((path) => path.endsWith('localAiDeviceTierPolicy.ts')));
    assert.ok(result.files.some((path) => path.endsWith('localAiDeviceTierViewModel.ts')));
    assert.equal(
      result.files.some((path) => /^(?:\.env|secrets\/|\.agents\/|docs\/superpowers\/|public\/audio\/|public\/data\/|src\/curriculum\/|supabase\/migrations\/)/.test(path)),
      false,
    );
    assert.deepEqual(result.violations, []);
  });
});
