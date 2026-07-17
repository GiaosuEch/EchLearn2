import { LOCAL_MODEL_APPROVAL_REGISTRY } from './localModelApprovalRegistry.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from './localModelArtifactManifest.ts';
import {
  buildLocalModelAcquisitionViewModel,
} from './localModelAcquisitionViewModel.ts';
import type {
  BuildLocalModelAcquisitionViewModelOptions,
  LocalModelAcquisitionCandidateViewModel,
  LocalModelAcquisitionViewModel,
} from './localModelAcquisitionViewModel.ts';
import {
  evaluateLocalModelAcquisitionPreflight,
} from './localModelAcquisitionPreflight.ts';
import type { LocalRuntimeCapabilityResult } from './localRuntimeCapabilityTypes.ts';
import type { AIFeatureId } from './aiFeatureRegistry.ts';
import {
  applyLocalModelAcquisitionConsentEvent,
  buildLocalModelAcquisitionDisclosure,
  createLocalModelAcquisitionConsentSession,
  mapConsentStateToPreflightConfirmationStatus,
  rebuildLocalModelAcquisitionPreflightWithConsent,
  reconcileLocalModelAcquisitionConsentSession,
} from './localModelAcquisitionConsentPolicy.ts';
import type {
  BuildLocalModelAcquisitionConsentDecisionViewModelInput,
  LocalModelAcquisitionConsentPolicyInput,
  LocalModelAcquisitionConsentSession,
  LocalModelAcquisitionConsentState,
} from './localModelAcquisitionConsentTypes.ts';

export interface BuildLocalModelAcquisitionConsentViewModelOptions
  extends Omit<BuildLocalModelAcquisitionViewModelOptions, 'confirmationStatusByCandidateId'> {
  readonly consentSessionsByCandidateId?: Readonly<Record<string, LocalModelAcquisitionConsentSession>>;
}

export interface LocalModelAcquisitionConsentCandidateViewModel {
  readonly candidateId: string;
  readonly candidateTier: LocalModelAcquisitionCandidateViewModel['candidateTier'];
  readonly artifactCandidateId: string | null;
  readonly modelClassLabel: string;
  readonly state: LocalModelAcquisitionConsentState;
  readonly statusLabel: string;
  readonly disclosureComplete: boolean;
  readonly canConfirm: boolean;
  readonly canDecline: boolean;
  readonly canReset: boolean;
  readonly consentRecorded: boolean;
  readonly finalPreflightStatus: LocalModelAcquisitionCandidateViewModel['status'];
  readonly reasons: readonly string[];
  readonly session: LocalModelAcquisitionConsentSession;
  readonly sessionInput: LocalModelAcquisitionConsentPolicyInput;
  readonly downloadStarted: false;
  readonly modelActive: false;
}

export interface LocalModelAcquisitionConsentViewModel {
  readonly heading: 'Explicit Local Model Acquisition Consent';
  readonly scopeSummary: 'Consent is candidate-specific';
  readonly availabilitySummary: 'Consent unavailable until all prerequisites pass';
  readonly decisionSummary: 'No consent recorded';
  readonly downloadStateSummary: 'No download started';
  readonly cacheStateSummary: 'No cache written';
  readonly modelStateSummary: 'No model active';
  readonly governanceSummary: 'Confirmation does not bypass approval or benchmark';
  readonly coreAppSummary: 'Core app remains available';
  readonly fallbackSummary: 'Deterministic fallback remains available';
  readonly documentPath: 'docs/ai/phase-4-local-model-acquisition-consent.md';
  readonly candidates: readonly LocalModelAcquisitionConsentCandidateViewModel[];
  readonly aggregate: {
    readonly totalCandidates: number;
    readonly consentAvailableCandidates: number;
    readonly awaitingDecisionCandidates: number;
    readonly confirmedCandidates: number;
    readonly declinedCandidates: number;
    readonly invalidatedCandidates: number;
    readonly downloadStartedCandidates: 0;
    readonly activeModels: 0;
  };
  readonly preflightViewModel: LocalModelAcquisitionViewModel;
  readonly candidateDeviceTier: LocalModelAcquisitionViewModel['candidateDeviceTier'];
  readonly featureAvailability: 'full-ui';
  readonly visibleFeatureIds: readonly AIFeatureId[];
  readonly canAttempt4B: false;
  readonly policyOnly: true;
  readonly modelActive: false;
}

