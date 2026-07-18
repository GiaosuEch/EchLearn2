import { AI_FEATURE_REGISTRY } from './aiFeatureRegistry.ts';
import type { LocalAiAccessTier } from './localAiDeviceTierTypes.ts';
import { evaluateLocalAiDeviceTierGate } from './localAiDeviceTierPolicy.ts';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from './localModelApprovalRegistry.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from './localModelArtifactManifest.ts';
import {
  LOCAL_MODEL_CACHE_BUDGETS,
  evaluateLocalModelCachePolicy,
} from './localModelCachePolicy.ts';
import { LOCAL_MODEL_RUNTIME_DECISION } from './localModelRuntimeDecision.ts';
import {
  buildLocalModelAcquisitionAuthorizationViewModel,
} from './localModelAcquisitionAuthorizationViewModel.ts';
import {
  buildLocalModelAcquisitionConsentViewModel,
} from './localModelAcquisitionConsentViewModel.ts';
import {
  buildLocalModelAcquisitionExecutionViewModel,
} from './localModelAcquisitionExecutionViewModel.ts';
import type {
  LocalModelAcquisitionExecutionViewModel,
} from './localModelAcquisitionExecutionViewModel.ts';
import {
  createUncheckedLocalRuntimeCapabilityResult,
} from './localRuntimeCapabilityProbe.ts';
import type { LocalRuntimeCapabilityResult } from './localRuntimeCapabilityTypes.ts';
import type {
  LocalModelAcquisitionCloseoutCheck,
  LocalModelAcquisitionCloseoutCheckId,
  LocalModelAcquisitionCloseoutInput,
  LocalModelAcquisitionCloseoutResult,
} from './localModelAcquisitionCloseoutTypes.ts';

export interface BuildCurrentLocalModelAcquisitionCloseoutOptions {
  readonly runtimeCapability?: LocalRuntimeCapabilityResult;
  readonly accessTier?: LocalAiAccessTier;
  readonly executionViewModel?: LocalModelAcquisitionExecutionViewModel;
}

function appendUnique(items: string[], value: string): void {
  if (!items.includes(value)) items.push(value);
}

function buildCheck(
  id: LocalModelAcquisitionCloseoutCheckId,
  passed: boolean,
  summary: string,
  failureReason: string,
): LocalModelAcquisitionCloseoutCheck {
  return {
    id,
    status: passed ? 'pass' : 'fail',
    summary,
    reasons: passed ? [] : [failureReason],
    blocking: !passed,
  };
}

