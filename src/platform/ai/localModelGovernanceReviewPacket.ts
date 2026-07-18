import { LOCAL_MODEL_APPROVAL_REGISTRY } from './localModelApprovalRegistry.ts';
import { listLocalModelCandidateEvidence } from './localModelCandidateEvidenceRegistry.ts';
import { buildCurrentLocalModelCandidateReviewDecisions } from './localModelCandidateReviewDecisionPolicy.ts';
import { listLocalModelArtifactEvidence } from './localModelArtifactEvidenceRegistry.ts';
import { buildCurrentLocalModelArtifactSelections } from './localModelArtifactSelectionPolicy.ts';
import { listLocalModelArtifactIntegrityEvidence } from './localModelArtifactIntegrityEvidenceRegistry.ts';
import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';
import type { LocalModelArtifactIntegrityCandidateRecord } from './localModelArtifactIntegrityEvidenceTypes.ts';
import {
  LOCAL_MODEL_GOVERNANCE_REQUIREMENT_IDS,
} from './localModelGovernanceReviewPacketTypes.ts';
import type {
  LocalModelGovernanceEvidenceSourcePhase,
  LocalModelGovernanceRequirementId,
  LocalModelGovernanceRequirementRecord,
  LocalModelGovernanceRequirementStatus,
  LocalModelGovernanceReviewPacket,
  LocalModelGovernanceReviewPacketInput,
  LocalModelGovernanceReviewPacketValidation,
} from './localModelGovernanceReviewPacketTypes.ts';

export { LOCAL_MODEL_GOVERNANCE_REQUIREMENT_IDS };

const EXPECTED_MODEL_CLASS_BY_TIER: Readonly<Record<LocalModelApprovalTier, string>> = {
  light: '0.6B',
  standard: '1.7B',
  pro: '4B',
};

function appendUnique<T>(values: T[], value: T): void {
  if (!values.includes(value)) values.push(value);
}

function unique<T>(values: readonly T[]): readonly T[] {
  return [...new Set(values)];
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length
    && [...left].sort().every((value, index) => value === [...right].sort()[index]);
}

function exactWeightInventoryIsConsistent(record: LocalModelArtifactIntegrityCandidateRecord): boolean {
  const names = record.requiredWeightFiles.map((file) => file.fileName);
  if (names.length !== record.weightShardCount || new Set(names).size !== names.length) return false;
  if (record.requiredWeightFiles.some((file) => (
    file.exactSizeBytes === null
    || !Number.isFinite(file.exactSizeBytes)
    || !Number.isInteger(file.exactSizeBytes)
    || file.exactSizeBytes < 0
  ))) return false;
  const total = record.requiredWeightFiles.reduce((sum, file) => sum + (file.exactSizeBytes ?? 0), 0);
  return record.exactWeightBytes === total;
}

function indexMappingIsConsistent(record: LocalModelArtifactIntegrityCandidateRecord): boolean {
  const observed = record.requiredWeightFiles.map((file) => file.fileName);
  if (record.weightShardCount === 1) {
    return record.weightIndexStatus === 'absent' || record.weightIndexStatus === 'confirmed';
  }
  return record.weightIndexStatus === 'confirmed'
    && sameStrings(observed, record.indexedWeightFiles);
}

interface ConsistencyResult {
  readonly attentionIssues: readonly string[];
  readonly conflictsByRequirement: Readonly<Partial<Record<LocalModelGovernanceRequirementId, readonly string[]>>>;
  readonly warnings: readonly string[];
}

