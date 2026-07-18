import {
  listLocalModelArtifactEvidence,
  validateLocalModelArtifactEvidenceRegistry,
} from './localModelArtifactEvidenceRegistry.ts';
import type {
  LocalModelArtifactEvidenceRecord,
  LocalModelArtifactEvidenceStatus,
  LocalModelArtifactFormat,
} from './localModelArtifactEvidenceTypes.ts';

export interface LocalModelArtifactEvidenceRow {
  readonly candidateId: string;
  readonly candidateTier: string;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly officialRepositoryId: string;
  readonly evidenceStatus: LocalModelArtifactEvidenceStatus;
  readonly statusLabel: string;
  readonly observedRevision: string | null;
  readonly revisionStatusLabel: string;
  readonly artifactFormat: LocalModelArtifactFormat;
  readonly aggregateSizeLabel: string;
  readonly weightShardCount: number | null;
  readonly officialQuantizedVariantAvailable: string;
  readonly artifactSelected: false;
  readonly artifactApproved: false;
  readonly modelActive: false;
}

export interface LocalModelArtifactEvidenceViewModel {
  readonly heading: 'Official Artifact Variant & Provenance Evidence Review';
  readonly evidenceSummary: 'Artifact evidence only';
  readonly provenanceSummary: 'Official repository and immutable revision evidence recorded for review';
  readonly selectionSummary: 'Human artifact selection still required';
  readonly artifactSelectionSummary: 'No artifact selected';
  readonly artifactApprovalSummary: 'No artifact approved';
  readonly checksumSummary: 'No checksum pinned';
  readonly downloadLocationSummary: 'No download location configured';
  readonly benchmarkSummary: 'No benchmark passed';
  readonly downloadSummary: 'No download available';
  readonly modelStateSummary: 'No model active';
  readonly executionSummary: 'Production execution remains unavailable';
  readonly candidateRows: readonly LocalModelArtifactEvidenceRow[];
  readonly aggregate: {
    readonly totalCandidates: number;
    readonly repositoryConfirmedCandidates: number;
    readonly incompleteCandidates: number;
    readonly evidenceCollectedCandidates: number;
    readonly conflictingCandidates: number;
    readonly immutableRevisionConfirmedCandidates: number;
    readonly sizeConfirmedCandidates: number;
    readonly selectedArtifacts: number;
    readonly approvedArtifacts: number;
    readonly downloadableArtifacts: number;
    readonly runtimeReadyArtifacts: number;
    readonly activeModels: number;
  };
  readonly missingEvidence: readonly string[];
  readonly conflicts: readonly string[];
  readonly warnings: readonly string[];
  readonly documentPath: 'docs/ai/phase-5-model-artifact-provenance-evidence.md';
  readonly evidenceOnly: true;
  readonly artifactSelected: false;
  readonly artifactApproved: false;
  readonly modelActive: false;
}

function statusLabel(record: LocalModelArtifactEvidenceRecord): string {
  switch (record.evidenceStatus) {
    case 'evidence-collected':
      return 'Official artifact evidence collected; human selection and approval remain required.';
    case 'conflicting-evidence':
      return 'Official artifact sources conflict and require review.';
    case 'repository-not-found':
      return 'The exact official repository could not be confirmed.';
    case 'rejected':
      return 'Artifact evidence was rejected for product review.';
    default:
      return 'Official provenance evidence remains incomplete.';
  }
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

export function buildLocalModelArtifactEvidenceViewModel(
  records: readonly LocalModelArtifactEvidenceRecord[] = listLocalModelArtifactEvidence(),
): LocalModelArtifactEvidenceViewModel {
  const validation = validateLocalModelArtifactEvidenceRegistry(records);
  const candidateRows = records.map((record): LocalModelArtifactEvidenceRow => ({
    candidateId: record.candidateId,
    candidateTier: record.candidateTier,
    modelClass: record.modelClass,
    exactModelName: record.exactModelName,
    officialRepositoryId: record.officialRepositoryId,
    evidenceStatus: record.evidenceStatus,
    statusLabel: statusLabel(record),
    observedRevision: record.observedRevision,
    revisionStatusLabel: record.immutableRevisionAvailable === 'confirmed'
      ? 'Immutable revision observed; not approved or pinned for production.'
      : 'Immutable revision evidence is unavailable.',
    artifactFormat: record.artifactFormat,
    aggregateSizeLabel: record.aggregateWeightSizeMb === null
      ? 'Exact aggregate size not confirmed'
      : `${record.aggregateWeightSizeMb.toFixed(1)} MiB official aggregate`,
    weightShardCount: record.weightShardCount,
    officialQuantizedVariantAvailable: record.officialQuantizedVariantAvailable,
    artifactSelected: false,
    artifactApproved: false,
    modelActive: false,
  }));

  return {
    heading: 'Official Artifact Variant & Provenance Evidence Review',
    evidenceSummary: 'Artifact evidence only',
    provenanceSummary: 'Official repository and immutable revision evidence recorded for review',
    selectionSummary: 'Human artifact selection still required',
    artifactSelectionSummary: 'No artifact selected',
    artifactApprovalSummary: 'No artifact approved',
    checksumSummary: 'No checksum pinned',
    downloadLocationSummary: 'No download location configured',
    benchmarkSummary: 'No benchmark passed',
    downloadSummary: 'No download available',
    modelStateSummary: 'No model active',
    executionSummary: 'Production execution remains unavailable',
    candidateRows,
    aggregate: {
      totalCandidates: records.length,
      repositoryConfirmedCandidates: records.filter(
        (record) => record.officialRepositoryConfirmed === 'confirmed',
      ).length,
      incompleteCandidates: records.filter(
        (record) => record.evidenceStatus === 'evidence-incomplete',
      ).length,
      evidenceCollectedCandidates: records.filter(
        (record) => record.evidenceStatus === 'evidence-collected',
      ).length,
      conflictingCandidates: records.filter(
        (record) => record.evidenceStatus === 'conflicting-evidence',
      ).length,
      immutableRevisionConfirmedCandidates: records.filter(
        (record) => record.immutableRevisionAvailable === 'confirmed',
      ).length,
      sizeConfirmedCandidates: records.filter(
        (record) => record.aggregateSizeEvidenceStatus === 'confirmed'
          && record.aggregateWeightSizeBytes !== null,
      ).length,
      selectedArtifacts: records.filter((record) => record.artifactSelected).length,
      approvedArtifacts: records.filter((record) => record.artifactApproved).length,
      downloadableArtifacts: records.filter((record) => record.downloadable).length,
      runtimeReadyArtifacts: records.filter((record) => record.runtimeReady).length,
      activeModels: records.filter((record) => record.modelActive).length,
    },
    missingEvidence: unique(records.flatMap((record) => record.missingEvidence)),
    conflicts: unique(records.flatMap((record) => record.conflicts)),
    warnings: validation.valid
      ? ['Artifact evidence collection does not select, approve, download, cache, benchmark, initialize, or activate an artifact.']
      : validation.issues,
    documentPath: 'docs/ai/phase-5-model-artifact-provenance-evidence.md',
    evidenceOnly: true,
    artifactSelected: false,
    artifactApproved: false,
    modelActive: false,
  };
}
