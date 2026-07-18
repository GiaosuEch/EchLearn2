import { LOCAL_MODEL_APPROVAL_REGISTRY } from './localModelApprovalRegistry.ts';
import type { LocalModelApprovalCandidate } from './localModelApprovalTypes.ts';
import type {
  LocalModelArtifactEvidenceRecord,
  LocalModelArtifactEvidenceRegistryValidation,
  LocalModelArtifactEvidenceSource,
  LocalModelArtifactEvidenceTruthStatus,
  LocalModelOfficialArtifactFileEvidence,
} from './localModelArtifactEvidenceTypes.ts';

const REVIEW_DATE = '2026-07-18';
const OFFICIAL_QWEN3_REPOSITORY = 'https://github.com/QwenLM/Qwen3';

interface OfficialArtifactObservation {
  readonly revision: string;
  readonly weightFileNames: readonly string[];
  readonly weightIndexPresent: LocalModelArtifactEvidenceTruthStatus;
  readonly aggregateWeightSizeBytes: number | null;
  readonly officialQuantizedRepositoryId: string;
  readonly quantizationLabel: string;
}

const OFFICIAL_ARTIFACT_OBSERVATIONS: Readonly<Record<string, OfficialArtifactObservation>> = {
  'qwen3-0-6b-candidate': {
    revision: 'c1899de289a04d12100db370d81485cdf75e47ca',
    weightFileNames: ['model.safetensors'],
    weightIndexPresent: 'absent',
    aggregateWeightSizeBytes: null,
    officialQuantizedRepositoryId: 'Qwen/Qwen3-0.6B-GGUF',
    quantizationLabel: 'Official Qwen GGUF q8_0 evidence observed; no production variant selected.',
  },
  'qwen3-1-7b-candidate': {
    revision: '70d244cc86ccca08cf5af4e1e306ecf908b1ad5e',
    weightFileNames: [
      'model-00001-of-00002.safetensors',
      'model-00002-of-00002.safetensors',
    ],
    weightIndexPresent: 'confirmed',
    aggregateWeightSizeBytes: 4_063_479_808,
    officialQuantizedRepositoryId: 'Qwen/Qwen3-1.7B-GGUF',
    quantizationLabel: 'Official Qwen GGUF q8_0 evidence observed; no production variant selected.',
  },
  'qwen3-4b-candidate': {
    revision: '1cfa9a7208912126459214e8b04321603b3df60c',
    weightFileNames: [
      'model-00001-of-00003.safetensors',
      'model-00002-of-00003.safetensors',
      'model-00003-of-00003.safetensors',
    ],
    weightIndexPresent: 'confirmed',
    aggregateWeightSizeBytes: 8_044_936_192,
    officialQuantizedRepositoryId: 'Qwen/Qwen3-4B-GGUF',
    quantizationLabel: 'Official Qwen GGUF q4_K_M, q5_0, q5_K_M, q6_K, and q8_0 evidence observed; no production variant selected.',
  },
};

function appendUnique(values: string[], value: string): void {
  if (!values.includes(value)) values.push(value);
}

function unique(values: readonly string[]): readonly string[] {
  const result: string[] = [];
  for (const value of values) appendUnique(result, value);
  return result;
}

