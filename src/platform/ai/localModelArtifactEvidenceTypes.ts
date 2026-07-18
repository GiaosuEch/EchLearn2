import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';

export type LocalModelArtifactEvidenceStatus =
  | 'not-reviewed'
  | 'evidence-incomplete'
  | 'evidence-collected'
  | 'conflicting-evidence'
  | 'repository-not-found'
  | 'rejected';

export type LocalModelArtifactEvidenceTruthStatus =
  | 'confirmed'
  | 'absent'
  | 'unknown'
  | 'conflicting';

export type LocalModelArtifactFormat =
  | 'safetensors'
  | 'pytorch-bin'
  | 'gguf'
  | 'onnx'
  | 'unknown';

export type LocalModelArtifactEvidenceSourceKind =
  | 'official-repository'
  | 'official-file-tree'
  | 'official-model-card'
  | 'official-revision-page'
  | 'official-file-metadata'
  | 'official-documentation';

export interface LocalModelArtifactEvidenceSource {
  readonly sourceId: string;
  readonly sourceKind: LocalModelArtifactEvidenceSourceKind;
  readonly officialPublisher: boolean;
  readonly title: string;
  readonly repositoryId: string;
  readonly reference: string;
  readonly retrievedOn: string;
  readonly supportsFields: readonly string[];
  readonly notes: string;
}

export interface LocalModelOfficialArtifactFileEvidence {
  readonly fileName: string;
  readonly exactSizeBytes: number | null;
  readonly officialMetadata: boolean;
}

export interface LocalModelArtifactEvidenceRecord {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly publisher: string;
  readonly officialRepositoryId: string;
  readonly evidenceStatus: LocalModelArtifactEvidenceStatus;
  readonly officialRepositoryConfirmed: LocalModelArtifactEvidenceTruthStatus;
  readonly observedRevision: string | null;
  readonly immutableRevisionAvailable: LocalModelArtifactEvidenceTruthStatus;
  readonly artifactFormat: LocalModelArtifactFormat;
  readonly officialBaseVariantConfirmed: LocalModelArtifactEvidenceTruthStatus;
  readonly officialQuantizedVariantAvailable: LocalModelArtifactEvidenceTruthStatus;
  readonly officialQuantizedRepositoryId: string | null;
  readonly quantizationLabel: string | null;
  readonly weightFilesPresent: LocalModelArtifactEvidenceTruthStatus;
  readonly weightFiles: readonly LocalModelOfficialArtifactFileEvidence[];
  readonly weightShardCount: number | null;
  readonly weightIndexPresent: LocalModelArtifactEvidenceTruthStatus;
  readonly aggregateWeightSizeBytes: number | null;
  readonly aggregateWeightSizeMb: number | null;
  readonly aggregateSizeEvidenceStatus: LocalModelArtifactEvidenceTruthStatus;
  readonly configPresent: LocalModelArtifactEvidenceTruthStatus;
  readonly generationConfigPresent: LocalModelArtifactEvidenceTruthStatus;
  readonly tokenizerFilesPresent: LocalModelArtifactEvidenceTruthStatus;
  readonly tokenizerConfigPresent: LocalModelArtifactEvidenceTruthStatus;
  readonly licenseFilePresent: LocalModelArtifactEvidenceTruthStatus;
  readonly noticeFilePresent: LocalModelArtifactEvidenceTruthStatus;
  readonly modelCardPresent: LocalModelArtifactEvidenceTruthStatus;
  readonly lfsMetadataAvailable: LocalModelArtifactEvidenceTruthStatus;
  readonly checksumValuesRecorded: false;
  readonly checksumVerified: false;
  readonly directDownloadLocationRecorded: false;
  readonly artifactSelected: false;
  readonly humanReviewRequired: true;
  readonly modelApproved: false;
  readonly licenseApproved: false;
  readonly artifactApproved: false;
  readonly benchmarkVerified: false;
  readonly downloadable: false;
  readonly cacheable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
  readonly sources: readonly LocalModelArtifactEvidenceSource[];
  readonly missingEvidence: readonly string[];
  readonly conflicts: readonly string[];
}

export interface LocalModelArtifactEvidenceRegistryValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
}
