import {
  validateLocalModelGovernanceApplicationRecordPersistenceEnvelope,
} from './localModelGovernanceApplicationRecordPersistencePolicy.ts';
import type {
  LocalModelGovernanceApplicationRecordPersistenceEnvelope,
  LocalModelGovernanceApplicationRecordPersistenceValidation,
} from './localModelGovernanceApplicationRecordPersistenceTypes.ts';
import {
  LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_TABLE,
} from './localModelGovernanceApplicationArtifactSelectionBridgeTypes.ts';
import type {
  LocalModelGovernanceApplicationRecordReadClient,
  LocalModelGovernanceApplicationRecordSelectColumns,
  LocalModelGovernanceApplicationRecordVerificationRepository,
  LocalModelGovernanceApplicationRecordVerificationRequest,
  LocalModelGovernanceApplicationRecordVerificationResult,
  LocalModelGovernanceApplicationRecordVerificationStatus,
} from './localModelGovernanceApplicationArtifactSelectionBridgeTypes.ts';

export const LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_DECISION_KEY_COLUMN =
  'application_decision_key' as const;
export const LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_SELECT_COLUMNS:
LocalModelGovernanceApplicationRecordSelectColumns =
  'id,application_decision_key,application_idempotency_key,schema_revision,application_policy_revision,source_governance_persistence_key,canonical_record_key,canonical_record_revision,canonical_outcome,candidate_id,candidate_tier,observed_revision,application_status,artifact_selection_review_eligible,application_actor_user_id,application_envelope,created_at';

const ROW_KEYS = Object.freeze([
  'id',
  'application_decision_key',
  'application_idempotency_key',
  'schema_revision',
  'application_policy_revision',
  'source_governance_persistence_key',
  'canonical_record_key',
  'canonical_record_revision',
  'canonical_outcome',
  'candidate_id',
  'candidate_tier',
  'observed_revision',
  'application_status',
  'artifact_selection_review_eligible',
  'application_actor_user_id',
  'application_envelope',
  'created_at',
] as const);

interface VerifiedRowMetadata {
  readonly recordId: string;
  readonly envelopeMatched: boolean;
  readonly immutableFieldsMatched: boolean;
  readonly actorColumnValid: boolean;
  readonly createdAtValid: boolean;
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
  const wanted = [...expected].sort();
  return actual.length === wanted.length
    && actual.every((key, index) => key === wanted[index]);
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

function readTrimmedString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 && value === value.trim()
    ? value
    : null;
}

function isUuid(value: unknown): boolean {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return leap ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function parseRfc3339Instant(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  if (month < 1 || month > 12
    || day < 1 || day > daysInMonth(year, month)
    || hour > 23 || minute > 59 || second > 59) return null;
  if (match[8] !== 'Z') {
    const offsetHour = Number(match[8].slice(1, 3));
    const offsetMinute = Number(match[8].slice(4, 6));
    if (offsetHour > 23 || offsetMinute > 59) return null;
  }
  const instant = Date.parse(value);
  return Number.isFinite(instant) ? instant : null;
}

function canonicalizeJson(value: unknown, seen: Set<object>): string | null {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return JSON.stringify(Object.is(value, -0) ? 0 : value);
  }
  if (typeof value !== 'object') return null;
  if (seen.has(value)) return null;
  const nextSeen = new Set(seen);
  nextSeen.add(value);
  if (Array.isArray(value)) {
    const entries: string[] = [];
    for (const item of value) {
      const encoded = canonicalizeJson(item, nextSeen);
      if (encoded === null) return null;
      entries.push(encoded);
    }
    return `[${entries.join(',')}]`;
  }
  if (!isPlainObject(value)) return null;
  const entries: string[] = [];
  for (const key of Object.keys(value).sort()) {
    const encoded = canonicalizeJson(value[key], nextSeen);
    if (encoded === null) return null;
    entries.push(`${JSON.stringify(key)}:${encoded}`);
  }
  return `{${entries.join(',')}}`;
}

function toCanonicalJson(value: unknown): string | null {
  try {
    return canonicalizeJson(value, new Set<object>());
  } catch {
    return null;
  }
}

function isReadClient(value: unknown): value is LocalModelGovernanceApplicationRecordReadClient {
  try {
    return isObject(value) && typeof value.from === 'function';
  } catch {
    return false;
  }
}

