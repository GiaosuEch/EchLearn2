import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  LOCAL_MODEL_EXTERNAL_AUTH_ASSERTION_REVISION,
  LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION,
  LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE,
  LOCAL_MODEL_TRUSTED_ACTOR_CONTEXT_ADAPTER_POLICY_REVISION,
  buildLocalModelTrustedActorAssertionScope,
  evaluateLocalModelTrustedActorContextAdapter,
} from '../../src/platform/ai/localModelTrustedActorContextAdapter.ts';
import type { LocalModelExternalTrustedActorAssertion } from '../../src/platform/ai/localModelTrustedActorContextAdapterTypes.ts';
import {
  applyLocalModelGovernanceReviewWorkspaceEvent,
  buildLocalModelGovernanceReviewWorkspaceScope,
  createLockedLocalModelGovernanceReviewWorkspaceInput,
  evaluateLocalModelGovernanceReviewWorkspace,
} from '../../src/platform/ai/localModelGovernanceReviewWorkspacePolicy.ts';
import type { LocalModelGovernanceReviewWorkspaceInput } from '../../src/platform/ai/localModelGovernanceReviewWorkspaceTypes.ts';
import {
  buildLocalModelGovernanceRecordPersistenceEnvelope,
  validateLocalModelGovernanceRecordPersistenceEnvelope,
} from '../../src/platform/ai/localModelGovernanceRecordPersistencePolicy.ts';
import type { LocalModelGovernanceRecordPersistenceEnvelope } from '../../src/platform/ai/localModelGovernanceRecordPersistenceTypes.ts';
import {
  LOCAL_MODEL_GOVERNANCE_PERSISTED_RECORD_SELECT_COLUMNS,
  LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_KEY_COLUMN,
  LOCAL_MODEL_GOVERNANCE_RECORDS_TABLE_NAME,
  createLocalModelGovernancePersistedRecordVerificationRepository,
  createUnavailableLocalModelGovernancePersistedRecordVerificationRepository,
  verifyPersistedLocalModelGovernanceRecord,
} from '../../src/platform/ai/localModelGovernancePersistedRecordVerificationRepository.ts';
import type {
  LocalModelGovernancePersistedRecordReadClient,
  LocalModelGovernancePersistedRecordVerificationRequest,
} from '../../src/platform/ai/localModelGovernancePersistedRecordVerificationTypes.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
const REQUIREMENTS = [
  'tokenizer-license-scope',
  'acceptable-use-scope',
  'derived-artifact-hosting',
  'quantization-conversion',
] as const;
const ACTOR_ID = '11111111-1111-4111-8111-111111111111';

interface QueryCall {
  relation: string | null;
  columns: string | null;
  filterColumn: string | null;
  filterValue: unknown;
  limit: number | null;
}

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8');
}

function externalAssertion(): LocalModelExternalTrustedActorAssertion {
  return {
    actorSubjectId: ACTOR_ID,
    authenticationOutcome: 'authenticated',
    authorizationOutcome: 'granted',
    verifiedRoleIds: [LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE],
    verifiedPermissionIds: [LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION],
    authenticationSource: 'external-auth-boundary',
    assertionRevision: LOCAL_MODEL_EXTERNAL_AUTH_ASSERTION_REVISION,
    actorContextRevision: 1,
  };
}

