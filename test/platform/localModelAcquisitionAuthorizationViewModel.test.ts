import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import { AI_FEATURE_REGISTRY } from '../../src/platform/ai/aiFeatureRegistry.ts';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from '../../src/platform/ai/localModelArtifactManifest.ts';
import {
  evaluateLocalModelAcquisitionPreflight,
} from '../../src/platform/ai/localModelAcquisitionPreflight.ts';
import type { LocalModelAcquisitionPreflightInput } from '../../src/platform/ai/localModelAcquisitionTypes.ts';
import {
  applyLocalModelAcquisitionConsentEvent,
  buildLocalModelAcquisitionDisclosure,
  createLocalModelAcquisitionConsentSession,
  rebuildLocalModelAcquisitionPreflightWithConsent,
} from '../../src/platform/ai/localModelAcquisitionConsentPolicy.ts';
import {
  applyLocalModelAcquisitionAuthorizationEvent,
  buildLocalModelAcquisitionAuthorizationScope,
  createLocalModelAcquisitionAuthorizationSession,
} from '../../src/platform/ai/localModelAcquisitionAuthorizationPolicy.ts';
import {
  buildLocalModelAcquisitionAuthorizationDecisionViewModel,
  buildLocalModelAcquisitionAuthorizationViewModel,
} from '../../src/platform/ai/localModelAcquisitionAuthorizationViewModel.ts';
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

function syntheticCachePolicy(canPlanFutureDownloadAttempt: boolean) {
  return {
    cacheBudget: {
      tier: 'light' as const,
      minimumModelCacheMb: 500,
      maximumModelCacheMb: 1024,
      automaticEnable: false as const,
      budgetStatus: 'bounded-candidate-budget' as const,
    },
    canPlanFutureDownloadAttempt,
    requiresUserConfirmation: !canPlanFutureDownloadAttempt,
    userDeletionRequired: true as const,
    coreAppFallback: 'unaffected' as const,
    corruptedCacheRecovery: 'delete-and-redownload-after-approval' as const,
    warnings: [] as const,
    reasons: [] as const,
    userFacingSummary: 'Synthetic policy-only fixture.',
  };
}

function syntheticApprovedInput(): LocalModelAcquisitionPreflightInput {
  return {
    candidateId: 'synthetic-light-candidate',
    candidateTier: 'light',
    candidateSelected: true,
    candidateExists: true,
    artifactExists: true,
    candidateArtifactMatches: true,
    candidateTierMatches: true,
    modelApproved: true,
    licenseApproved: true,
    artifactApproved: true,
    artifactDownloadable: true,
    artifactCacheable: true,
    artifactRuntimeReady: true,
    checksumStatus: 'verified',
    downloadLocationStatus: 'approved',
    benchmarkStatus: 'passed',
    deviceTier: 'light',
    deviceGateAllowsCandidate: true,
    candidateTierEligible: true,
    candidateTierAllowed: true,
    webGpuStatus: 'supported',
    connectionKind: 'wifi',
    batteryLevelPercent: 80,
    thermalStatus: 'normal',
    storageQuotaStatus: 'sufficient',
    confirmationStatus: 'not-requested',
    cachePolicyResult: syntheticCachePolicy(true),
    featureAvailability: 'full-ui',
  };
}

