import { LOCAL_MODEL_APPROVAL_REGISTRY } from './localModelApprovalRegistry.ts';
import { listLocalModelArtifactEvidence } from './localModelArtifactEvidenceRegistry.ts';
import { listCurrentLocalModelGovernanceReviewPackets } from './localModelGovernanceReviewPacket.ts';
import type {
  LocalModelGovernanceRequirementStatus,
} from './localModelGovernanceReviewPacketTypes.ts';
import type {
  LocalModelGovernanceEvidenceClosureCandidateRecord,
  LocalModelGovernanceEvidenceClosureImpact,
  LocalModelGovernanceEvidenceClosureRequirementId,
  LocalModelGovernanceEvidenceClosureRequirementRecord,
  LocalModelGovernanceEvidenceClosureSource,
  LocalModelGovernanceEvidenceClosureSourceKind,
  LocalModelGovernanceEvidenceClosureStatus,
  LocalModelGovernanceEvidenceClosureTruthValue,
  LocalModelGovernanceEvidenceClosureValidation,
} from './localModelGovernanceEvidenceClosureTypes.ts';

const REVIEW_DATE = '2026-07-18';

const REQUIREMENT_IDS: readonly LocalModelGovernanceEvidenceClosureRequirementId[] = [
  'tokenizer-license-scope',
  'acceptable-use-scope',
  'derived-artifact-hosting',
  'quantization-conversion',
] as const;

const REQUIRED_SOURCE_KINDS: Readonly<Record<
  LocalModelGovernanceEvidenceClosureRequirementId,
  readonly LocalModelGovernanceEvidenceClosureSourceKind[]
>> = {
  'tokenizer-license-scope': [
    'official-repository-file-tree',
    'official-repository-license',
    'official-apache-license-guidance',
  ],
  'acceptable-use-scope': ['official-publisher-policy'],
  'derived-artifact-hosting': [
    'official-repository-license',
    'official-apache-license',
  ],
  'quantization-conversion': [
    'official-repository-license',
    'official-apache-license',
    'official-publisher-documentation',
    'official-model-card',
  ],
};

function appendUnique<T>(values: T[], value: T): void {
  if (!values.includes(value)) values.push(value);
}

function unique<T>(values: readonly T[]): readonly T[] {
  return [...new Set(values)];
}

function sourceId(candidateId: string, suffix: string): string {
  return `${candidateId}-${suffix}`;
}

