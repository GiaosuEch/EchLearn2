import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from '../../src/platform/ai/localModelArtifactManifest.ts';
import {
  evaluateLocalModelAcquisitionPreflight,
} from '../../src/platform/ai/localModelAcquisitionPreflight.ts';
import type {
  LocalModelAcquisitionPreflightInput,
  LocalModelAcquisitionPreflightResult,
} from '../../src/platform/ai/localModelAcquisitionTypes.ts';
import {
  LOCAL_MODEL_ACQUISITION_DISCLOSURE_REVISION,
  applyLocalModelAcquisitionConsentEvent,
  buildLocalModelAcquisitionDisclosure,
  createLocalModelAcquisitionConsentSession,
  isSameLocalModelAcquisitionConsentScope,
  mapConsentStateToPreflightConfirmationStatus,
  rebuildLocalModelAcquisitionPreflightWithConsent,
  reconcileLocalModelAcquisitionConsentSession,
} from '../../src/platform/ai/localModelAcquisitionConsentPolicy.ts';
import type {
  LocalModelAcquisitionConsentPolicyInput,
  LocalModelAcquisitionConsentScope,
  LocalModelAcquisitionDisclosure,
} from '../../src/platform/ai/localModelAcquisitionConsentTypes.ts';

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

function completeDisclosure(overrides: Partial<Parameters<typeof buildLocalModelAcquisitionDisclosure>[0]> = {}) {
  return buildLocalModelAcquisitionDisclosure({
    candidateId: 'synthetic-light-candidate',
    candidateTier: 'light',
    artifactCandidateId: 'synthetic-light-artifact',
    modelClassLabel: '0.6B',
    estimatedDownloadSizeMb: 640,
    expectedStorageImpactMb: 700,
    connectionRequirement: 'Wi-Fi is required for a future acquisition attempt.',
    batteryRequirement: 'Battery must remain at a safe level.',
    localProcessingStatement: 'Approved local inference would process supported tasks on this device.',
    cloudProcessingStatement: 'This consent does not send model acquisition data to a cloud inference provider.',
    cacheRemovalStatement: 'A future lifecycle must provide user-controlled cache removal.',
    confirmationMeaning: 'Confirmation supplies one prerequisite to Phase 4.7 and does not authorize execution.',
    ...overrides,
  });
}

function awaitingPreflight(): LocalModelAcquisitionPreflightResult {
  return evaluateLocalModelAcquisitionPreflight(syntheticApprovedInput('not-requested'));
}

function blockedPreflight(
  override: Partial<LocalModelAcquisitionPreflightInput> = { modelApproved: false },
): LocalModelAcquisitionPreflightResult {
  return evaluateLocalModelAcquisitionPreflight({
    ...syntheticApprovedInput('not-requested'),
    ...override,
  });
}

function policyInput(
  preflight: LocalModelAcquisitionPreflightResult = awaitingPreflight(),
  disclosure: LocalModelAcquisitionDisclosure = completeDisclosure(),
): LocalModelAcquisitionConsentPolicyInput {
  return { preflight, disclosure };
}

function changedScope(
  scope: LocalModelAcquisitionConsentScope,
  overrides: Partial<LocalModelAcquisitionConsentScope>,
): LocalModelAcquisitionConsentScope {
  return { ...scope, ...overrides };
}

