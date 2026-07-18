import {
  buildLocalModelGovernanceDecisionRecordKey,
} from './localModelGovernanceDecisionRecordPolicy.ts';
import type {
  LocalModelGovernanceDecisionRecord,
  LocalModelGovernanceDecisionRecordFinalItem,
} from './localModelGovernanceDecisionRecordTypes.ts';
import {
  buildCurrentLocalModelGovernanceReviewWorkspaceResults,
} from './localModelGovernanceReviewWorkspacePolicy.ts';
import type {
  LocalModelGovernanceReviewWorkspaceResult,
} from './localModelGovernanceReviewWorkspaceTypes.ts';
import type {
  LocalModelGovernanceRecordPersistenceComparison,
  LocalModelGovernanceRecordPersistenceEnvelope,
  LocalModelGovernanceRecordPersistenceEnvelopeValidation,
  LocalModelGovernanceRecordPersistenceInput,
  LocalModelGovernanceRecordPersistenceResult,
  LocalModelGovernanceRecordPersistenceScope,
  LocalModelGovernanceRecordPersistenceScopeDecision,
  LocalModelGovernanceRecordPersistenceValidation,
} from './localModelGovernanceRecordPersistenceTypes.ts';

export const LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_SCHEMA_REVISION = 1;
export const LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_POLICY_REVISION = 1;

const REQUIREMENT_IDS = [
  'tokenizer-license-scope',
  'acceptable-use-scope',
  'derived-artifact-hosting',
  'quantization-conversion',
] as const;

const ENVELOPE_KEYS = [
  'persistenceKey',
  'idempotencyKey',
  'schemaRevision',
  'policyRevision',
  'operation',
  'duplicatePolicy',
  'canonicalRecord',
  'canonicalRecordKey',
  'canonicalRecordRevision',
  'canonicalOutcome',
  'candidateId',
  'candidateTier',
  'createdFromReviewedAt',
  'immutable',
  'appendOnly',
  'updateAllowed',
  'deleteAllowed',
  'clientDeleteAllowed',
  'clientOverwriteAllowed',
  'persistenceBoundaryOnly',
] as const;

const RECORD_KEYS = [
  'recordKey',
  'recordRevision',
  'candidateId',
  'candidateTier',
  'scope',
  'decisions',
  'actorSubjectId',
  'actorRole',
  'reviewedAt',
  'outcome',
  'allDecisionsExplicit',
  'recordValidForCurrentScope',
  'eligibleForTrustedPersistence',
  'eligibleForArtifactSelectionRecordingReview',
  'decisionRecordOnly',
  'persisted',
  'signed',
  'appliedToArtifactSelection',
  'modelApproved',
  'licenseApproved',
  'artifactSelected',
  'artifactApproved',
  'checksumVerified',
  'benchmarkVerified',
  'downloadable',
  'runtimeReady',
  'modelActive',
] as const;

const RECORD_SCOPE_KEYS = [
  'candidateId',
  'candidateTier',
  'modelClass',
  'exactModelName',
  'officialRepositoryId',
  'observedRevision',
  'tokenizerLicenseClosureStatus',
  'acceptableUseClosureStatus',
  'derivedHostingClosureStatus',
  'quantizationClosureStatus',
  'evidenceClosureRevision',
  'governanceDecisionPolicyRevision',
  'governanceDecisionRecordPolicyRevision',
  'recordRevision',
] as const;

const DECISION_KEYS = [
  'requirementId',
  'evidenceClosureStatus',
  'decision',
  'explicitlyRecorded',
  'blockers',
  'warnings',
] as const;

