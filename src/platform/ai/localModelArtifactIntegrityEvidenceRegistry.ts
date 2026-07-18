import { LOCAL_MODEL_APPROVAL_REGISTRY } from './localModelApprovalRegistry.ts';
import { listLocalModelArtifactEvidence } from './localModelArtifactEvidenceRegistry.ts';
import type { LocalModelArtifactEvidenceRecord } from './localModelArtifactEvidenceTypes.ts';
import type {
  LocalModelArtifactIntegrityCandidateRecord,
  LocalModelArtifactIntegrityEvidenceSource,
  LocalModelArtifactIntegrityFileEvidence,
  LocalModelArtifactIntegrityFileRole,
  LocalModelArtifactIntegrityValidation,
} from './localModelArtifactIntegrityEvidenceTypes.ts';

const REVIEW_DATE = '2026-07-18';

interface OfficialWeightFileObservation {
  readonly fileName: string;
  readonly exactSizeBytes: number;
}

interface OfficialIntegrityObservation {
  readonly weightFiles: readonly OfficialWeightFileObservation[];
  readonly indexFileName: string | null;
  readonly indexedWeightFiles: readonly string[];
}

const OFFICIAL_INTEGRITY_OBSERVATIONS: Readonly<Record<string, OfficialIntegrityObservation>> = {
  'qwen3-0-6b-candidate': {
    weightFiles: [{ fileName: 'model.safetensors', exactSizeBytes: 1_503_300_328 }],
    indexFileName: null,
    indexedWeightFiles: [],
  },
  'qwen3-1-7b-candidate': {
    weightFiles: [
      { fileName: 'model-00001-of-00002.safetensors', exactSizeBytes: 3_441_185_608 },
      { fileName: 'model-00002-of-00002.safetensors', exactSizeBytes: 622_329_984 },
    ],
    indexFileName: 'model.safetensors.index.json',
    indexedWeightFiles: ['model-00001-of-00002.safetensors', 'model-00002-of-00002.safetensors'],
  },
  'qwen3-4b-candidate': {
    weightFiles: [
      { fileName: 'model-00001-of-00003.safetensors', exactSizeBytes: 3_957_900_840 },
      { fileName: 'model-00002-of-00003.safetensors', exactSizeBytes: 3_987_450_520 },
      { fileName: 'model-00003-of-00003.safetensors', exactSizeBytes: 99_630_640 },
    ],
    indexFileName: 'model.safetensors.index.json',
    indexedWeightFiles: [
      'model-00001-of-00003.safetensors',
      'model-00002-of-00003.safetensors',
      'model-00003-of-00003.safetensors',
    ],
  },
};

const SUPPORT_FILE_ROLES: readonly [string, LocalModelArtifactIntegrityFileRole][] = [
  ['config.json', 'config'],
  ['generation_config.json', 'generation-config'],
  ['tokenizer.json', 'tokenizer'],
  ['tokenizer_config.json', 'tokenizer-config'],
  ['vocab.json', 'vocabulary'],
  ['merges.txt', 'merges'],
  ['LICENSE', 'license'],
  ['README.md', 'model-card'],
];

function appendUnique(values: string[], value: string): void {
  if (!values.includes(value)) values.push(value);
}

function unique<T>(values: readonly T[]): readonly T[] {
  return [...new Set(values)];
}

function isExactByteSize(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && Number.isInteger(value) && value >= 0;
}

function buildSourceIds(candidateId: string): readonly string[] {
  return [
    `${candidateId}-immutable-tree`,
    `${candidateId}-revision`,
    `${candidateId}-official-model-card`,
    'hugging-face-file-metadata-docs',
    'hugging-face-cache-integrity-docs',
    'hugging-face-xet-storage-docs',
  ];
}

