import {
  LOCAL_MODEL_APPROVAL_CHECKS,
  LOCAL_MODEL_APPROVAL_REGISTRY,
} from './localModelApprovalRegistry.ts';

export interface LocalModelApprovalCandidateViewModel {
  readonly candidateId: string;
  readonly displayName: string;
  readonly tierLabel: string;
  readonly reviewState: string;
  readonly blockerCount: number;
}

export interface LocalModelApprovalViewModel {
  readonly heading: string;
  readonly currentState: string;
  readonly verificationNote: string;
  readonly documentPath: string;
  readonly summary: {
    readonly totalCandidates: number;
    readonly approvedCandidates: number;
    readonly blockedCandidates: number;
    readonly pendingChecks: number;
  };
  readonly candidates: readonly LocalModelApprovalCandidateViewModel[];
  readonly nextRequiredChecks: readonly string[];
}

const tierLabels = {
  light: 'Light candidate',
  standard: 'Standard candidate',
  pro: 'Stronger-device candidate',
} as const;

export function buildLocalModelApprovalViewModel(): LocalModelApprovalViewModel {
  const approvedCandidates = LOCAL_MODEL_APPROVAL_REGISTRY.filter(
    (candidate) => candidate.approved,
  ).length;
  const blockedCandidates = LOCAL_MODEL_APPROVAL_REGISTRY.filter(
    (candidate) => candidate.approvalBlockers.length > 0,
  ).length;
  const pendingChecks = LOCAL_MODEL_APPROVAL_CHECKS.filter(
    (check) => !check.completed,
  );

  return {
    heading: 'Model license and artifact approval',
    currentState:
      'No model candidate is approved, downloadable, configured for runtime, or ready for generated coach content.',
    verificationNote:
      'Official source-model license metadata was reviewed online, but product, tokenizer, derivative, artifact, benchmark, and safety approval remain pending.',
    documentPath: 'docs/ai/phase-4-model-approval-checklist.md',
    summary: {
      totalCandidates: LOCAL_MODEL_APPROVAL_REGISTRY.length,
      approvedCandidates,
      blockedCandidates,
      pendingChecks: pendingChecks.length,
    },
    candidates: LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) => ({
      candidateId: candidate.candidateId,
      displayName: candidate.displayName,
      tierLabel: tierLabels[candidate.tier],
      reviewState: 'Blocked pending approval checks',
      blockerCount: candidate.approvalBlockers.length,
    })),
    nextRequiredChecks: pendingChecks.map((check) => check.label),
  };
}
