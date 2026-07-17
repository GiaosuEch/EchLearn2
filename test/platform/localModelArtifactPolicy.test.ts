import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import {
  LOCAL_MODEL_ARTIFACT_MANIFEST,
} from '../../src/platform/ai/localModelArtifactManifest.ts';
import {
  LOCAL_MODEL_CACHE_BUDGETS,
  LOCAL_MODEL_CACHE_CONTROL_ACTIONS,
  evaluateLocalModelCachePolicy,
} from '../../src/platform/ai/localModelCachePolicy.ts';
import { buildLocalModelArtifactViewModel } from '../../src/platform/ai/localModelArtifactViewModel.ts';
import { LOCAL_AI_READINESS_CHECKLIST } from '../../src/platform/ai/localAiReadinessChecklist.ts';

const require = createRequire(import.meta.url);
const { scanAISafetyRegression } = require('../../scripts/verify_ai_safety_regression.cjs') as {
  scanAISafetyRegression(options: { root: string }): {
    files: string[];
    violations: Array<{ path: string; ruleId: string; message: string }>;
  };
};

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

const safePolicyInput = {
  deviceTier: 'standard' as const,
  deviceGateAllowsModelAttempt: true,
  artifactApproved: true,
  benchmarkApproved: true,
  userConfirmedDownload: true,
  connectionKind: 'wifi' as const,
  batteryLevelPercent: 80,
  thermalStatus: 'normal' as const,
  webGpuStatus: 'supported' as const,
  storageQuotaStatus: 'sufficient' as const,
};

const FORBIDDEN_ARTIFACT_FIELDS = [
  'downloadUrl',
  'artifactUrl',
  'cdnUrl',
  'checksum',
  'filePath',
  'modelBinary',
  'tokenizerArtifact',
] as const;

const PROTECTED_PREFIXES = [
  '.env',
  'secrets/',
  '.agents/',
  'docs/superpowers/',
  'public/audio/',
  'public/data/',
  'src/curriculum/',
  'supabase/migrations/',
] as const;