function validEnvelope(): LocalModelGovernanceRecordPersistenceEnvelope {
  const assertion = externalAssertion();
  const adapterResult = evaluateLocalModelTrustedActorContextAdapter({
    assertion,
    previousAssertionScope: null,
    previouslyInvalidated: false,
    adapterPolicyRevision: LOCAL_MODEL_TRUSTED_ACTOR_CONTEXT_ADAPTER_POLICY_REVISION,
  });
  const actorAssertionScope = buildLocalModelTrustedActorAssertionScope(assertion);
  const base = createLockedLocalModelGovernanceReviewWorkspaceInput('qwen3-0-6b-candidate');
  const currentScope = buildLocalModelGovernanceReviewWorkspaceScope(
    'qwen3-0-6b-candidate',
    adapterResult,
    actorAssertionScope,
  );
  assert.ok(currentScope);
  let state: LocalModelGovernanceReviewWorkspaceInput = {
    ...base,
    adapterResult,
    actorAssertionScope,
    currentScope,
    previousScope: currentScope,
    status: 'ready-for-review',
    clock: () => '2026-07-18T08:30:00.000Z',
  };
  state = applyLocalModelGovernanceReviewWorkspaceEvent(state, { type: 'begin-review' });
  for (const requirementId of REQUIREMENTS) {
    state = applyLocalModelGovernanceReviewWorkspaceEvent(state, {
      type: 'set-decision',
      requirementId,
      decision: 'proceed',
    });
  }
  state = applyLocalModelGovernanceReviewWorkspaceEvent(state, { type: 'request-finalize' });
  const result = evaluateLocalModelGovernanceReviewWorkspace(state);
  assert.ok(result.finalizedRecord);
  return buildLocalModelGovernanceRecordPersistenceEnvelope(result.finalizedRecord);
}

function persistedRow(
  envelope: LocalModelGovernanceRecordPersistenceEnvelope,
  overrides: Readonly<Record<string, unknown>> = {},
): Readonly<Record<string, unknown>> {
  return {
    id: '9223372036854775807',
    persistence_key: envelope.persistenceKey,
    idempotency_key: envelope.idempotencyKey,
    schema_revision: envelope.schemaRevision,
    policy_revision: envelope.policyRevision,
    canonical_record_key: envelope.canonicalRecordKey,
    canonical_record_revision: envelope.canonicalRecordRevision,
    canonical_outcome: envelope.canonicalOutcome,
    candidate_id: envelope.candidateId,
    candidate_tier: envelope.candidateTier,
    model_class: envelope.canonicalRecord.scope.modelClass,
    exact_model_name: envelope.canonicalRecord.scope.exactModelName,
    official_repository_id: envelope.canonicalRecord.scope.officialRepositoryId,
    observed_revision: envelope.canonicalRecord.scope.observedRevision,
    actor_user_id: envelope.canonicalRecord.actorSubjectId,
    reviewed_at: envelope.canonicalRecord.reviewedAt,
    persistence_envelope: structuredClone(envelope),
    ...overrides,
  };
}

function clientReturning(
  response: { readonly data: unknown; readonly error: unknown },
  calls: QueryCall[],
): LocalModelGovernancePersistedRecordReadClient {
  return {
    from(relation) {
      const call: QueryCall = {
        relation,
        columns: null,
        filterColumn: null,
        filterValue: null,
        limit: null,
      };
      calls.push(call);
      return {
        select(columns) {
          call.columns = columns;
          return {
            eq(column, value) {
              call.filterColumn = column;
              call.filterValue = value;
              return {
                limit(limit) {
                  call.limit = limit;
                  return Promise.resolve(response);
                },
              };
            },
          };
        },
      };
    },
  };
}

function request(
  expectedEnvelope = validEnvelope(),
  explicitActionRequested: boolean = true,
): LocalModelGovernancePersistedRecordVerificationRequest {
  return { expectedEnvelope, explicitActionRequested };
}

function assertSafetyFlags(
  result: Awaited<ReturnType<typeof verifyPersistedLocalModelGovernanceRecord>>,
): void {
  assert.equal(result.rawRowExposed, false);
  assert.equal(result.rawErrorExposed, false);
  assert.equal(result.recordAppliedDownstream, false);
  assert.equal(result.modelApproved, false);
  assert.equal(result.licenseApproved, false);
  assert.equal(result.artifactSelected, false);
  assert.equal(result.artifactApproved, false);
  assert.equal(result.checksumVerified, false);
  assert.equal(result.benchmarkVerified, false);
  assert.equal(result.downloadable, false);
  assert.equal(result.runtimeReady, false);
  assert.equal(result.modelActive, false);
}

