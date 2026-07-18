import { listLocalModelArtifactIntegrityEvidence } from './localModelArtifactIntegrityEvidenceRegistry.ts';
import type { LocalModelArtifactIntegrityCandidateRecord, LocalModelArtifactIntegrityEvidenceStatus } from './localModelArtifactIntegrityEvidenceTypes.ts';

export interface LocalModelArtifactIntegrityEvidenceRow {
  readonly candidateId: string;
  readonly candidateTier: string;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly officialRepositoryId: string;
  readonly observedRevision: string | null;
  readonly evidenceStatus: LocalModelArtifactIntegrityEvidenceStatus;
  readonly inventorySummary: string;
  readonly exactWeightBytes: number | null;
  readonly exactWeightSizeLabel: string;
  readonly futureDownloadSizeLabel: 'Approved download size unavailable';
  readonly integrityMetadataSummary: string;
  readonly checksumSummary: 'Observed metadata only; not pinned or verified';
  readonly artifactSelected: false;
  readonly artifactApproved: false;
  readonly modelActive: false;
}

export interface LocalModelArtifactIntegrityEvidenceViewModel {
  readonly heading: 'Official Artifact Integrity, Exact Size & Checksum Evidence Review';
  readonly integrityEvidenceSummary: 'Integrity evidence only';
  readonly exactSizeSummary: 'Exact weight size is not approved download size';
  readonly checksumBoundarySummary: 'No checksum pinned · No checksum verified';
  readonly selectionSummary: 'No artifact selected';
  readonly approvalSummary: 'No artifact approved · No download location configured · No benchmark passed · No download available · No model active';
  readonly executionSummary: 'Production execution remains unavailable';
  readonly candidateRows: readonly LocalModelArtifactIntegrityEvidenceRow[];
  readonly aggregate: {
    readonly totalCandidates: number;
    readonly incompleteCandidates: number;
    readonly evidenceCollectedCandidates: number;
    readonly conflictingCandidates: number;
    readonly exactWeightSizeConfirmedCandidates: number;
    readonly integrityMetadataAvailableCandidates: number;
    readonly selectedArtifacts: number;
    readonly approvedArtifacts: number;
    readonly checksumPinnedArtifacts: number;
    readonly checksumVerifiedArtifacts: number;
    readonly downloadableArtifacts: number;
    readonly runtimeReadyArtifacts: number;
    readonly activeModels: number;
  };
  readonly missingEvidence: readonly string[];
  readonly conflicts: readonly string[];
  readonly warnings: readonly string[];
  readonly documentPath: 'docs/ai/phase-5-model-artifact-integrity-evidence.md';
  readonly evidenceOnly: true;
  readonly checksumPinned: false;
  readonly checksumVerified: false;
  readonly artifactApproved: false;
  readonly modelActive: false;
}

function formatExactWeightSize(record: LocalModelArtifactIntegrityCandidateRecord): string {
  if (record.exactWeightBytes === null || record.exactWeightMiB === null) return 'Exact weight file bytes unavailable';
  return `${record.exactWeightBytes.toLocaleString('en-US')} exact weight-file bytes (${record.exactWeightMiB.toFixed(2)} MiB)`;
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

export function buildLocalModelArtifactIntegrityEvidenceViewModel(
  records: readonly LocalModelArtifactIntegrityCandidateRecord[] = listLocalModelArtifactIntegrityEvidence(),
): LocalModelArtifactIntegrityEvidenceViewModel {
  const candidateRows = records.map((record): LocalModelArtifactIntegrityEvidenceRow => ({
    candidateId: record.candidateId,
    candidateTier: record.candidateTier,
    modelClass: record.modelClass,
    exactModelName: record.exactModelName,
    officialRepositoryId: record.officialRepositoryId,
    observedRevision: record.observedRevision,
    evidenceStatus: record.evidenceStatus,
    inventorySummary: `${record.weightShardCount} exact weight file${record.weightShardCount === 1 ? '' : 's'} · index ${record.weightIndexStatus}`,
    exactWeightBytes: record.exactWeightBytes,
    exactWeightSizeLabel: formatExactWeightSize(record),
    futureDownloadSizeLabel: 'Approved download size unavailable',
    integrityMetadataSummary: `${record.filesWithIntegrityMetadata} files with reviewed integrity metadata · ${record.filesMissingIntegrityMetadata} support files pending review`,
    checksumSummary: 'Observed metadata only; not pinned or verified',
    artifactSelected: false,
    artifactApproved: false,
    modelActive: false,
  }));
  return {
    heading: 'Official Artifact Integrity, Exact Size & Checksum Evidence Review',
    integrityEvidenceSummary: 'Integrity evidence only',
    exactSizeSummary: 'Exact weight size is not approved download size',
    checksumBoundarySummary: 'No checksum pinned · No checksum verified',
    selectionSummary: 'No artifact selected',
    approvalSummary: 'No artifact approved · No download location configured · No benchmark passed · No download available · No model active',
    executionSummary: 'Production execution remains unavailable',
    candidateRows,
    aggregate: {
      totalCandidates: records.length,
      incompleteCandidates: records.filter((record) => record.evidenceStatus === 'evidence-incomplete').length,
      evidenceCollectedCandidates: records.filter((record) => record.evidenceStatus === 'evidence-collected').length,
      conflictingCandidates: records.filter((record) => record.evidenceStatus === 'conflicting-evidence').length,
      exactWeightSizeConfirmedCandidates: records.filter((record) => record.exactWeightBytes !== null).length,
      integrityMetadataAvailableCandidates: records.filter((record) => record.requiredWeightFiles.length > 0 && record.requiredWeightFiles.every((file) => file.integrityMetadataStatus === 'confirmed')).length,
      selectedArtifacts: records.filter((record) => record.artifactSelected).length,
      approvedArtifacts: records.filter((record) => record.artifactApproved).length,
      checksumPinnedArtifacts: records.filter((record) => record.checksumPinned).length,
      checksumVerifiedArtifacts: records.filter((record) => record.checksumVerified).length,
      downloadableArtifacts: records.filter((record) => record.downloadable).length,
      runtimeReadyArtifacts: records.filter((record) => record.runtimeReady).length,
      activeModels: records.filter((record) => record.modelActive).length,
    },
    missingEvidence: unique(records.flatMap((record) => record.missingEvidence)),
    conflicts: unique(records.flatMap((record) => record.conflicts)),
    warnings: [
      'Integrity evidence is observational metadata only; no digest value is stored in runtime, pinned, or locally verified.',
      'Exact weight-file bytes exclude an unapproved runtime support-file bundle and are not an approved download or storage size.',
      'No artifact selected · No artifact approved · No checksum pinned · No checksum verified · No download location configured · No benchmark passed · No download available · No model active · Production execution remains unavailable.',
    ],
    documentPath: 'docs/ai/phase-5-model-artifact-integrity-evidence.md',
    evidenceOnly: true,
    checksumPinned: false,
    checksumVerified: false,
    artifactApproved: false,
    modelActive: false,
  };
}
