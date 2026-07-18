import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';

export type LocalModelArtifactIntegrityEvidenceStatus =
  | 'not-reviewed'
  | 'evidence-incomplete'
  | 'evidence-collected'
  | 'conflicting-evidence'
  | 'repository-not-found'
  | 'rejected';

export type LocalModelArtifactIntegrityMetadataStatus =
  | 'confirmed'
  | 'absent'
  | 'unknown'
  | 'conflicting';

export type LocalModelArtifactIntegrityAlgorithmKind =
  | 'sha256'
  | 'lfs-sha256'
  | 'xet-content-hash'
  | 'git-object-id'
  | 'host-specific'
  | 'unknown';

export type LocalModelArtifactIntegrityFileRole =
  | 'weight'
  | 'weight-index'
  | 'config'
  | 'generation-config'
  | 'tokenizer'
  | 'tokenizer-config'
  | 'tokenizer-metadata'
  | 'vocabulary'
  | 'merges'
  | 'license'
  | 'notice'
  | 'model-card'
  | 'other-support';

export type LocalModelArtifactIntegrityEvidenceSourceKind =
  | 'official-revision-file-tree'
  | 'official-file-metadata'
  | 'official-weight-index'
  | 'official-safetensors-metadata'
  | 'official-lfs-metadata'
  | 'official-xet-metadata'
  | 'official-model-card'
  | 'official-documentation';

export interface LocalModelArtifactIntegrityEvidenceSource {
  readonly sourceId: string;
  readonly sourceKind: LocalModelArtifactIntegrityEvidenceSourceKind;
  readonly officialPublisher: boolean;
  readonly title: string;
  readonly repositoryId: string;
  readonly revision: string | null;
  readonly reference: string;
  readonly retrievedOn: string;
  readonly supportsFields: readonly string[];
  readonly notes: string;
}

export interface LocalModelArtifactIntegrityFileEvidence {
  readonly fileName: string;
  readonly fileRole: LocalModelArtifactIntegrityFileRole;
  readonly exactSizeBytes: number | null;
  readonly exactSizeStatus: LocalModelArtifactIntegrityMetadataStatus;
  readonly integrityMetadataStatus: LocalModelArtifactIntegrityMetadataStatus;
  readonly integrityAlgorithm: LocalModelArtifactIntegrityAlgorithmKind;
  readonly integrityValueAvailable: boolean;
  readonly integrityValueRecordedInRuntime: false;
  readonly checksumPinned: false;
  readonly checksumVerified: false;
  readonly sourceIds: readonly string[];
  readonly warnings: readonly string[];
  readonly conflicts: readonly string[];
}

export interface LocalModelArtifactIntegrityCandidateRecord {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly publisher: string;
  readonly officialRepositoryId: string;
  readonly observedRevision: string | null;
  readonly evidenceStatus: LocalModelArtifactIntegrityEvidenceStatus;
  readonly immutableRevisionConfirmed: LocalModelArtifactIntegrityMetadataStatus;
  readonly fileInventoryStatus: LocalModelArtifactIntegrityMetadataStatus;
  readonly weightIndexStatus: LocalModelArtifactIntegrityMetadataStatus;
  readonly shardInventoryStatus: LocalModelArtifactIntegrityMetadataStatus;
  readonly requiredWeightFiles: readonly LocalModelArtifactIntegrityFileEvidence[];
  readonly indexedWeightFiles: readonly string[];
  readonly supportFiles: readonly LocalModelArtifactIntegrityFileEvidence[];
  readonly weightShardCount: number;
  readonly exactWeightBytes: number | null;
  readonly exactWeightMiB: number | null;
  readonly exactSupportFilesBytes: number | null;
  readonly exactSupportFilesMiB: number | null;
  readonly futureDownloadSizeBytes: null;
  readonly futureDownloadSizeMb: null;
  readonly filesWithIntegrityMetadata: number;
  readonly filesMissingIntegrityMetadata: number;
  readonly integrityAlgorithmsObserved: readonly LocalModelArtifactIntegrityAlgorithmKind[];
  readonly checksumValuesRecordedInRuntime: false;
  readonly checksumPinned: false;
  readonly checksumVerified: false;
  readonly artifactSelected: false;
  readonly artifactApproved: false;
  readonly downloadLocationConfigured: false;
  readonly benchmarkVerified: false;
  readonly downloadable: false;
  readonly cacheable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
  readonly humanReviewRequired: true;
  readonly sources: readonly LocalModelArtifactIntegrityEvidenceSource[];
  readonly missingEvidence: readonly string[];
  readonly conflicts: readonly string[];
}

export interface LocalModelArtifactIntegrityValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
}
