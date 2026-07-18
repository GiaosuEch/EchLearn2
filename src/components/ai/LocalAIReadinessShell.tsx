import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  CircleSlash2,
  Clock3,
  Info,
  Settings2,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router';
import type { LocalAIReadinessStatus } from '../../platform/ai/localAiReadinessChecklist.ts';
import { buildLocalAIReadinessViewModel } from '../../platform/ai/localAiReadinessViewModel.ts';
import { buildLocalModelApprovalViewModel } from '../../platform/ai/localModelApprovalViewModel.ts';
import { buildLocalModelArtifactViewModel } from '../../platform/ai/localModelArtifactViewModel.ts';
import { buildLocalAiDeviceTierPolicyOverview } from '../../platform/ai/localAiDeviceTierViewModel.ts';
import { buildLocalModelBenchmarkViewModel } from '../../platform/ai/localModelBenchmarkViewModel.ts';
import { buildLocalModelRuntimeDecisionViewModel } from '../../platform/ai/localModelRuntimeDecisionViewModel.ts';
import {
  createUncheckedLocalRuntimeCapabilityResult,
  probeLocalRuntimeCapabilities,
} from '../../platform/ai/localRuntimeCapabilityProbe.ts';
import { buildLocalRuntimeCapabilityViewModel } from '../../platform/ai/localRuntimeCapabilityViewModel.ts';
import {
  applyLocalModelAcquisitionConsentEvent,
} from '../../platform/ai/localModelAcquisitionConsentPolicy.ts';
import {
  buildLocalModelAcquisitionConsentViewModel,
} from '../../platform/ai/localModelAcquisitionConsentViewModel.ts';
import type {
  LocalModelAcquisitionConsentEvent,
  LocalModelAcquisitionConsentSession,
} from '../../platform/ai/localModelAcquisitionConsentTypes.ts';
import {
  applyLocalModelAcquisitionAuthorizationEvent,
} from '../../platform/ai/localModelAcquisitionAuthorizationPolicy.ts';
import {
  buildLocalModelAcquisitionAuthorizationViewModel,
} from '../../platform/ai/localModelAcquisitionAuthorizationViewModel.ts';
import {
  buildLocalModelAcquisitionExecutionViewModel,
} from '../../platform/ai/localModelAcquisitionExecutionViewModel.ts';
import {
  buildCurrentLocalModelAcquisitionCloseout,
} from '../../platform/ai/localModelAcquisitionCloseout.ts';
import {
  buildLocalModelAcquisitionCloseoutViewModel,
} from '../../platform/ai/localModelAcquisitionCloseoutViewModel.ts';
import {
  buildLocalModelCandidateEvidenceViewModel,
} from '../../platform/ai/localModelCandidateEvidenceViewModel.ts';
import {
  buildLocalModelCandidateReviewDecisionViewModel,
} from '../../platform/ai/localModelCandidateReviewDecisionViewModel.ts';
import {
  buildLocalModelArtifactEvidenceViewModel,
} from '../../platform/ai/localModelArtifactEvidenceViewModel.ts';
import {
  buildLocalModelArtifactSelectionViewModel,
} from '../../platform/ai/localModelArtifactSelectionViewModel.ts';
import {
  buildLocalModelArtifactIntegrityEvidenceViewModel,
} from '../../platform/ai/localModelArtifactIntegrityEvidenceViewModel.ts';
import {
  buildLocalModelGovernanceReviewPacketViewModel,
} from '../../platform/ai/localModelGovernanceReviewPacketViewModel.ts';
import {
  buildLocalModelGovernanceEvidenceClosureViewModel,
} from '../../platform/ai/localModelGovernanceEvidenceClosureViewModel.ts';
import {
  buildLocalModelHumanGovernanceDecisionViewModel,
} from '../../platform/ai/localModelHumanGovernanceDecisionViewModel.ts';
import {
  buildLocalModelHumanArtifactSelectionViewModel,
} from '../../platform/ai/localModelHumanArtifactSelectionViewModel.ts';
import type {
  LocalModelAcquisitionAuthorizationEvent,
  LocalModelAcquisitionAuthorizationSession,
} from '../../platform/ai/localModelAcquisitionAuthorizationTypes.ts';

const statusIcons: Record<LocalAIReadinessStatus, LucideIcon> = {
  completed: CheckCircle2,
  'pending-phase-4': Clock3,
  blocked: CircleSlash2,
  informational: Info,
};

const statusClasses: Record<LocalAIReadinessStatus, string> = {
  completed: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-200',
  'pending-phase-4': 'border-amber-500/20 bg-amber-500/5 text-amber-200',
  blocked: 'border-rose-500/20 bg-rose-500/5 text-rose-200',
  informational: 'border-sky-500/20 bg-sky-500/5 text-sky-200',
};

function formatMegabytes(value: number | null): string {
  return value === null ? 'Unknown' : `${value.toFixed(1)} MiB`;
}

