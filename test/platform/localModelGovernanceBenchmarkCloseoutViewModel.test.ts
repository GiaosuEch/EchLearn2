import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { buildLocalModelGovernanceBenchmarkCloseout } from '../../src/platform/ai/localModelGovernanceBenchmarkCloseout.ts';
import { buildLocalModelGovernanceBenchmarkCloseoutViewModel } from '../../src/platform/ai/localModelGovernanceBenchmarkCloseoutViewModel.ts';

const require = createRequire(import.meta.url);
const { scanAISafetyRegression } = require('../../scripts/verify_ai_safety_regression.cjs') as {
  scanAISafetyRegression(options: { root: string }): { files: string[]; violations: Array<{ path: string; ruleId: string; message: string }> };
};
function read(path: string): string { return readFileSync(new URL(path, import.meta.url), 'utf8'); }

describe('Phase 5.12 closeout view model and readiness integration', () => {
  it('maps the complete blocked-safe aggregate exactly', () => {
    const viewModel = buildLocalModelGovernanceBenchmarkCloseoutViewModel(buildLocalModelGovernanceBenchmarkCloseout());
    assert.equal(viewModel.status, 'foundation-complete');
    assert.equal(viewModel.aggregate.totalCandidates, 3);
    assert.equal(viewModel.aggregate.exactCandidateIdentities, 3);
    assert.equal(viewModel.aggregate.consistentTierMappings, 3);
    assert.equal(viewModel.aggregate.governanceReviewPackets, 3);
    assert.equal(viewModel.aggregate.evidenceClosureRecords, 3);
    assert.equal(viewModel.aggregate.governanceDecisionSessions, 3);
    assert.equal(viewModel.aggregate.governanceDecisionItemsRequired, 12);
    assert.equal(viewModel.aggregate.governanceDecisionItemsRecorded, 0);
    assert.equal(viewModel.aggregate.governanceDecisionsComplete, 0);
    assert.equal(viewModel.aggregate.artifactSelectionsRecorded, 0);
    assert.equal(viewModel.aggregate.selectedArtifacts, 0);
    assert.equal(viewModel.aggregate.artifactApprovalDecisionsRecorded, 0);
    assert.equal(viewModel.aggregate.integrityPinningDecisionsRecorded, 0);
    assert.equal(viewModel.aggregate.approvedArtifacts, 0);
    assert.equal(viewModel.aggregate.checksumPinnedArtifacts, 0);
    assert.equal(viewModel.aggregate.checksumVerifiedArtifacts, 0);
    assert.equal(viewModel.aggregate.benchmarkPlansApproved, 0);
    assert.equal(viewModel.aggregate.benchmarkExecutionsStarted, 0);
    assert.equal(viewModel.aggregate.benchmarkExecutionsCompleted, 0);
    assert.equal(viewModel.aggregate.benchmarkMeasurementsRecorded, 0);
    assert.equal(viewModel.aggregate.benchmarkPassedCandidates, 0);
    assert.equal(viewModel.aggregate.benchmarkFailedCandidates, 0);
    assert.equal(viewModel.aggregate.downloadableArtifacts, 0);
    assert.equal(viewModel.aggregate.runtimeReadyArtifacts, 0);
    assert.equal(viewModel.aggregate.activeModels, 0);
    assert.equal(viewModel.aggregate.candidatesWithFallback, 3);
    assert.equal(viewModel.aggregate.candidatesWithFeatureParity, 3);
    assert.equal(viewModel.aggregate.errorFindings, 0);
  });

  it('uses honest closeout copy without readiness or benchmark claims', () => {
    const viewModel = buildLocalModelGovernanceBenchmarkCloseoutViewModel();
    const serialized = JSON.stringify(viewModel);
    assert.equal(viewModel.heading, 'Model Governance & Benchmark Planning Safety Closeout');
    assert.match(viewModel.phaseStatusSummary, /Phase 5 foundation is complete/);
    assert.match(viewModel.phaseStatusSummary, /Production remains blocked-safe/);
    assert.match(viewModel.governanceSummary, /Human governance decisions are not recorded/);
    assert.match(viewModel.artifactReviewSummary, /No artifact has been selected or approved/);
    assert.match(viewModel.integritySummary, /No checksum has been verified/);
    assert.match(viewModel.benchmarkPlanningSummary, /No benchmark plan has been approved/);
    assert.match(viewModel.benchmarkExecutionSummary, /No benchmark has started/);
    assert.match(viewModel.benchmarkExecutionSummary, /No benchmark measurements are recorded/);
    assert.match(viewModel.benchmarkExecutionSummary, /No benchmark has passed/);
    assert.match(viewModel.runtimeBoundarySummary, /Model readiness is not established/);
    assert.match(viewModel.runtimeBoundarySummary, /Runtime readiness is not established/);
    assert.match(viewModel.fallbackSummary, /Deterministic fallback remains available/);
    assert.match(viewModel.featureParitySummary, /AI feature parity remains preserved/);
    assert.doesNotMatch(serialized, /Model ready|Runtime ready|Benchmark passed|Performance verified|Ready to download|Artifact ready|Recommended model|4B active/i);
  });

  it('adds the Phase 5.12 card while preserving Phase 4 and Phase 5.1-5.11 cards', () => {
    const source = read('../../src/components/ai/LocalAIReadinessShell.tsx');
    assert.match(source, /Phase 5\.12 model governance and benchmark planning safety closeout/i);
    assert.match(source, /Model Governance & Benchmark Planning Safety Closeout/);
    assert.match(source, /Phase 5 foundation is complete/);
    assert.match(source, /Production remains blocked-safe/);
    assert.match(source, /Human governance decisions are not recorded/);
    assert.match(source, /No artifact has been selected or approved/);
    assert.match(source, /No benchmark has started or passed/);
    assert.match(source, /Deterministic fallback remains available/);
    assert.match(source, /AI feature parity remains preserved/);
    for (const phase of ['5.1','5.2','5.3','5.4','5.5','5.6','5.7','5.8','5.9','5.10','5.11','5.12']) assert.match(source, new RegExp(`Phase ${phase.replace('.', '\\.')}`, 'i'));
    assert.match(source, /Phase 4 Local Model Acquisition Safety Closeout/);
    assert.doesNotMatch(source, /handle.*(?:approve|select|pin|verify|benchmark|download|activate)|onClick=.*(?:approve|select|pin|verify|benchmark|download|activate)/i);
  });

  it('registers both Phase 5.12 tests in test and test:platform scripts', () => {
    const packageJson = JSON.parse(read('../../package.json')) as { scripts: Record<string, string> };
    for (const script of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[script], /test\/platform\/localModelGovernanceBenchmarkCloseout\.test\.ts/);
      assert.match(packageJson.scripts[script], /test\/platform\/localModelGovernanceBenchmarkCloseoutViewModel\.test\.ts/);
    }
  });

  it('documents every required Phase 5 closeout boundary and future entry condition', () => {
    const doc = read('../../docs/ai/phase-5-model-governance-benchmark-closeout.md');
    const headings = [
      'Status','Purpose','Phase 5 scope','Relationship to Phase 4 closeout','Relationship to Phase 5.1','Relationship to Phase 5.2','Relationship to Phase 5.3','Relationship to Phase 5.4','Relationship to Phase 5.5','Relationship to Phase 5.6','Relationship to Phase 5.7','Relationship to Phase 5.8','Relationship to Phase 5.9','Relationship to Phase 5.10','Relationship to Phase 5.11','Foundation complete versus model ready','Evidence boundaries','Human governance boundary','Artifact-selection boundary','Artifact-approval boundary','Integrity pinning versus verification','Benchmark planning versus execution','Benchmark execution versus pass','Benchmark pass versus runtime readiness','Candidate identity consistency','Tier-matrix compatibility','Production blocked-safe state','Deterministic fallback continuity','AI feature parity','Current production counts','Failure and attention-required conditions','Privacy and persistence','Safety invariants','Phase 5 closeout','Non-goals','Future phase entry conditions',
    ];
    for (const heading of headings) assert.match(doc, new RegExp(`^## ${heading}$`, 'm'));
    assert.match(doc, /Phase 5 foundation is complete/i);
    assert.match(doc, /Production remains blocked-safe/i);
    assert.match(doc, /not model readiness/i);
    assert.match(doc, /not runtime readiness/i);
    assert.match(doc, /human decisions recorded.*0/i);
    assert.match(doc, /benchmark executions.*0/i);
    assert.match(doc, /deterministic fallback remains available/i);
    assert.match(doc, /AI feature parity remains preserved/i);
    assert.match(doc, /trusted admin flow/i);
    assert.match(doc, /checksum.*verify/i);
    assert.match(doc, /Device Tier Gate/i);
  });

  it('keeps the existing AI safety verifier clean', () => {
    const result = scanAISafetyRegression({ root: new URL('../..', import.meta.url).pathname });
    assert.deepEqual(result.violations, []);
  });
});
