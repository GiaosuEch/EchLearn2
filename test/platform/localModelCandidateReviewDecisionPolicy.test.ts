import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { buildCurrentLocalModelAcquisitionCloseout } from '../../src/platform/ai/localModelAcquisitionCloseout.ts';
import {
  listLocalModelCandidateEvidence,
} from '../../src/platform/ai/localModelCandidateEvidenceRegistry.ts';
import type { LocalModelCandidateEvidenceRecord } from '../../src/platform/ai/localModelCandidateEvidenceTypes.ts';
import {
  buildCurrentLocalModelCandidateReviewDecisions,
  createUnreviewedLocalModelCandidateReviewInput,
  evaluateLocalModelCandidateReviewDecision,
  listCurrentLocalModelCandidateReviewDecisions,
  validateLocalModelCandidateReviewDecisionInputs,
} from '../../src/platform/ai/localModelCandidateReviewDecisionPolicy.ts';
import {
  LOCAL_MODEL_CANDIDATE_REQUIRED_REVIEW_CATEGORIES,
  LOCAL_MODEL_CANDIDATE_REVIEW_DECISION_REVISION,
} from '../../src/platform/ai/localModelCandidateReviewDecisionTypes.ts';
import type {
  LocalModelCandidateReviewDecisionInput,
  LocalModelCandidateReviewItemDecision,
} from '../../src/platform/ai/localModelCandidateReviewDecisionTypes.ts';

function completeEvidence(
  base: LocalModelCandidateEvidenceRecord = listLocalModelCandidateEvidence()[0],
): LocalModelCandidateEvidenceRecord {
  return {
    ...base,
    evidenceStatus: 'evidence-collected',
    officialIdentityConfirmed: true,
    licenseIdentifier: 'Apache-2.0',
    licenseTextLocated: true,
    licenseFacts: {
      ...base.licenseFacts,
      commercialUse: 'yes',
      internalBusinessUse: 'yes',
      redistribution: 'yes',
      hostingDerivedArtifacts: 'yes',
      derivativeWorks: 'yes',
      quantizationAllowed: 'yes',
      attributionRequired: 'yes',
      noticeRequired: 'yes',
      separateTokenizerTerms: 'no',
      acceptableUsePolicyApplies: 'no',
    },
    missingEvidence: [],
    conflicts: [],
  };
}

function decisions(value: LocalModelCandidateReviewItemDecision) {
  return Object.fromEntries(
    LOCAL_MODEL_CANDIDATE_REQUIRED_REVIEW_CATEGORIES.map((category) => [category, value]),
  ) as LocalModelCandidateReviewDecisionInput['decisions'];
}

function syntheticInput(overrides: Partial<LocalModelCandidateReviewDecisionInput> = {}): LocalModelCandidateReviewDecisionInput {
  const evidence = completeEvidence();
  return {
    candidateId: evidence.candidateId,
    candidateTier: evidence.candidateTier,
    evidenceRecord: evidence,
    decisions: decisions('not-reviewed'),
    decisionRecorded: false,
    decisionRevision: LOCAL_MODEL_CANDIDATE_REVIEW_DECISION_REVISION,
    ...overrides,
  };
}