export function LocalAIReadinessShell() {
  const [runtimeCapability, setRuntimeCapability] = useState(createUncheckedLocalRuntimeCapabilityResult());
  const [acquisitionConsentSessions, setAcquisitionConsentSessions] = useState<
    Readonly<Record<string, LocalModelAcquisitionConsentSession>>
  >({});
  const [acquisitionAuthorizationSessions, setAcquisitionAuthorizationSessions] = useState<
    Readonly<Record<string, LocalModelAcquisitionAuthorizationSession>>
  >({});

  useEffect(() => {
    let cancelled = false;

    void probeLocalRuntimeCapabilities()
      .then((result) => {
        if (!cancelled) setRuntimeCapability(result);
      })
      .catch(() => {
        if (cancelled) return;
        setRuntimeCapability({
          ...createUncheckedLocalRuntimeCapabilityResult(),
          probeStatus: 'failed',
          webGpuStatus: 'unknown',
          warnings: ['Runtime capability metadata is unavailable.'],
          reasons: ['Core app and deterministic fallback remain available.'],
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const viewModel = buildLocalAIReadinessViewModel();
  const modelApproval = buildLocalModelApprovalViewModel();
  const artifactPolicy = buildLocalModelArtifactViewModel();
  const deviceTierPolicy = buildLocalAiDeviceTierPolicyOverview();
  const modelBenchmark = buildLocalModelBenchmarkViewModel();
  const runtimeDecision = buildLocalModelRuntimeDecisionViewModel();
  const runtimeCapabilityViewModel = buildLocalRuntimeCapabilityViewModel(runtimeCapability);
  const acquisitionConsent = buildLocalModelAcquisitionConsentViewModel(runtimeCapability, {
    consentSessionsByCandidateId: acquisitionConsentSessions,
  });
  const acquisitionPreflight = acquisitionConsent.preflightViewModel;
  const acquisitionAuthorization = buildLocalModelAcquisitionAuthorizationViewModel(
    runtimeCapability,
    {
      consentViewModel: acquisitionConsent,
      authorizationSessionsByCandidateId: acquisitionAuthorizationSessions,
    },
  );
  const acquisitionExecution = buildLocalModelAcquisitionExecutionViewModel(
    runtimeCapability,
    { authorizationViewModel: acquisitionAuthorization },
  );
  const acquisitionCloseout = buildLocalModelAcquisitionCloseoutViewModel(
    buildCurrentLocalModelAcquisitionCloseout({
      runtimeCapability,
      executionViewModel: acquisitionExecution,
    }),
  );
  const candidateEvidence = buildLocalModelCandidateEvidenceViewModel();
  const candidateReviewDecision = buildLocalModelCandidateReviewDecisionViewModel();
  const artifactEvidence = buildLocalModelArtifactEvidenceViewModel();
  const artifactSelection = buildLocalModelArtifactSelectionViewModel();
  const artifactIntegrityEvidence = buildLocalModelArtifactIntegrityEvidenceViewModel();
  const governanceReviewPacket = buildLocalModelGovernanceReviewPacketViewModel();
  const governanceEvidenceClosure = buildLocalModelGovernanceEvidenceClosureViewModel();
  const humanGovernanceDecision = buildLocalModelHumanGovernanceDecisionViewModel();
  const humanArtifactSelection = buildLocalModelHumanArtifactSelectionViewModel();

  function handleAcquisitionConsentEvent(
    candidateId: string,
    event: LocalModelAcquisitionConsentEvent,
  ): void {
    const candidate = acquisitionConsent.candidates.find((item) => item.candidateId === candidateId);
    if (!candidate) return;

    const nextSession = applyLocalModelAcquisitionConsentEvent(
      candidate.session,
      event,
      candidate.sessionInput,
    );
    setAcquisitionConsentSessions((current) => ({
      ...current,
      [candidateId]: nextSession,
    }));
  }

  function handleAcquisitionAuthorizationEvent(
    candidateId: string,
    event: LocalModelAcquisitionAuthorizationEvent,
  ): void {
    const candidate = acquisitionAuthorization.candidates.find(
      (item) => item.candidateId === candidateId,
    );
    if (!candidate) return;

    const nextSession = applyLocalModelAcquisitionAuthorizationEvent(
      candidate.session,
      event,
      candidate.sessionInput,
    );
    setAcquisitionAuthorizationSessions((current) => ({
      ...current,
      [candidateId]: nextSession,
    }));
  }

  return (
    <section className="space-y-5" aria-labelledby="local-ai-readiness-heading">
      <div className="rounded-xl border border-dark-700 bg-dark-900 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-300">
            <ShieldCheck size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 id="local-ai-readiness-heading" className="text-lg font-semibold text-dark-50">
              {viewModel.heading}
            </h2>
            <p className="mt-2 text-sm leading-6 text-dark-300">{viewModel.description}</p>
            <p className="mt-3 text-sm font-medium text-dark-100">{viewModel.currentStatusLabel}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{viewModel.currentStatusDescription}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-dark-700 bg-dark-900 p-4">
          <p className="text-xs uppercase tracking-wide text-dark-400">Completed</p>
          <p className="mt-2 text-2xl font-semibold text-dark-50">{viewModel.summary.completed}</p>
        </div>
        <div className="rounded-xl border border-dark-700 bg-dark-900 p-4">
          <p className="text-xs uppercase tracking-wide text-dark-400">Pending Phase 4</p>
          <p className="mt-2 text-2xl font-semibold text-dark-50">{viewModel.summary.pendingPhase4}</p>
        </div>
        <div className="rounded-xl border border-dark-700 bg-dark-900 p-4">
          <p className="text-xs uppercase tracking-wide text-dark-400">Blocked</p>
          <p className="mt-2 text-2xl font-semibold text-dark-50">{viewModel.summary.blocked}</p>
        </div>
        <div className="rounded-xl border border-dark-700 bg-dark-900 p-4">
          <p className="text-xs uppercase tracking-wide text-dark-400">Informational</p>
          <p className="mt-2 text-2xl font-semibold text-dark-50">{viewModel.summary.informational}</p>
        </div>
      </div>

      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-sky-200">Phase 4 runtime ADR · {runtimeDecision.statusLabel}</p>
            <h3 className="mt-2 font-semibold text-dark-100">Browser-local runtime candidate research</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">{runtimeDecision.currentState}</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">{runtimeDecision.candidateSummary}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{runtimeDecision.rollbackSummary}</p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{runtimeDecision.adrPath}</code>
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-amber-200">Phase 4.2 approval review</p>
            <h3 className="mt-2 font-semibold text-dark-100">{modelApproval.heading}</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">{modelApproval.currentState}</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">{modelApproval.verificationNote}</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">
              {modelApproval.summary.totalCandidates} candidates · {modelApproval.summary.approvedCandidates} approved · {modelApproval.summary.pendingChecks} required checks pending
            </p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{modelApproval.documentPath}</code>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {modelApproval.candidates.map((candidate) => (
            <article key={candidate.candidateId} className="rounded-lg border border-dark-700 bg-dark-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-dark-400">{candidate.tierLabel}</p>
              <h4 className="mt-2 text-sm font-semibold text-dark-100">{candidate.displayName}</h4>
              <p className="mt-2 text-xs leading-5 text-dark-400">{candidate.reviewState}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-violet-200">Phase 4.3 benchmark plan</p>
            <h3 className="mt-2 font-semibold text-dark-100">{modelBenchmark.heading}</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">{modelBenchmark.currentState}</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">{modelBenchmark.capabilityState}</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">
              {modelBenchmark.summary.totalBenchmarkTasks} planned tasks · {modelBenchmark.summary.languagesCovered} languages · {modelBenchmark.summary.completedBenchmarkResults} completed results · {modelBenchmark.summary.approvedBenchmarkCandidates} benchmark-approved candidates
            </p>
            <p className="mt-2 text-xs leading-5 text-dark-400">{modelBenchmark.nextRequiredAction}</p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{modelBenchmark.documentPath}</code>
        </div>
      </div>

      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-cyan-200">Phase 4.4 device tier gate</p>
            <h3 className="mt-2 font-semibold text-dark-100">{deviceTierPolicy.heading}</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">{deviceTierPolicy.currentState}</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">{deviceTierPolicy.featureParitySummary}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{deviceTierPolicy.safetySummary}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{deviceTierPolicy.entitlementSummary}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{deviceTierPolicy.benchmarkSummary}</p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{deviceTierPolicy.documentPath}</code>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {deviceTierPolicy.tiers.map((tier) => (
            <article key={tier.tier} className="rounded-lg border border-dark-700 bg-dark-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-dark-400">{tier.label}</p>
              <p className="mt-2 text-xs leading-5 text-dark-300">{tier.summary}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-fuchsia-200">Phase 4.5 artifact and cache policy</p>
            <h3 className="mt-2 font-semibold text-dark-100">{artifactPolicy.heading}</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">{artifactPolicy.currentState}</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">{artifactPolicy.cacheSummary}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{artifactPolicy.recoverySummary}</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">
              {artifactPolicy.summary.totalArtifacts} candidates · {artifactPolicy.summary.downloadableArtifacts} downloadable · {artifactPolicy.summary.cacheableArtifacts} cacheable · {artifactPolicy.summary.runtimeReadyArtifacts} runtime ready
            </p>
            <p className="mt-1 text-xs leading-5 text-dark-400">
              User deletion required: {artifactPolicy.summary.userDeletionRequired ? 'yes' : 'no'}
            </p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{artifactPolicy.documentPath}</code>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {artifactPolicy.artifacts.map((artifact) => (
            <article key={artifact.artifactId} className="rounded-lg border border-dark-700 bg-dark-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-dark-400">{artifact.tierLabel}</p>
              <h4 className="mt-2 text-sm font-semibold text-dark-100">{artifact.displayName}</h4>
              <p className="mt-2 text-xs leading-5 text-dark-400">{artifact.statusLabel}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-200">Phase 4.6 runtime capability probe</p>
            <h3 className="mt-2 font-semibold text-dark-100">Runtime Capability Probe</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">
              {runtimeCapabilityViewModel.probeStatusLabel} · Metadata only · No model active
            </p>
            <p className="mt-2 text-xs leading-5 text-dark-400">
              {runtimeCapabilityViewModel.candidateTierLabel}: {runtimeCapabilityViewModel.candidateDeviceTier}
            </p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{runtimeCapabilityViewModel.benchmarkSummary}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">
              {runtimeCapabilityViewModel.coreAppSummary}. {runtimeCapabilityViewModel.fallbackSummary}.
            </p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{runtimeCapabilityViewModel.documentPath}</code>
        </div>

        <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-dark-700 bg-dark-950/40 p-3">
            <dt className="text-dark-400">Secure context</dt>
            <dd className="mt-1 text-dark-100">{runtimeCapability.secureContext}</dd>
          </div>
          <div className="rounded-lg border border-dark-700 bg-dark-950/40 p-3">
            <dt className="text-dark-400">WebGPU</dt>
            <dd className="mt-1 text-dark-100">{runtimeCapability.webGpuStatus}</dd>
          </div>
          <div className="rounded-lg border border-dark-700 bg-dark-950/40 p-3">
            <dt className="text-dark-400">Storage quota</dt>
            <dd className="mt-1 text-dark-100">{formatMegabytes(runtimeCapability.estimatedQuotaMb)}</dd>
          </div>
          <div className="rounded-lg border border-dark-700 bg-dark-950/40 p-3">
            <dt className="text-dark-400">Storage usage</dt>
            <dd className="mt-1 text-dark-100">{formatMegabytes(runtimeCapability.estimatedUsageMb)}</dd>
          </div>
          <div className="rounded-lg border border-dark-700 bg-dark-950/40 p-3">
            <dt className="text-dark-400">Storage remaining</dt>
            <dd className="mt-1 text-dark-100">{formatMegabytes(runtimeCapability.estimatedRemainingMb)}</dd>
          </div>
          <div className="rounded-lg border border-dark-700 bg-dark-950/40 p-3">
            <dt className="text-dark-400">Connection</dt>
            <dd className="mt-1 text-dark-100">{runtimeCapability.connectionKind}</dd>
          </div>
          <div className="rounded-lg border border-dark-700 bg-dark-950/40 p-3">
            <dt className="text-dark-400">Data saver</dt>
            <dd className="mt-1 text-dark-100">
              {runtimeCapability.saveDataEnabled === null ? 'Unknown' : runtimeCapability.saveDataEnabled ? 'Enabled' : 'Disabled'}
            </dd>
          </div>
          <div className="rounded-lg border border-dark-700 bg-dark-950/40 p-3">
            <dt className="text-dark-400">Battery</dt>
            <dd className="mt-1 text-dark-100">
              {runtimeCapability.batteryStatus}
              {runtimeCapability.batteryLevelPercent === null ? '' : ` · ${runtimeCapability.batteryLevelPercent}%`}
            </dd>
          </div>
          <div className="rounded-lg border border-dark-700 bg-dark-950/40 p-3">
            <dt className="text-dark-400">Browser</dt>
            <dd className="mt-1 text-dark-100">{runtimeCapability.browserName}</dd>
          </div>
          <div className="rounded-lg border border-dark-700 bg-dark-950/40 p-3">
            <dt className="text-dark-400">Operating system</dt>
            <dd className="mt-1 text-dark-100">{runtimeCapability.osName}</dd>
          </div>
          <div className="rounded-lg border border-dark-700 bg-dark-950/40 p-3">
            <dt className="text-dark-400">Approximate RAM</dt>
            <dd className="mt-1 text-dark-100">
              {runtimeCapability.approxRamGb === null ? 'Unknown' : `${runtimeCapability.approxRamGb} GB`}
            </dd>
          </div>
          <div className="rounded-lg border border-dark-700 bg-dark-950/40 p-3">
            <dt className="text-dark-400">Probe status</dt>
            <dd className="mt-1 text-dark-100">{runtimeCapability.probeStatus}</dd>
          </div>
        </dl>

        {runtimeCapabilityViewModel.warnings.length > 0 ? (
          <ul className="mt-4 space-y-1 text-xs leading-5 text-dark-400">
            {runtimeCapabilityViewModel.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-violet-200">Phase 4.7 local model acquisition preflight</p>
            <h3 className="mt-2 font-semibold text-dark-100">Local Model Acquisition Preflight</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">Policy only · No download started · No cache written · No model active</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">
              {acquisitionPreflight.summary.totalCandidates} candidates · {acquisitionPreflight.summary.blockedCandidates} blocked · {acquisitionPreflight.summary.awaitingConfirmationCandidates} awaiting confirmation · {acquisitionPreflight.summary.preflightPassedCandidates} preflight passed
            </p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{acquisitionPreflight.approvalSummary}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{acquisitionPreflight.benchmarkSummary}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">
              {acquisitionPreflight.coreAppSummary}. {acquisitionPreflight.fallbackSummary}.
            </p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{acquisitionPreflight.documentPath}</code>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {acquisitionPreflight.candidates.map((candidate) => (
            <article key={candidate.candidateId} className="rounded-lg border border-dark-700 bg-dark-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-dark-400">{candidate.candidateTier} candidate · {candidate.modelClassLabel}</p>
              <h4 className="mt-2 text-sm font-semibold text-dark-100">{candidate.displayName}</h4>
              <p className="mt-2 text-xs leading-5 text-dark-400">{candidate.statusLabel}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-200">Phase 4.8 explicit acquisition consent</p>
            <h3 className="mt-2 font-semibold text-dark-100">Explicit Local Model Acquisition Consent</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">Consent is candidate-specific · No consent recorded · No download started · No cache written · No model active</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">Consent unavailable until all prerequisites pass</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">
              {acquisitionConsent.aggregate.totalCandidates} candidates · {acquisitionConsent.aggregate.consentAvailableCandidates} consent available · {acquisitionConsent.aggregate.awaitingDecisionCandidates} awaiting decision · {acquisitionConsent.aggregate.confirmedCandidates} confirmed
            </p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{acquisitionConsent.governanceSummary}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">
              {acquisitionConsent.coreAppSummary}. {acquisitionConsent.fallbackSummary}.
            </p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{acquisitionConsent.documentPath}</code>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {acquisitionConsent.candidates.map((candidate) => (
            <article key={candidate.candidateId} className="rounded-lg border border-dark-700 bg-dark-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-dark-400">{candidate.candidateTier} candidate · {candidate.modelClassLabel}</p>
              <p className="mt-2 text-xs leading-5 text-dark-400">{candidate.statusLabel}</p>
              {candidate.canConfirm ? (
                <button
                  type="button"
                  onClick={() => handleAcquisitionConsentEvent(candidate.candidateId, { type: 'confirm' })}
                  className="mt-3 rounded-lg border border-emerald-500/30 px-3 py-2 text-xs text-emerald-100"
                >
                  Confirm this candidate disclosure
                </button>
              ) : null}
              {candidate.canDecline ? (
                <button
                  type="button"
                  onClick={() => handleAcquisitionConsentEvent(candidate.candidateId, { type: 'decline' })}
                  className="mt-2 rounded-lg border border-dark-600 px-3 py-2 text-xs text-dark-200"
                >
                  Decline this candidate disclosure
                </button>
              ) : null}
              {candidate.canReset ? (
                <button
                  type="button"
                  onClick={() => handleAcquisitionConsentEvent(candidate.candidateId, { type: 'reset' })}
                  className="mt-2 rounded-lg border border-dark-600 px-3 py-2 text-xs text-dark-200"
                >
                  Reset in-memory decision
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-cyan-200">Phase 4.9 local model acquisition action authorization</p>
            <h3 className="mt-2 font-semibold text-dark-100">Local Model Acquisition Action Authorization</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">Authorization is candidate-specific · Authorization is one-attempt only · No action authorization granted · No download started · No cache written · No model active</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">Authorization unavailable until preflight and consent pass</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">
              {acquisitionAuthorization.aggregate.totalCandidates} candidates · {acquisitionAuthorization.aggregate.authorizationAvailableCandidates} authorization available · {acquisitionAuthorization.aggregate.awaitingActionRequestCandidates} awaiting action request · {acquisitionAuthorization.aggregate.authorizedCandidates} authorized
            </p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{acquisitionAuthorization.governanceSummary}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">
              {acquisitionAuthorization.coreAppSummary}. {acquisitionAuthorization.fallbackSummary}.
            </p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{acquisitionAuthorization.documentPath}</code>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {acquisitionAuthorization.candidates.map((candidate) => (
            <article key={candidate.candidateId} className="rounded-lg border border-dark-700 bg-dark-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-dark-400">{candidate.candidateTier} candidate · {candidate.modelClassLabel}</p>
              <p className="mt-2 text-xs leading-5 text-dark-400">{candidate.statusLabel}</p>
              {candidate.canRequestAuthorization ? (
                <button
                  type="button"
                  onClick={() => handleAcquisitionAuthorizationEvent(candidate.candidateId, { type: 'request-authorization' })}
                  className="mt-3 rounded-lg border border-cyan-500/30 px-3 py-2 text-xs text-cyan-100"
                >
                  Request one-attempt authorization
                </button>
              ) : null}
              {candidate.canCancel ? (
                <button
                  type="button"
                  onClick={() => handleAcquisitionAuthorizationEvent(candidate.candidateId, { type: 'cancel' })}
                  className="mt-2 rounded-lg border border-dark-600 px-3 py-2 text-xs text-dark-200"
                >
                  Cancel in-memory authorization
                </button>
              ) : null}
              {candidate.canConsume ? (
                <button
                  type="button"
                  onClick={() => handleAcquisitionAuthorizationEvent(candidate.candidateId, { type: 'consume' })}
                  className="mt-2 rounded-lg border border-dark-600 px-3 py-2 text-xs text-dark-200"
                >
                  Consume one-attempt permit
                </button>
              ) : null}
              {candidate.canReset ? (
                <button
                  type="button"
                  onClick={() => handleAcquisitionAuthorizationEvent(candidate.candidateId, { type: 'reset' })}
                  className="mt-2 rounded-lg border border-dark-600 px-3 py-2 text-xs text-dark-200"
                >
                  Reset in-memory authorization
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-sky-200">Phase 4.10 local model acquisition executor boundary</p>
            <h3 className="mt-2 font-semibold text-dark-100">Local Model Acquisition Executor Boundary</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">Boundary only · Production executor unavailable · No execution request created · No executor handoff accepted · No download started · No cache written · No model active</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">Authorization required before handoff</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">
              {acquisitionExecution.aggregate.totalCandidates} candidates · {acquisitionExecution.aggregate.executionEligibleCandidates} execution eligible · {acquisitionExecution.aggregate.requestsBuilt} requests built · {acquisitionExecution.aggregate.acceptedHandoffs} accepted handoffs
            </p>
            <p className="mt-1 text-xs leading-5 text-dark-400">
              {acquisitionExecution.coreAppSummary}. {acquisitionExecution.fallbackSummary}.
            </p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{acquisitionExecution.documentPath}</code>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {acquisitionExecution.candidates.map((candidate) => (
            <article key={candidate.candidateId} className="rounded-lg border border-dark-700 bg-dark-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-dark-400">{candidate.candidateTier} candidate · {candidate.modelClassLabel}</p>
              <p className="mt-2 text-xs leading-5 text-dark-400">{candidate.statusLabel}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-200">Phase 4.11 local model acquisition safety closeout</p>
            <h3 className="mt-2 font-semibold text-dark-100">Phase 4 Local Model Acquisition Safety Closeout</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">
              {acquisitionCloseout.aggregate.failedChecks === 0
                ? 'Phase 4 acquisition foundation complete'
                : 'Phase 4 acquisition foundation requires attention'} · {acquisitionCloseout.statusLabel}
            </p>
            <p className="mt-1 text-xs leading-5 text-dark-400">Production model execution remains unavailable · No download started · No cache written · No runtime initialized · No model active</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">
              {acquisitionCloseout.aggregate.passedChecks} checks passed · {acquisitionCloseout.aggregate.failedChecks} failed · {acquisitionCloseout.aggregate.approvedCandidates} approved candidates · {acquisitionCloseout.aggregate.downloadableCandidates} downloadable candidates · {acquisitionCloseout.aggregate.activeModels} active models
            </p>
            <p className="mt-1 text-xs leading-5 text-dark-400">Core app remains available · Deterministic fallback remains available</p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{acquisitionCloseout.documentPath}</code>
        </div>
      </div>

      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-violet-200">Phase 5.1 exact model and license evidence review</p>
            <h3 className="mt-2 font-semibold text-dark-100">{'Exact Model Candidate & License Evidence Review'}</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">Evidence review only · Human approval still required · No model approved · No artifact approved · No benchmark passed · No download available · No model active</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">Production execution remains unavailable</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">
              {candidateEvidence.aggregate.totalCandidates} candidates · {candidateEvidence.aggregate.humanReviewRequiredCandidates} require human review · {candidateEvidence.aggregate.approvedCandidates} approved · {candidateEvidence.aggregate.downloadableCandidates} downloadable · {candidateEvidence.aggregate.activeModels} active models
            </p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{candidateEvidence.documentPath}</code>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {candidateEvidence.candidateRows.map((candidate) => (
            <article key={candidate.candidateId} className="rounded-lg border border-dark-700 bg-dark-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-dark-400">{candidate.candidateTier} candidate · {candidate.modelClass}</p>
              <h4 className="mt-2 text-sm font-semibold text-dark-100">{candidate.exactModelName}</h4>
              <p className="mt-1 text-xs leading-5 text-dark-400">{candidate.licenseIdentifier} · {candidate.statusLabel}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-amber-200">Phase 5.2 human model and license review decision gate</p>
            <h3 className="mt-2 font-semibold text-dark-100">{'Human Model & License Review Decision Gate'}</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">Human decision not recorded · More evidence is required · No candidate approved for artifact review</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">No model approved · No license approved · No artifact approved · No benchmark passed · No download available · No model active</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">Production execution remains unavailable</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">
              {candidateReviewDecision.aggregate.totalCandidates} candidates · {candidateReviewDecision.aggregate.needsMoreEvidenceCandidates} need more evidence · {candidateReviewDecision.aggregate.awaitingHumanDecisionCandidates} awaiting human decision · {candidateReviewDecision.aggregate.approvedForArtifactReviewCandidates} approved for artifact review · {candidateReviewDecision.aggregate.modelApprovedCandidates} model approved · {candidateReviewDecision.aggregate.activeModels} active models
            </p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{candidateReviewDecision.documentPath}</code>
        </div>
      </div>

      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-sky-200">Phase 5.3 official artifact variant and provenance evidence</p>
            <h3 className="mt-2 font-semibold text-dark-100">Official Artifact Variant & Provenance Evidence Review</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">Artifact evidence only · Human artifact selection still required · No artifact selected · No artifact approved</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">No checksum pinned · No download location configured · No benchmark passed · No download available · No model active</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">Production execution remains unavailable</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">
              {artifactEvidence.aggregate.totalCandidates} candidates · {artifactEvidence.aggregate.repositoryConfirmedCandidates} official repositories confirmed · {artifactEvidence.aggregate.selectedArtifacts} selected artifacts · {artifactEvidence.aggregate.approvedArtifacts} approved artifacts · {artifactEvidence.aggregate.downloadableArtifacts} downloadable artifacts · {artifactEvidence.aggregate.activeModels} active models
            </p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{artifactEvidence.documentPath}</code>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {artifactEvidence.candidateRows.map((candidate) => (
            <article key={candidate.candidateId} className="rounded-lg border border-dark-700 bg-dark-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-dark-400">{candidate.candidateTier} candidate · {candidate.modelClass}</p>
              <h4 className="mt-2 text-sm font-semibold text-dark-100">{candidate.officialRepositoryId}</h4>
              <p className="mt-1 text-xs leading-5 text-dark-400">{candidate.artifactFormat} · {candidate.aggregateSizeLabel}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-fuchsia-200">Phase 5.4 human artifact variant selection decision gate</p>
            <h3 className="mt-2 font-semibold text-dark-100">Human Artifact Variant Selection Decision Gate</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">Model and license review has not passed · More artifact evidence is required · Human artifact selection not recorded</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">No artifact selected · No artifact approved · No checksum pinned · No download location configured</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">No benchmark passed · No download available · No model active · Production execution remains unavailable</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">
              {artifactSelection.aggregate.totalCandidates} candidates · {artifactSelection.aggregate.blockedByModelLicenseReviewCandidates} blocked by model and license review · {artifactSelection.aggregate.needsMoreArtifactEvidenceCandidates} need more artifact evidence · {artifactSelection.aggregate.awaitingHumanSelectionCandidates} awaiting human selection · {artifactSelection.aggregate.selectedArtifacts} selected artifacts · {artifactSelection.aggregate.approvedArtifacts} approved artifacts · {artifactSelection.aggregate.downloadableArtifacts} downloadable artifacts · {artifactSelection.aggregate.activeModels} active models
            </p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{artifactSelection.documentPath}</code>
        </div>
      </div>

      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-cyan-200">Phase 5.5 official artifact integrity and exact size evidence</p>
            <h3 className="mt-2 font-semibold text-dark-100">{'Official Artifact Integrity, Exact Size & Checksum Evidence Review'}</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">Integrity evidence only · Exact weight size is not approved download size</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">No artifact selected · No artifact approved · No checksum pinned · No checksum verified</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">No download location configured · No benchmark passed · No download available · No model active · Production execution remains unavailable</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">
              {artifactIntegrityEvidence.aggregate.totalCandidates} candidates · {artifactIntegrityEvidence.aggregate.exactWeightSizeConfirmedCandidates} exact weight sizes confirmed · {artifactIntegrityEvidence.aggregate.integrityMetadataAvailableCandidates} with weight integrity metadata · {artifactIntegrityEvidence.aggregate.selectedArtifacts} selected artifacts · {artifactIntegrityEvidence.aggregate.approvedArtifacts} approved artifacts · {artifactIntegrityEvidence.aggregate.checksumPinnedArtifacts} checksums pinned · {artifactIntegrityEvidence.aggregate.checksumVerifiedArtifacts} checksums verified · {artifactIntegrityEvidence.aggregate.downloadableArtifacts} downloadable artifacts · {artifactIntegrityEvidence.aggregate.activeModels} active models
            </p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{artifactIntegrityEvidence.documentPath}</code>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {artifactIntegrityEvidence.candidateRows.map((candidate) => (
            <article key={candidate.candidateId} className="rounded-lg border border-dark-700 bg-dark-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-dark-400">{candidate.candidateTier} candidate · {candidate.modelClass}</p>
              <h4 className="mt-2 text-sm font-semibold text-dark-100">{candidate.officialRepositoryId}</h4>
              <p className="mt-1 text-xs leading-5 text-dark-400">{candidate.inventorySummary}</p>
              <p className="mt-1 text-xs leading-5 text-dark-400">{candidate.exactWeightSizeLabel}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-violet-200">Phase 5.6 model and artifact governance review packet</p>
            <h3 className="mt-2 font-semibold text-dark-100">{governanceReviewPacket.heading}</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">{'Governance review packet only'} · {governanceReviewPacket.reconciliationSummary}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{'Human governance decisions are not recorded'} · {'Some evidence remains unresolved'} · {governanceReviewPacket.runtimeBenchmarkSummary}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{governanceReviewPacket.approvalBoundarySummary}</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">
              {governanceReviewPacket.aggregate.totalCandidates} candidates · {governanceReviewPacket.aggregate.reconciliationIncompleteCandidates} reconciliation incomplete · {governanceReviewPacket.aggregate.satisfiedRequirements} requirements satisfied · {governanceReviewPacket.aggregate.unresolvedRequirements} unresolved · {governanceReviewPacket.aggregate.humanDecisionRequirements} human decisions · {governanceReviewPacket.aggregate.runtimeBenchmarkRequirements} runtime or benchmark deferrals · {governanceReviewPacket.aggregate.selectedArtifacts} selected artifacts · {governanceReviewPacket.aggregate.approvedArtifacts} approved artifacts · {governanceReviewPacket.aggregate.downloadableArtifacts} downloadable artifacts · {governanceReviewPacket.aggregate.activeModels} active models
            </p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{governanceReviewPacket.documentPath}</code>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {governanceReviewPacket.candidateRows.map((candidate) => (
            <article key={candidate.candidateId} className="rounded-lg border border-dark-700 bg-dark-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-dark-400">{candidate.candidateTier} candidate · {candidate.modelClass}</p>
              <h4 className="mt-2 text-sm font-semibold text-dark-100">{candidate.exactModelName}</h4>
              <p className="mt-1 text-xs leading-5 text-dark-400">{candidate.statusLabel}</p>
              <p className="mt-1 text-xs leading-5 text-dark-400">{candidate.requirementSummary}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-200">Phase 5.7 unresolved model governance evidence closure</p>
            <h3 className="mt-2 font-semibold text-dark-100">Unresolved Model Governance Evidence Closure Review</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">{'Evidence closure only'} · {'Historical evidence registries remain unchanged'}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{'Human governance decisions are not recorded'}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{governanceEvidenceClosure.tokenizerLicenseSummary} · {governanceEvidenceClosure.acceptableUseSummary}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{governanceEvidenceClosure.derivedHostingSummary} · {governanceEvidenceClosure.quantizationSummary}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{governanceEvidenceClosure.approvalBoundarySummary}</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">
              {governanceEvidenceClosure.aggregate.totalCandidates} candidates · {governanceEvidenceClosure.aggregate.totalRequirements} total requirement closures · {governanceEvidenceClosure.aggregate.factualEvidenceCollectedRequirements} factual evidence collected · {governanceEvidenceClosure.aggregate.sufficientForHumanDecisionRequirements} sufficient for human decision · {governanceEvidenceClosure.aggregate.unresolvedRequirements} unresolved · {governanceEvidenceClosure.aggregate.humanDecisionsRecorded} human decisions recorded · {governanceEvidenceClosure.aggregate.approvedModels} model approvals · {governanceEvidenceClosure.aggregate.selectedArtifacts} artifact selections · {governanceEvidenceClosure.aggregate.activeModels} active models
            </p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{governanceEvidenceClosure.documentPath}</code>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {governanceEvidenceClosure.candidateRows.map((candidate) => (
            <article key={candidate.candidateId} className="rounded-lg border border-dark-700 bg-dark-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-dark-400">{candidate.candidateTier} candidate · {candidate.modelClass}</p>
              <h4 className="mt-2 text-sm font-semibold text-dark-100">{candidate.exactModelName}</h4>
              <p className="mt-1 text-xs leading-5 text-dark-400">{candidate.statusLabel}</p>
              <p className="mt-1 text-xs leading-5 text-dark-400">{candidate.requirementSummary}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-sky-200">Phase 5.8 explicit human governance decision boundary</p>
            <h3 className="mt-2 font-semibold text-dark-100">Explicit Human Governance Decision Boundary</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">{'Human decisions are not recorded'} · {'Governance evidence is available for review'}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{humanGovernanceDecision.decisionSummary}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{humanGovernanceDecision.artifactSelectionBoundarySummary}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{humanGovernanceDecision.approvalBoundarySummary}</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">
              {humanGovernanceDecision.aggregate.totalCandidates} candidates · {humanGovernanceDecision.aggregate.totalDecisionItems} total required decisions · {humanGovernanceDecision.aggregate.recordedDecisionItems} recorded decisions · {humanGovernanceDecision.aggregate.governanceDecisionsCompleteCandidates} completed governance sessions · {humanGovernanceDecision.aggregate.candidatesEligibleForArtifactSelectionReview} candidates eligible for artifact-selection review · {humanGovernanceDecision.aggregate.selectedArtifacts} selected artifacts · {humanGovernanceDecision.aggregate.activeModels} active models
            </p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{humanGovernanceDecision.documentPath}</code>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {humanGovernanceDecision.candidateRows.map((candidate) => (
            <article key={candidate.candidateId} className="rounded-lg border border-dark-700 bg-dark-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-dark-400">{candidate.candidateTier} candidate · {candidate.modelClass}</p>
              <h4 className="mt-2 text-sm font-semibold text-dark-100">{candidate.exactModelName}</h4>
              <p className="mt-1 text-xs leading-5 text-dark-400">{candidate.statusLabel}</p>
              <p className="mt-1 text-xs leading-5 text-dark-400">{candidate.decisionSummary}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-violet-200">Phase 5.9 explicit human artifact selection recording boundary</p>
            <h3 className="mt-2 font-semibold text-dark-100">Explicit Human Artifact Selection Recording Boundary</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">{'Governance decisions are not complete'} · {'Artifact selection is unavailable'}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{'Human artifact selection is not recorded'}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{humanArtifactSelection.selectionSummary}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{humanArtifactSelection.artifactApprovalBoundarySummary}</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">
              {humanArtifactSelection.aggregate.totalCandidates} candidates · {humanArtifactSelection.aggregate.unavailableSelectionSessions} unavailable selection sessions · {humanArtifactSelection.aggregate.humanSelectionsRecorded} recorded selections · {humanArtifactSelection.aggregate.selectedArtifacts} selected artifacts · {humanArtifactSelection.aggregate.candidatesEligibleForArtifactApprovalReview} candidates eligible for artifact approval review · {humanArtifactSelection.aggregate.activeModels} active models
            </p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{humanArtifactSelection.documentPath}</code>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {humanArtifactSelection.candidateRows.map((candidate) => (
            <article key={candidate.candidateId} className="rounded-lg border border-dark-700 bg-dark-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-dark-400">{candidate.candidateTier} candidate · {candidate.modelClass}</p>
              <h4 className="mt-2 text-sm font-semibold text-dark-100">{candidate.exactModelName}</h4>
              <p className="mt-1 text-xs leading-5 text-dark-400">{candidate.statusLabel}</p>
              <p className="mt-1 text-xs leading-5 text-dark-400">{candidate.selectionSummary}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-dark-700 bg-dark-900 p-5">
          <h3 className="font-semibold text-dark-100">Phase 3 closeout</h3>
          <p className="mt-2 text-sm leading-6 text-dark-300">{viewModel.phase3Description}</p>
        </div>
        <div className="rounded-xl border border-dark-700 bg-dark-900 p-5">
          <h3 className="font-semibold text-dark-100">Phase 4 boundary</h3>
          <p className="mt-2 text-sm leading-6 text-dark-300">{viewModel.phase4Description}</p>
          <p className="mt-2 text-xs leading-5 text-dark-400">{viewModel.preferredTierNote}</p>
        </div>
      </div>

      <div className="space-y-4">
        {viewModel.groups.map((group) => {
          const Icon = statusIcons[group.status];
          return (
            <div key={group.status} className="rounded-xl border border-dark-700 bg-dark-900 p-5">
              <div className="flex items-start gap-3">
                <Icon size={19} className="mt-0.5 text-dark-200" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-dark-100">{group.label}</h3>
                  <p className="mt-1 text-xs leading-5 text-dark-400">{group.description}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {group.items.map((item) => (
                  <article key={item.id} className={`rounded-lg border p-4 ${statusClasses[item.status]}`}>
                    <h4 className="text-sm font-semibold">{item.label}</h4>
                    <p className="mt-2 text-xs leading-5 text-dark-300">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/app/ai/settings" className="flex items-center gap-2 rounded-xl border border-dark-700 bg-dark-900 px-4 py-3 text-sm text-dark-200 hover:border-primary-500/40">
          <Settings2 size={17} aria-hidden="true" />
          Open AI Settings and Privacy
        </Link>
        <Link to="/app/ai" className="flex items-center gap-2 rounded-xl border border-dark-700 bg-dark-900 px-4 py-3 text-sm text-dark-200 hover:border-primary-500/40">
          <ChevronLeft size={17} aria-hidden="true" />
          Back to AI Coach Hub
        </Link>
      </div>
    </section>
  );
}

export default LocalAIReadinessShell;
