import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import { AI_FEATURE_REGISTRY } from '../../src/platform/ai/aiFeatureRegistry.ts';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from '../../src/platform/ai/localModelArtifactManifest.ts';
import {
  buildLocalModelAcquisitionExecutionViewModel,
  buildLocalModelAcquisitionExecutionResultViewModel,
} from '../../src/platform/ai/localModelAcquisitionExecutionViewModel.ts';
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
  executeLocalModelAcquisitionHandoff,
} from '../../src/platform/ai/localModelAcquisitionExecutorBoundary.ts';
import type { LocalModelAcquisitionExecutor } from '../../src/platform/ai/localModelAcquisitionExecutionTypes.ts';
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
    trustedThermalStatusHint: 'normal',
  });
}

function syntheticCachePolicy() {
  return {
    cacheBudget: {
      tier: 'light' as const,
      minimumModelCacheMb: 500,
      maximumModelCacheMb: 1024,
      automaticEnable: false as const,
      budgetStatus: 'bounded-candidate-budget' as const,
    },
    canPlanFutureDownloadAttempt: true,
    requiresUserConfirmation: false,
    userDeletionRequired: true as const,
    coreAppFallback: 'unaffected' as const,
    corruptedCacheRecovery: 'delete-and-redownload-after-approval' as const,
    warnings: [] as const,
    reasons: [] as const,
    userFacingSummary: 'Synthetic policy-only fixture.',
  };
}

