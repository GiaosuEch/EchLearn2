import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import { AI_FEATURE_REGISTRY } from '../../src/platform/ai/aiFeatureRegistry.ts';
import { buildLocalModelAcquisitionViewModel } from '../../src/platform/ai/localModelAcquisitionViewModel.ts';
import { probeLocalRuntimeCapabilities } from '../../src/platform/ai/localRuntimeCapabilityProbe.ts';

const require = createRequire(import.meta.url);
const { scanAISafetyRegression } = require('../../scripts/verify_ai_safety_regression.cjs') as {
  scanAISafetyRegression(options: { root: string }): {
    files: string[];
    violations: Array<{ path: string; ruleId: string; message: string }>;
  };
};

function read(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

async function probe(options: {
  ram: number;
  deviceKind: 'mobile' | 'laptop' | 'desktop';
  storageKind: 'flash' | 'hdd' | 'ssd';
  webGpu: boolean;
  connection?: 'wifi' | 'cellular';
  battery?: number;
  thermal?: 'normal' | 'hot';
  android?: boolean;
}) {
  return probeLocalRuntimeCapabilities({
    hasWindow: true,
    secureContext: true,
    navigator: {
      deviceMemory: options.ram,
      ...(options.webGpu ? { gpu: {} } : {}),
      connection: options.connection ? { type: options.connection } : undefined,
      getBattery: options.battery === undefined
        ? undefined
        : async () => ({ level: options.battery / 100, charging: true }),
      userAgent: options.android
        ? 'Mozilla/5.0 (Linux; Android 15; Mobile) Chrome/150.0 Mobile Safari/537.36'
        : 'Mozilla/5.0 (Windows NT 10.0) Chrome/150.0 Safari/537.36',
      platform: options.android ? 'Linux armv8l' : 'Win32',
    },
    trustedDeviceKindHint: options.deviceKind,
    trustedStorageKindHint: options.storageKind,
    trustedThermalStatusHint: options.thermal ?? 'normal',
  });
}

describe('Phase 4.7 local model acquisition view model', () => {
  it('summarizes exactly three blocked production candidates', async () => {
    const runtimeCapability = await probe({
      ram: 16,
      deviceKind: 'desktop',
      storageKind: 'ssd',
      webGpu: true,
      connection: 'wifi',
      battery: 80,
    });
    const viewModel = buildLocalModelAcquisitionViewModel(runtimeCapability, { accessTier: 'pro' });

    assert.equal(viewModel.candidates.length, 3);
    assert.deepEqual(viewModel.summary, {
      totalCandidates: 3,
      blockedCandidates: 3,
      awaitingConfirmationCandidates: 0,
      preflightPassedCandidates: 0,
      downloadableCandidates: 0,
      activeModels: 0,
    });
  });

  it('keeps an Oppo A5x-like profile ultra-low with full UI and fallback', async () => {
    const runtimeCapability = await probe({
      ram: 2,
      deviceKind: 'mobile',
      storageKind: 'flash',
      webGpu: false,
      android: true,
    });
    const viewModel = buildLocalModelAcquisitionViewModel(runtimeCapability, { accessTier: 'pro' });

    assert.equal(viewModel.candidateDeviceTier, 'ultra-low');
    assert.equal(viewModel.summary.blockedCandidates, 3);
    assert.equal(viewModel.featureAvailability, 'full-ui');
    assert.deepEqual(viewModel.visibleFeatureIds, AI_FEATURE_REGISTRY.map((feature) => feature.id));
    assert.match(viewModel.fallbackSummary, /deterministic fallback/i);
    assert.equal(viewModel.modelActive, false);
  });

  it('keeps an i3 4 GB HDD-like profile light and blocks standard, pro, and 4B', async () => {
    const runtimeCapability = await probe({
      ram: 4,
      deviceKind: 'laptop',
      storageKind: 'hdd',
      webGpu: false,
      connection: 'wifi',
    });
    const viewModel = buildLocalModelAcquisitionViewModel(runtimeCapability, { accessTier: 'pro' });

    assert.equal(viewModel.candidateDeviceTier, 'light');
    assert.equal(viewModel.summary.blockedCandidates, 3);
    assert.ok(viewModel.candidates.find((candidate) => candidate.candidateTier === 'standard')?.blockers.includes('candidate-tier-not-allowed'));
    assert.ok(viewModel.candidates.find((candidate) => candidate.candidateTier === 'pro')?.blockers.includes('candidate-tier-not-allowed'));
    assert.equal(viewModel.canAttempt4B, false);
    assert.equal(viewModel.modelActive, false);
  });

  it('allows a strong desktop to classify as pro without passing acquisition or activating 4B', async () => {
    const runtimeCapability = await probe({
      ram: 16,
      deviceKind: 'desktop',
      storageKind: 'ssd',
      webGpu: true,
      connection: 'wifi',
      battery: 80,
    });
    const viewModel = buildLocalModelAcquisitionViewModel(runtimeCapability, { accessTier: 'lifetime' });

    assert.equal(viewModel.candidateDeviceTier, 'pro');
    assert.equal(viewModel.summary.blockedCandidates, 3);
    assert.equal(viewModel.summary.preflightPassedCandidates, 0);
    assert.equal(viewModel.canAttempt4B, false);
    assert.equal(viewModel.modelActive, false);
    assert.ok(viewModel.candidates.every((candidate) => candidate.status === 'blocked'));
  });

  it('uses honest policy-only copy without readiness or recommendation claims', async () => {
    const runtimeCapability = await probe({
      ram: 16,
      deviceKind: 'desktop',
      storageKind: 'ssd',
      webGpu: true,
      connection: 'wifi',
    });
    const viewModel = buildLocalModelAcquisitionViewModel(runtimeCapability);
    const serialized = JSON.stringify(viewModel);

    assert.equal(viewModel.heading, 'Local Model Acquisition Preflight');
    assert.equal(viewModel.policySummary, 'Policy only');
    assert.equal(viewModel.downloadStateSummary, 'No download started');
    assert.equal(viewModel.modelStateSummary, 'No model active');
    assert.match(viewModel.approvalSummary, /Approval still required/i);
    assert.match(viewModel.benchmarkSummary, /Benchmark still required/i);
    assert.match(viewModel.confirmationSummary, /not available until prerequisites pass/i);
    assert.match(viewModel.coreAppSummary, /Core app remains available/i);
    assert.match(viewModel.fallbackSummary, /Deterministic fallback remains available/i);
    assert.doesNotMatch(serialized, /model ready|runtime ready|ready to download|download now|install now|4B active|benchmark passed|recommended model|best model|AI-generated recommendation/i);
  });

  it('adds one Phase 4.7 card while preserving Phase 4.1 through 4.6 UI', () => {
    const shell = read('../../src/components/ai/LocalAIReadinessShell.tsx');

    assert.match(shell, /Phase 4 runtime ADR/);
    assert.match(shell, /Phase 4\.2 approval review/);
    assert.match(shell, /Phase 4\.3 benchmark plan/);
    assert.match(shell, /Phase 4\.4 device tier gate/);
    assert.match(shell, /Phase 4\.5 artifact and cache policy/);
    assert.match(shell, /Phase 4\.6 runtime capability probe/);
    assert.match(shell, /Phase 4\.7 local model acquisition preflight/);
    assert.match(shell, /Local Model Acquisition Preflight/);
    assert.match(shell, /Policy only/);
    assert.match(shell, /No download started/);
    assert.match(shell, /No cache written/);
    assert.match(shell, /No model active/);
    assert.match(shell, /blockedCandidates/);
    assert.match(shell, /awaitingConfirmationCandidates/);
    assert.match(shell, /preflightPassedCandidates/);
    assert.doesNotMatch(shell, /onClick=.*(?:download|install|activate)|handleDownload|handleInstall|handleActivate/i);
  });

  it('keeps Phase 4.7 source side-effect free and confirmation ephemeral', () => {
    const paths = [
      '../../src/platform/ai/localModelAcquisitionTypes.ts',
      '../../src/platform/ai/localModelAcquisitionPreflight.ts',
      '../../src/platform/ai/localModelAcquisitionViewModel.ts',
      '../../src/components/ai/LocalAIReadinessShell.tsx',
    ];
    const source = paths.map(read).join('\n');
    const forbidden = [
      /fetch\s*\(/,
      /XMLHttpRequest/,
      /WebSocket/,
      /indexedDB/,
      /CacheStorage/,
      /caches\.open/,
      /localStorage/,
      /sessionStorage/,
      /requestAdapter\s*\(/,
      /requestDevice\s*\(/,
      /AIService/,
      /\.execute\s*\(/,
      /Math\.random/,
      /Date\.now/,
      /setTimeout/,
      /\bWorker\s*\(/,
      /SharedWorker\s*\(/,
      /importScripts\s*\(/,
      /createObjectURL\s*\(/,
      /serviceWorker\.register/,
      /http:\/\//,
      /https:\/\//,
    ];

    for (const pattern of forbidden) assert.doesNotMatch(source, pattern);
    assert.doesNotMatch(source, /preferredLocalAiTier/);
    assert.doesNotMatch(source, /learnerMemory/i);
  });

  it('registers both Phase 4.7 tests in test and test:platform scripts', () => {
    const packageJson = JSON.parse(read('../../package.json')) as { scripts: Record<string, string> };

    for (const scriptName of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[scriptName], /test\/platform\/localModelAcquisitionPreflight\.test\.ts/);
      assert.match(packageJson.scripts[scriptName], /test\/platform\/localModelAcquisitionViewModel\.test\.ts/);
    }
  });

  it('documents every Phase 4.7 boundary and current production blocker', () => {
    const doc = read('../../docs/ai/phase-4-local-model-acquisition-preflight.md');

    for (const heading of [
      'Status',
      'Purpose',
      'Existing foundations',
      'Preflight inputs',
      'Candidate and artifact matching',
      'Governance approval gates',
      'Benchmark gate',
      'Device and entitlement gate',
      'Capability and environmental gates',
      'Storage quota handling',
      'Explicit user confirmation',
      'Preflight statuses',
      'Current production state',
      'Privacy and persistence',
      'Failure handling',
      'Safety invariants',
      'Non-goals',
    ]) {
      assert.match(doc, new RegExp(`## ${heading}`, 'i'), heading);
    }

    assert.match(doc, /policy only/i);
    assert.match(doc, /three candidates remain blocked/i);
    assert.match(doc, /benchmark statuses remain not-run/i);
    assert.match(doc, /artifact sizes remain unknown/i);
    assert.match(doc, /download locations remain absent/i);
    assert.match(doc, /checksums remain missing/i);
    assert.match(doc, /preferred AI tier.*not.*entitlement/i);
    assert.match(doc, /preflight-passed.*does not mean.*model ready/i);
  });

  it('keeps the existing AI safety regression scan clean', () => {
    const result = scanAISafetyRegression({ root: process.cwd() });

    assert.ok(result.files.some((path) => path.endsWith('localModelAcquisitionPreflight.ts')));
    assert.ok(result.files.some((path) => path.endsWith('localModelAcquisitionViewModel.ts')));
    assert.deepEqual(result.violations, []);
  });
});