function buildSources(
  candidate: LocalModelApprovalCandidate,
  observation: OfficialArtifactObservation,
): readonly LocalModelArtifactEvidenceSource[] {
  const repositoryId = `Qwen/${candidate.displayName}`;
  return [
    {
      sourceId: `${candidate.candidateId}-repository-tree`,
      sourceKind: 'official-file-tree',
      officialPublisher: true,
      title: `${repositoryId} official repository file tree`,
      repositoryId,
      reference: `https://huggingface.co/${repositoryId}/tree/${observation.revision}`,
      retrievedOn: REVIEW_DATE,
      supportsFields: [
        'officialRepositoryConfirmed', 'artifactFormat', 'weightFilesPresent',
        'weightShardCount', 'weightIndexPresent', 'configPresent',
        'generationConfigPresent', 'tokenizerFilesPresent', 'tokenizerConfigPresent',
        'licenseFilePresent', 'noticeFilePresent', 'modelCardPresent',
      ],
      notes: 'Official Qwen repository tree; displayed file sizes are rounded and are not recorded as exact bytes.',
    },
    {
      sourceId: `${candidate.candidateId}-revision`,
      sourceKind: 'official-revision-page',
      officialPublisher: true,
      title: `${repositoryId} official immutable revision`,
      repositoryId,
      reference: `https://huggingface.co/${repositoryId}/commit/${observation.revision}`,
      retrievedOn: REVIEW_DATE,
      supportsFields: ['observedRevision', 'immutableRevisionAvailable', 'publisher'],
      notes: 'Official commit page used as immutable evidence only; it is not pinned into the production artifact manifest.',
    },
    {
      sourceId: `${candidate.candidateId}-model-card`,
      sourceKind: 'official-model-card',
      officialPublisher: true,
      title: `${repositoryId} official model card`,
      repositoryId,
      reference: `https://huggingface.co/${repositoryId}`,
      retrievedOn: REVIEW_DATE,
      supportsFields: ['candidateId', 'exactModelName', 'publisher', 'modelClass'],
      notes: 'Official Qwen organization model card confirms the exact candidate-to-repository identity.',
    },
    ...(observation.aggregateWeightSizeBytes === null ? [] : [{
      sourceId: `${candidate.candidateId}-weight-index-metadata`,
      sourceKind: 'official-file-metadata' as const,
      officialPublisher: true,
      title: `${repositoryId} official Safetensors index metadata`,
      repositoryId,
      reference: `https://huggingface.co/${repositoryId}/blob/${observation.revision}/model.safetensors.index.json`,
      retrievedOn: REVIEW_DATE,
      supportsFields: ['aggregateWeightSizeBytes', 'aggregateSizeEvidenceStatus'],
      notes: 'Official Safetensors index metadata supplies the exact aggregate weight byte total; no checksum or artifact selection is recorded.',
    }]),
    {
      sourceId: `${candidate.candidateId}-quantized-repository`,
      sourceKind: 'official-repository',
      officialPublisher: true,
      title: `${observation.officialQuantizedRepositoryId} official Qwen GGUF repository`,
      repositoryId: observation.officialQuantizedRepositoryId,
      reference: `https://huggingface.co/${observation.officialQuantizedRepositoryId}`,
      retrievedOn: REVIEW_DATE,
      supportsFields: ['officialQuantizedVariantAvailable', 'quantizationLabel'],
      notes: 'Official quantized-variant evidence only; no quantized artifact is selected or approved.',
    },
    {
      sourceId: 'qwen3-official-publisher-repository',
      sourceKind: 'official-documentation',
      officialPublisher: true,
      title: 'QwenLM/Qwen3 official publisher repository',
      repositoryId: 'QwenLM/Qwen3',
      reference: OFFICIAL_QWEN3_REPOSITORY,
      retrievedOn: REVIEW_DATE,
      supportsFields: ['publisher', 'family', 'officialBaseVariantConfirmed'],
      notes: 'Official Qwen Team repository for Qwen3 provenance context.',
    },
  ];
}

function createWeightFiles(
  fileNames: readonly string[],
): readonly LocalModelOfficialArtifactFileEvidence[] {
  return fileNames.map((fileName) => ({
    fileName,
    exactSizeBytes: null,
    officialMetadata: true,
  }));
}

