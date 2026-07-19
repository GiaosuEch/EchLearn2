import {
  validateLocalModelGovernanceRecordPersistenceEnvelope,
} from './localModelGovernanceRecordPersistencePolicy.ts';
import type {
  LocalModelGovernanceRecordPersistenceEnvelope,
  LocalModelGovernanceRecordPersistenceEnvelopeValidation,
} from './localModelGovernanceRecordPersistenceTypes.ts';
import type {
  LocalModelGovernancePersistenceRepository,
  LocalModelGovernancePersistenceRepositoryAttemptStatus,
  LocalModelGovernancePersistenceRepositoryRequest,
  LocalModelGovernancePersistenceRepositoryResult,
  LocalModelGovernancePersistenceRpcClient,
} from './localModelGovernancePersistenceRepositoryTypes.ts';

export const LOCAL_MODEL_GOVERNANCE_PERSISTENCE_APPEND_RPC_NAME =
  'append_local_model_governance_record' as const;

const RPC_ROW_KEYS = [
  'result_status',
  'record_id',
  'persistence_key',
] as const;

interface NormalizedRpcRow {
  readonly status: 'inserted' | 'identical-existing-envelope';
  readonly recordId: string;
  readonly persistenceKey: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  expected: readonly string[],
): boolean {
  const keys = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  return keys.length === sortedExpected.length
    && keys.every((key, index) => key === sortedExpected[index]);
}

function normalizeRecordId(value: unknown): string | null {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value > 0 ? String(value) : null;
  }
  if (typeof value === 'string' && /^[1-9][0-9]*$/.test(value)) return value;
  return null;
}

function extractSingleRow(data: unknown): Record<string, unknown> | null {
  if (Array.isArray(data)) {
    return data.length === 1 && isObject(data[0]) ? data[0] : null;
  }
  return isObject(data) ? data : null;
}

function normalizeRpcRow(
  data: unknown,
  envelope: LocalModelGovernanceRecordPersistenceEnvelope,
): NormalizedRpcRow | null {
  const row = extractSingleRow(data);
  if (!row || !hasExactKeys(row, RPC_ROW_KEYS)) return null;
  const status = row.result_status;
  if (status !== 'inserted' && status !== 'identical-existing-envelope') return null;
  const recordId = normalizeRecordId(row.record_id);
  if (!recordId) return null;
  if (typeof row.persistence_key !== 'string'
    || row.persistence_key.length === 0
    || row.persistence_key !== envelope.persistenceKey) return null;
  return {
    status,
    recordId,
    persistenceKey: row.persistence_key,
  };
}

function normalizeRpcError(
  error: unknown,
): LocalModelGovernancePersistenceRepositoryAttemptStatus {
  if (!isObject(error)) return 'failed-safe';
  const code = typeof error.code === 'string' ? error.code : null;
  const message = typeof error.message === 'string' ? error.message : null;
  if (code === '28000' && message === 'governance-persistence-authentication-required') {
    return 'authentication-required';
  }
  if (code === '42501' && message === 'governance-persistence-authorization-required') {
    return 'authorization-required';
  }
  if (code === '23505' && message === 'governance-persistence-conflicting-duplicate') {
    return 'conflicting-duplicate';
  }
  if (code === '22023' && message?.startsWith('governance-persistence-')) {
    return 'database-validation-rejected';
  }
  if (code === '55000') return 'failed-safe';
  if (code !== null) return 'failed-safe';
  if (message !== null && message.length > 0) return 'transport-unavailable';
  return 'failed-safe';
}

function blockersForStatus(
  status: LocalModelGovernancePersistenceRepositoryAttemptStatus,
): readonly string[] {
  if (status === 'inserted' || status === 'identical-existing-envelope') return Object.freeze([]);
  return Object.freeze([`governance-persistence-repository-${status}`]);
}

