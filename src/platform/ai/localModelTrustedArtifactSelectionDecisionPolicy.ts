import {
  validateMappedTrustedActorContextCompatibility,
} from './localModelTrustedActorContextAdapter.ts';
import type {
  LocalModelTrustedArtifactSelectionDecisionRequest,
  LocalModelTrustedArtifactSelectionDecisionResult,
  LocalModelTrustedArtifactSelectionDecisionStatus,
} from './localModelTrustedArtifactSelectionDecisionTypes.ts';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 && value === value.trim() ? value : null;
}

function baseResult(
  status: LocalModelTrustedArtifactSelectionDecisionStatus,
  options: Partial<LocalModelTrustedArtifactSelectionDecisionResult> = {},
): LocalModelTrustedArtifactSelectionDecisionResult {
  return {
    status,
    blockers: options.blockers ?? Object.freeze([]),
    warnings: options.warnings ?? Object.freeze([]),
    explicitDecisionRequested: options.explicitDecisionRequested ?? false,
    bridgeDecisionKey: options.bridgeDecisionKey ?? null,
    candidateId: options.candidateId ?? null,
    candidateTier: options.candidateTier ?? null,
    observedRevision: options.observedRevision ?? null,
    selectionOptionId: options.selectionOptionId ?? null,
    reviewVerified: options.reviewVerified ?? false,
    selectionVerified: options.selectionVerified ?? false,
    trustedReviewerVerified: options.trustedReviewerVerified ?? false,
    trustedSelectionDecisionReady: options.trustedSelectionDecisionReady ?? false,
    decisionPersisted: false,
    artifactSelected: false,
    artifactApproved: false,
    modelApproved: false,
    licenseApproved: false,
    checksumVerified: false,
    benchmarkVerified: false,
    downloadable: false,
    runtimeReady: false,
    modelActive: false,
  };
}

function reviewIsReady(review: UnknownRecord): boolean {
  return review.status === 'ready-for-human-selection'
    && review.explicitReviewRequested === true
    && review.bridgeVerified === true
    && review.selectionScopeVerified === true
    && review.canBeginHumanSelection === true
    && text(review.bridgeDecisionKey) !== null
    && text(review.candidateId) !== null
    && text(review.candidateTier) !== null
    && text(review.observedRevision) !== null;
}

function selectionMatchesReview(selection: UnknownRecord, review: UnknownRecord): boolean {
  const scope = selection.selectedScope;
  const selectedOptionId = text(selection.selectedOptionId);
  if (!isRecord(scope) || selectedOptionId === null) return false;
  if (
    selection.status !== 'selection-recorded'
    || selection.decision !== 'select'
    || selection.humanSelectionRecorded !== true
    || selection.selectionValidForCurrentScope !== true
    || selection.artifactSelected !== true
    || text(selection.candidateId) !== text(review.candidateId)
    || text(selection.candidateTier) !== text(review.candidateTier)
    || text(scope.candidateId) !== text(review.candidateId)
    || text(scope.candidateTier) !== text(review.candidateTier)
    || text(scope.observedRevision) !== text(review.observedRevision)
  ) return false;

  const selectedOption = Array.isArray(selection.availableOptions)
    ? selection.availableOptions.find((option) => isRecord(option) && option.optionId === selectedOptionId)
    : null;
  return isRecord(selectedOption)
    && text(selectedOption.candidateId) === text(review.candidateId)
    && text(selectedOption.candidateTier) === text(review.candidateTier)
    && text(selectedOption.observedRevision) === text(review.observedRevision);
}

function trustedReviewerIsReady(result: UnknownRecord): boolean {
  if (
    result.status !== 'trusted-context-ready'
    || result.trustedContextReady !== true
    || result.canSupplyActorContextToGovernanceRecord !== true
    || result.canOpenGovernanceDecisionDraft !== true
    || result.authenticationPerformedByAdapter !== false
    || result.authorizationPerformedByAdapter !== false
    || result.credentialsRead !== false
    || result.tokensRead !== false
  ) return false;
  return validateMappedTrustedActorContextCompatibility(result.mappedTrustedActorContext).valid;
}

export function evaluateLocalModelTrustedArtifactSelectionDecision(
  request: LocalModelTrustedArtifactSelectionDecisionRequest,
): LocalModelTrustedArtifactSelectionDecisionResult {
  try {
    if (!isRecord(request) || request.explicitDecisionRequested !== true) {
      return baseResult('decision-not-requested');
    }
    if (!isRecord(request.reviewResult) || !isRecord(request.selectionResult) || !isRecord(request.trustedActorResult)) {
      return baseResult('failed-safe', {
        explicitDecisionRequested: true,
        blockers: Object.freeze(['trusted-selection-decision-input-invalid']),
      });
    }

    const review = request.reviewResult;
    const selection = request.selectionResult;
    const trustedActor = request.trustedActorResult;
    const context = {
      explicitDecisionRequested: true,
      bridgeDecisionKey: text(review.bridgeDecisionKey),
      candidateId: text(review.candidateId),
      candidateTier: text(review.candidateTier),
      observedRevision: text(review.observedRevision),
      selectionOptionId: text(selection.selectedOptionId),
    };

    if (!reviewIsReady(review)) {
      return baseResult('review-not-ready', {
        ...context,
        blockers: Object.freeze(['artifact-selection-review-not-ready']),
      });
    }
    if (!selectionMatchesReview(selection, review)) {
      return baseResult('selection-not-recorded', {
        ...context,
        reviewVerified: true,
        blockers: Object.freeze(['selected-artifact-scope-not-verified']),
      });
    }
    if (!trustedReviewerIsReady(trustedActor)) {
      return baseResult('trusted-reviewer-unavailable', {
        ...context,
        reviewVerified: true,
        selectionVerified: true,
        blockers: Object.freeze(['trusted-reviewer-context-not-ready']),
      });
    }

    return baseResult('trusted-selection-decision-ready', {
      ...context,
      reviewVerified: true,
      selectionVerified: true,
      trustedReviewerVerified: true,
      trustedSelectionDecisionReady: true,
      warnings: Object.freeze([
        'This contract does not persist a decision, approve an artifact, verify integrity, download a model, initialize a runtime, or activate a model.',
      ]),
    });
  } catch {
    return baseResult('failed-safe', {
      blockers: Object.freeze(['trusted-selection-decision-failed-safe']),
    });
  }
}
