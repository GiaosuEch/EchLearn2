import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import { AI_FEATURE_REGISTRY } from '../../src/platform/ai/aiFeatureRegistry.ts';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from '../../src/platform/ai/localModelArtifactManifest.ts';
import {
  buildLocalModelAcquisitionConsentDecisionViewModel,
  buildLocalModelAcquisitionConsentViewModel,
} from '../../src/platform/ai/localModelAcquisitionConsentViewModel.ts';
import {
  buildLocalModelAcquisitionDisclosure,
} from '../../src/platform/ai/localModelAcquisitionConsentPolicy.ts';
import type { LocalModelAcquisitionPreflightInput } from '../../src/platform/ai/localModelAcquisitionTypes.ts';
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

function syntheticDisclosure() {
  return buildLocalModelAcquisitionDisclosure({
    candidateId: 'synthetic-light-candidate',
    candidateTier: 'light',
    artifactCandidateId: 'synthetic-light-artifact',
    modelClassLabel: '0.6B',
    estimatedDownloadSizeMb: 640,
    expectedStorageImpactMb: 700,
    connectionRequirement: 'Wi-Fi is required.',
    batteryRequirement: 'Battery must remain safe.',
    localProcessingStatement: 'Approved local inference would process supported tasks on this device.',
    cloudProcessingStatement: 'This consent does not send acquisition data to a cloud inference provider.',
    cacheRemovalStatement: 'A future lifecycle must provide user-controlled removal.',
    confirmationMeaning: 'Confirmation is one policy input and does not authorize execution.',
  });
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

describe('Phase 4.8 local model acquisition consent view model', () => {
  it('summarizes exactly three current candidates with zero consent availability', async () => {
    const runtimeCapability = await probe({
      ram: 16,
      deviceKind: 'desktop',
      storageKind: 'ssd',
      webGpu: true,
      connection: 'wifi',
      battery: 80,
    });
    const viewModel = buildLocalModelAcquisitionConsentViewModel(runtimeCapability, { accessTier: 'pro' });

    assert.equal(viewModel.candidates.length, 3);
    assert.deepEqual(viewModel.aggregate, {
      totalCandidates: 3,
      consentAvailableCandidates: 0,
      awaitingDecisionCandidates: 0,
      confirmedCandidates: 0,
      declinedCandidates: 0,
      invalidatedCandidates: 0,
      downloadStartedCandidates: 0,
      activeModels: 0,
    });
    assert.ok(viewModel.candidates.every((candidate) => candidate.state === 'unavailable'));
    assert.ok(viewModel.candidates.every((candidate) => candidate.canConfirm === false));
  });

  it('uses honest candidate-specific consent copy without readiness claims', async () => {
    const runtimeCapability = await probe({
      ram: 16,
      deviceKind: 'desktop',
      storageKind: 'ssd',
      webGpu: true,
      connection: 'wifi',
    });
    const viewModel = buildLocalModelAcquisitionConsentViewModel(runtimeCapability);
    const serialized = JSON.stringify(viewModel);

    assert.equal(viewModel.heading, 'Explicit Local Model Acquisition Consent');
    assert.equal(viewModel.scopeSummary, 'Consent is candidate-specific');
    assert.equal(viewModel.availabilitySummary, 'Consent unavailable until all prerequisites pass');
    assert.equal(viewModel.decisionSummary, 'No consent recorded');
    assert.equal(viewModel.downloadStateSummary, 'No download started');
    assert.equal(viewModel.cacheStateSummary, 'No cache written');
    assert.equal(viewModel.modelStateSummary, 'No model active');
    assert.match(viewModel.governanceSummary, /does not bypass approval or benchmark/i);
    assert.match(viewModel.coreAppSummary, /Core app remains available/i);
    assert.match(viewModel.fallbackSummary, /Deterministic fallback remains available/i);
    assert.doesNotMatch(serialized, /ready to download|download authorized|model ready|runtime ready|model installed|4B active|recommended model|best model|AI-generated recommendation/i);
  });

  it('keeps an Oppo A5x-like device ultra-low with full UI, fallback, and unavailable consent', async () => {
    const runtimeCapability = await probe({
      ram: 2,
      deviceKind: 'mobile',
      storageKind: 'flash',
      webGpu: false,
      android: true,
    });
    const viewModel = buildLocalModelAcquisitionConsentViewModel(runtimeCapability, { accessTier: 'pro' });

    assert.equal(viewModel.candidateDeviceTier, 'ultra-low');
    assert.equal(viewModel.aggregate.consentAvailableCandidates, 0);
    assert.equal(viewModel.featureAvailability, 'full-ui');
    assert.deepEqual(viewModel.visibleFeatureIds, AI_FEATURE_REGISTRY.map((feature) => feature.id));
    assert.match(viewModel.fallbackSummary, /deterministic fallback/i);
    assert.equal(viewModel.modelActive, false);
  });

  it('keeps an i3 4 GB HDD-like device light and blocks standard, pro, and 4B', async () => {
    const runtimeCapability = await probe({
      ram: 4,
      deviceKind: 'laptop',
      storageKind: 'hdd',
      webGpu: false,
      connection: 'wifi',
    });
    const viewModel = buildLocalModelAcquisitionConsentViewModel(runtimeCapability, { accessTier: 'pro' });

    assert.equal(viewModel.candidateDeviceTier, 'light');
    assert.equal(viewModel.aggregate.consentAvailableCandidates, 0);
    assert.ok(viewModel.preflightViewModel.candidates.find((candidate) => candidate.candidateTier === 'standard')?.blockers.includes('candidate-tier-not-allowed'));
    assert.ok(viewModel.preflightViewModel.candidates.find((candidate) => candidate.candidateTier === 'pro')?.blockers.includes('candidate-tier-not-allowed'));
    assert.equal(viewModel.canAttempt4B, false);
    assert.equal(viewModel.modelActive, false);
  });

  it('allows strong desktop classification as pro while production consent and 4B remain unavailable', async () => {
    const runtimeCapability = await probe({
      ram: 16,
      deviceKind: 'desktop',
      storageKind: 'ssd',
      webGpu: true,
      connection: 'wifi',
      battery: 80,
    });
    const viewModel = buildLocalModelAcquisitionConsentViewModel(runtimeCapability, { accessTier: 'lifetime' });

    assert.equal(viewModel.candidateDeviceTier, 'pro');
    assert.equal(viewModel.aggregate.consentAvailableCandidates, 0);
    assert.equal(viewModel.canAttempt4B, false);
    assert.equal(viewModel.modelActive, false);
    assert.ok(viewModel.candidates.every((candidate) => candidate.state === 'unavailable'));
  });

  it('rebuilds synthetic Phase 4.7 preflight after explicit confirm without starting actions', () => {
    const viewModel = buildLocalModelAcquisitionConsentDecisionViewModel({
      preflightInput: syntheticApprovedInput(),
      disclosure: syntheticDisclosure(),
      event: { type: 'confirm' },
    });

    assert.equal(viewModel.session.state, 'confirmed');
    assert.equal(viewModel.finalPreflight.status, 'preflight-passed');
    assert.equal(viewModel.finalPreflight.canPlanFutureAcquisition, true);
    assert.equal(viewModel.downloadAuthorizedForExecution, false);
    assert.equal(viewModel.downloadStarted, false);
    assert.equal(viewModel.cacheWritten, false);
    assert.equal(viewModel.runtimeInitialized, false);
    assert.equal(viewModel.modelReady, false);
    assert.equal(viewModel.modelActive, false);
  });

  it('rebuilds synthetic Phase 4.7 preflight as blocked after explicit decline', () => {
    const viewModel = buildLocalModelAcquisitionConsentDecisionViewModel({
      preflightInput: syntheticApprovedInput(),
      disclosure: syntheticDisclosure(),
      event: { type: 'decline' },
    });

    assert.equal(viewModel.session.state, 'declined');
    assert.equal(viewModel.finalPreflight.status, 'blocked');
    assert.ok(viewModel.finalPreflight.blockers.includes('user-confirmation-declined'));
    assert.equal(viewModel.downloadStarted, false);
    assert.equal(viewModel.modelActive, false);
  });

  it('adds a Phase 4.8 card while preserving all Phase 4.1 through 4.7 cards', () => {
    const shell = read('../../src/components/ai/LocalAIReadinessShell.tsx');

    assert.match(shell, /Phase 4 runtime ADR/);
    assert.match(shell, /Phase 4\.2 approval review/);
    assert.match(shell, /Phase 4\.3 benchmark plan/);
    assert.match(shell, /Phase 4\.4 device tier gate/);
    assert.match(shell, /Phase 4\.5 artifact and cache policy/);
    assert.match(shell, /Phase 4\.6 runtime capability probe/);
    assert.match(shell, /Phase 4\.7 local model acquisition preflight/);
    assert.match(shell, /Phase 4\.8 explicit acquisition consent/);
    assert.match(shell, /Explicit Local Model Acquisition Consent/);
    assert.match(shell, /Consent is candidate-specific/);
    assert.match(shell, /Consent unavailable until all prerequisites pass/);
    assert.match(shell, /No consent recorded/);
    assert.match(shell, /No download started/);
    assert.match(shell, /No model active/);
    assert.match(shell, /consentAvailableCandidates/);
  });

  it('renders consent controls only behind policy booleans and keeps handlers in React memory', () => {
    const shell = read('../../src/components/ai/LocalAIReadinessShell.tsx');

    assert.match(shell, /candidate\.canConfirm\s*\?/);
    assert.match(shell, /candidate\.canDecline\s*\?/);
    assert.match(shell, /setAcquisitionConsentSessions/);
    assert.doesNotMatch(shell, /handleDownload|handleInstall|handleActivate|onClick=.*(?:download|install|activate)/i);
    assert.doesNotMatch(shell, /localStorage|sessionStorage|useEffect\([^)]*consent/i);
  });

  it('preserves the existing tier matrix and duplicates no hardware classification thresholds', () => {
    assert.deepEqual(
      LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) => [candidate.tier, candidate.parameterScaleLabel]),
      [
        ['light', '0.6B'],
        ['standard', '1.7B'],
        ['pro', '4B'],
      ],
    );
    assert.deepEqual(
      LOCAL_MODEL_ARTIFACT_MANIFEST.map((artifact) => [artifact.modelTier, artifact.parameterScaleLabel]),
      [
        ['light', '0.6B'],
        ['standard', '1.7B'],
        ['pro', '4B'],
      ],
    );

    const phase48Policy = [
      read('../../src/platform/ai/localModelAcquisitionConsentPolicy.ts'),
      read('../../src/platform/ai/localModelAcquisitionConsentViewModel.ts'),
    ].join('\n');
    assert.doesNotMatch(phase48Policy, /approxRamGb|deviceMemory|minimumRam|maximumRam|ramThreshold/i);
  });

  it('keeps all Phase 4.8 runtime source free of network, persistence, workers, runtime, and AI execution', () => {
    const paths = [
      '../../src/platform/ai/localModelAcquisitionConsentTypes.ts',
      '../../src/platform/ai/localModelAcquisitionConsentPolicy.ts',
      '../../src/platform/ai/localModelAcquisitionConsentViewModel.ts',
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
    assert.doesNotMatch(source, /supabase|database|auditLog/i);
    assert.doesNotMatch(source, /preferredLocalAiTier/);
    assert.doesNotMatch(source, /learnerMemory/i);
  });

  it('registers both Phase 4.8 tests in test and test:platform scripts', () => {
    const packageJson = JSON.parse(read('../../package.json')) as { scripts: Record<string, string> };

    for (const scriptName of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[scriptName], /test\/platform\/localModelAcquisitionConsentPolicy\.test\.ts/);
      assert.match(packageJson.scripts[scriptName], /test\/platform\/localModelAcquisitionConsentViewModel\.test\.ts/);
    }
  });

  it('documents the Phase 4.8 boundary, scope invalidation, and current production state', () => {
    const doc = read('../../docs/ai/phase-4-local-model-acquisition-consent.md');

    for (const heading of [
      'Status',
      'Purpose',
      'Relationship to Phase 4.7',
      'Consent versus preflight',
      'Explicit user decision',
      'Candidate-specific scope',
      'Required disclosure',
      'Scope invalidation',
      'Consent state transitions',
      'Mapping back to preflight',
      'Current production state',
      'Tier-matrix compatibility',
      'Privacy and persistence',
      'Failure handling',
      'Safety invariants',
      'Non-goals',
    ]) {
      assert.match(doc, new RegExp(`## ${heading}`, 'i'), heading);
    }

    assert.match(doc, /consent policy only/i);
    assert.match(doc, /explicit and candidate-specific/i);
    assert.match(doc, /in-memory only/i);
    assert.match(doc, /scope change invalidates consent/i);
    assert.match(doc, /three current production candidates.*cannot request consent/i);
    assert.match(doc, /artifact size remains unknown/i);
    assert.match(doc, /synthetic.*test-only/i);
    assert.match(doc, /confirmation.*input.*Phase 4\.7/i);
    assert.match(doc, /preflight-passed.*does not mean.*model ready/i);
  });

  it('keeps the existing AI safety regression scan clean', () => {
    const result = scanAISafetyRegression({ root: process.cwd() });

    assert.ok(result.files.some((path) => path.endsWith('localModelAcquisitionConsentPolicy.ts')));
    assert.ok(result.files.some((path) => path.endsWith('localModelAcquisitionConsentViewModel.ts')));
    assert.deepEqual(result.violations, []);
  });
});