function verifyRow(
  row: unknown,
  expected: LocalModelGovernanceApplicationRecordPersistenceEnvelope,
): { readonly malformed: boolean; readonly metadata: VerifiedRowMetadata | null } {
  if (!isPlainObject(row) || !hasExactKeys(row, ROW_KEYS)) {
    return { malformed: true, metadata: null };
  }

  const recordId = normalizePositiveInteger(row.id);
  const applicationDecisionKey = readTrimmedString(row.application_decision_key);
  const applicationIdempotencyKey = readTrimmedString(row.application_idempotency_key);
  const schemaRevision = normalizePositiveInteger(row.schema_revision);
  const applicationPolicyRevision = normalizePositiveInteger(row.application_policy_revision);
  const sourceGovernancePersistenceKey = readTrimmedString(row.source_governance_persistence_key);
  const canonicalRecordKey = readTrimmedString(row.canonical_record_key);
  const canonicalRecordRevision = normalizePositiveInteger(row.canonical_record_revision);
  const canonicalOutcome = readTrimmedString(row.canonical_outcome);
  const candidateId = readTrimmedString(row.candidate_id);
  const candidateTier = readTrimmedString(row.candidate_tier);
  const observedRevision = readTrimmedString(row.observed_revision);
  const applicationStatus = readTrimmedString(row.application_status);
  const artifactSelectionReviewEligible = row.artifact_selection_review_eligible;
  const actorColumnValid = isUuid(row.application_actor_user_id);
  const createdAtValid = parseRfc3339Instant(row.created_at) !== null;
  const persistedEnvelope = toCanonicalJson(row.application_envelope);
  const expectedEnvelope = toCanonicalJson(expected);

  if (!recordId || !applicationDecisionKey || !applicationIdempotencyKey
    || !schemaRevision || !applicationPolicyRevision || !sourceGovernancePersistenceKey
    || !canonicalRecordKey || !canonicalRecordRevision || !canonicalOutcome
    || !candidateId || !candidateTier || !observedRevision || !applicationStatus
    || typeof artifactSelectionReviewEligible !== 'boolean'
    || !actorColumnValid || !createdAtValid
    || persistedEnvelope === null || expectedEnvelope === null) {
    return { malformed: true, metadata: null };
  }

  const issues: string[] = [];
  if (applicationDecisionKey !== expected.applicationDecisionKey) {
    appendUnique(issues, 'governance-application-record-verification-decision-key-mismatch');
  }
  if (applicationIdempotencyKey !== expected.applicationIdempotencyKey) {
    appendUnique(issues, 'governance-application-record-verification-idempotency-key-mismatch');
  }
  if (schemaRevision !== String(expected.schemaRevision)) {
    appendUnique(issues, 'governance-application-record-verification-schema-revision-mismatch');
  }
  if (applicationPolicyRevision !== String(expected.applicationPolicyRevision)) {
    appendUnique(issues, 'governance-application-record-verification-policy-revision-mismatch');
  }
  if (sourceGovernancePersistenceKey !== expected.sourceGovernancePersistenceKey) {
    appendUnique(issues, 'governance-application-record-verification-source-key-mismatch');
  }
  if (canonicalRecordKey !== expected.canonicalRecordKey) {
    appendUnique(issues, 'governance-application-record-verification-canonical-key-mismatch');
  }
  if (canonicalRecordRevision !== String(expected.canonicalRecordRevision)) {
    appendUnique(issues, 'governance-application-record-verification-canonical-revision-mismatch');
  }
  if (canonicalOutcome !== expected.canonicalOutcome) {
    appendUnique(issues, 'governance-application-record-verification-outcome-mismatch');
  }
  if (candidateId !== expected.candidateId || candidateTier !== expected.candidateTier) {
    appendUnique(issues, 'governance-application-record-verification-candidate-scope-mismatch');
  }
  if (observedRevision !== expected.observedRevision) {
    appendUnique(issues, 'governance-application-record-verification-observed-revision-mismatch');
  }
  if (applicationStatus !== expected.applicationStatus) {
    appendUnique(issues, 'governance-application-record-verification-status-mismatch');
  }
  if (artifactSelectionReviewEligible !== expected.artifactSelectionReviewEligible) {
    appendUnique(issues, 'governance-application-record-verification-eligibility-mismatch');
  }
  const envelopeMatched = persistedEnvelope === expectedEnvelope;
  if (!envelopeMatched) {
    appendUnique(issues, 'governance-application-record-verification-envelope-mismatch');
  }

  return {
    malformed: false,
    metadata: {
      recordId,
      envelopeMatched,
      immutableFieldsMatched: issues.length === 0,
      actorColumnValid,
      createdAtValid,
      issues: Object.freeze(issues),
    },
  };
}

function normalizeReadError(
  error: unknown,
): LocalModelGovernanceApplicationRecordVerificationStatus {
  try {
    if (!isObject(error)) return 'failed-safe';
    const code = typeof error.code === 'string' ? error.code : null;
    const message = typeof error.message === 'string' ? error.message : null;
    if (code === '28000') return 'authentication-required';
    if (code === '42501') return 'authorization-required';
    if (code !== null) return 'failed-safe';
    if (message !== null && message.length > 0) return 'transport-unavailable';
    return 'failed-safe';
  } catch {
    return 'failed-safe';
  }
}

