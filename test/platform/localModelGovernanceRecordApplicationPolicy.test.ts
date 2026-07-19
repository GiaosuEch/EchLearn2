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
import type { LocalModelGovernancePersistedRecordVerificationResult } from '../../src/platform/ai/localModelGovernancePersistedRecordVerificationTypes.ts';
import {
  LOCAL_MODEL_GOVERNANCE_RECORD_APPLICATION_POLICY_REVISION,
  buildLocalModelGovernanceApplicationDecisionKey,
  buildLocalModelGovernanceRecordApplicationScope,
  evaluateLocalModelGovernanceRecordApplication,
} from '../../src/platform/ai/localModelGovernanceRecordApplicationPolicy.ts';
import type {
  LocalModelGovernanceRecordApplicationDecision,
  LocalModelGovernanceRecordApplicationRequest,
  LocalModelGovernanceRecordApplicationScope,
} from '../../src/platform/ai/localModelGovernanceRecordApplicationTypes.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
const REQUIREMENTS = [
  'tokenizer-license-scope',
  'acceptable-use-scope',
  'derived-artifact-hosting',
  'quantization-conversion',
] as const;
const ACTOR_ID = '11111111-1111-4111-8111-111111111111';

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

function validEnvelope(
  decisions: readonly ('proceed' | 'reject' | 'request-more-evidence')[] = ['proceed', 'proceed', 'proceed', 'proceed'],
): LocalModelGovernanceRecordPersistenceEnvelope {
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
  REQUIREMENTS.forEach((requirementId, index) => {
    state = applyLocalModelGovernanceReviewWorkspaceEvent(state, {
      type: 'set-decision',
      requirementId,
      decision: decisions[index]!,
    });
  });
  state = applyLocalModelGovernanceReviewWorkspaceEvent(state, { type: 'request-finalize' });
  const result = evaluateLocalModelGovernanceReviewWorkspace(state);
  assert.ok(result.finalizedRecord);
  return buildLocalModelGovernanceRecordPersistenceEnvelope(result.finalizedRecord);
}

function verifiedResult(
  envelope: LocalModelGovernanceRecordPersistenceEnvelope,
  overrides: Partial<LocalModelGovernancePersistedRecordVerificationResult> = {},
): LocalModelGovernancePersistedRecordVerificationResult {
  return {
    status: 'verified',
    blockers: [],
    warnings: [],
    explicitActionRequested: true,
    expectedEnvelopeValid: true,
    repositoryAvailable: true,
    readAttempted: true,
    readInvocationCount: 1,
    tableName: 'local_model_governance_records',
    queryColumn: 'persistence_key',
    queriedPersistenceKey: envelope.persistenceKey,
    recordVisible: true,
    recordVerified: true,
    recordId: '1',
    persistenceKey: envelope.persistenceKey,
    canonicalRecordKey: envelope.canonicalRecordKey,
    canonicalOutcome: envelope.canonicalOutcome,
    schemaRevision: envelope.schemaRevision,
    policyRevision: envelope.policyRevision,
    envelopeMatched: true,
    candidateScopeVerified: true,
    modelIdentityVerified: true,
    actorBindingVerified: true,
    reviewedAtVerified: true,
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
    ...overrides,
  };
}

function request(
  envelope = validEnvelope(),
  overrides: Partial<LocalModelGovernanceRecordApplicationRequest> = {},
): LocalModelGovernanceRecordApplicationRequest {
  return {
    expectedEnvelope: envelope,
    verificationResult: verifiedResult(envelope),
    currentScope: buildLocalModelGovernanceRecordApplicationScope(envelope),
    explicitApplicationRequested: true,
    previousApplicationDecision: null,
    ...overrides,
  };
}

