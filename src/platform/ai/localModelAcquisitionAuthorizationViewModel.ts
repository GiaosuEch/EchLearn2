import type { AIFeatureId } from './aiFeatureRegistry.ts';
import type {
  LocalAiAccessTier,
  LocalAiModelTier,
  LocalAiTierBenchmarkStatus,
} from './localAiDeviceTierTypes.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from './localModelArtifactManifest.ts';
import {
  deriveLocalModelStorageQuotaStatus,
} from './localModelAcquisitionPreflight.ts';
import {
  buildLocalModelAcquisitionConsentViewModel,
} from './localModelAcquisitionConsentViewModel.ts';
import type {
  LocalModelAcquisitionConsentViewModel,
} from './localModelAcquisitionConsentViewModel.ts';
import type { LocalModelAcquisitionConsentSession } from './localModelAcquisitionConsentTypes.ts';
import {
  applyLocalModelAcquisitionAuthorizationEvent,
  buildLocalModelAcquisitionAuthorizationScope,
  createLocalModelAcquisitionAuthorizationSession,
  revalidateLocalModelAcquisitionAuthorization,
} from './localModelAcquisitionAuthorizationPolicy.ts';
import type {
  LocalModelAcquisitionAuthorizationEvent,
  LocalModelAcquisitionAuthorizationPolicyInput,
  LocalModelAcquisitionAuthorizationSession,
  LocalModelAcquisitionAuthorizationState,
} from './localModelAcquisitionAuthorizationTypes.ts';
import {
  mapLocalRuntimeCapabilityToDeviceProfile,
} from './localRuntimeCapabilityProbe.ts';
import type { LocalRuntimeCapabilityResult } from './localRuntimeCapabilityTypes.ts';

export interface BuildLocalModelAcquisitionAuthorizationViewModelOptions {
  readonly accessTier?: LocalAiAccessTier;
  readonly benchmarkStatusByModelTier?: Partial<Record<LocalAiModelTier, LocalAiTierBenchmarkStatus>>;
  readonly consentSessionsByCandidateId?: Readonly<Record<string, LocalModelAcquisitionConsentSession>>;
  readonly authorizationSessionsByCandidateId?: Readonly<Record<string, LocalModelAcquisitionAuthorizationSession>>;
  readonly consentViewModel?: LocalModelAcquisitionConsentViewModel;
}

export interface LocalModelAcquisitionAuthorizationCandidateViewModel {
  readonly candidateId: string;
  readonly candidateTier: LocalAiModelTier;
  readonly artifactCandidateId: string | null;
  readonly modelClassLabel: string;
  readonly state: LocalModelAcquisitionAuthorizationState;
  readonly statusLabel: string;
  readonly canRequestAuthorization: boolean;
  readonly canCancel: boolean;
  readonly canReset: boolean;
  readonly canConsume: boolean;
  readonly authorizationGranted: boolean;
  readonly futureExecutorHandoffAllowed: boolean;
  readonly reasons: readonly string[];
  readonly session: LocalModelAcquisitionAuthorizationSession;
  readonly sessionInput: LocalModelAcquisitionAuthorizationPolicyInput;
  readonly downloadStarted: false;
  readonly modelActive: false;
}

export interface LocalModelAcquisitionAuthorizationViewModel {
  readonly heading: 'Local Model Acquisition Action Authorization';
  readonly scopeSummary: 'Authorization is candidate-specific';
  readonly oneAttemptSummary: 'Authorization is one-attempt only';
  readonly availabilitySummary: 'Authorization unavailable until preflight and consent pass';
  readonly authorizationSummary: 'No action authorization granted';
  readonly downloadStateSummary: 'No download started';
  readonly cacheStateSummary: 'No cache written';
  readonly modelStateSummary: 'No model active';
  readonly governanceSummary: 'Authorization does not bypass approval or benchmark';
  readonly coreAppSummary: 'Core app remains available';
  readonly fallbackSummary: 'Deterministic fallback remains available';
  readonly documentPath: 'docs/ai/phase-4-local-model-acquisition-authorization.md';
  readonly candidates: readonly LocalModelAcquisitionAuthorizationCandidateViewModel[];
  readonly aggregate: {
    readonly totalCandidates: number;
    readonly authorizationAvailableCandidates: number;
    readonly awaitingActionRequestCandidates: number;
    readonly authorizedCandidates: number;
    readonly cancelledCandidates: number;
    readonly invalidatedCandidates: number;
    readonly consumedAuthorizations: number;
    readonly downloadStartedCandidates: 0;
    readonly activeModels: 0;
  };
  readonly consentViewModel: LocalModelAcquisitionConsentViewModel;
  readonly candidateDeviceTier: LocalModelAcquisitionConsentViewModel['candidateDeviceTier'];
  readonly featureAvailability: 'full-ui';
  readonly visibleFeatureIds: readonly AIFeatureId[];
  readonly canAttempt4B: false;
  readonly policyOnly: true;
  readonly modelActive: false;
}