function blockersForStatus(
  status: LocalModelGovernanceApplicationRecordVerificationStatus,
): readonly string[] {
  const mapping: Record<LocalModelGovernanceApplicationRecordVerificationStatus, string | null> = {
    'not-requested': 'governance-application-record-verification-explicit-action-required',
    'invalid-expected-envelope': 'governance-application-record-verification-envelope-invalid',
    'repository-unavailable': 'governance-application-record-verification-repository-unavailable',
    verified: null,
    'not-found-or-not-visible': 'governance-application-record-verification-record-not-found-or-not-visible',
    'authentication-required': 'governance-application-record-verification-authentication-required',
    'authorization-required': 'governance-application-record-verification-authorization-required',
    'transport-unavailable': 'governance-application-record-verification-transport-unavailable',
    'malformed-response': 'governance-application-record-verification-response-malformed',
    'malformed-record': 'governance-application-record-verification-row-malformed',
    'verification-mismatch': 'governance-application-record-verification-mismatch',
    'failed-safe': 'governance-application-record-verification-failed-safe',
  };
  return mapping[status] === null ? Object.freeze([]) : Object.freeze([mapping[status] as string]);
}

function buildResult(
  status: LocalModelGovernanceApplicationRecordVerificationStatus,
  options: {
    readonly explicitVerificationRequested: boolean;
    readonly expectedEnvelopeValid: boolean;
    readonly repositoryAvailable: boolean;
    readonly readAttempted: boolean;
    readonly recordVisible?: boolean;
    readonly blockers?: readonly string[];
    readonly metadata?: VerifiedRowMetadata | null;
    readonly expectedEnvelope?: LocalModelGovernanceApplicationRecordPersistenceEnvelope | null;
  },
): LocalModelGovernanceApplicationRecordVerificationResult {
  const verified = status === 'verified';
  const expected = verified ? options.expectedEnvelope ?? null : null;
  const metadata = options.metadata ?? null;
  return {
    status,
    blockers: options.blockers ?? blockersForStatus(status),
    warnings: Object.freeze([]),
    explicitVerificationRequested: options.explicitVerificationRequested,
    expectedEnvelopeValid: options.expectedEnvelopeValid,
    repositoryAvailable: options.repositoryAvailable,
    readAttempted: options.readAttempted,
    readInvocationCount: options.readAttempted ? 1 : 0,
    recordVisible: options.recordVisible ?? false,
    recordVerified: verified,
    recordId: verified ? metadata?.recordId ?? null : null,
    applicationDecisionKey: expected?.applicationDecisionKey ?? null,
    applicationIdempotencyKey: expected?.applicationIdempotencyKey ?? null,
    sourceGovernancePersistenceKey: expected?.sourceGovernancePersistenceKey ?? null,
    canonicalRecordKey: expected?.canonicalRecordKey ?? null,
    canonicalRecordRevision: expected?.canonicalRecordRevision ?? null,
    canonicalOutcome: expected?.canonicalOutcome ?? null,
    candidateId: expected?.candidateId ?? null,
    candidateTier: expected?.candidateTier ?? null,
    observedRevision: expected?.observedRevision ?? null,
    schemaRevision: expected?.schemaRevision ?? null,
    applicationPolicyRevision: expected?.applicationPolicyRevision ?? null,
    applicationStatus: expected?.applicationStatus ?? null,
    artifactSelectionReviewEligible: verified ? expected?.artifactSelectionReviewEligible ?? false : false,
    envelopeMatched: metadata?.envelopeMatched ?? false,
    immutableFieldsMatched: metadata?.immutableFieldsMatched ?? false,
    actorColumnValid: metadata?.actorColumnValid ?? false,
    createdAtValid: metadata?.createdAtValid ?? false,
    rawRowExposed: false,
    rawErrorExposed: false,
    applicationRecordAppliedDownstream: false,
    bridgeDecisionPersisted: false,
    artifactSelected: false,
    artifactApproved: false,
    modelApproved: false,
    licenseApproved: false,
    checksumVerified: false,
    benchmarkVerified: false,
    downloadable: false,
    runtimeReady: false,
    modelActive: false,
  };
}

