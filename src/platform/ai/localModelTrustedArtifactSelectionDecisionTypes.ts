export type LocalModelTrustedArtifactSelectionDecisionStatus =
  | 'decision-not-requested'
  | 'review-not-ready'
  | 'selection-not-recorded'
  | 'trusted-reviewer-unavailable'
  | 'scope-mismatch'
  | 'failed-safe'
  | 'trusted-selection-decision-ready';

export interface LocalModelTrustedArtifactSelectionDecisionRequest {
  readonly reviewResult: unknown;
  readonly selectionResult: unknown;
  readonly trustedActorResult: unknown;
  readonly explicitDecisionRequested: boolean;
}

export interface LocalModelTrustedArtifactSelectionDecisionResult {
  readonly status: LocalModelTrustedArtifactSelectionDecisionStatus;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly explicitDecisionRequested: boolean;
  readonly bridgeDecisionKey: string | null;
  readonly candidateId: string | null;
  readonly candidateTier: string | null;
  readonly observedRevision: string | null;
  readonly selectionOptionId: string | null;
  readonly reviewVerified: boolean;
  readonly selectionVerified: boolean;
  readonly trustedReviewerVerified: boolean;
  readonly trustedSelectionDecisionReady: boolean;
  readonly decisionPersisted: false;
  readonly artifactSelected: false;
  readonly artifactApproved: false;
  readonly modelApproved: false;
  readonly licenseApproved: false;
  readonly checksumVerified: false;
  readonly benchmarkVerified: false;
  readonly downloadable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
}