function inspectConsistency(input: LocalModelGovernanceReviewPacketInput): ConsistencyResult {
  const attentionIssues: string[] = [];
  const conflictMap = new Map<LocalModelGovernanceRequirementId, string[]>();
  const warnings: string[] = [];
  const addConflict = (id: LocalModelGovernanceRequirementId, issue: string): void => {
    const values = conflictMap.get(id) ?? [];
    appendUnique(values, issue);
    conflictMap.set(id, values);
  };

  const sources = [
    input.candidateEvidence,
    input.candidateReviewDecision,
    input.artifactEvidence,
    input.artifactSelection,
    input.integrityEvidence,
  ];
  if (sources.some((source) => source === null)) appendUnique(attentionIssues, 'missing-phase-5-source-record');

  const candidateIds = unique(sources.filter((source): source is NonNullable<typeof source> => source !== null).map((source) => source.candidateId));
  if (candidateIds.length > 1) appendUnique(attentionIssues, 'candidate-id-mismatch');

  const tiers = unique(sources.filter((source): source is NonNullable<typeof source> => source !== null).map((source) => source.candidateTier));
  if (tiers.length > 1) appendUnique(attentionIssues, 'candidate-tier-mismatch');

  const modelClasses = unique([
    input.candidateEvidence?.modelClass,
    input.artifactEvidence?.modelClass,
    input.integrityEvidence?.modelClass,
    input.artifactSelection?.selectedScope?.modelClass,
  ].filter((value): value is string => typeof value === 'string'));
  if (modelClasses.length > 1) appendUnique(attentionIssues, 'model-class-mismatch');
  const tier = input.candidateEvidence?.candidateTier ?? input.artifactEvidence?.candidateTier ?? input.integrityEvidence?.candidateTier;
  if (tier && modelClasses.some((modelClass) => modelClass !== EXPECTED_MODEL_CLASS_BY_TIER[tier])) {
    appendUnique(attentionIssues, 'tier-model-class-mismatch');
  }

  const exactNames = unique([
    input.candidateEvidence?.exactModelName,
    input.artifactEvidence?.exactModelName,
    input.integrityEvidence?.exactModelName,
    input.artifactSelection?.selectedScope?.exactModelName,
  ].filter((value): value is string => typeof value === 'string'));
  if (exactNames.length > 1) addConflict('exact-model-identity', 'exact-model-name-mismatch');

  const repositoryIds = unique([
    input.artifactEvidence?.officialRepositoryId,
    input.integrityEvidence?.officialRepositoryId,
    input.artifactSelection?.selectedScope?.officialRepositoryId,
  ].filter((value): value is string => typeof value === 'string'));
  if (repositoryIds.length > 1) addConflict('official-repository-identity', 'official-repository-mismatch');

  const revisions = unique([
    input.artifactEvidence?.observedRevision,
    input.integrityEvidence?.observedRevision,
    input.artifactSelection?.selectedScope?.observedRevision,
  ].filter((value): value is string => typeof value === 'string'));
  if (revisions.length > 1) addConflict('immutable-revision', 'observed-revision-mismatch');

  if (input.artifactSelection?.selectedScope
      && input.artifactEvidence
      && input.artifactSelection.selectedScope.artifactFormat !== input.artifactEvidence.artifactFormat) {
    addConflict('artifact-format', 'artifact-format-mismatch');
  }

  if (input.artifactEvidence && input.integrityEvidence) {
    const phase53Names = input.artifactEvidence.weightFiles.map((file) => file.fileName);
    const phase55Names = input.integrityEvidence.requiredWeightFiles.map((file) => file.fileName);
    if (!sameStrings(phase53Names, phase55Names)) addConflict('weight-file-inventory', 'weight-inventory-mismatch');
    if (!indexMappingIsConsistent(input.integrityEvidence)) addConflict('weight-index-consistency', 'weight-index-mapping-mismatch');
    if (!exactWeightInventoryIsConsistent(input.integrityEvidence)) addConflict('exact-weight-size', 'exact-file-byte-total-mismatch');
    if (input.artifactEvidence.aggregateWeightSizeBytes !== null
        && input.integrityEvidence.exactWeightBytes !== null
        && input.artifactEvidence.aggregateWeightSizeBytes !== input.integrityEvidence.exactWeightBytes) {
      appendUnique(warnings, 'phase-5.3-aggregate-metadata-is-not-phase-5.5-exact-file-byte-total');
    }
  }

  return {
    attentionIssues,
    conflictsByRequirement: Object.fromEntries(conflictMap.entries()),
    warnings,
  };
}

function requirement(
  id: LocalModelGovernanceRequirementId,
  status: LocalModelGovernanceRequirementStatus,
  sourcePhases: readonly LocalModelGovernanceEvidenceSourcePhase[],
  evidenceSummary: string,
  blockers: readonly string[] = [],
  warnings: readonly string[] = [],
): LocalModelGovernanceRequirementRecord {
  return {
    id,
    status,
    sourcePhases,
    evidenceSummary,
    blockers: unique(blockers),
    warnings: unique(warnings),
    humanDecisionRequired: status === 'requires-human-decision',
    runtimeBenchmarkRequired: status === 'deferred-to-runtime-benchmark',
  };
}