function buildSources(
  candidateId: string,
  officialRepositoryId: string,
  observedRevision: string | null,
  quantizedRepositoryId: string | null,
): readonly LocalModelGovernanceEvidenceClosureSource[] {
  const revision = observedRevision;
  const revisionPath = revision ?? 'main';
  const sources: LocalModelGovernanceEvidenceClosureSource[] = [
    {
      sourceId: sourceId(candidateId, 'repository-tree'),
      sourceKind: 'official-repository-file-tree',
      officialPublisher: true,
      title: `${officialRepositoryId} official immutable repository tree`,
      repositoryId: officialRepositoryId,
      revision,
      reference: `https://huggingface.co/${officialRepositoryId}/tree/${revisionPath}`,
      retrievedOn: REVIEW_DATE,
      supportsRequirements: ['tokenizer-license-scope'],
      supportsFields: [
        'tokenizer.json',
        'tokenizer_config.json',
        'vocab.json',
        'merges.txt',
        'root LICENSE',
        'no separate tokenizer LICENSE located',
        'no repository NOTICE located',
      ],
      notes: 'The official immutable tree contains tokenizer assets and a root Apache-2.0 LICENSE. No separate tokenizer-specific license, notice, or upstream-tokenizer terms file was located in the reviewed tree.',
    },
    {
      sourceId: sourceId(candidateId, 'repository-license'),
      sourceKind: 'official-repository-license',
      officialPublisher: true,
      title: `${officialRepositoryId} official Apache-2.0 license`,
      repositoryId: officialRepositoryId,
      revision,
      reference: `https://huggingface.co/${officialRepositoryId}/blob/${revisionPath}/LICENSE`,
      retrievedOn: REVIEW_DATE,
      supportsRequirements: [
        'tokenizer-license-scope',
        'derived-artifact-hosting',
        'quantization-conversion',
      ],
      supportsFields: [
        'Apache-2.0 repository license',
        'derivative works permission',
        'redistribution permission',
        'license copy obligation',
        'modified-file notice obligation',
        'NOTICE handling',
        'trademark limitation',
      ],
      notes: 'Official repository license evidence only. Product and legal approval remain separate human decisions.',
    },
    {
      sourceId: sourceId(candidateId, 'model-card'),
      sourceKind: 'official-model-card',
      officialPublisher: true,
      title: `${officialRepositoryId} official model card`,
      repositoryId: officialRepositoryId,
      revision,
      reference: `https://huggingface.co/${officialRepositoryId}`,
      retrievedOn: REVIEW_DATE,
      supportsRequirements: ['tokenizer-license-scope'],
      supportsFields: ['official candidate identity', 'Apache-2.0 repository metadata', 'AutoTokenizer repository provenance'],
      notes: 'Official Qwen model card identifies the exact repository and loads tokenizer assets from that repository. This does not by itself approve tokenizer redistribution.',
    },
    {
      sourceId: 'qwen3-official-publisher-repository',
      sourceKind: 'official-publisher-documentation',
      officialPublisher: true,
      title: 'QwenLM/Qwen3 official publisher repository',
      repositoryId: 'QwenLM/Qwen3',
      revision: null,
      reference: 'https://github.com/QwenLM/Qwen3',
      retrievedOn: REVIEW_DATE,
      supportsRequirements: [
        'tokenizer-license-scope',
        'derived-artifact-hosting',
        'quantization-conversion',
      ],
      supportsFields: ['all Qwen3 open-weight models use Apache-2.0', 'official quantization documentation'],
      notes: 'Official publisher documentation states that Qwen3 open-weight models use Apache-2.0 and includes conversion and quantization guidance. It does not record a product approval.',
    },
    {
      sourceId: 'qwen-usage-policy-2025-03-21',
      sourceKind: 'official-publisher-policy',
      officialPublisher: true,
      title: 'Qwen Usage Policy',
      repositoryId: null,
      revision: 'last-updated-2025-03-21',
      reference: 'https://qwen.ai/usagepolicy',
      retrievedOn: REVIEW_DATE,
      supportsRequirements: ['acceptable-use-scope'],
      supportsFields: ['policy applies to platforms, APIs, and open-source models', 'commercial and non-commercial scope', 'prohibited and high-risk uses'],
      notes: 'Organization-level policy with an explicit last-updated date. Human review must account for temporal updates and jurisdiction-specific obligations.',
    },
    {
      sourceId: 'apache-license-2.0-official',
      sourceKind: 'official-apache-license',
      officialPublisher: true,
      title: 'Apache License, Version 2.0',
      repositoryId: null,
      revision: '2.0',
      reference: 'https://www.apache.org/licenses/LICENSE-2.0.html',
      retrievedOn: REVIEW_DATE,
      supportsRequirements: [
        'derived-artifact-hosting',
        'quantization-conversion',
      ],
      supportsFields: [
        'reproduce',
        'prepare derivative works',
        'distribute in source or object form',
        'license copy',
        'modification notices',
        'notice retention',
        'trademark limitation',
      ],
      notes: 'Official license text supplies factual permissions and obligations. It does not make a product-specific hosting or conversion decision.',
    },
    {
      sourceId: 'apache-license-application-guidance',
      sourceKind: 'official-apache-license-guidance',
      officialPublisher: true,
      title: 'Applying the Apache License, Version 2.0',
      repositoryId: null,
      revision: '2.0-guidance',
      reference: 'https://www.apache.org/legal/apply-license.html',
      retrievedOn: REVIEW_DATE,
      supportsRequirements: ['tokenizer-license-scope', 'derived-artifact-hosting'],
      supportsFields: ['top-level LICENSE applies to a software distribution', 'NOTICE handling'],
      notes: 'Official Apache guidance supports the repository-distribution scope analysis. It is not a substitute for product legal review.',
    },
  ];

  if (quantizedRepositoryId) {
    sources.push({
      sourceId: sourceId(candidateId, 'official-quantized-model-card'),
      sourceKind: 'official-model-card',
      officialPublisher: true,
      title: `${quantizedRepositoryId} official Qwen quantized model card`,
      repositoryId: quantizedRepositoryId,
      revision: null,
      reference: `https://huggingface.co/${quantizedRepositoryId}`,
      retrievedOn: REVIEW_DATE,
      supportsRequirements: ['quantization-conversion'],
      supportsFields: ['official publisher conversion provenance', 'GGUF quantization labels', 'Apache-2.0 repository metadata'],
      notes: 'Official quantized-model evidence demonstrates publisher-issued conversion. It does not select, approve, benchmark, or authorize a product artifact.',
    });
  }

  return sources;
}

