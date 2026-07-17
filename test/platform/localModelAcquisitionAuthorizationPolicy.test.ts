import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  evaluateLocalModelAcquisitionPreflight,
} from '../../src/platform/ai/localModelAcquisitionPreflight.ts';
import type {
  LocalModelAcquisitionPreflightInput,
  LocalModelAcquisitionPreflightResult,
} from '../../src/platform/ai/localModelAcquisitionTypes.ts';
import {
  applyLocalModelAcquisitionConsentEvent,
  buildLocalModelAcquisitionDisclosure,
  createLocalModelAcquisitionConsentSession,
  rebuildLocalModelAcquisitionPreflightWithConsent,
} from '../../src/platform/ai/localModelAcquisitionConsentPolicy.ts';
import type {
  LocalModelAcquisitionConsentPolicyInput,
  LocalModelAcquisitionConsentSession,
} from '../../src/platform/ai/localModelAcquisitionConsentTypes.ts';
import {
  LOCAL_MODEL_ACQUISITION_AUTHORIZATION_POLICY_REVISION,
  applyLocalModelAcquisitionAuthorizationEvent,
  buildLocalModelAcquisitionAuthorizationScope,
  createLocalModelAcquisitionAuthorizationSession,
  isSameLocalModelAcquisitionAuthorizationScope,
  revalidateLocalModelAcquisitionAuthorization,
} from '../../src/platform/ai/localModelAcquisitionAuthorizationPolicy.ts';
import type {
  LocalModelAcquisitionAuthorizationPolicyInput,
  LocalModelAcquisitionAuthorizationScope,
} from '../../src/platform/ai/localModelAcquisitionAuthorizationTypes.ts';

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
  confirmationStatus: LocalModelAcquisitionPreflightInput['confirmationStatus'] = 'not-requested',
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
    cachePolicyResult: syntheticCachePolicy(true),
    featureAvailability: 'full-ui',
  };
}

function disclosure() {
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
    cloudProcessingStatement: 'This decision does not authorize cloud inference.',
    cacheRemovalStatement: 'A future lifecycle must provide user-controlled removal.',
    confirmationMeaning: 'Confirmation remains one prerequisite and does not execute acquisition.',
  });
}

function confirmedConsent(): {
  session: LocalModelAcquisitionConsentSession;
  finalPreflight: LocalModelAcquisitionPreflightResult;
} {
  const preflightInput = syntheticApprovedInput('not-requested');
  const basePreflight = evaluateLocalModelAcquisitionPreflight(preflightInput);
  const consentInput: LocalModelAcquisitionConsentPolicyInput = {
    preflight: basePreflight,
    disclosure: disclosure(),
  };
  const initial = createLocalModelAcquisitionConsentSession(consentInput);
  const session = applyLocalModelAcquisitionConsentEvent(initial, { type: 'confirm' }, consentInput);
  const finalPreflight = rebuildLocalModelAcquisitionPreflightWithConsent(
    preflightInput,
    session,
    consentInput,
  );
  return { session, finalPreflight };
}

function scope(overrides: Partial<LocalModelAcquisitionAuthorizationScope> = {}) {
  return buildLocalModelAcquisitionAuthorizationScope({
    candidateId: 'synthetic-light-candidate',
    candidateTier: 'light',
    artifactCandidateId: 'synthetic-light-artifact',
    estimatedDownloadSizeMb: 640,
    expectedStorageImpactMb: 700,
    disclosureRevision: 1,
    accessTier: 'pro',
    assignedDeviceTier: 'light',
    benchmarkStatus: 'passed',
    webGpuStatus: 'supported',
    connectionKind: 'wifi',
    batterySafety: 'safe',
    thermalStatus: 'normal',
    storageQuotaStatus: 'sufficient',
    ...overrides,
  });
}

function eligibleInput(
  overrides: Partial<LocalModelAcquisitionAuthorizationPolicyInput> = {},
): LocalModelAcquisitionAuthorizationPolicyInput {
  const confirmed = confirmedConsent();
  return {
    preflight: confirmed.finalPreflight,
    consent: confirmed.session,
    scope: scope(),
    ...overrides,
  };
}

