import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from '../../src/platform/ai/localModelArtifactManifest.ts';
import { buildLocalModelGovernanceBenchmarkCloseout } from '../../src/platform/ai/localModelGovernanceBenchmarkCloseout.ts';
import { buildCurrentLocalModelGovernanceDecisionRecordResults } from '../../src/platform/ai/localModelGovernanceDecisionRecordPolicy.ts';
import {
  LOCAL_MODEL_EXTERNAL_AUTH_ASSERTION_REVISION,
  LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION,
  LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE,
  LOCAL_MODEL_TRUSTED_ACTOR_CONTEXT_ADAPTER_POLICY_REVISION,
  buildCurrentLocalModelTrustedActorContextAdapterResult,
  buildLocalModelTrustedActorAssertionScope,
  evaluateLocalModelTrustedActorContextAdapter,
} from '../../src/platform/ai/localModelTrustedActorContextAdapter.ts';
import type { LocalModelExternalTrustedActorAssertion } from '../../src/platform/ai/localModelTrustedActorContextAdapterTypes.ts';
import {
  applyLocalModelGovernanceReviewWorkspaceEvent,
  buildCurrentLocalModelGovernanceReviewWorkspaceResults,
  buildLocalModelGovernanceReviewWorkspaceScope,
  createLockedLocalModelGovernanceReviewWorkspaceInput,
  evaluateLocalModelGovernanceReviewWorkspace,
} from '../../src/platform/ai/localModelGovernanceReviewWorkspacePolicy.ts';
import type {
  LocalModelGovernanceReviewWorkspaceInput,
  LocalModelGovernanceReviewWorkspaceResult,
} from '../../src/platform/ai/localModelGovernanceReviewWorkspaceTypes.ts';
import {
  LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_POLICY_REVISION,
  LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_SCHEMA_REVISION,
  buildCurrentLocalModelGovernanceRecordPersistenceResults,
  buildLocalModelGovernanceRecordIdempotencyKey,
  buildLocalModelGovernanceRecordPersistenceEnvelope,
  buildLocalModelGovernanceRecordPersistenceKey,
  buildLocalModelGovernanceRecordPersistenceScope,
  compareLocalModelGovernancePersistenceEnvelope,
  createAwaitingLocalModelGovernanceRecordPersistenceInput,
  evaluateLocalModelGovernanceRecordPersistence,
  isSameLocalModelGovernancePersistenceEnvelope,
  isSameLocalModelGovernancePersistenceScope,
  listCurrentLocalModelGovernanceRecordPersistenceResults,
  validateLocalModelGovernanceRecordPersistenceEnvelope,
  validateLocalModelGovernanceRecordPersistenceInput,
} from '../../src/platform/ai/localModelGovernanceRecordPersistencePolicy.ts';
import type {
  LocalModelGovernanceRecordPersistenceEnvelope,
  LocalModelGovernanceRecordPersistenceInput,
} from '../../src/platform/ai/localModelGovernanceRecordPersistenceTypes.ts';

const REQUIREMENTS = [
  'tokenizer-license-scope',
  'acceptable-use-scope',
  'derived-artifact-hosting',
  'quantization-conversion',
] as const;

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

