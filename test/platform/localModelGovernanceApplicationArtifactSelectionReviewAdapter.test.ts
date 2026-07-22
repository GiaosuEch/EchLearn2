import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { evaluateLocalModelGovernanceApplicationArtifactSelectionReview } from '../../src/platform/ai/localModelGovernanceApplicationArtifactSelectionReviewAdapter.ts';

const bridge = {
  status: 'eligible-for-artifact-selection-review',
  bridgeEligible: true,
  bridgeDecisionKey: 'local-model-artifact-selection-review:qwen3-0-6b-candidate:rev-1:application-1:bridge-policy-revision-1',
  candidateId: 'qwen3-0-6b-candidate',
  candidateTier: 'light',
  observedRevision: 'rev-1',
  artifactSelectionReviewEligible: true,
  artifactSelected: false,
  artifactApproved: false,
  modelApproved: false,
  licenseApproved: false,
  checksumVerified: false,
  benchmarkVerified: false,
  downloadable: false,
  runtimeReady: false,
  modelActive: false,
} as const;

const selection = {
  status: 'awaiting-human-selection',
  candidateId: 'qwen3-0-6b-candidate',
  candidateTier: 'light',
  availableOptions: [{ candidateId: 'qwen3-0-6b-candidate', observedRevision: 'rev-1' }],
  artifactSelected: false,
  artifactApproved: false,
  modelApproved: false,
  licenseApproved: false,
  checksumVerified: false,
  benchmarkVerified: false,
  downloadable: false,
  runtimeReady: false,
  modelActive: false,
} as const;

describe('Phase 7.3 governance application artifact-selection review adapter', () => {
  it('requires literal action and binds an eligible bridge to the existing selection session', () => {
    const blocked = evaluateLocalModelGovernanceApplicationArtifactSelectionReview({ bridgeDecision: bridge, selectionResult: selection, explicitReviewRequested: false });
    const ready = evaluateLocalModelGovernanceApplicationArtifactSelectionReview({ bridgeDecision: bridge, selectionResult: selection, explicitReviewRequested: true });

    assert.equal(blocked.status, 'review-not-requested');
    assert.equal(ready.status, 'ready-for-human-selection');
    assert.equal(ready.canBeginHumanSelection, true);
    assert.equal(ready.bridgeDecisionKey, bridge.bridgeDecisionKey);
  });

  it('fails closed when candidate, tier, revision, or downstream state is inconsistent', () => {
    for (const request of [
      { bridgeDecision: { ...bridge, candidateId: 'qwen3-1-7b-candidate' }, selectionResult: selection },
      { bridgeDecision: { ...bridge, candidateTier: 'standard' }, selectionResult: selection },
      { bridgeDecision: { ...bridge, observedRevision: 'rev-2' }, selectionResult: selection },
      { bridgeDecision: { ...bridge, runtimeReady: true }, selectionResult: selection },
    ]) {
      const result = evaluateLocalModelGovernanceApplicationArtifactSelectionReview({ ...request, explicitReviewRequested: true });
      assert.equal(result.canBeginHumanSelection, false);
      assert.notEqual(result.status, 'ready-for-human-selection');
    }
  });

  it('does not record, approve, download, benchmark, initialize, or activate anything', () => {
    const result = evaluateLocalModelGovernanceApplicationArtifactSelectionReview({ bridgeDecision: bridge, selectionResult: selection, explicitReviewRequested: true });

    assert.equal(result.reviewPersisted, false);
    assert.equal(result.artifactSelected, false);
    assert.equal(result.artifactApproved, false);
    assert.equal(result.downloadable, false);
    assert.equal(result.runtimeReady, false);
    assert.equal(result.modelActive, false);
  });
});
