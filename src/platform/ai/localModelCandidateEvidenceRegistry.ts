import { LOCAL_MODEL_APPROVAL_REGISTRY } from './localModelApprovalRegistry.ts';
import type { LocalModelApprovalCandidate } from './localModelApprovalTypes.ts';
import type {
  LocalModelCandidateEvidenceRecord,
  LocalModelCandidateEvidenceRegistryValidation,
  LocalModelCandidateEvidenceSource,
} from './localModelCandidateEvidenceTypes.ts';

const REVIEW_DATE = '2026-07-18';
const OFFICIAL_QWEN3_REPOSITORY = 'https://github.com/QwenLM/Qwen3';
const OFFICIAL_QWEN3_RELEASE = 'https://qwenlm.github.io/blog/qwen3/';

function appendUnique(values: string[], value: string): void {
  if (!values.includes(value)) values.push(value);
}

function buildOfficialSources(exactModelName: string): readonly LocalModelCandidateEvidenceSource[] {
  const repositoryName = exactModelName;
  return [
    {
      sourceId: `${repositoryName.toLowerCase()}-model-card`,
      sourceKind: 'official-model-card',
      officialPublisher: true,
      title: `Qwen/${repositoryName} official model card`,
      reference: `https://huggingface.co/Qwen/${repositoryName}`,
      retrievedOn: REVIEW_DATE,
      supportsFields: [
        'exactModelName', 'publisher', 'family', 'modelClass',
        'licenseIdentifier', 'officialIdentityConfirmed',
      ],
      notes: 'Official Qwen organization model card; evidence metadata only.',
    },
    {
      sourceId: `${repositoryName.toLowerCase()}-license`,
      sourceKind: 'official-license',
      officialPublisher: true,
      title: `Qwen/${repositoryName} official Apache-2.0 license file`,
      reference: `https://huggingface.co/Qwen/${repositoryName}/blob/main/LICENSE`,
      retrievedOn: REVIEW_DATE,
      supportsFields: [
        'licenseIdentifier', 'licenseTextLocated', 'commercialUse',
        'redistribution', 'derivativeWorks', 'attributionRequired',
        'noticeRequired', 'trademarkPermissionGranted',
      ],
      notes: 'Official repository license text; human product and legal review remains required.',
    },
    {
      sourceId: 'qwen3-official-repository',
      sourceKind: 'official-repository',
      officialPublisher: true,
      title: 'QwenLM/Qwen3 official repository',
      reference: OFFICIAL_QWEN3_REPOSITORY,
      retrievedOn: REVIEW_DATE,
      supportsFields: ['publisher', 'family', 'licenseIdentifier'],
      notes: 'Official repository states that Qwen3 open-weight models use Apache-2.0.',
    },
    {
      sourceId: 'qwen3-official-release',
      sourceKind: 'official-release-notes',
      officialPublisher: true,
      title: 'Qwen3: Think Deeper, Act Faster',
      reference: OFFICIAL_QWEN3_RELEASE,
      retrievedOn: REVIEW_DATE,
      supportsFields: ['family', 'versionOrRevision', 'publisher'],
      notes: 'Official Qwen Team release announcement for the Qwen3 family.',
    },
  ];
}

function createEvidenceRecord(
  candidate: LocalModelApprovalCandidate,
): LocalModelCandidateEvidenceRecord {
  const exactModelName = candidate.displayName;
  return {
    candidateId: candidate.candidateId,
    candidateTier: candidate.tier,
    modelClass: candidate.parameterScaleLabel,
    exactModelName,
    publisher: 'Qwen Team, Alibaba Cloud',
    family: 'Qwen3',
    versionOrRevision: 'Qwen3 release; official repository default branch reviewed 2026-07-18',
    evidenceStatus: 'evidence-incomplete',
    officialIdentityConfirmed: true,
    licenseIdentifier: 'Apache-2.0',
    licenseTextLocated: true,
    licenseFacts: {
      commercialUse: 'yes',
      internalBusinessUse: 'yes',
      redistribution: 'yes',
      hostingDerivedArtifacts: 'unknown',
      derivativeWorks: 'yes',
      quantizationAllowed: 'unknown',
      attributionRequired: 'yes',
      noticeRequired: 'yes',
      gatedAccess: 'no',
      separateTokenizerTerms: 'unknown',
      acceptableUsePolicyApplies: 'unknown',
      trademarkPermissionGranted: 'no',
    },
    attributionSummary: 'Apache-2.0 redistribution requires a license copy, preservation of applicable notices, change notices for modified files, and NOTICE handling when present.',
    restrictionSummary: 'Apache-2.0 does not grant trademark rights; planned hosting, tokenizer redistribution, conversion, and quantization still require product and legal review.',
    tokenizerEvidenceStatus: 'official-files-present-license-scope-unresolved',
    browserRuntimeEvidenceStatus: 'official-browser-evidence-not-found',
    artifactEvidenceStatus: 'not-reviewed',
    sources: buildOfficialSources(exactModelName),
    missingEvidence: [
      'quantization-product-review',
      'hosting-derived-artifact-review',
      'tokenizer-license-scope',
      'acceptable-use-policy-scope',
      'browser-runtime-evidence',
      'artifact-provenance',
    ],
    conflicts: [],
    humanReviewRequired: true,
    modelApproved: false,
    licenseApproved: false,
    artifactApproved: false,
    benchmarkVerified: false,
    runtimeReady: false,
    downloadable: false,
    modelActive: false,
  };
}