function sourceConflictStatus(
  id: LocalModelGovernanceRequirementId,
  consistency: ConsistencyResult,
): readonly string[] {
  return consistency.conflictsByRequirement[id] ?? [];
}

export function evaluateLocalModelGovernanceRequirement(
  id: LocalModelGovernanceRequirementId,
  input: LocalModelGovernanceReviewPacketInput,
  consistency: ConsistencyResult = inspectConsistency(input),
): LocalModelGovernanceRequirementRecord {
  const candidate = input.candidateEvidence;
  const artifact = input.artifactEvidence;
  const integrity = input.integrityEvidence;
  const conflicts = sourceConflictStatus(id, consistency);
  if (conflicts.length > 0) {
    return requirement(id, 'conflicting', ['phase-5.1', 'phase-5.3', 'phase-5.5'], 'Source records disagree for this requirement.', conflicts);
  }

  switch (id) {
    case 'exact-model-identity':
      return requirement(id, candidate?.officialIdentityConfirmed && Boolean(candidate.exactModelName) ? 'satisfied' : 'unresolved', ['phase-5.1'], 'Exact candidate identity is taken from the official Phase 5.1 evidence record.', candidate?.officialIdentityConfirmed ? [] : ['exact-model-identity-unresolved']);
    case 'official-publisher':
      return requirement(id, candidate?.sources.some((source) => source.officialPublisher) && Boolean(candidate.publisher) ? 'satisfied' : 'unresolved', ['phase-5.1'], 'Official publisher evidence is attributed to the Phase 5.1 sources.', candidate?.publisher ? [] : ['official-publisher-unresolved']);
    case 'base-license-identifier':
      return requirement(id, candidate?.licenseIdentifier ? 'satisfied' : 'unresolved', ['phase-5.1'], 'The base license identifier is evidence only and remains subject to governance review.', candidate?.licenseIdentifier ? [] : ['base-license-identifier-unresolved']);
    case 'official-license-text':
      return requirement(id, candidate?.licenseTextLocated ? 'satisfied' : 'unresolved', ['phase-5.1'], 'Official license text location has been reviewed without creating approval.', candidate?.licenseTextLocated ? [] : ['official-license-text-unresolved']);
    case 'commercial-use':
      return requirement(id, candidate?.licenseFacts.commercialUse !== 'unknown' ? 'satisfied' : 'unresolved', ['phase-5.1'], 'Commercial-use terms have an explicit evidence value; this is not product approval.', candidate?.licenseFacts.commercialUse === 'unknown' ? ['commercial-use-evidence-unresolved'] : []);
    case 'redistribution':
      return requirement(id, candidate?.licenseFacts.redistribution !== 'unknown' ? 'satisfied' : 'unresolved', ['phase-5.1'], 'Redistribution terms have an explicit evidence value; derived hosting remains separate.', candidate?.licenseFacts.redistribution === 'unknown' ? ['redistribution-evidence-unresolved'] : []);
    case 'derivative-works':
      return requirement(id, candidate?.licenseFacts.derivativeWorks !== 'unknown' ? 'satisfied' : 'unresolved', ['phase-5.1'], 'Derivative-work terms are recorded independently from conversion and hosting decisions.', candidate?.licenseFacts.derivativeWorks === 'unknown' ? ['derivative-work-evidence-unresolved'] : []);
    case 'derived-artifact-hosting':
      return requirement(id, 'requires-human-decision', ['phase-5.1', 'phase-5.2'], 'Derived-artifact hosting requires an explicit product and governance decision.', ['derived-artifact-hosting-human-decision-required']);
    case 'quantization-conversion':
      return requirement(id, 'requires-human-decision', ['phase-5.1', 'phase-5.2', 'phase-5.3'], 'Official quantized evidence does not automatically approve product conversion or distribution.', ['quantization-conversion-human-decision-required']);
    case 'attribution-notice':
      return requirement(id, candidate?.licenseFacts.attributionRequired !== 'unknown' && candidate?.licenseFacts.noticeRequired !== 'unknown' ? 'satisfied' : 'unresolved', ['phase-5.1'], 'Attribution and notice obligations have explicit evidence values.', candidate?.licenseFacts.attributionRequired === 'unknown' || candidate?.licenseFacts.noticeRequired === 'unknown' ? ['attribution-notice-evidence-unresolved'] : []);
    case 'tokenizer-license-scope':
      return requirement(id, candidate?.tokenizerEvidenceStatus === 'separate-terms-located' && candidate.licenseFacts.separateTokenizerTerms !== 'unknown' ? 'satisfied' : 'unresolved', ['phase-5.1'], 'Tokenizer files exist, but file presence alone does not establish tokenizer license scope.', ['tokenizer-license-scope-unresolved']);
    case 'acceptable-use-scope':
      return requirement(id, candidate?.licenseFacts.acceptableUsePolicyApplies !== 'unknown' ? 'satisfied' : 'unresolved', ['phase-5.1'], 'Acceptable-use scope requires explicit source evidence.', candidate?.licenseFacts.acceptableUsePolicyApplies === 'unknown' ? ['acceptable-use-scope-unresolved'] : []);
    case 'trademark-restrictions':
      return requirement(id, candidate?.licenseFacts.trademarkPermissionGranted !== 'unknown' ? 'satisfied' : 'unresolved', ['phase-5.1'], 'Trademark restrictions are recorded separately from copyright permissions.', candidate?.licenseFacts.trademarkPermissionGranted === 'unknown' ? ['trademark-restrictions-unresolved'] : []);
    case 'official-repository-identity':
      return requirement(id, artifact?.officialRepositoryConfirmed === 'confirmed' && Boolean(artifact.officialRepositoryId) ? 'satisfied' : 'unresolved', ['phase-5.3', 'phase-5.5'], 'Official repository identity is consistent across provenance and integrity evidence.', artifact?.officialRepositoryConfirmed === 'confirmed' ? [] : ['official-repository-identity-unresolved']);
    case 'immutable-revision':
      return requirement(id, artifact?.immutableRevisionAvailable === 'confirmed' && integrity?.immutableRevisionConfirmed === 'confirmed' && Boolean(artifact.observedRevision) ? 'satisfied' : 'unresolved', ['phase-5.3', 'phase-5.5'], 'The same immutable revision is observed by provenance and integrity evidence.', artifact?.observedRevision ? [] : ['immutable-revision-unresolved']);
    case 'artifact-format':
      return requirement(id, artifact && artifact.artifactFormat !== 'unknown' ? 'satisfied' : 'unresolved', ['phase-5.3'], 'Artifact format is sourced from official file inventory evidence.', artifact?.artifactFormat && artifact.artifactFormat !== 'unknown' ? [] : ['artifact-format-unresolved']);
    case 'official-base-variant':
      return requirement(id, artifact?.officialBaseVariantConfirmed === 'confirmed' ? 'satisfied' : 'unresolved', ['phase-5.3'], 'Official base-variant presence is evidence, not selection.', artifact?.officialBaseVariantConfirmed === 'confirmed' ? [] : ['official-base-variant-unresolved']);
    case 'official-quantized-variant':
      return requirement(id, artifact?.officialQuantizedVariantAvailable === 'confirmed' || artifact?.officialQuantizedVariantAvailable === 'absent' ? 'satisfied' : 'unresolved', ['phase-5.3'], 'Official quantized-variant availability is reconciled without selecting or approving a variant.', artifact?.officialQuantizedVariantAvailable === 'unknown' ? ['official-quantized-variant-evidence-unresolved'] : []);
    case 'weight-file-inventory':
      return requirement(id, integrity?.fileInventoryStatus === 'confirmed' && exactWeightInventoryIsConsistent(integrity) ? 'satisfied' : 'unresolved', ['phase-5.3', 'phase-5.5'], 'Exact weight filenames and file-byte evidence are reconciled at the immutable revision.', integrity?.fileInventoryStatus === 'confirmed' ? [] : ['weight-file-inventory-unresolved']);
    case 'weight-index-consistency':
      return requirement(id, integrity && indexMappingIsConsistent(integrity) ? 'satisfied' : 'unresolved', ['phase-5.5'], 'Single-file or indexed multi-shard consistency has been reviewed.', integrity && indexMappingIsConsistent(integrity) ? [] : ['weight-index-consistency-unresolved']);
    case 'exact-weight-size':
      return requirement(id, integrity && exactWeightInventoryIsConsistent(integrity) ? 'satisfied' : 'unresolved', ['phase-5.5'], 'Exact observed weight-file bytes are reconciled; they are not an approved download size.', integrity && exactWeightInventoryIsConsistent(integrity) ? [] : ['exact-weight-size-unresolved'], consistency.warnings);
    case 'config-provenance':
      return requirement(id, artifact?.configPresent === 'confirmed' && artifact.generationConfigPresent === 'confirmed' ? 'satisfied' : 'unresolved', ['phase-5.3', 'phase-5.5'], 'Configuration-file presence is attributed to the official repository.', artifact?.configPresent === 'confirmed' && artifact.generationConfigPresent === 'confirmed' ? [] : ['config-provenance-unresolved']);
    case 'tokenizer-provenance':
      return requirement(id, artifact?.tokenizerFilesPresent === 'confirmed' && artifact.tokenizerConfigPresent === 'confirmed' ? 'satisfied' : 'unresolved', ['phase-5.3', 'phase-5.5'], 'Tokenizer-file provenance is distinct from tokenizer license scope.', artifact?.tokenizerFilesPresent === 'confirmed' && artifact.tokenizerConfigPresent === 'confirmed' ? [] : ['tokenizer-provenance-unresolved']);
    case 'license-file-provenance':
      return requirement(id, artifact?.licenseFilePresent === 'confirmed' ? 'satisfied' : 'unresolved', ['phase-5.3', 'phase-5.5'], 'License-file presence is reconciled independently from approval.', artifact?.licenseFilePresent === 'confirmed' ? [] : ['license-file-provenance-unresolved']);
    case 'integrity-metadata-availability':
      return requirement(id, integrity && integrity.requiredWeightFiles.length > 0 && integrity.requiredWeightFiles.every((file) => file.integrityMetadataStatus === 'confirmed') ? 'satisfied' : 'unresolved', ['phase-5.5'], 'Official integrity metadata availability has been reviewed without recording digest values.', integrity?.requiredWeightFiles.every((file) => file.integrityMetadataStatus === 'confirmed') ? [] : ['integrity-metadata-availability-unresolved']);
    case 'integrity-algorithm-classification':
      return requirement(id, integrity && integrity.integrityAlgorithmsObserved.length > 0 && integrity.integrityAlgorithmsObserved.every((algorithm) => algorithm !== 'unknown') ? 'satisfied' : 'unresolved', ['phase-5.5'], 'Integrity algorithm classes remain distinct and do not imply local verification.', integrity?.integrityAlgorithmsObserved.length ? [] : ['integrity-algorithm-classification-unresolved']);
    case 'checksum-pinning-plan':
      return requirement(id, 'deferred-to-artifact-selection', ['phase-5.4', 'phase-5.5'], 'Checksum pinning depends on a future human-selected and approved artifact scope.', ['checksum-pinning-plan-deferred-to-artifact-selection']);
    case 'checksum-verification-plan':
      return requirement(id, 'deferred-to-artifact-selection', ['phase-5.5'], 'Checksum verification planning depends on a future selected artifact and pinned integrity expectation.', ['checksum-verification-plan-deferred-to-artifact-selection']);
    case 'runtime-support-file-bundle':
      return requirement(id, integrity?.exactSupportFilesBytes !== null ? 'satisfied' : 'deferred-to-artifact-selection', ['phase-5.4', 'phase-5.5'], 'A runtime-required support-file bundle depends on future artifact selection and runtime review.', integrity?.exactSupportFilesBytes === null ? ['runtime-support-file-bundle-deferred-to-artifact-selection'] : []);
    case 'approved-download-size':
      return requirement(id, 'deferred-to-artifact-selection', ['phase-5.4', 'phase-5.5'], 'Approved download size depends on a future selected runtime bundle; exact weight bytes alone are insufficient.', ['approved-download-size-deferred-to-artifact-selection']);
    case 'browser-runtime-compatibility':
      return requirement(id, 'deferred-to-runtime-benchmark', ['phase-5.1', 'phase-5.3', 'phase-5.5'], 'Browser and local-runtime compatibility requires a future approved runtime evaluation.', ['browser-runtime-compatibility-deferred']);
    case 'device-benchmark-evidence':
      return requirement(id, 'deferred-to-runtime-benchmark', ['phase-5.2', 'phase-5.4'], 'Device benchmark evidence remains not-run and deferred.', ['device-benchmark-evidence-deferred']);
    case 'tier-performance-budget':
      return requirement(id, 'deferred-to-runtime-benchmark', ['phase-5.2', 'phase-5.4'], 'Tier performance budgets require versioned benchmark evidence.', ['tier-performance-budget-deferred']);
  }
}

