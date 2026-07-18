import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from '../../src/platform/ai/localModelArtifactManifest.ts';
import { buildCurrentLocalModelAcquisitionCloseout } from '../../src/platform/ai/localModelAcquisitionCloseout.ts';
import { listCurrentLocalModelCandidateReviewDecisions } from '../../src/platform/ai/localModelCandidateReviewDecisionPolicy.ts';
import { listCurrentLocalModelGovernanceReviewPackets } from '../../src/platform/ai/localModelGovernanceReviewPacket.ts';
import {
  listLocalModelGovernanceEvidenceClosures,
} from '../../src/platform/ai/localModelGovernanceEvidenceClosureRegistry.ts';
import type {
  LocalModelGovernanceEvidenceClosureCandidateRecord,
  LocalModelGovernanceEvidenceClosureRequirementId,
  LocalModelGovernanceEvidenceClosureStatus,
} from '../../src/platform/ai/localModelGovernanceEvidenceClosureTypes.ts';
import {
  LOCAL_MODEL_GOVERNANCE_EVIDENCE_CLOSURE_REVISION,
  LOCAL_MODEL_HUMAN_GOVERNANCE_DECISION_POLICY_REVISION,
  buildCurrentLocalModelHumanGovernanceDecisions,
  buildLocalModelHumanGovernanceDecisionScope,
  createUnrecordedLocalModelHumanGovernanceDecisionInput,
  evaluateLocalModelHumanGovernanceDecision,
  isSameLocalModelHumanGovernanceDecisionScope,
  validateLocalModelHumanGovernanceDecisionInputs,
} from '../../src/platform/ai/localModelHumanGovernanceDecisionPolicy.ts';
import type {
  LocalModelHumanGovernanceDecisionInput,
  LocalModelHumanGovernanceDecisionScope,
} from '../../src/platform/ai/localModelHumanGovernanceDecisionTypes.ts';

const REQUIREMENTS: readonly LocalModelGovernanceEvidenceClosureRequirementId[] = [
  'tokenizer-license-scope',
  'acceptable-use-scope',
  'derived-artifact-hosting',
  'quantization-conversion',
] as const;

function currentClosure(index = 1): LocalModelGovernanceEvidenceClosureCandidateRecord {
  return structuredClone(listLocalModelGovernanceEvidenceClosures()[index]);
}

function closureWithStatus(
  requirementId: LocalModelGovernanceEvidenceClosureRequirementId,
  status: LocalModelGovernanceEvidenceClosureStatus,
): LocalModelGovernanceEvidenceClosureCandidateRecord {
  const closure = currentClosure();
  return {
    ...closure,
    status,
    requirements: closure.requirements.map((item) => item.requirementId === requirementId
      ? {
        ...item,
        status,
        factualEvidenceComplete: status === 'factual-evidence-collected' || status === 'sufficient-for-human-decision',
      }
      : item),
  };
}

function unrecordedInput(
  closure: LocalModelGovernanceEvidenceClosureCandidateRecord = currentClosure(),
): LocalModelHumanGovernanceDecisionInput {
  return createUnrecordedLocalModelHumanGovernanceDecisionInput(closure);
}

function withDecisions(
  decisions: Partial<Record<LocalModelGovernanceEvidenceClosureRequirementId, 'proceed' | 'reject' | 'request-more-evidence'>>,
  closure: LocalModelGovernanceEvidenceClosureCandidateRecord = currentClosure(),
): LocalModelHumanGovernanceDecisionInput {
  const input = unrecordedInput(closure);
  return {
    ...input,
    decisions: input.decisions.map((item) => {
      const decision = decisions[item.requirementId];
      return decision ? { ...item, decision, decisionRecorded: true } : item;
    }),
  };
}

function allProceedInput(
  closure: LocalModelGovernanceEvidenceClosureCandidateRecord = currentClosure(),
): LocalModelHumanGovernanceDecisionInput {
  return withDecisions(Object.fromEntries(REQUIREMENTS.map((id) => [id, 'proceed'])) as Record<
    LocalModelGovernanceEvidenceClosureRequirementId,
    'proceed'
  >, closure);
}

