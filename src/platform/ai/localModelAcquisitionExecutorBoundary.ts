import {
  applyLocalModelAcquisitionAuthorizationEvent,
  revalidateLocalModelAcquisitionAuthorization,
} from './localModelAcquisitionAuthorizationPolicy.ts';
import type {
  LocalModelAcquisitionAuthorizationSession,
} from './localModelAcquisitionAuthorizationTypes.ts';
import type {
  LocalModelAcquisitionExecutionBoundaryResult,
  LocalModelAcquisitionExecutionRequest,
  LocalModelAcquisitionExecutor,
  LocalModelAcquisitionExecutorBoundaryInput,
  LocalModelAcquisitionExecutorResponse,
  LocalModelAcquisitionHandoffOutcome,
} from './localModelAcquisitionExecutionTypes.ts';

export const LOCAL_MODEL_ACQUISITION_EXECUTION_BOUNDARY_REVISION = 1 as const;

function uniqueStrings(items: readonly string[]): string[] {
  const result: string[] = [];
  for (const item of items) {
    if (typeof item !== 'string' || item.length === 0 || result.includes(item)) continue;
    result.push(item);
  }
  return result;
}

function isPositiveFinite(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && value > 0;
}

function hasText(value: string | null): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

function boundaryResult(
  input: LocalModelAcquisitionExecutorBoundaryInput,
  resultingAuthorizationSession: LocalModelAcquisitionAuthorizationSession,
  options: {
    readonly outcome: LocalModelAcquisitionHandoffOutcome;
    readonly request?: LocalModelAcquisitionExecutionRequest | null;
    readonly executorInvoked?: boolean;
    readonly executorAcceptedHandoff?: boolean;
    readonly authorizationConsumed?: boolean;
    readonly reasons?: readonly string[];
    readonly warnings?: readonly string[];
  },
): LocalModelAcquisitionExecutionBoundaryResult {
  const request = options.request ?? null;
  return {
    outcome: options.outcome,
    request,
    requestBuilt: request !== null,
    executorInvoked: options.executorInvoked ?? false,
    executorAcceptedHandoff: options.executorAcceptedHandoff ?? false,
    authorizationConsumed: options.authorizationConsumed ?? false,
    originalAuthorizationSession: input.authorizationSession,
    resultingAuthorizationSession,
    reasons: uniqueStrings(options.reasons ?? []),
    warnings: uniqueStrings(options.warnings ?? []),
    policyOnly: true,
    boundaryOnly: true,
    networkUsed: false,
    downloadStarted: false,
    downloadCompleted: false,
    cacheWritten: false,
    checksumVerified: false,
    runtimeInitialized: false,
    modelReady: false,
    modelActive: false,
    generatedOutputProduced: false,
  };
}

export function createUnavailableLocalModelAcquisitionExecutor(): LocalModelAcquisitionExecutor {
  return {
    availability: 'unavailable',
    async acceptHandoff(): Promise<LocalModelAcquisitionExecutorResponse> {
      return {
        outcome: 'executor-unavailable',
        requestAccepted: false,
        executorAvailable: false,
        reasons: ['executor-unavailable'],
        warnings: [],
      };
    },
  };
}

export function buildLocalModelAcquisitionExecutionRequest(
  input: LocalModelAcquisitionExecutorBoundaryInput,
): LocalModelAcquisitionExecutionRequest | null {
  const authorization = revalidateLocalModelAcquisitionAuthorization(
    input.authorizationSession,
    input.currentAuthorizationInput,
  );
  const scope = authorization.scope;

  if (
    authorization.state !== 'authorized'
    || !authorization.authorizationGranted
    || !authorization.authorizationValidForCurrentScope
    || authorization.authorizationConsumed
    || !authorization.futureExecutorHandoffAllowed
    || !hasText(scope.candidateId)
    || scope.candidateTier === null
    || !hasText(scope.artifactCandidateId)
    || !isPositiveFinite(scope.estimatedDownloadSizeMb)
    || !isPositiveFinite(scope.expectedStorageImpactMb)
    || !isPositiveInteger(scope.disclosureRevision)
    || !isPositiveInteger(scope.authorizationPolicyRevision)
  ) {
    return null;
  }

  return {
    candidateId: scope.candidateId,
    candidateTier: scope.candidateTier,
    artifactCandidateId: scope.artifactCandidateId,
    estimatedDownloadSizeMb: scope.estimatedDownloadSizeMb,
    expectedStorageImpactMb: scope.expectedStorageImpactMb,
    disclosureRevision: scope.disclosureRevision,
    authorizationPolicyRevision: scope.authorizationPolicyRevision,
    executionBoundaryRevision: LOCAL_MODEL_ACQUISITION_EXECUTION_BOUNDARY_REVISION,
    accessTier: scope.accessTier,
    assignedDeviceTier: scope.assignedDeviceTier,
    benchmarkStatus: scope.benchmarkStatus,
    authorizationScope: { ...scope },
    oneAttemptOnly: true,
  };
}

