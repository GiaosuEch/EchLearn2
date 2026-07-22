import { validateLocalModelArtifactSelectionPersistenceEnvelope } from './localModelArtifactSelectionPersistencePolicy.ts';
import type { LocalModelArtifactSelectionPersistenceEnvelope } from './localModelArtifactSelectionPersistenceTypes.ts';

export const LOCAL_MODEL_ARTIFACT_SELECTION_RECORD_TABLE = 'local_model_governance_artifact_selection_records' as const;
export const LOCAL_MODEL_ARTIFACT_SELECTION_RECORD_SELECT_COLUMNS = 'id,selection_decision_key,selection_idempotency_key,schema_revision,selection_policy_revision,bridge_decision_key,source_application_decision_key,source_governance_persistence_key,canonical_record_key,canonical_record_revision,canonical_outcome,candidate_id,candidate_tier,observed_revision,selected_option_id,selection_decision,selection_status,human_selection_recorded,selection_actor_user_id,selection_scope,selection_envelope,created_at' as const;
type Value = Record<string, unknown>;
const rowKeys = LOCAL_MODEL_ARTIFACT_SELECTION_RECORD_SELECT_COLUMNS.split(',');
function record(value: unknown): value is Value { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function positive(value: unknown): boolean { return (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) || (typeof value === 'string' && /^[1-9][0-9]*$/.test(value)); }
function canonical(value: unknown): string | null { try { return JSON.stringify(value, Object.keys(value as object).sort()); } catch { return null; } }

export function verifyLocalModelArtifactSelectionRecordRow(expected: LocalModelArtifactSelectionPersistenceEnvelope, row: unknown): { readonly verified: boolean; readonly recordId: string | null; readonly issues: readonly string[] } {
  try {
    if (!validateLocalModelArtifactSelectionPersistenceEnvelope(expected).valid || !record(row) || Object.keys(row).sort().join(',') !== [...rowKeys].sort().join(',')) return { verified: false, recordId: null, issues: Object.freeze(['artifact-selection-record-fields-invalid']) };
    const id = positive(row.id) ? String(row.id) : null;
    const columnsMatch = row.selection_decision_key === expected.selectionDecisionKey && row.selection_idempotency_key === expected.selectionIdempotencyKey && row.schema_revision === expected.schemaRevision && row.selection_policy_revision === expected.selectionPolicyRevision && row.bridge_decision_key === expected.bridgeDecisionKey && row.source_application_decision_key === expected.sourceApplicationDecisionKey && row.source_governance_persistence_key === expected.sourceGovernancePersistenceKey && row.canonical_record_key === expected.canonicalRecordKey && row.canonical_record_revision === expected.canonicalRecordRevision && row.canonical_outcome === expected.canonicalOutcome && row.candidate_id === expected.candidateId && row.candidate_tier === expected.candidateTier && row.observed_revision === expected.observedRevision && row.selected_option_id === expected.selectedOptionId && row.selection_decision === expected.selectionDecision && row.selection_status === expected.selectionStatus && row.human_selection_recorded === expected.humanSelectionRecorded;
    const envelopeMatch = canonical(row.selection_envelope) === canonical(expected) && canonical(row.selection_scope) === canonical(expected.selectionScope);
    const actorValid = typeof row.selection_actor_user_id === 'string' && /^[0-9a-f-]{36}$/i.test(row.selection_actor_user_id);
    const verified = Boolean(id && columnsMatch && envelopeMatch && actorValid && typeof row.created_at === 'string');
    return { verified, recordId: verified ? id : null, issues: verified ? Object.freeze([]) : Object.freeze(['artifact-selection-record-verification-mismatch']) };
  } catch { return { verified: false, recordId: null, issues: Object.freeze(['artifact-selection-record-verification-failed-safe']) }; }
}