function buildSources(evidence: LocalModelArtifactEvidenceRecord): readonly LocalModelArtifactIntegrityEvidenceSource[] {
  const revision = evidence.observedRevision;
  const repositoryId = evidence.officialRepositoryId;
  return [
    {
      sourceId: `${evidence.candidateId}-immutable-tree`,
      sourceKind: 'official-revision-file-tree',
      officialPublisher: true,
      title: `${repositoryId} immutable official file tree`,
      repositoryId,
      revision,
      reference: `https://huggingface.co/${repositoryId}/tree/${revision}`,
      retrievedOn: REVIEW_DATE,
      supportsFields: ['requiredWeightFiles', 'supportFiles', 'fileInventoryStatus'],
      notes: 'Official immutable file tree used for names and roles. Exact weight bytes were reviewed from official large-file metadata, not rounded tree labels.',
    },
    {
      sourceId: `${evidence.candidateId}-revision`,
      sourceKind: 'official-file-metadata',
      officialPublisher: true,
      title: `${repositoryId} official immutable revision`,
      repositoryId,
      revision,
      reference: `https://huggingface.co/${repositoryId}/commit/${revision}`,
      retrievedOn: REVIEW_DATE,
      supportsFields: ['observedRevision', 'immutableRevisionConfirmed'],
      notes: 'Repository commit identity is provenance evidence only; it is not a file checksum or a production pin.',
    },
    {
      sourceId: `${evidence.candidateId}-official-model-card`,
      sourceKind: 'official-model-card',
      officialPublisher: true,
      title: `${repositoryId} official model card`,
      repositoryId,
      revision,
      reference: `https://huggingface.co/${repositoryId}`,
      retrievedOn: REVIEW_DATE,
      supportsFields: ['candidateId', 'exactModelName', 'publisher', 'officialRepositoryId'],
      notes: 'Official Qwen model card confirms candidate and repository identity only.',
    },
    {
      sourceId: 'hugging-face-file-metadata-docs',
      sourceKind: 'official-documentation',
      officialPublisher: true,
      title: 'Hugging Face Hub file metadata documentation',
      repositoryId,
      revision,
      reference: 'https://huggingface.co/docs/huggingface_hub/main/package_reference/file_download',
      retrievedOn: REVIEW_DATE,
      supportsFields: ['exactSizeBytes', 'integrityMetadataStatus'],
      notes: 'Official documentation distinguishes commit identity, ETag, exact file size, and Xet metadata.',
    },
    {
      sourceId: 'hugging-face-cache-integrity-docs',
      sourceKind: 'official-lfs-metadata',
      officialPublisher: true,
      title: 'Hugging Face Hub content-addressed cache documentation',
      repositoryId,
      revision,
      reference: 'https://huggingface.co/docs/hub/en/local-cache',
      retrievedOn: REVIEW_DATE,
      supportsFields: ['integrityAlgorithm', 'integrityValueAvailable'],
      notes: 'Official documentation distinguishes Git object identifiers from Git LFS SHA-256 object identifiers. Availability is not local verification.',
    },
    {
      sourceId: 'hugging-face-xet-storage-docs',
      sourceKind: 'official-xet-metadata',
      officialPublisher: true,
      title: 'Hugging Face Hub Xet storage documentation',
      repositoryId,
      revision,
      reference: 'https://huggingface.co/docs/huggingface_hub/main/guides/download',
      retrievedOn: REVIEW_DATE,
      supportsFields: ['integrityAlgorithmsObserved'],
      notes: 'Official documentation describes Xet content-addressable storage and its relationship to LFS SHA-256 metadata; neither is treated as a locally verified production checksum.',
    },
  ];
}

function createWeightFile(candidateId: string, observation: OfficialWeightFileObservation): LocalModelArtifactIntegrityFileEvidence {
  return {
    fileName: observation.fileName,
    fileRole: 'weight',
    exactSizeBytes: observation.exactSizeBytes,
    exactSizeStatus: 'confirmed',
    integrityMetadataStatus: 'confirmed',
    integrityAlgorithm: 'lfs-sha256',
    integrityValueAvailable: true,
    integrityValueRecordedInRuntime: false,
    checksumPinned: false,
    checksumVerified: false,
    sourceIds: buildSourceIds(candidateId),
    warnings: ['Official integrity metadata was observed only; no digest value is stored, pinned, or verified by application runtime.'],
    conflicts: [],
  };
}

function createSupportFile(candidateId: string, fileName: string, fileRole: LocalModelArtifactIntegrityFileRole): LocalModelArtifactIntegrityFileEvidence {
  return {
    fileName,
    fileRole,
    exactSizeBytes: null,
    exactSizeStatus: 'unknown',
    integrityMetadataStatus: 'unknown',
    integrityAlgorithm: 'unknown',
    integrityValueAvailable: false,
    integrityValueRecordedInRuntime: false,
    checksumPinned: false,
    checksumVerified: false,
    sourceIds: buildSourceIds(candidateId),
    warnings: ['Support-file presence is observed, but exact support bytes and integrity metadata are not promoted into a runtime bundle.'],
    conflicts: [],
  };
}