function createRequirement(
  candidateId: string,
  candidateTier: LocalModelGovernanceEvidenceClosureCandidateRecord['candidateTier'],
  requirementId: LocalModelGovernanceEvidenceClosureRequirementId,
  factualSummary: string,
  sourceIds: readonly string[],
  status: LocalModelGovernanceEvidenceClosureStatus,
): LocalModelGovernanceEvidenceClosureRequirementRecord {
  return {
    requirementId,
    status,
    candidateId,
    candidateTier,
    factualSummary,
    sourceIds,
    missingEvidence: [],
    conflicts: [],
    humanDecisionRequired: true,
    productLegalReviewRequired: true,
    factualEvidenceComplete: status === 'factual-evidence-collected' || status === 'sufficient-for-human-decision',
    decisionRecorded: false,
    approved: false,
  };
}

function createCandidateRecord(
  candidateId: string,
): LocalModelGovernanceEvidenceClosureCandidateRecord {
  const packet = listCurrentLocalModelGovernanceReviewPackets().find((item) => item.candidateId === candidateId);
  const artifact = listLocalModelArtifactEvidence().find((item) => item.candidateId === candidateId);
  const approval = LOCAL_MODEL_APPROVAL_REGISTRY.find((item) => item.candidateId === candidateId);

  if (!packet || !artifact || !approval) {
    throw new Error(`Phase 5.7 baseline record missing for ${candidateId}`);
  }

  const sources = buildSources(
    candidateId,
    artifact.officialRepositoryId,
    artifact.observedRevision,
    artifact.officialQuantizedRepositoryId,
  );

  const requirements: readonly LocalModelGovernanceEvidenceClosureRequirementRecord[] = [
    createRequirement(
      candidateId,
      packet.candidateTier,
      'tokenizer-license-scope',
      'Tokenizer files are distributed in the exact official repository at the immutable revision. The reviewed tree contains a root Apache-2.0 LICENSE and no separate tokenizer-specific LICENSE, NOTICE, or declared upstream-tokenizer terms file. This factual scope still requires human product and legal review.',
      [
        sourceId(candidateId, 'repository-tree'),
        sourceId(candidateId, 'repository-license'),
        sourceId(candidateId, 'model-card'),
        'qwen3-official-publisher-repository',
        'apache-license-application-guidance',
      ],
      'factual-evidence-collected',
    ),
    createRequirement(
      candidateId,
      packet.candidateTier,
      'acceptable-use-scope',
      'The official Qwen Usage Policy states that it applies to Qwen platforms, APIs, and open-source models, for commercial and non-commercial use. Its organization-level and time-versioned scope is factual evidence, not a legal or governance approval.',
      ['qwen-usage-policy-2025-03-21'],
      'factual-evidence-collected',
    ),
    createRequirement(
      candidateId,
      packet.candidateTier,
      'derived-artifact-hosting',
      'Apache-2.0 grants preparation of Derivative Works and redistribution in source or object form and in any medium, subject to license-copy, modification-notice, retained-notice, NOTICE, and trademark conditions. These facts are sufficient for a human review of private hosting, end-user distribution, and CDN or object-storage delivery, but no scenario is approved here.',
      [
        sourceId(candidateId, 'repository-license'),
        'qwen3-official-publisher-repository',
        'apache-license-2.0-official',
        'apache-license-application-guidance',
      ],
      'sufficient-for-human-decision',
    ),
    createRequirement(
      candidateId,
      packet.candidateTier,
      'quantization-conversion',
      'Apache-2.0 derivative and redistribution terms, Qwen3 quantization guidance, and an official Qwen GGUF repository provide factual conversion evidence. Product-specific conversion, artifact naming, tokenizer or config bundling, quality, runtime compatibility, and redistribution remain explicit human decisions.',
      [
        sourceId(candidateId, 'repository-license'),
        'qwen3-official-publisher-repository',
        'apache-license-2.0-official',
        sourceId(candidateId, 'official-quantized-model-card'),
      ],
      'sufficient-for-human-decision',
    ),
  ];

  return evaluateLocalModelGovernanceEvidenceClosure({
    candidateId,
    candidateTier: packet.candidateTier,
    modelClass: packet.modelClass,
    exactModelName: packet.exactModelName,
    officialRepositoryId: artifact.officialRepositoryId,
    observedRevision: artifact.observedRevision,
    status: 'unresolved',
    tokenizerLicenseScope: 'unknown',
    acceptableUseScope: 'unknown',
    derivedArtifactHosting: 'unknown',
    quantizationConversion: 'unknown',
    requirements,
    resolvedFactualRequirements: [],
    unresolvedFactualRequirements: REQUIREMENT_IDS,
    humanDecisionRequirements: REQUIREMENT_IDS,
    conflictingRequirements: [],
    sources,
    warnings: [
      'Evidence closure is additive; historical Phase 5 registries and packets remain unchanged.',
      'Evidence closure is not legal advice, governance approval, artifact selection, or runtime readiness.',
    ],
    conflicts: [],
    humanGovernanceReviewRequired: true,
    humanDecisionRecorded: false,
    modelApproved: false,
    licenseApproved: false,
    artifactSelected: false,
    artifactApproved: false,
    checksumPinned: false,
    benchmarkVerified: false,
    downloadable: false,
    runtimeReady: false,
    modelActive: false,
    evidenceClosureOnly: true,
  });
}