export interface BuildLocalModelAcquisitionAuthorizationDecisionViewModelInput {
  readonly authorizationInput: LocalModelAcquisitionAuthorizationPolicyInput;
  readonly events?: readonly LocalModelAcquisitionAuthorizationEvent[];
}

export interface LocalModelAcquisitionAuthorizationDecisionViewModel {
  readonly session: LocalModelAcquisitionAuthorizationSession;
  readonly policyOnly: true;
  readonly futureExecutorHandoffAllowed: boolean;
  readonly downloadStarted: false;
  readonly downloadCompleted: false;
  readonly cacheWritten: false;
  readonly runtimeInitialized: false;
  readonly modelReady: false;
  readonly modelActive: false;
}

function statusLabel(state: LocalModelAcquisitionAuthorizationState): string {
  if (state === 'awaiting-action-request') return 'Awaiting explicit action request';
  if (state === 'authorized') return 'One-attempt authorization granted';
  if (state === 'cancelled') return 'Action authorization cancelled';
  if (state === 'invalidated') return 'Previous authorization invalidated';
  if (state === 'consumed') return 'One-attempt authorization consumed';
  return 'Authorization unavailable';
}

function batterySafety(
  batteryLevelPercent: number | null | undefined,
  blockers: readonly string[],
): 'safe' | 'unsafe' | 'unknown' {
  if (blockers.includes('battery-unsafe')) return 'unsafe';
  if (batteryLevelPercent === null || batteryLevelPercent === undefined) return 'unknown';
  return 'safe';
}

