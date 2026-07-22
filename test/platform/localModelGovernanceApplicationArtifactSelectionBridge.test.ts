import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, test } from 'node:test';

import type { LocalModelGovernanceRecordApplicationDecision } from '../../src/platform/ai/localModelGovernanceRecordApplicationTypes.ts';
import type {
  LocalModelGovernanceApplicationArtifactSelectionBridgeDecision,
  LocalModelGovernanceApplicationRecordReadClient,
} from '../../src/platform/ai/localModelGovernanceApplicationArtifactSelectionBridgeTypes.ts';
import {
  LOCAL_MODEL_GOVERNANCE_APPLICATION_ARTIFACT_SELECTION_BRIDGE_POLICY_REVISION,
  LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_TABLE,
} from '../../src/platform/ai/localModelGovernanceApplicationArtifactSelectionBridgeTypes.ts';
import {
  LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_DECISION_KEY_COLUMN,
  LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_SELECT_COLUMNS,
  createLocalModelGovernanceApplicationRecordVerificationRepository,
  createUnavailableLocalModelGovernanceApplicationRecordVerificationRepository,
  verifyLocalModelGovernanceApplicationRecord,
} from '../../src/platform/ai/localModelGovernanceApplicationRecordVerificationRepository.ts';
import {
  buildLocalModelGovernanceApplicationArtifactSelectionBridgeDecisionKey,
  buildLocalModelGovernanceApplicationArtifactSelectionBridgeScope,
  evaluateLocalModelGovernanceApplicationArtifactSelectionBridge,
} from '../../src/platform/ai/localModelGovernanceApplicationArtifactSelectionBridgePolicy.ts';
import {
  buildLocalModelGovernanceApplicationArtifactSelectionBridgeViewModel,
} from '../../src/platform/ai/localModelGovernanceApplicationArtifactSelectionBridgeViewModel.ts';
import {
  buildLocalModelGovernanceApplicationRecordPersistenceEnvelope,
} from '../../src/platform/ai/localModelGovernanceApplicationRecordPersistencePolicy.ts';
import type {
  LocalModelGovernanceApplicationRecordPersistenceEnvelope,
} from '../../src/platform/ai/localModelGovernanceApplicationRecordPersistenceTypes.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
const shellPath = join(root, 'src/components/ai/LocalAIReadinessShell.tsx');
const packagePath = join(root, 'package.json');
const phase71MigrationPath = join(
  root,
  'supabase/migrations/20260715_create_local_model_governance_application_records.sql',
);
const phase71PolicyPath = join(
  root,
  'src/platform/ai/localModelGovernanceApplicationRecordPersistencePolicy.ts',
);
const supabaseClientPath = join(root, 'src/lib/supabase.ts');
const approvalRegistryPath = join(root, 'src/platform/ai/localModelApprovalRegistry.ts');
const candidateRegistryPath = join(root, 'src/platform/ai/localModelApprovalRegistry.ts');
const artifactManifestPath = join(root, 'src/platform/ai/localModelArtifactManifest.ts');
const artifactEvidencePath = join(root, 'src/platform/ai/localModelArtifactEvidenceRegistry.ts');

const candidateId = 'qwen3-0-6b-candidate';
const candidateTier = 'light' as const;
const observedRevision = 'c1899de289a04d12100db370d81485cdf75e47ca';
const canonicalRecordKey = [
  'governance-record',
  candidateId,
  observedRevision,
  'e1',
  'd1',
  'p1',
  'r1',
].join(':');
const sourceGovernancePersistenceKey = [
  'local-model-governance-record',
  candidateId,
  observedRevision,
  canonicalRecordKey,
  'record-revision-1',
  'schema-1',
].join(':');
const applicationDecisionKey = [
  'local-model-governance-application',
  candidateId,
  observedRevision,
  canonicalRecordKey,
  'finalized-proceed',
  'application-policy-revision-1',
].join(':');