function truthValueFor(
  status: LocalModelGovernanceEvidenceClosureStatus,
  decisionRequirement: boolean,
): LocalModelGovernanceEvidenceClosureTruthValue {
  if (status === 'conflicting-evidence') return 'conflicting';
  if (decisionRequirement) return 'unknown';
  return status === 'factual-evidence-collected' ? 'yes' : 'unknown';
}

export function evaluateLocalModelGovernanceEvidenceClosure(
  record: LocalModelGovernanceEvidenceClosureCandidateRecord,
): LocalModelGovernanceEvidenceClosureCandidateRecord {
  const sourceById = new Map(record.sources.map((source) => [source.sourceId, source]));
  const requirements: readonly LocalModelGovernanceEvidenceClosureRequirementRecord[] = record.requirements.map((requirement): LocalModelGovernanceEvidenceClosureRequirementRecord => {
    const missingEvidence = [...requirement.missingEvidence];
    const conflicts = [...requirement.conflicts];
    const sources = requirement.sourceIds.map((id) => sourceById.get(id));

    if (new Set(requirement.sourceIds).size !== requirement.sourceIds.length) {
      appendUnique(conflicts, 'duplicate-source-reference');
    }
    if (sources.some((source) => source === undefined)) {
      appendUnique(missingEvidence, 'referenced-official-source');
    }
    if (sources.some((source) => source !== undefined && !source.officialPublisher)) {
      appendUnique(missingEvidence, 'official-primary-source');
    }

    for (const kind of REQUIRED_SOURCE_KINDS[requirement.requirementId]) {
      const found = sources.some((source) => (
        source?.sourceKind === kind
        && source.supportsRequirements.includes(requirement.requirementId)
      ));
      if (!found) appendUnique(missingEvidence, `source-kind:${kind}`);
    }

    if (requirement.requirementId === 'tokenizer-license-scope' && record.tokenizerLicenseScope === 'conflicting') {
      appendUnique(conflicts, 'tokenizer-license-scope-conflict');
    }
    if (requirement.requirementId === 'acceptable-use-scope' && record.acceptableUseScope === 'conflicting') {
      appendUnique(conflicts, 'acceptable-use-scope-conflict');
    }

    let status: LocalModelGovernanceEvidenceClosureStatus;
    if (conflicts.length > 0) status = 'conflicting-evidence';
    else if (requirement.status === 'rejected') status = 'rejected';
    else if (missingEvidence.length > 0) status = 'unresolved';
    else if (requirement.status === 'no-separate-policy-located') status = 'no-separate-policy-located';
    else if (requirement.requirementId === 'derived-artifact-hosting' || requirement.requirementId === 'quantization-conversion') {
      status = 'sufficient-for-human-decision';
    } else {
      status = 'factual-evidence-collected';
    }

    return {
      ...requirement,
      status,
      sourceIds: unique(requirement.sourceIds),
      missingEvidence: unique(missingEvidence),
      conflicts: unique(conflicts),
      humanDecisionRequired: true,
      productLegalReviewRequired: true,
      factualEvidenceComplete: status === 'factual-evidence-collected' || status === 'sufficient-for-human-decision',
      decisionRecorded: false,
      approved: false,
    };
  });

  const resolvedFactualRequirements = requirements
    .filter((item) => item.factualEvidenceComplete)
    .map((item) => item.requirementId);
  const unresolvedFactualRequirements = requirements
    .filter((item) => item.status === 'unresolved' || item.status === 'no-separate-policy-located')
    .map((item) => item.requirementId);
  const conflictingRequirements = requirements
    .filter((item) => item.status === 'conflicting-evidence')
    .map((item) => item.requirementId);
  const humanDecisionRequirements = requirements
    .filter((item) => item.humanDecisionRequired)
    .map((item) => item.requirementId);

  let status: LocalModelGovernanceEvidenceClosureStatus;
  if (conflictingRequirements.length > 0 || record.conflicts.length > 0) status = 'conflicting-evidence';
  else if (requirements.some((item) => item.status === 'rejected')) status = 'rejected';
  else if (unresolvedFactualRequirements.length > 0) status = 'unresolved';
  else if (requirements.some((item) => item.status === 'sufficient-for-human-decision')) status = 'sufficient-for-human-decision';
  else status = 'factual-evidence-collected';

  const tokenizerStatus = requirements.find((item) => item.requirementId === 'tokenizer-license-scope')?.status ?? 'unresolved';
  const acceptableUseStatus = requirements.find((item) => item.requirementId === 'acceptable-use-scope')?.status ?? 'unresolved';
  const derivedHostingStatus = requirements.find((item) => item.requirementId === 'derived-artifact-hosting')?.status ?? 'unresolved';
  const quantizationStatus = requirements.find((item) => item.requirementId === 'quantization-conversion')?.status ?? 'unresolved';

  return {
    ...record,
    status,
    tokenizerLicenseScope: truthValueFor(tokenizerStatus, false),
    acceptableUseScope: truthValueFor(acceptableUseStatus, false),
    derivedArtifactHosting: truthValueFor(derivedHostingStatus, true),
    quantizationConversion: truthValueFor(quantizationStatus, true),
    requirements,
    resolvedFactualRequirements: unique(resolvedFactualRequirements),
    unresolvedFactualRequirements: unique(unresolvedFactualRequirements),
    humanDecisionRequirements: unique(humanDecisionRequirements),
    conflictingRequirements: unique(conflictingRequirements),
    sources: record.sources.map((source) => ({
      ...source,
      supportsRequirements: [...source.supportsRequirements],
      supportsFields: [...source.supportsFields],
    })),
    warnings: unique(record.warnings),
    conflicts: unique(record.conflicts),
    humanGovernanceReviewRequired: true,
    humanDecisionRecorded: false,
    modelApproved: false,
    licenseApproved: false,
    artifactSelected: false,
    artifactApproved: false,
    checksumPinned: false,
    benchmarkVerified: false,
    downloadable: false,
    runtimeReady: false,
    modelActive: false,
    evidenceClosureOnly: true,
  };
}