function syntheticAuthorizationFixture() {
  const preflightInput: LocalModelAcquisitionPreflightInput = {
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
    cachePolicyResult: syntheticCachePolicy(),
    featureAvailability: 'full-ui',
  };
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
  const finalPreflight = rebuildLocalModelAcquisitionPreflightWithConsent(preflightInput, consent, consentInput);
  const authorizationInput = {
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
  const authorized = applyLocalModelAcquisitionAuthorizationEvent(
    createLocalModelAcquisitionAuthorizationSession(authorizationInput),
    { type: 'request-authorization' },
    authorizationInput,
  );
  return { authorizationInput, authorized };
}

describe('Phase 4.10 local model acquisition execution view model', () => {
  it('summarizes current production as three blocked candidates with no requests or execution', async () => {
    const runtimeCapability = await probe({
      ram: 16,
      deviceKind: 'desktop',
      storageKind: 'ssd',
      webGpu: true,
      connection: 'wifi',
      battery: 80,
    });
    const viewModel = buildLocalModelAcquisitionExecutionViewModel(runtimeCapability, { accessTier: 'pro' });

    assert.equal(viewModel.candidates.length, 3);
    assert.deepEqual(viewModel.aggregate, {
      totalCandidates: 3,
      executionEligibleCandidates: 0,
      requestsBuilt: 0,
      executorInvocations: 0,
      acceptedHandoffs: 0,
      rejectedHandoffs: 0,
      unavailableExecutors: 3,
      consumedAuthorizations: 0,
      downloadStartedCandidates: 0,
      activeModels: 0,
    });
    assert.ok(viewModel.candidates.every((candidate) => candidate.requestBuilt === false));
    assert.ok(viewModel.candidates.every((candidate) => candidate.executorInvoked === false));
  });

  it('uses honest boundary-only production copy without model readiness or download claims', async () => {
    const runtimeCapability = await probe({
      ram: 16,
      deviceKind: 'desktop',
      storageKind: 'ssd',
      webGpu: true,
      connection: 'wifi',
    });
    const viewModel = buildLocalModelAcquisitionExecutionViewModel(runtimeCapability);
    const serialized = JSON.stringify(viewModel);

    assert.equal(viewModel.heading, 'Local Model Acquisition Executor Boundary');
    assert.equal(viewModel.boundarySummary, 'Boundary only');
    assert.equal(viewModel.executorSummary, 'Production executor unavailable');
    assert.equal(viewModel.authorizationSummary, 'Authorization required before handoff');
    assert.equal(viewModel.requestSummary, 'No execution request created');
    assert.equal(viewModel.handoffSummary, 'No executor handoff accepted');
    assert.equal(viewModel.downloadSummary, 'No download started');
    assert.equal(viewModel.cacheSummary, 'No cache written');
    assert.equal(viewModel.modelSummary, 'No model active');
    assert.match(viewModel.coreAppSummary, /Core app remains available/);
    assert.match(viewModel.fallbackSummary, /Deterministic fallback remains available/);
    assert.doesNotMatch(serialized, /ready to download|downloading|download completed|model installed|runtime ready|model ready|4B active|recommended model|AI-generated recommendation/i);
  });

  it('preserves Oppo, i3, and strong-desktop classifications while production requests remain zero', async () => {
    const oppo = buildLocalModelAcquisitionExecutionViewModel(await probe({
      ram: 2,
      deviceKind: 'mobile',
      storageKind: 'flash',
      webGpu: false,
      android: true,
    }), { accessTier: 'pro' });
    assert.equal(oppo.candidateDeviceTier, 'ultra-low');
    assert.equal(oppo.aggregate.executionEligibleCandidates, 0);
    assert.equal(oppo.aggregate.requestsBuilt, 0);
    assert.equal(oppo.featureAvailability, 'full-ui');
    assert.deepEqual(oppo.visibleFeatureIds, AI_FEATURE_REGISTRY.map((feature) => feature.id));

    const i3 = buildLocalModelAcquisitionExecutionViewModel(await probe({
      ram: 4,
      deviceKind: 'laptop',
      storageKind: 'hdd',
      webGpu: false,
      connection: 'wifi',
    }), { accessTier: 'pro' });
    assert.equal(i3.candidateDeviceTier, 'light');
    assert.equal(i3.aggregate.requestsBuilt, 0);
    assert.equal(i3.authorizationViewModel.canAttempt4B, false);

    const strong = buildLocalModelAcquisitionExecutionViewModel(await probe({
      ram: 16,
      deviceKind: 'desktop',
      storageKind: 'ssd',
      webGpu: true,
      connection: 'wifi',
      battery: 80,
    }), { accessTier: 'lifetime' });
    assert.equal(strong.candidateDeviceTier, 'pro');
    assert.equal(strong.aggregate.executorInvocations, 0);
    assert.equal(strong.authorizationViewModel.canAttempt4B, false);
    assert.equal(strong.modelActive, false);
  });

  it('represents synthetic unavailable and accepted boundary results without claiming download', async () => {
    const { authorizationInput, authorized } = syntheticAuthorizationFixture();
    const unavailableExecutor: LocalModelAcquisitionExecutor = {
      availability: 'unavailable',
      async acceptHandoff() {
        return {
          outcome: 'executor-unavailable',
          requestAccepted: false,
          executorAvailable: false,
          reasons: ['executor-unavailable'],
          warnings: [],
        };
      },
    };
    const acceptingExecutor: LocalModelAcquisitionExecutor = {
      availability: 'available',
      async acceptHandoff() {
        return {
          outcome: 'handoff-accepted',
          requestAccepted: true,
          executorAvailable: true,
          reasons: ['executor-accepted-contract-handoff'],
          warnings: [],
        };
      },
    };

    const unavailable = await executeLocalModelAcquisitionHandoff(
      { authorizationSession: authorized, currentAuthorizationInput: authorizationInput },
      unavailableExecutor,
    );
    const accepted = await executeLocalModelAcquisitionHandoff(
      { authorizationSession: authorized, currentAuthorizationInput: authorizationInput },
      acceptingExecutor,
    );
    const unavailableVm = buildLocalModelAcquisitionExecutionResultViewModel(unavailable);
    const acceptedVm = buildLocalModelAcquisitionExecutionResultViewModel(accepted);

    assert.equal(unavailableVm.outcome, 'executor-unavailable');
    assert.equal(unavailableVm.authorizationConsumed, false);
    assert.equal(acceptedVm.outcome, 'handoff-accepted');
    assert.equal(acceptedVm.authorizationConsumed, true);
    assert.equal(acceptedVm.downloadStarted, false);
    assert.equal(acceptedVm.downloadCompleted, false);
    assert.equal(acceptedVm.modelActive, false);
    assert.doesNotMatch(acceptedVm.summary, /download started|download completed|success/i);
  });

  it('adds the Phase 4.10 card while preserving Phase 4.1 through 4.9', () => {
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
      'Phase 4.10 local model acquisition executor boundary',
    ]) assert.match(shell, new RegExp(marker.replace('.', '\\.')));

    assert.match(shell, /Local Model Acquisition Executor Boundary/);
    assert.match(shell, /Boundary only/);
    assert.match(shell, /Production executor unavailable/);
    assert.match(shell, /No execution request created/);
    assert.match(shell, /No executor handoff accepted/);
    assert.match(shell, /No download started/);
    assert.match(shell, /No model active/);
    assert.match(shell, /executionEligibleCandidates/);
    assert.doesNotMatch(shell, /handleDownload|handleInstall|handleActivate|handleExecutorHandoff|onClick=.*(?:download|install|activate|handoff)/i);
  });

  it('preserves tier matrix and duplicates no hardware thresholds in Phase 4.10', () => {
    assert.deepEqual(
      LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) => [candidate.tier, candidate.parameterScaleLabel]),
      [['light', '0.6B'], ['standard', '1.7B'], ['pro', '4B']],
    );
    assert.deepEqual(
      LOCAL_MODEL_ARTIFACT_MANIFEST.map((artifact) => [artifact.modelTier, artifact.parameterScaleLabel]),
      [['light', '0.6B'], ['standard', '1.7B'], ['pro', '4B']],
    );
    const source = [
      read('../../src/platform/ai/localModelAcquisitionExecutionTypes.ts'),
      read('../../src/platform/ai/localModelAcquisitionExecutorBoundary.ts'),
      read('../../src/platform/ai/localModelAcquisitionExecutionViewModel.ts'),
    ].join('\n');
    assert.doesNotMatch(source, /approxRamGb|deviceMemory|minimumRam|maximumRam|ramThreshold/i);
  });

  it('keeps Phase 4.10 source free of network, persistence, execution, random IDs, and fake progress', () => {
    const source = [
      read('../../src/platform/ai/localModelAcquisitionExecutionTypes.ts'),
      read('../../src/platform/ai/localModelAcquisitionExecutorBoundary.ts'),
      read('../../src/platform/ai/localModelAcquisitionExecutionViewModel.ts'),
      read('../../src/components/ai/LocalAIReadinessShell.tsx'),
    ].join('\n');
    const forbidden = [
      /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /indexedDB/, /CacheStorage/, /caches\.open/,
      /localStorage/, /sessionStorage/, /requestAdapter\s*\(/, /requestDevice\s*\(/,
      /AIService/, /\.execute\s*\(/, /Math\.random/, /Date\.now/, /setTimeout/,
      /\bWorker\s*\(/, /SharedWorker\s*\(/, /importScripts\s*\(/, /createObjectURL\s*\(/,
      /serviceWorker\.register/, /http:\/\//, /https:\/\//,
      /randomRequest|requestToken|timestampRequest|downloadBytes|downloadSpeed|downloadEta/i,
    ];
    for (const pattern of forbidden) assert.doesNotMatch(source, pattern);
    assert.doesNotMatch(source, /writeFileSync|appendFileSync|supabase|databaseCall|persistExecution/i);
  });

  it('registers tests, documents the boundary, and keeps AI safety clean', () => {
    const packageJson = JSON.parse(read('../../package.json')) as { scripts: Record<string, string> };
    for (const scriptName of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[scriptName], /test\/platform\/localModelAcquisitionExecutorBoundary\.test\.ts/);
      assert.match(packageJson.scripts[scriptName], /test\/platform\/localModelAcquisitionExecutionViewModel\.test\.ts/);
    }

    const doc = read('../../docs/ai/phase-4-local-model-acquisition-executor-boundary.md');
    for (const heading of [
      'Status', 'Purpose', 'Relationship to Phase 4.7', 'Relationship to Phase 4.8',
      'Relationship to Phase 4.9', 'Authorization versus executor handoff',
      'Execution request contract', 'Executor port', 'Unavailable-safe production executor',
      'Handoff acceptance', 'Authorization consumption', 'Failure and rejection handling',
      'Current production state', 'Tier-matrix compatibility', 'Privacy and persistence',
      'Safety invariants', 'Non-goals',
    ]) assert.match(doc, new RegExp(`## ${heading}`));
    assert.match(doc, /executor boundary only/i);
    assert.match(doc, /production executor is unavailable/i);
    assert.match(doc, /handoff accepted does not mean.*download started/i);
    assert.match(doc, /authorization consumed does not mean.*download completed/i);

    const scan = scanAISafetyRegression({ root: new URL('../..', import.meta.url).pathname });
    assert.deepEqual(scan.violations, []);
  });
});
