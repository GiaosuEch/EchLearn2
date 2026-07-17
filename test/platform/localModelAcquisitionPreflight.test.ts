import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from '../../src/platform/ai/localModelArtifactManifest.ts';
import {
  buildCurrentLocalModelAcquisitionPreflight,
  deriveLocalModelStorageQuotaStatus,
  evaluateLocalModelAcquisitionPreflight,
} from '../../src/platform/ai/localModelAcquisitionPreflight.ts';
import type {
  LocalModelAcquisitionPreflightInput,
  LocalModelAcquisitionConfirmationStatus,
} from '../../src/platform/ai/localModelAcquisitionTypes.ts';
import { probeLocalRuntimeCapabilities } from '../../src/platform/ai/localRuntimeCapabilityProbe.ts';

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

function syntheticApprovedInput(
  confirmationStatus: LocalModelAcquisitionConfirmationStatus = 'confirmed',
): LocalModelAcquisitionPreflightInput {
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
    confirmationStatus,
    cachePolicyResult: syntheticCachePolicy(confirmationStatus === 'confirmed'),
    featureAvailability: 'full-ui',
  };
}

async function strongRuntimeCapability() {
  return probeLocalRuntimeCapabilities({
    hasWindow: true,
    secureContext: true,
    navigator: {
      deviceMemory: 16,
      gpu: {},
      connection: { type: 'wifi' },
      getBattery: async () => ({ level: 0.8, charging: true }),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/150.0 Safari/537.36',
      platform: 'Win32',
    },
    trustedDeviceKindHint: 'desktop',
    trustedStorageKindHint: 'ssd',
    trustedThermalStatusHint: 'normal',
  });
}