describe('Phase 5.8 explicit human governance decision policy', () => {
  it('builds exactly three awaiting production sessions with twelve unrecorded items', () => {
    const closures = listLocalModelGovernanceEvidenceClosures();
    const results = buildCurrentLocalModelHumanGovernanceDecisions();
    assert.equal(results.length, 3);
    assert.deepEqual(results.map((result) => result.candidateId), closures.map((record) => record.candidateId));
    assert.equal(new Set(results.map((result) => result.candidateId)).size, 3);
    assert.ok(results.every((result) => result.candidateTier !== ('ultra-low' as never)));
    assert.ok(results.every((result) => result.status === 'awaiting-human-decision'));
    assert.ok(results.every((result) => result.totalDecisionItems === 4));
    assert.equal(results.reduce((sum, result) => sum + result.totalDecisionItems, 0), 12);
    assert.equal(results.reduce((sum, result) => sum + result.recordedDecisionItems, 0), 0);
    assert.ok(results.every((result) => result.canRecordDecision));
    assert.ok(results.every((result) => !result.canProceedToArtifactSelectionReview));
  });

  it('keeps exact candidate identity and the Light, Standard, Pro matrix', () => {
    const expected = new Map([
      ['qwen3-0-6b-candidate', ['light', '0.6B', 'Qwen3-0.6B']],
      ['qwen3-1-7b-candidate', ['standard', '1.7B', 'Qwen3-1.7B']],
      ['qwen3-4b-candidate', ['pro', '4B', 'Qwen3-4B']],
    ]);
    for (const closure of listLocalModelGovernanceEvidenceClosures()) {
      assert.deepEqual(
        [closure.candidateTier, closure.modelClass, closure.exactModelName],
        expected.get(closure.candidateId),
      );
    }
  });

  it('does not infer proceed decisions from factual evidence or sufficient-for-human-decision status', () => {
    const input = unrecordedInput();
    assert.ok(input.decisions.some((item) => item.evidenceClosureStatus === 'factual-evidence-collected'));
    assert.ok(input.decisions.some((item) => item.evidenceClosureStatus === 'sufficient-for-human-decision'));
    assert.ok(input.decisions.every((item) => item.decision === 'not-recorded'));
    assert.ok(input.decisions.every((item) => item.decisionRecorded === false));
    const result = evaluateLocalModelHumanGovernanceDecision(input);
    assert.equal(result.status, 'awaiting-human-decision');
    assert.equal(result.proceedDecisionItems, 0);
  });

  it('classifies an explicit partial session without allowing artifact-selection review', () => {
    const result = evaluateLocalModelHumanGovernanceDecision(withDecisions({
      'tokenizer-license-scope': 'proceed',
    }));
    assert.equal(result.status, 'partially-recorded');
    assert.equal(result.recordedDecisionItems, 1);
    assert.equal(result.proceedDecisionItems, 1);
    assert.equal(result.humanDecisionRecorded, true);
    assert.equal(result.allRequiredDecisionsRecorded, false);
    assert.equal(result.canProceedToArtifactSelectionReview, false);
  });

  it('allows only four recorded proceed decisions to complete the governance boundary', () => {
    const result = evaluateLocalModelHumanGovernanceDecision(allProceedInput());
    assert.equal(result.status, 'governance-decisions-complete');
    assert.equal(result.recordedDecisionItems, 4);
    assert.equal(result.proceedDecisionItems, 4);
    assert.equal(result.allRequiredDecisionsRecorded, true);
    assert.equal(result.canProceedToArtifactSelectionReview, true);
    assert.equal(result.modelApproved, false);
    assert.equal(result.licenseApproved, false);
    assert.equal(result.artifactSelected, false);
    assert.equal(result.artifactApproved, false);
    assert.equal(result.checksumPinned, false);
    assert.equal(result.checksumVerified, false);
    assert.equal(result.benchmarkVerified, false);
    assert.equal(result.downloadable, false);
    assert.equal(result.runtimeReady, false);
    assert.equal(result.modelActive, false);
  });

  it('gives rejection and request-more-evidence precedence over completion', () => {
    const rejected = evaluateLocalModelHumanGovernanceDecision(withDecisions({
      'tokenizer-license-scope': 'proceed',
      'acceptable-use-scope': 'proceed',
      'derived-artifact-hosting': 'reject',
      'quantization-conversion': 'proceed',
    }));
    assert.equal(rejected.status, 'rejected');
    assert.equal(rejected.rejectedDecisionItems, 1);
    assert.equal(rejected.canProceedToArtifactSelectionReview, false);

    const moreEvidence = evaluateLocalModelHumanGovernanceDecision(withDecisions({
      'tokenizer-license-scope': 'proceed',
      'acceptable-use-scope': 'request-more-evidence',
    }));
    assert.equal(moreEvidence.status, 'more-evidence-requested');
    assert.equal(moreEvidence.moreEvidenceDecisionItems, 1);
    assert.equal(moreEvidence.canProceedToArtifactSelectionReview, false);
  });

  it('fails closed for inconsistent decision flags', () => {
    const input = unrecordedInput();
    const unflaggedProceed = {
      ...input,
      decisions: input.decisions.map((item, index) => index === 0
        ? { ...item, decision: 'proceed' as const, decisionRecorded: false }
        : item),
    };
    assert.equal(evaluateLocalModelHumanGovernanceDecision(unflaggedProceed).status, 'attention-required');

    const flaggedUnrecorded = {
      ...input,
      decisions: input.decisions.map((item, index) => index === 0
        ? { ...item, decision: 'not-recorded' as const, decisionRecorded: true }
        : item),
    };
    assert.equal(evaluateLocalModelHumanGovernanceDecision(flaggedUnrecorded).status, 'attention-required');
  });

  it('fails closed for duplicate, missing, or unknown requirement items', () => {
    const input = unrecordedInput();
    assert.equal(evaluateLocalModelHumanGovernanceDecision({
      ...input,
      decisions: [...input.decisions.slice(0, 3), input.decisions[0]],
    }).status, 'attention-required');
    assert.equal(evaluateLocalModelHumanGovernanceDecision({
      ...input,
      decisions: input.decisions.slice(0, 3),
    }).status, 'attention-required');
    assert.equal(evaluateLocalModelHumanGovernanceDecision({
      ...input,
      decisions: [{ ...input.decisions[0], requirementId: 'unknown-requirement' as never }, ...input.decisions.slice(1)],
    }).status, 'attention-required');
  });

  it('keeps unresolved evidence unavailable and conflicting evidence attention-required', () => {
    const unresolved = closureWithStatus('tokenizer-license-scope', 'unresolved');
    const unresolvedResult = evaluateLocalModelHumanGovernanceDecision(unrecordedInput(unresolved));
    assert.equal(unresolvedResult.status, 'unavailable');
    assert.equal(unresolvedResult.canRecordDecision, false);

    const conflicting = closureWithStatus('acceptable-use-scope', 'conflicting-evidence');
    const conflictingResult = evaluateLocalModelHumanGovernanceDecision(unrecordedInput(conflicting));
    assert.equal(conflictingResult.status, 'attention-required');
    assert.equal(conflictingResult.canRecordDecision, false);
  });

  it('compares every explicit governance-decision scope field', () => {
    const scope = buildLocalModelHumanGovernanceDecisionScope(currentClosure());
    assert.equal(isSameLocalModelHumanGovernanceDecisionScope(scope, structuredClone(scope)), true);
    const changes: Array<[keyof LocalModelHumanGovernanceDecisionScope, unknown]> = [
      ['candidateId', 'different-candidate'],
      ['candidateTier', 'pro'],
      ['modelClass', '4B'],
      ['exactModelName', 'Different model'],
      ['officialRepositoryId', 'Qwen/Different'],
      ['observedRevision', 'different-revision'],
      ['tokenizerLicenseClosureStatus', 'unresolved'],
      ['acceptableUseClosureStatus', 'unresolved'],
      ['derivedHostingClosureStatus', 'unresolved'],
      ['quantizationClosureStatus', 'unresolved'],
      ['evidenceClosureRevision', LOCAL_MODEL_GOVERNANCE_EVIDENCE_CLOSURE_REVISION + 1],
      ['governanceDecisionPolicyRevision', LOCAL_MODEL_HUMAN_GOVERNANCE_DECISION_POLICY_REVISION + 1],
    ];
    for (const [key, value] of changes) {
      assert.equal(isSameLocalModelHumanGovernanceDecisionScope(scope, { ...scope, [key]: value }), false, key);
    }
  });

  it('invalidates old decisions after any candidate, repository, revision, closure, or policy scope change', () => {
    const input = allProceedInput();
    const mutations: Array<Partial<LocalModelHumanGovernanceDecisionScope>> = [
      { candidateId: 'qwen3-4b-candidate' },
      { candidateTier: 'pro' },
      { modelClass: '4B' },
      { exactModelName: 'Qwen3-4B' },
      { officialRepositoryId: 'Qwen/Qwen3-4B' },
      { observedRevision: 'changed-revision' },
      { tokenizerLicenseClosureStatus: 'unresolved' },
      { acceptableUseClosureStatus: 'unresolved' },
      { derivedHostingClosureStatus: 'unresolved' },
      { quantizationClosureStatus: 'unresolved' },
      { evidenceClosureRevision: 2 },
      { governanceDecisionPolicyRevision: 2 },
    ];
    for (const mutation of mutations) {
      const result = evaluateLocalModelHumanGovernanceDecision({
        ...input,
        scope: { ...input.scope, ...mutation },
      });
      assert.equal(result.status, 'invalidated', JSON.stringify(mutation));
      assert.equal(result.canProceedToArtifactSelectionReview, false);
    }
  });

  it('does not carry decisions across Light, Standard, Pro, candidates, or revisions', () => {
    const closures = listLocalModelGovernanceEvidenceClosures();
    const light = buildLocalModelHumanGovernanceDecisionScope(closures[0]);
    const standard = buildLocalModelHumanGovernanceDecisionScope(closures[1]);
    const pro = buildLocalModelHumanGovernanceDecisionScope(closures[2]);
    assert.equal(isSameLocalModelHumanGovernanceDecisionScope(light, standard), false);
    assert.equal(isSameLocalModelHumanGovernanceDecisionScope(standard, pro), false);
    assert.equal(isSameLocalModelHumanGovernanceDecisionScope(standard, { ...standard, observedRevision: 'old' }), false);
  });

  it('blocks unknown candidates safely and honors prior invalidation', () => {
    const input = unrecordedInput();
    const unknown = evaluateLocalModelHumanGovernanceDecision({
      ...input,
      candidateId: 'unknown-candidate',
      closureRecord: null,
    });
    assert.equal(unknown.status, 'unavailable');
    assert.equal(unknown.canRecordDecision, false);

    const invalidated = evaluateLocalModelHumanGovernanceDecision({
      ...allProceedInput(),
      sessionPreviouslyInvalidated: true,
    });
    assert.equal(invalidated.status, 'invalidated');
    assert.equal(invalidated.canProceedToArtifactSelectionReview, false);
  });

  it('rejects duplicate candidate sessions and keeps blockers deterministic and unique', () => {
    const input = unrecordedInput();
    const validation = validateLocalModelHumanGovernanceDecisionInputs([input, structuredClone(input)]);
    assert.equal(validation.valid, false);
    assert.ok(validation.issues.some((issue) => issue.startsWith('duplicate-candidate-session:')));

    const first = evaluateLocalModelHumanGovernanceDecision({
      ...input,
      decisions: input.decisions.slice(0, 3),
    });
    const second = evaluateLocalModelHumanGovernanceDecision({
      ...input,
      decisions: input.decisions.slice(0, 3),
    });
    assert.deepEqual(first.blockers, second.blockers);
    assert.equal(new Set(first.blockers).size, first.blockers.length);
  });

  it('does not mutate input or historical Phase 5 and production foundations', () => {
    const input = allProceedInput();
    const before = structuredClone(input);
    const phase52 = structuredClone(listCurrentLocalModelCandidateReviewDecisions());
    const phase56 = structuredClone(listCurrentLocalModelGovernanceReviewPackets());
    const phase57 = structuredClone(listLocalModelGovernanceEvidenceClosures());
    const approvals = structuredClone(LOCAL_MODEL_APPROVAL_REGISTRY);
    const manifest = structuredClone(LOCAL_MODEL_ARTIFACT_MANIFEST);

    evaluateLocalModelHumanGovernanceDecision(input);
    assert.deepEqual(input, before);
    assert.deepEqual(listCurrentLocalModelCandidateReviewDecisions(), phase52);
    assert.deepEqual(listCurrentLocalModelGovernanceReviewPackets(), phase56);
    assert.deepEqual(listLocalModelGovernanceEvidenceClosures(), phase57);
    assert.deepEqual(LOCAL_MODEL_APPROVAL_REGISTRY, approvals);
    assert.deepEqual(LOCAL_MODEL_ARTIFACT_MANIFEST, manifest);
    assert.equal(buildCurrentLocalModelAcquisitionCloseout().phaseFoundationComplete, true);
    assert.equal(buildCurrentLocalModelAcquisitionCloseout().activeModels, 0);
  });
});