function syntheticAuthorizationInput() {
  const preflightInput = syntheticApprovedInput();
  const basePreflight = evaluateLocalModelAcquisitionPreflight(preflightInput);
  const disclosure = buildLocalModelAcquisitionDisclosure({
    candidateId: 'synthetic-light-candidate',
    candidateTier: 'light',
    artifactCandidateId: 'synthetic-light-artifact',
    modelClassLabel: '0.6B',
    estimatedDownloadSizeMb: 640,
    expectedStorageImpactMb: 700,
    connectionRequirement: 'Wi-Fi is required.',
    batteryRequirement: 'Battery must remain safe.',
    localProcessingStatement: 'Approved local inference would process supported tasks on this device.',
    cloudProcessingStatement: 'This decision does not authorize cloud inference.',
    cacheRemovalStatement: 'A future lifecycle must provide user-controlled removal.',
    confirmationMeaning: 'Confirmation remains one prerequisite and does not execute acquisition.',
  });
  const consentInput = { preflight: basePreflight, disclosure };
  const consent = applyLocalModelAcquisitionConsentEvent(
    createLocalModelAcquisitionConsentSession(consentInput),
    { type: 'confirm' },
    consentInput,
  );
  const finalPreflight = rebuildLocalModelAcquisitionPreflightWithConsent(
    preflightInput,
    consent,
    consentInput,
  );
  return {
    preflight: finalPreflight,
    consent,
    scope: buildLocalModelAcquisitionAuthorizationScope({
      candidateId: 'synthetic-light-candidate',
      candidateTier: 'light',
      artifactCandidateId: 'synthetic-light-artifact',
      estimatedDownloadSizeMb: 640,
      expectedStorageImpactMb: 700,
      disclosureRevision: disclosure.disclosureRevision,
      accessTier: 'pro',
      assignedDeviceTier: 'light',
      benchmarkStatus: 'passed',
      webGpuStatus: 'supported',
      connectionKind: 'wifi',
      batterySafety: 'safe',
      thermalStatus: 'normal',
      storageQuotaStatus: 'sufficient',
    }),
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

describe('Phase 4.9 local model acquisition authorization view model', () => {
  it('summarizes three current candidates with zero authorization availability or execution state', async () => {
    const runtimeCapability = await probe({
      ram: 16,
      deviceKind: 'desktop',
      storageKind: 'ssd',
      webGpu: true,
      connection: 'wifi',
      battery: 80,
    });
    const viewModel = buildLocalModelAcquisitionAuthorizationViewModel(runtimeCapability, { accessTier: 'pro' });

    assert.equal(viewModel.candidates.length, 3);
    assert.deepEqual(viewModel.aggregate, {
      totalCandidates: 3,
      authorizationAvailableCandidates: 0,
      awaitingActionRequestCandidates: 0,
      authorizedCandidates: 0,
      cancelledCandidates: 0,
      invalidatedCandidates: 0,
      consumedAuthorizations: 0,
      downloadStartedCandidates: 0,
      activeModels: 0,
    });
    assert.ok(viewModel.candidates.every((candidate) => candidate.state === 'unavailable'));
    assert.ok(viewModel.candidates.every((candidate) => candidate.canRequestAuthorization === false));
  });

  it('uses honest candidate-specific and one-attempt copy without readiness claims', async () => {
    const runtimeCapability = await probe({
      ram: 16,
      deviceKind: 'desktop',
      storageKind: 'ssd',
      webGpu: true,
      connection: 'wifi',
    });
    const viewModel = buildLocalModelAcquisitionAuthorizationViewModel(runtimeCapability);
    const serialized = JSON.stringify(viewModel);

    assert.equal(viewModel.heading, 'Local Model Acquisition Action Authorization');
    assert.equal(viewModel.scopeSummary, 'Authorization is candidate-specific');
    assert.equal(viewModel.oneAttemptSummary, 'Authorization is one-attempt only');
    assert.equal(viewModel.availabilitySummary, 'Authorization unavailable until preflight and consent pass');
    assert.equal(viewModel.authorizationSummary, 'No action authorization granted');
    assert.equal(viewModel.downloadStateSummary, 'No download started');
    assert.equal(viewModel.cacheStateSummary, 'No cache written');
    assert.equal(viewModel.modelStateSummary, 'No model active');
    assert.match(viewModel.governanceSummary, /does not bypass approval or benchmark/i);
    assert.match(viewModel.coreAppSummary, /Core app remains available/i);
    assert.match(viewModel.fallbackSummary, /Deterministic fallback remains available/i);
    assert.doesNotMatch(serialized, /ready to download|download completed|model ready|runtime ready|model installed|4B active|recommended model|best model|AI-generated recommendation/i);
  });

  it('keeps Oppo A5x-like ultra-low with full UI, fallback, and unavailable authorization', async () => {
    const runtimeCapability = await probe({
      ram: 2,
      deviceKind: 'mobile',
      storageKind: 'flash',
      webGpu: false,
      android: true,
    });
    const viewModel = buildLocalModelAcquisitionAuthorizationViewModel(runtimeCapability, { accessTier: 'pro' });

    assert.equal(viewModel.candidateDeviceTier, 'ultra-low');
    assert.equal(viewModel.aggregate.authorizationAvailableCandidates, 0);
    assert.equal(viewModel.featureAvailability, 'full-ui');
    assert.deepEqual(viewModel.visibleFeatureIds, AI_FEATURE_REGISTRY.map((feature) => feature.id));
    assert.match(viewModel.fallbackSummary, /deterministic fallback/i);
    assert.equal(viewModel.modelActive, false);
  });

  it('keeps i3 4 GB HDD-like light and blocks standard, pro, and 4B authorization', async () => {
    const runtimeCapability = await probe({
      ram: 4,
      deviceKind: 'laptop',
      storageKind: 'hdd',
      webGpu: false,
      connection: 'wifi',
    });
    const viewModel = buildLocalModelAcquisitionAuthorizationViewModel(runtimeCapability, { accessTier: 'pro' });

    assert.equal(viewModel.candidateDeviceTier, 'light');
    assert.equal(viewModel.aggregate.authorizationAvailableCandidates, 0);
    assert.ok(viewModel.consentViewModel.preflightViewModel.candidates.find((candidate) => candidate.candidateTier === 'standard')?.blockers.includes('candidate-tier-not-allowed'));
    assert.ok(viewModel.consentViewModel.preflightViewModel.candidates.find((candidate) => candidate.candidateTier === 'pro')?.blockers.includes('candidate-tier-not-allowed'));
    assert.equal(viewModel.canAttempt4B, false);
    assert.equal(viewModel.modelActive, false);
  });

  it('allows strong desktop pro classification while production authorization and 4B remain unavailable', async () => {
    const runtimeCapability = await probe({
      ram: 16,
      deviceKind: 'desktop',
      storageKind: 'ssd',
      webGpu: true,
      connection: 'wifi',
      battery: 80,
    });
    const viewModel = buildLocalModelAcquisitionAuthorizationViewModel(runtimeCapability, { accessTier: 'lifetime' });

    assert.equal(viewModel.candidateDeviceTier, 'pro');
    assert.equal(viewModel.aggregate.authorizationAvailableCandidates, 0);
    assert.equal(viewModel.canAttempt4B, false);
    assert.equal(viewModel.modelActive, false);
    assert.ok(viewModel.candidates.every((candidate) => candidate.state === 'unavailable'));
  });

  it('models synthetic explicit request and consume without claiming download success', () => {
    const authorizationInput = syntheticAuthorizationInput();
    const authorized = buildLocalModelAcquisitionAuthorizationDecisionViewModel({
      authorizationInput,
      events: [{ type: 'request-authorization' }],
    });
    const consumed = buildLocalModelAcquisitionAuthorizationDecisionViewModel({
      authorizationInput,
      events: [{ type: 'request-authorization' }, { type: 'consume' }],
    });

    assert.equal(authorized.session.state, 'authorized');
    assert.equal(authorized.session.futureExecutorHandoffAllowed, true);
    assert.equal(authorized.downloadStarted, false);
    assert.equal(authorized.cacheWritten, false);
    assert.equal(consumed.session.state, 'consumed');
    assert.equal(consumed.session.futureExecutorHandoffAllowed, false);
    assert.equal(consumed.downloadStarted, false);
    assert.equal(consumed.downloadCompleted, false);
    assert.equal(consumed.modelActive, false);
  });

  it('adds a Phase 4.9 card while preserving Phase 4.1 through 4.8 cards', () => {
    const shell = read('../../src/components/ai/LocalAIReadinessShell.tsx');

    for (const marker of [
      'Phase 4 runtime ADR',
      'Phase 4.2 approval review',
      'Phase 4.3 benchmark plan',
      'Phase 4.4 device tier gate',
      'Phase 4.5 artifact and cache policy',
      'Phase 4.6 runtime capability probe',
      'Phase 4.7 local model acquisition preflight',
      'Phase 4.8 explicit acquisition consent',
      'Phase 4.9 local model acquisition action authorization',
    ]) assert.match(shell, new RegExp(marker.replace('.', '\\.')));

    assert.match(shell, /Local Model Acquisition Action Authorization/);
    assert.match(shell, /Authorization is candidate-specific/);
    assert.match(shell, /Authorization is one-attempt only/);
    assert.match(shell, /Authorization unavailable until preflight and consent pass/);
    assert.match(shell, /No action authorization granted/);
    assert.match(shell, /No download started/);
    assert.match(shell, /No model active/);
    assert.match(shell, /authorizationAvailableCandidates/);
    assert.match(shell, /authorizedCandidates/);
  });

  it('renders authorization controls only behind policy booleans and keeps handlers in React memory', () => {
    const shell = read('../../src/components/ai/LocalAIReadinessShell.tsx');

    assert.match(shell, /candidate\.canRequestAuthorization\s*\?/);
    assert.match(shell, /candidate\.canConsume\s*\?/);
    assert.match(shell, /setAcquisitionAuthorizationSessions/);
    assert.doesNotMatch(shell, /handleDownload|handleInstall|handleActivate|onClick=.*(?:download|install|activate)/i);
    assert.doesNotMatch(shell, /localStorage|sessionStorage|useEffect\([^)]*authorization/i);
  });

  it('preserves tier matrix and duplicates no hardware thresholds in Phase 4.9', () => {
    assert.deepEqual(
      LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) => [candidate.tier, candidate.parameterScaleLabel]),
      [['light', '0.6B'], ['standard', '1.7B'], ['pro', '4B']],
    );
    assert.deepEqual(
      LOCAL_MODEL_ARTIFACT_MANIFEST.map((artifact) => [artifact.modelTier, artifact.parameterScaleLabel]),
      [['light', '0.6B'], ['standard', '1.7B'], ['pro', '4B']],
    );
    const source = [
      read('../../src/platform/ai/localModelAcquisitionAuthorizationPolicy.ts'),
      read('../../src/platform/ai/localModelAcquisitionAuthorizationViewModel.ts'),
    ].join('\n');
    assert.doesNotMatch(source, /approxRamGb|deviceMemory|minimumRam|maximumRam|ramThreshold/i);
  });

  it('keeps Phase 4.9 source free of network, persistence, workers, runtime, AI execution, random tokens, and timestamps', () => {
    const paths = [
      '../../src/platform/ai/localModelAcquisitionAuthorizationTypes.ts',
      '../../src/platform/ai/localModelAcquisitionAuthorizationPolicy.ts',
      '../../src/platform/ai/localModelAcquisitionAuthorizationViewModel.ts',
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
      /randomToken|authorizationToken|timestampAuthorization/i,
    ];
    for (const pattern of forbidden) assert.doesNotMatch(source, pattern);
    assert.doesNotMatch(source, /supabase|database|auditLog|writeFileSync|appendFileSync/i);
    assert.doesNotMatch(source, /preferredLocalAiTier/);
    assert.doesNotMatch(source, /learnerMemory/i);
  });

  it('registers tests, documents the boundary, and keeps AI safety clean', () => {
    const packageJson = JSON.parse(read('../../package.json')) as { scripts: Record<string, string> };
    for (const scriptName of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[scriptName], /test\/platform\/localModelAcquisitionAuthorizationPolicy\.test\.ts/);
      assert.match(packageJson.scripts[scriptName], /test\/platform\/localModelAcquisitionAuthorizationViewModel\.test\.ts/);
    }

    const doc = read('../../docs/ai/phase-4-local-model-acquisition-authorization.md');
    for (const heading of [
      'Status', 'Purpose', 'Relationship to Phase 4.7', 'Relationship to Phase 4.8',
      'Consent versus action authorization', 'Explicit action request', 'Authorization scope',
      'Current-facts revalidation', 'One-attempt authorization', 'Authorization consumption',
      'Scope and policy invalidation', 'Current production state', 'Tier-matrix compatibility',
      'Privacy and persistence', 'Failure handling', 'Safety invariants', 'Non-goals',
    ]) assert.match(doc, new RegExp(`## ${heading}`));
    assert.match(doc, /authorization policy only/i);
    assert.match(doc, /current three production candidates cannot request authorization/i);
    assert.match(doc, /consume does not mean.*download/i);

    const scan = scanAISafetyRegression({ root: new URL('../..', import.meta.url).pathname });
    assert.deepEqual(scan.violations, []);
  });

  it('decision view model uses the same pure policy transitions', () => {
    const input = syntheticAuthorizationInput();
    const initial = createLocalModelAcquisitionAuthorizationSession(input);
    const expected = applyLocalModelAcquisitionAuthorizationEvent(
      initial,
      { type: 'request-authorization' },
      input,
    );
    const actual = buildLocalModelAcquisitionAuthorizationDecisionViewModel({
      authorizationInput: input,
      events: [{ type: 'request-authorization' }],
    });
    assert.deepEqual(actual.session, expected);
  });
});
