import { getLocalModelGovernanceEvidenceClosure } from './localModelGovernanceEvidenceClosureRegistry.ts';
import {
  listCurrentLocalModelGovernanceReviewWorkspaceResults,
} from './localModelGovernanceReviewWorkspacePolicy.ts';
import type {
  LocalModelGovernanceReviewWorkspaceResult,
  LocalModelGovernanceReviewWorkspaceStatus,
} from './localModelGovernanceReviewWorkspaceTypes.ts';

export interface LocalModelGovernanceReviewWorkspaceRow {
  readonly candidateId: string;
  readonly candidateTier: LocalModelGovernanceReviewWorkspaceResult['candidateTier'];
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly status: LocalModelGovernanceReviewWorkspaceStatus;
  readonly statusLabel: string;
  readonly recordedDecisionCount: number;
  readonly canonicalRecordFinalized: boolean;
  readonly recordPersisted: false;
  readonly modelActive: false;
}

export interface LocalModelGovernanceReviewWorkspaceViewModel {
  readonly heading: string;
  readonly phaseSummary: string;
  readonly trustedActorBoundarySummary: string;
  readonly workspaceAccessSummary: string;
  readonly decisionDraftSummary: string;
  readonly finalizationSummary: string;
  readonly persistenceBoundarySummary: string;
  readonly downstreamBoundarySummary: string;
  readonly candidateRows: readonly LocalModelGovernanceReviewWorkspaceRow[];
  readonly aggregate: {
    readonly totalCandidates: number;
    readonly lockedWorkspaces: number;
    readonly readyForReviewWorkspaces: number;
    readonly draftInProgressWorkspaces: number;
    readonly readyToFinalizeWorkspaces: number;
    readonly finalizeRequestedWorkspaces: number;
    readonly finalizedProceedWorkspaces: number;
    readonly finalizedRejectedWorkspaces: number;
    readonly finalizedMoreEvidenceWorkspaces: number;
    readonly invalidatedWorkspaces: number;
    readonly attentionRequiredWorkspaces: number;
    readonly trustedActorContexts: number;
    readonly decisionItemsRecorded: number;
    readonly canonicalRecordsFinalized: number;
    readonly recordsEligibleForTrustedPersistenceReview: number;
    readonly recordsEligibleForArtifactSelectionReview: number;
    readonly recordsPersisted: number;
    readonly recordsAppliedDownstream: number;
    readonly approvedModels: number;
    readonly approvedLicenses: number;
    readonly selectedArtifacts: number;
    readonly approvedArtifacts: number;
    readonly downloadableArtifacts: number;
    readonly runtimeReadyArtifacts: number;
    readonly activeModels: number;
  };
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly documentPath: string;
  readonly workspaceBoundaryOnly: true;
  readonly recordsPersisted: 0;
  readonly activeModels: 0;
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

function statusLabel(status: LocalModelGovernanceReviewWorkspaceStatus): string {
  switch (status) {
    case 'locked-no-trusted-context':
      return 'The workspace is locked until a trusted external actor context is available.';
    case 'ready-for-review':
      return 'A trusted context is available; review has not started.';
    case 'draft-in-progress':
      return 'An in-memory governance draft is in progress.';
    case 'ready-to-finalize':
      return 'Four explicit decisions exist; a separate finalize request is still required.';
    case 'finalize-requested':
      return 'Explicit finalization has been requested through the canonical record policy.';
    case 'finalized-proceed':
      return 'A canonical proceed record exists in memory for later trusted operations only.';
    case 'finalized-rejected':
      return 'A canonical rejected record exists in memory for later trusted operations only.';
    case 'finalized-more-evidence':
      return 'A canonical more-evidence record exists in memory for later trusted operations only.';
    case 'invalidated':
      return 'The actor, candidate, evidence, or policy scope changed.';
    case 'attention-required':
      return 'The workspace input or event contract requires attention.';
    default:
      return 'The governance workspace is unavailable.';
  }
}

export function buildLocalModelGovernanceReviewWorkspaceViewModel(
  results: readonly LocalModelGovernanceReviewWorkspaceResult[] = listCurrentLocalModelGovernanceReviewWorkspaceResults(),
): LocalModelGovernanceReviewWorkspaceViewModel {
  const candidateRows = results.map((result): LocalModelGovernanceReviewWorkspaceRow => {
    const record = getLocalModelGovernanceEvidenceClosure(result.candidateId);
    return {
      candidateId: result.candidateId,
      candidateTier: result.candidateTier,
      modelClass: record?.modelClass ?? '',
      exactModelName: record?.exactModelName ?? '',
      status: result.status,
      statusLabel: statusLabel(result.status),
      recordedDecisionCount: result.recordedDecisionCount,
      canonicalRecordFinalized: result.canonicalRecordFinalized,
      recordPersisted: false,
      modelActive: false,
    };
  });

  return {
    heading: 'Trusted Admin Governance Review Workspace Boundary',
    phaseSummary: 'Phase 6.3 defines a read-only production workspace boundary with pure in-memory review state',
    trustedActorBoundarySummary: 'No trusted actor context is available',
    workspaceAccessSummary: 'Governance review workspaces are locked',
    decisionDraftSummary: 'No governance decision draft has been started · No governance decisions have been recorded',
    finalizationSummary: 'No finalize request has been made · No canonical governance record has been finalized',
    persistenceBoundarySummary: 'No record has been persisted',
    downstreamBoundarySummary: 'No record has been applied downstream · No model approved · No license approved · No artifact selected · No download available · No model active · Production execution remains unavailable',
    candidateRows,
    aggregate: {
      totalCandidates: results.length,
      lockedWorkspaces: results.filter((result) => result.status === 'locked-no-trusted-context').length,
      readyForReviewWorkspaces: results.filter((result) => result.status === 'ready-for-review').length,
      draftInProgressWorkspaces: results.filter((result) => result.status === 'draft-in-progress').length,
      readyToFinalizeWorkspaces: results.filter((result) => result.status === 'ready-to-finalize').length,
      finalizeRequestedWorkspaces: results.filter((result) => result.status === 'finalize-requested').length,
      finalizedProceedWorkspaces: results.filter((result) => result.status === 'finalized-proceed').length,
      finalizedRejectedWorkspaces: results.filter((result) => result.status === 'finalized-rejected').length,
      finalizedMoreEvidenceWorkspaces: results.filter((result) => result.status === 'finalized-more-evidence').length,
      invalidatedWorkspaces: results.filter((result) => result.status === 'invalidated').length,
      attentionRequiredWorkspaces: results.filter((result) => result.status === 'attention-required').length,
      trustedActorContexts: results.filter((result) => result.trustedContextReady).length,
      decisionItemsRecorded: results.reduce((sum, result) => sum + result.recordedDecisionCount, 0),
      canonicalRecordsFinalized: results.filter((result) => result.canonicalRecordFinalized).length,
      recordsEligibleForTrustedPersistenceReview: results.filter((result) => result.canProceedToTrustedPersistenceReview).length,
      recordsEligibleForArtifactSelectionReview: results.filter((result) => result.canProceedToArtifactSelectionRecordingReview).length,
      recordsPersisted: results.filter((result) => result.recordPersisted).length,
      recordsAppliedDownstream: results.filter((result) => result.recordAppliedDownstream).length,
      approvedModels: results.filter((result) => result.modelApproved).length,
      approvedLicenses: results.filter((result) => result.licenseApproved).length,
      selectedArtifacts: results.filter((result) => result.artifactSelected).length,
      approvedArtifacts: results.filter((result) => result.artifactApproved).length,
      downloadableArtifacts: results.filter((result) => result.downloadable).length,
      runtimeReadyArtifacts: results.filter((result) => result.runtimeReady).length,
      activeModels: results.filter((result) => result.modelActive).length,
    },
    blockers: unique(results.flatMap((result) => result.blockers)),
    warnings: unique(results.flatMap((result) => result.warnings)),
    documentPath: 'docs/ai/phase-6-trusted-governance-review-workspace.md',
    workspaceBoundaryOnly: true,
    recordsPersisted: 0,
    activeModels: 0,
  };
}