function createArtifactEvidenceRecord(
  candidate: LocalModelApprovalCandidate,
): LocalModelArtifactEvidenceRecord {
  const observation = OFFICIAL_ARTIFACT_OBSERVATIONS[candidate.candidateId];
  const repositoryId = `Qwen/${candidate.displayName}`;
  if (!observation) {
    return {
      candidateId: candidate.candidateId,
      candidateTier: candidate.tier,
      modelClass: candidate.parameterScaleLabel,
      exactModelName: candidate.displayName,
      publisher: 'Qwen Team, Alibaba Cloud',
      officialRepositoryId: repositoryId,
      evidenceStatus: 'repository-not-found',
      officialRepositoryConfirmed: 'unknown',
      observedRevision: null,
      immutableRevisionAvailable: 'unknown',
      artifactFormat: 'unknown',
      officialBaseVariantConfirmed: 'unknown',
      officialQuantizedVariantAvailable: 'unknown',
      officialQuantizedRepositoryId: null,
      quantizationLabel: null,
      weightFilesPresent: 'unknown',
      weightFiles: [],
      weightShardCount: null,
      weightIndexPresent: 'unknown',
      aggregateWeightSizeBytes: null,
      aggregateWeightSizeMb: null,
      aggregateSizeEvidenceStatus: 'unknown',
      configPresent: 'unknown',
      generationConfigPresent: 'unknown',
      tokenizerFilesPresent: 'unknown',
      tokenizerConfigPresent: 'unknown',
      licenseFilePresent: 'unknown',
      noticeFilePresent: 'unknown',
      modelCardPresent: 'unknown',
      lfsMetadataAvailable: 'unknown',
      checksumValuesRecorded: false,
      checksumVerified: false,
      directDownloadLocationRecorded: false,
      artifactSelected: false,
      humanReviewRequired: true,
      modelApproved: false,
      licenseApproved: false,
      artifactApproved: false,
      benchmarkVerified: false,
      downloadable: false,
      cacheable: false,
      runtimeReady: false,
      modelActive: false,
      sources: [],
      missingEvidence: ['official-repository-observation'],
      conflicts: [],
    };
  }

  return {
    candidateId: candidate.candidateId,
    candidateTier: candidate.tier,
    modelClass: candidate.parameterScaleLabel,
    exactModelName: candidate.displayName,
    publisher: 'Qwen Team, Alibaba Cloud',
    officialRepositoryId: repositoryId,
    evidenceStatus: 'evidence-incomplete',
    officialRepositoryConfirmed: 'confirmed',
    observedRevision: observation.revision,
    immutableRevisionAvailable: 'confirmed',
    artifactFormat: 'safetensors',
    officialBaseVariantConfirmed: 'confirmed',
    officialQuantizedVariantAvailable: 'confirmed',
    officialQuantizedRepositoryId: observation.officialQuantizedRepositoryId,
    quantizationLabel: observation.quantizationLabel,
    weightFilesPresent: 'confirmed',
    weightFiles: createWeightFiles(observation.weightFileNames),
    weightShardCount: observation.weightFileNames.length,
    weightIndexPresent: observation.weightIndexPresent,
    aggregateWeightSizeBytes: observation.aggregateWeightSizeBytes,
    aggregateWeightSizeMb: observation.aggregateWeightSizeBytes === null
      ? null
      : observation.aggregateWeightSizeBytes / (1024 * 1024),
    aggregateSizeEvidenceStatus: observation.aggregateWeightSizeBytes === null ? 'unknown' : 'confirmed',
    configPresent: 'confirmed',
    generationConfigPresent: 'confirmed',
    tokenizerFilesPresent: 'confirmed',
    tokenizerConfigPresent: 'confirmed',
    licenseFilePresent: 'confirmed',
    noticeFilePresent: 'absent',
    modelCardPresent: 'confirmed',
    lfsMetadataAvailable: 'confirmed',
    checksumValuesRecorded: false,
    checksumVerified: false,
    directDownloadLocationRecorded: false,
    artifactSelected: false,
    humanReviewRequired: true,
    modelApproved: false,
    licenseApproved: false,
    artifactApproved: false,
    benchmarkVerified: false,
    downloadable: false,
    cacheable: false,
    runtimeReady: false,
    modelActive: false,
    sources: buildSources(candidate, observation),
    missingEvidence: [
      ...(observation.aggregateWeightSizeBytes === null ? ['exact-aggregate-weight-size'] : []),
      'artifact-selection-human-review',
      'checksum-selection-and-verification',
      'browser-runtime-compatibility-evidence',
    ],
    conflicts: [],
  };
}

export function calculateOfficialAggregateWeightSize(
  files: readonly LocalModelOfficialArtifactFileEvidence[],
): number | null {
  if (files.length === 0) return null;
  const seen = new Set<string>();
  let total = 0;
  for (const file of files) {
    if (seen.has(file.fileName)) return null;
    seen.add(file.fileName);
    if (!file.officialMetadata) return null;
    if (file.exactSizeBytes === null || !Number.isFinite(file.exactSizeBytes) || file.exactSizeBytes < 0) {
      return null;
    }
    total += file.exactSizeBytes;
    if (!Number.isFinite(total)) return null;
  }
  return total;
}

