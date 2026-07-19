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
import type {
  LocalModelGovernanceReviewWorkspaceInput,
} from '../../src/platform/ai/localModelGovernanceReviewWorkspaceTypes.ts';
import {
  buildLocalModelGovernanceRecordPersistenceEnvelope,
  validateLocalModelGovernanceRecordPersistenceEnvelope,
} from '../../src/platform/ai/localModelGovernanceRecordPersistencePolicy.ts';
import type {
  LocalModelGovernanceRecordPersistenceEnvelope,
} from '../../src/platform/ai/localModelGovernanceRecordPersistenceTypes.ts';
import {
  LOCAL_MODEL_GOVERNANCE_PERSISTENCE_APPEND_RPC_NAME,
  appendLocalModelGovernanceRecord,
  createLocalModelGovernancePersistenceRepository,
  createUnavailableLocalModelGovernancePersistenceRepository,
} from '../../src/platform/ai/localModelGovernancePersistenceRepository.ts';
import type {
  LocalModelGovernancePersistenceRepositoryRequest,
  LocalModelGovernancePersistenceRpcClient,
} from '../../src/platform/ai/localModelGovernancePersistenceRepositoryTypes.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
const REQUIREMENTS = [
  'tokenizer-license-scope',
  'acceptable-use-scope',
  'derived-artifact-hosting',
  'quantization-conversion',
] as const;

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8');
}