describe('Phase 4.8 local model acquisition consent policy', () => {
  it('creates unavailable consent for blocked preflight and never defaults to confirmed', () => {
    const session = createLocalModelAcquisitionConsentSession(policyInput(blockedPreflight()));

    assert.equal(session.state, 'unavailable');
    assert.equal(session.canConfirm, false);
    assert.equal(session.canDecline, false);
    assert.equal(session.consentRecorded, false);
    assert.equal(session.confirmationStatusForPreflight, 'not-requested');
    assert.notEqual(session.state, 'confirmed');
  });

  it('keeps awaiting preflight unavailable until disclosure is complete', () => {
    const disclosure = completeDisclosure({ estimatedDownloadSizeMb: null });
    const session = createLocalModelAcquisitionConsentSession(policyInput(awaitingPreflight(), disclosure));

    assert.equal(disclosure.disclosureComplete, false);
    assert.ok(disclosure.missingDisclosureFields.includes('estimated-download-size'));
    assert.equal(session.state, 'unavailable');
    assert.equal(session.canConfirm, false);
    assert.equal(session.confirmationStatusForPreflight, 'not-requested');
  });

  it('creates an awaiting-user-decision session only for passable preflight and complete disclosure', () => {
    const session = createLocalModelAcquisitionConsentSession(policyInput());

    assert.equal(session.state, 'awaiting-user-decision');
    assert.equal(session.canConfirm, true);
    assert.equal(session.canDecline, true);
    assert.equal(session.consentRecorded, false);
    assert.equal(session.confirmationStatusForPreflight, 'not-requested');
  });

  it('rejects confirm for unavailable, blocked, or incomplete sessions without throwing', () => {
    const cases = [
      policyInput(blockedPreflight()),
      policyInput(awaitingPreflight(), completeDisclosure({ expectedStorageImpactMb: null })),
      policyInput(blockedPreflight({ benchmarkStatus: 'not-run' })),
    ];

    for (const input of cases) {
      const initial = createLocalModelAcquisitionConsentSession(input);
      const next = applyLocalModelAcquisitionConsentEvent(initial, { type: 'confirm' }, input);
      assert.notEqual(next.state, 'confirmed');
      assert.equal(next.confirmationStatusForPreflight, 'not-requested');
      assert.ok(next.reasons.includes('confirm-not-available'));
    }
  });

  it('accepts explicit confirm only from awaiting-user-decision and maps it to Phase 4.7', () => {
    const input = policyInput();
    const initial = createLocalModelAcquisitionConsentSession(input);
    const confirmed = applyLocalModelAcquisitionConsentEvent(initial, { type: 'confirm' }, input);

    assert.equal(confirmed.state, 'confirmed');
    assert.equal(confirmed.consentRecorded, true);
    assert.equal(confirmed.consentValidForCurrentScope, true);
    assert.equal(mapConsentStateToPreflightConfirmationStatus(confirmed), 'confirmed');
    assert.equal(confirmed.confirmationStatusForPreflight, 'confirmed');
  });

  it('maps explicit decline to declined without authorizing any action', () => {
    const input = policyInput();
    const initial = createLocalModelAcquisitionConsentSession(input);
    const declined = applyLocalModelAcquisitionConsentEvent(initial, { type: 'decline' }, input);

    assert.equal(declined.state, 'declined');
    assert.equal(mapConsentStateToPreflightConfirmationStatus(declined), 'declined');
    assert.equal(declined.downloadAuthorizedForExecution, false);
    assert.equal(declined.downloadStarted, false);
    assert.equal(declined.cacheWritten, false);
    assert.equal(declined.runtimeInitialized, false);
  });

  it('reset clears confirmed and declined decisions in memory', () => {
    for (const event of [{ type: 'confirm' }, { type: 'decline' }] as const) {
      const input = policyInput();
      const initial = createLocalModelAcquisitionConsentSession(input);
      const decided = applyLocalModelAcquisitionConsentEvent(initial, event, input);
      const reset = applyLocalModelAcquisitionConsentEvent(decided, { type: 'reset' }, input);

      assert.equal(reset.state, 'awaiting-user-decision');
      assert.equal(reset.consentRecorded, false);
      assert.equal(reset.confirmationStatusForPreflight, 'not-requested');
    }
  });

  it('compares consent scopes by explicit field values rather than object identity', () => {
    const scope = createLocalModelAcquisitionConsentSession(policyInput()).scope;
    const copy = { ...scope };

    assert.notEqual(scope, copy);
    assert.equal(isSameLocalModelAcquisitionConsentScope(scope, copy), true);
  });

  it('invalidates consent for every candidate, artifact, size, storage, tier, or revision change', () => {
    const input = policyInput();
    const initial = createLocalModelAcquisitionConsentSession(input);
    const confirmed = applyLocalModelAcquisitionConsentEvent(initial, { type: 'confirm' }, input);
    const changes: readonly Partial<LocalModelAcquisitionConsentScope>[] = [
      { candidateId: 'different-candidate' },
      { candidateTier: 'standard' },
      { artifactCandidateId: 'different-artifact' },
      { estimatedDownloadSizeMb: 641 },
      { expectedStorageImpactMb: 701 },
      { disclosureRevision: LOCAL_MODEL_ACQUISITION_DISCLOSURE_REVISION + 1 },
    ];

    for (const change of changes) {
      const scope = changedScope(confirmed.scope, change);
      const disclosure = completeDisclosure({
        candidateId: scope.candidateId,
        candidateTier: scope.candidateTier,
        artifactCandidateId: scope.artifactCandidateId,
        estimatedDownloadSizeMb: scope.estimatedDownloadSizeMb,
        expectedStorageImpactMb: scope.expectedStorageImpactMb,
        disclosureRevision: scope.disclosureRevision,
      });
      const currentInput = policyInput(awaitingPreflight(), disclosure);
      const invalidated = applyLocalModelAcquisitionConsentEvent(
        confirmed,
        { type: 'scope-changed', scope },
        currentInput,
      );

      assert.equal(invalidated.state, 'invalidated', JSON.stringify(change));
      assert.equal(invalidated.confirmationStatusForPreflight, 'not-requested');
      assert.equal(invalidated.consentValidForCurrentScope, false);
    }
  });

  it('does not carry consent from light to standard or standard to pro', () => {
    for (const nextTier of ['standard', 'pro'] as const) {
      const initialDisclosure = completeDisclosure({
        candidateTier: nextTier === 'standard' ? 'light' : 'standard',
      });
      const input = policyInput(awaitingPreflight(), initialDisclosure);
      const confirmed = applyLocalModelAcquisitionConsentEvent(
        createLocalModelAcquisitionConsentSession(input),
        { type: 'confirm' },
        input,
      );
      const nextDisclosure = completeDisclosure({ candidateTier: nextTier });
      const reconciled = reconcileLocalModelAcquisitionConsentSession(
        confirmed,
        policyInput(awaitingPreflight(), nextDisclosure),
      );

      assert.equal(reconciled.state, 'invalidated');
      assert.equal(reconciled.confirmationStatusForPreflight, 'not-requested');
    }
  });

  it('invalidates recorded consent when preflight later becomes blocked', () => {
    const input = policyInput();
    const confirmed = applyLocalModelAcquisitionConsentEvent(
      createLocalModelAcquisitionConsentSession(input),
      { type: 'confirm' },
      input,
    );
    const invalidated = reconcileLocalModelAcquisitionConsentSession(
      confirmed,
      policyInput(blockedPreflight({ modelApproved: false })),
    );

    assert.equal(invalidated.state, 'invalidated');
    assert.equal(invalidated.confirmationStatusForPreflight, 'not-requested');
  });

  it('cannot bypass approval, benchmark, device, WebGPU, connection, battery, thermal, or storage blockers', () => {
    const cases: readonly [string, Partial<LocalModelAcquisitionPreflightInput>, string][] = [
      ['approval', { modelApproved: false }, 'model-approval-pending'],
      ['benchmark', { benchmarkStatus: 'not-run' }, 'benchmark-not-passed'],
      ['device', { deviceTier: 'ultra-low', deviceGateAllowsCandidate: false }, 'device-tier-blocked'],
      ['webgpu', { webGpuStatus: 'unsupported' }, 'webgpu-not-supported'],
      ['cellular', { connectionKind: 'cellular' }, 'connection-not-wifi'],
      ['offline', { connectionKind: 'offline' }, 'connection-not-wifi'],
      ['battery', { batteryLevelPercent: 14 }, 'battery-unsafe'],
      ['thermal', { thermalStatus: 'hot' }, 'thermal-hot'],
      ['storage', { storageQuotaStatus: 'unknown' }, 'storage-unknown'],
    ];

    const confirmedSession = applyLocalModelAcquisitionConsentEvent(
      createLocalModelAcquisitionConsentSession(policyInput()),
      { type: 'confirm' },
      policyInput(),
    );

    for (const [name, override, blocker] of cases) {
      const preflightInput: LocalModelAcquisitionPreflightInput = {
        ...syntheticApprovedInput('not-requested'),
        ...override,
      };
      const currentConsentInput = policyInput(
        evaluateLocalModelAcquisitionPreflight(preflightInput),
        completeDisclosure(),
      );
      const result = rebuildLocalModelAcquisitionPreflightWithConsent(
        preflightInput,
        confirmedSession,
        currentConsentInput,
      );
      assert.equal(result.status, 'blocked', name);
      assert.ok(result.blockers.includes(blocker as never), name);
      assert.equal(result.modelActive, false, name);
    }
  });

  it('does not reuse a confirmed session for a different current acquisition scope', () => {
    const lightInput = policyInput();
    const confirmedLight = applyLocalModelAcquisitionConsentEvent(
      createLocalModelAcquisitionConsentSession(lightInput),
      { type: 'confirm' },
      lightInput,
    );
    const standardPreflightInput: LocalModelAcquisitionPreflightInput = {
      ...syntheticApprovedInput('not-requested'),
      candidateId: 'synthetic-standard-candidate',
      candidateTier: 'standard',
      deviceTier: 'standard',
    };
    const standardPreflight = evaluateLocalModelAcquisitionPreflight(standardPreflightInput);
    const standardDisclosure = completeDisclosure({
      candidateId: 'synthetic-standard-candidate',
      candidateTier: 'standard',
      artifactCandidateId: 'synthetic-standard-artifact',
      modelClassLabel: '1.7B',
      estimatedDownloadSizeMb: 1200,
      expectedStorageImpactMb: 1350,
    });
    const currentInput = policyInput(standardPreflight, standardDisclosure);
    const result = rebuildLocalModelAcquisitionPreflightWithConsent(
      standardPreflightInput,
      confirmedLight,
      currentInput,
    );

    assert.equal(result.status, 'awaiting-user-confirmation');
    assert.equal(result.canPlanFutureAcquisition, false);
    assert.ok(result.blockers.includes('user-confirmation-not-requested'));
  });

  it('rebuilds a synthetic valid Phase 4.7 preflight after confirm or decline', () => {
    const input = policyInput();
    const initial = createLocalModelAcquisitionConsentSession(input);
    const confirmed = applyLocalModelAcquisitionConsentEvent(initial, { type: 'confirm' }, input);
    const declined = applyLocalModelAcquisitionConsentEvent(initial, { type: 'decline' }, input);
    const passed = rebuildLocalModelAcquisitionPreflightWithConsent(
      syntheticApprovedInput(),
      confirmed,
      input,
    );
    const blocked = rebuildLocalModelAcquisitionPreflightWithConsent(
      syntheticApprovedInput(),
      declined,
      input,
    );

    assert.equal(passed.status, 'preflight-passed');
    assert.equal(passed.canPlanFutureAcquisition, true);
    assert.equal(passed.downloadStarted, false);
    assert.equal(passed.cacheWritten, false);
    assert.equal(passed.runtimeInitialized, false);
    assert.equal(passed.modelReady, false);
    assert.equal(passed.modelActive, false);
    assert.equal(blocked.status, 'blocked');
    assert.ok(blocked.blockers.includes('user-confirmation-declined'));
  });

  it('rejects null, non-positive, and non-finite artifact sizes without inventing values', () => {
    for (const value of [null, 0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      const disclosure = completeDisclosure({ estimatedDownloadSizeMb: value });
      assert.equal(disclosure.disclosureComplete, false, String(value));
      assert.equal(disclosure.estimatedDownloadSizeMb, value, String(value));
      assert.ok(disclosure.missingDisclosureFields.includes('estimated-download-size'));
    }

    const missingStorage = completeDisclosure({ expectedStorageImpactMb: null });
    assert.equal(missingStorage.disclosureComplete, false);
    assert.equal(missingStorage.expectedStorageImpactMb, null);
    assert.ok(missingStorage.missingDisclosureFields.includes('expected-storage-impact'));
  });

  it('does not mutate policy input or prior consent sessions', () => {
    const input = policyInput();
    const inputSnapshot = JSON.stringify(input);
    const initial = createLocalModelAcquisitionConsentSession(input);
    const initialSnapshot = JSON.stringify(initial);
    const confirmed = applyLocalModelAcquisitionConsentEvent(initial, { type: 'confirm' }, input);

    assert.equal(JSON.stringify(input), inputSnapshot);
    assert.equal(JSON.stringify(initial), initialSnapshot);
    assert.notEqual(confirmed, initial);
  });

  it('keeps reasons deterministic, unique, and every action invariant false', () => {
    const input = policyInput(blockedPreflight({
      modelApproved: false,
      benchmarkStatus: 'not-run',
      connectionKind: 'cellular',
    }), completeDisclosure({ estimatedDownloadSizeMb: null }));
    const first = createLocalModelAcquisitionConsentSession(input);
    const second = createLocalModelAcquisitionConsentSession(input);

    assert.deepEqual(first.reasons, second.reasons);
    assert.equal(new Set(first.reasons).size, first.reasons.length);
    assert.equal(first.policyOnly, true);
    assert.equal(first.downloadAuthorizedForExecution, false);
    assert.equal(first.downloadStarted, false);
    assert.equal(first.cacheWritten, false);
    assert.equal(first.runtimeInitialized, false);
    assert.equal(first.modelReady, false);
    assert.equal(first.modelActive, false);
  });

  it('keeps all three current production disclosures incomplete and consent unavailable', () => {
    assert.equal(LOCAL_MODEL_APPROVAL_REGISTRY.length, 3);
    assert.equal(LOCAL_MODEL_ARTIFACT_MANIFEST.length, 3);

    for (const candidate of LOCAL_MODEL_APPROVAL_REGISTRY) {
      const artifact = LOCAL_MODEL_ARTIFACT_MANIFEST.find((item) => item.candidateId === candidate.candidateId);
      assert.ok(artifact);
      const disclosure = completeDisclosure({
        candidateId: candidate.candidateId,
        candidateTier: candidate.tier,
        artifactCandidateId: artifact.artifactId,
        modelClassLabel: candidate.parameterScaleLabel,
        estimatedDownloadSizeMb: artifact.estimatedDownloadSizeMb,
        expectedStorageImpactMb: artifact.estimatedInstalledSizeMb,
      });
      const preflight = blockedPreflight({
        candidateId: candidate.candidateId,
        candidateTier: candidate.tier,
        modelApproved: candidate.approved,
        licenseApproved: candidate.licenseApproved,
        artifactApproved: candidate.artifactApproved,
        artifactDownloadable: candidate.downloadable,
        artifactCacheable: artifact.cacheable,
        artifactRuntimeReady: artifact.runtimeReady,
        checksumStatus: artifact.checksumStatus,
        downloadLocationStatus: artifact.downloadUrlStatus,
        benchmarkStatus: candidate.benchmarkStatus,
      });
      const session = createLocalModelAcquisitionConsentSession(policyInput(preflight, disclosure));

      assert.equal(disclosure.disclosureComplete, false);
      assert.equal(session.state, 'unavailable');
      assert.equal(session.canConfirm, false);
      assert.equal(session.consentRecorded, false);
      assert.equal(session.modelActive, false);
    }
  });
});
