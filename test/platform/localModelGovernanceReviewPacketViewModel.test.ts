import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { buildLocalModelGovernanceReviewPacketViewModel } from '../../src/platform/ai/localModelGovernanceReviewPacketViewModel.ts';

function read(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Phase 5.6 governance review packet view model and readiness integration', () => {
  it('summarizes the three blocked-safe production packets without approval claims', () => {
    const viewModel = buildLocalModelGovernanceReviewPacketViewModel();
    assert.equal(viewModel.aggregate.totalCandidates, 3);
    assert.equal(viewModel.aggregate.reconciliationIncompleteCandidates, 3);
    assert.equal(viewModel.aggregate.awaitingHumanGovernanceReviewCandidates, 0);
    assert.equal(viewModel.aggregate.conflictingCandidates, 0);
    assert.equal(viewModel.aggregate.attentionRequiredCandidates, 0);
    assert.ok(viewModel.aggregate.totalRequirements > 0);
    assert.ok(viewModel.aggregate.satisfiedRequirements > 0);
    assert.ok(viewModel.aggregate.unresolvedRequirements > 0);
    assert.ok(viewModel.aggregate.humanDecisionRequirements > 0);
    assert.ok(viewModel.aggregate.runtimeBenchmarkRequirements > 0);
    assert.equal(viewModel.aggregate.humanDecisionsRecorded, 0);
    assert.equal(viewModel.aggregate.selectedArtifacts, 0);
    assert.equal(viewModel.aggregate.approvedArtifacts, 0);
    assert.equal(viewModel.aggregate.checksumPinnedArtifacts, 0);
    assert.equal(viewModel.aggregate.downloadableArtifacts, 0);
    assert.equal(viewModel.aggregate.runtimeReadyArtifacts, 0);
    assert.equal(viewModel.aggregate.activeModels, 0);
  });

  it('uses truthful review-packet copy and never claims readiness or recommends a model', () => {
    const viewModel = buildLocalModelGovernanceReviewPacketViewModel();
    const copy = [
      viewModel.heading,
      viewModel.packetSummary,
      viewModel.reconciliationSummary,
      viewModel.governanceSummary,
      viewModel.runtimeBenchmarkSummary,
      viewModel.approvalBoundarySummary,
      ...viewModel.candidateRows.flatMap((row) => [row.statusLabel, row.requirementSummary]),
    ].join(' ');
    for (const expected of [
      'Model & Artifact Evidence Reconciliation',
      'Governance review packet only',
      'Evidence from Phase 5.1, 5.3 and 5.5 has been reconciled',
      'Human governance decisions are not recorded',
      'Some evidence remains unresolved',
      'Runtime benchmark evidence remains deferred',
      'No model approved',
      'No artifact selected',
      'No artifact approved',
      'No checksum pinned',
      'No benchmark passed',
      'No download available',
      'No model active',
      'Production execution remains unavailable',
    ]) assert.ok(copy.includes(expected), expected);
    for (const forbidden of ['Model ready', 'Runtime ready', 'Ready to download', 'Recommended artifact', '4B active']) {
      assert.equal(copy.includes(forbidden), false, forbidden);
    }
  });

  it('adds the Phase 5.6 card while preserving Phase 4 closeout and Phase 5.1–5.5 cards', () => {
    const shell = read('../../src/components/ai/LocalAIReadinessShell.tsx');
    for (const expected of [
      'Phase 4.11 local model acquisition safety closeout',
      'Phase 5.1 exact model and license evidence review',
      'Phase 5.2 human model and license review decision gate',
      'Phase 5.3 official artifact variant and provenance evidence',
      'Phase 5.4 human artifact variant selection decision gate',
      'Phase 5.5 official artifact integrity and exact size evidence',
      'Phase 5.6 model and artifact governance review packet',
      'Governance review packet only',
      'Human governance decisions are not recorded',
      'Some evidence remains unresolved',
    ]) assert.ok(shell.includes(expected), expected);
    for (const forbidden of ['handleGovernanceApproval', 'approveGovernance', 'selectGovernanceArtifact', 'downloadGovernanceArtifact']) {
      assert.equal(shell.includes(forbidden), false, forbidden);
    }
  });

  it('registers both Phase 5.6 tests in platform and full test scripts', () => {
    const packageJson = JSON.parse(read('../../package.json')) as { scripts: Record<string, string> };
    for (const scriptName of ['test', 'test:platform']) {
      const script = packageJson.scripts[scriptName];
      assert.ok(script.includes('test/platform/localModelGovernanceReviewPacket.test.ts'));
      assert.ok(script.includes('test/platform/localModelGovernanceReviewPacketViewModel.test.ts'));
    }
  });

  it('documents reconciliation boundaries and current blocked-safe production state', () => {
    const document = read('../../docs/ai/phase-5-model-governance-review-packet.md');
    for (const heading of [
      'Status', 'Purpose', 'Why reconciliation is required', 'Relationship to Phase 5.1',
      'Relationship to Phase 5.2', 'Relationship to Phase 5.3', 'Relationship to Phase 5.4',
      'Relationship to Phase 5.5', 'Source evidence versus reconciled requirements',
      'Requirement status model', 'Model and license requirements', 'Artifact provenance requirements',
      'Artifact integrity requirements', 'Human governance decisions', 'Runtime and benchmark deferrals',
      'Candidate consistency checks', 'Light candidate packet', 'Standard candidate packet',
      'Pro candidate packet', 'Unresolved requirements', 'Conflicting requirements',
      'Current production state', 'Tier-matrix compatibility', 'Privacy and persistence',
      'Safety invariants', 'Non-goals',
    ]) assert.ok(document.includes(`## ${heading}`), heading);
    for (const statement of [
      'Phase 5.6 is a review packet only.',
      'Reconciliation is not approval.',
      'Integrity metadata is not checksum verification.',
      'No human decision is recorded.',
      'No artifact is selected.',
      'No model is active.',
    ]) assert.ok(document.includes(statement), statement);
  });
});