function blockedPreflight(
  override: Partial<LocalModelAcquisitionPreflightInput>,
): LocalModelAcquisitionPreflightResult {
  return evaluateLocalModelAcquisitionPreflight({
    ...syntheticApprovedInput('confirmed'),
    ...override,
  });
}

describe('Phase 4.9 local model acquisition authorization policy', () => {
  it('creates unavailable authorization when final preflight or consent is not eligible', () => {
    const valid = eligibleInput();
    const cases: LocalModelAcquisitionAuthorizationPolicyInput[] = [
      { ...valid, preflight: blockedPreflight({ modelApproved: false }) },
      {
        ...valid,
        preflight: evaluateLocalModelAcquisitionPreflight(syntheticApprovedInput('not-requested')),
      },
      {
        ...valid,
        consent: { ...valid.consent, state: 'awaiting-user-decision', consentRecorded: false, confirmationStatusForPreflight: 'not-requested' },
      },
      {
        ...valid,
        consent: { ...valid.consent, state: 'invalidated', consentValidForCurrentScope: false, confirmationStatusForPreflight: 'not-requested' },
      },
    ];

    for (const input of cases) {
      const session = createLocalModelAcquisitionAuthorizationSession(input);
      assert.equal(session.state, 'unavailable');
      assert.equal(session.canRequestAuthorization, false);
      assert.equal(session.authorizationGranted, false);
      assert.equal(session.futureExecutorHandoffAllowed, false);
    }
  });

  it('creates awaiting-action-request only when final preflight and current consent pass', () => {
    const session = createLocalModelAcquisitionAuthorizationSession(eligibleInput());

    assert.equal(session.state, 'awaiting-action-request');
    assert.equal(session.canRequestAuthorization, true);
    assert.equal(session.authorizationGranted, false);
    assert.equal(session.futureExecutorHandoffAllowed, false);
    assert.notEqual(session.state, 'authorized');
    assert.equal(session.oneAttemptOnly, true);
  });

  it('requires an explicit request and grants only a one-attempt future handoff', () => {
    const input = eligibleInput();
    const initial = createLocalModelAcquisitionAuthorizationSession(input);
    const authorized = applyLocalModelAcquisitionAuthorizationEvent(
      initial,
      { type: 'request-authorization' },
      input,
    );

    assert.equal(authorized.state, 'authorized');
    assert.equal(authorized.actionRequestRecorded, true);
    assert.equal(authorized.authorizationGranted, true);
    assert.equal(authorized.futureExecutorHandoffAllowed, true);
    assert.equal(authorized.canConsume, true);
    assert.equal(authorized.downloadStarted, false);
    assert.equal(authorized.downloadCompleted, false);
    assert.equal(authorized.cacheWritten, false);
    assert.equal(authorized.runtimeInitialized, false);
    assert.equal(authorized.modelReady, false);
    assert.equal(authorized.modelActive, false);
    assert.equal(authorized.generatedOutputProduced, false);
  });

  it('rejects request from unavailable, invalidated, cancelled, and consumed states', () => {
    const input = eligibleInput();
    const awaiting = createLocalModelAcquisitionAuthorizationSession(input);
    const authorized = applyLocalModelAcquisitionAuthorizationEvent(awaiting, { type: 'request-authorization' }, input);
    const cancelled = applyLocalModelAcquisitionAuthorizationEvent(authorized, { type: 'cancel' }, input);
    const consumed = applyLocalModelAcquisitionAuthorizationEvent(authorized, { type: 'consume' }, input);
    const invalidated = revalidateLocalModelAcquisitionAuthorization(authorized, {
      ...input,
      scope: scope({ candidateTier: 'standard' }),
    });
    const unavailable = createLocalModelAcquisitionAuthorizationSession({
      ...input,
      preflight: blockedPreflight({ benchmarkStatus: 'failed' }),
    });

    for (const session of [unavailable, invalidated, cancelled, consumed]) {
      const next = applyLocalModelAcquisitionAuthorizationEvent(
        session,
        { type: 'request-authorization' },
        input,
      );
      assert.notEqual(next.state, 'authorized');
      assert.equal(next.futureExecutorHandoffAllowed, false);
      assert.ok(next.reasons.includes('authorization-request-not-available'));
    }
  });

  it('cancels without side effects and reset never automatically authorizes', () => {
    const input = eligibleInput();
    const initial = createLocalModelAcquisitionAuthorizationSession(input);
    const authorized = applyLocalModelAcquisitionAuthorizationEvent(initial, { type: 'request-authorization' }, input);
    const cancelled = applyLocalModelAcquisitionAuthorizationEvent(authorized, { type: 'cancel' }, input);
    const reset = applyLocalModelAcquisitionAuthorizationEvent(cancelled, { type: 'reset' }, input);

    assert.equal(cancelled.state, 'cancelled');
    assert.equal(cancelled.authorizationGranted, false);
    assert.equal(cancelled.futureExecutorHandoffAllowed, false);
    assert.equal(cancelled.downloadStarted, false);
    assert.equal(cancelled.cacheWritten, false);
    assert.equal(reset.state, 'awaiting-action-request');
    assert.equal(reset.authorizationGranted, false);
    assert.equal(reset.actionRequestRecorded, false);
  });

  it('compares every explicit authorization-scope field and ignores exact battery percentage', () => {
    const base = scope();
    assert.equal(LOCAL_MODEL_ACQUISITION_AUTHORIZATION_POLICY_REVISION, 1);
    assert.equal(isSameLocalModelAcquisitionAuthorizationScope(base, { ...base }), true);

    const changes: Array<Partial<LocalModelAcquisitionAuthorizationScope>> = [
      { candidateId: 'other-candidate' },
      { candidateTier: 'standard' },
      { artifactCandidateId: 'other-artifact' },
      { estimatedDownloadSizeMb: 641 },
      { expectedStorageImpactMb: 701 },
      { disclosureRevision: 2 },
      { authorizationPolicyRevision: 2 },
      { accessTier: 'free' },
      { assignedDeviceTier: 'standard' },
      { benchmarkStatus: 'failed' },
      { webGpuStatus: 'unsupported' },
      { connectionKind: 'cellular' },
      { batterySafety: 'unsafe' },
      { thermalStatus: 'hot' },
      { storageQuotaStatus: 'unknown' },
    ];

    for (const change of changes) {
      assert.equal(isSameLocalModelAcquisitionAuthorizationScope(base, { ...base, ...change }), false);
    }
    assert.equal('batteryLevelPercent' in base, false);
  });

  it('invalidates candidate, artifact, tier, consent, approval, benchmark, capability, environment, storage, and entitlement changes', () => {
    const input = eligibleInput();
    const initial = createLocalModelAcquisitionAuthorizationSession(input);
    const authorized = applyLocalModelAcquisitionAuthorizationEvent(initial, { type: 'request-authorization' }, input);
    const changedInputs: LocalModelAcquisitionAuthorizationPolicyInput[] = [
      { ...input, scope: scope({ candidateId: 'other-candidate' }) },
      { ...input, scope: scope({ candidateTier: 'standard' }) },
      { ...input, scope: scope({ candidateTier: 'pro' }) },
      { ...input, scope: scope({ artifactCandidateId: 'other-artifact' }) },
      { ...input, consent: { ...input.consent, state: 'invalidated', consentValidForCurrentScope: false, confirmationStatusForPreflight: 'not-requested' } },
      { ...input, preflight: blockedPreflight({ modelApproved: false }) },
      { ...input, preflight: blockedPreflight({ licenseApproved: false }) },
      { ...input, preflight: blockedPreflight({ artifactApproved: false }) },
      { ...input, scope: scope({ benchmarkStatus: 'failed' }), preflight: blockedPreflight({ benchmarkStatus: 'failed' }) },
      { ...input, scope: scope({ webGpuStatus: 'unsupported' }), preflight: blockedPreflight({ webGpuStatus: 'unsupported' }) },
      { ...input, scope: scope({ connectionKind: 'cellular' }), preflight: blockedPreflight({ connectionKind: 'cellular' }) },
      { ...input, scope: scope({ connectionKind: 'offline' }), preflight: blockedPreflight({ connectionKind: 'offline' }) },
      { ...input, scope: scope({ batterySafety: 'unsafe' }), preflight: blockedPreflight({ batteryLevelPercent: 10 }) },
      { ...input, scope: scope({ thermalStatus: 'hot' }), preflight: blockedPreflight({ thermalStatus: 'hot' }) },
      { ...input, scope: scope({ storageQuotaStatus: 'unknown' }), preflight: blockedPreflight({ storageQuotaStatus: 'unknown' }) },
      { ...input, scope: scope({ storageQuotaStatus: 'insufficient' }), preflight: blockedPreflight({ storageQuotaStatus: 'insufficient' }) },
      { ...input, scope: scope({ accessTier: 'free' }), preflight: blockedPreflight({ candidateTierAllowed: false }) },
    ];

    for (const currentInput of changedInputs) {
      const next = revalidateLocalModelAcquisitionAuthorization(authorized, currentInput);
      assert.equal(next.state, 'invalidated');
      assert.equal(next.authorizationGranted, false);
      assert.equal(next.futureExecutorHandoffAllowed, false);
    }
  });

  it('does not invalidate solely for a safe battery percentage change within the same bucket', () => {
    const input = eligibleInput();
    const initial = createLocalModelAcquisitionAuthorizationSession(input);
    const authorized = applyLocalModelAcquisitionAuthorizationEvent(initial, { type: 'request-authorization' }, input);
    const currentInput = { ...input, scope: scope({ batterySafety: 'safe' }) };
    const revalidated = revalidateLocalModelAcquisitionAuthorization(authorized, currentInput);

    assert.equal(revalidated.state, 'authorized');
    assert.equal(revalidated.authorizationGranted, true);
    assert.equal(revalidated.futureExecutorHandoffAllowed, true);
  });

  it('consumes only an authorized current permit and never claims execution success', () => {
    const input = eligibleInput();
    const awaiting = createLocalModelAcquisitionAuthorizationSession(input);
    const rejected = applyLocalModelAcquisitionAuthorizationEvent(awaiting, { type: 'consume' }, input);
    const authorized = applyLocalModelAcquisitionAuthorizationEvent(awaiting, { type: 'request-authorization' }, input);
    const consumed = applyLocalModelAcquisitionAuthorizationEvent(authorized, { type: 'consume' }, input);
    const reused = applyLocalModelAcquisitionAuthorizationEvent(consumed, { type: 'consume' }, input);

    assert.notEqual(rejected.state, 'consumed');
    assert.equal(consumed.state, 'consumed');
    assert.equal(consumed.authorizationConsumed, true);
    assert.equal(consumed.authorizationGranted, false);
    assert.equal(consumed.futureExecutorHandoffAllowed, false);
    assert.equal(consumed.downloadStarted, false);
    assert.equal(consumed.downloadCompleted, false);
    assert.equal(consumed.cacheWritten, false);
    assert.equal(consumed.runtimeInitialized, false);
    assert.equal(consumed.modelActive, false);
    assert.equal(reused.state, 'consumed');
    assert.equal(reused.futureExecutorHandoffAllowed, false);
  });

  it('does not mutate policy input or prior session and keeps reasons deterministic and unique', () => {
    const input = eligibleInput();
    const inputSnapshot = structuredClone(input);
    const initial = createLocalModelAcquisitionAuthorizationSession(input);
    const initialSnapshot = structuredClone(initial);
    const first = applyLocalModelAcquisitionAuthorizationEvent(initial, { type: 'consume' }, input);
    const repeated = applyLocalModelAcquisitionAuthorizationEvent(first, { type: 'consume' }, input);
    const independent = applyLocalModelAcquisitionAuthorizationEvent(initial, { type: 'consume' }, input);

    assert.deepEqual(input, inputSnapshot);
    assert.deepEqual(initial, initialSnapshot);
    assert.deepEqual(first.reasons, independent.reasons);
    assert.equal(new Set(repeated.reasons).size, repeated.reasons.length);
  });
});