function finalizedWorkspace(
  outcome: 'proceed' | 'rejected' | 'more-evidence' = 'proceed',
  candidateId = 'qwen3-0-6b-candidate',
): LocalModelGovernanceReviewWorkspaceResult {
  const assertion = externalAssertion();
  const adapterResult = evaluateLocalModelTrustedActorContextAdapter({
    assertion,
    previousAssertionScope: null,
    previouslyInvalidated: false,
    adapterPolicyRevision: LOCAL_MODEL_TRUSTED_ACTOR_CONTEXT_ADAPTER_POLICY_REVISION,
  });
  const actorAssertionScope = buildLocalModelTrustedActorAssertionScope(assertion);
  const base = createLockedLocalModelGovernanceReviewWorkspaceInput(candidateId);
  const currentScope = buildLocalModelGovernanceReviewWorkspaceScope(candidateId, adapterResult, actorAssertionScope);
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
  for (const [index, requirementId] of REQUIREMENTS.entries()) {
    const decision = outcome === 'rejected' && index === 0
      ? 'reject'
      : outcome === 'more-evidence' && index === 0
        ? 'request-more-evidence'
        : 'proceed';
    state = applyLocalModelGovernanceReviewWorkspaceEvent(state, {
      type: 'set-decision',
      requirementId,
      decision,
    });
  }
  state = applyLocalModelGovernanceReviewWorkspaceEvent(state, { type: 'request-finalize' });
  const result = evaluateLocalModelGovernanceReviewWorkspace(state);
  assert.ok(result.finalizedRecord);
  return result;
}