function assertSafetyFlags(result: LocalModelGovernanceRecordApplicationDecision): void {
  assert.equal(result.applicationRecordPersisted, false);
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

function evaluate(overrides: Partial<LocalModelGovernanceRecordApplicationRequest> = {}) {
  const base = request();
  return evaluateLocalModelGovernanceRecordApplication({ ...base, ...overrides });
}

describe('Phase 6.8 explicit persisted governance record application policy', () => {
  it('is synchronous, side-effect free on import, and requires a literal explicit action', () => {
    const base = request();
    const falseResult = evaluateLocalModelGovernanceRecordApplication({
      ...base,
      explicitApplicationRequested: false,
    });
    assert.equal(falseResult instanceof Promise, false);
    assert.equal(falseResult.status, 'not-requested');
    assert.equal(falseResult.applicationEligible, false);
    assert.equal(falseResult.artifactSelectionReviewEligible, false);

    for (const malformed of ['true', 1]) {
      const result = evaluateLocalModelGovernanceRecordApplication({
        ...base,
        explicitApplicationRequested: malformed,
      } as never);
      assert.equal(result.status, 'not-requested');
    }
  });

  it('reuses Phase 6.4 envelope validation and fails before accepting verification', () => {
    const envelope = validEnvelope();
    const invalid = { ...envelope, operation: 'update' } as never;
    const expected = validateLocalModelGovernanceRecordPersistenceEnvelope(invalid).issues;
    const result = evaluateLocalModelGovernanceRecordApplication({
      ...request(envelope),
      expectedEnvelope: invalid,
    });
    assert.equal(result.status, 'invalid-expected-envelope');
    assert.deepEqual(result.blockers, expected);
    assert.equal(result.expectedEnvelopeValid, false);
    assert.equal(result.verificationAccepted, false);
  });

  it('does not mutate envelope, verification result, current scope, or previous decision', () => {
    const envelope = validEnvelope();
    const verification = verifiedResult(envelope);
    const currentScope = buildLocalModelGovernanceRecordApplicationScope(envelope);
    const first = evaluateLocalModelGovernanceRecordApplication(request(envelope));
    const previous = structuredClone(first);
    const snapshots = [structuredClone(envelope), structuredClone(verification), structuredClone(currentScope), structuredClone(previous)];
    evaluateLocalModelGovernanceRecordApplication({
      expectedEnvelope: envelope,
      verificationResult: verification,
      currentScope,
      explicitApplicationRequested: true,
      previousApplicationDecision: previous,
    });
    assert.deepEqual(envelope, snapshots[0]);
    assert.deepEqual(verification, snapshots[1]);
    assert.deepEqual(currentScope, snapshots[2]);
    assert.deepEqual(previous, snapshots[3]);
  });

  it('requires exact verified status and every Phase 6.7 safety invariant', () => {
    const envelope = validEnvelope();
    const notVerified = evaluate({ verificationResult: verifiedResult(envelope, { status: 'not-found-or-not-visible' }) });
    assert.equal(notVerified.status, 'verification-not-verified');

    const incompleteCases: readonly Partial<LocalModelGovernancePersistedRecordVerificationResult>[] = [
      { explicitActionRequested: false },
      { expectedEnvelopeValid: false },
      { repositoryAvailable: false },
      { readAttempted: false },
      { readInvocationCount: 0 },
      { recordVisible: false },
      { recordVerified: false },
      { envelopeMatched: false },
      { candidateScopeVerified: false },
      { modelIdentityVerified: false },
      { actorBindingVerified: false },
      { reviewedAtVerified: false },
      { rawRowExposed: true as never },
      { rawErrorExposed: true as never },
      { recordAppliedDownstream: true as never },
      { modelApproved: true as never },
      { licenseApproved: true as never },
      { artifactSelected: true as never },
      { artifactApproved: true as never },
      { checksumVerified: true as never },
      { benchmarkVerified: true as never },
      { downloadable: true as never },
      { runtimeReady: true as never },
      { modelActive: true as never },
    ];
    for (const overrides of incompleteCases) {
      const result = evaluate({ verificationResult: verifiedResult(envelope, overrides) });
      assert.equal(result.status, 'verification-incomplete', JSON.stringify(overrides));
      assert.equal(result.verificationAccepted, false);
      assertSafetyFlags(result);
    }
  });

  it('binds the accepted verification to the exact expected envelope', () => {
    const envelope = validEnvelope();
    const cases: readonly [string, Partial<LocalModelGovernancePersistedRecordVerificationResult>][] = [
      ['persistence', { persistenceKey: `${envelope.persistenceKey}:tampered` }],
      ['canonical-key', { canonicalRecordKey: `${envelope.canonicalRecordKey}:tampered` }],
      ['outcome', { canonicalOutcome: 'finalized-rejected' }],
      ['schema', { schemaRevision: envelope.schemaRevision + 1 }],
      ['policy', { policyRevision: envelope.policyRevision + 1 }],
    ];
    for (const [name, overrides] of cases) {
      const result = evaluate({ verificationResult: verifiedResult(envelope, overrides) });
      assert.equal(result.status, 'verification-envelope-mismatch', name);
      assert.equal(result.applicationEligible, false);
    }
  });

  it('builds the exact current scope without actor, clock, or mutable global state', () => {
    const envelope = validEnvelope();
    const scope = buildLocalModelGovernanceRecordApplicationScope(envelope);
    assert.deepEqual(scope, {
      candidateId: envelope.candidateId,
      candidateTier: envelope.candidateTier,
      modelClass: envelope.canonicalRecord.scope.modelClass,
      exactModelName: envelope.canonicalRecord.scope.exactModelName,
      officialRepositoryId: envelope.canonicalRecord.scope.officialRepositoryId,
      observedRevision: envelope.canonicalRecord.scope.observedRevision,
      evidenceClosureRevision: envelope.canonicalRecord.scope.evidenceClosureRevision,
      governanceDecisionPolicyRevision: envelope.canonicalRecord.scope.governanceDecisionPolicyRevision,
      governanceDecisionRecordPolicyRevision: envelope.canonicalRecord.scope.governanceDecisionRecordPolicyRevision,
      governanceApplicationPolicyRevision: LOCAL_MODEL_GOVERNANCE_RECORD_APPLICATION_POLICY_REVISION,
      canonicalRecordRevision: envelope.canonicalRecordRevision,
      persistenceKey: envelope.persistenceKey,
      canonicalRecordKey: envelope.canonicalRecordKey,
      canonicalOutcome: envelope.canonicalOutcome,
    });
    assert.doesNotMatch(JSON.stringify(scope), new RegExp(ACTOR_ID));
  });

  it('classifies candidate, model, revision, and stale scope mismatches fail closed', () => {
    const envelope = validEnvelope();
    const scope = buildLocalModelGovernanceRecordApplicationScope(envelope);
    const cases: readonly [Partial<LocalModelGovernanceRecordApplicationScope>, string, boolean][] = [
      [{ candidateId: 'qwen3-1-7b-candidate' }, 'candidate-scope-mismatch', false],
      [{ candidateTier: 'standard' }, 'candidate-scope-mismatch', false],
      [{ modelClass: '1.7B' }, 'model-identity-mismatch', false],
      [{ exactModelName: 'Qwen3-1.7B' }, 'model-identity-mismatch', false],
      [{ officialRepositoryId: 'Qwen/Qwen3-1.7B' }, 'model-identity-mismatch', false],
      [{ observedRevision: 'changed-revision' }, 'model-identity-mismatch', true],
      [{ evidenceClosureRevision: scope.evidenceClosureRevision + 1 }, 'revision-mismatch', true],
      [{ governanceDecisionPolicyRevision: scope.governanceDecisionPolicyRevision + 1 }, 'revision-mismatch', true],
      [{ governanceDecisionRecordPolicyRevision: scope.governanceDecisionRecordPolicyRevision + 1 }, 'revision-mismatch', true],
      [{ governanceApplicationPolicyRevision: scope.governanceApplicationPolicyRevision + 1 }, 'revision-mismatch', true],
      [{ canonicalRecordRevision: scope.canonicalRecordRevision + 1 }, 'revision-mismatch', true],
      [{ persistenceKey: `${scope.persistenceKey}:changed` }, 'stale-verification', true],
      [{ canonicalRecordKey: `${scope.canonicalRecordKey}:changed` }, 'stale-verification', true],
      [{ canonicalOutcome: 'finalized-rejected' }, 'stale-verification', true],
    ];
    for (const [change, status, stale] of cases) {
      const result = evaluate({ currentScope: { ...scope, ...change } as LocalModelGovernanceRecordApplicationScope });
      assert.equal(result.status, status, JSON.stringify(change));
      assert.equal(result.staleVerificationDetected, stale);
      assert.equal(result.applicationEligible, false);
    }
  });

  it('allows only finalized-proceed to become eligible for downstream review', () => {
    const proceed = evaluate();
    assert.equal(proceed.status, 'eligible-for-downstream-review');
    assert.equal(proceed.outcomeEligible, true);
    assert.equal(proceed.applicationEligible, true);
    assert.equal(proceed.artifactSelectionReviewEligible, true);
    assertSafetyFlags(proceed);

    const rejectedEnvelope = validEnvelope(['reject', 'proceed', 'proceed', 'proceed']);
    const rejected = evaluateLocalModelGovernanceRecordApplication(request(rejectedEnvelope));
    assert.equal(rejected.status, 'outcome-rejected');
    assert.equal(rejected.outcomeEligible, false);

    const evidenceEnvelope = validEnvelope(['request-more-evidence', 'proceed', 'proceed', 'proceed']);
    const moreEvidence = evaluateLocalModelGovernanceRecordApplication(request(evidenceEnvelope));
    assert.equal(moreEvidence.status, 'more-evidence-required');
    assert.equal(moreEvidence.outcomeEligible, false);

    const unknownEnvelope = { ...validEnvelope(), canonicalOutcome: 'unknown-outcome' } as never;
    const unknown = evaluateLocalModelGovernanceRecordApplication({
      ...request(validEnvelope()),
      expectedEnvelope: unknownEnvelope,
      verificationResult: { ...verifiedResult(validEnvelope()), canonicalOutcome: 'unknown-outcome' } as never,
      currentScope: { ...buildLocalModelGovernanceRecordApplicationScope(validEnvelope()), canonicalOutcome: 'unknown-outcome' } as never,
    });
    assert.equal(unknown.status, 'failed-safe');
  });

  it('creates a deterministic non-cryptographic application key bound to scope', () => {
    const envelope = validEnvelope();
    const scope = buildLocalModelGovernanceRecordApplicationScope(envelope);
    const key = buildLocalModelGovernanceApplicationDecisionKey(scope);
    assert.equal(key, buildLocalModelGovernanceApplicationDecisionKey({ ...scope }));
    assert.match(key, /^local-model-governance-application:/);
    assert.doesNotMatch(key, new RegExp(ACTOR_ID));
    assert.doesNotMatch(key, /2026-|timestamp|hash|checksum|signature/i);

    const changes: readonly Partial<LocalModelGovernanceRecordApplicationScope>[] = [
      { candidateId: 'qwen3-1-7b-candidate' },
      { observedRevision: 'different' },
      { canonicalRecordKey: `${scope.canonicalRecordKey}:different` },
      { canonicalOutcome: 'finalized-rejected' },
      { governanceApplicationPolicyRevision: scope.governanceApplicationPolicyRevision + 1 },
    ];
    for (const change of changes) {
      assert.notEqual(buildLocalModelGovernanceApplicationDecisionKey({ ...scope, ...change } as never), key);
    }
  });

  it('detects identical replay without claiming persistence or a new downstream action', () => {
    const first = evaluate();
    const replay = evaluate({ previousApplicationDecision: first });
    assert.equal(replay.status, 'eligible-for-downstream-review');
    assert.equal(replay.previousDecisionPresent, true);
    assert.equal(replay.replayDetected, true);
    assert.match(replay.warnings.join(','), /governance-application-identical-existing-decision/);
    assert.equal(replay.applicationRecordPersisted, false);
    assert.equal(replay.recordAppliedDownstream, false);
  });

  it('rejects conflicting or different-scope previous decisions without mutation', () => {
    const first = evaluate();
    const conflicting = { ...first, canonicalOutcome: 'finalized-rejected' } as never;
    const conflictResult = evaluate({ previousApplicationDecision: conflicting });
    assert.equal(conflictResult.status, 'previous-decision-conflict');
    assert.equal(conflictResult.replayDetected, true);
    assert.equal(conflictResult.applicationEligible, false);

    const differentScope = { ...first, applicationDecisionKey: `${first.applicationDecisionKey}:other` } as never;
    const differentResult = evaluate({ previousApplicationDecision: differentScope });
    assert.equal(differentResult.status, 'previous-decision-conflict');
    assert.equal(differentResult.applicationEligible, false);
  });

  it('returns deterministic blockers and never exposes actor, raw envelope, verification object, or record ID', () => {
    const envelope = validEnvelope();
    const first = evaluate({ verificationResult: verifiedResult(envelope, { recordVerified: false, envelopeMatched: false }) });
    const second = evaluate({ verificationResult: verifiedResult(envelope, { recordVerified: false, envelopeMatched: false }) });
    assert.deepEqual(first.blockers, second.blockers);
    assert.equal(new Set(first.blockers).size, first.blockers.length);
    const output = JSON.stringify(first);
    assert.doesNotMatch(output, new RegExp(ACTOR_ID));
    assert.doesNotMatch(output, /reviewedAt|recordId|actorSubjectId|decisions/i);
    assert.doesNotMatch(output, new RegExp(envelope.canonicalRecord.reviewedAt));
  });

  it('fails closed for hostile runtime input instead of throwing raw exceptions', () => {
    const hostile = new Proxy({}, {
      get() { throw new Error('hostile-getter-secret'); },
      ownKeys() { throw new Error('hostile-ownkeys-secret'); },
    });
    const result = evaluateLocalModelGovernanceRecordApplication(hostile as never);
    assert.equal(result.status, 'failed-safe');
    assert.match(result.blockers.join(','), /governance-application-failed-safe/);
    assert.doesNotMatch(JSON.stringify(result), /hostile-getter-secret|hostile-ownkeys-secret/);
  });

  it('contains no clock, random, network, Supabase, storage, retry, or database mutation path', () => {
    const production = [
      read('src/platform/ai/localModelGovernanceRecordApplicationTypes.ts'),
      read('src/platform/ai/localModelGovernanceRecordApplicationPolicy.ts'),
      read('src/platform/ai/localModelGovernanceRecordApplicationViewModel.ts'),
    ].join('\n');
    for (const forbidden of [
      /service[_-]?role|supabase(?:Url|Key)|accessToken|refreshToken|rawJwt|password|document\.cookie/i,
      /auth\.(?:getSession|getUser)|user_metadata|generic admin/i,
      /localStorage|sessionStorage|indexedDB|CacheStorage/i,
      /fetch\s*\(|axios|\.from\s*\(|\.rpc\s*\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(/i,
      /setTimeout|setInterval|Date\.now|new Date\s*\(|Math\.random|crypto\.randomUUID/i,
      /console\.log|retry|backoff|queue|Worker\s*\(|AIService|\.execute\s*\(/i,
    ]) assert.doesNotMatch(production, forbidden);
  });
});