function normalizeExecutorResponse(
  response: unknown,
): {
  readonly outcome: Exclude<LocalModelAcquisitionHandoffOutcome, 'not-requested' | 'blocked'>;
  readonly accepted: boolean;
  readonly reasons: readonly string[];
  readonly warnings: readonly string[];
} {
  if (typeof response !== 'object' || response === null) {
    return {
      outcome: 'failed',
      accepted: false,
      reasons: ['executor-response-invalid'],
      warnings: [],
    };
  }

  const candidate = response as Partial<LocalModelAcquisitionExecutorResponse>;
  if (candidate.executorAvailable !== true || candidate.outcome === 'executor-unavailable') {
    return {
      outcome: 'executor-unavailable',
      accepted: false,
      reasons: ['executor-unavailable'],
      warnings: [],
    };
  }

  if (candidate.outcome === 'handoff-accepted' && candidate.requestAccepted === true) {
    return {
      outcome: 'handoff-accepted',
      accepted: true,
      reasons: ['executor-accepted-contract-handoff'],
      warnings: [],
    };
  }

  if (candidate.outcome === 'rejected' || candidate.requestAccepted === false) {
    return {
      outcome: 'rejected',
      accepted: false,
      reasons: ['executor-rejected-handoff'],
      warnings: [],
    };
  }

  if (candidate.outcome === 'failed') {
    return {
      outcome: 'failed',
      accepted: false,
      reasons: ['executor-handoff-failed'],
      warnings: [],
    };
  }

  return {
    outcome: 'failed',
    accepted: false,
    reasons: ['executor-response-invalid'],
    warnings: [],
  };
}

export async function executeLocalModelAcquisitionHandoff(
  input: LocalModelAcquisitionExecutorBoundaryInput,
  executor: LocalModelAcquisitionExecutor = createUnavailableLocalModelAcquisitionExecutor(),
): Promise<LocalModelAcquisitionExecutionBoundaryResult> {
  const revalidatedAuthorization = revalidateLocalModelAcquisitionAuthorization(
    input.authorizationSession,
    input.currentAuthorizationInput,
  );
  const request = buildLocalModelAcquisitionExecutionRequest({
    authorizationSession: revalidatedAuthorization,
    currentAuthorizationInput: input.currentAuthorizationInput,
  });

  if (request === null) {
    return boundaryResult(input, revalidatedAuthorization, {
      outcome: 'blocked',
      reasons: revalidatedAuthorization.reasons.length > 0
        ? revalidatedAuthorization.reasons
        : ['authorization-not-ready-for-handoff'],
      warnings: revalidatedAuthorization.warnings,
    });
  }

  if (executor.availability !== 'available') {
    return boundaryResult(input, revalidatedAuthorization, {
      outcome: 'executor-unavailable',
      request,
      reasons: ['executor-unavailable'],
    });
  }

  let normalized: ReturnType<typeof normalizeExecutorResponse>;
  try {
    normalized = normalizeExecutorResponse(await executor.acceptHandoff(request));
  } catch {
    return boundaryResult(input, revalidatedAuthorization, {
      outcome: 'failed',
      request,
      executorInvoked: true,
      reasons: ['executor-handoff-failed'],
    });
  }

  if (!normalized.accepted) {
    return boundaryResult(input, revalidatedAuthorization, {
      outcome: normalized.outcome,
      request,
      executorInvoked: true,
      reasons: normalized.reasons,
      warnings: normalized.warnings,
    });
  }

  const consumed = applyLocalModelAcquisitionAuthorizationEvent(
    revalidatedAuthorization,
    { type: 'consume' },
    input.currentAuthorizationInput,
  );
  if (consumed.state !== 'consumed' || !consumed.authorizationConsumed) {
    return boundaryResult(input, revalidatedAuthorization, {
      outcome: 'failed',
      request,
      executorInvoked: true,
      reasons: ['authorization-consume-failed'],
    });
  }

  return boundaryResult(input, consumed, {
    outcome: 'handoff-accepted',
    request,
    executorInvoked: true,
    executorAcceptedHandoff: true,
    authorizationConsumed: true,
    reasons: normalized.reasons,
    warnings: normalized.warnings,
  });
}