describe('Phase 6.7 persisted governance record verification repository', () => {
  it('does not query on import, construction, unavailable access, or a closed literal action gate', async () => {
    const envelope = validEnvelope();
    const calls: QueryCall[] = [];
    const client = clientReturning({ data: [persistedRow(envelope)], error: null }, calls);
    const available = createLocalModelGovernancePersistedRecordVerificationRepository(client);
    assert.equal(calls.length, 0);

    const unavailable = await verifyPersistedLocalModelGovernanceRecord(
      createUnavailableLocalModelGovernancePersistedRecordVerificationRepository(),
      request(envelope),
    );
    assert.equal(unavailable.status, 'repository-unavailable');
    assert.equal(unavailable.readAttempted, false);
    assert.equal(unavailable.readInvocationCount, 0);

    const notRequested = await verifyPersistedLocalModelGovernanceRecord(
      available,
      request(envelope, false),
    );
    assert.equal(notRequested.status, 'not-requested');

    const malformedGate = await verifyPersistedLocalModelGovernanceRecord(available, {
      expectedEnvelope: envelope,
      explicitActionRequested: 'true',
    } as never);
    assert.equal(malformedGate.status, 'not-requested');
    assert.equal(calls.length, 0);
  });

  it('reuses Phase 6.4 envelope validation and blocks invalid expected envelopes before querying', async () => {
    const envelope = validEnvelope();
    const invalid = { ...envelope, operation: 'update' } as never;
    const expectedIssues = validateLocalModelGovernanceRecordPersistenceEnvelope(invalid).issues;
    const calls: QueryCall[] = [];
    const repository = createLocalModelGovernancePersistedRecordVerificationRepository(
      clientReturning({ data: [], error: null }, calls),
    );
    const result = await verifyPersistedLocalModelGovernanceRecord(repository, request(invalid));
    assert.equal(result.status, 'invalid-expected-envelope');
    assert.deepEqual(result.blockers, expectedIssues);
    assert.equal(result.expectedEnvelopeValid, false);
    assert.equal(result.readAttempted, false);
    assert.equal(result.readInvocationCount, 0);
    assert.equal(calls.length, 0);
  });

  it('uses the exact allowlisted direct-SELECT chain once without filters for actor, role, permission, token, or session', async () => {
    const envelope = validEnvelope();
    const before = structuredClone(envelope);
    const calls: QueryCall[] = [];
    const repository = createLocalModelGovernancePersistedRecordVerificationRepository(
      clientReturning({ data: [persistedRow(envelope)], error: null }, calls),
    );
    const result = await verifyPersistedLocalModelGovernanceRecord(repository, request(envelope));
    assert.equal(result.status, 'verified');
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0], {
      relation: LOCAL_MODEL_GOVERNANCE_RECORDS_TABLE_NAME,
      columns: LOCAL_MODEL_GOVERNANCE_PERSISTED_RECORD_SELECT_COLUMNS,
      filterColumn: LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_KEY_COLUMN,
      filterValue: envelope.persistenceKey,
      limit: 2,
    });
    assert.equal(LOCAL_MODEL_GOVERNANCE_RECORDS_TABLE_NAME, 'local_model_governance_records');
    assert.equal(LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_KEY_COLUMN, 'persistence_key');
    assert.doesNotMatch(LOCAL_MODEL_GOVERNANCE_PERSISTED_RECORD_SELECT_COLUMNS, /\*/);
    assert.equal(result.readInvocationCount, 1);
    assert.deepEqual(envelope, before);
    assertSafetyFlags(result);
  });

  it('maps zero rows to not-found-or-not-visible and fails closed for invalid response cardinality or wrappers', async () => {
    const envelope = validEnvelope();
    const cases = [
      [{ data: [], error: null }, 'not-found-or-not-visible'],
      [{ data: [persistedRow(envelope), persistedRow(envelope)], error: null }, 'malformed-response'],
      [{ data: null, error: null }, 'malformed-response'],
      [{ data: persistedRow(envelope), error: null }, 'malformed-response'],
      [{ data: [persistedRow(envelope)] }, 'malformed-response'],
      [{ error: null }, 'malformed-response'],
    ] as const;
    for (const [response, expectedStatus] of cases) {
      const result = await verifyPersistedLocalModelGovernanceRecord(
        createLocalModelGovernancePersistedRecordVerificationRepository(
          clientReturning(response as never, []),
        ),
        request(envelope),
      );
      assert.equal(result.status, expectedStatus);
      assert.equal(result.readInvocationCount, 1);
      assert.equal(result.recordVerified, false);
      if (expectedStatus === 'not-found-or-not-visible') {
        assert.deepEqual(result.blockers, ['governance-persisted-record-not-found-or-not-visible']);
        assert.doesNotMatch(JSON.stringify(result), /record-not-found(?!-or-not-visible)/);
      }
      assertSafetyFlags(result);
    }
  });

  it('strictly rejects missing or extra row keys', async () => {
    const envelope = validEnvelope();
    const exact = persistedRow(envelope);
    const missing = { ...exact } as Record<string, unknown>;
    delete missing.idempotency_key;
    for (const row of [missing, { ...exact, extra_field: true }]) {
      const result = await verifyPersistedLocalModelGovernanceRecord(
        createLocalModelGovernancePersistedRecordVerificationRepository(
          clientReturning({ data: [row], error: null }, []),
        ),
        request(envelope),
      );
      assert.equal(result.status, 'malformed-record');
      assert.equal(result.recordVisible, true);
      assert.equal(result.recordVerified, false);
    }
  });

  it('normalizes bigint IDs and positive revisions without precision loss and rejects unsafe numeric forms', async () => {
    const envelope = validEnvelope();
    for (const [id, expected] of [[42, '42'], ['9223372036854775807', '9223372036854775807']] as const) {
      const result = await verifyPersistedLocalModelGovernanceRecord(
        createLocalModelGovernancePersistedRecordVerificationRepository(
          clientReturning({ data: [persistedRow(envelope, { id })], error: null }, []),
        ),
        request(envelope),
      );
      assert.equal(result.status, 'verified');
      assert.equal(result.recordId, expected);
    }

    const invalidIds: readonly unknown[] = [0, -1, 1.5, '1e3', '1.0', '+1', ' 1', '0x10', Number.MAX_SAFE_INTEGER + 2, NaN, Infinity, true, null, {}];
    for (const id of invalidIds) {
      const result = await verifyPersistedLocalModelGovernanceRecord(
        createLocalModelGovernancePersistedRecordVerificationRepository(
          clientReturning({ data: [persistedRow(envelope, { id })], error: null }, []),
        ),
        request(envelope),
      );
      assert.equal(result.status, 'malformed-record');
    }

    for (const [field, value] of [
      ['schema_revision', 0],
      ['policy_revision', -1],
      ['canonical_record_revision', 1.5],
      ['schema_revision', '1e0'],
      ['policy_revision', Number.MAX_SAFE_INTEGER + 2],
    ] as const) {
      const result = await verifyPersistedLocalModelGovernanceRecord(
        createLocalModelGovernancePersistedRecordVerificationRepository(
          clientReturning({ data: [persistedRow(envelope, { [field]: value })], error: null }, []),
        ),
        request(envelope),
      );
      assert.equal(result.status, 'malformed-record');
    }
  });

  it('verifies equivalent timestamp instants and rejects malformed or different reviewed times', async () => {
    const envelope = validEnvelope();
    const equivalent = await verifyPersistedLocalModelGovernanceRecord(
      createLocalModelGovernancePersistedRecordVerificationRepository(
        clientReturning({ data: [persistedRow(envelope, { reviewed_at: '2026-07-18T08:30:00+00:00' })], error: null }, []),
      ),
      request(envelope),
    );
    assert.equal(equivalent.status, 'verified');
    assert.equal(equivalent.reviewedAtVerified, true);

    const malformed = await verifyPersistedLocalModelGovernanceRecord(
      createLocalModelGovernancePersistedRecordVerificationRepository(
        clientReturning({ data: [persistedRow(envelope, { reviewed_at: '2026-02-30T08:30:00Z' })], error: null }, []),
      ),
      request(envelope),
    );
    assert.equal(malformed.status, 'malformed-record');

    const mismatch = await verifyPersistedLocalModelGovernanceRecord(
      createLocalModelGovernancePersistedRecordVerificationRepository(
        clientReturning({ data: [persistedRow(envelope, { reviewed_at: '2026-07-18T08:31:00Z' })], error: null }, []),
      ),
      request(envelope),
    );
    assert.equal(mismatch.status, 'verification-mismatch');
    assert.deepEqual(mismatch.blockers, ['governance-persisted-record-reviewed-at-mismatch']);
    assert.equal(mismatch.reviewedAtVerified, false);
  });

  it('uses stable canonical JSON equality independent of object key order and rejects malformed or changed JSON', async () => {
    const envelope = validEnvelope();
    const reordered = Object.fromEntries(Object.entries(structuredClone(envelope)).reverse());
    const equivalent = await verifyPersistedLocalModelGovernanceRecord(
      createLocalModelGovernancePersistedRecordVerificationRepository(
        clientReturning({ data: [persistedRow(envelope, { persistence_envelope: reordered })], error: null }, []),
      ),
      request(envelope),
    );
    assert.equal(equivalent.status, 'verified');
    assert.equal(equivalent.envelopeMatched, true);

    const changed = structuredClone(envelope) as LocalModelGovernanceRecordPersistenceEnvelope;
    const mismatchEnvelope = { ...changed, candidateId: 'qwen3-4b-candidate' };
    const mismatch = await verifyPersistedLocalModelGovernanceRecord(
      createLocalModelGovernancePersistedRecordVerificationRepository(
        clientReturning({ data: [persistedRow(envelope, { persistence_envelope: mismatchEnvelope })], error: null }, []),
      ),
      request(envelope),
    );
    assert.equal(mismatch.status, 'verification-mismatch');
    assert.deepEqual(mismatch.blockers, ['governance-persisted-record-envelope-mismatch']);

    const malformedJson = { ...structuredClone(envelope), invalid: undefined };
    const malformed = await verifyPersistedLocalModelGovernanceRecord(
      createLocalModelGovernancePersistedRecordVerificationRepository(
        clientReturning({ data: [persistedRow(envelope, { persistence_envelope: malformedJson })], error: null }, []),
      ),
      request(envelope),
    );
    assert.equal(malformed.status, 'malformed-record');
  });

  it('returns deterministic safe mismatch codes for all persisted identity, scope, actor, time, and envelope checks', async () => {
    const envelope = validEnvelope();
    const cases: readonly [Readonly<Record<string, unknown>>, readonly string[]][] = [
      [{ persistence_key: 'mismatch' }, ['governance-persisted-record-persistence-key-mismatch']],
      [{ idempotency_key: 'mismatch' }, ['governance-persisted-record-idempotency-key-mismatch']],
      [{ schema_revision: 2 }, ['governance-persisted-record-schema-revision-mismatch']],
      [{ policy_revision: '2' }, ['governance-persisted-record-policy-revision-mismatch']],
      [{ canonical_record_key: 'mismatch' }, ['governance-persisted-record-canonical-key-mismatch']],
      [{ canonical_record_revision: 2 }, ['governance-persisted-record-canonical-revision-mismatch']],
      [{ canonical_outcome: 'finalized-rejected' }, ['governance-persisted-record-outcome-mismatch']],
      [{ candidate_id: 'qwen3-4b-candidate' }, ['governance-persisted-record-candidate-scope-mismatch']],
      [{ candidate_tier: 'pro' }, ['governance-persisted-record-candidate-scope-mismatch']],
      [{ model_class: '4B' }, ['governance-persisted-record-model-identity-mismatch']],
      [{ exact_model_name: 'Qwen3-4B' }, ['governance-persisted-record-model-identity-mismatch']],
      [{ official_repository_id: 'Qwen/Qwen3-4B' }, ['governance-persisted-record-model-identity-mismatch']],
      [{ observed_revision: 'mismatch' }, ['governance-persisted-record-model-identity-mismatch']],
      [{ actor_user_id: '22222222-2222-4222-8222-222222222222' }, ['governance-persisted-record-actor-binding-mismatch']],
    ];
    for (const [overrides, expectedCodes] of cases) {
      const result = await verifyPersistedLocalModelGovernanceRecord(
        createLocalModelGovernancePersistedRecordVerificationRepository(
          clientReturning({ data: [persistedRow(envelope, overrides)], error: null }, []),
        ),
        request(envelope),
      );
      assert.equal(result.status, 'verification-mismatch');
      assert.deepEqual(result.blockers, expectedCodes);
      assert.equal(result.recordVerified, false);
      assert.doesNotMatch(JSON.stringify(result), new RegExp(ACTOR_ID));
    }

    const multiple = await verifyPersistedLocalModelGovernanceRecord(
      createLocalModelGovernancePersistedRecordVerificationRepository(
        clientReturning({
          data: [persistedRow(envelope, {
            persistence_key: 'mismatch',
            actor_user_id: '22222222-2222-4222-8222-222222222222',
            reviewed_at: '2026-07-18T08:31:00Z',
          })],
          error: null,
        }, []),
      ),
      request(envelope),
    );
    assert.deepEqual(multiple.blockers, [
      'governance-persisted-record-persistence-key-mismatch',
      'governance-persisted-record-actor-binding-mismatch',
      'governance-persisted-record-reviewed-at-mismatch',
    ]);
  });

  it('returns only safe verified metadata and never exposes the row, actor, reviewed timestamp, or envelope', async () => {
    const envelope = validEnvelope();
    const result = await verifyPersistedLocalModelGovernanceRecord(
      createLocalModelGovernancePersistedRecordVerificationRepository(
        clientReturning({ data: [persistedRow(envelope)], error: null }, []),
      ),
      request(envelope),
    );
    assert.equal(result.status, 'verified');
    assert.equal(result.recordVisible, true);
    assert.equal(result.recordVerified, true);
    assert.equal(result.recordId, '9223372036854775807');
    assert.equal(result.persistenceKey, envelope.persistenceKey);
    assert.equal(result.canonicalRecordKey, envelope.canonicalRecordKey);
    assert.equal(result.canonicalOutcome, envelope.canonicalOutcome);
    assert.equal(result.schemaRevision, envelope.schemaRevision);
    assert.equal(result.policyRevision, envelope.policyRevision);
    assert.equal(result.envelopeMatched, true);
    assert.equal(result.candidateScopeVerified, true);
    assert.equal(result.modelIdentityVerified, true);
    assert.equal(result.actorBindingVerified, true);
    assert.equal(result.reviewedAtVerified, true);
    assert.equal('row' in result, false);
    assert.equal('persistenceEnvelope' in result, false);
    assert.equal('actorUserId' in result, false);
    assert.equal('reviewedAt' in result, false);
    assert.doesNotMatch(JSON.stringify(result), new RegExp(ACTOR_ID));
    assertSafetyFlags(result);
  });

  it('fails closed when an untrusted row throws during structural inspection', async () => {
    const envelope = validEnvelope();
    const hostileRow = new Proxy<Record<string, unknown>>({}, {
      ownKeys() {
        throw new Error('private hostile row');
      },
    });
    const result = await verifyPersistedLocalModelGovernanceRecord(
      createLocalModelGovernancePersistedRecordVerificationRepository(
        clientReturning({ data: [hostileRow], error: null }, []),
      ),
      request(envelope),
    );
    assert.equal(result.status, 'malformed-record');
    assert.equal(result.recordVerified, false);
    assert.doesNotMatch(JSON.stringify(result), /private hostile row/);
    assertSafetyFlags(result);
  });

  it('fails closed when response or error objects throw during inspection', async () => {
    const envelope = validEnvelope();
    const hostileResponse = new Proxy<Record<string, unknown>>({}, {
      has() {
        throw new Error('private hostile response');
      },
    });
    const responseResult = await verifyPersistedLocalModelGovernanceRecord(
      createLocalModelGovernancePersistedRecordVerificationRepository(
        clientReturning(hostileResponse as never, []),
      ),
      request(envelope),
    );
    assert.equal(responseResult.status, 'failed-safe');
    assert.doesNotMatch(JSON.stringify(responseResult), /private hostile response/);

    const hostileError = new Proxy<Record<string, unknown>>({}, {
      get() {
        throw new Error('private hostile error');
      },
    });
    const errorResult = await verifyPersistedLocalModelGovernanceRecord(
      createLocalModelGovernancePersistedRecordVerificationRepository(
        clientReturning({ data: null, error: hostileError }, []),
      ),
      request(envelope),
    );
    assert.equal(errorResult.status, 'failed-safe');
    assert.doesNotMatch(JSON.stringify(errorResult), /private hostile error/);
    assertSafetyFlags(responseResult);
    assertSafetyFlags(errorResult);
  });

  it('normalizes authentication, authorization, transport, unknown, and malformed errors without raw leakage or retry', async () => {
    const envelope = validEnvelope();
    const cases = [
      [{ code: '28000', message: 'private auth message', details: 'secret' }, 'authentication-required'],
      [{ code: '42501', message: 'private privilege message', hint: 'secret' }, 'authorization-required'],
      [{ message: 'network unavailable', stack: 'secret' }, 'transport-unavailable'],
      [{ code: 'PGRST999', message: 'private unknown message', details: 'secret' }, 'failed-safe'],
      [{}, 'failed-safe'],
      ['malformed', 'failed-safe'],
    ] as const;
    for (const [error, expectedStatus] of cases) {
      const calls: QueryCall[] = [];
      const result = await verifyPersistedLocalModelGovernanceRecord(
        createLocalModelGovernancePersistedRecordVerificationRepository(
          clientReturning({ data: [persistedRow(envelope)], error }, calls),
        ),
        request(envelope),
      );
      assert.equal(result.status, expectedStatus);
      assert.equal(result.readInvocationCount, 1);
      assert.equal(calls.length, 1);
      assert.equal(result.recordVerified, false);
      assert.equal('error' in result, false);
      assert.equal('details' in result, false);
      assert.equal('hint' in result, false);
      assert.equal('stack' in result, false);
      assert.doesNotMatch(JSON.stringify(result), /secret|network unavailable|private/);
      assertSafetyFlags(result);
    }

    let calls = 0;
    const rejectingClient: LocalModelGovernancePersistedRecordReadClient = {
      from() {
        return {
          select() {
            return {
              eq() {
                return {
                  limit() {
                    calls += 1;
                    return Promise.reject(new Error('private transport failure'));
                  },
                };
              },
            };
          },
        };
      },
    };
    const rejected = await verifyPersistedLocalModelGovernanceRecord(
      createLocalModelGovernancePersistedRecordVerificationRepository(rejectingClient),
      request(envelope),
    );
    assert.equal(rejected.status, 'transport-unavailable');
    assert.equal(rejected.readInvocationCount, 1);
    assert.equal(calls, 1);
    assert.doesNotMatch(JSON.stringify(rejected), /private transport failure/);
  });

  it('contains no forbidden client creation, auth, mutation, RPC, storage, polling, secret, logging, AI, or automatic query behavior', () => {
    const source = [
      read('src/platform/ai/localModelGovernancePersistedRecordVerificationTypes.ts'),
      read('src/platform/ai/localModelGovernancePersistedRecordVerificationRepository.ts'),
      read('src/platform/ai/localModelGovernancePersistedRecordVerificationViewModel.ts'),
    ].join('\n');
    for (const pattern of [
      /service[_-]?role/i,
      /https?:\/\//i,
      /anon[_-]?key/i,
      /accessToken|refreshToken|rawJwt|password|document\.cookie/i,
      /auth\.(?:getSession|getUser)|user_metadata/i,
      /generic admin|generic owner/i,
      /localStorage|sessionStorage|indexedDB|CacheStorage/i,
      /fetch\s*\(|axios/i,
      /\.(?:insert|update|delete|upsert|rpc|single|maybeSingle)\s*\(/i,
      /setTimeout|setInterval|Math\.random|Date\.now|crypto\.randomUUID/i,
      /console\.log/i,
      /\bretry\b|\bbackoff\b|\bqueue\b|polling/i,
      /AIService|model download|runtime initialization|inference/i,
    ]) assert.doesNotMatch(source, pattern);
    assert.match(source, /\.from\s*\(/);
    assert.match(source, /\.select\s*\(/);
    assert.match(source, /\.eq\s*\(/);
    assert.match(source, /\.limit\s*\(\s*2\s*\)/);
    assert.equal((source.match(/\.from\s*\(/g) ?? []).length, 1);
  });
});
