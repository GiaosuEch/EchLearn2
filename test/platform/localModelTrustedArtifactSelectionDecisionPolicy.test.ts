import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  evaluateLocalModelTrustedArtifactSelectionDecision,
} from '../../src/platform/ai/localModelTrustedArtifactSelectionDecisionPolicy.ts';

const review = {
  status: 'ready-for-human-selection',
  explicitReviewRequested: true,
  bridgeVerified: true,
  selectionScopeVerified: true,
  canBeginHumanSelection: true,
  bridgeDecisionKey: 'bridge:selection-review:1',
  candidateId: 'qwen3-0-6b-candidate',
  candidateTier: 'light',
  observedRevision: 'c1899de289a04d12100db370d81485cdf75e47ca',
} as const;

const selection = {
  status: 'selection-recorded',
  decision: 'select',
  humanSelectionRecorded: true,
  selectionValidForCurrentScope: true,
  artifactSelected: true,
  candidateId: 'qwen3-0-6b-candidate',
  candidateTier: 'light',
  selectedOptionId: 'option-1',
  selectedScope: {
    candidateId: 'qwen3-0-6b-candidate',
    candidateTier: 'light',
    observedRevision: 'c1899de289a04d12100db370d81485cdf75e47ca',
  },
  availableOptions: [{
    optionId: 'option-1',
    candidateId: 'qwen3-0-6b-candidate',
    candidateTier: 'light',
    observedRevision: 'c1899de289a04d12100db370d81485cdf75e47ca',
  }],
} as const;

const trustedActor = {
  status: 'trusted-context-ready',
  trustedContextReady: true,
  canSupplyActorContextToGovernanceRecord: true,
  canOpenGovernanceDecisionDraft: true,
  authenticationPerformedByAdapter: false,
  authorizationPerformedByAdapter: false,
  credentialsRead: false,
  tokensRead: false,
  mappedTrustedActorContext: {
    actorSubjectId: 'reviewer-01',
    actorRole: 'model-governance-reviewer',
    authenticated: true,
    authorizationVerified: true,
    authorizationScope: 'record-model-governance-decision',
    authenticationSource: 'external-auth-boundary',
    actorContextRevision: 1,
  },
} as const;

describe('Phase 7.4 trusted artifact-selection decision policy', () => {
  it('requires explicit reviewer action and all three verified inputs', () => {
    const blocked = evaluateLocalModelTrustedArtifactSelectionDecision({
      reviewResult: review,
      selectionResult: selection,
      trustedActorResult: trustedActor,
      explicitDecisionRequested: false,
    });
    const ready = evaluateLocalModelTrustedArtifactSelectionDecision({
      reviewResult: review,
      selectionResult: selection,
      trustedActorResult: trustedActor,
      explicitDecisionRequested: true,
    });

    assert.equal(blocked.status, 'decision-not-requested');
    assert.equal(ready.status, 'trusted-selection-decision-ready');
    assert.equal(ready.trustedSelectionDecisionReady, true);
    assert.equal(ready.trustedReviewerVerified, true);
  });

  it('fails closed for an unrecorded selection, scope drift, or an untrusted reviewer', () => {
    const cases = [
      { selectionResult: { ...selection, status: 'awaiting-human-selection', artifactSelected: false } },
      { selectionResult: { ...selection, selectedScope: { ...selection.selectedScope, observedRevision: 'other' } } },
      { trustedActorResult: { ...trustedActor, mappedTrustedActorContext: { ...trustedActor.mappedTrustedActorContext, authenticationSource: 'synthetic-test-fixture' } } },
    ];

    for (const overrides of cases) {
      const result = evaluateLocalModelTrustedArtifactSelectionDecision({
        reviewResult: review,
        selectionResult: selection,
        trustedActorResult: trustedActor,
        explicitDecisionRequested: true,
        ...overrides,
      });
      assert.equal(result.trustedSelectionDecisionReady, false);
      assert.notEqual(result.status, 'trusted-selection-decision-ready');
    }
  });

  it('never writes, approves, verifies, downloads, initializes, or activates', () => {
    const result = evaluateLocalModelTrustedArtifactSelectionDecision({
      reviewResult: review,
      selectionResult: selection,
      trustedActorResult: trustedActor,
      explicitDecisionRequested: true,
    });

    assert.equal(result.decisionPersisted, false);
    assert.equal(result.artifactSelected, false);
    assert.equal(result.artifactApproved, false);
    assert.equal(result.checksumVerified, false);
    assert.equal(result.downloadable, false);
    assert.equal(result.runtimeReady, false);
    assert.equal(result.modelActive, false);
  });
});
