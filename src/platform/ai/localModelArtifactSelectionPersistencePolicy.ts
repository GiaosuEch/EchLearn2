import type {
  LocalModelArtifactSelectionPersistenceBuildInput,
  LocalModelArtifactSelectionPersistenceEnvelope,
  LocalModelArtifactSelectionPersistenceValidation,
} from './localModelArtifactSelectionPersistenceTypes.ts';
import {
  LOCAL_MODEL_ARTIFACT_SELECTION_PERSISTENCE_POLICY_REVISION,
  LOCAL_MODEL_ARTIFACT_SELECTION_PERSISTENCE_SCHEMA_REVISION,
} from './localModelArtifactSelectionPersistenceTypes.ts';

const ENVELOPE_KEYS = [
  'selectionDecisionKey', 'selectionIdempotencyKey', 'schemaRevision', 'selectionPolicyRevision', 'operation',
  'bridgeDecisionKey', 'sourceApplicationDecisionKey', 'sourceGovernancePersistenceKey', 'canonicalRecordKey',
  'canonicalRecordRevision', 'canonicalOutcome', 'candidateId', 'candidateTier', 'observedRevision',
  'selectedOptionId', 'selectionDecision', 'selectionStatus', 'humanSelectionRecorded', 'selectionScope',
  'immutable', 'appendOnly', 'decisionPersisted', 'artifactSelected', 'artifactApproved', 'modelApproved',
  'licenseApproved', 'checksumVerified', 'benchmarkVerified', 'downloadable', 'runtimeReady', 'modelActive',
] as const;

