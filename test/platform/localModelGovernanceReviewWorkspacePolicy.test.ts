import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from '../../src/platform/ai/localModelArtifactManifest.ts';
import { buildLocalModelGovernanceBenchmarkCloseout } from '../../src/platform/ai/localModelGovernanceBenchmarkCloseout.ts';
import {
  buildCurrentLocalModelGovernanceDecisionRecordResults,
} from '../../src/platform/ai/localModelGovernanceDecisionRecordPolicy.ts';
import {
  LOCAL_MODEL_EXTERNAL_AUTH_ASSERTION_REVISION,
  LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION,
  LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE,
  LOCAL_MODEL_TRUSTED_ACTOR_CONTEXT_ADAPTER_POLICY_REVISION,
  buildCurrentLocalModelTrustedActorContextAdapterResult,
  buildLocalModelTrustedActorAssertionScope,
  evaluateLocalModelTrustedActorContextAdapter,
} from '../../src/platform/ai/localModelTrustedActorContextAdapter.ts';
import type {
  LocalModelExternalTrustedActorAssertion,
  LocalModelTrustedActorContextAdapterResult,
} from '../../src/platform/ai/localModelTrustedActorContextAdapterTypes.ts';
import {
  LOCAL_MODEL_GOVERNANCE_REVIEW_WORKSPACE_POLICY_REVISION,
  applyLocalModelGovernanceReviewWorkspaceEvent,
  buildCurrentLocalModelGovernanceReviewWorkspaceResults,
  buildLocalModelGovernanceReviewWorkspaceScope,
  createLockedLocalModelGovernanceReviewWorkspaceInput,
  evaluateLocalModelGovernanceReviewWorkspace,
  isSameLocalModelGovernanceReviewWorkspaceScope,
  listCurrentLocalModelGovernanceReviewWorkspaceResults,
  mapWorkspaceDraftToGovernanceDecisionRecordInput,
  validateLocalModelGovernanceReviewWorkspaceInput,
} from '../../src/platform/ai/localModelGovernanceReviewWorkspacePolicy.ts';
import type {
  LocalModelGovernanceReviewWorkspaceEvent,
  LocalModelGovernanceReviewWorkspaceInput,
} from '../../src/platform/ai/localModelGovernanceReviewWorkspaceTypes.ts';

const REQUIREMENTS = [
  'tokenizer-license-scope',
  'acceptable-use-scope',
  'derived-artifact-hosting',
  'quantization-conversion',
] as const;

function externalAssertion(
  overrides: Partial<LocalModelExternalTrustedActorAssertion> = {},
): LocalModelExternalTrustedActorAssertion {
  return {
    actorSubjectId: 'opaque:reviewer-001',
    authenticationOutcome: 'authenticated',
    authorizationOutcome: 'granted',
    verifiedRoleIds: [LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE],
    verifiedPermissionIds: [LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION],
    authenticationSource: 'external-auth-boundary',
    assertionRevision: LOCAL_MODEL_EXTERNAL_AUTH_ASSERTION_REVISION,
    actorContextRevision: 1,
    ...overrides,
  };
}

function trustedAdapter(
  assertion = externalAssertion(),
): { result: LocalModelTrustedActorContextAdapterResult; assertion: LocalModelExternalTrustedActorAssertion } {
  return {
    result: evaluateLocalModelTrustedActorContextAdapter({
      assertion,
      previousAssertionScope: null,
      previouslyInvalidated: false,
      adapterPolicyRevision: LOCAL_MODEL_TRUSTED_ACTOR_CONTEXT_ADAPTER_POLICY_REVISION,
    }),
    assertion,
  };
}

function trustedWorkspace(
  candidateId = 'qwen3-0-6b-candidate',
  assertion = externalAssertion(),
): LocalModelGovernanceReviewWorkspaceInput {
  const base = createLockedLocalModelGovernanceReviewWorkspaceInput(candidateId);
  const adapter = trustedAdapter(assertion).result;
  const actorAssertionScope = buildLocalModelTrustedActorAssertionScope(assertion);
  const scope = buildLocalModelGovernanceReviewWorkspaceScope(candidateId, adapter, actorAssertionScope);
  assert.ok(scope);
  return {
    ...base,
    adapterResult: adapter,
    actorAssertionScope,
    status: 'ready-for-review',
    currentScope: scope,
    previousScope: scope,
  };
}

function apply(
  input: LocalModelGovernanceReviewWorkspaceInput,
  event: LocalModelGovernanceReviewWorkspaceEvent,
): LocalModelGovernanceReviewWorkspaceInput {
  return applyLocalModelGovernanceReviewWorkspaceEvent(input, event);
}

