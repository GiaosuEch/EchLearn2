import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from '../../src/platform/ai/localModelArtifactManifest.ts';
import { buildLocalModelGovernanceBenchmarkCloseout } from '../../src/platform/ai/localModelGovernanceBenchmarkCloseout.ts';
import {
  buildCurrentLocalModelGovernanceDecisionRecordResults,
  createEmptyLocalModelGovernanceDecisionRecordInput,
  evaluateLocalModelGovernanceDecisionRecord,
} from '../../src/platform/ai/localModelGovernanceDecisionRecordPolicy.ts';
import {
  LOCAL_MODEL_EXTERNAL_AUTH_ASSERTION_REVISION,
  LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION,
  LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE,
  LOCAL_MODEL_TRUSTED_ACTOR_CONTEXT_ADAPTER_POLICY_REVISION,
  buildCurrentLocalModelTrustedActorContextAdapterResult,
  buildLocalModelTrustedActorAssertionScope,
  evaluateLocalModelTrustedActorContextAdapter,
  isSameLocalModelTrustedActorAssertionScope,
  mapExternalAssertionToTrustedActorContext,
  validateExternalTrustedActorAssertion,
  validateMappedTrustedActorContextCompatibility,
} from '../../src/platform/ai/localModelTrustedActorContextAdapter.ts';
import type {
  LocalModelExternalTrustedActorAssertion,
  LocalModelTrustedActorContextAdapterInput,
} from '../../src/platform/ai/localModelTrustedActorContextAdapterTypes.ts';

