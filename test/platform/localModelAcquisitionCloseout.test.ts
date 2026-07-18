import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { AI_FEATURE_REGISTRY } from '../../src/platform/ai/aiFeatureRegistry.ts';
import {
  buildCurrentLocalModelAcquisitionCloseout,
  evaluateLocalModelAcquisitionCloseout,
} from '../../src/platform/ai/localModelAcquisitionCloseout.ts';
import type { LocalModelAcquisitionCloseoutInput } from '../../src/platform/ai/localModelAcquisitionCloseoutTypes.ts';
import { probeLocalRuntimeCapabilities } from '../../src/platform/ai/localRuntimeCapabilityProbe.ts';

function safeInput(): LocalModelAcquisitionCloseoutInput {
  return {
    totalCandidates: 3,
    approvedCandidates: 0,
    benchmarkPassedCandidates: 0,
    downloadableCandidates: 0,
    runtimeDecisionSafe: true,
    approvalRegistrySafe: true,
    benchmarkStateSafe: true,
    tierMatrixCompatible: true,
    ultraLowNoModel: true,
    artifactManifestSafe: true,
    cachePolicySafe: true,
    metadataOnlyProbe: true,
    preflightBlockedCandidates: 3,
    preflightPassedCandidates: 0,
    consentAvailableCandidates: 0,
    confirmedConsentCandidates: 0,
    authorizedCandidates: 0,
    consumedAuthorizations: 0,
    executionEligibleCandidates: 0,
    executionRequestsBuilt: 0,
    executorInvocations: 0,
    acceptedHandoffs: 0,
    downloadsStarted: 0,
    downloadsCompleted: 0,
    cachesWritten: 0,
    checksumsVerified: 0,
    runtimeInitializations: 0,
    activeModels: 0,
    productionExecutorAvailable: false,
    productionExecutionAvailable: false,
    modelReady: false,
    modelActive: false,
    coreAppAvailable: true,
    deterministicFallbackAvailable: true,
    fullFeatureUiPreserved: true,
    visibleFeatureIds: AI_FEATURE_REGISTRY.map((feature) => feature.id),
    candidateDeviceTier: 'ultra-low',
    noRuntimeSideEffects: true,
  };
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

describe('Phase 4.11 local model acquisition safety closeout', () => {
  it('reports the complete production blocked-safe state without model readiness', () => {
    const result = buildCurrentLocalModelAcquisitionCloseout();

    assert.equal(result.totalCandidates, 3);
    assert.equal(result.approvedCandidates, 0);
    assert.equal(result.benchmarkPassedCandidates, 0);
    assert.equal(result.downloadableCandidates, 0);
    assert.equal(result.preflightPassedCandidates, 0);
    assert.equal(result.consentAvailableCandidates, 0);
    assert.equal(result.confirmedConsentCandidates, 0);
    assert.equal(result.authorizedCandidates, 0);
    assert.equal(result.consumedAuthorizations, 0);
    assert.equal(result.executionEligibleCandidates, 0);
    assert.equal(result.executionRequestsBuilt, 0);
    assert.equal(result.executorInvocations, 0);
    assert.equal(result.acceptedHandoffs, 0);
    assert.equal(result.downloadsStarted, 0);
    assert.equal(result.downloadsCompleted, 0);
    assert.equal(result.cachesWritten, 0);
    assert.equal(result.checksumsVerified, 0);
    assert.equal(result.runtimeInitializations, 0);
    assert.equal(result.activeModels, 0);
    assert.equal(result.productionExecutorAvailable, false);
    assert.equal(result.productionExecutionAvailable, false);
    assert.equal(result.metadataOnlyProbe, true);
    assert.equal(result.modelReady, false);
    assert.equal(result.modelActive, false);
    assert.equal(result.coreAppAvailable, true);
    assert.equal(result.deterministicFallbackAvailable, true);
    assert.equal(result.status, 'foundation-complete');
    assert.equal(result.phaseFoundationComplete, true);
  });

  it('allows foundation-complete and unavailable production execution to coexist honestly', () => {
    const result = buildCurrentLocalModelAcquisitionCloseout();
    assert.equal(result.phaseFoundationComplete, true);
    assert.equal(result.productionExecutionAvailable, false);
    assert.equal(result.productionExecutorAvailable, false);
    assert.equal(result.modelReady, false);
    assert.equal(result.modelActive, false);
  });

  it('keeps the exact tier matrix and ultra-low no-model direction', () => {
    const result = buildCurrentLocalModelAcquisitionCloseout();
    const tierCheck = result.checks.find((check) => check.id === 'tier-matrix-compatible');
    assert.equal(tierCheck?.status, 'pass');
    assert.equal(result.tierMatrixCompatible, true);
    assert.equal(result.ultraLowNoModel, true);
  });

  it('preserves every AI-facing feature and deterministic fallback', () => {
    const result = buildCurrentLocalModelAcquisitionCloseout();
    assert.equal(result.featureAvailability, 'full-ui');
    assert.deepEqual(result.visibleFeatureIds, AI_FEATURE_REGISTRY.map((feature) => feature.id));
    assert.equal(result.coreAppAvailable, true);
    assert.equal(result.deterministicFallbackAvailable, true);
  });

  it('fails closeout for every synthetic production invariant break', () => {
    const cases: Array<{
      name: string;
      patch: Partial<LocalModelAcquisitionCloseoutInput>;
      checkId: string;
    }> = [
      { name: 'approved candidate', patch: { approvedCandidates: 1 }, checkId: 'approval-registry-safe' },
      { name: 'benchmark pass', patch: { benchmarkPassedCandidates: 1 }, checkId: 'benchmark-state-safe' },
      { name: 'downloadable candidate', patch: { downloadableCandidates: 1 }, checkId: 'artifact-manifest-safe' },
      { name: 'consent available', patch: { consentAvailableCandidates: 1 }, checkId: 'consent-production-unavailable' },
      { name: 'authorization granted', patch: { authorizedCandidates: 1 }, checkId: 'authorization-production-unavailable' },
      { name: 'execution request', patch: { executionRequestsBuilt: 1 }, checkId: 'execution-request-production-zero' },
      { name: 'executor available', patch: { productionExecutorAvailable: true }, checkId: 'executor-production-unavailable' },
      { name: 'download started', patch: { downloadsStarted: 1 }, checkId: 'download-production-zero' },
      { name: 'cache written', patch: { cachesWritten: 1 }, checkId: 'cache-write-production-zero' },
      { name: 'runtime initialized', patch: { runtimeInitializations: 1 }, checkId: 'runtime-initialization-production-zero' },
      { name: 'model active', patch: { activeModels: 1 }, checkId: 'model-active-production-zero' },
      { name: 'fallback unavailable', patch: { deterministicFallbackAvailable: false }, checkId: 'fallback-available' },
      { name: 'tier mismatch', patch: { tierMatrixCompatible: false }, checkId: 'tier-matrix-compatible' },
    ];

    for (const fixture of cases) {
      const result = evaluateLocalModelAcquisitionCloseout({ ...safeInput(), ...fixture.patch });
      assert.equal(result.status, 'attention-required', fixture.name);
      assert.equal(result.phaseFoundationComplete, false, fixture.name);
      assert.equal(result.checks.find((check) => check.id === fixture.checkId)?.status, 'fail', fixture.name);
      assert.ok(result.blockingIssues.length > 0, fixture.name);
    }
  });

  it('keeps issues deterministic, unique, and does not mutate input', () => {
    const input = { ...safeInput(), activeModels: 1, downloadsStarted: 1 };
    const before = JSON.stringify(input);
    const first = evaluateLocalModelAcquisitionCloseout(input);
    const second = evaluateLocalModelAcquisitionCloseout(input);

    assert.equal(JSON.stringify(input), before);
    assert.deepEqual(first.blockingIssues, second.blockingIssues);
    assert.equal(new Set(first.blockingIssues).size, first.blockingIssues.length);
  });

  it('keeps Oppo A5x-like ultra-low with full UI and a complete safety foundation', async () => {
    const runtimeCapability = await probe({
      ram: 2,
      deviceKind: 'mobile',
      storageKind: 'flash',
      webGpu: false,
      android: true,
    });
    const result = buildCurrentLocalModelAcquisitionCloseout({ runtimeCapability, accessTier: 'pro' });

    assert.equal(result.candidateDeviceTier, 'ultra-low');
    assert.equal(result.phaseFoundationComplete, true);
    assert.equal(result.executionEligibleCandidates, 0);
    assert.equal(result.activeModels, 0);
    assert.equal(result.featureAvailability, 'full-ui');
    assert.equal(result.deterministicFallbackAvailable, true);
  });

  it('keeps i3 4 GB HDD-like light and production acquisition blocked', async () => {
    const runtimeCapability = await probe({
      ram: 4,
      deviceKind: 'laptop',
      storageKind: 'hdd',
      webGpu: false,
      connection: 'wifi',
    });
    const result = buildCurrentLocalModelAcquisitionCloseout({ runtimeCapability, accessTier: 'pro' });

    assert.equal(result.candidateDeviceTier, 'light');
    assert.equal(result.phaseFoundationComplete, true);
    assert.equal(result.executionEligibleCandidates, 0);
    assert.equal(result.activeModels, 0);
  });

  it('keeps strong desktop pro-candidate while approval and execution remain unavailable', async () => {
    const runtimeCapability = await probe({
      ram: 16,
      deviceKind: 'desktop',
      storageKind: 'ssd',
      webGpu: true,
      connection: 'wifi',
      battery: 80,
    });
    const result = buildCurrentLocalModelAcquisitionCloseout({ runtimeCapability, accessTier: 'pro' });

    assert.equal(result.candidateDeviceTier, 'pro');
    assert.equal(result.phaseFoundationComplete, true);
    assert.equal(result.approvedCandidates, 0);
    assert.equal(result.executionRequestsBuilt, 0);
    assert.equal(result.acceptedHandoffs, 0);
    assert.equal(result.activeModels, 0);
  });

  it('contains no acquisition runtime side effects across Phase 4.7-4.11 sources', () => {
    const files = [
      '../../src/platform/ai/localModelAcquisitionPreflight.ts',
      '../../src/platform/ai/localModelAcquisitionViewModel.ts',
      '../../src/platform/ai/localModelAcquisitionConsentPolicy.ts',
      '../../src/platform/ai/localModelAcquisitionConsentViewModel.ts',
      '../../src/platform/ai/localModelAcquisitionAuthorizationPolicy.ts',
      '../../src/platform/ai/localModelAcquisitionAuthorizationViewModel.ts',
      '../../src/platform/ai/localModelAcquisitionExecutorBoundary.ts',
      '../../src/platform/ai/localModelAcquisitionExecutionViewModel.ts',
      '../../src/platform/ai/localModelAcquisitionCloseout.ts',
      '../../src/platform/ai/localModelAcquisitionCloseoutViewModel.ts',
    ];
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
      /https?:\/\//,
    ];

    for (const file of files) {
      const source = readFileSync(new URL(file, import.meta.url), 'utf8');
      for (const pattern of forbidden) {
        assert.doesNotMatch(source, pattern, `${file} matched ${pattern}`);
      }
    }
  });
});