function sourceIsRejected(input: LocalModelGovernanceReviewPacketInput): boolean {
  return input.candidateEvidence?.evidenceStatus === 'rejected'
    || input.artifactEvidence?.evidenceStatus === 'rejected'
    || input.integrityEvidence?.evidenceStatus === 'rejected'
    || input.candidateReviewDecision?.status === 'rejected'
    || input.artifactSelection?.status === 'rejected';
}

function sourceHasGenericConflict(input: LocalModelGovernanceReviewPacketInput): boolean {
  return input.candidateEvidence?.evidenceStatus === 'conflicting-evidence'
    || Boolean(input.candidateEvidence?.conflicts.length)
    || input.artifactEvidence?.evidenceStatus === 'conflicting-evidence'
    || Boolean(input.artifactEvidence?.conflicts.length)
    || input.integrityEvidence?.evidenceStatus === 'conflicting-evidence'
    || Boolean(input.integrityEvidence?.conflicts.length);
}

function resolveIdentity(input: LocalModelGovernanceReviewPacketInput): {
  candidateId: string;
  candidateTier: LocalModelApprovalTier;
  modelClass: string;
  exactModelName: string;
  officialRepositoryId: string | null;
  observedRevision: string | null;
} {
  const candidateId = input.candidateEvidence?.candidateId
    ?? input.artifactEvidence?.candidateId
    ?? input.integrityEvidence?.candidateId
    ?? input.candidateReviewDecision?.candidateId
    ?? input.artifactSelection?.candidateId
    ?? 'unknown-candidate';
  const candidateTier = input.candidateEvidence?.candidateTier
    ?? input.artifactEvidence?.candidateTier
    ?? input.integrityEvidence?.candidateTier
    ?? input.candidateReviewDecision?.candidateTier
    ?? input.artifactSelection?.candidateTier
    ?? 'light';
  return {
    candidateId,
    candidateTier,
    modelClass: input.candidateEvidence?.modelClass ?? input.artifactEvidence?.modelClass ?? input.integrityEvidence?.modelClass ?? 'unknown',
    exactModelName: input.candidateEvidence?.exactModelName ?? input.artifactEvidence?.exactModelName ?? input.integrityEvidence?.exactModelName ?? 'Unknown candidate',
    officialRepositoryId: input.artifactEvidence?.officialRepositoryId ?? input.integrityEvidence?.officialRepositoryId ?? null,
    observedRevision: input.artifactEvidence?.observedRevision ?? input.integrityEvidence?.observedRevision ?? null,
  };
}

