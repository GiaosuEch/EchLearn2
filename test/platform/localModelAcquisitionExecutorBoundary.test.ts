import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  evaluateLocalModelAcquisitionPreflight,
} from '../../src/platform/ai/localModelAcquisitionPreflight.ts';
import type {
  LocalModelAcquisitionPreflightInput,
} from '../../src/platform/ai/localModelAcquisitionTypes.ts';
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
import type {
  LocalModelAcquisitionAuthorizationPolicyInput,
  LocalModelAcquisitionAuthorizationSession,
} from '../../src/platform/ai/localModelAcquisitionAuthorizationTypes.ts';
import {
  LOCAL_MODEL_ACQUISITION_EXECUTION_BOUNDARY_REVISION,
  buildLocalModelAcquisitionExecutionRequest,
  createUnavailableLocalModelAcquisitionExecutor,
  executeLocalModelAcquisitionHandoff,
} from '../../src/platform/ai/localModelAcquisitionExecutorBoundary.ts';
import type {
  LocalModelAcquisitionExecutor,
  LocalModelAcquisitionExecutorResponse,
} from '../../src/platform/ai/localModelAcquisitionExecutionTypes.ts';

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

function syntheticPreflightInput(): LocalModelAcquisitionPreflightInput {
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

function eligibleAuthorizationInput(): LocalModelAcquisitionAuthorizationPolicyInput {
  const preflightInput = syntheticPreflightInput();
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

function authorizedFixture(): {
  input: LocalModelAcquisitionAuthorizationPolicyInput;
  session: LocalModelAcquisitionAuthorizationSession;
} {
  const input = eligibleAuthorizationInput();
  const initial = createLocalModelAcquisitionAuthorizationSession(input);
  const session = applyLocalModelAcquisitionAuthorizationEvent(
    initial,
    { type: 'request-authorization' },
    input,
  );
  assert.equal(session.state, 'authorized');
  return { input, session };
}

function executor(
  availability: LocalModelAcquisitionExecutor['availability'],
  response: LocalModelAcquisitionExecutorResponse | (() => Promise<LocalModelAcquisitionExecutorResponse>),
  counter?: { calls: number },
): LocalModelAcquisitionExecutor {
  return {
    availability,
    async acceptHandoff() {
      if (counter) counter.calls += 1;
      if (typeof response === 'function') return response();
      return response;
    },
  };
}

const unavailableResponse: LocalModelAcquisitionExecutorResponse = {
  outcome: 'executor-unavailable',
  requestAccepted: false,
  executorAvailable: false,
  reasons: ['executor-unavailable'],
  warnings: [],
};

const rejectedResponse: LocalModelAcquisitionExecutorResponse = {
  outcome: 'rejected',
  requestAccepted: false,
  executorAvailable: true,
  reasons: ['executor-rejected-handoff'],
  warnings: [],
};

const acceptedResponse: LocalModelAcquisitionExecutorResponse = {
  outcome: 'handoff-accepted',
  requestAccepted: true,
  executorAvailable: true,
  reasons: ['executor-accepted-contract-handoff'],
  warnings: [],
};

describe('Phase 4.10 local model acquisition executor boundary', () => {
  it('does not build or hand off for unavailable, awaiting, cancelled, invalidated, or consumed authorization', async () => {
    const { input, session: authorized } = authorizedFixture();
    const awaiting = createLocalModelAcquisitionAuthorizationSession(input);
    const unavailable = createLocalModelAcquisitionAuthorizationSession({
      ...input,
      preflight: evaluateLocalModelAcquisitionPreflight({
        ...syntheticPreflightInput(),
        confirmationStatus: 'confirmed',
        benchmarkStatus: 'failed',
      }),
    });
    const cancelled = applyLocalModelAcquisitionAuthorizationEvent(
      authorized,
      { type: 'cancel' },
      input,
    );
    const invalidated = applyLocalModelAcquisitionAuthorizationEvent(
      authorized,
      { type: 'scope-changed', scope: { ...input.scope, candidateTier: 'standard' } },
      { ...input, scope: { ...input.scope, candidateTier: 'standard' } },
    );
    const consumed = applyLocalModelAcquisitionAuthorizationEvent(
      authorized,
      { type: 'consume' },
      input,
    );
    const calls = { calls: 0 };
    const accepting = executor('available', acceptedResponse, calls);

    for (const session of [unavailable, awaiting, cancelled, invalidated, consumed]) {
      const result = await executeLocalModelAcquisitionHandoff(
        { authorizationSession: session, currentAuthorizationInput: input },
        accepting,
      );
      assert.equal(result.outcome, 'blocked');
      assert.equal(result.requestBuilt, false);
      assert.equal(result.executorInvoked, false);
      assert.equal(result.authorizationConsumed, false);
      assert.equal(result.downloadStarted, false);
      assert.equal(result.modelActive, false);
    }
    assert.equal(calls.calls, 0);
  });

  it('blocks authorized scope mismatch or current-facts failure before invoking executor', async () => {
    const { input, session } = authorizedFixture();
    const calls = { calls: 0 };
    const accepting = executor('available', acceptedResponse, calls);
    const changedScope = {
      ...input,
      scope: { ...input.scope, artifactCandidateId: 'different-artifact' },
    };
    const blockedFacts = {
      ...input,
      preflight: evaluateLocalModelAcquisitionPreflight({
        ...syntheticPreflightInput(),
        confirmationStatus: 'confirmed',
        connectionKind: 'cellular',
      }),
    };

    for (const currentAuthorizationInput of [changedScope, blockedFacts]) {
      const result = await executeLocalModelAcquisitionHandoff(
        { authorizationSession: session, currentAuthorizationInput },
        accepting,
      );
      assert.equal(result.outcome, 'blocked');
      assert.equal(result.executorInvoked, false);
      assert.equal(result.authorizationConsumed, false);
    }
    assert.equal(calls.calls, 0);
  });

  it('builds a normalized request containing scope metadata and no URL, checksum, UA, content, timestamp, or token', () => {
    const { input, session } = authorizedFixture();
    const before = JSON.stringify({ input, session });
    const request = buildLocalModelAcquisitionExecutionRequest({
      authorizationSession: session,
      currentAuthorizationInput: input,
    });

    assert.ok(request);
    assert.equal(request.candidateId, 'synthetic-light-candidate');
    assert.equal(request.candidateTier, 'light');
    assert.equal(request.artifactCandidateId, 'synthetic-light-artifact');
    assert.equal(request.estimatedDownloadSizeMb, 640);
    assert.equal(request.expectedStorageImpactMb, 700);
    assert.equal(request.disclosureRevision, 1);
    assert.equal(request.authorizationPolicyRevision, 1);
    assert.equal(request.executionBoundaryRevision, LOCAL_MODEL_ACQUISITION_EXECUTION_BOUNDARY_REVISION);
    assert.equal(request.accessTier, 'pro');
    assert.equal(request.assignedDeviceTier, 'light');
    assert.equal(request.benchmarkStatus, 'passed');
    assert.equal(request.oneAttemptOnly, true);
    const serialized = JSON.stringify(request);
    assert.doesNotMatch(serialized, /url|checksum|userAgent|transcript|writing|learnerMemory|timestamp|token/i);
    assert.equal(JSON.stringify({ input, session }), before);
  });

  it('uses an unavailable-safe production executor without consuming authorization', async () => {
    const productionExecutor = createUnavailableLocalModelAcquisitionExecutor();
    const { input, session } = authorizedFixture();
    const request = buildLocalModelAcquisitionExecutionRequest({
      authorizationSession: session,
      currentAuthorizationInput: input,
    });
    assert.ok(request);
    assert.equal(productionExecutor.availability, 'unavailable');
    const directResponse = await productionExecutor.acceptHandoff(request);
    assert.deepEqual(directResponse, unavailableResponse);

    const result = await executeLocalModelAcquisitionHandoff(
      { authorizationSession: session, currentAuthorizationInput: input },
      productionExecutor,
    );
    assert.equal(result.outcome, 'executor-unavailable');
    assert.equal(result.requestBuilt, true);
    assert.equal(result.executorInvoked, false);
    assert.equal(result.authorizationConsumed, false);
    assert.equal(result.resultingAuthorizationSession.state, 'authorized');
  });

  it('does not consume authorization when executor rejects or throws and hides raw exceptions', async () => {
    const { input, session } = authorizedFixture();
    const rejected = await executeLocalModelAcquisitionHandoff(
      { authorizationSession: session, currentAuthorizationInput: input },
      executor('available', rejectedResponse),
    );
    assert.equal(rejected.outcome, 'rejected');
    assert.equal(rejected.executorInvoked, true);
    assert.equal(rejected.authorizationConsumed, false);
    assert.equal(rejected.resultingAuthorizationSession.state, 'authorized');

    const failed = await executeLocalModelAcquisitionHandoff(
      { authorizationSession: session, currentAuthorizationInput: input },
      executor('available', async () => {
        throw new Error('secret executor failure detail');
      }),
    );
    assert.equal(failed.outcome, 'failed');
    assert.equal(failed.authorizationConsumed, false);
    assert.equal(failed.resultingAuthorizationSession.state, 'authorized');
    assert.doesNotMatch(JSON.stringify(failed), /secret executor failure detail/);
  });

  it('accepts exactly one contract handoff, consumes via Phase 4.9 policy, and never claims execution', async () => {
    const { input, session } = authorizedFixture();
    const calls = { calls: 0 };
    const accepting = executor('available', acceptedResponse, calls);
    const original = JSON.stringify(session);
    const accepted = await executeLocalModelAcquisitionHandoff(
      { authorizationSession: session, currentAuthorizationInput: input },
      accepting,
    );

    assert.equal(calls.calls, 1);
    assert.equal(accepted.outcome, 'handoff-accepted');
    assert.equal(accepted.requestBuilt, true);
    assert.equal(accepted.executorInvoked, true);
    assert.equal(accepted.executorAcceptedHandoff, true);
    assert.equal(accepted.authorizationConsumed, true);
    assert.equal(accepted.resultingAuthorizationSession.state, 'consumed');
    assert.equal(accepted.resultingAuthorizationSession.futureExecutorHandoffAllowed, false);
    assert.equal(accepted.networkUsed, false);
    assert.equal(accepted.downloadStarted, false);
    assert.equal(accepted.downloadCompleted, false);
    assert.equal(accepted.cacheWritten, false);
    assert.equal(accepted.checksumVerified, false);
    assert.equal(accepted.runtimeInitialized, false);
    assert.equal(accepted.modelReady, false);
    assert.equal(accepted.modelActive, false);
    assert.equal(accepted.generatedOutputProduced, false);
    assert.equal(JSON.stringify(session), original);

    const second = await executeLocalModelAcquisitionHandoff(
      {
        authorizationSession: accepted.resultingAuthorizationSession,
        currentAuthorizationInput: input,
      },
      accepting,
    );
    assert.equal(second.outcome, 'blocked');
    assert.equal(second.executorInvoked, false);
    assert.equal(calls.calls, 1);
  });

  it('normalizes malformed and contradictory executor responses safely', async () => {
    const { input, session } = authorizedFixture();
    const malformed = executor('available', {
      outcome: 'handoff-accepted',
      requestAccepted: false,
      executorAvailable: true,
      reasons: ['contradictory-response'],
      warnings: [],
    });
    const contradictoryUnavailable = executor('available', {
      outcome: 'handoff-accepted',
      requestAccepted: true,
      executorAvailable: false,
      reasons: [],
      warnings: [],
    });
    const unknown = executor('available', {
      outcome: 'mystery' as LocalModelAcquisitionExecutorResponse['outcome'],
      requestAccepted: true,
      executorAvailable: true,
      reasons: [],
      warnings: [],
    });

    const results = await Promise.all([
      executeLocalModelAcquisitionHandoff({ authorizationSession: session, currentAuthorizationInput: input }, malformed),
      executeLocalModelAcquisitionHandoff({ authorizationSession: session, currentAuthorizationInput: input }, contradictoryUnavailable),
      executeLocalModelAcquisitionHandoff({ authorizationSession: session, currentAuthorizationInput: input }, unknown),
    ]);
    assert.deepEqual(results.map((result) => result.outcome), ['rejected', 'executor-unavailable', 'failed']);
    assert.ok(results.every((result) => result.authorizationConsumed === false));
    assert.ok(results.every((result) => result.executorAcceptedHandoff === false));
  });

  it('keeps reasons deterministic and unique', async () => {
    const { input, session } = authorizedFixture();
    const result = await executeLocalModelAcquisitionHandoff(
      { authorizationSession: session, currentAuthorizationInput: input },
      executor('available', {
        outcome: 'rejected',
        requestAccepted: false,
        executorAvailable: true,
        reasons: ['same', 'same'],
        warnings: ['warn', 'warn'],
      }),
    );
    assert.deepEqual(result.reasons, [...new Set(result.reasons)]);
    assert.deepEqual(result.warnings, [...new Set(result.warnings)]);
    const repeated = await executeLocalModelAcquisitionHandoff(
      { authorizationSession: session, currentAuthorizationInput: input },
      executor('available', rejectedResponse),
    );
    assert.deepEqual(repeated.reasons, rejectedResponse.reasons);
  });
});