export function evaluateLocalModelArtifactEvidence(
  record: LocalModelArtifactEvidenceRecord,
): LocalModelArtifactEvidenceRecord {
  const missingEvidence = [...record.missingEvidence];

  if (record.officialRepositoryConfirmed !== 'confirmed') appendUnique(missingEvidence, 'official-repository');
  if (!record.observedRevision || record.immutableRevisionAvailable !== 'confirmed') {
    appendUnique(missingEvidence, 'immutable-revision');
  }
  if (record.artifactFormat === 'unknown') appendUnique(missingEvidence, 'weight-format');
  if (record.officialBaseVariantConfirmed !== 'confirmed') appendUnique(missingEvidence, 'official-base-variant');
  if (record.weightFilesPresent !== 'confirmed') appendUnique(missingEvidence, 'weight-files');
  if (!Number.isInteger(record.weightShardCount) || (record.weightShardCount ?? -1) < 0) {
    appendUnique(missingEvidence, 'weight-shard-count');
  }
  if (record.configPresent !== 'confirmed') appendUnique(missingEvidence, 'config-file');
  if (record.tokenizerFilesPresent !== 'confirmed') appendUnique(missingEvidence, 'tokenizer-files');
  if (record.licenseFilePresent !== 'confirmed') appendUnique(missingEvidence, 'license-file');
  if (record.modelCardPresent !== 'confirmed') appendUnique(missingEvidence, 'model-card');
  if (record.lfsMetadataAvailable === 'unknown') appendUnique(missingEvidence, 'lfs-integrity-metadata-availability');
  if (record.officialQuantizedVariantAvailable === 'unknown') appendUnique(missingEvidence, 'official-quantized-variant-evidence');

  const recordedAggregateBytes = record.aggregateSizeEvidenceStatus === 'confirmed'
    && record.aggregateWeightSizeBytes !== null
    && Number.isFinite(record.aggregateWeightSizeBytes)
    && record.aggregateWeightSizeBytes >= 0
    ? record.aggregateWeightSizeBytes
    : null;
  const aggregateBytes = recordedAggregateBytes ?? calculateOfficialAggregateWeightSize(record.weightFiles);
  if (aggregateBytes === null || record.aggregateSizeEvidenceStatus !== 'confirmed') {
    appendUnique(missingEvidence, 'exact-aggregate-weight-size');
  }

  const evidenceStatus = record.conflicts.length > 0
    ? 'conflicting-evidence'
    : record.evidenceStatus === 'repository-not-found'
      ? 'repository-not-found'
      : missingEvidence.length > 0
        ? 'evidence-incomplete'
        : 'evidence-collected';

  return {
    ...record,
    evidenceStatus,
    aggregateWeightSizeBytes: aggregateBytes,
    aggregateWeightSizeMb: aggregateBytes === null ? null : aggregateBytes / (1024 * 1024),
    missingEvidence: unique(missingEvidence),
    conflicts: unique(record.conflicts),
    checksumValuesRecorded: false,
    checksumVerified: false,
    directDownloadLocationRecorded: false,
    artifactSelected: false,
    humanReviewRequired: true,
    modelApproved: false,
    licenseApproved: false,
    artifactApproved: false,
    benchmarkVerified: false,
    downloadable: false,
    cacheable: false,
    runtimeReady: false,
    modelActive: false,
  };
}

export const LOCAL_MODEL_ARTIFACT_EVIDENCE_REGISTRY: readonly LocalModelArtifactEvidenceRecord[] =
  LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) =>
    evaluateLocalModelArtifactEvidence(createArtifactEvidenceRecord(candidate)),
  );

export function getLocalModelArtifactEvidence(
  candidateId: string,
): LocalModelArtifactEvidenceRecord | null {
  return LOCAL_MODEL_ARTIFACT_EVIDENCE_REGISTRY.find(
    (record) => record.candidateId === candidateId,
  ) ?? null;
}