function buildResult(
  status: LocalModelGovernancePersistenceRepositoryAttemptStatus,
  options: {
    readonly explicitActionRequested: boolean;
    readonly envelopeValid: boolean;
    readonly repositoryAvailable: boolean;
    readonly rpcAttempted: boolean;
    readonly blockers?: readonly string[];
    readonly recordId?: string | null;
    readonly persistenceKey?: string | null;
  },
): LocalModelGovernancePersistenceRepositoryResult {
  const inserted = status === 'inserted';
  const existing = status === 'identical-existing-envelope';
  return {
    status,
    blockers: options.blockers ?? blockersForStatus(status),
    warnings: Object.freeze([]),
    explicitActionRequested: options.explicitActionRequested,
    envelopeValid: options.envelopeValid,
    repositoryAvailable: options.repositoryAvailable,
    rpcAttempted: options.rpcAttempted,
    rpcInvocationCount: options.rpcAttempted ? 1 : 0,
    rpcName: LOCAL_MODEL_GOVERNANCE_PERSISTENCE_APPEND_RPC_NAME,
    newRecordInserted: inserted,
    existingRecordConfirmed: existing,
    persistenceAcknowledged: inserted || existing,
    recordId: options.recordId ?? null,
    persistenceKey: options.persistenceKey ?? null,
    rawErrorExposed: false,
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

async function executeAppend(
  rpcClient: LocalModelGovernancePersistenceRpcClient | null,
  request: LocalModelGovernancePersistenceRepositoryRequest,
): Promise<LocalModelGovernancePersistenceRepositoryResult> {
  if (request.explicitActionRequested !== true) {
    return buildResult('not-requested', {
      explicitActionRequested: false,
      envelopeValid: false,
      repositoryAvailable: rpcClient !== null,
      rpcAttempted: false,
    });
  }

  let validation: LocalModelGovernanceRecordPersistenceEnvelopeValidation;
  try {
    validation = validateLocalModelGovernanceRecordPersistenceEnvelope(request.envelope);
  } catch {
    return buildResult('invalid-envelope', {
      explicitActionRequested: true,
      envelopeValid: false,
      repositoryAvailable: rpcClient !== null,
      rpcAttempted: false,
      blockers: Object.freeze(['persistence-envelope-validation-failed-safe']),
    });
  }
  if (!validation.valid) {
    return buildResult('invalid-envelope', {
      explicitActionRequested: true,
      envelopeValid: false,
      repositoryAvailable: rpcClient !== null,
      rpcAttempted: false,
      blockers: Object.freeze([...validation.issues]),
    });
  }

  if (!rpcClient) {
    return buildResult('repository-unavailable', {
      explicitActionRequested: true,
      envelopeValid: true,
      repositoryAvailable: false,
      rpcAttempted: false,
    });
  }

  let response: unknown;
  try {
    response = await rpcClient.rpc(
      LOCAL_MODEL_GOVERNANCE_PERSISTENCE_APPEND_RPC_NAME,
      Object.freeze({ p_envelope: request.envelope }),
    );
  } catch {
    return buildResult('transport-unavailable', {
      explicitActionRequested: true,
      envelopeValid: true,
      repositoryAvailable: true,
      rpcAttempted: true,
    });
  }

  if (!isObject(response) || !('data' in response) || !('error' in response)) {
    return buildResult('malformed-response', {
      explicitActionRequested: true,
      envelopeValid: true,
      repositoryAvailable: true,
      rpcAttempted: true,
    });
  }
  if (response.error !== null && response.error !== undefined) {
    return buildResult(normalizeRpcError(response.error), {
      explicitActionRequested: true,
      envelopeValid: true,
      repositoryAvailable: true,
      rpcAttempted: true,
    });
  }

  const row = normalizeRpcRow(response.data, request.envelope);
  if (!row) {
    return buildResult('malformed-response', {
      explicitActionRequested: true,
      envelopeValid: true,
      repositoryAvailable: true,
      rpcAttempted: true,
    });
  }
  return buildResult(row.status, {
    explicitActionRequested: true,
    envelopeValid: true,
    repositoryAvailable: true,
    rpcAttempted: true,
    recordId: row.recordId,
    persistenceKey: row.persistenceKey,
  });
}

export function createUnavailableLocalModelGovernancePersistenceRepository():
LocalModelGovernancePersistenceRepository {
  return Object.freeze({
    availability: 'unavailable' as const,
    append: (request: LocalModelGovernancePersistenceRepositoryRequest) => executeAppend(null, request),
  });
}

export function createLocalModelGovernancePersistenceRepository(
  rpcClient: LocalModelGovernancePersistenceRpcClient,
): LocalModelGovernancePersistenceRepository {
  return Object.freeze({
    availability: 'available' as const,
    append: (request: LocalModelGovernancePersistenceRepositoryRequest) => executeAppend(rpcClient, request),
  });
}

export function appendLocalModelGovernanceRecord(
  repository: LocalModelGovernancePersistenceRepository,
  request: LocalModelGovernancePersistenceRepositoryRequest,
): Promise<LocalModelGovernancePersistenceRepositoryResult> {
  return repository.append(request);
}