export const LOCAL_MODEL_GOVERNANCE_EVIDENCE_CLOSURE_REGISTRY: readonly LocalModelGovernanceEvidenceClosureCandidateRecord[] =
  LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) => createCandidateRecord(candidate.candidateId));

export function listLocalModelGovernanceEvidenceClosures(): readonly LocalModelGovernanceEvidenceClosureCandidateRecord[] {
  return LOCAL_MODEL_GOVERNANCE_EVIDENCE_CLOSURE_REGISTRY;
}

export function getLocalModelGovernanceEvidenceClosure(
  candidateId: string,
): LocalModelGovernanceEvidenceClosureCandidateRecord | null {
  return LOCAL_MODEL_GOVERNANCE_EVIDENCE_CLOSURE_REGISTRY.find((record) => record.candidateId === candidateId) ?? null;
}

export function getRequirementClosure(
  candidateId: string,
  requirementId: LocalModelGovernanceEvidenceClosureRequirementId,
  record: LocalModelGovernanceEvidenceClosureCandidateRecord | null = getLocalModelGovernanceEvidenceClosure(candidateId),
): LocalModelGovernanceEvidenceClosureRequirementRecord | null {
  if (!record || record.candidateId !== candidateId) return null;
  return record.requirements.find((requirement) => requirement.requirementId === requirementId) ?? null;
}

