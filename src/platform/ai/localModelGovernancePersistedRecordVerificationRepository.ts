import {
  validateLocalModelGovernanceRecordPersistenceEnvelope,
} from './localModelGovernanceRecordPersistencePolicy.ts';
import type {
  LocalModelGovernanceRecordPersistenceEnvelope,
  LocalModelGovernanceRecordPersistenceEnvelopeValidation,
} from './localModelGovernanceRecordPersistenceTypes.ts';
import type {
  LocalModelGovernancePersistedRecordReadClient,
  LocalModelGovernancePersistedRecordSelectColumns,
  LocalModelGovernancePersistedRecordVerificationAttemptStatus,
  LocalModelGovernancePersistedRecordVerificationRepository,
  LocalModelGovernancePersistedRecordVerificationRequest,
  LocalModelGovernancePersistedRecordVerificationResult,
} from './localModelGovernancePersistedRecordVerificationTypes.ts';

export const LOCAL_MODEL_GOVERNANCE_RECORDS_TABLE_NAME =
  'local_model_governance_records' as const;
export const LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_KEY_COLUMN =
  'persistence_key' as const;
export const LOCAL_MODEL_GOVERNANCE_PERSISTED_RECORD_SELECT_COLUMNS:
LocalModelGovernancePersistedRecordSelectColumns =
  'id,persistence_key,idempotency_key,schema_revision,policy_revision,canonical_record_key,canonical_record_revision,canonical_outcome,candidate_id,candidate_tier,model_class,exact_model_name,official_repository_id,observed_revision,actor_user_id,reviewed_at,persistence_envelope';

const ROW_KEYS = [
  'id',
  'persistence_key',
  'idempotency_key',
  'schema_revision',
  'policy_revision',
  'canonical_record_key',
  'canonical_record_revision',
  'canonical_outcome',
  'candidate_id',
  'candidate_tier',
  'model_class',
  'exact_model_name',
  'official_repository_id',
  'observed_revision',
  'actor_user_id',
  'reviewed_at',
  'persistence_envelope',
] as const;

interface VerifiedRowMetadata {
  readonly recordId: string;
  readonly envelopeMatched: boolean;
  readonly candidateScopeVerified: boolean;
  readonly modelIdentityVerified: boolean;
  readonly actorBindingVerified: boolean;
  readonly reviewedAtVerified: boolean;
  readonly issues: readonly string[];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!isObject(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  expected: readonly string[],
): boolean {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  return actual.length === sortedExpected.length
    && actual.every((key, index) => key === sortedExpected[index]);
}

function appendUnique(values: string[], value: string): void {
  if (!values.includes(value)) values.push(value);
}

function normalizePositiveInteger(value: unknown): string | null {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value > 0 ? String(value) : null;
  }
  if (typeof value === 'string' && /^[1-9][0-9]*$/.test(value)) return value;
  return null;
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return leap ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function parseRfc3339Instant(value: unknown): bigint | null {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  if (hour > 23 || minute > 59 || second > 59) return null;

  let offsetMinutes = 0;
  if (match[8] !== 'Z') {
    const offsetHour = Number(match[10]);
    const offsetMinute = Number(match[11]);
    if (offsetHour > 23 || offsetMinute > 59) return null;
    const direction = match[9] === '+' ? 1 : -1;
    offsetMinutes = direction * ((offsetHour * 60) + offsetMinute);
  }

  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, 0);
  const milliseconds = date.getTime() - (offsetMinutes * 60_000);
  if (!Number.isFinite(milliseconds)) return null;
  const fraction = (match[7] ?? '').padEnd(9, '0');
  return (BigInt(milliseconds) * 1_000_000n) + BigInt(fraction || '0');
}

function canonicalizeJsonValue(
  value: unknown,
  ancestors: readonly object[],
): string | null {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') return Number.isFinite(value) ? JSON.stringify(value) : null;
  if (typeof value !== 'object') return null;

  if (ancestors.includes(value)) return null;
  const nextAncestors = [...ancestors, value];
  if (Array.isArray(value)) {
    const items: string[] = [];
    for (const item of value) {
      const canonical = canonicalizeJsonValue(item, nextAncestors);
      if (canonical === null) return null;
      items.push(canonical);
    }
    return `[${items.join(',')}]`;
  }
  if (!isPlainObject(value)) return null;
  const fields: string[] = [];
  for (const key of Object.keys(value).sort()) {
    const canonical = canonicalizeJsonValue(value[key], nextAncestors);
    if (canonical === null) return null;
    fields.push(`${JSON.stringify(key)}:${canonical}`);
  }
  return `{${fields.join(',')}}`;
}

