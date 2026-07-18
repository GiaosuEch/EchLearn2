import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from '../../src/platform/ai/localModelArtifactManifest.ts';
import { buildLocalModelGovernanceBenchmarkCloseout } from '../../src/platform/ai/localModelGovernanceBenchmarkCloseout.ts';
import {
  listLocalModelGovernanceEvidenceClosures,
} from '../../src/platform/ai/localModelGovernanceEvidenceClosureRegistry.ts';
import type {
  LocalModelGovernanceEvidenceClosureRequirementId,
} from '../../src/platform/ai/localModelGovernanceEvidenceClosureTypes.ts';
import {
  LOCAL_MODEL_GOVERNANCE_DECISION_RECORD_POLICY_REVISION,
  buildCanonicalLocalModelGovernanceDecisionRecord,
  buildCurrentLocalModelGovernanceDecisionRecordResults,
  buildLocalModelGovernanceDecisionRecordKey,
  createEmptyLocalModelGovernanceDecisionRecordInput,
  evaluateLocalModelGovernanceDecisionRecord,
  isSameLocalModelGovernanceDecisionRecordScope,
  validateLocalModelGovernanceDecisionRecordInput,
} from '../../src/platform/ai/localModelGovernanceDecisionRecordPolicy.ts';
import type {
  LocalModelGovernanceDecisionRecordDraftInput,
  LocalModelTrustedGovernanceActorContext,
} from '../../src/platform/ai/localModelGovernanceDecisionRecordTypes.ts';

const REQUIREMENTS: readonly LocalModelGovernanceEvidenceClosureRequirementId[] = [
  'tokenizer-license-scope',
  'acceptable-use-scope',
  'derived-artifact-hosting',
  'quantization-conversion',
] as const;

function actor(
  overrides: Partial<LocalModelTrustedGovernanceActorContext> = {},
): LocalModelTrustedGovernanceActorContext {
  return {
    actorSubjectId: 'actor-subject-001',
    actorRole: 'model-governance-reviewer',
    authenticated: true,
    authorizationVerified: true,
    authorizationScope: 'record-model-governance-decision',
    authenticationSource: 'synthetic-test-fixture',
    actorContextRevision: 1,
    ...overrides,
  };
}

function input(index = 1): LocalModelGovernanceDecisionRecordDraftInput {
  return createEmptyLocalModelGovernanceDecisionRecordInput(
    listLocalModelGovernanceEvidenceClosures()[index].candidateId,
  );
}

function withDecisions(
  values: Partial<Record<LocalModelGovernanceEvidenceClosureRequirementId, 'proceed' | 'reject' | 'request-more-evidence'>>,
  overrides: Partial<LocalModelGovernanceDecisionRecordDraftInput> = {},
): LocalModelGovernanceDecisionRecordDraftInput {
  const base = input();
  return {
    ...base,
    actorContext: actor(),
    decisions: base.decisions.map((item) => {
      const decision = values[item.requirementId];
      return decision ? { ...item, decision, explicitlyRecorded: true } : item;
    }),
    clock: () => '2026-07-18T12:00:00.000Z',
    ...overrides,
  };
}

function allDecisions(
  decision: 'proceed' | 'reject' | 'request-more-evidence' = 'proceed',
  overrides: Partial<LocalModelGovernanceDecisionRecordDraftInput> = {},
): LocalModelGovernanceDecisionRecordDraftInput {
  return withDecisions(
    Object.fromEntries(REQUIREMENTS.map((requirementId) => [requirementId, decision])) as Record<
      LocalModelGovernanceEvidenceClosureRequirementId,
      typeof decision
    >,
    overrides,
  );
}

