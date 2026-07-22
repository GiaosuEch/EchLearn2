import {
  validateLocalModelArtifactSelectionPersistenceEnvelope,
} from './localModelArtifactSelectionPersistencePolicy.ts';
import type { LocalModelArtifactSelectionPersistenceEnvelope } from './localModelArtifactSelectionPersistenceTypes.ts';

export const LOCAL_MODEL_ARTIFACT_SELECTION_APPEND_RPC_NAME =
  'append_local_model_governance_artifact_selection_record' as const;

export type LocalModelArtifactSelectionPersistenceStatus =
  | 'not-requested' | 'invalid-envelope' | 'repository-unavailable' | 'inserted'
  | 'identical-existing-selection-envelope' | 'authentication-required' | 'authorization-required'
  | 'conflicting-duplicate' | 'database-validation-rejected' | 'transport-unavailable'
  | 'malformed-response' | 'failed-safe';

export interface LocalModelArtifactSelectionPersistenceRpcClient {
  rpc(name: string, args: Readonly<Record<string, unknown>>): PromiseLike<{ readonly data: unknown; readonly error: unknown }>;
}
export interface LocalModelArtifactSelectionPersistenceRequest {
  readonly envelope: LocalModelArtifactSelectionPersistenceEnvelope;
  readonly explicitActionRequested: boolean;
}
export interface LocalModelArtifactSelectionPersistenceRepository {
  readonly availability: 'available' | 'unavailable';
  append(request: LocalModelArtifactSelectionPersistenceRequest): Promise<LocalModelArtifactSelectionPersistenceResult>;
}
export interface LocalModelArtifactSelectionPersistenceResult {
  readonly status: LocalModelArtifactSelectionPersistenceStatus;
  readonly persistenceAcknowledged: boolean;
  readonly rpcAttempted: boolean;
  readonly rpcInvocationCount: 0 | 1;
  readonly recordId: string | null;
  readonly rawErrorExposed: false;
  readonly artifactSelected: false;
  readonly artifactApproved: false;
  readonly modelApproved: false;
  readonly licenseApproved: false;
  readonly checksumVerified: false;
  readonly benchmarkVerified: false;
  readonly downloadable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
}
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function result(status: LocalModelArtifactSelectionPersistenceStatus, attempted = false, recordId: string | null = null): LocalModelArtifactSelectionPersistenceResult {
  return { status, persistenceAcknowledged: status === 'inserted' || status === 'identical-existing-selection-envelope', rpcAttempted: attempted, rpcInvocationCount: attempted ? 1 : 0, recordId, rawErrorExposed: false, artifactSelected: false, artifactApproved: false, modelApproved: false, licenseApproved: false, checksumVerified: false, benchmarkVerified: false, downloadable: false, runtimeReady: false, modelActive: false };
}
function errorStatus(error: unknown): LocalModelArtifactSelectionPersistenceStatus {
  if (!isRecord(error)) return 'failed-safe'; const code = error.code; const message = error.message;
  if (code === '28000' && message === 'artifact-selection-authentication-required') return 'authentication-required';
  if (code === '42501' && message === 'artifact-selection-authorization-required') return 'authorization-required';
  if (code === '23505' && message === 'artifact-selection-conflicting-duplicate') return 'conflicting-duplicate';
  if (code === '22023' && typeof message === 'string' && message.startsWith('artifact-selection-')) return 'database-validation-rejected';
  return typeof message === 'string' && message.length > 0 ? 'transport-unavailable' : 'failed-safe';
}
async function append(client: LocalModelArtifactSelectionPersistenceRpcClient | null, request: LocalModelArtifactSelectionPersistenceRequest): Promise<LocalModelArtifactSelectionPersistenceResult> {
  if (request.explicitActionRequested !== true) return result('not-requested');
  if (!validateLocalModelArtifactSelectionPersistenceEnvelope(request.envelope).valid) return result('invalid-envelope');
  if (!client) return result('repository-unavailable');
  let response: unknown; try { response = await client.rpc(LOCAL_MODEL_ARTIFACT_SELECTION_APPEND_RPC_NAME, Object.freeze({ p_selection: request.envelope })); } catch { return result('transport-unavailable', true); }
  if (!isRecord(response) || !('data' in response) || !('error' in response)) return result('malformed-response', true);
  if (response.error !== null && response.error !== undefined) return result(errorStatus(response.error), true);
  const row = Array.isArray(response.data) ? response.data.length === 1 ? response.data[0] : null : response.data;
  if (!isRecord(row) || Object.keys(row).length !== 3 || (row.result_status !== 'inserted' && row.result_status !== 'identical-existing-selection-envelope') || row.selection_decision_key !== request.envelope.selectionDecisionKey || !((typeof row.record_id === 'string' && /^[1-9][0-9]*$/.test(row.record_id)) || (typeof row.record_id === 'number' && Number.isSafeInteger(row.record_id) && row.record_id > 0))) return result('malformed-response', true);
  return result(row.result_status, true, String(row.record_id));
}
export function createUnavailableLocalModelArtifactSelectionPersistenceRepository(): LocalModelArtifactSelectionPersistenceRepository { return Object.freeze({ availability: 'unavailable', append: (request: LocalModelArtifactSelectionPersistenceRequest) => append(null, request) }); }
export function createLocalModelArtifactSelectionPersistenceRepository(client: LocalModelArtifactSelectionPersistenceRpcClient): LocalModelArtifactSelectionPersistenceRepository { return Object.freeze({ availability: 'available', append: (request: LocalModelArtifactSelectionPersistenceRequest) => append(client, request) }); }
