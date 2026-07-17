import type { LocalModelAcquisitionConsentScope } from './localModelAcquisitionConsentTypes.ts';
import type {
  BuildLocalModelAcquisitionAuthorizationScopeInput,
  LocalModelAcquisitionAuthorizationEvent,
  LocalModelAcquisitionAuthorizationPolicyInput,
  LocalModelAcquisitionAuthorizationScope,
  LocalModelAcquisitionAuthorizationSession,
  LocalModelAcquisitionAuthorizationState,
} from './localModelAcquisitionAuthorizationTypes.ts';

export const LOCAL_MODEL_ACQUISITION_AUTHORIZATION_POLICY_REVISION = 1 as const;

function appendUnique<T>(items: T[], value: T): void {
  if (!items.includes(value)) items.push(value);
}

function hasText(value: string | null): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveFinite(value: number | null): boolean {
  return value !== null && Number.isFinite(value) && value > 0;
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

export function buildLocalModelAcquisitionAuthorizationScope(
  input: BuildLocalModelAcquisitionAuthorizationScopeInput,
): LocalModelAcquisitionAuthorizationScope {
  return {
    candidateId: input.candidateId,
    candidateTier: input.candidateTier,
    artifactCandidateId: input.artifactCandidateId,
    estimatedDownloadSizeMb: input.estimatedDownloadSizeMb,
    expectedStorageImpactMb: input.expectedStorageImpactMb,
    disclosureRevision: input.disclosureRevision,
    authorizationPolicyRevision: input.authorizationPolicyRevision
      ?? LOCAL_MODEL_ACQUISITION_AUTHORIZATION_POLICY_REVISION,
    accessTier: input.accessTier,
    assignedDeviceTier: input.assignedDeviceTier,
    benchmarkStatus: input.benchmarkStatus,
    webGpuStatus: input.webGpuStatus,
    connectionKind: input.connectionKind,
    batterySafety: input.batterySafety,
    thermalStatus: input.thermalStatus,
    storageQuotaStatus: input.storageQuotaStatus,
  };
}

export function isSameLocalModelAcquisitionAuthorizationScope(
  left: LocalModelAcquisitionAuthorizationScope,
  right: LocalModelAcquisitionAuthorizationScope,
): boolean {
  return left.candidateId === right.candidateId
    && left.candidateTier === right.candidateTier
    && left.artifactCandidateId === right.artifactCandidateId
    && left.estimatedDownloadSizeMb === right.estimatedDownloadSizeMb
    && left.expectedStorageImpactMb === right.expectedStorageImpactMb
    && left.disclosureRevision === right.disclosureRevision
    && left.authorizationPolicyRevision === right.authorizationPolicyRevision
    && left.accessTier === right.accessTier
    && left.assignedDeviceTier === right.assignedDeviceTier
    && left.benchmarkStatus === right.benchmarkStatus
    && left.webGpuStatus === right.webGpuStatus
    && left.connectionKind === right.connectionKind
    && left.batterySafety === right.batterySafety
    && left.thermalStatus === right.thermalStatus
    && left.storageQuotaStatus === right.storageQuotaStatus;
}

function scopeMatchesConsent(
  authorizationScope: LocalModelAcquisitionAuthorizationScope,
  consentScope: LocalModelAcquisitionConsentScope,
): boolean {
  return authorizationScope.candidateId === consentScope.candidateId
    && authorizationScope.candidateTier === consentScope.candidateTier
    && authorizationScope.artifactCandidateId === consentScope.artifactCandidateId
    && authorizationScope.estimatedDownloadSizeMb === consentScope.estimatedDownloadSizeMb
    && authorizationScope.expectedStorageImpactMb === consentScope.expectedStorageImpactMb
    && authorizationScope.disclosureRevision === consentScope.disclosureRevision;
}

function eligibilityReasons(
  input: LocalModelAcquisitionAuthorizationPolicyInput,
): string[] {
  const reasons: string[] = [];

  if (input.preflight.status !== 'preflight-passed') {
    appendUnique(reasons, 'final-preflight-not-passed');
  }
  if (!input.preflight.canPlanFutureAcquisition) {
    appendUnique(reasons, 'future-acquisition-not-plannable');
  }
  for (const blocker of input.preflight.blockers) {
    appendUnique(reasons, `preflight-blocker:${blocker}`);
  }

  if (input.consent.state !== 'confirmed') appendUnique(reasons, 'consent-not-confirmed');
  if (!input.consent.consentRecorded) appendUnique(reasons, 'consent-not-recorded');
  if (!input.consent.consentValidForCurrentScope) {
    appendUnique(reasons, 'consent-invalid-for-current-scope');
  }
  if (input.consent.confirmationStatusForPreflight !== 'confirmed') {
    appendUnique(reasons, 'consent-confirmation-not-confirmed');
  }
  if (!input.consent.disclosure.disclosureComplete) {
    appendUnique(reasons, 'disclosure-incomplete');
  }
  if (!scopeMatchesConsent(input.scope, input.consent.scope)) {
    appendUnique(reasons, 'consent-scope-mismatch');
  }

  if (!hasText(input.scope.candidateId)) appendUnique(reasons, 'candidate-id-missing');
  if (input.scope.candidateTier === null) appendUnique(reasons, 'candidate-tier-missing');
  if (!hasText(input.scope.artifactCandidateId)) appendUnique(reasons, 'artifact-candidate-id-missing');
  if (!isPositiveFinite(input.scope.estimatedDownloadSizeMb)) {
    appendUnique(reasons, 'artifact-size-invalid');
  }
  if (!isPositiveFinite(input.scope.expectedStorageImpactMb)) {
    appendUnique(reasons, 'storage-impact-invalid');
  }
  if (!isPositiveInteger(input.scope.disclosureRevision)) {
    appendUnique(reasons, 'disclosure-revision-invalid');
  }
  if (!isPositiveInteger(input.scope.authorizationPolicyRevision)) {
    appendUnique(reasons, 'authorization-policy-revision-invalid');
  }
  if (input.scope.assignedDeviceTier === 'ultra-low') {
    appendUnique(reasons, 'device-tier-not-authorizable');
  }
  if (input.scope.benchmarkStatus !== 'passed') appendUnique(reasons, 'benchmark-not-passed');
  if (input.scope.webGpuStatus !== 'supported') appendUnique(reasons, 'webgpu-not-supported');
  if (input.scope.connectionKind !== 'wifi') appendUnique(reasons, 'connection-not-wifi');
  if (input.scope.batterySafety !== 'safe') appendUnique(reasons, 'battery-not-safe');
  if (input.scope.thermalStatus === 'hot') {
    appendUnique(reasons, 'thermal-not-safe');
  }
  if (input.scope.storageQuotaStatus !== 'sufficient') {
    appendUnique(reasons, 'storage-not-sufficient');
  }

  return reasons;
}

function buildSession(
  state: LocalModelAcquisitionAuthorizationState,
  input: LocalModelAcquisitionAuthorizationPolicyInput,
  reasons: readonly string[],
  warnings: readonly string[] = input.preflight.warnings ?? [],
): LocalModelAcquisitionAuthorizationSession {
  const authorizationGranted = state === 'authorized';
  const authorizationConsumed = state === 'consumed';
  const actionRequestRecorded = state === 'authorized'
    || state === 'cancelled'
    || state === 'consumed';
  const authorizationValidForCurrentScope = state !== 'unavailable'
    && state !== 'invalidated';

  return {
    state,
    scope: input.scope,
    actionRequestRecorded,
    authorizationGranted,
    authorizationValidForCurrentScope,
    authorizationConsumed,
    canRequestAuthorization: state === 'awaiting-action-request',
    canCancel: state === 'authorized',
    canReset: state === 'authorized'
      || state === 'cancelled'
      || state === 'invalidated'
      || state === 'consumed',
    canConsume: state === 'authorized',
    reasons: [...new Set(reasons)],
    warnings: [...new Set(warnings)],
    policyOnly: true,
    oneAttemptOnly: true,
    futureExecutorHandoffAllowed: authorizationGranted,
    downloadStarted: false,
    downloadCompleted: false,
    cacheWritten: false,
    runtimeInitialized: false,
    modelReady: false,
    modelActive: false,
    generatedOutputProduced: false,
  };
}

export function createLocalModelAcquisitionAuthorizationSession(
  input: LocalModelAcquisitionAuthorizationPolicyInput,
): LocalModelAcquisitionAuthorizationSession {
  const reasons = eligibilityReasons(input);
  return buildSession(
    reasons.length === 0 ? 'awaiting-action-request' : 'unavailable',
    input,
    reasons,
  );
}

export function revalidateLocalModelAcquisitionAuthorization(
  session: LocalModelAcquisitionAuthorizationSession,
  currentInput: LocalModelAcquisitionAuthorizationPolicyInput,
): LocalModelAcquisitionAuthorizationSession {
  const scopeMatches = isSameLocalModelAcquisitionAuthorizationScope(
    session.scope,
    currentInput.scope,
  );
  const reasons = eligibilityReasons(currentInput);

  if (!scopeMatches) {
    return buildSession('invalidated', currentInput, ['authorization-scope-changed']);
  }

  if (reasons.length > 0) {
    if (session.state === 'unavailable') {
      return buildSession('unavailable', currentInput, reasons);
    }
    return buildSession('invalidated', currentInput, [
      'authorization-current-facts-no-longer-eligible',
      ...reasons,
    ]);
  }

  if (session.state === 'unavailable') {
    return createLocalModelAcquisitionAuthorizationSession(currentInput);
  }
  if (session.state === 'invalidated') {
    return buildSession('invalidated', currentInput, session.reasons, session.warnings);
  }

  return buildSession(session.state, currentInput, session.reasons, session.warnings);
}

export function applyLocalModelAcquisitionAuthorizationEvent(
  session: LocalModelAcquisitionAuthorizationSession,
  event: LocalModelAcquisitionAuthorizationEvent,
  currentInput: LocalModelAcquisitionAuthorizationPolicyInput,
): LocalModelAcquisitionAuthorizationSession {
  if (event.type === 'reset') {
    return createLocalModelAcquisitionAuthorizationSession(currentInput);
  }

  if (event.type === 'scope-changed') {
    if (
      !isSameLocalModelAcquisitionAuthorizationScope(session.scope, event.scope)
      || !isSameLocalModelAcquisitionAuthorizationScope(event.scope, currentInput.scope)
    ) {
      return buildSession('invalidated', currentInput, ['authorization-scope-changed']);
    }
    return revalidateLocalModelAcquisitionAuthorization(session, currentInput);
  }

  const reconciled = revalidateLocalModelAcquisitionAuthorization(session, currentInput);

  if (event.type === 'current-facts-changed') return reconciled;

  if (event.type === 'request-authorization') {
    if (
      session.state !== 'awaiting-action-request'
      || reconciled.state !== 'awaiting-action-request'
    ) {
      return buildSession(
        reconciled.state,
        currentInput,
        [...reconciled.reasons, 'authorization-request-not-available'],
        reconciled.warnings,
      );
    }
    return buildSession('authorized', currentInput, ['explicit-action-request-authorized']);
  }

  if (event.type === 'cancel') {
    if (session.state !== 'authorized' || reconciled.state !== 'authorized') {
      return buildSession(
        reconciled.state,
        currentInput,
        [...reconciled.reasons, 'authorization-cancel-not-available'],
        reconciled.warnings,
      );
    }
    return buildSession('cancelled', currentInput, ['authorization-cancelled']);
  }

  if (
    reconciled.state !== 'authorized'
    || !reconciled.authorizationValidForCurrentScope
    || !reconciled.futureExecutorHandoffAllowed
  ) {
    return buildSession(
      reconciled.state,
      currentInput,
      [...reconciled.reasons, 'authorization-consume-not-available'],
      reconciled.warnings,
    );
  }

  return buildSession('consumed', currentInput, ['one-attempt-authorization-consumed']);
}
