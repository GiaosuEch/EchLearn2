import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { evaluateLocalModelPersistedSelectionArtifactApprovalReview } from '../../src/platform/ai/localModelPersistedSelectionArtifactApprovalReviewAdapter.ts';
const persistence = { status: 'inserted', persistenceAcknowledged: true } as const;
const approval = { status: 'awaiting-human-approval', canRecordApproval: true, artifactSelectionRecorded: true, integrityPinPlanComplete: true, artifactApprovalComplete: false, artifactApproved: false, checksumPinned: false, checksumVerified: false, downloadable: false, runtimeReady: false, modelActive: false, selectedArtifactScope: { candidateId: 'qwen3-0-6b-candidate', candidateTier: 'light', observedRevision: 'rev', selectedOptionId: 'option' }, integrityPinPlan: { candidateId: 'qwen3-0-6b-candidate', candidateTier: 'light', observedRevision: 'rev', selectedOptionId: 'option' } } as const;
describe('Phase 7.6 persisted selection artifact approval review adapter', () => {
  it('requires explicit review and a persisted selection acknowledgement', () => {
    assert.equal(evaluateLocalModelPersistedSelectionArtifactApprovalReview({ persistenceResult: persistence, approvalResult: approval, explicitApprovalReviewRequested: false }).status, 'review-not-requested');
    const ready = evaluateLocalModelPersistedSelectionArtifactApprovalReview({ persistenceResult: persistence, approvalResult: approval, explicitApprovalReviewRequested: true });
    assert.equal(ready.status, 'ready-for-human-approval'); assert.equal(ready.canBeginHumanApproval, true);
  });
  it('fails closed for persistence absence, scope drift, and claimed downstream state', () => {
    for (const input of [{ persistenceResult: { status: 'authorization-required', persistenceAcknowledged: false }, approvalResult: approval }, { persistenceResult: persistence, approvalResult: { ...approval, integrityPinPlan: { ...approval.integrityPinPlan, observedRevision: 'other' } } }, { persistenceResult: persistence, approvalResult: { ...approval, checksumPinned: true } }]) {
      assert.notEqual(evaluateLocalModelPersistedSelectionArtifactApprovalReview({ ...input, explicitApprovalReviewRequested: true }).status, 'ready-for-human-approval');
    }
  });
});