function projectedStatus(
  status: LocalModelGovernanceEvidenceClosureStatus,
): LocalModelGovernanceRequirementStatus {
  if (status === 'factual-evidence-collected') return 'satisfied';
  if (status === 'sufficient-for-human-decision') return 'requires-human-decision';
  if (status === 'conflicting-evidence' || status === 'rejected') return 'conflicting';
  return 'unresolved';
}

export function getLocalModelGovernanceEvidenceClosureImpact(
  candidateId: string,
): LocalModelGovernanceEvidenceClosureImpact {
  const closure = getLocalModelGovernanceEvidenceClosure(candidateId);
  const packet = listCurrentLocalModelGovernanceReviewPackets().find((item) => item.candidateId === candidateId);
  if (!closure || !packet) throw new Error(`Unknown Phase 5.7 candidate: ${candidateId}`);

  return {
    candidateId,
    currentPacketStatus: packet.status,
    projectedRequirementStatuses: {
      'tokenizer-license-scope': projectedStatus(getRequirementClosure(candidateId, 'tokenizer-license-scope', closure)!.status),
      'acceptable-use-scope': projectedStatus(getRequirementClosure(candidateId, 'acceptable-use-scope', closure)!.status),
      'derived-artifact-hosting': projectedStatus(getRequirementClosure(candidateId, 'derived-artifact-hosting', closure)!.status),
      'quantization-conversion': projectedStatus(getRequirementClosure(candidateId, 'quantization-conversion', closure)!.status),
    },
    historicalPacketMutated: false,
    humanDecisionRecorded: false,
    modelApproved: false,
    artifactApproved: false,
  };
}