export function evaluateLocalModelCandidateEvidence(
  record: LocalModelCandidateEvidenceRecord,
): LocalModelCandidateEvidenceRecord {
  const missingEvidence = [...record.missingEvidence];
  const officialModelCard = record.sources.some(
    (source) => source.officialPublisher && source.sourceKind === 'official-model-card',
  );
  const officialLicense = record.sources.some(
    (source) => source.officialPublisher && source.sourceKind === 'official-license',
  );

  if (!record.officialIdentityConfirmed) appendUnique(missingEvidence, 'exact-model-identity');
  if (!officialModelCard) appendUnique(missingEvidence, 'official-model-card');
  if (!officialLicense) appendUnique(missingEvidence, 'official-license-source');
  if (!record.licenseIdentifier) appendUnique(missingEvidence, 'license-identifier');
  if (!record.licenseTextLocated) appendUnique(missingEvidence, 'official-license-text');
  if (record.licenseFacts.commercialUse === 'unknown') appendUnique(missingEvidence, 'commercial-use-terms');
  if (record.licenseFacts.redistribution === 'unknown') appendUnique(missingEvidence, 'redistribution-terms');
  if (record.licenseFacts.derivativeWorks === 'unknown') appendUnique(missingEvidence, 'derivative-work-terms');
  if (record.licenseFacts.attributionRequired === 'unknown') appendUnique(missingEvidence, 'attribution-terms');
  if (record.licenseFacts.noticeRequired === 'unknown') appendUnique(missingEvidence, 'notice-terms');

  const evidenceStatus = record.conflicts.length > 0
    ? 'conflicting-evidence'
    : missingEvidence.length > 0
      ? 'evidence-incomplete'
      : 'evidence-collected';

  return {
    ...record,
    evidenceStatus,
    missingEvidence,
    sources: record.sources.map((source) => ({
      ...source,
      supportsFields: [...source.supportsFields],
    })),
    conflicts: [...record.conflicts],
    humanReviewRequired: true,
    modelApproved: false,
    licenseApproved: false,
    artifactApproved: false,
    benchmarkVerified: false,
    runtimeReady: false,
    downloadable: false,
    modelActive: false,
  };
}

export const LOCAL_MODEL_CANDIDATE_EVIDENCE_REGISTRY: readonly LocalModelCandidateEvidenceRecord[] =
  LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) => evaluateLocalModelCandidateEvidence(
    createEvidenceRecord(candidate),
  ));

export function getLocalModelCandidateEvidence(
  candidateId: string,
): LocalModelCandidateEvidenceRecord | null {
  return LOCAL_MODEL_CANDIDATE_EVIDENCE_REGISTRY.find(
    (record) => record.candidateId === candidateId,
  ) ?? null;
}

export function listLocalModelCandidateEvidence(): readonly LocalModelCandidateEvidenceRecord[] {
  return LOCAL_MODEL_CANDIDATE_EVIDENCE_REGISTRY;
}

export function validateLocalModelCandidateEvidenceRegistry(): LocalModelCandidateEvidenceRegistryValidation {
  const issues: string[] = [];
  const approvalIds = LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) => candidate.candidateId);
  const evidenceIds = LOCAL_MODEL_CANDIDATE_EVIDENCE_REGISTRY.map((record) => record.candidateId);
  const expectedModelClassByTier = { light: '0.6B', standard: '1.7B', pro: '4B' } as const;

  if (evidenceIds.length !== approvalIds.length) appendUnique(issues, 'candidate-count-mismatch');
  if (new Set(evidenceIds).size !== evidenceIds.length) appendUnique(issues, 'duplicate-candidate-evidence');
  if (approvalIds.some((candidateId, index) => evidenceIds[index] !== candidateId)) {
    appendUnique(issues, 'candidate-identity-mismatch');
  }

  for (const record of LOCAL_MODEL_CANDIDATE_EVIDENCE_REGISTRY) {
    const approvalCandidate = LOCAL_MODEL_APPROVAL_REGISTRY.find(
      (candidate) => candidate.candidateId === record.candidateId,
    );
    if (!approvalCandidate) appendUnique(issues, `orphan-evidence:${record.candidateId}`);
    if (approvalCandidate && approvalCandidate.tier !== record.candidateTier) {
      appendUnique(issues, `tier-mismatch:${record.candidateId}`);
    }
    if (approvalCandidate && approvalCandidate.displayName !== record.exactModelName) {
      appendUnique(issues, `exact-model-identity-mismatch:${record.candidateId}`);
    }
    if (record.modelClass !== expectedModelClassByTier[record.candidateTier]) {
      appendUnique(issues, `model-class-mismatch:${record.candidateId}`);
    }
    if (record.sources.some((source) => !source.officialPublisher)) {
      appendUnique(issues, `non-official-primary-source:${record.candidateId}`);
    }
    if (record.sources.some((source) => /resolve\/|\.safetensors|\.gguf|[?&](?:token|signature|sig|expires|key)=/i.test(source.reference))) {
      appendUnique(issues, `unsafe-source-reference:${record.candidateId}`);
    }
    if (
      record.modelApproved || record.licenseApproved || record.artifactApproved
      || record.benchmarkVerified || record.runtimeReady || record.downloadable || record.modelActive
    ) {
      appendUnique(issues, `approval-boundary-violation:${record.candidateId}`);
    }
  }

  return { valid: issues.length === 0, issues };
}