export function buildLocalModelGovernanceReviewPacket(
  input: LocalModelGovernanceReviewPacketInput,
): LocalModelGovernanceReviewPacket {
  const consistency = inspectConsistency(input);
  const requirements = LOCAL_MODEL_GOVERNANCE_REQUIREMENT_IDS.map((id) => (
    evaluateLocalModelGovernanceRequirement(id, input, consistency)
  ));
  const satisfiedRequirements = requirements.filter((item) => item.status === 'satisfied').map((item) => item.id);
  const unresolvedRequirements = requirements.filter((item) => item.status === 'unresolved').map((item) => item.id);
  const conflictingRequirements = requirements.filter((item) => item.status === 'conflicting').map((item) => item.id);
  const humanDecisionRequirements = requirements.filter((item) => item.status === 'requires-human-decision').map((item) => item.id);
  const runtimeBenchmarkRequirements = requirements.filter((item) => item.status === 'deferred-to-runtime-benchmark').map((item) => item.id);
  const genericConflict = sourceHasGenericConflict(input);
  const rejected = sourceIsRejected(input);
  const status = rejected
    ? 'rejected'
    : consistency.attentionIssues.length > 0
      ? 'attention-required'
      : genericConflict || conflictingRequirements.length > 0
        ? 'conflicting-evidence'
        : unresolvedRequirements.length > 0
          ? 'evidence-reconciliation-incomplete'
          : 'awaiting-human-governance-review';
  const identity = resolveIdentity(input);
  const blockers = unique([
    ...consistency.attentionIssues,
    ...(genericConflict ? ['source-evidence-conflict'] : []),
    ...(rejected ? ['source-evidence-rejected'] : []),
    ...requirements.flatMap((item) => item.blockers),
  ]);
  const warnings = unique([
    ...consistency.warnings,
    ...requirements.flatMap((item) => item.warnings),
    'reconciliation-does-not-create-human-decision-or-production-approval',
  ]);

  return {
    ...identity,
    status,
    requirements,
    satisfiedRequirements,
    unresolvedRequirements,
    conflictingRequirements,
    humanDecisionRequirements,
    runtimeBenchmarkRequirements,
    blockers,
    warnings,
    humanGovernanceReviewRequired: true,
    humanDecisionRecorded: false,
    artifactSelectionRecorded: false,
    modelApproved: false,
    licenseApproved: false,
    artifactApproved: false,
    checksumPinned: false,
    checksumVerified: false,
    benchmarkVerified: false,
    downloadable: false,
    runtimeReady: false,
    modelActive: false,
    packetOnly: true,
  };
}