function assertion(
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

function input(
  externalAssertion: LocalModelExternalTrustedActorAssertion | null,
  overrides: Partial<LocalModelTrustedActorContextAdapterInput> = {},
): LocalModelTrustedActorContextAdapterInput {
  return {
    assertion: externalAssertion,
    previousAssertionScope: null,
    previouslyInvalidated: false,
    adapterPolicyRevision: LOCAL_MODEL_TRUSTED_ACTOR_CONTEXT_ADAPTER_POLICY_REVISION,
    ...overrides,
  };
}

describe('Phase 6.2 external trusted actor context adapter', () => {
  it('keeps the current production adapter unavailable without an assertion or mapped context', () => {
    const result = buildCurrentLocalModelTrustedActorContextAdapterResult();
    assert.equal(result.status, 'unavailable');
    assert.equal(result.assertionPresent, false);
    assert.equal(result.mappedTrustedActorContext, null);
    assert.equal(result.trustedContextReady, false);
    assert.equal(result.canSupplyActorContextToGovernanceRecord, false);
    assert.equal(result.canOpenGovernanceDecisionDraft, false);
    assert.equal(result.governanceDecisionRecorded, false);
    assert.equal(result.governanceRecordFinalized, false);
    assert.equal(result.governanceRecordPersisted, false);
    assert.equal(result.recordAppliedDownstream, false);
    assert.equal(result.modelActive, false);
  });

  it('distinguishes unauthenticated, contradictory, unchecked, and denied assertions', () => {
    const unauthenticated = evaluateLocalModelTrustedActorContextAdapter(input(assertion({
      authenticationOutcome: 'unauthenticated',
      authorizationOutcome: 'unchecked',
    })));
    assert.equal(unauthenticated.status, 'unauthenticated');
    assert.equal(unauthenticated.mappedTrustedActorContext, null);

    const contradictory = evaluateLocalModelTrustedActorContextAdapter(input(assertion({
      authenticationOutcome: 'unauthenticated',
      authorizationOutcome: 'granted',
    })));
    assert.equal(contradictory.status, 'attention-required');

    for (const authorizationOutcome of ['unchecked', 'denied'] as const) {
      const result = evaluateLocalModelTrustedActorContextAdapter(input(assertion({ authorizationOutcome })));
      assert.equal(result.status, 'unauthorized');
      assert.equal(result.mappedTrustedActorContext, null);
    }
  });

  it('validates opaque actor subjects without trimming, lowercasing, or deriving identity', () => {
    const invalidSubjects = [
      '',
      '        ',
      ' leading-subject',
      'trailing-subject ',
      'reviewer@example.com',
      'contains whitespace',
      'x'.repeat(129),
      'unsafe/subject',
    ];
    for (const actorSubjectId of invalidSubjects) {
      const result = evaluateLocalModelTrustedActorContextAdapter(input(assertion({ actorSubjectId })));
      assert.equal(result.status, 'attention-required', actorSubjectId);
      assert.equal(result.mappedTrustedActorContext, null);
    }
    assert.equal(evaluateLocalModelTrustedActorContextAdapter(input(assertion({
      actorSubjectId: 'Opaque.Subject_01:reviewer-id',
    }))).status, 'trusted-context-ready');
  });

  it('validates role and permission arrays strictly without silently deduplicating or normalizing', () => {
    const invalidAssertions: LocalModelExternalTrustedActorAssertion[] = [
      assertion({ verifiedRoleIds: null as never }),
      assertion({ verifiedPermissionIds: null as never }),
      assertion({ verifiedRoleIds: [1 as never] }),
      assertion({ verifiedPermissionIds: [1 as never] }),
      assertion({ verifiedRoleIds: [LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE, LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE] }),
      assertion({ verifiedPermissionIds: [LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION, LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION] }),
      assertion({ verifiedRoleIds: [` ${LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE}`] }),
      assertion({ verifiedPermissionIds: [`${LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION} `] }),
      assertion({ verifiedRoleIds: Array.from({ length: 33 }, (_, index) => `role-${index}`) }),
      assertion({ verifiedPermissionIds: Array.from({ length: 33 }, (_, index) => `permission-${index}`) }),
    ];
    for (const candidate of invalidAssertions) {
      assert.equal(evaluateLocalModelTrustedActorContextAdapter(input(candidate)).status, 'attention-required');
    }
  });

  it('requires the exact case-sensitive reviewer role and permission instead of generic admin claims', () => {
    const unauthorizedAssertions = [
      assertion({ verifiedRoleIds: ['admin'] }),
      assertion({ verifiedRoleIds: ['owner'] }),
      assertion({ verifiedRoleIds: ['administrator'] }),
      assertion({ verifiedRoleIds: ['Model-Governance-Reviewer'] }),
      assertion({ verifiedPermissionIds: ['Record-Model-Governance-Decision'] }),
      assertion({ verifiedRoleIds: [LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE], verifiedPermissionIds: [] }),
      assertion({ verifiedRoleIds: [], verifiedPermissionIds: [LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION] }),
    ];
    for (const candidate of unauthorizedAssertions) {
      const result = evaluateLocalModelTrustedActorContextAdapter(input(candidate));
      assert.equal(result.status, 'unauthorized');
      assert.equal(result.mappedTrustedActorContext, null);
    }
  });

  it('maps an exact valid assertion to the fixed Phase 6.1 actor contract without copying extra claims', () => {
    const externalAssertion = assertion({
      verifiedRoleIds: ['secondary-role', LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE],
      verifiedPermissionIds: ['secondary-permission', LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION],
    });
    const result = evaluateLocalModelTrustedActorContextAdapter(input(externalAssertion));
    assert.equal(result.status, 'trusted-context-ready');
    assert.equal(result.authenticationReported, true);
    assert.equal(result.authorizationReported, true);
    assert.equal(result.requiredRolePresent, true);
    assert.equal(result.requiredPermissionPresent, true);
    assert.equal(result.trustedContextReady, true);
    assert.equal(result.canSupplyActorContextToGovernanceRecord, true);
    assert.equal(result.canOpenGovernanceDecisionDraft, true);
    assert.deepEqual(result.mappedTrustedActorContext, {
      actorSubjectId: externalAssertion.actorSubjectId,
      actorRole: 'model-governance-reviewer',
      authenticated: true,
      authorizationVerified: true,
      authorizationScope: 'record-model-governance-decision',
      authenticationSource: 'external-auth-boundary',
      actorContextRevision: 1,
    });
    assert.deepEqual(mapExternalAssertionToTrustedActorContext(externalAssertion), result.mappedTrustedActorContext);
    assert.equal(validateMappedTrustedActorContextCompatibility(result.mappedTrustedActorContext).valid, true);
    assert.doesNotMatch(JSON.stringify(result.mappedTrustedActorContext), /secondary-role|secondary-permission/);
  });

  it('enforces the strict assertion allowlist without exposing unexpected PII or credential values', () => {
    const sensitiveCases = [
      ['email', 'reviewer@example.com'],
      ['displayName', 'Reviewer Person'],
      ['accessToken', 'secret-access-value'],
      ['refreshToken', 'secret-refresh-value'],
      ['jwt', 'secret-jwt-value'],
      ['session', { value: 'secret-session-value' }],
      ['password', 'secret-password-value'],
    ] as const;
    for (const [key, value] of sensitiveCases) {
      const candidate = { ...assertion(), [key]: value } as unknown as LocalModelExternalTrustedActorAssertion;
      const validation = validateExternalTrustedActorAssertion(candidate);
      const result = evaluateLocalModelTrustedActorContextAdapter(input(candidate));
      assert.equal(validation.valid, false);
      assert.equal(result.status, 'attention-required');
      assert.equal(result.mappedTrustedActorContext, null);
      const blockers = result.blockers.join(' ');
      assert.doesNotMatch(blockers, /reviewer@example\.com|Reviewer Person|secret-/);
      assert.doesNotMatch(blockers, new RegExp(String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  });

  it('rejects invalid sources, outcomes, and revision mismatches', () => {
    const invalidAssertions = [
      assertion({ authenticationSource: 'other-source' as never }),
      assertion({ authenticationOutcome: 'unknown' as never }),
      assertion({ authorizationOutcome: 'unknown' as never }),
      assertion({ assertionRevision: LOCAL_MODEL_EXTERNAL_AUTH_ASSERTION_REVISION + 1 }),
      assertion({ actorContextRevision: 2 }),
    ];
    for (const candidate of invalidAssertions) {
      assert.equal(evaluateLocalModelTrustedActorContextAdapter(input(candidate)).status, 'attention-required');
    }
    assert.equal(evaluateLocalModelTrustedActorContextAdapter(input(assertion(), {
      adapterPolicyRevision: LOCAL_MODEL_TRUSTED_ACTOR_CONTEXT_ADAPTER_POLICY_REVISION + 1,
    })).status, 'invalidated');
  });

  it('canonicalizes role and permission sets for explicit scope comparison and invalidates stale mappings', () => {
    const firstAssertion = assertion({
      verifiedRoleIds: ['z-role', LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE],
      verifiedPermissionIds: ['z-permission', LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION],
    });
    const reordered = assertion({
      verifiedRoleIds: [LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE, 'z-role'],
      verifiedPermissionIds: [LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION, 'z-permission'],
    });
    const firstScope = buildLocalModelTrustedActorAssertionScope(firstAssertion);
    const secondScope = buildLocalModelTrustedActorAssertionScope(reordered);
    assert.equal(isSameLocalModelTrustedActorAssertionScope(firstScope, secondScope), true);
    assert.notEqual(firstScope, secondScope);

    const changedAssertions = [
      assertion({ actorSubjectId: 'opaque:reviewer-002' }),
      assertion({ authenticationOutcome: 'unauthenticated', authorizationOutcome: 'unchecked' }),
      assertion({ authorizationOutcome: 'denied' }),
      assertion({ verifiedRoleIds: [LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE, 'changed-role'] }),
      assertion({ verifiedPermissionIds: [LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION, 'changed-permission'] }),
    ];
    for (const changed of changedAssertions) {
      const result = evaluateLocalModelTrustedActorContextAdapter(input(changed, { previousAssertionScope: firstScope }));
      assert.equal(result.status, 'invalidated');
      assert.equal(result.mappedTrustedActorContext, null);
    }
    assert.equal(evaluateLocalModelTrustedActorContextAdapter(input(firstAssertion, { previouslyInvalidated: true })).status, 'invalidated');
  });

  it('does not mutate assertions or claim authentication, authorization, persistence, approval, or readiness work', () => {
    const externalAssertion = assertion({
      verifiedRoleIds: ['extra-role', LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE],
      verifiedPermissionIds: ['extra-permission', LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION],
    });
    const before = structuredClone(externalAssertion);
    const first = evaluateLocalModelTrustedActorContextAdapter(input(externalAssertion));
    const second = evaluateLocalModelTrustedActorContextAdapter(input(externalAssertion));
    assert.deepEqual(externalAssertion, before);
    assert.deepEqual(first.blockers, second.blockers);
    assert.equal(new Set(first.blockers).size, first.blockers.length);
    assert.doesNotMatch(first.blockers.join(' '), /opaque:reviewer-001/);
    assert.equal(first.authenticationPerformedByAdapter, false);
    assert.equal(first.authorizationPerformedByAdapter, false);
    assert.equal(first.credentialsRead, false);
    assert.equal(first.tokensRead, false);
    assert.equal(first.persisted, false);
    assert.equal(first.governanceDecisionRecorded, false);
    assert.equal(first.governanceRecordFinalized, false);
    assert.equal(first.governanceRecordPersisted, false);
    assert.equal(first.recordAppliedDownstream, false);
    assert.equal(first.modelApproved, false);
    assert.equal(first.licenseApproved, false);
    assert.equal(first.artifactSelected, false);
    assert.equal(first.artifactApproved, false);
    assert.equal(first.checksumVerified, false);
    assert.equal(first.benchmarkVerified, false);
    assert.equal(first.downloadable, false);
    assert.equal(first.runtimeReady, false);
    assert.equal(first.modelActive, false);
  });

  it('supplies a compatible actor context to Phase 6.1 without decisions, finalization, persistence, or clock use', () => {
    const mapped = evaluateLocalModelTrustedActorContextAdapter(input(assertion())).mappedTrustedActorContext;
    assert.ok(mapped);
    let clockCalls = 0;
    const recordInput = createEmptyLocalModelGovernanceDecisionRecordInput('qwen3-1-7b-candidate');
    const recordResult = evaluateLocalModelGovernanceDecisionRecord({
      ...recordInput,
      actorContext: mapped,
      clock: () => { clockCalls += 1; return '2026-07-18T12:00:00.000Z'; },
    });
    assert.equal(recordResult.status, 'awaiting-explicit-decisions');
    assert.equal(recordResult.recordedDecisionItems, 0);
    assert.equal(recordResult.canonicalRecord, null);
    assert.equal(recordResult.persisted, false);
    assert.equal(recordResult.appliedToArtifactSelection, false);
    assert.equal(clockCalls, 0);
  });

  it('leaves Phase 6.1 production results, Phase 5 closeout, approval registry, and artifact manifest unchanged', () => {
    const recordsBefore = structuredClone(buildCurrentLocalModelGovernanceDecisionRecordResults());
    const approvalBefore = structuredClone(LOCAL_MODEL_APPROVAL_REGISTRY);
    const manifestBefore = structuredClone(LOCAL_MODEL_ARTIFACT_MANIFEST);
    evaluateLocalModelTrustedActorContextAdapter(input(assertion()));
    assert.deepEqual(buildCurrentLocalModelGovernanceDecisionRecordResults(), recordsBefore);
    assert.deepEqual(LOCAL_MODEL_APPROVAL_REGISTRY, approvalBefore);
    assert.deepEqual(LOCAL_MODEL_ARTIFACT_MANIFEST, manifestBefore);
    assert.ok(recordsBefore.every((record) => record.status === 'awaiting-trusted-actor'));
    const closeout = buildLocalModelGovernanceBenchmarkCloseout();
    assert.equal(closeout.status, 'foundation-complete');
    assert.equal(closeout.phase5FoundationComplete, true);
    assert.equal(closeout.productionBlockedSafe, true);
    assert.equal(closeout.aggregate.activeModels, 0);
  });
});
