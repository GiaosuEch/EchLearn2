import {
  evaluateLocalModelAcquisitionPreflight,
} from './localModelAcquisitionPreflight.ts';
import type {
  LocalModelAcquisitionConfirmationStatus,
  LocalModelAcquisitionPreflightInput,
  LocalModelAcquisitionPreflightResult,
} from './localModelAcquisitionTypes.ts';
import type {
  BuildLocalModelAcquisitionDisclosureInput,
  LocalModelAcquisitionConsentEvent,
  LocalModelAcquisitionConsentPolicyInput,
  LocalModelAcquisitionConsentScope,
  LocalModelAcquisitionConsentSession,
  LocalModelAcquisitionConsentState,
  LocalModelAcquisitionDisclosure,
  LocalModelAcquisitionDisclosureFieldId,
} from './localModelAcquisitionConsentTypes.ts';

export const LOCAL_MODEL_ACQUISITION_DISCLOSURE_REVISION = 1 as const;

function appendUnique<T>(items: T[], value: T): void {
  if (!items.includes(value)) items.push(value);
}

function hasText(value: string | null): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveFinite(value: number | null): boolean {
  return value !== null && Number.isFinite(value) && value > 0;
}

function isValidRevision(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

function scopeFromDisclosure(
  disclosure: LocalModelAcquisitionDisclosure,
): LocalModelAcquisitionConsentScope {
  return {
    candidateId: disclosure.candidateId,
    candidateTier: disclosure.candidateTier,
    artifactCandidateId: disclosure.artifactCandidateId,
    estimatedDownloadSizeMb: disclosure.estimatedDownloadSizeMb,
    expectedStorageImpactMb: disclosure.expectedStorageImpactMb,
    disclosureRevision: disclosure.disclosureRevision,
  };
}

export function buildLocalModelAcquisitionDisclosure(
  input: BuildLocalModelAcquisitionDisclosureInput,
): LocalModelAcquisitionDisclosure {
  const disclosureRevision = input.disclosureRevision
    ?? LOCAL_MODEL_ACQUISITION_DISCLOSURE_REVISION;
  const missingDisclosureFields: LocalModelAcquisitionDisclosureFieldId[] = [];

  if (!hasText(input.candidateId)) appendUnique(missingDisclosureFields, 'candidate-id');
  if (input.candidateTier === null) appendUnique(missingDisclosureFields, 'candidate-tier');
  if (!hasText(input.artifactCandidateId)) appendUnique(missingDisclosureFields, 'artifact-candidate-id');
  if (!hasText(input.modelClassLabel)) appendUnique(missingDisclosureFields, 'model-class-label');
  if (!isPositiveFinite(input.estimatedDownloadSizeMb)) {
    appendUnique(missingDisclosureFields, 'estimated-download-size');
  }
  if (!isPositiveFinite(input.expectedStorageImpactMb)) {
    appendUnique(missingDisclosureFields, 'expected-storage-impact');
  }
  if (!hasText(input.connectionRequirement)) appendUnique(missingDisclosureFields, 'connection-requirement');
  if (!hasText(input.batteryRequirement)) appendUnique(missingDisclosureFields, 'battery-requirement');
  if (!hasText(input.localProcessingStatement)) appendUnique(missingDisclosureFields, 'local-processing-statement');
  if (!hasText(input.cloudProcessingStatement)) appendUnique(missingDisclosureFields, 'cloud-processing-statement');
  if (!hasText(input.cacheRemovalStatement)) appendUnique(missingDisclosureFields, 'cache-removal-statement');
  if (!hasText(input.confirmationMeaning)) appendUnique(missingDisclosureFields, 'confirmation-meaning');
  if (!isValidRevision(disclosureRevision)) appendUnique(missingDisclosureFields, 'disclosure-revision');

  return {
    candidateId: input.candidateId,
    candidateTier: input.candidateTier,
    artifactCandidateId: input.artifactCandidateId,
    modelClassLabel: input.modelClassLabel,
    estimatedDownloadSizeMb: input.estimatedDownloadSizeMb,
    expectedStorageImpactMb: input.expectedStorageImpactMb,
    connectionRequirement: input.connectionRequirement,
    batteryRequirement: input.batteryRequirement,
    localProcessingStatement: input.localProcessingStatement,
    cloudProcessingStatement: input.cloudProcessingStatement,
    cacheRemovalStatement: input.cacheRemovalStatement,
    confirmationMeaning: input.confirmationMeaning,
    disclosureRevision,
    disclosureComplete: missingDisclosureFields.length === 0,
    missingDisclosureFields,
    policyOnly: true,
    downloadStarted: false,
    modelActive: false,
  };
}

export function isSameLocalModelAcquisitionConsentScope(
  left: LocalModelAcquisitionConsentScope,
  right: LocalModelAcquisitionConsentScope,
): boolean {
  return left.candidateId === right.candidateId
    && left.candidateTier === right.candidateTier
    && left.artifactCandidateId === right.artifactCandidateId
    && left.estimatedDownloadSizeMb === right.estimatedDownloadSizeMb
    && left.expectedStorageImpactMb === right.expectedStorageImpactMb
    && left.disclosureRevision === right.disclosureRevision;
}

export function mapConsentStateToPreflightConfirmationStatus(
  session: Pick<LocalModelAcquisitionConsentSession, 'state'>,
): LocalModelAcquisitionConfirmationStatus {
  if (session.state === 'confirmed') return 'confirmed';
  if (session.state === 'declined') return 'declined';
  return 'not-requested';
}

function buildSession(
  state: LocalModelAcquisitionConsentState,
  input: LocalModelAcquisitionConsentPolicyInput,
  reasons: readonly string[],
  warnings: readonly string[] = [],
): LocalModelAcquisitionConsentSession {
  const confirmationStatusForPreflight = state === 'confirmed'
    ? 'confirmed'
    : state === 'declined'
      ? 'declined'
      : 'not-requested';
  const consentRecorded = state === 'confirmed' || state === 'declined';
  const consentValidForCurrentScope = consentRecorded;

  return {
    state,
    scope: scopeFromDisclosure(input.disclosure),
    disclosure: input.disclosure,
    confirmationStatusForPreflight,
    canConfirm: state === 'awaiting-user-decision',
    canDecline: state === 'awaiting-user-decision',
    canReset: state === 'confirmed' || state === 'declined' || state === 'invalidated',
    consentRecorded,
    consentValidForCurrentScope,
    reasons: [...reasons],
    warnings: [...warnings],
    policyOnly: true,
    downloadAuthorizedForExecution: false,
    downloadStarted: false,
    cacheWritten: false,
    runtimeInitialized: false,
    modelReady: false,
    modelActive: false,
  };
}

function initialReasons(input: LocalModelAcquisitionConsentPolicyInput): string[] {
  const reasons: string[] = [];

  if (
    input.preflight.status !== 'awaiting-user-confirmation'
    || !input.preflight.canOfferUserConfirmation
  ) {
    appendUnique(reasons, 'preflight-not-awaiting-user-confirmation');
    for (const blocker of input.preflight.blockers) {
      appendUnique(reasons, `preflight-blocker:${blocker}`);
    }
  }

  if (!input.disclosure.disclosureComplete) {
    appendUnique(reasons, 'disclosure-incomplete');
    for (const field of input.disclosure.missingDisclosureFields) {
      appendUnique(reasons, `missing-disclosure:${field}`);
    }
  }

  return reasons;
}

export function createLocalModelAcquisitionConsentSession(
  input: LocalModelAcquisitionConsentPolicyInput,
): LocalModelAcquisitionConsentSession {
  const reasons = initialReasons(input);
  const eligible = input.preflight.status === 'awaiting-user-confirmation'
    && input.preflight.canOfferUserConfirmation
    && input.disclosure.disclosureComplete;

  return buildSession(
    eligible ? 'awaiting-user-decision' : 'unavailable',
    input,
    reasons,
  );
}

export function reconcileLocalModelAcquisitionConsentSession(
  session: LocalModelAcquisitionConsentSession,
  currentInput: LocalModelAcquisitionConsentPolicyInput,
): LocalModelAcquisitionConsentSession {
  const currentScope = scopeFromDisclosure(currentInput.disclosure);
  const scopeMatches = isSameLocalModelAcquisitionConsentScope(session.scope, currentScope);

  if (!scopeMatches) {
    return buildSession('invalidated', currentInput, ['scope-changed']);
  }

  const currentEligible = currentInput.preflight.status === 'awaiting-user-confirmation'
    && currentInput.preflight.canOfferUserConfirmation
    && currentInput.disclosure.disclosureComplete;

  if (!currentEligible) {
    if (session.consentRecorded || session.state === 'invalidated') {
      return buildSession('invalidated', currentInput, [
        'preflight-or-disclosure-no-longer-eligible',
        ...initialReasons(currentInput),
      ]);
    }
    return createLocalModelAcquisitionConsentSession(currentInput);
  }

  if (session.state === 'unavailable') {
    return createLocalModelAcquisitionConsentSession(currentInput);
  }

  if (session.state === 'invalidated') {
    return buildSession('invalidated', currentInput, session.reasons);
  }

  return buildSession(session.state, currentInput, session.reasons, session.warnings);
}

export function applyLocalModelAcquisitionConsentEvent(
  session: LocalModelAcquisitionConsentSession,
  event: LocalModelAcquisitionConsentEvent,
  currentInput: LocalModelAcquisitionConsentPolicyInput,
): LocalModelAcquisitionConsentSession {
  if (event.type === 'reset') {
    return createLocalModelAcquisitionConsentSession(currentInput);
  }

  if (event.type === 'scope-changed') {
    const currentScope = scopeFromDisclosure(currentInput.disclosure);
    if (
      !isSameLocalModelAcquisitionConsentScope(session.scope, event.scope)
      || !isSameLocalModelAcquisitionConsentScope(event.scope, currentScope)
    ) {
      return buildSession('invalidated', currentInput, ['scope-changed']);
    }
    return reconcileLocalModelAcquisitionConsentSession(session, currentInput);
  }

  const reconciled = reconcileLocalModelAcquisitionConsentSession(session, currentInput);

  if (event.type === 'confirm') {
    if (reconciled.state !== 'awaiting-user-decision') {
      return buildSession(
        reconciled.state,
        currentInput,
        [...reconciled.reasons, 'confirm-not-available'],
        reconciled.warnings,
      );
    }
    return buildSession('confirmed', currentInput, ['explicit-confirmation-recorded']);
  }

  if (reconciled.state !== 'awaiting-user-decision') {
    return buildSession(
      reconciled.state,
      currentInput,
      [...reconciled.reasons, 'decline-not-available'],
      reconciled.warnings,
    );
  }

  return buildSession('declined', currentInput, ['explicit-decline-recorded']);
}

export function rebuildLocalModelAcquisitionPreflightWithConsent(
  input: LocalModelAcquisitionPreflightInput,
  session: LocalModelAcquisitionConsentSession,
  currentConsentInput: LocalModelAcquisitionConsentPolicyInput,
): LocalModelAcquisitionPreflightResult {
  const reconciledSession = reconcileLocalModelAcquisitionConsentSession(
    session,
    currentConsentInput,
  );

  return evaluateLocalModelAcquisitionPreflight({
    ...input,
    confirmationStatus: mapConsentStateToPreflightConfirmationStatus(reconciledSession),
  });
}