async function executeVerificationUnsafe(
  readClient: LocalModelGovernanceApplicationRecordReadClient | null,
  request: LocalModelGovernanceApplicationRecordVerificationRequest,
): Promise<LocalModelGovernanceApplicationRecordVerificationResult> {
  if (request.explicitVerificationRequested !== true) {
    return buildResult('not-requested', {
      explicitVerificationRequested: false,
      expectedEnvelopeValid: false,
      repositoryAvailable: readClient !== null,
      readAttempted: false,
    });
  }

  let validation: LocalModelGovernanceApplicationRecordPersistenceValidation;
  try {
    validation = validateLocalModelGovernanceApplicationRecordPersistenceEnvelope(
      request.expectedApplicationEnvelope,
    );
  } catch {
    return buildResult('invalid-expected-envelope', {
      explicitVerificationRequested: true,
      expectedEnvelopeValid: false,
      repositoryAvailable: readClient !== null,
      readAttempted: false,
      blockers: Object.freeze(['governance-application-record-verification-envelope-invalid']),
    });
  }
  if (!validation.valid) {
    return buildResult('invalid-expected-envelope', {
      explicitVerificationRequested: true,
      expectedEnvelopeValid: false,
      repositoryAvailable: readClient !== null,
      readAttempted: false,
      blockers: Object.freeze([...validation.issues]),
    });
  }

  if (!readClient) {
    return buildResult('repository-unavailable', {
      explicitVerificationRequested: true,
      expectedEnvelopeValid: true,
      repositoryAvailable: false,
      readAttempted: false,
    });
  }

  const attempted = {
    explicitVerificationRequested: true,
    expectedEnvelopeValid: true,
    repositoryAvailable: true,
    readAttempted: true,
  } as const;

  let response: unknown;
  try {
    response = await readClient
      .from(LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_TABLE)
      .select(LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_SELECT_COLUMNS)
      .eq(
        LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_DECISION_KEY_COLUMN,
        request.expectedApplicationEnvelope.applicationDecisionKey,
      )
      .limit(2);
  } catch {
    return buildResult('transport-unavailable', attempted);
  }

  let row: unknown;
  try {
    if (!isObject(response) || !hasExactKeys(response, ['data', 'error'])) {
      return buildResult('malformed-response', attempted);
    }
    if (response.error !== null) {
      return buildResult(normalizeReadError(response.error), attempted);
    }
    if (!Array.isArray(response.data)) {
      return buildResult('malformed-response', attempted);
    }
    if (response.data.length === 0) {
      return buildResult('not-found-or-not-visible', attempted);
    }
    if (response.data.length !== 1) {
      return buildResult('malformed-response', attempted);
    }
    row = response.data[0];
  } catch {
    return buildResult('failed-safe', attempted);
  }

  let verification: ReturnType<typeof verifyRow>;
  try {
    verification = verifyRow(row, request.expectedApplicationEnvelope);
  } catch {
    return buildResult('malformed-record', {
      ...attempted,
      recordVisible: true,
    });
  }
  if (verification.malformed || !verification.metadata) {
    return buildResult('malformed-record', {
      ...attempted,
      recordVisible: true,
    });
  }
  if (verification.metadata.issues.length > 0) {
    return buildResult('verification-mismatch', {
      ...attempted,
      recordVisible: true,
      blockers: verification.metadata.issues,
      metadata: verification.metadata,
    });
  }
  return buildResult('verified', {
    ...attempted,
    recordVisible: true,
    metadata: verification.metadata,
    expectedEnvelope: request.expectedApplicationEnvelope,
  });
}

async function executeVerification(
  readClient: LocalModelGovernanceApplicationRecordReadClient | null,
  request: LocalModelGovernanceApplicationRecordVerificationRequest,
): Promise<LocalModelGovernanceApplicationRecordVerificationResult> {
  try {
    return await executeVerificationUnsafe(readClient, request);
  } catch {
    return buildResult('failed-safe', {
      explicitVerificationRequested: false,
      expectedEnvelopeValid: false,
      repositoryAvailable: readClient !== null,
      readAttempted: false,
    });
  }
}

export function createUnavailableLocalModelGovernanceApplicationRecordVerificationRepository():
LocalModelGovernanceApplicationRecordVerificationRepository {
  return {
    availability: 'unavailable',
    verify: (request) => executeVerification(null, request),
  };
}

export function createLocalModelGovernanceApplicationRecordVerificationRepository(
  readClient: LocalModelGovernanceApplicationRecordReadClient,
): LocalModelGovernanceApplicationRecordVerificationRepository {
  if (!isReadClient(readClient)) {
    return createUnavailableLocalModelGovernanceApplicationRecordVerificationRepository();
  }
  return {
    availability: 'available',
    verify: (request) => executeVerification(readClient, request),
  };
}

export function verifyLocalModelGovernanceApplicationRecord(
  repository: LocalModelGovernanceApplicationRecordVerificationRepository,
  request: LocalModelGovernanceApplicationRecordVerificationRequest,
): Promise<LocalModelGovernanceApplicationRecordVerificationResult> {
  return repository.verify(request);
}
