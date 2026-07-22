export type LocalModelPersistedSelectionArtifactApprovalReviewStatus =
  | 'review-not-requested' | 'selection-not-persisted' | 'approval-session-unavailable'
  | 'scope-mismatch' | 'failed-safe' | 'ready-for-human-approval';

export interface LocalModelPersistedSelectionArtifactApprovalReviewResult {
  readonly status: LocalModelPersistedSelectionArtifactApprovalReviewStatus;
  readonly persistedSelectionVerified: boolean;
  readonly approvalScopeVerified: boolean;
  readonly canBeginHumanApproval: boolean;
  readonly artifactApprovalPersisted: false;
  readonly artifactApproved: false;
  readonly checksumPinned: false;
  readonly checksumVerified: false;
  readonly downloadable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
}
type Value = Record<string, unknown>;
function record(value: unknown): value is Value { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function text(value: unknown): string | null { return typeof value === 'string' && value.length > 0 && value === value.trim() ? value : null; }
function result(status: LocalModelPersistedSelectionArtifactApprovalReviewStatus, persistedSelectionVerified = false, approvalScopeVerified = false, canBeginHumanApproval = false): LocalModelPersistedSelectionArtifactApprovalReviewResult {
  return { status, persistedSelectionVerified, approvalScopeVerified, canBeginHumanApproval, artifactApprovalPersisted: false, artifactApproved: false, checksumPinned: false, checksumVerified: false, downloadable: false, runtimeReady: false, modelActive: false };
}
export function evaluateLocalModelPersistedSelectionArtifactApprovalReview(input: { readonly persistenceResult: unknown; readonly approvalResult: unknown; readonly explicitApprovalReviewRequested: boolean }): LocalModelPersistedSelectionArtifactApprovalReviewResult {
  try {
    if (!record(input) || input.explicitApprovalReviewRequested !== true) return result('review-not-requested');
    if (!record(input.persistenceResult) || !record(input.approvalResult)) return result('failed-safe');
    const persisted = input.persistenceResult; const approval = input.approvalResult;
    const acknowledged = (persisted.status === 'inserted' || persisted.status === 'identical-existing-selection-envelope') && persisted.persistenceAcknowledged === true;
    if (!acknowledged) return result('selection-not-persisted');
    if (approval.status !== 'awaiting-human-approval' || approval.canRecordApproval !== true || approval.artifactSelectionRecorded !== true || approval.integrityPinPlanComplete !== true || approval.artifactApprovalComplete !== false) return result('approval-session-unavailable', true);
    const scope = approval.selectedArtifactScope; const plan = approval.integrityPinPlan;
    if (!record(scope) || !record(plan) || text(scope.candidateId) === null || text(scope.candidateTier) === null || text(scope.observedRevision) === null || scope.candidateId !== plan.candidateId || scope.candidateTier !== plan.candidateTier || scope.observedRevision !== plan.observedRevision || scope.selectedOptionId !== plan.selectedOptionId) return result('scope-mismatch', true);
    if (approval.artifactApproved !== false || approval.checksumPinned !== false || approval.checksumVerified !== false || approval.downloadable !== false || approval.runtimeReady !== false || approval.modelActive !== false) return result('scope-mismatch', true);
    return result('ready-for-human-approval', true, true, true);
  } catch { return result('failed-safe'); }
}