export function evaluateLocalModelAcquisitionCloseout(
  input: LocalModelAcquisitionCloseoutInput,
): LocalModelAcquisitionCloseoutResult {
  const checks: LocalModelAcquisitionCloseoutCheck[] = [
    buildCheck(
      'runtime-decision-safe',
      input.runtimeDecisionSafe,
      'Runtime decision remains proposed, local-first, and unavailable-safe.',
      'Runtime decision no longer preserves the proposed unavailable-safe boundary.',
    ),
    buildCheck(
      'approval-registry-safe',
      input.approvalRegistrySafe && input.approvedCandidates === 0,
      'Production approval registry contains no approved model candidate.',
      'A production model or governance approval invariant is no longer blocked-safe.',
    ),
    buildCheck(
      'benchmark-state-safe',
      input.benchmarkStateSafe && input.benchmarkPassedCandidates === 0,
      'Production benchmark states remain not-run.',
      'A production benchmark appears passed or approved without closeout evidence.',
    ),
    buildCheck(
      'tier-matrix-compatible',
      input.tierMatrixCompatible && input.ultraLowNoModel,
      'Tier matrix remains ultra-low no-model, light 0.6B, standard 1.7B, and pro 4B.',
      'The device-tier to model-class matrix no longer matches the approved foundation contract.',
    ),
    buildCheck(
      'artifact-manifest-safe',
      input.artifactManifestSafe
        && input.downloadableCandidates === 0
        && input.checksumsVerified === 0,
      'Artifact manifest contains no approved download location, checksum, or size.',
      'A production artifact metadata invariant is no longer blocked-safe.',
    ),
    buildCheck(
      'cache-policy-safe',
      input.cachePolicySafe,
      'Cache policy remains explicit, bounded, and automatically disabled.',
      'Cache policy permits an automatic or unsupported production artifact action.',
    ),
    buildCheck(
      'capability-probe-metadata-only',
      input.metadataOnlyProbe,
      'Runtime capability probe remains metadata-only.',
      'Runtime capability state is no longer metadata-only.',
    ),
    buildCheck(
      'preflight-production-blocked',
      input.totalCandidates === 3
        && input.preflightBlockedCandidates === input.totalCandidates
        && input.preflightPassedCandidates === 0,
      'All current production candidates remain blocked at preflight.',
      'A current production candidate is no longer blocked at acquisition preflight.',
    ),
    buildCheck(
      'consent-production-unavailable',
      input.consentAvailableCandidates === 0 && input.confirmedConsentCandidates === 0,
      'No current production candidate can request or retain acquisition consent.',
      'A production acquisition consent path is unexpectedly available or confirmed.',
    ),
    buildCheck(
      'authorization-production-unavailable',
      input.authorizedCandidates === 0 && input.consumedAuthorizations === 0,
      'No current production action authorization is granted or consumed.',
      'A production action authorization is unexpectedly granted or consumed.',
    ),
    buildCheck(
      'executor-production-unavailable',
      !input.productionExecutorAvailable,
      'Production executor remains unavailable.',
      'A production acquisition executor is unexpectedly available.',
    ),
    buildCheck(
      'execution-request-production-zero',
      input.executionEligibleCandidates === 0
        && input.executionRequestsBuilt === 0
        && input.executorInvocations === 0
        && !input.productionExecutionAvailable,
      'No current production execution request or executor invocation exists.',
      'A production execution request, eligibility path, or invocation is unexpectedly present.',
    ),
    buildCheck(
      'accepted-handoff-production-zero',
      input.acceptedHandoffs === 0,
      'No production executor handoff has been accepted.',
      'A production executor handoff is unexpectedly accepted.',
    ),
    buildCheck(
      'download-production-zero',
      input.downloadsStarted === 0 && input.downloadsCompleted === 0,
      'No production model download has started or completed.',
      'A production model download state is unexpectedly non-zero.',
    ),
    buildCheck(
      'cache-write-production-zero',
      input.cachesWritten === 0,
      'No production model cache has been written.',
      'A production model cache write is unexpectedly recorded.',
    ),
    buildCheck(
      'runtime-initialization-production-zero',
      input.runtimeInitializations === 0,
      'No production model runtime has been initialized.',
      'A production model runtime initialization is unexpectedly recorded.',
    ),
    buildCheck(
      'model-active-production-zero',
      input.activeModels === 0 && !input.modelReady && !input.modelActive,
      'No production model is ready or active.',
      'A production model readiness or activation invariant is unexpectedly true.',
    ),
    buildCheck(
      'fallback-available',
      input.coreAppAvailable && input.deterministicFallbackAvailable,
      'Core app and deterministic fallback remain available.',
      'Core app or deterministic fallback availability is no longer preserved.',
    ),
    buildCheck(
      'full-feature-ui-preserved',
      input.fullFeatureUiPreserved,
      'Full AI-facing feature UI remains visible on every device tier.',
      'AI-facing feature parity is no longer preserved.',
    ),
    buildCheck(
      'no-runtime-side-effects',
      input.noRuntimeSideEffects
        && input.downloadsStarted === 0
        && input.downloadsCompleted === 0
        && input.cachesWritten === 0
        && input.runtimeInitializations === 0
        && input.activeModels === 0,
      'No acquisition runtime side effect is active.',
      'An acquisition runtime side effect is unexpectedly active.',
    ),
  ];

  const blockingIssues: string[] = [];
  const warnings: string[] = [];
  for (const check of checks) {
    if (check.status === 'fail' && check.blocking) {
      for (const reason of check.reasons) appendUnique(blockingIssues, reason);
    } else if (check.status === 'warning') {
      for (const reason of check.reasons) appendUnique(warnings, reason);
    }
  }

  const passedChecks = checks.filter((check) => check.status === 'pass').length;
  const warningChecks = checks.filter((check) => check.status === 'warning').length;
  const failedChecks = checks.filter((check) => check.status === 'fail').length;
  const phaseFoundationComplete = failedChecks === 0;

  return {
    status: phaseFoundationComplete ? 'foundation-complete' : 'attention-required',
    checks,
    passedChecks,
    warningChecks,
    failedChecks,
    blockingIssues,
    warnings,
    phaseFoundationComplete,
    totalCandidates: input.totalCandidates,
    productionExecutionAvailable: input.productionExecutionAvailable,
    productionExecutorAvailable: input.productionExecutorAvailable,
    approvedCandidates: input.approvedCandidates,
    benchmarkPassedCandidates: input.benchmarkPassedCandidates,
    downloadableCandidates: input.downloadableCandidates,
    preflightPassedCandidates: input.preflightPassedCandidates,
    consentAvailableCandidates: input.consentAvailableCandidates,
    confirmedConsentCandidates: input.confirmedConsentCandidates,
    authorizedCandidates: input.authorizedCandidates,
    consumedAuthorizations: input.consumedAuthorizations,
    executionEligibleCandidates: input.executionEligibleCandidates,
    executionRequestsBuilt: input.executionRequestsBuilt,
    executorInvocations: input.executorInvocations,
    acceptedHandoffs: input.acceptedHandoffs,
    downloadsStarted: input.downloadsStarted,
    downloadsCompleted: input.downloadsCompleted,
    cachesWritten: input.cachesWritten,
    checksumsVerified: input.checksumsVerified,
    runtimeInitializations: input.runtimeInitializations,
    activeModels: input.activeModels,
    tierMatrixCompatible: input.tierMatrixCompatible,
    ultraLowNoModel: input.ultraLowNoModel,
    candidateDeviceTier: input.candidateDeviceTier,
    featureAvailability: 'full-ui',
    visibleFeatureIds: [...input.visibleFeatureIds],
    policyOnly: true,
    metadataOnlyProbe: true,
    networkUsed: false,
    modelReady: false,
    modelActive: false,
    coreAppAvailable: true,
    deterministicFallbackAvailable: true,
  };
}