function buildEligibleDecision(): LocalModelGovernanceRecordApplicationDecision {
  return {
    status: 'eligible-for-downstream-review',
    blockers: [],
    warnings: [],
    explicitApplicationRequested: true,
    expectedEnvelopeValid: true,
    verificationAccepted: true,
    verificationCurrent: true,
    applicationEligible: true,
    applicationDecisionKey,
    candidateId,
    candidateTier,
    persistenceKey: sourceGovernancePersistenceKey,
    canonicalRecordKey,
    canonicalOutcome: 'finalized-proceed',
    canonicalRecordRevision: 1,
    applicationPolicyRevision: 1,
    previousDecisionPresent: false,
    replayDetected: false,
    staleVerificationDetected: false,
    candidateScopeVerified: true,
    modelIdentityVerified: true,
    revisionScopeVerified: true,
    outcomeEligible: true,
    applicationRecordPersisted: false,
    recordAppliedDownstream: false,
    artifactSelectionReviewEligible: true,
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

function requireExpectedEnvelope(): LocalModelGovernanceApplicationRecordPersistenceEnvelope {
  const result = buildLocalModelGovernanceApplicationRecordPersistenceEnvelope(buildEligibleDecision());
  assert.equal(result.valid, true);
  assert.ok(result.envelope);
  return result.envelope;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildPersistedRow(
  envelope: LocalModelGovernanceApplicationRecordPersistenceEnvelope,
): Record<string, unknown> {
  return {
    id: '90071992547409930001',
    application_decision_key: envelope.applicationDecisionKey,
    application_idempotency_key: envelope.applicationIdempotencyKey,
    schema_revision: envelope.schemaRevision,
    application_policy_revision: envelope.applicationPolicyRevision,
    source_governance_persistence_key: envelope.sourceGovernancePersistenceKey,
    canonical_record_key: envelope.canonicalRecordKey,
    canonical_record_revision: envelope.canonicalRecordRevision,
    canonical_outcome: envelope.canonicalOutcome,
    candidate_id: envelope.candidateId,
    candidate_tier: envelope.candidateTier,
    observed_revision: envelope.observedRevision,
    application_status: envelope.applicationStatus,
    artifact_selection_review_eligible: envelope.artifactSelectionReviewEligible,
    application_actor_user_id: '123e4567-e89b-42d3-a456-426614174000',
    application_envelope: clone(envelope),
    created_at: '2026-07-19T01:00:00.000Z',
  };
}

interface QueryCapture {
  fromCalls: unknown[];
  selectCalls: unknown[];
  eqCalls: unknown[][];
  limitCalls: unknown[];
}

function buildReadClient(
  response: unknown,
): { client: LocalModelGovernanceApplicationRecordReadClient; capture: QueryCapture } {
  const capture: QueryCapture = {
    fromCalls: [],
    selectCalls: [],
    eqCalls: [],
    limitCalls: [],
  };
  const client: LocalModelGovernanceApplicationRecordReadClient = {
    from(relation) {
      capture.fromCalls.push(relation);
      return {
        select(columns) {
          capture.selectCalls.push(columns);
          return {
            eq(column, value) {
              capture.eqCalls.push([column, value]);
              return {
                limit(limit) {
                  capture.limitCalls.push(limit);
                  return Promise.resolve(response as { data: unknown; error: unknown });
                },
              };
            },
          };
        },
      };
    },
  };
  return { client, capture };
}

async function verifyWithRow(
  row: unknown,
  envelope = requireExpectedEnvelope(),
) {
  const { client, capture } = buildReadClient({ data: [row], error: null });
  const repository = createLocalModelGovernanceApplicationRecordVerificationRepository(client);
  const result = await verifyLocalModelGovernanceApplicationRecord(repository, {
    expectedApplicationEnvelope: envelope,
    explicitVerificationRequested: true,
  });
  return { result, capture };
}

function requireVerifiedResult(envelope = requireExpectedEnvelope()) {
  return verifyWithRow(buildPersistedRow(envelope), envelope).then(({ result }) => {
    assert.equal(result.status, 'verified');
    return result;
  });
}

function buildEligibleBridgeDecision(): Promise<LocalModelGovernanceApplicationArtifactSelectionBridgeDecision> {
  const envelope = requireExpectedEnvelope();
  return requireVerifiedResult(envelope).then((verificationResult) => {
    const currentScope = buildLocalModelGovernanceApplicationArtifactSelectionBridgeScope(envelope);
    const decision = evaluateLocalModelGovernanceApplicationArtifactSelectionBridge({
      expectedApplicationEnvelope: envelope,
      verificationResult,
      currentScope,
      explicitBridgeRequested: true,
      previousBridgeDecision: null,
    });
    assert.equal(decision.status, 'eligible-for-artifact-selection-review');
    return decision;
  });
}

describe('Phase 7.2 persisted application-record verification repository', () => {
  test('module import and repository construction perform no reads', () => {
    let calls = 0;
    const client = {
      from() {
        calls += 1;
        throw new Error('must not run');
      },
    } as LocalModelGovernanceApplicationRecordReadClient;
    const repository = createLocalModelGovernanceApplicationRecordVerificationRepository(client);
    assert.equal(repository.availability, 'available');
    assert.equal(calls, 0);
    assert.equal(LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_TABLE, 'local_model_governance_application_records');
    assert.equal(LOCAL_MODEL_GOVERNANCE_APPLICATION_ARTIFACT_SELECTION_BRIDGE_POLICY_REVISION, 1);
  });

  test('literal action gate, invalid envelope, and unavailable clients block before query', async () => {
    const envelope = requireExpectedEnvelope();
    const { client, capture } = buildReadClient({ data: [], error: null });
    const repository = createLocalModelGovernanceApplicationRecordVerificationRepository(client);

    const notRequested = await repository.verify({
      expectedApplicationEnvelope: envelope,
      explicitVerificationRequested: 'true' as unknown as boolean,
    });
    assert.equal(notRequested.status, 'not-requested');
    assert.equal(notRequested.readInvocationCount, 0);

    const invalid = await repository.verify({
      expectedApplicationEnvelope: { ...envelope, operation: 'update' } as unknown as LocalModelGovernanceApplicationRecordPersistenceEnvelope,
      explicitVerificationRequested: true,
    });
    assert.equal(invalid.status, 'invalid-expected-envelope');
    assert.equal(invalid.readAttempted, false);

    const unavailable = await createUnavailableLocalModelGovernanceApplicationRecordVerificationRepository().verify({
      expectedApplicationEnvelope: envelope,
      explicitVerificationRequested: true,
    });
    assert.equal(unavailable.status, 'repository-unavailable');
    assert.equal(unavailable.readInvocationCount, 0);

    const malformed = createLocalModelGovernanceApplicationRecordVerificationRepository(
      {} as LocalModelGovernanceApplicationRecordReadClient,
    );
    assert.equal(malformed.availability, 'unavailable');
    assert.equal(capture.fromCalls.length, 0);
  });

  test('query uses exact table, columns, decision-key filter, limit two, and one invocation', async () => {
    const envelope = requireExpectedEnvelope();
    const row = buildPersistedRow(envelope);
    const { result, capture } = await verifyWithRow(row, envelope);

    assert.equal(result.status, 'verified');
    assert.deepEqual(capture.fromCalls, ['local_model_governance_application_records']);
    assert.deepEqual(capture.selectCalls, [
      'id,application_decision_key,application_idempotency_key,schema_revision,application_policy_revision,source_governance_persistence_key,canonical_record_key,canonical_record_revision,canonical_outcome,candidate_id,candidate_tier,observed_revision,application_status,artifact_selection_review_eligible,application_actor_user_id,application_envelope,created_at',
    ]);
    assert.equal(LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_SELECT_COLUMNS.includes('*'), false);
    assert.deepEqual(capture.eqCalls, [['application_decision_key', envelope.applicationDecisionKey]]);
    assert.equal(LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_DECISION_KEY_COLUMN, 'application_decision_key');
    assert.deepEqual(capture.limitCalls, [2]);
    assert.equal(result.readInvocationCount, 1);
  });

  test('zero-row ambiguity, multiple rows, and malformed wrappers fail closed', async () => {
    const envelope = requireExpectedEnvelope();
    for (const [response, expectedStatus] of [
      [{ data: [], error: null }, 'not-found-or-not-visible'],
      [{ data: [buildPersistedRow(envelope), buildPersistedRow(envelope)], error: null }, 'malformed-response'],
      [{ data: null, error: null }, 'malformed-response'],
      [{ error: null }, 'malformed-response'],
      [null, 'malformed-response'],
    ] as const) {
      const { client } = buildReadClient(response);
      const result = await createLocalModelGovernanceApplicationRecordVerificationRepository(client).verify({
        expectedApplicationEnvelope: envelope,
        explicitVerificationRequested: true,
      });
      assert.equal(result.status, expectedStatus);
      assert.equal(result.recordVerified, false);
    }
  });

  test('exact row verifies with bigint-safe ID, UUID/timestamp validation, and no sensitive exposure', async () => {
    const envelope = requireExpectedEnvelope();
    const row = buildPersistedRow(envelope);
    const before = clone(row);
    const { result } = await verifyWithRow(row, envelope);

    assert.equal(result.status, 'verified');
    assert.equal(result.recordId, '90071992547409930001');
    assert.equal(result.recordVisible, true);
    assert.equal(result.recordVerified, true);
    assert.equal(result.envelopeMatched, true);
    assert.equal(result.immutableFieldsMatched, true);
    assert.equal(result.actorColumnValid, true);
    assert.equal(result.createdAtValid, true);
    assert.equal(result.rawRowExposed, false);
    assert.equal(result.rawErrorExposed, false);
    assert.equal(JSON.stringify(result).includes('123e4567-e89b-42d3-a456-426614174000'), false);
    assert.equal(JSON.stringify(result).includes('2026-07-19T01:00:00.000Z'), false);
    assert.deepEqual(row, before);
  });

  test('strict row shape and positive integer normalization reject malformed rows', async () => {
    const envelope = requireExpectedEnvelope();
    const base = buildPersistedRow(envelope);
    const invalidRows: unknown[] = [
      { ...base, extra: true },
      Object.fromEntries(Object.entries(base).filter(([key]) => key !== 'canonical_outcome')),
      { ...base, id: 0 },
      { ...base, id: -1 },
      { ...base, id: 1.5 },
      { ...base, id: 1e30 },
      { ...base, id: '1e3' },
      { ...base, schema_revision: 0 },
      { ...base, application_policy_revision: '1e0' },
      { ...base, canonical_record_revision: Number.MAX_SAFE_INTEGER + 1 },
      { ...base, application_actor_user_id: 'not-a-uuid' },
      { ...base, created_at: '2026-07-19' },
    ];

    for (const row of invalidRows) {
      const { result } = await verifyWithRow(row, envelope);
      assert.equal(result.status, 'malformed-record');
      assert.equal(result.recordId, null);
    }

    const numeric = await verifyWithRow({ ...base, id: 42 }, envelope);
    assert.equal(numeric.result.recordId, '42');
  });

  test('immutable field and stable JSON mismatches are deterministic and key-order differences pass', async () => {
    const envelope = requireExpectedEnvelope();
    const base = buildPersistedRow(envelope);
    const reversedEnvelope = Object.fromEntries(Object.entries(envelope).reverse());
    const orderOnly = await verifyWithRow({ ...base, application_envelope: reversedEnvelope }, envelope);
    assert.equal(orderOnly.result.status, 'verified');

    const cases: Array<[string, unknown]> = [
      ['governance-application-record-verification-decision-key-mismatch', { ...base, application_decision_key: 'other' }],
      ['governance-application-record-verification-idempotency-key-mismatch', { ...base, application_idempotency_key: 'other' }],
      ['governance-application-record-verification-schema-revision-mismatch', { ...base, schema_revision: 2 }],
      ['governance-application-record-verification-policy-revision-mismatch', { ...base, application_policy_revision: 2 }],
      ['governance-application-record-verification-source-key-mismatch', { ...base, source_governance_persistence_key: 'other' }],
      ['governance-application-record-verification-canonical-key-mismatch', { ...base, canonical_record_key: 'other' }],
      ['governance-application-record-verification-canonical-revision-mismatch', { ...base, canonical_record_revision: 2 }],
      ['governance-application-record-verification-outcome-mismatch', { ...base, canonical_outcome: 'finalized-rejected' }],
      ['governance-application-record-verification-candidate-scope-mismatch', { ...base, candidate_id: 'other' }],
      ['governance-application-record-verification-candidate-scope-mismatch', { ...base, candidate_tier: 'pro' }],
      ['governance-application-record-verification-observed-revision-mismatch', { ...base, observed_revision: 'other' }],
      ['governance-application-record-verification-status-mismatch', { ...base, application_status: 'other' }],
      ['governance-application-record-verification-eligibility-mismatch', { ...base, artifact_selection_review_eligible: false }],
      ['governance-application-record-verification-envelope-mismatch', { ...base, application_envelope: { ...envelope, modelActive: true } }],
    ];
    for (const [issue, row] of cases) {
      const { result } = await verifyWithRow(row, envelope);
      assert.equal(result.status, 'verification-mismatch');
      assert.equal(result.blockers.includes(issue), true);
      assert.equal(result.recordId, null);
    }
  });

  test('database and transport errors are normalized without raw error exposure', async () => {
    const envelope = requireExpectedEnvelope();
    const cases: Array<[unknown, string]> = [
      [{ data: null, error: { code: '28000', message: 'raw', details: 'secret' } }, 'authentication-required'],
      [{ data: null, error: { code: '42501', message: 'raw', hint: 'secret' } }, 'authorization-required'],
      [{ data: null, error: { message: 'network offline' } }, 'transport-unavailable'],
      [{ data: null, error: { code: 'XX000', message: 'raw' } }, 'failed-safe'],
    ];
    for (const [response, status] of cases) {
      const { client } = buildReadClient(response);
      const result = await createLocalModelGovernanceApplicationRecordVerificationRepository(client).verify({
        expectedApplicationEnvelope: envelope,
        explicitVerificationRequested: true,
      });
      assert.equal(result.status, status);
      assert.equal(result.rawErrorExposed, false);
      assert.equal(JSON.stringify(result).includes('secret'), false);
      assert.equal(JSON.stringify(result).includes('network offline'), false);
    }
  });

  test('hostile response and error getters fail closed', async () => {
    const envelope = requireExpectedEnvelope();
    const hostileResponse = Object.defineProperty({}, 'data', {
      enumerable: true,
      get() { throw new Error('hostile'); },
    });
    Object.defineProperty(hostileResponse, 'error', { enumerable: true, value: null });
    const first = buildReadClient(hostileResponse);
    const result = await createLocalModelGovernanceApplicationRecordVerificationRepository(first.client).verify({
      expectedApplicationEnvelope: envelope,
      explicitVerificationRequested: true,
    });
    assert.equal(result.status, 'failed-safe');

    const hostileError = Object.defineProperty({}, 'code', {
      enumerable: true,
      get() { throw new Error('hostile'); },
    });
    const second = buildReadClient({ data: null, error: hostileError });
    const errorResult = await createLocalModelGovernanceApplicationRecordVerificationRepository(second.client).verify({
      expectedApplicationEnvelope: envelope,
      explicitVerificationRequested: true,
    });
    assert.equal(errorResult.status, 'failed-safe');

    const hostileRequest = new Proxy({}, {
      get() { throw new Error('hostile-request'); },
    });
    const requestResult = await createLocalModelGovernanceApplicationRecordVerificationRepository(second.client).verify(
      hostileRequest as never,
    );
    assert.equal(requestResult.status, 'failed-safe');
    assert.equal(JSON.stringify(requestResult).includes('hostile-request'), false);
  });
});

describe('Phase 7.2 artifact-selection review bridge policy', () => {
  test('literal explicit gate, invalid envelope, and incomplete verification fail closed', async () => {
    const envelope = requireExpectedEnvelope();
    const verified = await requireVerifiedResult(envelope);
    const scope = buildLocalModelGovernanceApplicationArtifactSelectionBridgeScope(envelope);

    const notRequested = evaluateLocalModelGovernanceApplicationArtifactSelectionBridge({
      expectedApplicationEnvelope: envelope,
      verificationResult: verified,
      currentScope: scope,
      explicitBridgeRequested: 'true' as unknown as boolean,
      previousBridgeDecision: null,
    });
    assert.equal(notRequested.status, 'not-requested');

    const invalid = evaluateLocalModelGovernanceApplicationArtifactSelectionBridge({
      expectedApplicationEnvelope: { ...envelope, modelActive: true } as LocalModelGovernanceApplicationRecordPersistenceEnvelope,
      verificationResult: verified,
      currentScope: scope,
      explicitBridgeRequested: true,
      previousBridgeDecision: null,
    });
    assert.equal(invalid.status, 'invalid-expected-envelope');

    const incomplete = evaluateLocalModelGovernanceApplicationArtifactSelectionBridge({
      expectedApplicationEnvelope: envelope,
      verificationResult: { status: 'verified' } as typeof verified,
      currentScope: scope,
      explicitBridgeRequested: true,
      previousBridgeDecision: null,
    });
    assert.equal(incomplete.status, 'verification-incomplete');
  });

  test('verification acceptance requires every safety invariant and exact envelope binding', async () => {
    const envelope = requireExpectedEnvelope();
    const verified = await requireVerifiedResult(envelope);
    const scope = buildLocalModelGovernanceApplicationArtifactSelectionBridgeScope(envelope);
    const incompleteCases = [
      { readAttempted: false },
      { readInvocationCount: 0 },
      { recordVisible: false },
      { recordVerified: false },
      { envelopeMatched: false },
      { immutableFieldsMatched: false },
      { actorColumnValid: false },
      { createdAtValid: false },
      { rawRowExposed: true },
      { rawErrorExposed: true },
      { applicationRecordAppliedDownstream: true },
      { bridgeDecisionPersisted: true },
      { artifactSelected: true },
      { modelApproved: true },
    ];
    for (const overrides of incompleteCases) {
      const decision = evaluateLocalModelGovernanceApplicationArtifactSelectionBridge({
        expectedApplicationEnvelope: envelope,
        verificationResult: { ...verified, ...overrides } as typeof verified,
        currentScope: scope,
        explicitBridgeRequested: true,
        previousBridgeDecision: null,
      });
      assert.equal(decision.status, 'verification-incomplete');
    }

    for (const overrides of [
      { applicationDecisionKey: 'other' },
      { applicationIdempotencyKey: 'other' },
      { sourceGovernancePersistenceKey: 'other' },
      { canonicalRecordKey: 'other' },
      { canonicalRecordRevision: 2 },
      { canonicalOutcome: 'finalized-rejected' },
      { candidateId: 'other' },
      { candidateTier: 'pro' },
      { observedRevision: 'other' },
      { schemaRevision: 2 },
      { applicationPolicyRevision: 2 },
      { applicationStatus: 'other' },
      { artifactSelectionReviewEligible: false },
    ]) {
      const decision = evaluateLocalModelGovernanceApplicationArtifactSelectionBridge({
        expectedApplicationEnvelope: envelope,
        verificationResult: { ...verified, ...overrides } as typeof verified,
        currentScope: scope,
        explicitBridgeRequested: true,
        previousBridgeDecision: null,
      });
      assert.equal(decision.status, 'stale-application-record');
      assert.equal(decision.staleApplicationRecordDetected, true);
    }
  });

  test('scope and bridge key are deterministic, scope-bound, and contain no actor, time, random, or artifact identity', () => {
    const envelope = requireExpectedEnvelope();
    const scope = buildLocalModelGovernanceApplicationArtifactSelectionBridgeScope(envelope);
    const second = buildLocalModelGovernanceApplicationArtifactSelectionBridgeScope(envelope);
    assert.deepEqual(scope, second);
    assert.equal(scope.artifactSelectionBridgePolicyRevision, 1);

    const key = buildLocalModelGovernanceApplicationArtifactSelectionBridgeDecisionKey(scope);
    assert.equal(
      key,
      `local-model-artifact-selection-review:${candidateId}:${observedRevision}:${applicationDecisionKey}:bridge-policy-revision-1`,
    );
    assert.equal(/actor|timestamp|random|artifactId|file|url|checksum/i.test(key), false);
    assert.notEqual(buildLocalModelGovernanceApplicationArtifactSelectionBridgeDecisionKey({ ...scope, candidateId: 'other' }), key);
    assert.notEqual(buildLocalModelGovernanceApplicationArtifactSelectionBridgeDecisionKey({ ...scope, observedRevision: 'other' }), key);
    assert.notEqual(buildLocalModelGovernanceApplicationArtifactSelectionBridgeDecisionKey({ ...scope, applicationDecisionKey: 'other' }), key);
    assert.notEqual(buildLocalModelGovernanceApplicationArtifactSelectionBridgeDecisionKey({ ...scope, artifactSelectionBridgePolicyRevision: 2 }), key);
  });

  test('current scope mismatches are classified deterministically', async () => {
    const envelope = requireExpectedEnvelope();
    const verified = await requireVerifiedResult(envelope);
    const scope = buildLocalModelGovernanceApplicationArtifactSelectionBridgeScope(envelope);
    const cases: Array<[Record<string, unknown>, string]> = [
      [{ candidateId: 'other' }, 'candidate-scope-mismatch'],
      [{ candidateTier: 'pro' }, 'candidate-scope-mismatch'],
      [{ observedRevision: 'other' }, 'revision-mismatch'],
      [{ applicationRecordSchemaRevision: 2 }, 'revision-mismatch'],
      [{ applicationPolicyRevision: 2 }, 'revision-mismatch'],
      [{ canonicalRecordRevision: 2 }, 'revision-mismatch'],
      [{ artifactSelectionBridgePolicyRevision: 2 }, 'revision-mismatch'],
      [{ sourceGovernancePersistenceKey: 'other' }, 'stale-application-record'],
      [{ canonicalRecordKey: 'other' }, 'stale-application-record'],
      [{ canonicalOutcome: 'finalized-rejected' }, 'stale-application-record'],
      [{ applicationDecisionKey: 'other' }, 'stale-application-record'],
      [{ applicationIdempotencyKey: 'other' }, 'stale-application-record'],
    ];
    for (const [overrides, status] of cases) {
      const decision = evaluateLocalModelGovernanceApplicationArtifactSelectionBridge({
        expectedApplicationEnvelope: envelope,
        verificationResult: verified,
        currentScope: { ...scope, ...overrides } as typeof scope,
        explicitBridgeRequested: true,
        previousBridgeDecision: null,
      });
      assert.equal(decision.status, status);
      assert.equal(decision.bridgeEligible, false);
    }
  });

  test('eligible decision has review-only semantics and preserves all downstream safety flags', async () => {
    const envelope = requireExpectedEnvelope();
    const verificationResult = await requireVerifiedResult(envelope);
    const beforeEnvelope = clone(envelope);
    const beforeVerification = clone(verificationResult);
    const currentScope = buildLocalModelGovernanceApplicationArtifactSelectionBridgeScope(envelope);
    const beforeScope = clone(currentScope);

    const decision = evaluateLocalModelGovernanceApplicationArtifactSelectionBridge({
      expectedApplicationEnvelope: envelope,
      verificationResult,
      currentScope,
      explicitBridgeRequested: true,
      previousBridgeDecision: null,
    });

    assert.equal(decision.status, 'eligible-for-artifact-selection-review');
    assert.equal(decision.bridgeEligible, true);
    assert.equal(decision.applicationRecordVerified, true);
    assert.equal(decision.artifactSelectionReviewEligible, true);
    assert.equal(decision.bridgeDecisionPersisted, false);
    assert.equal(decision.applicationRecordAppliedDownstream, false);
    assert.equal(decision.artifactSelected, false);
    assert.equal(decision.artifactApproved, false);
    assert.equal(decision.modelApproved, false);
    assert.equal(decision.licenseApproved, false);
    assert.equal(decision.checksumVerified, false);
    assert.equal(decision.benchmarkVerified, false);
    assert.equal(decision.downloadable, false);
    assert.equal(decision.runtimeReady, false);
    assert.equal(decision.modelActive, false);
    assert.equal(JSON.stringify(decision).includes('123e4567'), false);
    assert.deepEqual(envelope, beforeEnvelope);
    assert.deepEqual(verificationResult, beforeVerification);
    assert.deepEqual(currentScope, beforeScope);
  });

  test('identical previous decision is replay-safe and conflicting or foreign decisions fail closed', async () => {
    const current = await buildEligibleBridgeDecision();
    const envelope = requireExpectedEnvelope();
    const verificationResult = await requireVerifiedResult(envelope);
    const scope = buildLocalModelGovernanceApplicationArtifactSelectionBridgeScope(envelope);
    const previousBefore = clone(current);

    const replay = evaluateLocalModelGovernanceApplicationArtifactSelectionBridge({
      expectedApplicationEnvelope: envelope,
      verificationResult,
      currentScope: scope,
      explicitBridgeRequested: true,
      previousBridgeDecision: current,
    });
    assert.equal(replay.status, 'eligible-for-artifact-selection-review');
    assert.equal(replay.replayDetected, true);
    assert.equal(replay.warnings.includes('governance-application-artifact-bridge-identical-existing-decision'), true);
    assert.equal(replay.bridgeDecisionPersisted, false);
    assert.deepEqual(current, previousBefore);

    for (const previous of [
      { ...current, canonicalRecordKey: 'other' },
      { ...current, bridgeDecisionKey: 'other' },
    ]) {
      const conflict = evaluateLocalModelGovernanceApplicationArtifactSelectionBridge({
        expectedApplicationEnvelope: envelope,
        verificationResult,
        currentScope: scope,
        explicitBridgeRequested: true,
        previousBridgeDecision: previous,
      });
      assert.equal(conflict.status, 'previous-decision-conflict');
      assert.equal(conflict.replayDetected, true);
      assert.equal(conflict.bridgeEligible, false);
    }
  });

  test('hostile runtime inputs fail closed without raw input exposure', () => {
    const envelope = requireExpectedEnvelope();
    const hostile = new Proxy({}, {
      get() { throw new Error('actor-secret'); },
    });
    const decision = evaluateLocalModelGovernanceApplicationArtifactSelectionBridge({
      expectedApplicationEnvelope: envelope,
      verificationResult: hostile as never,
      currentScope: hostile as never,
      explicitBridgeRequested: true,
      previousBridgeDecision: null,
    });
    assert.equal(decision.status, 'failed-safe');
    assert.equal(JSON.stringify(decision).includes('actor-secret'), false);

    const hostileRequest = new Proxy({}, {
      get() { throw new Error('request-secret'); },
    });
    const requestDecision = evaluateLocalModelGovernanceApplicationArtifactSelectionBridge(
      hostileRequest as never,
    );
    assert.equal(requestDecision.status, 'failed-safe');
    assert.equal(JSON.stringify(requestDecision).includes('request-secret'), false);
  });
});

describe('Phase 7.2 view model, readiness, package, baseline scope, and security', () => {
  test('view model is honest and all production counters remain zero', () => {
    const viewModel = buildLocalModelGovernanceApplicationArtifactSelectionBridgeViewModel();
    assert.equal(viewModel.heading, 'Phase 7.2 Verified Governance Application Record to Artifact Selection Review Bridge');
    assert.equal(viewModel.aggregate.persistedApplicationVerificationBoundaryAuthored, true);
    assert.equal(viewModel.aggregate.artifactSelectionReviewBridgeAuthored, true);
    for (const key of [
      'automaticReads', 'automaticBridges', 'explicitProductionReadAttempts',
      'explicitProductionBridgeAttempts', 'productionReadInvocations',
      'verifiedApplicationRecords', 'eligibleBridgeDecisions', 'replayedBridgeDecisions',
      'staleApplicationRecords', 'persistedBridgeDecisions', 'recordsAppliedDownstream',
      'artifactSelectionReviewsEligible', 'selectedArtifacts', 'approvedArtifacts',
      'approvedModels', 'approvedLicenses', 'checksumsVerified', 'benchmarksPassed',
      'downloadableArtifacts', 'runtimeReadyArtifacts', 'activeModels',
    ] as const) {
      assert.equal(viewModel.aggregate[key], 0, key);
    }
    const copy = JSON.stringify(viewModel);
    assert.match(copy, /explicit/i);
    assert.match(copy, /forced RLS|RLS/i);
    assert.match(copy, /not found or not visible|zero visible rows/i);
    assert.match(copy, /stale/i);
    assert.match(copy, /review/i);
    assert.doesNotMatch(copy, /production application record (?:is|was) verified/i);
    assert.match(copy, /No artifact is selected or approved/i);
    assert.match(copy, /No model is active/i);
  });

  test('readiness shell keeps Phase 7.1, adds a read-only Phase 7.2 card, and package preserves registrations', () => {
    const shell = readFileSync(shellPath, 'utf8');
    assert.match(shell, /Phase 7\.1 Authoritative governance application record/);
    assert.match(shell, /Phase 7\.2 Verified application record to artifact-selection review bridge/);
    assert.match(shell, /buildLocalModelGovernanceApplicationArtifactSelectionBridgeViewModel/);
    const phase72Slice = shell.slice(shell.indexOf('Phase 7.2 Verified application record'));
    assert.doesNotMatch(phase72Slice, /<button|onClick|useEffect|\.rpc\(|\.from\(|verifyLocalModel|evaluateLocalModel/);

    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8')) as { scripts: Record<string, string> };
    for (const scriptName of ['test', 'test:platform']) {
      const script = packageJson.scripts[scriptName];
      assert.match(script, /localModelGovernanceApplicationArtifactSelectionBridge\.test\.ts/);
      assert.match(script, /localModelGovernanceApplicationRecordPersistence\.test\.ts/);
      assert.match(script, /localModelGovernancePhase6Closeout\.test\.ts/);
      assert.match(script, /localModelGovernancePersistedRecordVerificationRepository\.test\.ts/);
    }
  });

  test('baseline protected files remain present and Phase 7.2 creates no migration or client changes', () => {
    for (const path of [
      phase71MigrationPath,
      phase71PolicyPath,
      supabaseClientPath,
      approvalRegistryPath,
      candidateRegistryPath,
      artifactManifestPath,
      artifactEvidencePath,
    ]) {
      assert.equal(existsSync(path), true, path);
    }
    const docs = readFileSync(join(root, 'docs/ai/phase-7-verified-governance-application-artifact-selection-bridge.md'), 'utf8');
    assert.match(docs, /no migration|does not create a migration/i);
    assert.match(docs, /no RPC|does not create an RPC/i);
    assert.match(docs, /not-found-or-not-visible/i);
  });

  test('production TypeScript passes focused security scans and only repository performs direct reads', () => {
    const productionFiles = [
      'src/platform/ai/localModelGovernanceApplicationArtifactSelectionBridgeTypes.ts',
      'src/platform/ai/localModelGovernanceApplicationRecordVerificationRepository.ts',
      'src/platform/ai/localModelGovernanceApplicationArtifactSelectionBridgePolicy.ts',
      'src/platform/ai/localModelGovernanceApplicationArtifactSelectionBridgeViewModel.ts',
    ];
    const sources = productionFiles.map((path) => [path, readFileSync(join(root, path), 'utf8')] as const);
    const forbidden = [
      /service[_-]?role[_-]?(?:key|secret)/i,
      /https:\/\/[^\s'\"]*supabase/i,
      /anon[_-]?key/i,
      /access[_-]?token|refresh[_-]?token|jwt[_-]?secret|database[_-]?url|password/i,
      /document\.cookie|createClient|auth\.getSession|auth\.getUser|user_metadata/i,
      /\.rpc\s*\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(/,
      /localStorage|sessionStorage|IndexedDB|CacheStorage|setTimeout|setInterval/i,
      /Date\.now|new Date\s*\(|Math\.random|crypto\.randomUUID|console\.log/i,
      /\bretry\b|\bbackoff\b|\bpolling\b|\bqueue\b|AIService/i,
    ];
    for (const [path, source] of sources) {
      for (const pattern of forbidden) assert.doesNotMatch(source, pattern, `${path}: ${pattern}`);
      if (!path.endsWith('VerificationRepository.ts')) {
        assert.doesNotMatch(source, /\.from\s*\(|\.select\s*\(|\.eq\s*\(|\.limit\s*\(/, path);
      }
    }
    const repositorySource = sources.find(([path]) => path.endsWith('VerificationRepository.ts'))?.[1] ?? '';
    assert.match(repositorySource, /\.from\s*\(/);
    assert.match(repositorySource, /\.select\s*\(/);
    assert.match(repositorySource, /\.eq\s*\(/);
    assert.match(repositorySource, /\.limit\s*\(2\)/);
    assert.doesNotMatch(repositorySource, /\.single\s*\(|\.maybeSingle\s*\(/);
  });
});
