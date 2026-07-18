import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { buildLocalModelGovernanceDecisionRecordViewModel } from '../../src/platform/ai/localModelGovernanceDecisionRecordViewModel.ts';

const require = createRequire(import.meta.url);
const { scanAISafetyRegression } = require('../../scripts/verify_ai_safety_regression.cjs') as {
  scanAISafetyRegression(options: { root: string }): { files: string[]; violations: Array<{ path: string; ruleId: string; message: string }> };
};
function read(path: string): string { return readFileSync(new URL(path, import.meta.url), 'utf8'); }

describe('Phase 6.1 decision record view model and readiness integration', () => {
  it('maps the empty production record-contract state exactly', () => {
    const viewModel = buildLocalModelGovernanceDecisionRecordViewModel();
    assert.equal(viewModel.aggregate.totalCandidates, 3);
    assert.equal(viewModel.aggregate.recordContractsAvailable, 3);
    assert.equal(viewModel.aggregate.awaitingTrustedActorCandidates, 3);
    assert.equal(viewModel.aggregate.awaitingExplicitDecisionCandidates, 0);
    assert.equal(viewModel.aggregate.validDraftCandidates, 0);
    assert.equal(viewModel.aggregate.finalizedProceedRecords, 0);
    assert.equal(viewModel.aggregate.finalizedRejectedRecords, 0);
    assert.equal(viewModel.aggregate.finalizedMoreEvidenceRecords, 0);
    assert.equal(viewModel.aggregate.trustedActorContexts, 0);
    assert.equal(viewModel.aggregate.explicitDecisionItemsRecorded, 0);
    assert.equal(viewModel.aggregate.finalizedRecords, 0);
    assert.equal(viewModel.aggregate.recordsEligibleForTrustedPersistence, 0);
    assert.equal(viewModel.aggregate.recordsAppliedToArtifactSelection, 0);
    assert.equal(viewModel.aggregate.approvedModels, 0);
    assert.equal(viewModel.aggregate.approvedLicenses, 0);
    assert.equal(viewModel.aggregate.selectedArtifacts, 0);
    assert.equal(viewModel.aggregate.approvedArtifacts, 0);
    assert.equal(viewModel.aggregate.downloadableArtifacts, 0);
    assert.equal(viewModel.aggregate.runtimeReadyArtifacts, 0);
    assert.equal(viewModel.aggregate.activeModels, 0);
    assert.equal(viewModel.recordsPersisted, 0);
  });

  it('uses honest contract-only copy without authentication, persistence, approval, or readiness claims', () => {
    const viewModel = buildLocalModelGovernanceDecisionRecordViewModel();
    const serialized = JSON.stringify(viewModel);
    assert.equal(viewModel.heading, 'Trusted Human Governance Decision Record Contract');
    assert.match(viewModel.actorBoundarySummary, /No trusted actor context is present/);
    assert.match(viewModel.decisionBoundarySummary, /Human governance decisions are not recorded/);
    assert.match(viewModel.recordBoundarySummary, /No canonical governance record has been finalized/);
    assert.match(viewModel.persistenceBoundarySummary, /No record has been persisted/);
    assert.match(viewModel.persistenceBoundarySummary, /No record has been signed/);
    assert.match(viewModel.artifactSelectionBoundarySummary, /No record has been applied to artifact selection/);
    assert.match(viewModel.artifactSelectionBoundarySummary, /No model approved/);
    assert.match(viewModel.artifactSelectionBoundarySummary, /No license approved/);
    assert.match(viewModel.artifactSelectionBoundarySummary, /No artifact selected/);
    assert.match(viewModel.artifactSelectionBoundarySummary, /No download available/);
    assert.match(viewModel.artifactSelectionBoundarySummary, /No model active/);
    assert.doesNotMatch(serialized, /Admin verified|Governance approved|Record persisted|Record signed|Model ready|Runtime ready|Recommended model|4B active/i);
  });

  it('adds the Phase 6.1 readiness card while preserving Phase 4 and Phase 5 cards', () => {
    const source = read('../../src/components/ai/LocalAIReadinessShell.tsx');
    assert.match(source, /Phase 6\.1 trusted human governance decision record contract/i);
    assert.match(source, /Trusted Human Governance Decision Record Contract/);
    assert.match(source, /No trusted actor context is present/);
    assert.match(source, /Human governance decisions are not recorded/);
    assert.match(source, /No canonical governance record has been finalized/);
    assert.match(source, /records finalized/);
    assert.match(source, /records persisted/);
    assert.match(source, /records applied to artifact selection/);
    assert.match(source, /Phase 5\.12 model governance and benchmark planning safety closeout/i);
    assert.match(source, /Phase 4 Local Model Acquisition Safety Closeout/);
    assert.doesNotMatch(source, /handle.*(?:login|decision|finalize)|onClick=.*(?:login|decision|finalize)/i);
  });

  it('registers both Phase 6.1 tests in test and test:platform scripts', () => {
    const packageJson = JSON.parse(read('../../package.json')) as { scripts: Record<string, string> };
    for (const script of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[script], /test\/platform\/localModelGovernanceDecisionRecordPolicy\.test\.ts/);
      assert.match(packageJson.scripts[script], /test\/platform\/localModelGovernanceDecisionRecordViewModel\.test\.ts/);
    }
  });

  it('documents the trusted actor, finalization, record, persistence, and future-operation boundaries', () => {
    const doc = read('../../docs/ai/phase-6-trusted-governance-decision-record.md');
    const headings = [
      'Status','Purpose','Phase 6 scope','Relationship to Phase 5.7','Relationship to Phase 5.8','Relationship to Phase 5.12','Evidence versus decision','Decision boundary versus decision record','Trusted actor context','Authentication boundary','Authorization boundary','Actor privacy','Governance requirements','Draft decisions','Explicit finalization','Canonical finalized record','Deterministic record key','Record scope','Scope invalidation','Record revisions','Proceed outcome','Rejected outcome','More-evidence outcome','Persistence boundary','Signature boundary','Artifact-selection application boundary','Current production state','Tier-matrix compatibility','Failure handling','Safety invariants','Non-goals','Future phase entry conditions',
    ];
    for (const heading of headings) assert.match(doc, new RegExp(`^## ${heading}$`, 'm'));
    assert.match(doc, /decision-record contract only/i);
    assert.match(doc, /trusted actor contexts.*0/i);
    assert.match(doc, /finalized governance records.*0/i);
    assert.match(doc, /opaque/i);
    assert.match(doc, /not an email/i);
    assert.match(doc, /does not validate JWT/i);
    assert.match(doc, /No Supabase/i);
    assert.match(doc, /No migration/i);
    assert.match(doc, /No RLS/i);
    assert.match(doc, /Phase 5 closeout remains foundation-complete/i);
    assert.match(doc, /Production remains blocked-safe/i);
  });

  it('keeps the existing AI safety verifier clean', () => {
    const result = scanAISafetyRegression({ root: new URL('../..', import.meta.url).pathname });
    assert.deepEqual(result.violations, []);
  });
});
