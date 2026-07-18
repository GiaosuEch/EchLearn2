import {
  listLocalModelCandidateEvidence,
  validateLocalModelCandidateEvidenceRegistry,
} from './localModelCandidateEvidenceRegistry.ts';
import type { LocalModelCandidateEvidenceStatus } from './localModelCandidateEvidenceTypes.ts';

export interface LocalModelCandidateEvidenceRow {
  readonly candidateId: string;
  readonly candidateTier: string;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly publisher: string;
  readonly licenseIdentifier: string;
  readonly evidenceStatus: LocalModelCandidateEvidenceStatus;
  readonly statusLabel: string;
  readonly missingEvidence: readonly string[];
  readonly conflicts: readonly string[];
  readonly humanReviewRequired: true;
  readonly modelApproved: false;
  readonly downloadable: false;
  readonly modelActive: false;
}

export interface LocalModelCandidateEvidenceViewModel {
  readonly heading: string;
  readonly reviewSummary: string;
  readonly approvalSummary: string;
  readonly modelApprovalSummary: string;
  readonly artifactApprovalSummary: string;
  readonly benchmarkSummary: string;
  readonly downloadSummary: string;
  readonly modelStateSummary: string;
  readonly executionSummary: string;
  readonly candidateRows: readonly LocalModelCandidateEvidenceRow[];
  readonly aggregate: {
    readonly totalCandidates: number;
    readonly notReviewedCandidates: number;
    readonly incompleteCandidates: number;
    readonly evidenceCollectedCandidates: number;
    readonly conflictingCandidates: number;
    readonly humanReviewRequiredCandidates: number;
    readonly approvedCandidates: 0;
    readonly downloadableCandidates: 0;
    readonly activeModels: 0;
  };
  readonly missingEvidence: readonly string[];
  readonly conflicts: readonly string[];
  readonly warnings: readonly string[];
  readonly documentPath: string;
  readonly evidenceOnly: true;
  readonly humanReviewRequired: true;
  readonly modelApproved: false;
  readonly modelActive: false;
}

function statusLabel(status: LocalModelCandidateEvidenceStatus): string {
  switch (status) {
    case 'evidence-collected': return 'Official evidence collected; human review remains required.';
    case 'conflicting-evidence': return 'Official evidence conflicts; candidate remains blocked.';
    case 'rejected': return 'Evidence indicates the candidate does not meet the review boundary.';
    case 'requires-human-review': return 'Evidence requires human product and legal review.';
    case 'not-reviewed': return 'Evidence has not been reviewed.';
    default: return 'Evidence incomplete; candidate remains blocked.';
  }
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

export function buildLocalModelCandidateEvidenceViewModel(): LocalModelCandidateEvidenceViewModel {
  const records = listLocalModelCandidateEvidence();
  const validation = validateLocalModelCandidateEvidenceRegistry();
  const candidateRows = records.map((record): LocalModelCandidateEvidenceRow => ({
    candidateId: record.candidateId,
    candidateTier: record.candidateTier,
    modelClass: record.modelClass,
    exactModelName: record.exactModelName,
    publisher: record.publisher,
    licenseIdentifier: record.licenseIdentifier ?? 'Unknown',
    evidenceStatus: record.evidenceStatus,
    statusLabel: statusLabel(record.evidenceStatus),
    missingEvidence: record.missingEvidence,
    conflicts: record.conflicts,
    humanReviewRequired: true,
    modelApproved: false,
    downloadable: false,
    modelActive: false,
  }));

  return {
    heading: 'Exact Model Candidate & License Evidence Review',
    reviewSummary: 'Evidence review only',
    approvalSummary: 'Human approval still required',
    modelApprovalSummary: 'No model approved',
    artifactApprovalSummary: 'No artifact approved',
    benchmarkSummary: 'No benchmark passed',
    downloadSummary: 'No download available',
    modelStateSummary: 'No model active',
    executionSummary: 'Production execution remains unavailable',
    candidateRows,
    aggregate: {
      totalCandidates: records.length,
      notReviewedCandidates: records.filter((record) => record.evidenceStatus === 'not-reviewed').length,
      incompleteCandidates: records.filter((record) => record.evidenceStatus === 'evidence-incomplete').length,
      evidenceCollectedCandidates: records.filter((record) => record.evidenceStatus === 'evidence-collected').length,
      conflictingCandidates: records.filter((record) => record.evidenceStatus === 'conflicting-evidence').length,
      humanReviewRequiredCandidates: records.filter((record) => record.humanReviewRequired).length,
      approvedCandidates: 0,
      downloadableCandidates: 0,
      activeModels: 0,
    },
    missingEvidence: unique(records.flatMap((record) => record.missingEvidence)),
    conflicts: unique(records.flatMap((record) => record.conflicts)),
    warnings: validation.valid
      ? ['Evidence collection does not constitute legal, model, artifact, benchmark, or runtime approval.']
      : validation.issues,
    documentPath: 'docs/ai/phase-5-model-candidate-license-evidence.md',
    evidenceOnly: true,
    humanReviewRequired: true,
    modelApproved: false,
    modelActive: false,
  };
}