export interface LocalModelAcquisitionConsentDecisionViewModel {
  readonly session: LocalModelAcquisitionConsentSession;
  readonly finalPreflight: ReturnType<typeof evaluateLocalModelAcquisitionPreflight>;
  readonly policyOnly: true;
  readonly downloadAuthorizedForExecution: false;
  readonly downloadStarted: false;
  readonly cacheWritten: false;
  readonly runtimeInitialized: false;
  readonly modelReady: false;
  readonly modelActive: false;
}

const DISCLOSURE_TEXT = {
  connectionRequirement: 'Wi-Fi is required before a future acquisition attempt can be considered.',
  batteryRequirement: 'Battery and thermal safety gates must remain satisfied.',
  localProcessingStatement: 'An approved local runtime would process supported tasks on this device.',
  cloudProcessingStatement: 'This consent does not authorize cloud inference or a network action.',
  cacheRemovalStatement: 'A future artifact lifecycle must provide user-controlled cache removal.',
  confirmationMeaning: 'Confirmation supplies one candidate-specific input to Phase 4.7 and does not authorize execution.',
} as const;

function statusLabel(state: LocalModelAcquisitionConsentState): string {
  if (state === 'awaiting-user-decision') return 'Awaiting explicit user decision';
  if (state === 'confirmed') return 'Explicitly confirmed for this scope';
  if (state === 'declined') return 'Explicitly declined for this scope';
  if (state === 'invalidated') return 'Previous decision invalidated';
  return 'Consent unavailable';
}

function buildPolicyInput(
  candidate: LocalModelAcquisitionCandidateViewModel,
): LocalModelAcquisitionConsentPolicyInput {
  const approvalCandidate = LOCAL_MODEL_APPROVAL_REGISTRY.find(
    (item) => item.candidateId === candidate.candidateId,
  );
  const artifact = LOCAL_MODEL_ARTIFACT_MANIFEST.find(
    (item) => item.candidateId === candidate.candidateId,
  );
  const disclosure = buildLocalModelAcquisitionDisclosure({
    candidateId: candidate.candidateId,
    candidateTier: candidate.candidateTier,
    artifactCandidateId: artifact?.artifactId ?? null,
    modelClassLabel: approvalCandidate?.parameterScaleLabel ?? null,
    estimatedDownloadSizeMb: artifact?.estimatedDownloadSizeMb ?? null,
    expectedStorageImpactMb: artifact?.estimatedInstalledSizeMb ?? null,
    ...DISCLOSURE_TEXT,
  });

  return {
    preflight: {
      status: candidate.status,
      blockers: candidate.blockers,
      canOfferUserConfirmation: candidate.canOfferUserConfirmation,
    },
    disclosure,
  };
}

function hasRecordedDecision(
  sessions: readonly LocalModelAcquisitionConsentSession[],
): boolean {
  return sessions.some(
    (session) => mapConsentStateToPreflightConfirmationStatus(session) !== 'not-requested',
  );
}

