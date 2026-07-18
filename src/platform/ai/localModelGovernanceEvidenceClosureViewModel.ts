import { listLocalModelGovernanceEvidenceClosures } from './localModelGovernanceEvidenceClosureRegistry.ts';
import type {
  LocalModelGovernanceEvidenceClosureCandidateRecord,
  LocalModelGovernanceEvidenceClosureStatus,
} from './localModelGovernanceEvidenceClosureTypes.ts';

export interface LocalModelGovernanceEvidenceClosureRow {
  readonly candidateId: string;
  readonly candidateTier: string;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly officialRepositoryId: string;
  readonly status: LocalModelGovernanceEvidenceClosureStatus;
  readonly statusLabel: string;
  readonly requirementSummary: string;
  readonly resolvedFactualRequirements: number;
  readonly unresolvedFactualRequirements: number;
  readonly humanDecisionRequirements: number;
  readonly humanReviewRequired: true;
  readonly humanDecisionRecorded: false;
  readonly modelApproved: false;
  readonly artifactSelected: false;
  readonly modelActive: false;
}

export interface LocalModelGovernanceEvidenceClosureViewModel {
  readonly heading: 'Unresolved Model Governance Evidence Closure Review';
  readonly closureSummary: 'Evidence closure only';
  readonly historySummary: 'Historical evidence registries remain unchanged';
  readonly humanDecisionBoundarySummary: 'Human governance decisions are not recorded';
  readonly tokenizerLicenseSummary: 'Tokenizer license scope now has official repository-distribution evidence; human review remains required';
  readonly acceptableUseSummary: 'Acceptable-use scope now has an official Qwen policy for open-source models; human review remains required';
  readonly derivedHostingSummary: 'Derived-artifact hosting requires human decision';
  readonly quantizationSummary: 'Quantization and conversion require human decision';
  readonly approvalBoundarySummary: 'No model approved · No artifact selected · No artifact approved · No benchmark passed · No download available · No model active · Production execution remains unavailable';
  readonly candidateRows: readonly LocalModelGovernanceEvidenceClosureRow[];
  readonly aggregate: {
    readonly totalCandidates: number;
    readonly totalRequirements: number;
    readonly factualEvidenceCollectedRequirements: number;
    readonly sufficientForHumanDecisionRequirements: number;
    readonly unresolvedRequirements: number;
    readonly noSeparatePolicyLocatedRequirements: number;
    readonly conflictingRequirements: number;
    readonly humanDecisionRequiredRequirements: number;
    readonly humanDecisionsRecorded: number;
    readonly approvedModels: number;
    readonly approvedLicenses: number;
    readonly selectedArtifacts: number;
    readonly approvedArtifacts: number;
    readonly downloadableArtifacts: number;
    readonly runtimeReadyArtifacts: number;
    readonly activeModels: number;
  };
  readonly unresolvedRequirements: readonly string[];
  readonly conflictingRequirements: readonly string[];
  readonly warnings: readonly string[];
  readonly documentPath: 'docs/ai/phase-5-model-governance-evidence-closure.md';
  readonly evidenceClosureOnly: true;
  readonly humanDecisionRecorded: false;
  readonly modelApproved: false;
  readonly modelActive: false;
}