describe('Phase 4.7 local model acquisition preflight', () => {
  it('blocks missing selection and unknown candidates safely', () => {
    const missing = evaluateLocalModelAcquisitionPreflight({
      ...syntheticApprovedInput(),
      candidateId: null,
      candidateTier: null,
      candidateSelected: false,
      candidateExists: false,
      artifactExists: false,
    });
    const unknown = evaluateLocalModelAcquisitionPreflight({
      ...syntheticApprovedInput(),
      candidateId: 'unknown-candidate',
      candidateExists: false,
      artifactExists: false,
    });

    assert.equal(missing.status, 'blocked');
    assert.ok(missing.blockers.includes('candidate-not-selected'));
    assert.equal(unknown.status, 'blocked');
    assert.ok(unknown.blockers.includes('candidate-not-found'));
  });

  it('blocks missing artifacts, candidate mismatches, and tier mismatches', () => {
    const missingArtifact = evaluateLocalModelAcquisitionPreflight({
      ...syntheticApprovedInput(),
      artifactExists: false,
      candidateArtifactMatches: false,
    });
    const idMismatch = evaluateLocalModelAcquisitionPreflight({
      ...syntheticApprovedInput(),
      candidateArtifactMatches: false,
    });
    const tierMismatch = evaluateLocalModelAcquisitionPreflight({
      ...syntheticApprovedInput(),
      candidateTierMatches: false,
    });

    assert.ok(missingArtifact.blockers.includes('artifact-not-found'));
    assert.ok(idMismatch.blockers.includes('candidate-artifact-mismatch'));
    assert.ok(tierMismatch.blockers.includes('candidate-tier-mismatch'));
  });

  it('blocks every governance and artifact prerequisite independently', () => {
    const cases: readonly [keyof LocalModelAcquisitionPreflightInput, string][] = [
      ['modelApproved', 'model-approval-pending'],
      ['licenseApproved', 'license-approval-pending'],
      ['artifactApproved', 'artifact-approval-pending'],
      ['artifactDownloadable', 'artifact-not-downloadable'],
      ['artifactCacheable', 'artifact-not-cacheable'],
      ['artifactRuntimeReady', 'artifact-runtime-not-ready'],
    ];

    for (const [field, blocker] of cases) {
      const input = { ...syntheticApprovedInput(), [field]: false } as LocalModelAcquisitionPreflightInput;
      const result = evaluateLocalModelAcquisitionPreflight(input);
      assert.equal(result.status, 'blocked', field);
      assert.ok(result.blockers.includes(blocker as never), field);
    }
  });

  it('blocks missing integrity and download-location metadata', () => {
    const checksum = evaluateLocalModelAcquisitionPreflight({
      ...syntheticApprovedInput(),
      checksumStatus: 'missing',
    });
    const location = evaluateLocalModelAcquisitionPreflight({
      ...syntheticApprovedInput(),
      downloadLocationStatus: 'absent',
    });

    assert.ok(checksum.blockers.includes('checksum-missing'));
    assert.ok(location.blockers.includes('download-location-absent'));
  });

  it('keeps not-run and failed benchmark evidence blocked', () => {
    for (const benchmarkStatus of ['not-run', 'failed'] as const) {
      const result = evaluateLocalModelAcquisitionPreflight({
        ...syntheticApprovedInput(),
        benchmarkStatus,
        cachePolicyResult: syntheticCachePolicy(false),
      });
      assert.equal(result.status, 'blocked');
      assert.ok(result.blockers.includes('benchmark-not-passed'));
    }
  });

  it('does not let Pro, Lifetime, or admin-granted access bypass benchmark', async () => {
    const runtimeCapability = await strongRuntimeCapability();

    for (const accessTier of ['pro', 'lifetime', 'admin-granted'] as const) {
      const result = buildCurrentLocalModelAcquisitionPreflight({
        candidateId: 'qwen3-4b-candidate',
        runtimeCapability,
        accessTier,
        benchmarkStatusByModelTier: { pro: 'not-run' },
        confirmationStatus: 'confirmed',
      });
      assert.equal(result.status, 'blocked', accessTier);
      assert.ok(result.blockers.includes('benchmark-not-passed'), accessTier);
      assert.equal(result.modelActive, false);
    }
  });

  it('requires the candidate tier in allowedModelTiers, not eligibleModelTiers alone', () => {
    const result = evaluateLocalModelAcquisitionPreflight({
      ...syntheticApprovedInput(),
      candidateTierEligible: true,
      candidateTierAllowed: false,
      deviceGateAllowsCandidate: false,
      cachePolicyResult: syntheticCachePolicy(false),
    });

    assert.equal(result.status, 'blocked');
    assert.ok(result.blockers.includes('candidate-tier-not-allowed'));
  });

  it('blocks ultra-low, unsupported WebGPU, and unchecked WebGPU', () => {
    const ultraLow = evaluateLocalModelAcquisitionPreflight({
      ...syntheticApprovedInput(),
      deviceTier: 'ultra-low',
      deviceGateAllowsCandidate: false,
      candidateTierEligible: false,
      candidateTierAllowed: false,
      cachePolicyResult: syntheticCachePolicy(false),
    });
    const unsupported = evaluateLocalModelAcquisitionPreflight({
      ...syntheticApprovedInput(),
      webGpuStatus: 'unsupported',
      deviceGateAllowsCandidate: false,
      cachePolicyResult: syntheticCachePolicy(false),
    });
    const unchecked = evaluateLocalModelAcquisitionPreflight({
      ...syntheticApprovedInput(),
      webGpuStatus: 'unchecked',
      deviceGateAllowsCandidate: false,
      cachePolicyResult: syntheticCachePolicy(false),
    });

    assert.ok(ultraLow.blockers.includes('device-tier-blocked'));
    assert.ok(unsupported.blockers.includes('webgpu-not-supported'));
    assert.ok(unchecked.blockers.includes('webgpu-not-supported'));
  });

  it('requires explicit Wi-Fi and blocks unsafe environmental metadata', () => {
    for (const connectionKind of ['cellular', 'offline', 'unknown'] as const) {
      const result = evaluateLocalModelAcquisitionPreflight({
        ...syntheticApprovedInput(),
        connectionKind,
        cachePolicyResult: syntheticCachePolicy(false),
      });
      assert.ok(result.blockers.includes('connection-not-wifi'), connectionKind);
    }

    for (const batteryLevelPercent of [14, Number.NaN, -1, 101]) {
      const result = evaluateLocalModelAcquisitionPreflight({
        ...syntheticApprovedInput(),
        batteryLevelPercent,
        cachePolicyResult: syntheticCachePolicy(false),
      });
      assert.ok(result.blockers.includes('battery-unsafe'), String(batteryLevelPercent));
    }

    const hot = evaluateLocalModelAcquisitionPreflight({
      ...syntheticApprovedInput(),
      thermalStatus: 'hot',
      cachePolicyResult: syntheticCachePolicy(false),
    });
    assert.ok(hot.blockers.includes('thermal-hot'));
  });

  it('derives storage status only from valid remaining space and required size', () => {
    assert.equal(deriveLocalModelStorageQuotaStatus(null, 500), 'unknown');
    assert.equal(deriveLocalModelStorageQuotaStatus(1000, null), 'unknown');
    assert.equal(deriveLocalModelStorageQuotaStatus(Number.NaN, 500), 'unknown');
    assert.equal(deriveLocalModelStorageQuotaStatus(1000, -1), 'unknown');
    assert.equal(deriveLocalModelStorageQuotaStatus(499, 500), 'insufficient');
    assert.equal(deriveLocalModelStorageQuotaStatus(500, 500), 'sufficient');
    assert.equal(deriveLocalModelStorageQuotaStatus(750, 500), 'sufficient');
  });

  it('blocks storage unknown and insufficient', () => {
    for (const storageQuotaStatus of ['unknown', 'insufficient'] as const) {
      const result = evaluateLocalModelAcquisitionPreflight({
        ...syntheticApprovedInput(),
        storageQuotaStatus,
        cachePolicyResult: syntheticCachePolicy(false),
      });
      assert.equal(result.status, 'blocked');
      assert.ok(result.blockers.includes(storageQuotaStatus === 'unknown' ? 'storage-unknown' : 'storage-insufficient'));
    }
  });

  it('never lets confirmation bypass prerequisite blockers', () => {
    const confirmed = evaluateLocalModelAcquisitionPreflight({
      ...syntheticApprovedInput('confirmed'),
      modelApproved: false,
      benchmarkStatus: 'not-run',
      storageQuotaStatus: 'unknown',
      cachePolicyResult: syntheticCachePolicy(false),
    });
    const declined = evaluateLocalModelAcquisitionPreflight({
      ...syntheticApprovedInput('declined'),
      cachePolicyResult: syntheticCachePolicy(false),
    });

    assert.equal(confirmed.status, 'blocked');
    assert.equal(confirmed.canOfferUserConfirmation, false);
    assert.equal(confirmed.canPlanFutureAcquisition, false);
    assert.ok(confirmed.blockers.includes('model-approval-pending'));
    assert.ok(confirmed.blockers.includes('benchmark-not-passed'));
    assert.ok(confirmed.blockers.includes('storage-unknown'));
    assert.equal(declined.status, 'blocked');
    assert.ok(declined.blockers.includes('user-confirmation-declined'));
  });

  it('returns awaiting-user-confirmation only after every prerequisite passes', () => {
    const result = evaluateLocalModelAcquisitionPreflight(syntheticApprovedInput('not-requested'));

    assert.equal(result.status, 'awaiting-user-confirmation');
    assert.equal(result.canOfferUserConfirmation, true);
    assert.equal(result.canPlanFutureAcquisition, false);
    assert.deepEqual(result.blockers, ['user-confirmation-not-requested']);
  });

  it('returns policy-only preflight-passed after explicit confirmation', () => {
    const result = evaluateLocalModelAcquisitionPreflight(syntheticApprovedInput('confirmed'));

    assert.equal(result.status, 'preflight-passed');
    assert.equal(result.canOfferUserConfirmation, true);
    assert.equal(result.canPlanFutureAcquisition, true);
    assert.equal(result.policyOnly, true);
    assert.equal(result.downloadStarted, false);
    assert.equal(result.cacheWritten, false);
    assert.equal(result.runtimeInitialized, false);
    assert.equal(result.modelReady, false);
    assert.equal(result.modelActive, false);
    assert.equal(result.generatedOutputProduced, false);
  });

  it('keeps blocker order deterministic, unique, and does not mutate input', () => {
    const input = Object.freeze({
      ...syntheticApprovedInput('declined'),
      candidateArtifactMatches: false,
      modelApproved: false,
      artifactDownloadable: false,
      benchmarkStatus: 'failed' as const,
      candidateTierAllowed: false,
      webGpuStatus: 'unsupported' as const,
      connectionKind: 'cellular' as const,
      batteryLevelPercent: 10,
      thermalStatus: 'hot' as const,
      storageQuotaStatus: 'unknown' as const,
      cachePolicyResult: syntheticCachePolicy(false),
    });
    const snapshot = structuredClone(input);
    const first = evaluateLocalModelAcquisitionPreflight(input);
    const second = evaluateLocalModelAcquisitionPreflight(input);

    assert.deepEqual(first.blockers, second.blockers);
    assert.equal(new Set(first.blockers).size, first.blockers.length);
    assert.deepEqual(input, snapshot);
    assert.deepEqual(first.blockers, [
      'candidate-artifact-mismatch',
      'model-approval-pending',
      'artifact-not-downloadable',
      'benchmark-not-passed',
      'candidate-tier-not-allowed',
      'webgpu-not-supported',
      'connection-not-wifi',
      'battery-unsafe',
      'thermal-hot',
      'storage-unknown',
      'user-confirmation-declined',
    ]);
  });

  it('preserves the current registry and manifest model-class matrix without rewriting candidates', () => {
    assert.deepEqual(
      LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) => ({
        tier: candidate.tier,
        parameterScaleLabel: candidate.parameterScaleLabel,
      })),
      [
        { tier: 'light', parameterScaleLabel: '0.6B' },
        { tier: 'standard', parameterScaleLabel: '1.7B' },
        { tier: 'pro', parameterScaleLabel: '4B' },
      ],
    );

    for (const candidate of LOCAL_MODEL_APPROVAL_REGISTRY) {
      const artifact = LOCAL_MODEL_ARTIFACT_MANIFEST.find(
        (item) => item.candidateId === candidate.candidateId,
      );
      assert.ok(artifact, candidate.candidateId);
      assert.equal(artifact.modelTier, candidate.tier);
      assert.equal(artifact.parameterScaleLabel, candidate.parameterScaleLabel);
    }
  });

  it('surfaces every current governance, artifact, benchmark, storage, and cache blocker', async () => {
    const runtimeCapability = await strongRuntimeCapability();
    const result = buildCurrentLocalModelAcquisitionPreflight({
      candidateId: 'qwen3-0-6b-candidate',
      runtimeCapability,
      accessTier: 'pro',
      confirmationStatus: 'confirmed',
    });

    for (const blocker of [
      'model-approval-pending',
      'license-approval-pending',
      'artifact-approval-pending',
      'artifact-not-downloadable',
      'artifact-not-cacheable',
      'artifact-runtime-not-ready',
      'checksum-missing',
      'download-location-absent',
      'benchmark-not-passed',
      'storage-unknown',
    ] as const) {
      assert.ok(result.blockers.includes(blocker), blocker);
    }
    assert.equal(result.cachePolicy.canPlanFutureDownloadAttempt, false);
    assert.equal(result.cachePolicy.userDeletionRequired, true);
  });

  it('keeps all three current production candidates blocked', async () => {
    const runtimeCapability = await strongRuntimeCapability();

    assert.equal(LOCAL_MODEL_APPROVAL_REGISTRY.length, 3);
    for (const candidate of LOCAL_MODEL_APPROVAL_REGISTRY) {
      const result = buildCurrentLocalModelAcquisitionPreflight({
        candidateId: candidate.candidateId,
        runtimeCapability,
        accessTier: 'pro',
      });
      assert.equal(result.status, 'blocked', candidate.candidateId);
      assert.equal(result.canOfferUserConfirmation, false, candidate.candidateId);
      assert.equal(result.canPlanFutureAcquisition, false, candidate.candidateId);
      assert.equal(result.downloadStarted, false);
      assert.equal(result.modelActive, false);
    }
  });
});