describe('Phase 4.5 local model artifact manifest and cache policy', () => {
  it('contains exactly the three artifact candidates', () => {
    assert.deepEqual(
      LOCAL_MODEL_ARTIFACT_MANIFEST.map((artifact) => artifact.artifactId),
      [
        'qwen3-0-6b-light-artifact-candidate',
        'qwen3-1-7b-standard-artifact-candidate',
        'qwen3-4b-pro-artifact-candidate',
      ],
    );
  });

  it('keeps every artifact unavailable for download, cache, and runtime', () => {
    for (const artifact of LOCAL_MODEL_ARTIFACT_MANIFEST) {
      assert.equal(artifact.downloadable, false);
      assert.equal(artifact.cacheable, false);
      assert.equal(artifact.runtimeReady, false);
      assert.equal(artifact.licenseApprovalRequired, true);
      assert.equal(artifact.artifactApprovalRequired, true);
      assert.equal(artifact.benchmarkApprovalRequired, true);
      assert.equal(artifact.checksumRequired, true);
      assert.equal(artifact.downloadUrlStatus, 'absent');
      assert.ok(['missing', 'planned'].includes(artifact.checksumStatus));
      assert.notEqual(artifact.checksumStatus, 'verified');
    }
  });

  it('contains no download location, checksum value, file path, or runtime artifact configuration', () => {
    for (const artifact of LOCAL_MODEL_ARTIFACT_MANIFEST) {
      for (const forbidden of FORBIDDEN_ARTIFACT_FIELDS) {
        assert.equal(Object.hasOwn(artifact, forbidden), false, `${artifact.artifactId}:${forbidden}`);
      }
    }

    const serialized = JSON.stringify(LOCAL_MODEL_ARTIFACT_MANIFEST);
    assert.doesNotMatch(serialized, /https?:\/\//i);
    assert.doesNotMatch(serialized, /(?:download|artifact|cdn)Url\s*:/i);
    assert.doesNotMatch(serialized, /sha(?:256|512)|[a-f0-9]{64}/i);
  });

  it('defines conservative cache budgets for all device tiers', () => {
    assert.deepEqual(LOCAL_MODEL_CACHE_BUDGETS['ultra-low'], {
      tier: 'ultra-low',
      minimumModelCacheMb: 0,
      maximumModelCacheMb: 0,
      automaticEnable: false,
      budgetStatus: 'fixed-zero',
    });
    assert.equal(LOCAL_MODEL_CACHE_BUDGETS.light.minimumModelCacheMb, 500);
    assert.equal(LOCAL_MODEL_CACHE_BUDGETS.light.maximumModelCacheMb, 1024);
    assert.equal(LOCAL_MODEL_CACHE_BUDGETS.standard.minimumModelCacheMb, 1024);
    assert.equal(LOCAL_MODEL_CACHE_BUDGETS.standard.maximumModelCacheMb, 2048);
    assert.equal(LOCAL_MODEL_CACHE_BUDGETS.pro.maximumModelCacheMb, null);
    assert.equal(LOCAL_MODEL_CACHE_BUDGETS.pro.automaticEnable, false);
    assert.equal(LOCAL_MODEL_CACHE_BUDGETS.pro.budgetStatus, 'requires-artifact-and-benchmark-review');
  });

  it('blocks future model download planning for ultra-low devices', () => {
    const result = evaluateLocalModelCachePolicy({
      ...safePolicyInput,
      deviceTier: 'ultra-low',
    });

    assert.equal(result.canPlanFutureDownloadAttempt, false);
    assert.equal(result.cacheBudget.maximumModelCacheMb, 0);
    assert.match(result.warnings.join(' '), /ultra-low|zero/i);
  });

  it('blocks future download planning over cellular connections', () => {
    const result = evaluateLocalModelCachePolicy({
      ...safePolicyInput,
      connectionKind: 'cellular',
    });

    assert.equal(result.canPlanFutureDownloadAttempt, false);
    assert.match(result.warnings.join(' '), /cellular/i);
  });

  it('blocks future download planning below 15 percent battery', () => {
    const result = evaluateLocalModelCachePolicy({
      ...safePolicyInput,
      batteryLevelPercent: 14,
    });

    assert.equal(result.canPlanFutureDownloadAttempt, false);
    assert.match(result.warnings.join(' '), /battery/i);
  });

  it('blocks future download planning while thermal status is hot', () => {
    const result = evaluateLocalModelCachePolicy({
      ...safePolicyInput,
      thermalStatus: 'hot',
    });

    assert.equal(result.canPlanFutureDownloadAttempt, false);
    assert.match(result.warnings.join(' '), /thermal|hot/i);
  });

  it('blocks browser-local artifact planning when WebGPU is unsupported', () => {
    const result = evaluateLocalModelCachePolicy({
      ...safePolicyInput,
      webGpuStatus: 'unsupported',
    });

    assert.equal(result.canPlanFutureDownloadAttempt, false);
    assert.match(result.warnings.join(' '), /WebGPU/i);
  });

  it('requires confirmation when storage quota is unknown and never bypasses upstream gates', () => {
    const unknownStorage = evaluateLocalModelCachePolicy({
      ...safePolicyInput,
      storageQuotaStatus: 'unknown',
    });
    assert.equal(unknownStorage.canPlanFutureDownloadAttempt, false);
    assert.equal(unknownStorage.requiresUserConfirmation, true);
    assert.match(unknownStorage.warnings.join(' '), /storage|quota/i);

    const blockedByApproval = evaluateLocalModelCachePolicy({
      ...safePolicyInput,
      artifactApproved: false,
    });
    assert.equal(blockedByApproval.canPlanFutureDownloadAttempt, false);
    assert.match(blockedByApproval.reasons.join(' '), /artifact approval/i);

    const blockedByDeviceGate = evaluateLocalModelCachePolicy({
      ...safePolicyInput,
      deviceGateAllowsModelAttempt: false,
    });
    assert.equal(blockedByDeviceGate.canPlanFutureDownloadAttempt, false);
    assert.match(blockedByDeviceGate.reasons.join(' '), /device tier gate/i);
  });

  it('requires benchmark approval and explicit user confirmation before future planning', () => {
    const benchmarkBlocked = evaluateLocalModelCachePolicy({
      ...safePolicyInput,
      benchmarkApproved: false,
    });
    assert.equal(benchmarkBlocked.canPlanFutureDownloadAttempt, false);
    assert.match(benchmarkBlocked.reasons.join(' '), /benchmark approval/i);

    const confirmationBlocked = evaluateLocalModelCachePolicy({
      ...safePolicyInput,
      userConfirmedDownload: false,
    });
    assert.equal(confirmationBlocked.canPlanFutureDownloadAttempt, false);
    assert.equal(confirmationBlocked.requiresUserConfirmation, true);
    assert.match(confirmationBlocked.reasons.join(' '), /user confirmation/i);

    const allGatesRepresented = evaluateLocalModelCachePolicy(safePolicyInput);
    assert.equal(allGatesRepresented.canPlanFutureDownloadAttempt, true);
    assert.match(allGatesRepresented.userFacingSummary, /does not activate a model|does not.*download/i);
  });

  it('requires user-controlled deletion and keeps the core app available after cache failure', () => {
    const result = evaluateLocalModelCachePolicy(safePolicyInput);
    assert.equal(result.userDeletionRequired, true);
    assert.equal(result.coreAppFallback, 'unaffected');
    assert.equal(result.corruptedCacheRecovery, 'delete-and-redownload-after-approval');
    assert.match(result.userFacingSummary, /core app remains available|does not activate a model/i);

    assert.deepEqual(
      LOCAL_MODEL_CACHE_CONTROL_ACTIONS.map((action) => action.plannedAction),
      [
        'estimate-storage',
        'verify-checksum',
        'delete-artifact-cache',
        'recover-corrupted-cache',
      ],
    );
    assert.ok(LOCAL_MODEL_CACHE_CONTROL_ACTIONS.every((action) => action.status === 'not-implemented'));
  });

  it('summarizes three unavailable artifacts without readiness claims', () => {
    const viewModel = buildLocalModelArtifactViewModel();
    assert.equal(viewModel.summary.totalArtifacts, 3);
    assert.equal(viewModel.summary.downloadableArtifacts, 0);
    assert.equal(viewModel.summary.cacheableArtifacts, 0);
    assert.equal(viewModel.summary.runtimeReadyArtifacts, 0);
    assert.equal(viewModel.summary.userDeletionRequired, true);
    assert.match(viewModel.currentState, /no artifact.*approved|not downloadable/i);
    assert.match(viewModel.recoverySummary, /delete|recover/i);
    assert.doesNotMatch(
      JSON.stringify(viewModel),
      /artifact is ready|model is ready|download complete|cache verified|benchmark passed|generated recommendation/i,
    );
  });

  it('keeps Local AI Readiness explicit about no approved model, artifact, or runtime', () => {
    const approvedModel = LOCAL_AI_READINESS_CHECKLIST.find((item) => item.id === 'approved-local-model');
    const runtimeIntegration = LOCAL_AI_READINESS_CHECKLIST.find((item) => item.id === 'runtime-integration');
    assert.equal(approvedModel?.status, 'pending-phase-4');
    assert.match(approvedModel?.description ?? '', /No approved local model/i);
    assert.equal(runtimeIntegration?.status, 'pending-phase-4');
    assert.match(runtimeIntegration?.description ?? '', /not connected/i);
  });

  it('integrates a small honest artifact/cache card and registers the test', () => {
    const shell = read('../../src/components/ai/LocalAIReadinessShell.tsx');
    const packageJson = read('../../package.json');

    assert.match(shell, /buildLocalModelArtifactViewModel/);
    assert.match(shell, /Phase 4\.5 artifact and cache policy/);
    assert.match(shell, /artifactPolicy\.summary\.downloadableArtifacts/);
    assert.match(shell, /artifactPolicy\.summary\.cacheableArtifacts/);
    assert.match(shell, /artifactPolicy\.summary\.userDeletionRequired/);
    assert.doesNotMatch(shell, /indexedDB|caches\.|navigator\.storage|AIService|\.execute\(/);
    assert.match(packageJson, /test\/platform\/localModelArtifactPolicy\.test\.ts/);
  });

  it('does not access browser storage, cache, network, or AI runtime APIs', () => {
    const sources = [
      read('../../src/platform/ai/localModelArtifactTypes.ts'),
      read('../../src/platform/ai/localModelArtifactManifest.ts'),
      read('../../src/platform/ai/localModelCachePolicy.ts'),
      read('../../src/platform/ai/localModelArtifactViewModel.ts'),
    ].join('\n');

    assert.doesNotMatch(sources, /indexedDB|caches\.|CacheStorage|navigator\.storage|storage\.estimate/i);
    assert.doesNotMatch(sources, /fetch\s*\(|XMLHttpRequest|WebSocket|AIService|\.execute\(/);
    assert.doesNotMatch(sources, /Math\.random|Date\.now|setTimeout|navigator\.gpu/);
    assert.doesNotMatch(sources, /https?:\/\/|modelUrl\s*:|artifactUrl\s*:|cdnUrl\s*:/i);
  });

  it('documents metadata-only policy and keeps safety scanning outside protected paths', () => {
    const doc = read('../../docs/ai/phase-4-model-artifact-cache-policy.md');
    for (const heading of [
      'Status',
      'Artifact candidates',
      'Cache budgets',
      'Future action gates',
      'User deletion and recovery',
      'Integrity contract',
      'Non-goals',
    ]) {
      assert.match(doc, new RegExp(`## ${heading}`, 'i'), heading);
    }
    assert.doesNotMatch(doc, /https?:\/\/|download URL\s*:|artifact URL\s*:|checksum\s*:\s*[a-f0-9]{32,}/i);

    const result = scanAISafetyRegression({ root: process.cwd() });
    assert.ok(result.files.some((path) => path.endsWith('localModelArtifactManifest.ts')));
    assert.ok(result.files.some((path) => path.endsWith('localModelCachePolicy.ts')));
    assert.ok(result.files.some((path) => path.endsWith('localModelArtifactViewModel.ts')));
    assert.deepEqual(result.violations, []);
    for (const file of result.files) {
      assert.equal(PROTECTED_PREFIXES.some((prefix) => file.startsWith(prefix)), false, file);
    }
  });
});
