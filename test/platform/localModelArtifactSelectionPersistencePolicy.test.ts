import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildLocalModelArtifactSelectionPersistenceEnvelope,
  validateLocalModelArtifactSelectionPersistenceEnvelope,
} from '../../src/platform/ai/localModelArtifactSelectionPersistencePolicy.ts';

const revision = 'c1899de289a04d12100db370d81485cdf75e47ca';
const bridge = {
  status: 'eligible-for-artifact-selection-review', bridgeEligible: true, artifactSelectionReviewEligible: true,
  bridgeDecisionKey: 'bridge-1', applicationDecisionKey: 'application-1', sourceGovernancePersistenceKey: 'governance-1',
  canonicalRecordKey: 'record-1', canonicalRecordRevision: 1, canonicalOutcome: 'finalized-proceed',
  candidateId: 'qwen3-0-6b-candidate', candidateTier: 'light', observedRevision: revision,
} as const;
const selection = {
  status: 'selection-recorded', decision: 'select', humanSelectionRecorded: true, selectionValidForCurrentScope: true,
  artifactSelected: true, selectedOptionId: 'option-1',
  selectedScope: { candidateId: 'qwen3-0-6b-candidate', candidateTier: 'light', observedRevision: revision },
  availableOptions: [{ optionId: 'option-1', candidateId: 'qwen3-0-6b-candidate', candidateTier: 'light', observedRevision: revision }],
} as const;
const trusted = { status: 'trusted-selection-decision-ready', trustedSelectionDecisionReady: true, reviewVerified: true, selectionVerified: true, trustedReviewerVerified: true } as const;

describe('Phase 7.5 artifact-selection persistence envelope', () => {
  it('derives an immutable, fail-closed append envelope only from the trusted decision chain', () => {
    const envelope = buildLocalModelArtifactSelectionPersistenceEnvelope({ trustedDecision: trusted, bridgeDecision: bridge, selectionResult: selection });
    assert.ok(envelope);
    assert.equal(validateLocalModelArtifactSelectionPersistenceEnvelope(envelope).valid, true);
    assert.equal(envelope.operation, 'append');
    assert.equal(envelope.decisionPersisted, false);
    assert.equal(envelope.artifactSelected, false);
  });
  it('rejects stale review state, selection scope drift, and downstream claims', () => {
    assert.equal(buildLocalModelArtifactSelectionPersistenceEnvelope({ trustedDecision: { ...trusted, trustedReviewerVerified: false }, bridgeDecision: bridge, selectionResult: selection }), null);
    assert.equal(buildLocalModelArtifactSelectionPersistenceEnvelope({ trustedDecision: trusted, bridgeDecision: bridge, selectionResult: { ...selection, selectedScope: { ...selection.selectedScope, observedRevision: 'other' } } }), null);
    const envelope = buildLocalModelArtifactSelectionPersistenceEnvelope({ trustedDecision: trusted, bridgeDecision: bridge, selectionResult: selection });
    assert.ok(envelope);
    assert.equal(validateLocalModelArtifactSelectionPersistenceEnvelope({ ...envelope, runtimeReady: true }).valid, false);
  });
});