function persistenceInput(
  outcome: 'proceed' | 'rejected' | 'more-evidence' = 'proceed',
  candidateId = 'qwen3-0-6b-candidate',
): LocalModelGovernanceRecordPersistenceInput {
  const workspaceResult = finalizedWorkspace(outcome, candidateId);
  const finalizedRecord = workspaceResult.finalizedRecord!;
  const currentRecordScope = buildLocalModelGovernanceRecordPersistenceScope(finalizedRecord);
  return {
    candidateId: finalizedRecord.candidateId,
    candidateTier: finalizedRecord.candidateTier,
    workspaceResult,
    finalizedRecord,
    currentRecordScope,
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

function mutateRecord(
  input: LocalModelGovernanceRecordPersistenceInput,
  patch: Record<string, unknown>,
): LocalModelGovernanceRecordPersistenceInput {
  return { ...input, finalizedRecord: { ...input.finalizedRecord!, ...patch } as never };
}

describe('Phase 6.4 governance record persistence contract policy', () => {
  it('builds exactly three production contracts awaiting finalized records', () => {
    const results = buildCurrentLocalModelGovernanceRecordPersistenceResults();
    assert.deepEqual(results, listCurrentLocalModelGovernanceRecordPersistenceResults());
    assert.equal(results.length, 3);
    assert.deepEqual(results.map((item) => item.candidateId), [
      'qwen3-0-6b-candidate',
      'qwen3-1-7b-candidate',
      'qwen3-4b-candidate',
    ]);
    assert.deepEqual(results.map((item) => item.candidateTier), ['light', 'standard', 'pro']);
    assert.equal(results.some((item) => item.candidateTier === ('ultra-low' as never)), false);
    for (const result of results) {
      assert.equal(result.status, 'awaiting-finalized-record');
      assert.equal(result.finalizedRecordPresent, false);
      assert.equal(result.persistenceEnvelope, null);
      assert.equal(result.persistenceRequestReady, false);
      assert.equal(result.persistenceAttempted, false);
      assert.equal(result.repositoryWritePerformed, false);
      assert.equal(result.recordPersisted, false);
      assert.equal(result.recordAppliedDownstream, false);
      assert.equal(result.modelActive, false);
    }
  });

  it('keeps Phase 5 closeout and Phase 6.1-6.3 production states unchanged', () => {
    const closeout = buildLocalModelGovernanceBenchmarkCloseout();
    const phase61 = buildCurrentLocalModelGovernanceDecisionRecordResults();
    const phase62 = buildCurrentLocalModelTrustedActorContextAdapterResult();
    const phase63 = buildCurrentLocalModelGovernanceReviewWorkspaceResults();
    assert.equal(closeout.status, 'foundation-complete');
    assert.equal(closeout.productionBlockedSafe, true);
    assert.equal(phase61.filter((item) => item.canonicalRecord !== null).length, 0);
    assert.equal(phase62.status, 'unavailable');
    assert.equal(phase62.mappedTrustedActorContext, null);
    assert.equal(phase63.length, 3);
    assert.equal(phase63.every((item) => item.status === 'locked-no-trusted-context'), true);
    assert.equal(phase63.filter((item) => item.canonicalRecordFinalized).length, 0);
    assert.equal(phase63.filter((item) => item.recordPersisted).length, 0);
  });

  it('does not crash or create an envelope without a finalized record', () => {
    const input = createAwaitingLocalModelGovernanceRecordPersistenceInput('qwen3-0-6b-candidate');
    const result = evaluateLocalModelGovernanceRecordPersistence(input);
    assert.equal(result.status, 'awaiting-finalized-record');
    assert.equal(result.finalizedRecordPresent, false);
    assert.equal(result.persistenceEnvelope, null);
    assert.equal(result.duplicateState, 'unchecked');
    assert.equal(result.canProceedToRepositoryHandoffReview, false);
  });

  it('accepts proceed, rejected, and more-evidence canonical audit outcomes without changing them', () => {
    const expected = {
      proceed: 'finalized-proceed',
      rejected: 'finalized-rejected',
      'more-evidence': 'finalized-more-evidence',
    } as const;
    for (const outcome of Object.keys(expected) as Array<keyof typeof expected>) {
      const input = persistenceInput(outcome);
      const before = structuredClone(input);
      const result = evaluateLocalModelGovernanceRecordPersistence(input);
      assert.deepEqual(input, before);
      assert.equal(result.status, 'persistence-request-ready');
      assert.equal(result.persistenceRequestReady, true);
      assert.equal(result.persistenceEnvelope?.canonicalOutcome, expected[outcome]);
      assert.equal(result.persistenceEnvelope?.canonicalRecord.outcome, outcome);
      assert.equal(result.canProceedToRepositoryHandoffReview, true);
      assert.equal(result.persistenceAttempted, false);
      assert.equal(result.repositoryWritePerformed, false);
      assert.equal(result.recordPersisted, false);
      assert.equal(result.recordSigned, false);
      assert.equal(result.recordAppliedDownstream, false);
      assert.equal(result.modelApproved, false);
      assert.equal(result.licenseApproved, false);
      assert.equal(result.artifactSelected, false);
      assert.equal(result.artifactApproved, false);
      assert.equal(result.downloadable, false);
      assert.equal(result.runtimeReady, false);
      assert.equal(result.modelActive, false);
    }
  });

  it('builds an allowlisted append-only immutable envelope without generating a timestamp', () => {
    const input = persistenceInput();
    const record = input.finalizedRecord!;
    const envelope = buildLocalModelGovernanceRecordPersistenceEnvelope(record);
    assert.deepEqual(Object.keys(envelope).sort(), [
      'appendOnly','canonicalOutcome','canonicalRecord','canonicalRecordKey','canonicalRecordRevision',
      'candidateId','candidateTier','clientDeleteAllowed','clientOverwriteAllowed','createdFromReviewedAt',
      'deleteAllowed','duplicatePolicy','idempotencyKey','immutable','operation','persistenceBoundaryOnly',
      'persistenceKey','policyRevision','schemaRevision','updateAllowed',
    ].sort());
    assert.equal(envelope.operation, 'append');
    assert.equal(envelope.immutable, true);
    assert.equal(envelope.appendOnly, true);
    assert.equal(envelope.updateAllowed, false);
    assert.equal(envelope.deleteAllowed, false);
    assert.equal(envelope.clientDeleteAllowed, false);
    assert.equal(envelope.clientOverwriteAllowed, false);
    assert.equal(envelope.createdFromReviewedAt, record.reviewedAt);
    assert.equal('createdAt' in envelope, false);
    assert.equal('serverTimestamp' in envelope, false);
    assert.equal(validateLocalModelGovernanceRecordPersistenceEnvelope(envelope).valid, true);
  });

  it('builds deterministic logical persistence and idempotency keys without actor or review time', () => {
    const record = persistenceInput().finalizedRecord!;
    const persistenceKey = buildLocalModelGovernanceRecordPersistenceKey(record);
    const idempotencyKey = buildLocalModelGovernanceRecordIdempotencyKey(record);
    assert.equal(persistenceKey, buildLocalModelGovernanceRecordPersistenceKey(structuredClone(record)));
    assert.equal(idempotencyKey, buildLocalModelGovernanceRecordIdempotencyKey(structuredClone(record)));
    assert.equal(idempotencyKey, `${persistenceKey}:idempotency`);
    assert.doesNotMatch(persistenceKey, new RegExp(record.actorSubjectId));
    assert.doesNotMatch(persistenceKey, new RegExp(record.reviewedAt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.doesNotMatch(idempotencyKey, /hash|checksum|signature/i);
    assert.notEqual(
      persistenceKey,
      buildLocalModelGovernanceRecordPersistenceKey({ ...record, recordRevision: record.recordRevision + 1 }),
    );
    assert.notEqual(
      persistenceKey,
      buildLocalModelGovernanceRecordPersistenceKey({ ...record, candidateId: 'qwen3-1-7b-candidate' }),
    );
    assert.notEqual(
      persistenceKey,
      buildLocalModelGovernanceRecordPersistenceKey({
        ...record,
        scope: { ...record.scope, observedRevision: `${record.scope.observedRevision}-changed` },
      }),
    );
  });

  it('compares envelopes explicitly and treats identical duplicates idempotently', () => {
    const input = persistenceInput();
    const envelope = buildLocalModelGovernanceRecordPersistenceEnvelope(input.finalizedRecord!);
    const clone = structuredClone(envelope);
    assert.equal(isSameLocalModelGovernancePersistenceEnvelope(envelope, clone), true);
    assert.deepEqual(compareLocalModelGovernancePersistenceEnvelope(envelope, clone), {
      duplicateState: 'identical-existing-envelope',
      conflictDetected: false,
    });
    const result = evaluateLocalModelGovernanceRecordPersistence({ ...input, previousEnvelope: clone });
    assert.equal(result.status, 'persistence-request-ready');
    assert.equal(result.duplicateState, 'identical-existing-envelope');
    assert.equal(result.conflictDetected, false);
    assert.equal(result.repositoryWritePerformed, false);
  });

  it('fails closed on a conflicting duplicate with the same persistence key', () => {
    const input = persistenceInput();
    const envelope = buildLocalModelGovernanceRecordPersistenceEnvelope(input.finalizedRecord!);
    const conflicting = {
      ...envelope,
      canonicalOutcome: 'finalized-rejected' as const,
    };
    assert.equal(isSameLocalModelGovernancePersistenceEnvelope(envelope, conflicting), false);
    assert.deepEqual(compareLocalModelGovernancePersistenceEnvelope(conflicting, envelope), {
      duplicateState: 'conflicting-existing-envelope',
      conflictDetected: true,
    });
    const result = evaluateLocalModelGovernanceRecordPersistence({ ...input, previousEnvelope: conflicting });
    assert.equal(result.status, 'attention-required');
    assert.equal(result.conflictDetected, true);
    assert.equal(result.persistenceRequestReady, false);
    assert.equal(result.canProceedToRepositoryHandoffReview, false);
  });

  it('rejects malformed canonical decision sets and unsupported outcomes', () => {
    const base = persistenceInput();
    const record = base.finalizedRecord!;
    const cases = [
      mutateRecord(base, { decisions: record.decisions.slice(0, 3) }),
      mutateRecord(base, { decisions: [...record.decisions, record.decisions[0]] }),
      mutateRecord(base, { decisions: record.decisions.map((item, index) => index === 0 ? { ...item, decision: 'not-recorded' } : item) }),
      mutateRecord(base, { decisions: record.decisions.map((item, index) => index === 0 ? { ...item, explicitlyRecorded: false } : item) }),
      mutateRecord(base, { outcome: 'unknown-outcome' }),
      mutateRecord(base, { recordValidForCurrentScope: false }),
      mutateRecord(base, { eligibleForTrustedPersistence: false }),
    ];
    for (const input of cases) {
      const result = evaluateLocalModelGovernanceRecordPersistence(input);
      assert.equal(result.status, 'attention-required');
      assert.equal(result.persistenceRequestReady, false);
      assert.equal(result.persistenceEnvelope, null);
    }
  });

  it('rejects forged persistence, signing, downstream, approval, and readiness claims', () => {
    const base = persistenceInput();
    const recordFlags = [
      'persisted','signed','appliedToArtifactSelection','modelApproved','licenseApproved','artifactSelected',
      'artifactApproved','checksumVerified','benchmarkVerified','downloadable','runtimeReady','modelActive',
    ] as const;
    for (const flag of recordFlags) {
      const result = evaluateLocalModelGovernanceRecordPersistence(mutateRecord(base, { [flag]: true }));
      assert.equal(result.status, 'attention-required', flag);
    }
    const inputFlags = [
      'claimedPersistenceAttempted','claimedRepositoryWritePerformed','claimedRecordPersisted','claimedRecordSigned',
      'claimedRecordAppliedDownstream','claimedModelApproved','claimedLicenseApproved','claimedArtifactSelected',
      'claimedArtifactApproved','claimedChecksumVerified','claimedBenchmarkVerified','claimedDownloadable',
      'claimedRuntimeReady','claimedModelActive',
    ] as const;
    for (const flag of inputFlags) {
      const result = evaluateLocalModelGovernanceRecordPersistence({ ...base, [flag]: true });
      assert.equal(result.status, 'attention-required', flag);
    }
  });

  it('rejects non-append operations and mutable envelope claims', () => {
    const input = persistenceInput();
    for (const operation of ['update', 'delete', 'upsert', 'replace'] as const) {
      assert.equal(evaluateLocalModelGovernanceRecordPersistence({ ...input, requestedOperation: operation as never }).status, 'attention-required');
    }
    const envelope = buildLocalModelGovernanceRecordPersistenceEnvelope(input.finalizedRecord!);
    const mutations: Array<Partial<LocalModelGovernanceRecordPersistenceEnvelope>> = [
      { operation: 'update' as never },
      { updateAllowed: true as never },
      { deleteAllowed: true as never },
      { clientDeleteAllowed: true as never },
      { clientOverwriteAllowed: true as never },
      { immutable: false as never },
      { appendOnly: false as never },
    ];
    for (const mutation of mutations) {
      assert.equal(validateLocalModelGovernanceRecordPersistenceEnvelope({ ...envelope, ...mutation }).valid, false);
    }
  });

  it('rejects unexpected, credential, signature, raw-evidence, and learner-content fields without leaking values', () => {
    const input = persistenceInput();
    const envelope = buildLocalModelGovernanceRecordPersistenceEnvelope(input.finalizedRecord!);
    const forbidden = [
      ['email', 'reviewer@example.com'],
      ['accessToken', 'secret-token'],
      ['jwt', 'secret-jwt'],
      ['session', 'secret-session'],
      ['signature', 'fake-signature'],
      ['rawEvidence', 'private-evidence'],
      ['learnerContent', 'private-learner-content'],
      ['createdAt', '2099-01-01T00:00:00Z'],
    ] as const;
    for (const [field, value] of forbidden) {
      const validation = validateLocalModelGovernanceRecordPersistenceEnvelope({ ...envelope, [field]: value } as never);
      assert.equal(validation.valid, false, field);
      const serialized = validation.issues.join(' ');
      assert.doesNotMatch(serialized, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  });

  it('invalidates stale candidate, tier, model, repository, revision, outcome, actor, decision, and policy scopes', () => {
    const base = persistenceInput();
    const scope = base.currentRecordScope!;
    const alteredScopes = [
      { ...scope, candidateId: 'qwen3-1-7b-candidate' },
      { ...scope, candidateTier: 'standard' as const },
      { ...scope, modelClass: '1.7B' },
      { ...scope, exactModelName: 'Qwen3-1.7B' },
      { ...scope, officialRepositoryId: 'Qwen/Qwen3-1.7B' },
      { ...scope, observedRevision: 'changed' },
      { ...scope, recordKey: `${scope.recordKey}:changed` },
      { ...scope, recordRevision: scope.recordRevision + 1 },
      { ...scope, canonicalOutcome: 'finalized-rejected' as const },
      { ...scope, reviewedAt: '2026-07-19T08:30:00.000Z' },
      { ...scope, actorSubjectId: 'opaque:reviewer-002' },
      { ...scope, evidenceClosureRevision: scope.evidenceClosureRevision + 1 },
      { ...scope, governanceDecisionRecordPolicyRevision: scope.governanceDecisionRecordPolicyRevision + 1 },
      { ...scope, persistenceSchemaRevision: scope.persistenceSchemaRevision + 1 },
      { ...scope, persistencePolicyRevision: scope.persistencePolicyRevision + 1 },
      { ...scope, decisions: scope.decisions.map((item, index) => index === 0 ? { ...item, decision: 'reject' as const } : item) },
    ];
    for (const previousPersistenceScope of alteredScopes) {
      assert.equal(isSameLocalModelGovernancePersistenceScope(scope, previousPersistenceScope), false);
      const result = evaluateLocalModelGovernanceRecordPersistence({ ...base, previousPersistenceScope });
      assert.equal(result.status, 'invalidated');
      assert.equal(result.persistenceRequestReady, false);
    }
    assert.equal(evaluateLocalModelGovernanceRecordPersistence({ ...base, previouslyInvalidated: true }).status, 'invalidated');
  });

  it('rejects candidate, workspace, scope, schema, policy, and key mismatches', () => {
    const base = persistenceInput();
    const cases: LocalModelGovernanceRecordPersistenceInput[] = [
      { ...base, candidateId: 'qwen3-1-7b-candidate' },
      { ...base, candidateTier: 'standard' },
      { ...base, workspaceResult: { ...base.workspaceResult, status: 'locked-no-trusted-context', canonicalRecordFinalized: false } },
      { ...base, currentRecordScope: { ...base.currentRecordScope!, recordKey: 'wrong-key' } },
      { ...base, schemaRevision: LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_SCHEMA_REVISION + 1 },
      { ...base, policyRevision: LOCAL_MODEL_GOVERNANCE_RECORD_PERSISTENCE_POLICY_REVISION + 1 },
    ];
    for (const input of cases) {
      const validation = validateLocalModelGovernanceRecordPersistenceInput(input);
      assert.equal(validation.valid, false);
      assert.equal(evaluateLocalModelGovernanceRecordPersistence(input).persistenceRequestReady, false);
    }
  });

  it('does not mutate canonical records, decision arrays, registries, manifests, or active-model state', () => {
    const input = persistenceInput();
    const before = structuredClone(input);
    const registryBefore = structuredClone(LOCAL_MODEL_APPROVAL_REGISTRY);
    const manifestBefore = structuredClone(LOCAL_MODEL_ARTIFACT_MANIFEST);
    const first = evaluateLocalModelGovernanceRecordPersistence(input);
    const second = evaluateLocalModelGovernanceRecordPersistence(input);
    assert.deepEqual(input, before);
    assert.deepEqual(LOCAL_MODEL_APPROVAL_REGISTRY, registryBefore);
    assert.deepEqual(LOCAL_MODEL_ARTIFACT_MANIFEST, manifestBefore);
    assert.deepEqual(first.blockers, second.blockers);
    assert.equal(new Set(first.blockers).size, first.blockers.length);
    assert.doesNotMatch(first.blockers.join(' '), /opaque:reviewer|2026-07-18/i);
    assert.equal(buildCurrentLocalModelGovernanceRecordPersistenceResults().every((item) => !item.modelActive), true);
  });
});