export function listLocalModelArtifactEvidence(): readonly LocalModelArtifactEvidenceRecord[] {
  return LOCAL_MODEL_ARTIFACT_EVIDENCE_REGISTRY;
}

export function validateLocalModelArtifactEvidenceRegistry(
  records: readonly LocalModelArtifactEvidenceRecord[] = LOCAL_MODEL_ARTIFACT_EVIDENCE_REGISTRY,
): LocalModelArtifactEvidenceRegistryValidation {
  const issues: string[] = [];
  const expectedById = new Map(
    LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) => [candidate.candidateId, candidate]),
  );
  const seenCandidates = new Set<string>();

  if (records.length !== LOCAL_MODEL_APPROVAL_REGISTRY.length) {
    appendUnique(issues, 'candidate-count-mismatch');
  }

  for (const record of records) {
    if (seenCandidates.has(record.candidateId)) {
      appendUnique(issues, `duplicate-candidate:${record.candidateId}`);
    }
    seenCandidates.add(record.candidateId);

    const candidate = expectedById.get(record.candidateId);
    if (!candidate) {
      appendUnique(issues, `orphan-evidence:${record.candidateId}`);
      continue;
    }
    if (record.candidateTier !== candidate.tier) appendUnique(issues, `tier-mismatch:${record.candidateId}`);
    if (record.modelClass !== candidate.parameterScaleLabel) appendUnique(issues, `model-class-mismatch:${record.candidateId}`);
    if (record.exactModelName !== candidate.displayName) appendUnique(issues, `identity-mismatch:${record.candidateId}`);
    if (record.officialRepositoryId !== `Qwen/${candidate.displayName}`) {
      appendUnique(issues, `repository-mismatch:${record.candidateId}`);
    }
    if (record.observedRevision !== null && !/^[a-f0-9]{40}$/.test(record.observedRevision)) {
      appendUnique(issues, `revision-invalid:${record.candidateId}`);
    }
    if (!Number.isInteger(record.weightShardCount) || (record.weightShardCount ?? -1) < 0) {
      appendUnique(issues, `weight-shard-count-invalid:${record.candidateId}`);
    }
    if (record.weightShardCount !== record.weightFiles.length) {
      appendUnique(issues, `weight-inventory-mismatch:${record.candidateId}`);
    }
    if (new Set(record.weightFiles.map((file) => file.fileName)).size !== record.weightFiles.length) {
      appendUnique(issues, `duplicate-weight-file:${record.candidateId}`);
    }
    if (record.sources.some((source) => !source.officialPublisher)) {
      appendUnique(issues, `non-official-source:${record.candidateId}`);
    }
    if (new Set(record.sources.map((source) => source.sourceId)).size !== record.sources.length) {
      appendUnique(issues, `duplicate-source:${record.candidateId}`);
    }
    if (record.sources.some((source) => {
      const isOfficialReviewPage = /^https:\/\/(?:huggingface\.co\/Qwen\/[^?#]+|github\.com\/QwenLM\/Qwen3)$/.test(
        source.reference,
      );
      return !isOfficialReviewPage || source.reference.includes('?') || source.reference.includes('#');
    })) {
      appendUnique(issues, `non-review-page-reference:${record.candidateId}`);
    }
    if (record.checksumValuesRecorded || record.checksumVerified || record.directDownloadLocationRecorded) {
      appendUnique(issues, `integrity-or-download-boundary-violation:${record.candidateId}`);
    }
    if (
      record.artifactSelected
      || record.modelApproved
      || record.licenseApproved
      || record.artifactApproved
      || record.benchmarkVerified
      || record.downloadable
      || record.cacheable
      || record.runtimeReady
      || record.modelActive
    ) {
      appendUnique(issues, `approval-or-runtime-boundary-violation:${record.candidateId}`);
    }
  }

  for (const candidate of LOCAL_MODEL_APPROVAL_REGISTRY) {
    if (!seenCandidates.has(candidate.candidateId)) {
      appendUnique(issues, `missing-evidence:${candidate.candidateId}`);
    }
  }

  return { valid: issues.length === 0, issues };
}