function appendUnique(values: string[], value: string): void {
  if (!values.includes(value)) values.push(value);
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: object, allowed: readonly string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function isIsoInstant(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
    && !Number.isNaN(Date.parse(value));
}

function canonicalOutcome(
  record: LocalModelGovernanceDecisionRecord,
): LocalModelGovernanceRecordPersistenceScope['canonicalOutcome'] {
  if (record.outcome === 'proceed') return 'finalized-proceed';
  if (record.outcome === 'rejected') return 'finalized-rejected';
  return 'finalized-more-evidence';
}

function cloneFinalItem(
  item: LocalModelGovernanceDecisionRecordFinalItem,
): LocalModelGovernanceDecisionRecordFinalItem {
  return {
    ...item,
    blockers: [...item.blockers],
    warnings: [...item.warnings],
  };
}

function cloneRecord(record: LocalModelGovernanceDecisionRecord): LocalModelGovernanceDecisionRecord {
  return {
    ...record,
    scope: { ...record.scope },
    decisions: record.decisions.map(cloneFinalItem),
  };
}

function cloneScopeDecision(
  item: LocalModelGovernanceRecordPersistenceScopeDecision,
): LocalModelGovernanceRecordPersistenceScopeDecision {
  return { ...item };
}

function cloneScope(
  scope: LocalModelGovernanceRecordPersistenceScope,
): LocalModelGovernanceRecordPersistenceScope {
  return {
    ...scope,
    decisions: scope.decisions.map(cloneScopeDecision),
  };
}

function cloneEnvelope(
  envelope: LocalModelGovernanceRecordPersistenceEnvelope,
): LocalModelGovernanceRecordPersistenceEnvelope {
  return {
    ...envelope,
    duplicatePolicy: { ...envelope.duplicatePolicy },
    canonicalRecord: cloneRecord(envelope.canonicalRecord),
  };
}

function sortedDecisionSnapshots(
  items: readonly LocalModelGovernanceRecordPersistenceScopeDecision[],
): readonly LocalModelGovernanceRecordPersistenceScopeDecision[] {
  return items.map(cloneScopeDecision).sort((left, right) => left.requirementId.localeCompare(right.requirementId));
}

function sameDecisionSnapshots(
  left: readonly LocalModelGovernanceRecordPersistenceScopeDecision[],
  right: readonly LocalModelGovernanceRecordPersistenceScopeDecision[],
): boolean {
  if (left.length !== right.length) return false;
  const leftSorted = sortedDecisionSnapshots(left);
  const rightSorted = sortedDecisionSnapshots(right);
  return leftSorted.every((item, index) => {
    const other = rightSorted[index];
    return other !== undefined
      && item.requirementId === other.requirementId
      && item.evidenceClosureStatus === other.evidenceClosureStatus
      && item.decision === other.decision
      && item.explicitlyRecorded === other.explicitlyRecorded;
  });
}

function sameFinalItems(
  left: readonly LocalModelGovernanceDecisionRecordFinalItem[],
  right: readonly LocalModelGovernanceDecisionRecordFinalItem[],
): boolean {
  const leftSnapshots = left.map((item): LocalModelGovernanceRecordPersistenceScopeDecision => ({
    requirementId: item.requirementId,
    evidenceClosureStatus: item.evidenceClosureStatus,
    decision: item.decision,
    explicitlyRecorded: true,
  }));
  const rightSnapshots = right.map((item): LocalModelGovernanceRecordPersistenceScopeDecision => ({
    requirementId: item.requirementId,
    evidenceClosureStatus: item.evidenceClosureStatus,
    decision: item.decision,
    explicitlyRecorded: true,
  }));
  if (!sameDecisionSnapshots(leftSnapshots, rightSnapshots)) return false;
  const leftById = new Map(left.map((item) => [item.requirementId, item]));
  return right.every((item) => {
    const other = leftById.get(item.requirementId);
    return other !== undefined
      && other.blockers.length === item.blockers.length
      && other.blockers.every((value, index) => value === item.blockers[index])
      && other.warnings.length === item.warnings.length
      && other.warnings.every((value, index) => value === item.warnings[index]);
  });
}

function sameCanonicalRecord(
  left: LocalModelGovernanceDecisionRecord,
  right: LocalModelGovernanceDecisionRecord,
): boolean {
  return left.recordKey === right.recordKey
    && left.recordRevision === right.recordRevision
    && left.candidateId === right.candidateId
    && left.candidateTier === right.candidateTier
    && left.actorSubjectId === right.actorSubjectId
    && left.actorRole === right.actorRole
    && left.reviewedAt === right.reviewedAt
    && left.outcome === right.outcome
    && left.allDecisionsExplicit === right.allDecisionsExplicit
    && left.recordValidForCurrentScope === right.recordValidForCurrentScope
    && left.eligibleForTrustedPersistence === right.eligibleForTrustedPersistence
    && left.eligibleForArtifactSelectionRecordingReview === right.eligibleForArtifactSelectionRecordingReview
    && left.decisionRecordOnly === right.decisionRecordOnly
    && left.persisted === right.persisted
    && left.signed === right.signed
    && left.appliedToArtifactSelection === right.appliedToArtifactSelection
    && left.modelApproved === right.modelApproved
    && left.licenseApproved === right.licenseApproved
    && left.artifactSelected === right.artifactSelected
    && left.artifactApproved === right.artifactApproved
    && left.checksumVerified === right.checksumVerified
    && left.benchmarkVerified === right.benchmarkVerified
    && left.downloadable === right.downloadable
    && left.runtimeReady === right.runtimeReady
    && left.modelActive === right.modelActive
    && left.scope.candidateId === right.scope.candidateId
    && left.scope.candidateTier === right.scope.candidateTier
    && left.scope.modelClass === right.scope.modelClass
    && left.scope.exactModelName === right.scope.exactModelName
    && left.scope.officialRepositoryId === right.scope.officialRepositoryId
    && left.scope.observedRevision === right.scope.observedRevision
    && left.scope.tokenizerLicenseClosureStatus === right.scope.tokenizerLicenseClosureStatus
    && left.scope.acceptableUseClosureStatus === right.scope.acceptableUseClosureStatus
    && left.scope.derivedHostingClosureStatus === right.scope.derivedHostingClosureStatus
    && left.scope.quantizationClosureStatus === right.scope.quantizationClosureStatus
    && left.scope.evidenceClosureRevision === right.scope.evidenceClosureRevision
    && left.scope.governanceDecisionPolicyRevision === right.scope.governanceDecisionPolicyRevision
    && left.scope.governanceDecisionRecordPolicyRevision === right.scope.governanceDecisionRecordPolicyRevision
    && left.scope.recordRevision === right.scope.recordRevision
    && sameFinalItems(left.decisions, right.decisions);
}

function validateCanonicalRecord(
  record: LocalModelGovernanceDecisionRecord,
): readonly string[] {
  const issues: string[] = [];
  if (!hasOnlyKeys(record, RECORD_KEYS)) appendUnique(issues, 'canonical-record-unexpected-field');
  if (!isObject(record.scope) || !hasOnlyKeys(record.scope, RECORD_SCOPE_KEYS)) {
    appendUnique(issues, 'canonical-record-scope-unexpected-field');
  }
  if (!Array.isArray(record.decisions) || record.decisions.length !== REQUIREMENT_IDS.length) {
    appendUnique(issues, 'canonical-decision-count-invalid');
  }
  const seen = new Set<string>();
  for (const item of record.decisions) {
    if (!isObject(item) || !hasOnlyKeys(item, DECISION_KEYS)) {
      appendUnique(issues, 'canonical-decision-unexpected-field');
      continue;
    }
    if (!REQUIREMENT_IDS.includes(item.requirementId as typeof REQUIREMENT_IDS[number])) {
      appendUnique(issues, 'canonical-decision-requirement-unknown');
      continue;
    }
    if (seen.has(item.requirementId)) appendUnique(issues, `canonical-decision-duplicate:${item.requirementId}`);
    seen.add(item.requirementId);
    if (item.explicitlyRecorded !== true) appendUnique(issues, `canonical-decision-not-explicit:${item.requirementId}`);
    if (!['proceed', 'reject', 'request-more-evidence'].includes(item.decision)) {
      appendUnique(issues, `canonical-decision-invalid:${item.requirementId}`);
    }
  }
  for (const requirementId of REQUIREMENT_IDS) {
    if (!seen.has(requirementId)) appendUnique(issues, `canonical-decision-missing:${requirementId}`);
  }
  if (!['proceed', 'rejected', 'more-evidence'].includes(record.outcome)) {
    appendUnique(issues, 'canonical-outcome-invalid');
  }
  if (record.allDecisionsExplicit !== true) appendUnique(issues, 'canonical-all-decisions-explicit-required');
  if (record.recordValidForCurrentScope !== true) appendUnique(issues, 'canonical-record-current-scope-invalid');
  if (record.eligibleForTrustedPersistence !== true) appendUnique(issues, 'canonical-record-not-eligible-for-persistence');
  if (record.decisionRecordOnly !== true) appendUnique(issues, 'canonical-record-boundary-flag-invalid');
  if (!Number.isInteger(record.recordRevision) || record.recordRevision < 1) appendUnique(issues, 'canonical-record-revision-invalid');
  if (record.scope.recordRevision !== record.recordRevision) appendUnique(issues, 'canonical-record-scope-revision-mismatch');
  if (record.candidateId !== record.scope.candidateId) appendUnique(issues, 'canonical-record-candidate-mismatch');
  if (record.candidateTier !== record.scope.candidateTier) appendUnique(issues, 'canonical-record-tier-mismatch');
  if (record.recordKey !== buildLocalModelGovernanceDecisionRecordKey(record.scope, record.recordRevision)) {
    appendUnique(issues, 'canonical-record-key-mismatch');
  }
  if (!isIsoInstant(record.reviewedAt)) appendUnique(issues, 'canonical-reviewed-at-invalid');
  if (record.actorRole !== 'model-governance-reviewer') appendUnique(issues, 'canonical-actor-role-invalid');
  if (!/^[A-Za-z0-9._:-]{8,128}$/.test(record.actorSubjectId) || record.actorSubjectId.includes('@')) {
    appendUnique(issues, 'canonical-actor-subject-invalid');
  }
  const forbiddenClaims: readonly [boolean, string][] = [
    [record.persisted, 'canonical-persisted-claim-not-allowed'],
    [record.signed, 'canonical-signed-claim-not-allowed'],
    [record.appliedToArtifactSelection, 'canonical-downstream-application-claim-not-allowed'],
    [record.modelApproved, 'canonical-model-approval-claim-not-allowed'],
    [record.licenseApproved, 'canonical-license-approval-claim-not-allowed'],
    [record.artifactSelected, 'canonical-artifact-selection-claim-not-allowed'],
    [record.artifactApproved, 'canonical-artifact-approval-claim-not-allowed'],
    [record.checksumVerified, 'canonical-checksum-verification-claim-not-allowed'],
    [record.benchmarkVerified, 'canonical-benchmark-verification-claim-not-allowed'],
    [record.downloadable, 'canonical-downloadable-claim-not-allowed'],
    [record.runtimeReady, 'canonical-runtime-readiness-claim-not-allowed'],
    [record.modelActive, 'canonical-model-active-claim-not-allowed'],
  ];
  for (const [claimed, issue] of forbiddenClaims) if (claimed) appendUnique(issues, issue);
  return unique(issues);
}

export function buildLocalModelGovernanceRecordPersistenceKey(
  record: LocalModelGovernanceDecisionRecord,
): string {
  return [
    'local-model-governance-record',
    record.candidateId,
    record.scope.observedRevision ?? 'revision-unavailable',
    record.recordKey,
    `record-revision-${record.recordRevision}`,
    `schema-${LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_SCHEMA_REVISION}`,
  ].join(':');
}

export function buildLocalModelGovernanceRecordIdempotencyKey(
  record: LocalModelGovernanceDecisionRecord,
): string {
  return `${buildLocalModelGovernanceRecordPersistenceKey(record)}:idempotency`;
}

export function buildLocalModelGovernanceRecordPersistenceScope(
  record: LocalModelGovernanceDecisionRecord,
): LocalModelGovernanceRecordPersistenceScope {
  return {
    recordKey: record.recordKey,
    recordRevision: record.recordRevision,
    candidateId: record.candidateId,
    candidateTier: record.candidateTier,
    modelClass: record.scope.modelClass,
    exactModelName: record.scope.exactModelName,
    officialRepositoryId: record.scope.officialRepositoryId,
    observedRevision: record.scope.observedRevision,
    evidenceClosureRevision: record.scope.evidenceClosureRevision,
    governanceDecisionPolicyRevision: record.scope.governanceDecisionPolicyRevision,
    governanceDecisionRecordPolicyRevision: record.scope.governanceDecisionRecordPolicyRevision,
    persistenceSchemaRevision: LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_SCHEMA_REVISION,
    persistencePolicyRevision: LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_POLICY_REVISION,
    canonicalOutcome: canonicalOutcome(record),
    reviewedAt: record.reviewedAt,
    actorRole: record.actorRole,
    authorizationScope: 'record-model-governance-decision',
    actorSubjectId: record.actorSubjectId,
    decisions: record.decisions.map((item): LocalModelGovernanceRecordPersistenceScopeDecision => ({
      requirementId: item.requirementId,
      evidenceClosureStatus: item.evidenceClosureStatus,
      decision: item.decision,
      explicitlyRecorded: true,
    })),
  };
}

export function isSameLocalModelGovernancePersistenceScope(
  left: LocalModelGovernanceRecordPersistenceScope,
  right: LocalModelGovernanceRecordPersistenceScope,
): boolean {
  return left.recordKey === right.recordKey
    && left.recordRevision === right.recordRevision
    && left.candidateId === right.candidateId
    && left.candidateTier === right.candidateTier
    && left.modelClass === right.modelClass
    && left.exactModelName === right.exactModelName
    && left.officialRepositoryId === right.officialRepositoryId
    && left.observedRevision === right.observedRevision
    && left.evidenceClosureRevision === right.evidenceClosureRevision
    && left.governanceDecisionPolicyRevision === right.governanceDecisionPolicyRevision
    && left.governanceDecisionRecordPolicyRevision === right.governanceDecisionRecordPolicyRevision
    && left.persistenceSchemaRevision === right.persistenceSchemaRevision
    && left.persistencePolicyRevision === right.persistencePolicyRevision
    && left.canonicalOutcome === right.canonicalOutcome
    && left.reviewedAt === right.reviewedAt
    && left.actorRole === right.actorRole
    && left.authorizationScope === right.authorizationScope
    && left.actorSubjectId === right.actorSubjectId
    && sameDecisionSnapshots(left.decisions, right.decisions);
}

export function buildLocalModelGovernanceRecordPersistenceEnvelope(
  record: LocalModelGovernanceDecisionRecord,
): LocalModelGovernanceRecordPersistenceEnvelope {
  return {
    persistenceKey: buildLocalModelGovernanceRecordPersistenceKey(record),
    idempotencyKey: buildLocalModelGovernanceRecordIdempotencyKey(record),
    schemaRevision: LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_SCHEMA_REVISION,
    policyRevision: LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_POLICY_REVISION,
    operation: 'append',
    duplicatePolicy: {
      identical: 'idempotent-if-identical',
      conflicting: 'reject-if-conflicting',
    },
    canonicalRecord: cloneRecord(record),
    canonicalRecordKey: record.recordKey,
    canonicalRecordRevision: record.recordRevision,
    canonicalOutcome: canonicalOutcome(record),
    candidateId: record.candidateId,
    candidateTier: record.candidateTier,
    createdFromReviewedAt: record.reviewedAt,
    immutable: true,
    appendOnly: true,
    updateAllowed: false,
    deleteAllowed: false,
    clientDeleteAllowed: false,
    clientOverwriteAllowed: false,
    persistenceBoundaryOnly: true,
  };
}

export function validateLocalModelGovernanceRecordPersistenceEnvelope(
  envelope: LocalModelGovernanceRecordPersistenceEnvelope,
): LocalModelGovernanceRecordPersistenceEnvelopeValidation {
  const issues: string[] = [];
  if (!isObject(envelope) || !hasOnlyKeys(envelope, ENVELOPE_KEYS)) {
    appendUnique(issues, 'persistence-envelope-unexpected-field');
    return { valid: false, issues: unique(issues) };
  }
  for (const issue of validateCanonicalRecord(envelope.canonicalRecord)) appendUnique(issues, issue);
  if (envelope.schemaRevision !== LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_SCHEMA_REVISION) {
    appendUnique(issues, 'persistence-envelope-schema-revision-mismatch');
  }
  if (envelope.policyRevision !== LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_POLICY_REVISION) {
    appendUnique(issues, 'persistence-envelope-policy-revision-mismatch');
  }
  if (envelope.operation !== 'append') appendUnique(issues, 'persistence-operation-not-append');
  if (envelope.duplicatePolicy.identical !== 'idempotent-if-identical'
    || envelope.duplicatePolicy.conflicting !== 'reject-if-conflicting') {
    appendUnique(issues, 'persistence-duplicate-policy-invalid');
  }
  if (envelope.immutable !== true || envelope.appendOnly !== true) appendUnique(issues, 'persistence-envelope-not-immutable-append-only');
  if (envelope.updateAllowed !== false) appendUnique(issues, 'persistence-envelope-update-not-allowed');
  if (envelope.deleteAllowed !== false) appendUnique(issues, 'persistence-envelope-delete-not-allowed');
  if (envelope.clientDeleteAllowed !== false) appendUnique(issues, 'persistence-envelope-client-delete-not-allowed');
  if (envelope.clientOverwriteAllowed !== false) appendUnique(issues, 'persistence-envelope-client-overwrite-not-allowed');
  if (envelope.persistenceBoundaryOnly !== true) appendUnique(issues, 'persistence-envelope-boundary-flag-invalid');
  if (envelope.persistenceKey !== buildLocalModelGovernanceRecordPersistenceKey(envelope.canonicalRecord)) {
    appendUnique(issues, 'persistence-key-mismatch');
  }
  if (envelope.idempotencyKey !== buildLocalModelGovernanceRecordIdempotencyKey(envelope.canonicalRecord)) {
    appendUnique(issues, 'persistence-idempotency-key-mismatch');
  }
  if (envelope.canonicalRecordKey !== envelope.canonicalRecord.recordKey) appendUnique(issues, 'persistence-canonical-record-key-mismatch');
  if (envelope.canonicalRecordRevision !== envelope.canonicalRecord.recordRevision) appendUnique(issues, 'persistence-canonical-record-revision-mismatch');
  if (envelope.canonicalOutcome !== canonicalOutcome(envelope.canonicalRecord)) appendUnique(issues, 'persistence-canonical-outcome-mismatch');
  if (envelope.candidateId !== envelope.canonicalRecord.candidateId) appendUnique(issues, 'persistence-envelope-candidate-mismatch');
  if (envelope.candidateTier !== envelope.canonicalRecord.candidateTier) appendUnique(issues, 'persistence-envelope-tier-mismatch');
  if (envelope.createdFromReviewedAt !== envelope.canonicalRecord.reviewedAt) appendUnique(issues, 'persistence-reviewed-at-mismatch');
  return { valid: issues.length === 0, issues: unique(issues) };
}

export function isSameLocalModelGovernancePersistenceEnvelope(
  left: LocalModelGovernanceRecordPersistenceEnvelope,
  right: LocalModelGovernanceRecordPersistenceEnvelope,
): boolean {
  return left.persistenceKey === right.persistenceKey
    && left.idempotencyKey === right.idempotencyKey
    && left.schemaRevision === right.schemaRevision
    && left.policyRevision === right.policyRevision
    && left.operation === right.operation
    && left.duplicatePolicy.identical === right.duplicatePolicy.identical
    && left.duplicatePolicy.conflicting === right.duplicatePolicy.conflicting
    && left.canonicalRecordKey === right.canonicalRecordKey
    && left.canonicalRecordRevision === right.canonicalRecordRevision
    && left.canonicalOutcome === right.canonicalOutcome
    && left.candidateId === right.candidateId
    && left.candidateTier === right.candidateTier
    && left.createdFromReviewedAt === right.createdFromReviewedAt
    && left.immutable === right.immutable
    && left.appendOnly === right.appendOnly
    && left.updateAllowed === right.updateAllowed
    && left.deleteAllowed === right.deleteAllowed
    && left.clientDeleteAllowed === right.clientDeleteAllowed
    && left.clientOverwriteAllowed === right.clientOverwriteAllowed
    && left.persistenceBoundaryOnly === right.persistenceBoundaryOnly
    && sameCanonicalRecord(left.canonicalRecord, right.canonicalRecord);
}

export function compareLocalModelGovernancePersistenceEnvelope(
  existing: LocalModelGovernanceRecordPersistenceEnvelope | null,
  incoming: LocalModelGovernanceRecordPersistenceEnvelope,
): LocalModelGovernanceRecordPersistenceComparison {
  if (!existing || existing.persistenceKey !== incoming.persistenceKey) {
    return { duplicateState: 'no-existing-envelope', conflictDetected: false };
  }
  if (isSameLocalModelGovernancePersistenceEnvelope(existing, incoming)) {
    return { duplicateState: 'identical-existing-envelope', conflictDetected: false };
  }
  return { duplicateState: 'conflicting-existing-envelope', conflictDetected: true };
}

function workspaceHasMatchingFinalizedRecord(
  workspace: LocalModelGovernanceReviewWorkspaceResult,
  record: LocalModelGovernanceDecisionRecord,
): boolean {
  return workspace.canonicalRecordFinalized
    && ['finalized-proceed', 'finalized-rejected', 'finalized-more-evidence'].includes(workspace.status)
    && workspace.finalizedRecord !== null
    && sameCanonicalRecord(workspace.finalizedRecord, record);
}

function scopeIsInvalid(input: LocalModelGovernanceRecordPersistenceInput): boolean {
  if (input.previouslyInvalidated) return true;
  if (!input.finalizedRecord) return false;
  const expected = buildLocalModelGovernanceRecordPersistenceScope(input.finalizedRecord);
  if (!input.currentRecordScope || !isSameLocalModelGovernancePersistenceScope(input.currentRecordScope, expected)) return true;
  if (input.previousPersistenceScope
    && !isSameLocalModelGovernancePersistenceScope(input.previousPersistenceScope, expected)) return true;
  if (input.candidateId !== input.finalizedRecord.candidateId
    || input.candidateTier !== input.finalizedRecord.candidateTier) return true;
  if (input.schemaRevision !== LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_SCHEMA_REVISION
    || input.policyRevision !== LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_POLICY_REVISION) return true;
  return false;
}

export function validateLocalModelGovernanceRecordPersistenceInput(
  input: LocalModelGovernanceRecordPersistenceInput,
): LocalModelGovernanceRecordPersistenceValidation {
  const issues: string[] = [];
  const scopeInvalid = scopeIsInvalid(input);
  if (input.requestedOperation !== 'append') appendUnique(issues, 'persistence-operation-not-append');
  if (input.schemaRevision !== LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_SCHEMA_REVISION) {
    appendUnique(issues, 'persistence-schema-revision-mismatch');
  }
  if (input.policyRevision !== LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_POLICY_REVISION) {
    appendUnique(issues, 'persistence-policy-revision-mismatch');
  }
  if (!input.finalizedRecord) {
    if (input.workspaceResult.canonicalRecordFinalized || input.workspaceResult.finalizedRecord !== null) {
      appendUnique(issues, 'workspace-finalized-record-missing');
    }
    if (input.currentRecordScope !== null) appendUnique(issues, 'persistence-scope-without-record');
    if (input.previousEnvelope !== null) appendUnique(issues, 'persistence-envelope-without-record');
  } else {
    for (const issue of validateCanonicalRecord(input.finalizedRecord)) appendUnique(issues, issue);
    if (!workspaceHasMatchingFinalizedRecord(input.workspaceResult, input.finalizedRecord)) {
      appendUnique(issues, 'workspace-finalized-record-mismatch');
    }
    if (input.workspaceResult.candidateId !== input.candidateId
      || input.workspaceResult.candidateTier !== input.candidateTier) {
      appendUnique(issues, 'workspace-candidate-scope-mismatch');
    }
    if (input.currentRecordScope === null) appendUnique(issues, 'current-persistence-scope-required');
    const envelope = buildLocalModelGovernanceRecordPersistenceEnvelope(input.finalizedRecord);
    const envelopeValidation = validateLocalModelGovernanceRecordPersistenceEnvelope(envelope);
    for (const issue of envelopeValidation.issues) appendUnique(issues, issue);
    if (input.previousEnvelope) {
      const previousValidation = validateLocalModelGovernanceRecordPersistenceEnvelope(input.previousEnvelope);
      for (const issue of previousValidation.issues) appendUnique(issues, `existing-${issue}`);
      const duplicate = compareLocalModelGovernancePersistenceEnvelope(input.previousEnvelope, envelope);
      if (duplicate.conflictDetected) appendUnique(issues, 'conflicting-existing-envelope');
    }
  }
  const forbiddenClaims: readonly [boolean, string][] = [
    [input.claimedPersistenceAttempted, 'persistence-attempt-claim-not-allowed'],
    [input.claimedRepositoryWritePerformed, 'repository-write-claim-not-allowed'],
    [input.claimedRecordPersisted, 'record-persisted-claim-not-allowed'],
    [input.claimedRecordSigned, 'record-signed-claim-not-allowed'],
    [input.claimedRecordAppliedDownstream, 'record-downstream-application-claim-not-allowed'],
    [input.claimedModelApproved, 'model-approval-claim-not-allowed'],
    [input.claimedLicenseApproved, 'license-approval-claim-not-allowed'],
    [input.claimedArtifactSelected, 'artifact-selection-claim-not-allowed'],
    [input.claimedArtifactApproved, 'artifact-approval-claim-not-allowed'],
    [input.claimedChecksumVerified, 'checksum-verification-claim-not-allowed'],
    [input.claimedBenchmarkVerified, 'benchmark-verification-claim-not-allowed'],
    [input.claimedDownloadable, 'downloadable-claim-not-allowed'],
    [input.claimedRuntimeReady, 'runtime-readiness-claim-not-allowed'],
    [input.claimedModelActive, 'model-active-claim-not-allowed'],
  ];
  for (const [claimed, issue] of forbiddenClaims) if (claimed) appendUnique(issues, issue);
  return { valid: issues.length === 0 && !scopeInvalid, issues: unique(issues), scopeInvalid };
}

export function evaluateLocalModelGovernanceRecordPersistence(
  input: LocalModelGovernanceRecordPersistenceInput,
): LocalModelGovernanceRecordPersistenceResult {
  const validation = validateLocalModelGovernanceRecordPersistenceInput(input);
  const blockers = [...validation.issues];
  const warnings: string[] = [];
  const finalizedRecordPresent = input.finalizedRecord !== null;
  const canonicalRecordValid = finalizedRecordPresent
    && validateCanonicalRecord(input.finalizedRecord!).length === 0;
  let persistenceEnvelope: LocalModelGovernanceRecordPersistenceEnvelope | null = null;
  let duplicateState: LocalModelGovernanceRecordPersistenceResult['duplicateState'] = 'unchecked';
  let conflictDetected = false;
  let status: LocalModelGovernanceRecordPersistenceResult['status'];
  const incomingEnvelope = input.finalizedRecord
    ? buildLocalModelGovernanceRecordPersistenceEnvelope(input.finalizedRecord)
    : null;
  if (incomingEnvelope) {
    const comparison = compareLocalModelGovernancePersistenceEnvelope(input.previousEnvelope, incomingEnvelope);
    duplicateState = comparison.duplicateState;
    conflictDetected = comparison.conflictDetected;
  }

  if (!validation.valid && validation.issues.length > 0) {
    status = 'attention-required';
  } else if (validation.scopeInvalid) {
    status = 'invalidated';
  } else if (!input.finalizedRecord || !incomingEnvelope) {
    status = 'awaiting-finalized-record';
    appendUnique(warnings, 'canonical-finalized-record-required');
  } else if (conflictDetected) {
    status = 'attention-required';
    appendUnique(blockers, 'conflicting-existing-envelope');
  } else {
    status = 'persistence-request-ready';
    persistenceEnvelope = incomingEnvelope;
    appendUnique(warnings, 'repository-handoff-not-configured');
  }

  const persistenceRequestReady = status === 'persistence-request-ready';
  return {
    candidateId: input.candidateId,
    candidateTier: input.candidateTier,
    status,
    blockers: unique(blockers),
    warnings: unique(warnings),
    finalizedRecordPresent,
    canonicalRecordValid,
    recordValidForCurrentScope: !validation.scopeInvalid,
    persistenceEnvelope: persistenceEnvelope ? cloneEnvelope(persistenceEnvelope) : null,
    persistenceRequestReady,
    duplicateState,
    conflictDetected,
    canProceedToRepositoryHandoffReview: persistenceRequestReady,
    persistenceBoundaryOnly: true,
    persistenceAttempted: false,
    repositoryWritePerformed: false,
    recordPersisted: false,
    recordSigned: false,
    recordAppliedDownstream: false,
    modelApproved: false,
    licenseApproved: false,
    artifactSelected: false,
    artifactApproved: false,
    checksumVerified: false,
    benchmarkVerified: false,
    downloadable: false,
    runtimeReady: false,
    modelActive: false,
  };
}

export function createAwaitingLocalModelGovernanceRecordPersistenceInput(
  candidateId: string,
): LocalModelGovernanceRecordPersistenceInput {
  const workspaceResult = buildCurrentLocalModelGovernanceReviewWorkspaceResults()
    .find((item) => item.candidateId === candidateId);
  if (!workspaceResult) throw new Error('governance-persistence-candidate-not-found');
  return {
    candidateId: workspaceResult.candidateId,
    candidateTier: workspaceResult.candidateTier,
    workspaceResult,
    finalizedRecord: null,
    currentRecordScope: null,
    previousPersistenceScope: null,
    previousEnvelope: null,
    previouslyInvalidated: false,
    schemaRevision: LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_SCHEMA_REVISION,
    policyRevision: LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_POLICY_REVISION,
    requestedOperation: 'append',
    claimedPersistenceAttempted: false,
    claimedRepositoryWritePerformed: false,
    claimedRecordPersisted: false,
    claimedRecordSigned: false,
    claimedRecordAppliedDownstream: false,
    claimedModelApproved: false,
    claimedLicenseApproved: false,
    claimedArtifactSelected: false,
    claimedArtifactApproved: false,
    claimedChecksumVerified: false,
    claimedBenchmarkVerified: false,
    claimedDownloadable: false,
    claimedRuntimeReady: false,
    claimedModelActive: false,
  };
}

export function buildCurrentLocalModelGovernanceRecordPersistenceResults(): readonly LocalModelGovernanceRecordPersistenceResult[] {
  return buildCurrentLocalModelGovernanceReviewWorkspaceResults().map((workspace) => (
    evaluateLocalModelGovernanceRecordPersistence(
      createAwaitingLocalModelGovernanceRecordPersistenceInput(workspace.candidateId),
    )
  ));
}

export function listCurrentLocalModelGovernanceRecordPersistenceResults(): readonly LocalModelGovernanceRecordPersistenceResult[] {
  return buildCurrentLocalModelGovernanceRecordPersistenceResults();
}