export function buildLocalModelAcquisitionAuthorizationViewModel(
  runtimeCapability: LocalRuntimeCapabilityResult,
  options: BuildLocalModelAcquisitionAuthorizationViewModelOptions = {},
): LocalModelAcquisitionAuthorizationViewModel {
  const accessTier = options.accessTier ?? 'free';
  const consentViewModel = options.consentViewModel
    ?? buildLocalModelAcquisitionConsentViewModel(runtimeCapability, {
      accessTier,
      benchmarkStatusByModelTier: options.benchmarkStatusByModelTier,
      consentSessionsByCandidateId: options.consentSessionsByCandidateId,
    });
  const profile = mapLocalRuntimeCapabilityToDeviceProfile(runtimeCapability);

  const candidates: LocalModelAcquisitionAuthorizationCandidateViewModel[] = consentViewModel.candidates.map(
    (consentCandidate) => {
      const preflightCandidate = consentViewModel.preflightViewModel.candidates.find(
        (candidate) => candidate.candidateId === consentCandidate.candidateId,
      );
      const artifact = LOCAL_MODEL_ARTIFACT_MANIFEST.find(
        (item) => item.candidateId === consentCandidate.candidateId,
      );
      const candidateTier = consentCandidate.candidateTier;
      const preflightBlockers = preflightCandidate?.blockers ?? [];
      const scope = buildLocalModelAcquisitionAuthorizationScope({
        candidateId: consentCandidate.candidateId,
        candidateTier,
        artifactCandidateId: consentCandidate.artifactCandidateId,
        estimatedDownloadSizeMb: consentCandidate.session.scope.estimatedDownloadSizeMb,
        expectedStorageImpactMb: consentCandidate.session.scope.expectedStorageImpactMb,
        disclosureRevision: consentCandidate.session.scope.disclosureRevision,
        accessTier,
        assignedDeviceTier: preflightCandidate?.candidateDeviceTier
          ?? consentViewModel.candidateDeviceTier,
        benchmarkStatus: options.benchmarkStatusByModelTier?.[candidateTier] ?? 'not-run',
        webGpuStatus: profile.webGpuStatus,
        connectionKind: profile.connectionKind ?? 'unknown',
        batterySafety: batterySafety(profile.batteryLevelPercent, preflightBlockers),
        thermalStatus: profile.thermalStatus ?? 'unknown',
        storageQuotaStatus: deriveLocalModelStorageQuotaStatus(
          runtimeCapability.estimatedRemainingMb,
          artifact?.estimatedDownloadSizeMb ?? null,
        ),
      });
      const sessionInput: LocalModelAcquisitionAuthorizationPolicyInput = {
        preflight: {
          status: preflightCandidate?.status ?? 'blocked',
          blockers: preflightBlockers,
          canPlanFutureAcquisition: preflightCandidate?.canPlanFutureAcquisition ?? false,
        },
        consent: consentCandidate.session,
        scope,
      };
      const previous = options.authorizationSessionsByCandidateId?.[consentCandidate.candidateId];
      const session = previous
        ? revalidateLocalModelAcquisitionAuthorization(previous, sessionInput)
        : createLocalModelAcquisitionAuthorizationSession(sessionInput);

      return {
        candidateId: consentCandidate.candidateId,
        candidateTier,
        artifactCandidateId: consentCandidate.artifactCandidateId,
        modelClassLabel: consentCandidate.modelClassLabel,
        state: session.state,
        statusLabel: statusLabel(session.state),
        canRequestAuthorization: session.canRequestAuthorization,
        canCancel: session.canCancel,
        canReset: session.canReset,
        canConsume: session.canConsume,
        authorizationGranted: session.authorizationGranted,
        futureExecutorHandoffAllowed: session.futureExecutorHandoffAllowed,
        reasons: session.reasons,
        session,
        sessionInput,
        downloadStarted: false,
        modelActive: false,
      };
    },
  );

  const authorizationAvailableCandidates = candidates.filter(
    (candidate) => candidate.state === 'awaiting-action-request'
      || candidate.state === 'authorized',
  ).length;

  return {
    heading: 'Local Model Acquisition Action Authorization',
    scopeSummary: 'Authorization is candidate-specific',
    oneAttemptSummary: 'Authorization is one-attempt only',
    availabilitySummary: 'Authorization unavailable until preflight and consent pass',
    authorizationSummary: 'No action authorization granted',
    downloadStateSummary: 'No download started',
    cacheStateSummary: 'No cache written',
    modelStateSummary: 'No model active',
    governanceSummary: 'Authorization does not bypass approval or benchmark',
    coreAppSummary: 'Core app remains available',
    fallbackSummary: 'Deterministic fallback remains available',
    documentPath: 'docs/ai/phase-4-local-model-acquisition-authorization.md',
    candidates,
    aggregate: {
      totalCandidates: candidates.length,
      authorizationAvailableCandidates,
      awaitingActionRequestCandidates: candidates.filter(
        (candidate) => candidate.state === 'awaiting-action-request',
      ).length,
      authorizedCandidates: candidates.filter((candidate) => candidate.state === 'authorized').length,
      cancelledCandidates: candidates.filter((candidate) => candidate.state === 'cancelled').length,
      invalidatedCandidates: candidates.filter((candidate) => candidate.state === 'invalidated').length,
      consumedAuthorizations: candidates.filter((candidate) => candidate.state === 'consumed').length,
      downloadStartedCandidates: 0,
      activeModels: 0,
    },
    consentViewModel,
    candidateDeviceTier: consentViewModel.candidateDeviceTier,
    featureAvailability: consentViewModel.featureAvailability,
    visibleFeatureIds: consentViewModel.visibleFeatureIds,
    canAttempt4B: false,
    policyOnly: true,
    modelActive: false,
  };
}

export function buildLocalModelAcquisitionAuthorizationDecisionViewModel(
  input: BuildLocalModelAcquisitionAuthorizationDecisionViewModelInput,
): LocalModelAcquisitionAuthorizationDecisionViewModel {
  let session = createLocalModelAcquisitionAuthorizationSession(input.authorizationInput);
  for (const event of input.events ?? []) {
    session = applyLocalModelAcquisitionAuthorizationEvent(
      session,
      event,
      input.authorizationInput,
    );
  }

  return {
    session,
    policyOnly: true,
    futureExecutorHandoffAllowed: session.futureExecutorHandoffAllowed,
    downloadStarted: false,
    downloadCompleted: false,
    cacheWritten: false,
    runtimeInitialized: false,
    modelReady: false,
    modelActive: false,
  };
}