function statusLabel(status: LocalModelGovernanceEvidenceClosureStatus): string {
  switch (status) {
    case 'factual-evidence-collected':
      return 'Factual evidence was collected; human governance review remains required.';
    case 'sufficient-for-human-decision':
      return 'Factual gaps are closed sufficiently for an explicit human governance decision.';
    case 'no-separate-policy-located':
      return 'No separate policy was located; this is not a not-applicable determination.';
    case 'conflicting-evidence':
      return 'Official evidence conflicts and must be resolved.';
    case 'rejected':
      return 'The reviewed evidence rejected this candidate scope.';
    default:
      return 'Official factual evidence remains unresolved.';
  }
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

export function buildLocalModelGovernanceEvidenceClosureViewModel(
  records: readonly LocalModelGovernanceEvidenceClosureCandidateRecord[] = listLocalModelGovernanceEvidenceClosures(),
): LocalModelGovernanceEvidenceClosureViewModel {
  const candidateRows = records.map((record): LocalModelGovernanceEvidenceClosureRow => ({
    candidateId: record.candidateId,
    candidateTier: record.candidateTier,
    modelClass: record.modelClass,
    exactModelName: record.exactModelName,
    officialRepositoryId: record.officialRepositoryId,
    status: record.status,
    statusLabel: statusLabel(record.status),
    requirementSummary: `${record.resolvedFactualRequirements.length} factual requirements resolved · ${record.unresolvedFactualRequirements.length} unresolved · ${record.humanDecisionRequirements.length} require human decisions`,
    resolvedFactualRequirements: record.resolvedFactualRequirements.length,
    unresolvedFactualRequirements: record.unresolvedFactualRequirements.length,
    humanDecisionRequirements: record.humanDecisionRequirements.length,
    humanReviewRequired: true,
    humanDecisionRecorded: false,
    modelApproved: false,
    artifactSelected: false,
    modelActive: false,
  }));

  const requirements = records.flatMap((record) => record.requirements);

  return {
    heading: 'Unresolved Model Governance Evidence Closure Review',
    closureSummary: 'Evidence closure only',
    historySummary: 'Historical evidence registries remain unchanged',
    humanDecisionBoundarySummary: 'Human governance decisions are not recorded',
    tokenizerLicenseSummary: 'Tokenizer license scope now has official repository-distribution evidence; human review remains required',
    acceptableUseSummary: 'Acceptable-use scope now has an official Qwen policy for open-source models; human review remains required',
    derivedHostingSummary: 'Derived-artifact hosting requires human decision',
    quantizationSummary: 'Quantization and conversion require human decision',
    approvalBoundarySummary: 'No model approved · No artifact selected · No artifact approved · No benchmark passed · No download available · No model active · Production execution remains unavailable',
    candidateRows,
    aggregate: {
      totalCandidates: records.length,
      totalRequirements: requirements.length,
      factualEvidenceCollectedRequirements: requirements.filter((item) => item.status === 'factual-evidence-collected').length,
      sufficientForHumanDecisionRequirements: requirements.filter((item) => item.status === 'sufficient-for-human-decision').length,
      unresolvedRequirements: requirements.filter((item) => item.status === 'unresolved').length,
      noSeparatePolicyLocatedRequirements: requirements.filter((item) => item.status === 'no-separate-policy-located').length,
      conflictingRequirements: requirements.filter((item) => item.status === 'conflicting-evidence').length,
      humanDecisionRequiredRequirements: requirements.filter((item) => item.humanDecisionRequired).length,
      humanDecisionsRecorded: records.filter((record) => record.humanDecisionRecorded).length,
      approvedModels: records.filter((record) => record.modelApproved).length,
      approvedLicenses: records.filter((record) => record.licenseApproved).length,
      selectedArtifacts: records.filter((record) => record.artifactSelected).length,
      approvedArtifacts: records.filter((record) => record.artifactApproved).length,
      downloadableArtifacts: records.filter((record) => record.downloadable).length,
      runtimeReadyArtifacts: records.filter((record) => record.runtimeReady).length,
      activeModels: records.filter((record) => record.modelActive).length,
    },
    unresolvedRequirements: unique(records.flatMap((record) => record.unresolvedFactualRequirements)),
    conflictingRequirements: unique(records.flatMap((record) => record.conflictingRequirements)),
    warnings: unique(records.flatMap((record) => record.warnings)),
    documentPath: 'docs/ai/phase-5-model-governance-evidence-closure.md',
    evidenceClosureOnly: true,
    humanDecisionRecorded: false,
    modelApproved: false,
    modelActive: false,
  };
}