function canonicalizeJson(value: unknown): string | null {
  return canonicalizeJsonValue(value, Object.freeze([]));
}

function normalizedStringField(
  row: Readonly<Record<string, unknown>>,
  key: string,
): string | null {
  const value = row[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function verifyRow(
  value: unknown,
  expected: LocalModelGovernanceRecordPersistenceEnvelope,
): { readonly malformed: boolean; readonly metadata: VerifiedRowMetadata | null } {
  if (!isObject(value) || !hasExactKeys(value, ROW_KEYS)) {
    return { malformed: true, metadata: null };
  }

  const recordId = normalizePositiveInteger(value.id);
  const schemaRevision = normalizePositiveInteger(value.schema_revision);
  const policyRevision = normalizePositiveInteger(value.policy_revision);
  const canonicalRevision = normalizePositiveInteger(value.canonical_record_revision);
  const persistenceKey = normalizedStringField(value, 'persistence_key');
  const idempotencyKey = normalizedStringField(value, 'idempotency_key');
  const canonicalRecordKey = normalizedStringField(value, 'canonical_record_key');
  const canonicalOutcome = normalizedStringField(value, 'canonical_outcome');
  const candidateId = normalizedStringField(value, 'candidate_id');
  const candidateTier = normalizedStringField(value, 'candidate_tier');
  const modelClass = normalizedStringField(value, 'model_class');
  const exactModelName = normalizedStringField(value, 'exact_model_name');
  const officialRepositoryId = normalizedStringField(value, 'official_repository_id');
  const observedRevision = normalizedStringField(value, 'observed_revision');
  const actorUserId = normalizedStringField(value, 'actor_user_id');
  const reviewedAtInstant = parseRfc3339Instant(value.reviewed_at);
  const expectedReviewedAtInstant = parseRfc3339Instant(expected.canonicalRecord.reviewedAt);
  const persistedEnvelope = canonicalizeJson(value.persistence_envelope);
  const expectedEnvelope = canonicalizeJson(expected);

  if (!recordId || !schemaRevision || !policyRevision || !canonicalRevision
    || !persistenceKey || !idempotencyKey || !canonicalRecordKey || !canonicalOutcome
    || !candidateId || !candidateTier || !modelClass || !exactModelName
    || !officialRepositoryId || !observedRevision || !actorUserId
    || reviewedAtInstant === null || expectedReviewedAtInstant === null
    || persistedEnvelope === null || expectedEnvelope === null) {
    return { malformed: true, metadata: null };
  }

  const issues: string[] = [];
  if (persistenceKey !== expected.persistenceKey) {
    appendUnique(issues, 'governance-persisted-record-persistence-key-mismatch');
  }
  if (idempotencyKey !== expected.idempotencyKey) {
    appendUnique(issues, 'governance-persisted-record-idempotency-key-mismatch');
  }
  if (schemaRevision !== String(expected.schemaRevision)) {
    appendUnique(issues, 'governance-persisted-record-schema-revision-mismatch');
  }
  if (policyRevision !== String(expected.policyRevision)) {
    appendUnique(issues, 'governance-persisted-record-policy-revision-mismatch');
  }
  if (canonicalRecordKey !== expected.canonicalRecordKey) {
    appendUnique(issues, 'governance-persisted-record-canonical-key-mismatch');
  }
  if (canonicalRevision !== String(expected.canonicalRecordRevision)) {
    appendUnique(issues, 'governance-persisted-record-canonical-revision-mismatch');
  }
  if (canonicalOutcome !== expected.canonicalOutcome) {
    appendUnique(issues, 'governance-persisted-record-outcome-mismatch');
  }

  const candidateScopeVerified = candidateId === expected.candidateId
    && candidateTier === expected.candidateTier;
  if (!candidateScopeVerified) {
    appendUnique(issues, 'governance-persisted-record-candidate-scope-mismatch');
  }

  const modelIdentityVerified = modelClass === expected.canonicalRecord.scope.modelClass
    && exactModelName === expected.canonicalRecord.scope.exactModelName
    && officialRepositoryId === expected.canonicalRecord.scope.officialRepositoryId
    && observedRevision === expected.canonicalRecord.scope.observedRevision;
  if (!modelIdentityVerified) {
    appendUnique(issues, 'governance-persisted-record-model-identity-mismatch');
  }

  const actorBindingVerified = actorUserId === expected.canonicalRecord.actorSubjectId;
  if (!actorBindingVerified) {
    appendUnique(issues, 'governance-persisted-record-actor-binding-mismatch');
  }

  const reviewedAtVerified = reviewedAtInstant === expectedReviewedAtInstant;
  if (!reviewedAtVerified) {
    appendUnique(issues, 'governance-persisted-record-reviewed-at-mismatch');
  }

  const envelopeMatched = persistedEnvelope === expectedEnvelope;
  if (!envelopeMatched) {
    appendUnique(issues, 'governance-persisted-record-envelope-mismatch');
  }

  return {
    malformed: false,
    metadata: {
      recordId,
      envelopeMatched,
      candidateScopeVerified,
      modelIdentityVerified,
      actorBindingVerified,
      reviewedAtVerified,
      issues: Object.freeze(issues),
    },
  };
}

function normalizeReadError(
  error: unknown,
): LocalModelGovernancePersistedRecordVerificationAttemptStatus {
  if (!isObject(error)) return 'failed-safe';
  const code = typeof error.code === 'string' ? error.code : null;
  const message = typeof error.message === 'string' ? error.message : null;
  if (code === '28000') return 'authentication-required';
  if (code === '42501') return 'authorization-required';
  if (code !== null) return 'failed-safe';
  if (message !== null && message.length > 0) return 'transport-unavailable';
  return 'failed-safe';
}

function blockersForStatus(
  status: LocalModelGovernancePersistedRecordVerificationAttemptStatus,
): readonly string[] {
  if (status === 'verified') return Object.freeze([]);
  return Object.freeze([`governance-persisted-record-${status}`]);
}

function buildResult(
  status: LocalModelGovernancePersistedRecordVerificationAttemptStatus,
  options: {
    readonly explicitActionRequested: boolean;
    readonly expectedEnvelopeValid: boolean;
    readonly repositoryAvailable: boolean;
    readonly readAttempted: boolean;
    readonly queriedPersistenceKey?: string | null;
    readonly recordVisible?: boolean;
    readonly blockers?: readonly string[];
    readonly verifiedMetadata?: VerifiedRowMetadata | null;
    readonly expectedEnvelope?: LocalModelGovernanceRecordPersistenceEnvelope | null;
  },
): LocalModelGovernancePersistedRecordVerificationResult {
  const verified = status === 'verified';
  const metadata = options.verifiedMetadata ?? null;
  const expected = options.expectedEnvelope ?? null;
  return {
    status,
    blockers: options.blockers ?? blockersForStatus(status),
    warnings: Object.freeze([]),
    explicitActionRequested: options.explicitActionRequested,
    expectedEnvelopeValid: options.expectedEnvelopeValid,
    repositoryAvailable: options.repositoryAvailable,
    readAttempted: options.readAttempted,
    readInvocationCount: options.readAttempted ? 1 : 0,
    tableName: LOCAL_MODEL_GOVERNANCE_RECORDS_TABLE_NAME,
    queryColumn: LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_KEY_COLUMN,
    queriedPersistenceKey: options.queriedPersistenceKey ?? null,
    recordVisible: options.recordVisible ?? false,
    recordVerified: verified,
    recordId: verified ? metadata?.recordId ?? null : null,
    persistenceKey: verified ? expected?.persistenceKey ?? null : null,
    canonicalRecordKey: verified ? expected?.canonicalRecordKey ?? null : null,
    canonicalOutcome: verified ? expected?.canonicalOutcome ?? null : null,
    schemaRevision: verified ? expected?.schemaRevision ?? null : null,
    policyRevision: verified ? expected?.policyRevision ?? null : null,
    envelopeMatched: metadata?.envelopeMatched ?? false,
    candidateScopeVerified: metadata?.candidateScopeVerified ?? false,
    modelIdentityVerified: metadata?.modelIdentityVerified ?? false,
    actorBindingVerified: metadata?.actorBindingVerified ?? false,
    reviewedAtVerified: metadata?.reviewedAtVerified ?? false,
    rawRowExposed: false,
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

async function executeVerification(
  readClient: LocalModelGovernancePersistedRecordReadClient | null,
  request: LocalModelGovernancePersistedRecordVerificationRequest,
): Promise<LocalModelGovernancePersistedRecordVerificationResult> {
  if (request.explicitActionRequested !== true) {
    return buildResult('not-requested', {
      explicitActionRequested: false,
      expectedEnvelopeValid: false,
      repositoryAvailable: readClient !== null,
      readAttempted: false,
    });
  }

  let validation: LocalModelGovernanceRecordPersistenceEnvelopeValidation;
  try {
    validation = validateLocalModelGovernanceRecordPersistenceEnvelope(
      request.expectedEnvelope,
    );
  } catch {
    return buildResult('invalid-expected-envelope', {
      explicitActionRequested: true,
      expectedEnvelopeValid: false,
      repositoryAvailable: readClient !== null,
      readAttempted: false,
      blockers: Object.freeze(['persistence-envelope-validation-failed-safe']),
    });
  }
  if (!validation.valid) {
    return buildResult('invalid-expected-envelope', {
      explicitActionRequested: true,
      expectedEnvelopeValid: false,
      repositoryAvailable: readClient !== null,
      readAttempted: false,
      blockers: Object.freeze([...validation.issues]),
    });
  }

  if (!readClient) {
    return buildResult('repository-unavailable', {
      explicitActionRequested: true,
      expectedEnvelopeValid: true,
      repositoryAvailable: false,
      readAttempted: false,
    });
  }

  let response: unknown;
  try {
    response = await readClient
      .from(LOCAL_MODEL_GOVERNANCE_RECORDS_TABLE_NAME)
      .select(LOCAL_MODEL_GOVERNANCE_PERSISTED_RECORD_SELECT_COLUMNS)
      .eq(
        LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_KEY_COLUMN,
        request.expectedEnvelope.persistenceKey,
      )
      .limit(2);
  } catch {
    return buildResult('transport-unavailable', {
      explicitActionRequested: true,
      expectedEnvelopeValid: true,
      repositoryAvailable: true,
      readAttempted: true,
      queriedPersistenceKey: request.expectedEnvelope.persistenceKey,
    });
  }

  const attemptedOptions = {
    explicitActionRequested: true,
    expectedEnvelopeValid: true,
    repositoryAvailable: true,
    readAttempted: true,
    queriedPersistenceKey: request.expectedEnvelope.persistenceKey,
  } as const;

  let rows: unknown[];
  try {
    if (!isObject(response) || !('data' in response) || !('error' in response)) {
      return buildResult('malformed-response', attemptedOptions);
    }
    if (response.error !== null) {
      return buildResult(normalizeReadError(response.error), attemptedOptions);
    }
    if (!Array.isArray(response.data)) {
      return buildResult('malformed-response', attemptedOptions);
    }
    if (response.data.length === 0) {
      return buildResult('not-found-or-not-visible', attemptedOptions);
    }
    if (response.data.length !== 1) {
      return buildResult('malformed-response', attemptedOptions);
    }
    rows = response.data;
  } catch {
    return buildResult('failed-safe', attemptedOptions);
  }

  let verification: ReturnType<typeof verifyRow>;
  try {
    verification = verifyRow(rows[0], request.expectedEnvelope);
  } catch {
    return buildResult('malformed-record', {
      ...attemptedOptions,
      recordVisible: true,
    });
  }
  if (verification.malformed || !verification.metadata) {
    return buildResult('malformed-record', {
      ...attemptedOptions,
      recordVisible: true,
    });
  }
  if (verification.metadata.issues.length > 0) {
    return buildResult('verification-mismatch', {
      ...attemptedOptions,
      recordVisible: true,
      blockers: verification.metadata.issues,
      verifiedMetadata: verification.metadata,
    });
  }
  return buildResult('verified', {
    ...attemptedOptions,
    recordVisible: true,
    verifiedMetadata: verification.metadata,
    expectedEnvelope: request.expectedEnvelope,
  });
}

export function createUnavailableLocalModelGovernancePersistedRecordVerificationRepository():
LocalModelGovernancePersistedRecordVerificationRepository {
  return {
    availability: 'unavailable',
    verify: (request) => executeVerification(null, request),
  };
}

export function createLocalModelGovernancePersistedRecordVerificationRepository(
  readClient: LocalModelGovernancePersistedRecordReadClient,
): LocalModelGovernancePersistedRecordVerificationRepository {
  return {
    availability: 'available',
    verify: (request) => executeVerification(readClient, request),
  };
}

export function verifyPersistedLocalModelGovernanceRecord(
  repository: LocalModelGovernancePersistedRecordVerificationRepository,
  request: LocalModelGovernancePersistedRecordVerificationRequest,
): Promise<LocalModelGovernancePersistedRecordVerificationResult> {
  return repository.verify(request);
}