function externalAssertion(): LocalModelExternalTrustedActorAssertion {
  return {
    actorSubjectId: 'opaque:reviewer-001',
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

function clientReturning(
  response: { readonly data: unknown; readonly error: unknown },
  calls: Array<{ readonly functionName: string; readonly args: Readonly<Record<string, unknown>> }>,
): LocalModelGovernancePersistenceRpcClient {
  return {
    rpc(functionName, args) {
      calls.push({ functionName, args });
      return Promise.resolve(response);
    },
  };
}

function request(
  envelope = validEnvelope(),
  explicitActionRequested: boolean = true,
): LocalModelGovernancePersistenceRepositoryRequest {
  return { envelope, explicitActionRequested };
}

function successRow(
  envelope: LocalModelGovernanceRecordPersistenceEnvelope,
  status: 'inserted' | 'identical-existing-envelope' = 'inserted',
  recordId: number | string = '9223372036854775807',
): Readonly<Record<string, unknown>> {
  return {
    result_status: status,
    record_id: recordId,
    persistence_key: envelope.persistenceKey,
  };
}

function assertSafetyFlags(result: Awaited<ReturnType<typeof appendLocalModelGovernanceRecord>>): void {
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

describe('Phase 6.6 typed governance persistence repository', () => {
  it('does not invoke RPC on module import, unavailable repository, or a closed explicit-action gate', async () => {
    const calls: Array<{ functionName: string; args: Readonly<Record<string, unknown>> }> = [];
    const client = clientReturning({ data: [successRow(validEnvelope())], error: null }, calls);
    assert.equal(calls.length, 0);

    const unavailable = await appendLocalModelGovernanceRecord(
      createUnavailableLocalModelGovernancePersistenceRepository(),
      request(),
    );
    assert.equal(unavailable.status, 'repository-unavailable');
    assert.equal(unavailable.rpcAttempted, false);
    assert.equal(unavailable.rpcInvocationCount, 0);

    const available = createLocalModelGovernancePersistenceRepository(client);
    const notRequested = await appendLocalModelGovernanceRecord(available, request(validEnvelope(), false));
    assert.equal(notRequested.status, 'not-requested');
    assert.equal(notRequested.rpcAttempted, false);
    assert.equal(notRequested.rpcInvocationCount, 0);

    const malformedGate = await appendLocalModelGovernanceRecord(available, {
      envelope: validEnvelope(),
      explicitActionRequested: 'true',
    } as never);
    assert.equal(malformedGate.status, 'not-requested');
    assert.equal(calls.length, 0);
  });

  it('reuses the Phase 6.4 validator and blocks invalid envelopes before RPC', async () => {
    const envelope = validEnvelope();
    const invalid = { ...envelope, operation: 'update' } as never;
    const expectedIssues = validateLocalModelGovernanceRecordPersistenceEnvelope(invalid).issues;
    const calls: Array<{ functionName: string; args: Readonly<Record<string, unknown>> }> = [];
    const repository = createLocalModelGovernancePersistenceRepository(
      clientReturning({ data: [successRow(envelope)], error: null }, calls),
    );
    const result = await appendLocalModelGovernanceRecord(repository, request(invalid));
    assert.equal(result.status, 'invalid-envelope');
    assert.deepEqual(result.blockers, expectedIssues);
    assert.equal(result.envelopeValid, false);
    assert.equal(result.rpcAttempted, false);
    assert.equal(calls.length, 0);
  });

  it('invokes only the exact append RPC once with only p_envelope and never mutates the envelope', async () => {
    const envelope = validEnvelope();
    const before = structuredClone(envelope);
    const calls: Array<{ functionName: string; args: Readonly<Record<string, unknown>> }> = [];
    const repository = createLocalModelGovernancePersistenceRepository(
      clientReturning({ data: [successRow(envelope)], error: null }, calls),
    );
    const result = await appendLocalModelGovernanceRecord(repository, request(envelope));
    assert.equal(result.status, 'inserted');
    assert.equal(result.rpcAttempted, true);
    assert.equal(result.rpcInvocationCount, 1);
    assert.equal(calls.length, 1);
    assert.equal(calls[0]!.functionName, LOCAL_MODEL_GOVERNANCE_PERSISTENCE_APPEND_RPC_NAME);
    assert.equal(calls[0]!.functionName, 'append_local_model_governance_record');
    assert.deepEqual(Object.keys(calls[0]!.args), ['p_envelope']);
    assert.equal(calls[0]!.args.p_envelope, envelope);
    assert.equal('actorId' in calls[0]!.args, false);
    assert.equal('actorRole' in calls[0]!.args, false);
    assert.equal('permission' in calls[0]!.args, false);
    assert.equal('accessToken' in calls[0]!.args, false);
    assert.equal('session' in calls[0]!.args, false);
    assert.deepEqual(envelope, before);
    assertSafetyFlags(result);
  });

  it('normalizes inserted and identical-existing-envelope acknowledgements without precision loss', async () => {
    const envelope = validEnvelope();
    for (const [status, recordId, inserted, existing] of [
      ['inserted', 42, true, false],
      ['identical-existing-envelope', '9223372036854775807', false, true],
    ] as const) {
      const calls: Array<{ functionName: string; args: Readonly<Record<string, unknown>> }> = [];
      const repository = createLocalModelGovernancePersistenceRepository(
        clientReturning({ data: [successRow(envelope, status, recordId)], error: null }, calls),
      );
      const result = await appendLocalModelGovernanceRecord(repository, request(envelope));
      assert.equal(result.status, status);
      assert.equal(result.rpcInvocationCount, 1);
      assert.equal(result.newRecordInserted, inserted);
      assert.equal(result.existingRecordConfirmed, existing);
      assert.equal(result.persistenceAcknowledged, true);
      assert.equal(result.recordId, String(recordId));
      assert.equal(result.persistenceKey, envelope.persistenceKey);
      assertSafetyFlags(result);
    }
  });

  it('rejects unsafe record IDs, key mismatches, and malformed result shapes without retry', async () => {
    const envelope = validEnvelope();
    const malformedRows: readonly unknown[] = [
      [successRow(envelope, 'inserted', 0)],
      [successRow(envelope, 'inserted', -1)],
      [successRow(envelope, 'inserted', 1.5)],
      [successRow(envelope, 'inserted', '1e3')],
      [successRow(envelope, 'inserted', '1.0')],
      [successRow(envelope, 'inserted', Number.MAX_SAFE_INTEGER + 2)],
      [{ ...successRow(envelope), persistence_key: 'mismatch' }],
      [],
      [successRow(envelope), successRow(envelope)],
      null,
      [{ ...successRow(envelope), result_status: 'unknown' }],
      [{ result_status: 'inserted', record_id: '1' }],
      [{ ...successRow(envelope), extra: true }],
    ];
    for (const data of malformedRows) {
      const calls: Array<{ functionName: string; args: Readonly<Record<string, unknown>> }> = [];
      const result = await appendLocalModelGovernanceRecord(
        createLocalModelGovernancePersistenceRepository(clientReturning({ data, error: null }, calls)),
        request(envelope),
      );
      assert.equal(result.status, 'malformed-response');
      assert.equal(result.persistenceAcknowledged, false);
      assert.equal(result.recordId, null);
      assert.equal(result.rpcInvocationCount, 1);
      assert.equal(calls.length, 1);
      assertSafetyFlags(result);
    }
  });

  it('accepts a strict direct-row wrapper while preserving the same response contract', async () => {
    const envelope = validEnvelope();
    const row = successRow(envelope, 'inserted', '7');
    const result = await appendLocalModelGovernanceRecord(
      createLocalModelGovernancePersistenceRepository(clientReturning({ data: row, error: null }, [])),
      request(envelope),
    );
    assert.equal(result.status, 'inserted');
    assert.equal(result.recordId, '7');
  });

  it('normalizes known database errors and never exposes raw error fields', async () => {
    const envelope = validEnvelope();
    const cases = [
      [{ code: '28000', message: 'governance-persistence-authentication-required', details: 'secret', hint: 'secret' }, 'authentication-required'],
      [{ code: '42501', message: 'governance-persistence-authorization-required', details: 'secret' }, 'authorization-required'],
      [{ code: '23505', message: 'governance-persistence-conflicting-duplicate', stack: 'secret' }, 'conflicting-duplicate'],
      [{ code: '22023', message: 'governance-persistence-envelope-fields-invalid', details: 'secret' }, 'database-validation-rejected'],
      [{ code: '55000', message: 'local-model-governance-records-immutable' }, 'failed-safe'],
      [{ code: 'XX000', message: 'unknown-database-error', details: 'secret' }, 'failed-safe'],
      [{ message: 'network unavailable', details: 'secret' }, 'transport-unavailable'],
      [{}, 'failed-safe'],
      ['malformed', 'failed-safe'],
    ] as const;
    for (const [error, expectedStatus] of cases) {
      const calls: Array<{ functionName: string; args: Readonly<Record<string, unknown>> }> = [];
      const result = await appendLocalModelGovernanceRecord(
        createLocalModelGovernancePersistenceRepository(clientReturning({ data: null, error }, calls)),
        request(envelope),
      );
      assert.equal(result.status, expectedStatus);
      assert.equal(result.rpcInvocationCount, 1);
      assert.equal(calls.length, 1);
      assert.equal(result.persistenceAcknowledged, false);
      assert.equal('error' in result, false);
      assert.equal('details' in result, false);
      assert.equal('hint' in result, false);
      assert.equal('stack' in result, false);
      assert.doesNotMatch(JSON.stringify(result), /secret|network unavailable|unknown-database-error/);
      assertSafetyFlags(result);
    }
  });

  it('normalizes rejected RPC promises as transport unavailable and never retries', async () => {
    let calls = 0;
    const client: LocalModelGovernancePersistenceRpcClient = {
      rpc() {
        calls += 1;
        return Promise.reject(new Error('private transport failure'));
      },
    };
    const result = await appendLocalModelGovernanceRecord(
      createLocalModelGovernancePersistenceRepository(client),
      request(),
    );
    assert.equal(result.status, 'transport-unavailable');
    assert.equal(result.rpcInvocationCount, 1);
    assert.equal(calls, 1);
    assert.doesNotMatch(JSON.stringify(result), /private transport failure/);
  });

  it('contains no forbidden transport, mutation, storage, secret, logging, AI, or retry behavior', () => {
    const source = [
      read('src/platform/ai/localModelGovernancePersistenceRepositoryTypes.ts'),
      read('src/platform/ai/localModelGovernancePersistenceRepository.ts'),
      read('src/platform/ai/localModelGovernancePersistenceRepositoryViewModel.ts'),
    ].join('\n');
    for (const pattern of [
      /service[_-]?role/i,
      /https?:\/\//i,
      /anon[_-]?key/i,
      /accessToken|refreshToken|rawJwt|password|document\.cookie/i,
      /localStorage|sessionStorage|indexedDB|CacheStorage/i,
      /fetch\s*\(|axios/i,
      /\.from\s*\(\s*['"]local_model_governance_records/i,
      /\.(?:update|delete|upsert)\s*\(/i,
      /setTimeout|Math\.random|Date\.now|crypto\.randomUUID/i,
      /console\.log/i,
      /AIService|model download|runtime initialization|inference/i,
    ]) assert.doesNotMatch(source, pattern);
    assert.doesNotMatch(source, /for\s*\([^)]*;[^)]*;[^)]*\)|while\s*\(|retry|backoff|queue/i);
  });
});