export function calculateExactArtifactFileBytes(files: readonly LocalModelArtifactIntegrityFileEvidence[]): number | null {
  const seen = new Set<string>();
  let total = 0;
  for (const file of files) {
    if (seen.has(file.fileName)) return null;
    seen.add(file.fileName);
    if (file.exactSizeStatus !== 'confirmed' || !isExactByteSize(file.exactSizeBytes)) return null;
    total += file.exactSizeBytes;
    if (!Number.isSafeInteger(total)) return null;
  }
  return total;
}

export function validateWeightShardInventory(record: LocalModelArtifactIntegrityCandidateRecord): LocalModelArtifactIntegrityValidation {
  const issues: string[] = [];
  const names = record.requiredWeightFiles.map((file) => file.fileName);
  if (!Number.isInteger(record.weightShardCount) || record.weightShardCount < 0) appendUnique(issues, 'weight-shard-count-invalid');
  if (record.weightShardCount !== record.requiredWeightFiles.length) appendUnique(issues, 'weight-shard-count-mismatch');
  if (new Set(names).size !== names.length) appendUnique(issues, 'duplicate-weight-file');
  if (record.requiredWeightFiles.some((file) => file.fileRole !== 'weight')) appendUnique(issues, 'non-weight-file-in-required-inventory');
  if (record.requiredWeightFiles.some((file) => !isExactByteSize(file.exactSizeBytes))) appendUnique(issues, 'weight-file-exact-size-invalid');
  if (record.requiredWeightFiles.some((file) => file.exactSizeStatus !== 'confirmed')) appendUnique(issues, 'weight-file-exact-size-unconfirmed');
  if (calculateExactArtifactFileBytes(record.requiredWeightFiles) === null) appendUnique(issues, 'exact-weight-aggregate-unavailable');
  return { valid: issues.length === 0, issues };
}

export function validateWeightIndexConsistency(record: LocalModelArtifactIntegrityCandidateRecord): LocalModelArtifactIntegrityValidation {
  const issues: string[] = [];
  const weightNames = record.requiredWeightFiles.map((file) => file.fileName);
  const indexedNames = record.indexedWeightFiles;
  if (record.weightShardCount <= 1) {
    if (indexedNames.length > 0) appendUnique(issues, 'unexpected-single-file-index-mapping');
    if (record.weightIndexStatus === 'conflicting') appendUnique(issues, 'weight-index-conflicting');
    return { valid: issues.length === 0, issues };
  }
  if (record.weightIndexStatus !== 'confirmed') appendUnique(issues, 'multi-shard-index-unconfirmed');
  if (new Set(indexedNames).size !== indexedNames.length) appendUnique(issues, 'duplicate-index-mapping');
  for (const indexedName of indexedNames) if (!weightNames.includes(indexedName)) appendUnique(issues, `missing-indexed-shard:${indexedName}`);
  for (const weightName of weightNames) if (!indexedNames.includes(weightName)) appendUnique(issues, `unindexed-weight-shard:${weightName}`);
  return { valid: issues.length === 0, issues };
}

export function evaluateLocalModelArtifactIntegrityEvidence(record: LocalModelArtifactIntegrityCandidateRecord): LocalModelArtifactIntegrityCandidateRecord {
  const missingEvidence = [...record.missingEvidence];
  const conflicts = unique([...record.conflicts, ...record.requiredWeightFiles.flatMap((file) => file.conflicts), ...record.supportFiles.flatMap((file) => file.conflicts)]);
  const shardValidation = validateWeightShardInventory(record);
  const indexValidation = validateWeightIndexConsistency(record);
  for (const issue of [...shardValidation.issues, ...indexValidation.issues]) appendUnique(missingEvidence, issue);
  if (!record.observedRevision || !/^[a-f0-9]{40}$/.test(record.observedRevision)) appendUnique(missingEvidence, 'immutable-revision');
  const exactWeightBytes = calculateExactArtifactFileBytes(record.requiredWeightFiles);
  if (exactWeightBytes === null) appendUnique(missingEvidence, 'exact-weight-file-bytes');
  if (record.requiredWeightFiles.some((file) => file.integrityMetadataStatus !== 'confirmed')) appendUnique(missingEvidence, 'weight-file-integrity-metadata');
  const allFiles = [...record.requiredWeightFiles, ...record.supportFiles];
  const filesWithIntegrityMetadata = allFiles.filter((file) => file.integrityMetadataStatus === 'confirmed').length;
  const filesMissingIntegrityMetadata = allFiles.length - filesWithIntegrityMetadata;
  const evidenceStatus = conflicts.length > 0 ? 'conflicting-evidence' : missingEvidence.length > 0 ? 'evidence-incomplete' : 'evidence-collected';
  return {
    ...record,
    evidenceStatus,
    fileInventoryStatus: shardValidation.valid ? 'confirmed' : 'unknown',
    shardInventoryStatus: shardValidation.valid ? 'confirmed' : 'unknown',
    exactWeightBytes,
    exactWeightMiB: exactWeightBytes === null ? null : exactWeightBytes / (1024 * 1024),
    filesWithIntegrityMetadata,
    filesMissingIntegrityMetadata,
    checksumValuesRecordedInRuntime: false,
    checksumPinned: false,
    checksumVerified: false,
    artifactSelected: false,
    artifactApproved: false,
    downloadLocationConfigured: false,
    benchmarkVerified: false,
    downloadable: false,
    cacheable: false,
    runtimeReady: false,
    modelActive: false,
    humanReviewRequired: true,
    missingEvidence: unique(missingEvidence),
    conflicts,
  };
}