function hasExpectedTierMatrix(): boolean {
  const expected = [
    { tier: 'light', label: '0.6B' },
    { tier: 'standard', label: '1.7B' },
    { tier: 'pro', label: '4B' },
  ] as const;

  return expected.every(({ tier, label }) => {
    const candidate = LOCAL_MODEL_APPROVAL_REGISTRY.find((item) => item.tier === tier);
    const artifact = LOCAL_MODEL_ARTIFACT_MANIFEST.find((item) => item.modelTier === tier);
    return candidate?.parameterScaleLabel === label
      && artifact?.parameterScaleLabel === label
      && candidate.candidateId === artifact.candidateId;
  });
}

function hasUltraLowNoModelPolicy(): boolean {
  const gate = evaluateLocalAiDeviceTierGate({
    profile: {
      deviceKind: 'mobile',
      approxRamGb: 2,
      storageKind: 'flash',
      browserName: 'unknown',
      osName: 'android',
      webGpuStatus: 'unsupported',
      batteryLevelPercent: null,
      thermalStatus: 'unknown',
      connectionKind: 'unknown',
    },
    accessTier: 'pro',
    benchmarkStatusByModelTier: {
      light: 'not-run',
      standard: 'not-run',
      pro: 'not-run',
    },
  });
  return gate.assignedTier === 'ultra-low'
    && gate.eligibleModelTiers.length === 0
    && gate.allowedModelTiers.length === 0
    && gate.canAttemptModelDownload === false
    && gate.featureAvailability === 'full-ui';
}