export function validateLocalModelGovernanceEvidenceClosureRegistry(): LocalModelGovernanceEvidenceClosureValidation {
  const issues: string[] = [];
  const records = LOCAL_MODEL_GOVERNANCE_EVIDENCE_CLOSURE_REGISTRY;
  const packets = listCurrentLocalModelGovernanceReviewPackets();
  const expectedModelClassByTier = { light: '0.6B', standard: '1.7B', pro: '4B' } as const;
  const safeReferencePattern = /\/resolve\/|[?&](?:token|signature|sig|expires|key)=|\.(?:safetensors|gguf|bin)(?:$|[?#])/i;

  if (records.length !== LOCAL_MODEL_APPROVAL_REGISTRY.length) appendUnique(issues, 'candidate-count-mismatch');
  if (new Set(records.map((record) => record.candidateId)).size !== records.length) appendUnique(issues, 'duplicate-candidate-closure');

  for (const record of records) {
    const approval = LOCAL_MODEL_APPROVAL_REGISTRY.find((item) => item.candidateId === record.candidateId);
    const packet = packets.find((item) => item.candidateId === record.candidateId);
    if (!approval || !packet) appendUnique(issues, `orphan-closure:${record.candidateId}`);
    if (approval && approval.tier !== record.candidateTier) appendUnique(issues, `tier-mismatch:${record.candidateId}`);
    if (approval && approval.parameterScaleLabel !== record.modelClass) appendUnique(issues, `model-class-mismatch:${record.candidateId}`);
    if (approval && approval.displayName !== record.exactModelName) appendUnique(issues, `model-name-mismatch:${record.candidateId}`);
    if (packet && packet.officialRepositoryId !== record.officialRepositoryId) appendUnique(issues, `repository-mismatch:${record.candidateId}`);
    if (packet && packet.observedRevision !== record.observedRevision) appendUnique(issues, `revision-mismatch:${record.candidateId}`);
    if (record.modelClass !== expectedModelClassByTier[record.candidateTier]) appendUnique(issues, `tier-matrix-mismatch:${record.candidateId}`);

    const requirementIds = record.requirements.map((requirement) => requirement.requirementId);
    if (requirementIds.length !== REQUIREMENT_IDS.length || new Set(requirementIds).size !== requirementIds.length) {
      appendUnique(issues, `requirement-count-or-duplicate:${record.candidateId}`);
    }
    for (const id of REQUIREMENT_IDS) {
      if (!requirementIds.includes(id)) appendUnique(issues, `missing-requirement:${record.candidateId}:${id}`);
    }

    const sourceIds = new Set(record.sources.map((source) => source.sourceId));
    if (sourceIds.size !== record.sources.length) appendUnique(issues, `duplicate-source:${record.candidateId}`);
    for (const source of record.sources) {
      if (!source.officialPublisher) appendUnique(issues, `non-official-source:${record.candidateId}:${source.sourceId}`);
      if (safeReferencePattern.test(source.reference)) appendUnique(issues, `unsafe-source-reference:${record.candidateId}:${source.sourceId}`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(source.retrievedOn)) appendUnique(issues, `invalid-review-date:${record.candidateId}:${source.sourceId}`);
    }
    for (const requirement of record.requirements) {
      if (requirement.candidateId !== record.candidateId || requirement.candidateTier !== record.candidateTier) {
        appendUnique(issues, `requirement-identity-mismatch:${record.candidateId}:${requirement.requirementId}`);
      }
      if (requirement.sourceIds.some((id) => !sourceIds.has(id))) {
        appendUnique(issues, `missing-referenced-source:${record.candidateId}:${requirement.requirementId}`);
      }
      if (requirement.decisionRecorded || requirement.approved) {
        appendUnique(issues, `automatic-requirement-approval:${record.candidateId}:${requirement.requirementId}`);
      }
    }

    if (
      record.humanDecisionRecorded || record.modelApproved || record.licenseApproved
      || record.artifactSelected || record.artifactApproved || record.checksumPinned
      || record.benchmarkVerified || record.downloadable || record.runtimeReady || record.modelActive
    ) appendUnique(issues, `production-boundary-violation:${record.candidateId}`);
  }

  return { valid: issues.length === 0, issues };
}