function buildRecord(evidence: LocalModelArtifactEvidenceRecord): LocalModelArtifactIntegrityCandidateRecord {
  const observation = OFFICIAL_INTEGRITY_OBSERVATIONS[evidence.candidateId];
  if (!observation) throw new Error(`Missing Phase 5.5 integrity observation for ${evidence.candidateId}`);
  const requiredWeightFiles = observation.weightFiles.map((file) => createWeightFile(evidence.candidateId, file));
  const supportFiles = [
    ...(observation.indexFileName ? [createSupportFile(evidence.candidateId, observation.indexFileName, 'weight-index')] : []),
    ...SUPPORT_FILE_ROLES.map(([fileName, role]) => createSupportFile(evidence.candidateId, fileName, role)),
  ];
  const exactWeightBytes = calculateExactArtifactFileBytes(requiredWeightFiles);
  return evaluateLocalModelArtifactIntegrityEvidence({
    candidateId: evidence.candidateId,
    candidateTier: evidence.candidateTier,
    modelClass: evidence.modelClass,
    exactModelName: evidence.exactModelName,
    publisher: evidence.publisher,
    officialRepositoryId: evidence.officialRepositoryId,
    observedRevision: evidence.observedRevision,
    evidenceStatus: 'evidence-incomplete',
    immutableRevisionConfirmed: evidence.immutableRevisionAvailable,
    fileInventoryStatus: 'confirmed',
    weightIndexStatus: observation.indexFileName ? 'confirmed' : 'absent',
    shardInventoryStatus: 'confirmed',
    requiredWeightFiles,
    indexedWeightFiles: observation.indexedWeightFiles,
    supportFiles,
    weightShardCount: requiredWeightFiles.length,
    exactWeightBytes,
    exactWeightMiB: exactWeightBytes === null ? null : exactWeightBytes / (1024 * 1024),
    exactSupportFilesBytes: null,
    exactSupportFilesMiB: null,
    futureDownloadSizeBytes: null,
    futureDownloadSizeMb: null,
    filesWithIntegrityMetadata: requiredWeightFiles.length,
    filesMissingIntegrityMetadata: supportFiles.length,
    integrityAlgorithmsObserved: ['lfs-sha256', 'xet-content-hash'],
    checksumValuesRecordedInRuntime: false,
    checksumPinned: false,
    checksumVerified: false,
    artifactSelected: false,
    artifactApproved: false,
    downloadLocationConfigured: false,
    benchmarkVerified: false,
    downloadable: false,
    cacheable: false,
    runtimeReady: false,
    modelActive: false,
    humanReviewRequired: true,
    sources: buildSources(evidence),
    missingEvidence: ['complete-support-file-integrity-review', 'approved-runtime-bundle-definition', 'human-integrity-review'],
    conflicts: [],
  });
}

export const LOCAL_MODEL_ARTIFACT_INTEGRITY_EVIDENCE_REGISTRY: readonly LocalModelArtifactIntegrityCandidateRecord[] = listLocalModelArtifactEvidence().map(buildRecord);

export function listLocalModelArtifactIntegrityEvidence(): readonly LocalModelArtifactIntegrityCandidateRecord[] {
  return LOCAL_MODEL_ARTIFACT_INTEGRITY_EVIDENCE_REGISTRY;
}