describe('Phase 5.2 human model and license review decision policy', () => {
  it('builds exactly three production decisions matching evidence and the Light/Standard/Pro matrix', () => {
    const evidence = listLocalModelCandidateEvidence();
    const results = buildCurrentLocalModelCandidateReviewDecisions();
    assert.deepEqual(results.map((result) => result.candidateId), evidence.map((record) => record.candidateId));
    assert.deepEqual(results.map((result) => result.candidateTier), ['light', 'standard', 'pro']);
    assert.equal(results.length, 3);
    assert.equal(new Set(results.map((result) => result.candidateId)).size, 3);
    assert.equal(results.some((result) => (result.candidateTier as string) === 'ultra-low'), false);
    assert.deepEqual(listCurrentLocalModelCandidateReviewDecisions(), results);
  });

  it('keeps all current candidates needs-more-evidence with no human or approval state', () => {
    const results = buildCurrentLocalModelCandidateReviewDecisions();
    for (const result of results) {
      assert.equal(result.status, 'needs-more-evidence');
      assert.equal(result.humanDecisionRecorded, false);
      assert.equal(result.canProceedToArtifactReview, false);
      assert.equal(result.humanReviewStillRequired, true);
      assert.equal(result.evidenceComplete, false);
      assert.equal(result.modelApproved, false);
      assert.equal(result.licenseApproved, false);
      assert.equal(result.artifactApproved, false);
      assert.equal(result.benchmarkVerified, false);
      assert.equal(result.downloadable, false);
      assert.equal(result.runtimeReady, false);
      assert.equal(result.modelActive, false);
      assert.ok(result.missingEvidence.length > 0);
      assert.ok(Object.values(result.decisions).every((decision) => decision === 'needs-more-evidence'));
    }
  });

  it('maps complete evidence without a recorded decision to awaiting-human-decision', () => {
    const result = evaluateLocalModelCandidateReviewDecision(syntheticInput());
    assert.equal(result.status, 'awaiting-human-decision');
    assert.equal(result.canProceedToArtifactReview, false);
    assert.equal(result.humanReviewStillRequired, true);
    assert.deepEqual(result.unresolvedReviewItems, LOCAL_MODEL_CANDIDATE_REQUIRED_REVIEW_CATEGORIES);
  });

  it('allows only explicit complete approvals to proceed to artifact review while all production approval flags stay false', () => {
    const result = evaluateLocalModelCandidateReviewDecision(syntheticInput({
      decisions: decisions('approved'),
      decisionRecorded: true,
    }));
    assert.equal(result.status, 'approved-for-artifact-review');
    assert.equal(result.canProceedToArtifactReview, true);
    assert.equal(result.humanDecisionRecorded, true);
    assert.equal(result.modelApproved, false);
    assert.equal(result.licenseApproved, false);
    assert.equal(result.artifactApproved, false);
    assert.equal(result.benchmarkVerified, false);
    assert.equal(result.downloadable, false);
    assert.equal(result.runtimeReady, false);
    assert.equal(result.modelActive, false);
  });

  it('rejects explicit rejection and leaves every other review category independent', () => {
    const allApproved = decisions('approved');
    const rejected = evaluateLocalModelCandidateReviewDecision(syntheticInput({
      decisions: { ...allApproved, tokenizerTerms: 'rejected' },
      decisionRecorded: true,
    }));
    assert.equal(rejected.status, 'rejected');
    assert.equal(rejected.canProceedToArtifactReview, false);

    for (const category of ['redistribution', 'quantizationAndConversion', 'tokenizerTerms', 'derivedArtifactHosting'] as const) {
      const partial = evaluateLocalModelCandidateReviewDecision(syntheticInput({
        decisions: { ...allApproved, [category]: 'not-reviewed' },
        decisionRecorded: true,
      }));
      assert.equal(partial.status, 'awaiting-human-decision');
      assert.equal(partial.canProceedToArtifactReview, false);
      assert.ok(partial.unresolvedReviewItems.includes(category));
    }
  });

  it('blocks incomplete, conflicting, rejected, invalid not-applicable, and fake approved combinations', () => {
    const current = listLocalModelCandidateEvidence()[0];
    const fakeApproved = evaluateLocalModelCandidateReviewDecision({
      ...createUnreviewedLocalModelCandidateReviewInput(current),
      decisions: decisions('approved'),
      decisionRecorded: true,
    });
    assert.equal(fakeApproved.status, 'attention-required');
    assert.equal(fakeApproved.canProceedToArtifactReview, false);

    const conflictEvidence = { ...completeEvidence(), evidenceStatus: 'conflicting-evidence' as const, conflicts: ['official-source-conflict'] };
    const conflicting = evaluateLocalModelCandidateReviewDecision(syntheticInput({
      evidenceRecord: conflictEvidence,
      decisions: decisions('approved'),
      decisionRecorded: true,
    }));
    assert.equal(conflicting.status, 'attention-required');

    const rejectedEvidence = { ...completeEvidence(), evidenceStatus: 'rejected' as const };
    assert.equal(evaluateLocalModelCandidateReviewDecision(syntheticInput({ evidenceRecord: rejectedEvidence })).status, 'rejected');

    const invalidNotApplicable = evaluateLocalModelCandidateReviewDecision(syntheticInput({
      decisions: { ...decisions('approved'), exactModelIdentity: 'not-applicable' },
      decisionRecorded: true,
    }));
    assert.equal(invalidNotApplicable.status, 'attention-required');

    const falseRecorded = evaluateLocalModelCandidateReviewDecision(syntheticInput({
      decisions: decisions('approved'),
      decisionRecorded: false,
    }));
    assert.equal(falseRecorded.status, 'attention-required');
  });

  it('treats a model-class tier-matrix mismatch as attention-required', () => {
    const evidence = completeEvidence();
    const mismatch = evaluateLocalModelCandidateReviewDecision(syntheticInput({
      evidenceRecord: { ...evidence, modelClass: '4B' },
    }));
    assert.equal(mismatch.status, 'attention-required');
    assert.ok(mismatch.blockers.includes('model-class-mismatch'));
    assert.equal(mismatch.canProceedToArtifactReview, false);
  });

  it('blocks unknown or mismatched candidate identity and tier', () => {
    const unknown = evaluateLocalModelCandidateReviewDecision(syntheticInput({
      candidateId: 'unknown-candidate',
      evidenceRecord: null,
    }));
    assert.equal(unknown.status, 'attention-required');

    const idMismatch = evaluateLocalModelCandidateReviewDecision(syntheticInput({ candidateId: 'wrong-id' }));
    const tierMismatch = evaluateLocalModelCandidateReviewDecision(syntheticInput({ candidateTier: 'pro' }));
    assert.equal(idMismatch.status, 'attention-required');
    assert.equal(tierMismatch.status, 'attention-required');
    assert.equal(idMismatch.canProceedToArtifactReview, false);
    assert.equal(tierMismatch.canProceedToArtifactReview, false);
  });

  it('rejects duplicate decision records deterministically without mutating inputs', () => {
    const input = createUnreviewedLocalModelCandidateReviewInput(listLocalModelCandidateEvidence()[0]);
    const snapshot = structuredClone(input);
    const validation = validateLocalModelCandidateReviewDecisionInputs([input, input]);
    assert.equal(validation.valid, false);
    assert.deepEqual(validation.issues, ['duplicate-candidate-decision:qwen3-0-6b-candidate']);
    assert.deepEqual(input, snapshot);

    const first = evaluateLocalModelCandidateReviewDecision(input);
    const second = evaluateLocalModelCandidateReviewDecision(input);
    assert.deepEqual(first.blockers, second.blockers);
    assert.equal(new Set(first.blockers).size, first.blockers.length);
  });

  it('does not modify production approval state or the Phase 4 blocked-safe closeout', () => {
    assert.equal(LOCAL_MODEL_APPROVAL_REGISTRY.every((candidate) =>
      !candidate.approved && !candidate.licenseApproved && !candidate.artifactApproved
      && !candidate.benchmarkApproved && !candidate.runtimeReady && !candidate.downloadable), true);
    const closeout = buildCurrentLocalModelAcquisitionCloseout();
    assert.equal(closeout.status, 'foundation-complete');
    assert.equal(closeout.phaseFoundationComplete, true);
    assert.equal(closeout.activeModels, 0);
  });
});
