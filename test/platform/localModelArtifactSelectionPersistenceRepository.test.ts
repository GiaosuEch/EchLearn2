import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildLocalModelArtifactSelectionPersistenceEnvelope } from '../../src/platform/ai/localModelArtifactSelectionPersistencePolicy.ts';
import { LOCAL_MODEL_ARTIFACT_SELECTION_APPEND_RPC_NAME, createLocalModelArtifactSelectionPersistenceRepository, createUnavailableLocalModelArtifactSelectionPersistenceRepository } from '../../src/platform/ai/localModelArtifactSelectionPersistenceRepository.ts';

const revision = 'c1899de289a04d12100db370d81485cdf75e47ca';
const envelope = buildLocalModelArtifactSelectionPersistenceEnvelope({
  trustedDecision: { status: 'trusted-selection-decision-ready', trustedSelectionDecisionReady: true, reviewVerified: true, selectionVerified: true, trustedReviewerVerified: true },
  bridgeDecision: { status: 'eligible-for-artifact-selection-review', bridgeEligible: true, artifactSelectionReviewEligible: true, bridgeDecisionKey: 'bridge-1', applicationDecisionKey: 'application-1', sourceGovernancePersistenceKey: 'governance-1', canonicalRecordKey: 'record-1', canonicalRecordRevision: 1, canonicalOutcome: 'finalized-proceed', candidateId: 'qwen3-0-6b-candidate', candidateTier: 'light', observedRevision: revision },
  selectionResult: { status: 'selection-recorded', decision: 'select', humanSelectionRecorded: true, selectionValidForCurrentScope: true, artifactSelected: true, selectedOptionId: 'option-1', selectedScope: { candidateId: 'qwen3-0-6b-candidate', candidateTier: 'light', observedRevision: revision }, availableOptions: [{ optionId: 'option-1', candidateId: 'qwen3-0-6b-candidate', candidateTier: 'light', observedRevision: revision }] },
});
assert.ok(envelope);

describe('Phase 7.5 artifact-selection persistence repository', () => {
  it('requires explicit action and uses exactly one narrow RPC call', async () => {
    const calls: unknown[] = [];
    const repository = createLocalModelArtifactSelectionPersistenceRepository({ rpc(name, args) { calls.push([name, args]); return Promise.resolve({ data: [{ result_status: 'inserted', record_id: '1', selection_decision_key: envelope.selectionDecisionKey }], error: null }); } });
    assert.equal((await repository.append({ envelope, explicitActionRequested: false })).rpcAttempted, false);
    const result = await repository.append({ envelope, explicitActionRequested: true });
    assert.equal(result.status, 'inserted'); assert.equal(result.persistenceAcknowledged, true); assert.equal(result.artifactSelected, false);
    assert.deepEqual(calls[0], [LOCAL_MODEL_ARTIFACT_SELECTION_APPEND_RPC_NAME, { p_selection: envelope }]);
  });
  it('fails closed for unavailable repositories and raw RPC errors', async () => {
    assert.equal((await createUnavailableLocalModelArtifactSelectionPersistenceRepository().append({ envelope, explicitActionRequested: true })).status, 'repository-unavailable');
    const repository = createLocalModelArtifactSelectionPersistenceRepository({ rpc() { return Promise.resolve({ data: null, error: { code: '42501', message: 'artifact-selection-authorization-required' } }); } });
    const result = await repository.append({ envelope, explicitActionRequested: true });
    assert.equal(result.status, 'authorization-required'); assert.equal(result.rawErrorExposed, false);
  });
});