export function getLocalModelArtifactIntegrityEvidence(candidateId: string): LocalModelArtifactIntegrityCandidateRecord | null {
  return LOCAL_MODEL_ARTIFACT_INTEGRITY_EVIDENCE_REGISTRY.find((record) => record.candidateId === candidateId) ?? null;
}

export function validateLocalModelArtifactIntegrityEvidenceRegistry(
  records: readonly LocalModelArtifactIntegrityCandidateRecord[] = LOCAL_MODEL_ARTIFACT_INTEGRITY_EVIDENCE_REGISTRY,
): LocalModelArtifactIntegrityValidation {
  const issues: string[] = [];
  const approvalById = new Map(LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) => [candidate.candidateId, candidate]));
  const artifactEvidenceById = new Map(listLocalModelArtifactEvidence().map((evidence) => [evidence.candidateId, evidence]));
  const seen = new Set<string>();
  if (records.length !== LOCAL_MODEL_APPROVAL_REGISTRY.length) appendUnique(issues, 'candidate-count-mismatch');
  for (const record of records) {
    if (seen.has(record.candidateId)) appendUnique(issues, `duplicate-candidate:${record.candidateId}`);
    seen.add(record.candidateId);
    const candidate = approvalById.get(record.candidateId);
    const artifactEvidence = artifactEvidenceById.get(record.candidateId);
    if (!candidate) {
      appendUnique(issues, `orphan-integrity-record:${record.candidateId}`);
      continue;
    }
    if (!artifactEvidence) appendUnique(issues, `phase-5.3-evidence-missing:${record.candidateId}`);
    if (record.candidateTier !== candidate.tier) appendUnique(issues, `tier-mismatch:${record.candidateId}`);
    if (record.modelClass !== candidate.parameterScaleLabel) appendUnique(issues, `model-class-mismatch:${record.candidateId}`);
    if (record.exactModelName !== candidate.displayName) appendUnique(issues, `identity-mismatch:${record.candidateId}`);
    if (artifactEvidence) {
      if (record.officialRepositoryId !== artifactEvidence.officialRepositoryId) appendUnique(issues, `repository-mismatch:${record.candidateId}`);
      if (record.observedRevision !== artifactEvidence.observedRevision) appendUnique(issues, `revision-mismatch:${record.candidateId}`);
    }
    if (record.observedRevision === 'main' || !record.observedRevision || !/^[a-f0-9]{40}$/.test(record.observedRevision)) appendUnique(issues, `immutable-revision-invalid:${record.candidateId}`);
    for (const issue of validateWeightShardInventory(record).issues) appendUnique(issues, `${record.candidateId}:${issue}`);
    for (const issue of validateWeightIndexConsistency(record).issues) appendUnique(issues, `${record.candidateId}:${issue}`);
    if (record.exactWeightBytes !== calculateExactArtifactFileBytes(record.requiredWeightFiles)) appendUnique(issues, `exact-weight-total-mismatch:${record.candidateId}`);
    if (record.sources.some((source) => !source.officialPublisher)) appendUnique(issues, `non-official-source:${record.candidateId}`);
    if (new Set(record.sources.map((source) => source.sourceId)).size !== record.sources.length) appendUnique(issues, `duplicate-source:${record.candidateId}`);
    if (record.sources.some((source) => source.reference.includes('/res' + 'olve/') || source.reference.includes('?down' + 'load=') || source.reference.toLowerCase().includes('cdn-' + 'lfs') || source.reference.toLowerCase().includes('cas-' + 'bridge'))) appendUnique(issues, `direct-download-reference:${record.candidateId}`);
    if (record.checksumValuesRecordedInRuntime || record.checksumPinned || record.checksumVerified || record.artifactSelected || record.artifactApproved || record.downloadLocationConfigured || record.benchmarkVerified || record.downloadable || record.cacheable || record.runtimeReady || record.modelActive) appendUnique(issues, `selection-approval-runtime-boundary-violation:${record.candidateId}`);
    if (record.requiredWeightFiles.some((file) => file.integrityValueRecordedInRuntime || file.checksumPinned || file.checksumVerified)) appendUnique(issues, `file-integrity-runtime-boundary-violation:${record.candidateId}`);
  }
  for (const candidate of LOCAL_MODEL_APPROVAL_REGISTRY) if (!seen.has(candidate.candidateId)) appendUnique(issues, `missing-integrity-record:${candidate.candidateId}`);
  return { valid: issues.length === 0, issues: unique(issues) };
}