function recordAll(
  input: LocalModelGovernanceReviewWorkspaceInput,
  decision: 'proceed' | 'reject' | 'request-more-evidence' = 'proceed',
): LocalModelGovernanceReviewWorkspaceInput {
  let state = input.reviewStarted ? input : apply(input, { type: 'begin-review' });
  for (const requirementId of REQUIREMENTS) {
    state = apply(state, { type: 'set-decision', requirementId, decision });
  }
  return state;
}

describe('Phase 6.3 trusted governance review workspace policy', () => {
  it('builds exactly three production workspaces locked without a trusted actor context', () => {
    const results = buildCurrentLocalModelGovernanceReviewWorkspaceResults();
    assert.deepEqual(results, listCurrentLocalModelGovernanceReviewWorkspaceResults());
    assert.equal(results.length, 3);
    assert.deepEqual(results.map((item) => item.candidateId), [
      'qwen3-0-6b-candidate',
      'qwen3-1-7b-candidate',
      'qwen3-4b-candidate',
    ]);
    assert.deepEqual(results.map((item) => item.candidateTier), ['light', 'standard', 'pro']);
    assert.equal(results.some((item) => item.candidateTier === ('ultra-low' as never)), false);
    for (const result of results) {
      assert.equal(result.status, 'locked-no-trusted-context');
      assert.equal(result.trustedContextReady, false);
      assert.equal(result.reviewStarted, false);
      assert.equal(result.recordedDecisionCount, 0);
      assert.equal(result.allDecisionsExplicit, false);
      assert.equal(result.finalizeRequested, false);
      assert.equal(result.finalizedRecord, null);
      assert.equal(result.canBeginReview, false);
      assert.equal(result.canEditDraft, false);
      assert.equal(result.canRequestFinalize, false);
      assert.equal(result.canonicalRecordFinalized, false);
      assert.equal(result.recordPersisted, false);
      assert.equal(result.recordAppliedDownstream, false);
      assert.equal(result.modelActive, false);
      assert.equal(result.requirements.length, 4);
      assert.deepEqual(result.requirements.map((item) => item.requirementId), REQUIREMENTS);
      assert.equal(result.requirements.every((item) => item.decision === 'not-recorded'), true);
    }
  });

  it('keeps Phase 6.1 and Phase 6.2 production state unchanged', () => {
    const phase61 = buildCurrentLocalModelGovernanceDecisionRecordResults();
    const phase62 = buildCurrentLocalModelTrustedActorContextAdapterResult();
    assert.equal(phase61.length, 3);
    assert.equal(phase61.every((item) => item.status === 'awaiting-trusted-actor'), true);
    assert.equal(phase61.reduce((sum, item) => sum + item.recordedDecisionItems, 0), 0);
    assert.equal(phase61.filter((item) => item.canonicalRecord !== null).length, 0);
    assert.equal(phase62.status, 'unavailable');
    assert.equal(phase62.assertionPresent, false);
    assert.equal(phase62.mappedTrustedActorContext, null);
  });

  it('opens a workspace only for an exact trusted-context-ready adapter result', () => {
    const unavailable = createLockedLocalModelGovernanceReviewWorkspaceInput('qwen3-0-6b-candidate');
    assert.equal(evaluateLocalModelGovernanceReviewWorkspace(unavailable).status, 'locked-no-trusted-context');
    assert.throws(() => apply(unavailable, { type: 'begin-review' }));

    for (const status of ['unauthenticated', 'unauthorized'] as const) {
      const blocked = {
        ...unavailable,
        adapterResult: { ...unavailable.adapterResult, status },
      };
      assert.equal(evaluateLocalModelGovernanceReviewWorkspace(blocked).status, 'locked-no-trusted-context');
      assert.throws(() => apply(blocked, { type: 'begin-review' }));
    }

    const ready = trustedWorkspace();
    const result = evaluateLocalModelGovernanceReviewWorkspace(ready);
    assert.equal(result.status, 'ready-for-review');
    assert.equal(result.trustedContextReady, true);
    assert.equal(result.canBeginReview, true);
    assert.equal(result.recordedDecisionCount, 0);
    assert.equal(result.canonicalRecordFinalized, false);
  });

  it('begins review explicitly without selecting decisions or calling the clock', () => {
    let clockCalls = 0;
    const ready = { ...trustedWorkspace(), clock: () => { clockCalls += 1; return '2026-07-18T00:00:00Z'; } };
    const draft = apply(ready, { type: 'begin-review' });
    const result = evaluateLocalModelGovernanceReviewWorkspace(draft);
    assert.equal(result.status, 'draft-in-progress');
    assert.equal(result.reviewStarted, true);
    assert.equal(result.canEditDraft, true);
    assert.equal(result.recordedDecisionCount, 0);
    assert.equal(result.requirements.every((item) => item.decision === 'not-recorded'), true);
    assert.equal(clockCalls, 0);
  });

  it('sets and clears exactly one requirement immutably without default proceed', () => {
    const original = apply(trustedWorkspace(), { type: 'begin-review' });
    const before = structuredClone(original);
    const one = apply(original, {
      type: 'set-decision',
      requirementId: 'tokenizer-license-scope',
      decision: 'proceed',
    });
    assert.deepEqual(original, before);
    assert.equal(one.requirements.find((item) => item.requirementId === 'tokenizer-license-scope')?.decision, 'proceed');
    assert.equal(one.requirements.filter((item) => item.explicitlyRecorded).length, 1);
    assert.equal(one.requirements.filter((item) => item.requirementId !== 'tokenizer-license-scope').every((item) => item.decision === 'not-recorded'), true);
    assert.equal(evaluateLocalModelGovernanceReviewWorkspace(one).status, 'draft-in-progress');

    const cleared = apply(one, { type: 'clear-decision', requirementId: 'tokenizer-license-scope' });
    assert.equal(cleared.requirements.every((item) => item.decision === 'not-recorded'), true);
    assert.equal(cleared.requirements.every((item) => item.explicitlyRecorded === false), true);
    assert.throws(() => apply(original, { type: 'set-decision', requirementId: 'unknown' as never, decision: 'proceed' }));
    assert.throws(() => apply(original, { type: 'set-decision', requirementId: 'tokenizer-license-scope', decision: 'not-recorded' as never }));
    assert.throws(() => apply(original, { type: 'clear-decision', requirementId: 'unknown' as never }));
  });

  it('requires four explicit decisions but does not auto-finalize or call the clock', () => {
    let clockCalls = 0;
    const complete = recordAll({
      ...trustedWorkspace(),
      clock: () => { clockCalls += 1; return '2026-07-18T00:00:00Z'; },
    });
    const result = evaluateLocalModelGovernanceReviewWorkspace(complete);
    assert.equal(result.status, 'ready-to-finalize');
    assert.equal(result.recordedDecisionCount, 4);
    assert.equal(result.allDecisionsExplicit, true);
    assert.equal(result.canRequestFinalize, true);
    assert.equal(result.finalizeRequested, false);
    assert.equal(result.finalizedRecord, null);
    assert.equal(result.canonicalRecordFinalized, false);
    assert.equal(clockCalls, 0);
  });

  it('finalizes four proceed decisions only after the explicit finalize event through Phase 6.1', () => {
    let clockCalls = 0;
    const complete = recordAll({
      ...trustedWorkspace(),
      clock: () => { clockCalls += 1; return '2026-07-18T00:00:00Z'; },
    });
    const requested = apply(complete, { type: 'request-finalize' });
    assert.equal(requested.finalizeRequested, true);
    assert.equal(requested.status, 'finalize-requested');
    const mapped = mapWorkspaceDraftToGovernanceDecisionRecordInput(requested);
    assert.equal(mapped.finalizeRequested, true);
    assert.equal(mapped.actorContext?.actorRole, 'model-governance-reviewer');
    assert.equal(mapped.decisions.length, 4);

    const result = evaluateLocalModelGovernanceReviewWorkspace(requested);
    assert.equal(clockCalls, 1);
    assert.equal(result.status, 'finalized-proceed');
    assert.ok(result.finalizedRecord);
    assert.equal(result.finalizedRecord.outcome, 'proceed');
    assert.equal(result.canonicalRecordFinalized, true);
    assert.equal(result.canProceedToTrustedPersistenceReview, true);
    assert.equal(result.canProceedToArtifactSelectionRecordingReview, true);
    assert.equal(result.draftPersisted, false);
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
  });

  it('maps explicit rejection and more-evidence outcomes without downstream eligibility', () => {
    for (const [decision, status] of [
      ['reject', 'finalized-rejected'],
      ['request-more-evidence', 'finalized-more-evidence'],
    ] as const) {
      let state = recordAll({ ...trustedWorkspace(), clock: () => '2026-07-18T00:00:00Z' });
      state = apply(state, {
        type: 'set-decision',
        requirementId: 'quantization-conversion',
        decision,
      });
      state = apply(state, { type: 'request-finalize' });
      const result = evaluateLocalModelGovernanceReviewWorkspace(state);
      assert.equal(result.status, status);
      assert.equal(result.canonicalRecordFinalized, true);
      assert.equal(result.canProceedToTrustedPersistenceReview, true);
      assert.equal(result.canProceedToArtifactSelectionRecordingReview, false);
      assert.equal(result.recordAppliedDownstream, false);
    }
  });

  it('supports cancel-finalize and reset-draft as in-memory immutable transitions', () => {
    const complete = recordAll({ ...trustedWorkspace(), clock: () => '2026-07-18T00:00:00Z' });
    const requested = apply(complete, { type: 'request-finalize' });
    const cancelled = apply(requested, { type: 'cancel-finalize' });
    assert.equal(cancelled.finalizeRequested, false);
    assert.equal(cancelled.status, 'ready-to-finalize');
    assert.equal(cancelled.requirements.every((item) => item.explicitlyRecorded), true);

    const reset = apply(cancelled, { type: 'reset-draft' });
    assert.equal(reset.status, 'draft-in-progress');
    assert.equal(reset.finalizeRequested, false);
    assert.equal(reset.finalizedRecord, null);
    assert.equal(reset.requirements.every((item) => item.decision === 'not-recorded'), true);
    assert.equal(reset.requirements.every((item) => item.explicitlyRecorded === false), true);
    assert.equal(reset.claimedDraftPersisted, false);
    assert.equal(reset.claimedRecordPersisted, false);
  });

  it('fails closed for incomplete finalize requests and malformed requirement contracts', () => {
    const draft = apply(trustedWorkspace(), { type: 'begin-review' });
    assert.throws(() => apply(draft, { type: 'request-finalize' }));

    const duplicate = { ...draft, requirements: [draft.requirements[0], ...draft.requirements] };
    const missing = { ...draft, requirements: draft.requirements.slice(0, 3) };
    const mismatch = {
      ...draft,
      requirements: draft.requirements.map((item, index) => index === 0
        ? { ...item, evidenceClosureStatus: 'unresolved' as const }
        : item),
    };
    for (const invalid of [duplicate, missing, mismatch]) {
      const validation = validateLocalModelGovernanceReviewWorkspaceInput(invalid);
      assert.equal(validation.valid, false);
      assert.equal(evaluateLocalModelGovernanceReviewWorkspace(invalid).status, 'attention-required');
    }
  });

  it('invalidates stale candidate, actor, role, permission, authorization, evidence, and revision scopes', () => {
    const base = trustedWorkspace();
    const changedAssertions = [
      externalAssertion({ actorSubjectId: 'opaque:reviewer-002' }),
      externalAssertion({ verifiedRoleIds: [LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE, 'secondary-role'] }),
      externalAssertion({ verifiedPermissionIds: [LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION, 'secondary-permission'] }),
    ];
    for (const assertion of changedAssertions) {
      const changedAdapter = trustedAdapter(assertion).result;
      const changedActorScope = buildLocalModelTrustedActorAssertionScope(assertion);
      const changedScope = buildLocalModelGovernanceReviewWorkspaceScope(base.candidateId, changedAdapter, changedActorScope);
      assert.ok(changedScope);
      const stale = { ...base, adapterResult: changedAdapter, actorAssertionScope: changedActorScope, currentScope: changedScope };
      assert.equal(evaluateLocalModelGovernanceReviewWorkspace(stale).status, 'invalidated');
    }

    const modifiedScopes = [
      { ...base.currentScope!, candidateId: 'qwen3-1-7b-candidate' },
      { ...base.currentScope!, candidateTier: 'standard' as const },
      { ...base.currentScope!, modelClass: '1.7B' },
      { ...base.currentScope!, officialRepositoryId: 'Qwen/Other' },
      { ...base.currentScope!, observedRevision: 'different-revision' },
      { ...base.currentScope!, tokenizerLicenseClosureStatus: 'unresolved' as const },
      { ...base.currentScope!, evidenceClosureRevision: 2 },
      { ...base.currentScope!, governanceDecisionRecordPolicyRevision: 2 },
      { ...base.currentScope!, externalAuthAssertionRevision: 2 },
      { ...base.currentScope!, trustedActorContextRevision: 2 },
      { ...base.currentScope!, trustedActorAdapterPolicyRevision: 2 },
      { ...base.currentScope!, workspacePolicyRevision: 2 },
    ];
    for (const currentScope of modifiedScopes) {
      assert.equal(evaluateLocalModelGovernanceReviewWorkspace({ ...base, currentScope }).status, 'invalidated');
    }
    assert.equal(evaluateLocalModelGovernanceReviewWorkspace({ ...base, previouslyInvalidated: true }).status, 'invalidated');
  });

  it('compares explicit workspace scopes including order-independent actor claim sets', () => {
    const firstAssertion = externalAssertion({
      verifiedRoleIds: [LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE, 'secondary-role'],
      verifiedPermissionIds: [LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION, 'secondary-permission'],
    });
    const secondAssertion = externalAssertion({
      verifiedRoleIds: ['secondary-role', LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE],
      verifiedPermissionIds: ['secondary-permission', LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION],
    });
    const firstAdapter = trustedAdapter(firstAssertion).result;
    const secondAdapter = trustedAdapter(secondAssertion).result;
    const first = buildLocalModelGovernanceReviewWorkspaceScope(
      'qwen3-0-6b-candidate',
      firstAdapter,
      buildLocalModelTrustedActorAssertionScope(firstAssertion),
    );
    const second = buildLocalModelGovernanceReviewWorkspaceScope(
      'qwen3-0-6b-candidate',
      secondAdapter,
      buildLocalModelTrustedActorAssertionScope(secondAssertion),
    );
    assert.ok(first && second);
    assert.notEqual(first, second);
    assert.equal(isSameLocalModelGovernanceReviewWorkspaceScope(first, second), true);
    assert.equal(isSameLocalModelGovernanceReviewWorkspaceScope(first, { ...second, workspacePolicyRevision: 2 }), false);
  });

  it('rejects forbidden persistence, signing, downstream, approval, and readiness claims', () => {
    const base = trustedWorkspace();
    const flags = [
      'claimedDraftPersisted',
      'claimedRecordPersisted',
      'claimedRecordSigned',
      'claimedRecordAppliedDownstream',
      'claimedModelApproved',
      'claimedLicenseApproved',
      'claimedArtifactSelected',
      'claimedArtifactApproved',
      'claimedChecksumVerified',
      'claimedBenchmarkVerified',
      'claimedDownloadable',
      'claimedRuntimeReady',
      'claimedModelActive',
    ] as const;
    for (const flag of flags) {
      const result = evaluateLocalModelGovernanceReviewWorkspace({ ...base, [flag]: true });
      assert.equal(result.status, 'attention-required', flag);
    }
    assert.equal(evaluateLocalModelGovernanceReviewWorkspace({
      ...base,
      finalizedRecord: {} as never,
      finalizeRequested: false,
    }).status, 'attention-required');
  });

  it('keeps policy outputs deterministic, unique, private, and non-mutating', () => {
    const state = trustedWorkspace();
    const before = structuredClone(state);
    const first = evaluateLocalModelGovernanceReviewWorkspace(state);
    const second = evaluateLocalModelGovernanceReviewWorkspace(state);
    assert.deepEqual(state, before);
    assert.deepEqual(first.blockers, second.blockers);
    assert.equal(new Set(first.blockers).size, first.blockers.length);
    assert.equal(new Set(first.warnings).size, first.warnings.length);
    assert.doesNotMatch([...first.blockers, ...first.warnings].join(' '), /opaque:reviewer-001/);
  });

  it('preserves Phase 5 closeout, protected registries, and blocked-safe lifecycle state', () => {
    const closeout = buildLocalModelGovernanceBenchmarkCloseout();
    assert.equal(closeout.status, 'foundation-complete');
    assert.equal(closeout.phase5FoundationComplete, true);
    assert.equal(closeout.productionBlockedSafe, true);
    assert.equal(closeout.aggregate.activeModels, 0);
    assert.equal(LOCAL_MODEL_APPROVAL_REGISTRY.every((item) => item.approved === false), true);
    assert.equal(LOCAL_MODEL_ARTIFACT_MANIFEST.every((item) => item.approvalStatus === 'candidate-unapproved'), true);
  });

  it('rejects forged trusted results when the assertion scope is not compatible with the mapped actor context', () => {
    const trusted = trustedAdapter();
    const validScope = buildLocalModelTrustedActorAssertionScope(trusted.assertion);
    assert.equal(buildLocalModelGovernanceReviewWorkspaceScope(
      'qwen3-0-6b-candidate',
      trusted.result,
      { ...validScope, adapterPolicyRevision: 2 },
    ), null);
    assert.equal(buildLocalModelGovernanceReviewWorkspaceScope(
      'qwen3-0-6b-candidate',
      trusted.result,
      { ...validScope, actorSubjectId: 'opaque:reviewer-forged' },
    ), null);
  });

  it('exposes the current deterministic workspace policy revision', () => {
    assert.equal(LOCAL_MODEL_GOVERNANCE_REVIEW_WORKSPACE_POLICY_REVISION, 1);
  });
});