export function buildLocalModelAcquisitionConsentViewModel(
  runtimeCapability: LocalRuntimeCapabilityResult,
  options: BuildLocalModelAcquisitionConsentViewModelOptions = {},
): LocalModelAcquisitionConsentViewModel {
  const basePreflightViewModel = buildLocalModelAcquisitionViewModel(runtimeCapability, {
    accessTier: options.accessTier,
    benchmarkStatusByModelTier: options.benchmarkStatusByModelTier,
  });

  const prepared = basePreflightViewModel.candidates.map((candidate) => {
    const sessionInput = buildPolicyInput(candidate);
    const previous = options.consentSessionsByCandidateId?.[candidate.candidateId];
    const session = previous
      ? reconcileLocalModelAcquisitionConsentSession(previous, sessionInput)
      : createLocalModelAcquisitionConsentSession(sessionInput);

    return { candidate, sessionInput, session };
  });

  const confirmationStatusByCandidateId = Object.fromEntries(
    prepared.map(({ candidate, session }) => [
      candidate.candidateId,
      mapConsentStateToPreflightConfirmationStatus(session),
    ]),
  );

  const preflightViewModel = hasRecordedDecision(prepared.map((item) => item.session))
    ? buildLocalModelAcquisitionViewModel(runtimeCapability, {
        accessTier: options.accessTier,
        benchmarkStatusByModelTier: options.benchmarkStatusByModelTier,
        confirmationStatusByCandidateId,
      })
    : basePreflightViewModel;

  const candidates: LocalModelAcquisitionConsentCandidateViewModel[] = prepared.map((item) => {
    const finalCandidate = preflightViewModel.candidates.find(
      (candidate) => candidate.candidateId === item.candidate.candidateId,
    ) ?? item.candidate;

    return {
      candidateId: item.candidate.candidateId,
      candidateTier: item.candidate.candidateTier,
      artifactCandidateId: item.session.scope.artifactCandidateId,
      modelClassLabel: item.candidate.modelClassLabel,
      state: item.session.state,
      statusLabel: statusLabel(item.session.state),
      disclosureComplete: item.session.disclosure.disclosureComplete,
      canConfirm: item.session.canConfirm,
      canDecline: item.session.canDecline,
      canReset: item.session.canReset,
      consentRecorded: item.session.consentRecorded,
      finalPreflightStatus: finalCandidate.status,
      reasons: item.session.reasons,
      session: item.session,
      sessionInput: item.sessionInput,
      downloadStarted: false,
      modelActive: false,
    };
  });

  const consentAvailableCandidates = candidates.filter(
    (candidate) => candidate.state === 'awaiting-user-decision'
      || candidate.state === 'confirmed'
      || candidate.state === 'declined',
  ).length;

  return {
    heading: 'Explicit Local Model Acquisition Consent',
    scopeSummary: 'Consent is candidate-specific',
    availabilitySummary: 'Consent unavailable until all prerequisites pass',
    decisionSummary: 'No consent recorded',
    downloadStateSummary: 'No download started',
    cacheStateSummary: 'No cache written',
    modelStateSummary: 'No model active',
    governanceSummary: 'Confirmation does not bypass approval or benchmark',
    coreAppSummary: 'Core app remains available',
    fallbackSummary: 'Deterministic fallback remains available',
    documentPath: 'docs/ai/phase-4-local-model-acquisition-consent.md',
    candidates,
    aggregate: {
      totalCandidates: candidates.length,
      consentAvailableCandidates,
      awaitingDecisionCandidates: candidates.filter((candidate) => candidate.state === 'awaiting-user-decision').length,
      confirmedCandidates: candidates.filter((candidate) => candidate.state === 'confirmed').length,
      declinedCandidates: candidates.filter((candidate) => candidate.state === 'declined').length,
      invalidatedCandidates: candidates.filter((candidate) => candidate.state === 'invalidated').length,
      downloadStartedCandidates: 0,
      activeModels: 0,
    },
    preflightViewModel,
    candidateDeviceTier: preflightViewModel.candidateDeviceTier,
    featureAvailability: preflightViewModel.featureAvailability,
    visibleFeatureIds: preflightViewModel.visibleFeatureIds,
    canAttempt4B: false,
    policyOnly: true,
    modelActive: false,
  };
}

export function buildLocalModelAcquisitionConsentDecisionViewModel(
  input: BuildLocalModelAcquisitionConsentDecisionViewModelInput,
): LocalModelAcquisitionConsentDecisionViewModel {
  const basePreflight = evaluateLocalModelAcquisitionPreflight({
    ...input.preflightInput,
    confirmationStatus: 'not-requested',
  });
  const sessionInput: LocalModelAcquisitionConsentPolicyInput = {
    preflight: basePreflight,
    disclosure: input.disclosure,
  };
  const initial = createLocalModelAcquisitionConsentSession(sessionInput);
  const session = input.event
    ? applyLocalModelAcquisitionConsentEvent(initial, input.event, sessionInput)
    : initial;
  const finalPreflight = rebuildLocalModelAcquisitionPreflightWithConsent(
    input.preflightInput,
    session,
    sessionInput,
  );

  return {
    session,
    finalPreflight,
    policyOnly: true,
    downloadAuthorizedForExecution: false,
    downloadStarted: false,
    cacheWritten: false,
    runtimeInitialized: false,
    modelReady: false,
    modelActive: false,
  };
}