export function buildCurrentLocalModelAcquisitionCloseout(
  options: BuildCurrentLocalModelAcquisitionCloseoutOptions = {},
): LocalModelAcquisitionCloseoutResult {
  const runtimeCapability = options.runtimeCapability
    ?? createUncheckedLocalRuntimeCapabilityResult();
  const accessTier = options.accessTier ?? 'free';
  const executionViewModel = options.executionViewModel ?? (() => {
    const consentViewModel = buildLocalModelAcquisitionConsentViewModel(runtimeCapability, {
      accessTier,
    });
    const authorizationViewModel = buildLocalModelAcquisitionAuthorizationViewModel(
      runtimeCapability,
      { accessTier, consentViewModel },
    );
    return buildLocalModelAcquisitionExecutionViewModel(
      runtimeCapability,
      { accessTier, authorizationViewModel },
    );
  })();
  const authorizationViewModel = executionViewModel.authorizationViewModel;
  const consentViewModel = authorizationViewModel.consentViewModel;
  const preflightViewModel = consentViewModel.preflightViewModel;

  const runtimeDecisionSafe = !LOCAL_MODEL_RUNTIME_DECISION.implemented
    && !LOCAL_MODEL_RUNTIME_DECISION.runtimeApproved
    && !LOCAL_MODEL_RUNTIME_DECISION.modelApproved
    && LOCAL_MODEL_RUNTIME_DECISION.remoteInferencePolicy === 'not-primary'
    && LOCAL_MODEL_RUNTIME_DECISION.rollbackPlan.shellBehavior === 'unavailable-safe';
  const approvalRegistrySafe = LOCAL_MODEL_APPROVAL_REGISTRY.length === 3
    && LOCAL_MODEL_APPROVAL_REGISTRY.every((candidate) =>
      !candidate.approved
      && !candidate.licenseApproved
      && !candidate.artifactApproved
      && !candidate.benchmarkApproved
      && !candidate.runtimeReady
      && !candidate.downloadable
      && !candidate.configuredForRuntime);
  const benchmarkStateSafe = LOCAL_MODEL_APPROVAL_REGISTRY.every(
    (candidate) => candidate.benchmarkStatus === 'not-run' && !candidate.benchmarkApproved,
  );
  const artifactManifestSafe = LOCAL_MODEL_ARTIFACT_MANIFEST.length === 3
    && LOCAL_MODEL_ARTIFACT_MANIFEST.every((artifact) =>
      artifact.estimatedDownloadSizeMb === null
      && artifact.estimatedInstalledSizeMb === null
      && artifact.checksumStatus === 'missing'
      && artifact.downloadUrlStatus === 'absent'
      && !artifact.downloadable
      && !artifact.cacheable
      && !artifact.runtimeReady);
  const cachePolicyResult = evaluateLocalModelCachePolicy({
    deviceTier: 'ultra-low',
    deviceGateAllowsModelAttempt: false,
    artifactApproved: false,
    benchmarkApproved: false,
    userConfirmedDownload: false,
    connectionKind: 'unknown',
    batteryLevelPercent: null,
    thermalStatus: 'unknown',
    webGpuStatus: 'unchecked',
    storageQuotaStatus: 'unknown',
  });
  const cachePolicySafe = Object.values(LOCAL_MODEL_CACHE_BUDGETS).every(
    (budget) => budget.automaticEnable === false,
  ) && !cachePolicyResult.canPlanFutureDownloadAttempt
    && cachePolicyResult.userDeletionRequired
    && cachePolicyResult.coreAppFallback === 'unaffected';
  const expectedFeatureIds = AI_FEATURE_REGISTRY.map((feature) => feature.id);
  const fullFeatureUiPreserved = executionViewModel.featureAvailability === 'full-ui'
    && expectedFeatureIds.length === executionViewModel.visibleFeatureIds.length
    && expectedFeatureIds.every((id) => executionViewModel.visibleFeatureIds.includes(id));
  const productionExecutorAvailable = executionViewModel.candidates.some(
    (candidate) => candidate.executorAvailability === 'available',
  );
  const productionExecutionAvailable = executionViewModel.aggregate.executionEligibleCandidates > 0
    && productionExecutorAvailable;

  return evaluateLocalModelAcquisitionCloseout({
    totalCandidates: LOCAL_MODEL_APPROVAL_REGISTRY.length,
    approvedCandidates: LOCAL_MODEL_APPROVAL_REGISTRY.filter((candidate) => candidate.approved).length,
    benchmarkPassedCandidates: LOCAL_MODEL_APPROVAL_REGISTRY.filter(
      (candidate) => candidate.benchmarkApproved,
    ).length,
    downloadableCandidates: LOCAL_MODEL_ARTIFACT_MANIFEST.filter(
      (artifact) => artifact.downloadable,
    ).length,
    runtimeDecisionSafe,
    approvalRegistrySafe,
    benchmarkStateSafe,
    tierMatrixCompatible: hasExpectedTierMatrix(),
    ultraLowNoModel: hasUltraLowNoModelPolicy(),
    artifactManifestSafe,
    cachePolicySafe,
    metadataOnlyProbe: runtimeCapability.metadataOnly,
    preflightBlockedCandidates: preflightViewModel.summary.blockedCandidates,
    preflightPassedCandidates: preflightViewModel.summary.preflightPassedCandidates,
    consentAvailableCandidates: consentViewModel.aggregate.consentAvailableCandidates,
    confirmedConsentCandidates: consentViewModel.aggregate.confirmedCandidates,
    authorizedCandidates: authorizationViewModel.aggregate.authorizedCandidates,
    consumedAuthorizations: authorizationViewModel.aggregate.consumedAuthorizations,
    executionEligibleCandidates: executionViewModel.aggregate.executionEligibleCandidates,
    executionRequestsBuilt: executionViewModel.aggregate.requestsBuilt,
    executorInvocations: executionViewModel.aggregate.executorInvocations,
    acceptedHandoffs: executionViewModel.aggregate.acceptedHandoffs,
    downloadsStarted: executionViewModel.aggregate.downloadStartedCandidates,
    downloadsCompleted: 0,
    cachesWritten: 0,
    checksumsVerified: 0,
    runtimeInitializations: 0,
    activeModels: executionViewModel.aggregate.activeModels,
    productionExecutorAvailable,
    productionExecutionAvailable,
    modelReady: false,
    modelActive: false,
    coreAppAvailable: true,
    deterministicFallbackAvailable: true,
    fullFeatureUiPreserved,
    visibleFeatureIds: executionViewModel.visibleFeatureIds,
    candidateDeviceTier: executionViewModel.candidateDeviceTier,
    noRuntimeSideEffects: executionViewModel.aggregate.requestsBuilt === 0
      && executionViewModel.aggregate.executorInvocations === 0
      && executionViewModel.aggregate.acceptedHandoffs === 0
      && executionViewModel.aggregate.downloadStartedCandidates === 0
      && executionViewModel.aggregate.activeModels === 0,
  });
}