describe('Phase 6.1 trusted governance decision record policy', () => {
  it('builds exactly three production contracts awaiting a trusted actor without calling a clock', () => {
    let clockCalls = 0;
    const results = buildCurrentLocalModelGovernanceDecisionRecordResults();
    const closures = listLocalModelGovernanceEvidenceClosures();
    assert.equal(results.length, 3);
    assert.deepEqual(results.map((item) => item.candidateId), closures.map((item) => item.candidateId));
    assert.equal(new Set(results.map((item) => item.candidateId)).size, 3);
    assert.ok(results.every((item) => item.candidateTier !== ('ultra-low' as never)));
    assert.ok(results.every((item) => item.status === 'awaiting-trusted-actor'));
    assert.ok(results.every((item) => item.actorContext === null));
    assert.ok(results.every((item) => item.recordedDecisionItems === 0));
    assert.ok(results.every((item) => item.canonicalRecord === null));
    assert.ok(results.every((item) => !item.eligibleForTrustedPersistence));
    const productionInput = createEmptyLocalModelGovernanceDecisionRecordInput(closures[0].candidateId);
    evaluateLocalModelGovernanceDecisionRecord({ ...productionInput, clock: () => { clockCalls += 1; return '2026-07-18T12:00:00.000Z'; } });
    assert.equal(clockCalls, 0);
  });

  it('preserves exact candidate identity and the Light, Standard, Pro tier matrix', () => {
    const expected = new Map([
      ['qwen3-0-6b-candidate', ['light', '0.6B', 'Qwen3-0.6B', 'Qwen/Qwen3-0.6B']],
      ['qwen3-1-7b-candidate', ['standard', '1.7B', 'Qwen3-1.7B', 'Qwen/Qwen3-1.7B']],
      ['qwen3-4b-candidate', ['pro', '4B', 'Qwen3-4B', 'Qwen/Qwen3-4B']],
    ]);
    for (const result of buildCurrentLocalModelGovernanceDecisionRecordResults()) {
      assert.deepEqual(
        [result.candidateTier, result.scope.modelClass, result.scope.exactModelName, result.scope.officialRepositoryId],
        expected.get(result.candidateId),
      );
      assert.match(result.scope.observedRevision ?? '', /^[0-9a-f]{40}$/);
    }
  });

  it('requires a valid trusted actor contract and keeps actor subjects opaque', () => {
    assert.equal(evaluateLocalModelGovernanceDecisionRecord({ ...input(), actorContext: actor({ authenticated: false }) }).status, 'attention-required');
    assert.equal(evaluateLocalModelGovernanceDecisionRecord({ ...input(), actorContext: actor({ authorizationVerified: false }) }).status, 'attention-required');
    assert.equal(evaluateLocalModelGovernanceDecisionRecord({ ...input(), actorContext: actor({ actorRole: 'other' as never }) }).status, 'attention-required');
    assert.equal(evaluateLocalModelGovernanceDecisionRecord({ ...input(), actorContext: actor({ authorizationScope: 'other' as never }) }).status, 'attention-required');
    assert.equal(evaluateLocalModelGovernanceDecisionRecord({ ...input(), actorContext: actor({ actorSubjectId: '' }) }).status, 'attention-required');
    assert.equal(evaluateLocalModelGovernanceDecisionRecord({ ...input(), actorContext: actor({ actorSubjectId: 'reviewer@example.com' }) }).status, 'attention-required');
    assert.equal(evaluateLocalModelGovernanceDecisionRecord({ ...input(), actorContext: actor({ actorSubjectId: 'x'.repeat(129) }) }).status, 'attention-required');
  });

  it('keeps valid actor sessions as drafts until four explicit decisions and finalizeRequested are present', () => {
    const empty = evaluateLocalModelGovernanceDecisionRecord({ ...input(), actorContext: actor() });
    assert.equal(empty.status, 'awaiting-explicit-decisions');
    assert.equal(empty.canonicalRecord, null);

    const partial = evaluateLocalModelGovernanceDecisionRecord(withDecisions({ 'tokenizer-license-scope': 'proceed' }));
    assert.equal(partial.status, 'awaiting-explicit-decisions');
    assert.equal(partial.recordedDecisionItems, 1);
    assert.equal(partial.canonicalRecord, null);

    const draft = evaluateLocalModelGovernanceDecisionRecord(allDecisions('proceed'));
    assert.equal(draft.status, 'draft-valid');
    assert.equal(draft.allDecisionsExplicit, true);
    assert.equal(draft.canonicalRecord, null);
    assert.equal(draft.eligibleForTrustedPersistence, false);
  });

  it('finalizes four explicit proceed decisions with an injected ISO clock without creating approvals', () => {
    let clockCalls = 0;
    const finalInput = allDecisions('proceed', {
      finalizeRequested: true,
      clock: () => { clockCalls += 1; return '2026-07-18T12:00:00.000Z'; },
    });
    const result = evaluateLocalModelGovernanceDecisionRecord(finalInput);
    assert.equal(clockCalls, 1);
    assert.equal(result.status, 'finalized-proceed');
    assert.ok(result.canonicalRecord);
    assert.equal(result.canonicalRecord.reviewedAt, '2026-07-18T12:00:00.000Z');
    assert.equal(result.canonicalRecord.outcome, 'proceed');
    assert.equal(result.eligibleForTrustedPersistence, true);
    assert.equal(result.eligibleForArtifactSelectionRecordingReview, true);
    assert.equal(result.canonicalRecord.persisted, false);
    assert.equal(result.canonicalRecord.signed, false);
    assert.equal(result.canonicalRecord.appliedToArtifactSelection, false);
    assert.equal(result.modelApproved, false);
    assert.equal(result.licenseApproved, false);
    assert.equal(result.artifactSelected, false);
    assert.equal(result.artifactApproved, false);
    assert.equal(result.downloadable, false);
    assert.equal(result.runtimeReady, false);
    assert.equal(result.modelActive, false);
    assert.deepEqual(buildCanonicalLocalModelGovernanceDecisionRecord(finalInput), result.canonicalRecord);
  });

  it('finalizes rejection and request-more-evidence outcomes without downstream eligibility', () => {
    const rejectedInput = allDecisions('proceed', { finalizeRequested: true });
    const rejected = evaluateLocalModelGovernanceDecisionRecord({
      ...rejectedInput,
      decisions: rejectedInput.decisions.map((item) => item.requirementId === 'derived-artifact-hosting'
        ? { ...item, decision: 'reject' as const }
        : item),
    });
    assert.equal(rejected.status, 'finalized-rejected');
    assert.equal(rejected.canonicalRecord?.outcome, 'rejected');
    assert.equal(rejected.eligibleForTrustedPersistence, true);
    assert.equal(rejected.eligibleForArtifactSelectionRecordingReview, false);

    const moreInput = allDecisions('proceed', { finalizeRequested: true });
    const more = evaluateLocalModelGovernanceDecisionRecord({
      ...moreInput,
      decisions: moreInput.decisions.map((item) => item.requirementId === 'acceptable-use-scope'
        ? { ...item, decision: 'request-more-evidence' as const }
        : item),
    });
    assert.equal(more.status, 'finalized-more-evidence');
    assert.equal(more.canonicalRecord?.outcome, 'more-evidence');
    assert.equal(more.eligibleForTrustedPersistence, true);
    assert.equal(more.eligibleForArtifactSelectionRecordingReview, false);
  });

  it('fails closed for inconsistent, duplicate, missing, and unknown decision items', () => {
    const base = input();
    assert.equal(evaluateLocalModelGovernanceDecisionRecord({
      ...base,
      actorContext: actor(),
      decisions: base.decisions.map((item, index) => index === 0
        ? { ...item, decision: 'proceed' as const, explicitlyRecorded: false }
        : item),
    }).status, 'attention-required');
    assert.equal(evaluateLocalModelGovernanceDecisionRecord({
      ...base,
      actorContext: actor(),
      decisions: base.decisions.map((item, index) => index === 0
        ? { ...item, decision: 'not-recorded' as const, explicitlyRecorded: true }
        : item),
    }).status, 'attention-required');
    assert.equal(evaluateLocalModelGovernanceDecisionRecord({ ...base, actorContext: actor(), decisions: [...base.decisions.slice(0, 3), base.decisions[0]] }).status, 'attention-required');
    assert.equal(evaluateLocalModelGovernanceDecisionRecord({ ...base, actorContext: actor(), decisions: base.decisions.slice(0, 3) }).status, 'attention-required');
    assert.equal(evaluateLocalModelGovernanceDecisionRecord({
      ...base,
      actorContext: actor(),
      decisions: base.decisions.map((item, index) => index === 0 ? { ...item, requirementId: 'unknown' as never } : item),
    }).status, 'attention-required');
  });

  it('invalidates records when exact candidate or evidence scope changes', () => {
    const base = allDecisions('proceed', { finalizeRequested: true });
    const mutations = [
      { currentScope: { ...base.currentScope, candidateId: 'qwen3-4b-candidate' } },
      { currentScope: { ...base.currentScope, candidateTier: 'pro' as const } },
      { currentScope: { ...base.currentScope, modelClass: '4B' } },
      { currentScope: { ...base.currentScope, exactModelName: 'Qwen3-4B' } },
      { currentScope: { ...base.currentScope, officialRepositoryId: 'Qwen/Qwen3-4B' } },
      { currentScope: { ...base.currentScope, observedRevision: '0'.repeat(40) } },
      { currentScope: { ...base.currentScope, tokenizerLicenseClosureStatus: 'unresolved' as const } },
      { currentScope: { ...base.currentScope, evidenceClosureRevision: base.currentScope.evidenceClosureRevision + 1 } },
      { currentScope: { ...base.currentScope, governanceDecisionPolicyRevision: base.currentScope.governanceDecisionPolicyRevision + 1 } },
      { currentScope: { ...base.currentScope, governanceDecisionRecordPolicyRevision: LOCAL_MODEL_GOVERNANCE_DECISION_RECORD_POLICY_REVISION + 1 } },
      { currentScope: { ...base.currentScope, recordRevision: base.currentScope.recordRevision + 1 } },
    ];
    for (const mutation of mutations) {
      assert.equal(evaluateLocalModelGovernanceDecisionRecord({ ...base, ...mutation }).status, 'invalidated');
    }
    assert.equal(evaluateLocalModelGovernanceDecisionRecord({ ...base, previouslyInvalidated: true }).status, 'invalidated');
  });

  it('compares scope using explicit fields and prevents cross-tier carry', () => {
    const light = createEmptyLocalModelGovernanceDecisionRecordInput('qwen3-0-6b-candidate').currentScope;
    const standard = createEmptyLocalModelGovernanceDecisionRecordInput('qwen3-1-7b-candidate').currentScope;
    const pro = createEmptyLocalModelGovernanceDecisionRecordInput('qwen3-4b-candidate').currentScope;
    assert.equal(isSameLocalModelGovernanceDecisionRecordScope(light, structuredClone(light)), true);
    assert.equal(isSameLocalModelGovernanceDecisionRecordScope(light, standard), false);
    assert.equal(isSameLocalModelGovernanceDecisionRecordScope(standard, pro), false);
  });

  it('validates injected clock output and does not auto-finalize invalid time', () => {
    const invalid = allDecisions('proceed', { finalizeRequested: true, clock: () => 'not-an-iso-time' });
    const result = evaluateLocalModelGovernanceDecisionRecord(invalid);
    assert.equal(result.status, 'attention-required');
    assert.equal(result.canonicalRecord, null);
    assert.equal(result.eligibleForTrustedPersistence, false);
  });

  it('builds a deterministic non-cryptographic record key without actor or time data', () => {
    const base = allDecisions('proceed', { finalizeRequested: true });
    const first = buildLocalModelGovernanceDecisionRecordKey(base.currentScope, base.recordRevision);
    const second = buildLocalModelGovernanceDecisionRecordKey(structuredClone(base.currentScope), base.recordRevision);
    assert.equal(first, second);
    assert.match(first, /^governance-record:/);
    assert.doesNotMatch(first, /actor-subject|2026-07-18|signature|hash|digest/i);
  });

  it('rejects Phase 6.1 persistence, signature, downstream application, approval, and readiness claims', () => {
    const base = allDecisions('proceed', { finalizeRequested: true });
    const claimFields = [
      'claimedPersisted','claimedSigned','claimedAppliedToArtifactSelection','claimedModelApproved',
      'claimedLicenseApproved','claimedArtifactSelected','claimedArtifactApproved','claimedChecksumVerified',
      'claimedBenchmarkVerified','claimedDownloadable','claimedRuntimeReady','claimedModelActive',
    ] as const;
    for (const field of claimFields) {
      assert.equal(evaluateLocalModelGovernanceDecisionRecord({ ...base, [field]: true }).status, 'attention-required');
    }
  });

  it('does not mutate inputs, and blockers remain deterministic without actor subjects or timestamps', () => {
    const bad = allDecisions('proceed', {
      finalizeRequested: true,
      actorContext: actor({ authenticated: false }),
    });
    const before = structuredClone({ ...bad, clock: null });
    const first = evaluateLocalModelGovernanceDecisionRecord(bad);
    const second = evaluateLocalModelGovernanceDecisionRecord(bad);
    assert.deepEqual({ ...bad, clock: null }, before);
    assert.deepEqual(first.blockers, second.blockers);
    assert.equal(new Set(first.blockers).size, first.blockers.length);
    assert.doesNotMatch(first.blockers.join(' '), /actor-subject-001|2026-07-18|@/i);
    assert.equal(validateLocalModelGovernanceDecisionRecordInput(bad).valid, false);
  });

  it('leaves Phase 5 evidence, decision boundaries, protected registries, and closeout unchanged', () => {
    const closuresBefore = structuredClone(listLocalModelGovernanceEvidenceClosures());
    const approvalBefore = structuredClone(LOCAL_MODEL_APPROVAL_REGISTRY);
    const manifestBefore = structuredClone(LOCAL_MODEL_ARTIFACT_MANIFEST);
    buildCurrentLocalModelGovernanceDecisionRecordResults();
    assert.deepEqual(listLocalModelGovernanceEvidenceClosures(), closuresBefore);
    assert.deepEqual(LOCAL_MODEL_APPROVAL_REGISTRY, approvalBefore);
    assert.deepEqual(LOCAL_MODEL_ARTIFACT_MANIFEST, manifestBefore);
    const closeout = buildLocalModelGovernanceBenchmarkCloseout();
    assert.equal(closeout.status, 'foundation-complete');
    assert.equal(closeout.phase5FoundationComplete, true);
    assert.equal(closeout.productionBlockedSafe, true);
    assert.equal(closeout.aggregate.activeModels, 0);
  });
});