function currentInput(candidateId: string): LocalModelGovernanceReviewPacketInput {
  return {
    candidateEvidence: listLocalModelCandidateEvidence().find((item) => item.candidateId === candidateId) ?? null,
    candidateReviewDecision: buildCurrentLocalModelCandidateReviewDecisions().find((item) => item.candidateId === candidateId) ?? null,
    artifactEvidence: listLocalModelArtifactEvidence().find((item) => item.candidateId === candidateId) ?? null,
    artifactSelection: buildCurrentLocalModelArtifactSelections().find((item) => item.candidateId === candidateId) ?? null,
    integrityEvidence: listLocalModelArtifactIntegrityEvidence().find((item) => item.candidateId === candidateId) ?? null,
  };
}

export function buildCurrentLocalModelGovernanceReviewPackets(): readonly LocalModelGovernanceReviewPacket[] {
  return LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) => (
    buildLocalModelGovernanceReviewPacket(currentInput(candidate.candidateId))
  ));
}

export function listCurrentLocalModelGovernanceReviewPackets(): readonly LocalModelGovernanceReviewPacket[] {
  return buildCurrentLocalModelGovernanceReviewPackets();
}

export function validateLocalModelGovernanceReviewPackets(
  packets: readonly LocalModelGovernanceReviewPacket[] = listCurrentLocalModelGovernanceReviewPackets(),
): LocalModelGovernanceReviewPacketValidation {
  const issues: string[] = [];
  const candidateIds = packets.map((packet) => packet.candidateId);
  if (new Set(candidateIds).size !== candidateIds.length) appendUnique(issues, 'duplicate-candidate-packet');
  if (packets.length !== LOCAL_MODEL_APPROVAL_REGISTRY.length) appendUnique(issues, 'candidate-packet-count-mismatch');
  for (const candidate of LOCAL_MODEL_APPROVAL_REGISTRY) {
    if (!packets.some((packet) => packet.candidateId === candidate.candidateId)) appendUnique(issues, `missing-candidate-packet:${candidate.candidateId}`);
  }
  for (const packet of packets) {
    if (!LOCAL_MODEL_APPROVAL_REGISTRY.some((candidate) => candidate.candidateId === packet.candidateId)) appendUnique(issues, `orphan-candidate-packet:${packet.candidateId}`);
    if (packet.requirements.length !== LOCAL_MODEL_GOVERNANCE_REQUIREMENT_IDS.length || new Set(packet.requirements.map((item) => item.id)).size !== packet.requirements.length) appendUnique(issues, `requirement-set-invalid:${packet.candidateId}`);
    if (packet.humanDecisionRecorded || packet.artifactSelectionRecorded || packet.modelApproved || packet.licenseApproved || packet.artifactApproved || packet.checksumPinned || packet.checksumVerified || packet.benchmarkVerified || packet.downloadable || packet.runtimeReady || packet.modelActive) appendUnique(issues, `packet-boundary-violation:${packet.candidateId}`);
  }
  return { valid: issues.length === 0, issues };
}
