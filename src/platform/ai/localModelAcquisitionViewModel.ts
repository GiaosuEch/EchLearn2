import { LOCAL_MODEL_APPROVAL_REGISTRY } from './localModelApprovalRegistry.ts';
import {
  buildCurrentLocalModelAcquisitionPreflight,
} from './localModelAcquisitionPreflight.ts';
import type {
  LocalAiAccessTier,
  LocalAiDeviceTier,
  LocalAiModelTier,
  LocalAiTierBenchmarkStatus,
} from './localAiDeviceTierTypes.ts';
import type {
  LocalModelAcquisitionBlockerId,
  LocalModelAcquisitionConfirmationStatus,
  LocalModelAcquisitionPreflightStatus,
} from './localModelAcquisitionTypes.ts';
import type { LocalRuntimeCapabilityResult } from './localRuntimeCapabilityTypes.ts';
import type { AIFeatureId } from './aiFeatureRegistry.ts';

export interface BuildLocalModelAcquisitionViewModelOptions {
  readonly accessTier?: LocalAiAccessTier;
  readonly benchmarkStatusByModelTier?: Partial<Record<LocalAiModelTier, LocalAiTierBenchmarkStatus>>;
  readonly confirmationStatusByCandidateId?: Readonly<Record<string, LocalModelAcquisitionConfirmationStatus>>;
}

export interface LocalModelAcquisitionCandidateViewModel {
  readonly candidateId: string;
  readonly displayName: string;
  readonly modelClassLabel: string;
  readonly candidateTier: LocalAiModelTier;
  readonly candidateDeviceTier: LocalAiDeviceTier;
  readonly status: LocalModelAcquisitionPreflightStatus;
  readonly statusLabel: string;
  readonly blockers: readonly LocalModelAcquisitionBlockerId[];
  readonly canOfferUserConfirmation: boolean;
  readonly canPlanFutureAcquisition: boolean;
  readonly modelActive: false;
}

export interface LocalModelAcquisitionViewModel {
  readonly heading: 'Local Model Acquisition Preflight';
  readonly policySummary: 'Policy only';
  readonly downloadStateSummary: 'No download started';
  readonly cacheStateSummary: 'No cache written';
  readonly modelStateSummary: 'No model active';
  readonly approvalSummary: string;
  readonly benchmarkSummary: string;
  readonly confirmationSummary: string;
  readonly coreAppSummary: string;
  readonly fallbackSummary: string;
  readonly documentPath: 'docs/ai/phase-4-local-model-acquisition-preflight.md';
  readonly candidateDeviceTier: LocalAiDeviceTier;
  readonly candidates: readonly LocalModelAcquisitionCandidateViewModel[];
  readonly blockers: readonly LocalModelAcquisitionBlockerId[];
  readonly warnings: readonly string[];
  readonly summary: {
    readonly totalCandidates: number;
    readonly blockedCandidates: number;
    readonly awaitingConfirmationCandidates: number;
    readonly preflightPassedCandidates: number;
    readonly downloadableCandidates: number;
    readonly activeModels: 0;
  };
  readonly featureAvailability: 'full-ui';
  readonly visibleFeatureIds: readonly AIFeatureId[];
  readonly canAttempt4B: false;
  readonly policyOnly: true;
  readonly modelActive: false;
}

function appendUnique<T>(items: T[], value: T): void {
  if (!items.includes(value)) items.push(value);
}

function statusLabel(status: LocalModelAcquisitionPreflightStatus): string {
  if (status === 'awaiting-user-confirmation') return 'Awaiting explicit confirmation';
  if (status === 'preflight-passed') return 'Policy preflight passed';
  return 'Blocked';
}

export function buildLocalModelAcquisitionViewModel(
  runtimeCapability: LocalRuntimeCapabilityResult,
  options: BuildLocalModelAcquisitionViewModelOptions = {},
): LocalModelAcquisitionViewModel {
  const results = LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) =>
    buildCurrentLocalModelAcquisitionPreflight({
      candidateId: candidate.candidateId,
      runtimeCapability,
      accessTier: options.accessTier ?? 'free',
      benchmarkStatusByModelTier: options.benchmarkStatusByModelTier,
      confirmationStatus: options.confirmationStatusByCandidateId?.[candidate.candidateId]
        ?? 'not-requested',
    }));
  const candidates: LocalModelAcquisitionCandidateViewModel[] = results.map((result) => ({
    candidateId: result.candidateId ?? 'missing-candidate',
    displayName: result.candidateDisplayName,
    modelClassLabel: result.parameterScaleLabel ?? 'Unknown model class',
    candidateTier: result.candidateTier ?? 'light',
    candidateDeviceTier: result.deviceGate.assignedTier,
    status: result.status,
    statusLabel: statusLabel(result.status),
    blockers: result.blockers,
    canOfferUserConfirmation: result.canOfferUserConfirmation,
    canPlanFutureAcquisition: result.canPlanFutureAcquisition,
    modelActive: false,
  }));
  const blockers: LocalModelAcquisitionBlockerId[] = [];
  const warnings: string[] = [];
  for (const result of results) {
    for (const blocker of result.blockers) appendUnique(blockers, blocker);
    for (const warning of result.warnings) appendUnique(warnings, warning);
  }
  const blockedCandidates = candidates.filter((candidate) => candidate.status === 'blocked').length;
  const awaitingConfirmationCandidates = candidates.filter(
    (candidate) => candidate.status === 'awaiting-user-confirmation',
  ).length;
  const preflightPassedCandidates = candidates.filter(
    (candidate) => candidate.status === 'preflight-passed',
  ).length;
  const downloadableCandidates = candidates.filter(
    (candidate) => candidate.canPlanFutureAcquisition,
  ).length;
  const firstGate = results[0]?.deviceGate;

  return {
    heading: 'Local Model Acquisition Preflight',
    policySummary: 'Policy only',
    downloadStateSummary: 'No download started',
    cacheStateSummary: 'No cache written',
    modelStateSummary: 'No model active',
    approvalSummary: 'Approval still required for every current model and artifact candidate.',
    benchmarkSummary: 'Benchmark still required; current benchmark statuses remain not-run.',
    confirmationSummary: 'Explicit confirmation is not available until prerequisites pass.',
    coreAppSummary: 'Core app remains available',
    fallbackSummary: 'Deterministic fallback remains available',
    documentPath: 'docs/ai/phase-4-local-model-acquisition-preflight.md',
    candidateDeviceTier: firstGate?.assignedTier ?? 'ultra-low',
    candidates,
    blockers,
    warnings,
    summary: {
      totalCandidates: candidates.length,
      blockedCandidates,
      awaitingConfirmationCandidates,
      preflightPassedCandidates,
      downloadableCandidates,
      activeModels: 0,
    },
    featureAvailability: firstGate?.featureAvailability ?? 'full-ui',
    visibleFeatureIds: firstGate?.visibleFeatureIds ?? [],
    canAttempt4B: false,
    policyOnly: true,
    modelActive: false,
  };
}