type RecordValue = Record<string, unknown>;
function isRecord(value: unknown): value is RecordValue { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function text(value: unknown): string | null { return typeof value === 'string' && value.length > 0 && value === value.trim() ? value : null; }
function positive(value: unknown): value is number { return typeof value === 'number' && Number.isSafeInteger(value) && value > 0; }
function exactKeys(value: RecordValue, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort(); const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}
function issue(issues: string[], value: string): void { if (!issues.includes(value)) issues.push(value); }

export function buildLocalModelArtifactSelectionDecisionKey(
  candidateId: string, observedRevision: string, bridgeDecisionKey: string, selectedOptionId: string,
): string {
  return ['local-model-artifact-selection', candidateId, observedRevision, bridgeDecisionKey, selectedOptionId,
    `selection-policy-revision-${LOCAL_MODEL_ARTIFACT_SELECTION_PERSISTENCE_POLICY_REVISION}`].join(':');
}
export function buildLocalModelArtifactSelectionIdempotencyKey(key: string): string {
  return `${key}:idempotency:schema-${LOCAL_MODEL_ARTIFACT_SELECTION_PERSISTENCE_SCHEMA_REVISION}`;
}

function selectionMatchesBridge(selection: RecordValue, bridge: RecordValue): boolean {
  const scope = selection.selectedScope;
  const optionId = text(selection.selectedOptionId);
  if (!isRecord(scope) || optionId === null || !Array.isArray(selection.availableOptions)) return false;
  const option = selection.availableOptions.find((value) => isRecord(value) && value.optionId === optionId);
  return isRecord(option)
    && selection.status === 'selection-recorded' && selection.decision === 'select'
    && selection.humanSelectionRecorded === true && selection.selectionValidForCurrentScope === true
    && selection.artifactSelected === true
    && text(scope.candidateId) === text(bridge.candidateId)
    && text(scope.candidateTier) === text(bridge.candidateTier)
    && text(scope.observedRevision) === text(bridge.observedRevision)
    && text(option.candidateId) === text(bridge.candidateId)
    && text(option.candidateTier) === text(bridge.candidateTier)
    && text(option.observedRevision) === text(bridge.observedRevision);
}

export function validateLocalModelArtifactSelectionPersistenceEnvelope(
  value: unknown,
): LocalModelArtifactSelectionPersistenceValidation {
  try {
    const issues: string[] = [];
    if (!isRecord(value) || !exactKeys(value, ENVELOPE_KEYS)) return { valid: false, issues: Object.freeze(['artifact-selection-envelope-fields-invalid']) };
    for (const key of ['selectionDecisionKey','selectionIdempotencyKey','bridgeDecisionKey','sourceApplicationDecisionKey','sourceGovernancePersistenceKey','canonicalRecordKey','candidateId','candidateTier','observedRevision','selectedOptionId'] as const) {
      if (text(value[key]) === null) issue(issues, 'artifact-selection-envelope-text-invalid');
    }
    if (!positive(value.canonicalRecordRevision)) issue(issues, 'artifact-selection-envelope-record-revision-invalid');
    if (value.schemaRevision !== LOCAL_MODEL_ARTIFACT_SELECTION_PERSISTENCE_SCHEMA_REVISION || value.selectionPolicyRevision !== LOCAL_MODEL_ARTIFACT_SELECTION_PERSISTENCE_POLICY_REVISION) issue(issues, 'artifact-selection-envelope-policy-revision-invalid');
    if (value.operation !== 'append' || value.canonicalOutcome !== 'finalized-proceed' || value.selectionDecision !== 'select' || value.selectionStatus !== 'selection-recorded' || value.humanSelectionRecorded !== true || value.immutable !== true || value.appendOnly !== true) issue(issues, 'artifact-selection-envelope-contract-invalid');
    if (!['light','standard','pro'].includes(String(value.candidateTier))) issue(issues, 'artifact-selection-envelope-tier-invalid');
    if (!isRecord(value.selectionScope)
      || text(value.selectionScope.candidateId) !== text(value.candidateId)
      || text(value.selectionScope.candidateTier) !== text(value.candidateTier)
      || text(value.selectionScope.observedRevision) !== text(value.observedRevision)) issue(issues, 'artifact-selection-envelope-scope-invalid');
    if (['decisionPersisted','artifactSelected','artifactApproved','modelApproved','licenseApproved','checksumVerified','benchmarkVerified','downloadable','runtimeReady','modelActive'].some((key) => value[key] !== false)) issue(issues, 'artifact-selection-envelope-safety-flags-invalid');
    const candidateId = text(value.candidateId); const revision = text(value.observedRevision); const bridgeKey = text(value.bridgeDecisionKey); const optionId = text(value.selectedOptionId);
    if (candidateId && revision && bridgeKey && optionId) {
      const decisionKey = buildLocalModelArtifactSelectionDecisionKey(candidateId, revision, bridgeKey, optionId);
      if (value.selectionDecisionKey !== decisionKey || value.selectionIdempotencyKey !== buildLocalModelArtifactSelectionIdempotencyKey(decisionKey)) issue(issues, 'artifact-selection-envelope-key-invalid');
    } else issue(issues, 'artifact-selection-envelope-key-invalid');
    return { valid: issues.length === 0, issues: Object.freeze(issues) };
  } catch { return { valid: false, issues: Object.freeze(['artifact-selection-envelope-failed-safe']) }; }
}

export function buildLocalModelArtifactSelectionPersistenceEnvelope(
  input: LocalModelArtifactSelectionPersistenceBuildInput,
): LocalModelArtifactSelectionPersistenceEnvelope | null {
  try {
    if (!isRecord(input) || !isRecord(input.trustedDecision) || !isRecord(input.bridgeDecision) || !isRecord(input.selectionResult)) return null;
    const trusted = input.trustedDecision; const bridge = input.bridgeDecision; const selection = input.selectionResult;
    if (trusted.status !== 'trusted-selection-decision-ready' || trusted.trustedSelectionDecisionReady !== true || trusted.reviewVerified !== true || trusted.selectionVerified !== true || trusted.trustedReviewerVerified !== true) return null;
    if (bridge.status !== 'eligible-for-artifact-selection-review' || bridge.bridgeEligible !== true || bridge.artifactSelectionReviewEligible !== true || !selectionMatchesBridge(selection, bridge)) return null;
    const candidateId = text(bridge.candidateId); const candidateTier = text(bridge.candidateTier); const observedRevision = text(bridge.observedRevision);
    const bridgeDecisionKey = text(bridge.bridgeDecisionKey); const sourceApplicationDecisionKey = text(bridge.applicationDecisionKey);
    const sourceGovernancePersistenceKey = text(bridge.sourceGovernancePersistenceKey); const canonicalRecordKey = text(bridge.canonicalRecordKey);
    const selectedOptionId = text(selection.selectedOptionId); const scope = selection.selectedScope;
    if (!candidateId || !candidateTier || !observedRevision || !bridgeDecisionKey || !sourceApplicationDecisionKey || !sourceGovernancePersistenceKey || !canonicalRecordKey || !selectedOptionId || !positive(bridge.canonicalRecordRevision) || bridge.canonicalOutcome !== 'finalized-proceed' || !isRecord(scope) || !['light','standard','pro'].includes(candidateTier)) return null;
    const selectionDecisionKey = buildLocalModelArtifactSelectionDecisionKey(candidateId, observedRevision, bridgeDecisionKey, selectedOptionId);
    const envelope: LocalModelArtifactSelectionPersistenceEnvelope = Object.freeze({
      selectionDecisionKey, selectionIdempotencyKey: buildLocalModelArtifactSelectionIdempotencyKey(selectionDecisionKey),
      schemaRevision: 1, selectionPolicyRevision: 1, operation: 'append', bridgeDecisionKey, sourceApplicationDecisionKey,
      sourceGovernancePersistenceKey, canonicalRecordKey, canonicalRecordRevision: bridge.canonicalRecordRevision,
      canonicalOutcome: 'finalized-proceed', candidateId, candidateTier: candidateTier as 'light' | 'standard' | 'pro', observedRevision,
      selectedOptionId, selectionDecision: 'select', selectionStatus: 'selection-recorded', humanSelectionRecorded: true,
      selectionScope: Object.freeze({ ...scope }), immutable: true, appendOnly: true, decisionPersisted: false,
      artifactSelected: false, artifactApproved: false, modelApproved: false, licenseApproved: false, checksumVerified: false,
      benchmarkVerified: false, downloadable: false, runtimeReady: false, modelActive: false,
    });
    return validateLocalModelArtifactSelectionPersistenceEnvelope(envelope).valid ? envelope : null;
  } catch { return null; }
}
