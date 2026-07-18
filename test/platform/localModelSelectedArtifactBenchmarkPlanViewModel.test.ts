import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { buildLocalModelSelectedArtifactBenchmarkPlanViewModel } from '../../src/platform/ai/localModelSelectedArtifactBenchmarkPlanViewModel.ts';

const require = createRequire(import.meta.url);
const { scanAISafetyRegression } = require('../../scripts/verify_ai_safety_regression.cjs') as {
  scanAISafetyRegression(options: { root: string }): {
    files: string[];
    violations: Array<{ path: string; ruleId: string; message: string }>;
  };
};

function read(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Phase 5.11 benchmark plan view model and readiness integration', () => {
  it('reports three unavailable sessions and zero plans, executions, measurements, or outcomes', () => {
    const viewModel = buildLocalModelSelectedArtifactBenchmarkPlanViewModel();
    assert.equal(viewModel.aggregate.totalCandidates, 3);
    assert.equal(viewModel.aggregate.unavailablePlanSessions, 3);
    assert.equal(viewModel.aggregate.awaitingPlanReviewCandidates, 0);
    assert.equal(viewModel.aggregate.benchmarkPlanApprovedCandidates, 0);
    assert.equal(viewModel.aggregate.moreEvidenceRequestedCandidates, 0);
    assert.equal(viewModel.aggregate.rejectedCandidates, 0);
    assert.equal(viewModel.aggregate.invalidatedCandidates, 0);
    assert.equal(viewModel.aggregate.attentionRequiredCandidates, 0);
    assert.equal(viewModel.aggregate.benchmarkPlansRecorded, 0);
    assert.equal(viewModel.aggregate.candidatesEligibleForFutureBenchmarkExecutionReview, 0);
    assert.equal(viewModel.aggregate.benchmarkExecutionsStarted, 0);
    assert.equal(viewModel.aggregate.benchmarkExecutionsCompleted, 0);
    assert.equal(viewModel.aggregate.benchmarkMeasurementsRecorded, 0);
    assert.equal(viewModel.aggregate.benchmarkPassedCandidates, 0);
    assert.equal(viewModel.aggregate.benchmarkFailedCandidates, 0);
    assert.equal(viewModel.aggregate.checksumVerifiedArtifacts, 0);
    assert.equal(viewModel.aggregate.downloadableArtifacts, 0);
    assert.equal(viewModel.aggregate.runtimeReadyArtifacts, 0);
    assert.equal(viewModel.aggregate.activeModels, 0);
  });

  it('uses honest benchmark-planning copy without execution, performance, or readiness claims', () => {
    const viewModel = buildLocalModelSelectedArtifactBenchmarkPlanViewModel();
    const serialized = JSON.stringify(viewModel);
    assert.equal(viewModel.heading, 'Selected Artifact Benchmark Evidence Plan Boundary');
    assert.equal(viewModel.artifactApprovalSummary, 'No artifact approval is complete');
    assert.equal(viewModel.benchmarkPlanSummary, 'Benchmark planning is unavailable · No benchmark plan has been approved');
    assert.match(viewModel.measurementBoundarySummary, /No benchmark measurements are recorded/);
    assert.match(viewModel.executionBoundarySummary, /No benchmark has started/);
    assert.match(viewModel.executionBoundarySummary, /No benchmark has passed/);
    assert.match(viewModel.fallbackSummary, /Deterministic fallback remains required/);
    assert.match(viewModel.executionBoundarySummary, /No download available/);
    assert.match(viewModel.executionBoundarySummary, /No runtime ready/);
    assert.match(viewModel.executionBoundarySummary, /No model active/);
    assert.doesNotMatch(serialized, /performance verified|artifact benchmarked|ready to download|model ready|recommended model|fast enough|4B active/i);
  });

  it('adds the Phase 5.11 card while preserving Phase 5.1–5.10 and Phase 4 cards', () => {
    const shell = read('../../src/components/ai/LocalAIReadinessShell.tsx');
    assert.match(shell, /Phase 5\.11 selected artifact benchmark evidence plan boundary/i);
    assert.match(shell, /Selected Artifact Benchmark Evidence Plan Boundary/);
    assert.match(shell, /No artifact approval is complete/);
    assert.match(shell, /Benchmark planning is unavailable/);
    assert.match(shell, /No benchmark plan has been approved/);
    for (const phase of ['5.1','5.2','5.3','5.4','5.5','5.6','5.7','5.8','5.9','5.10']) {
      assert.match(shell, new RegExp(`Phase ${phase.replace('.', '\\.')}`, 'i'));
    }
    assert.match(shell, /Phase 4\.11 local model acquisition safety closeout/i);
    assert.doesNotMatch(shell, /handle(?:BenchmarkPlanApproval|BenchmarkRun|BenchmarkDownload)/);
  });

  it('keeps Phase 5.11 runtime sources free of execution, network, persistence, AI service, and fake benchmark values', () => {
    const files = [
      '../../src/platform/ai/localModelSelectedArtifactBenchmarkPlanTypes.ts',
      '../../src/platform/ai/localModelSelectedArtifactBenchmarkPlanPolicy.ts',
      '../../src/platform/ai/localModelSelectedArtifactBenchmarkPlanViewModel.ts',
      '../../src/components/ai/LocalAIReadinessShell.tsx',
    ];
    const forbidden = /fetch\s*\(|XMLHttpRequest|WebSocket|indexedDB|CacheStorage|caches\.open|localStorage|sessionStorage|requestAdapter\s*\(|requestDevice\s*\(|navigator\.gpu|AIService|\.execute\s*\(|Math\.random|Date\.now|performance\.now|setTimeout\s*\(|Worker\s*\(|SharedWorker\s*\(|serviceWorker\.register/;
    for (const file of files) assert.doesNotMatch(read(file), forbidden, file);
    const source = files.slice(0, 3).map(read).join('\n');
    assert.doesNotMatch(source, /https?:\/\//);
    assert.doesNotMatch(source, /benchmarkExecutionStarted:\s*true|benchmarkExecutionCompleted:\s*true|benchmarkMeasurementsRecorded:\s*true|benchmarkVerified:\s*true|benchmarkPassed:\s*true|benchmarkFailed:\s*true|checksumVerified:\s*true|downloadable:\s*true|runtimeReady:\s*true|modelActive:\s*true/);
    assert.doesNotMatch(source, /reviewer(?:Name|Email|Id)|signature|benchmarkTimestamp|randomBenchmark/i);
  });

  it('registers both Phase 5.11 tests and documents the benchmark-plan-only boundary', () => {
    const packageJson = JSON.parse(read('../../package.json')) as { scripts: Record<string, string> };
    for (const script of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[script], /test\/platform\/localModelSelectedArtifactBenchmarkPlanPolicy\.test\.ts/);
      assert.match(packageJson.scripts[script], /test\/platform\/localModelSelectedArtifactBenchmarkPlanViewModel\.test\.ts/);
    }
    const doc = read('../../docs/ai/phase-5-selected-artifact-benchmark-plan.md');
    for (const heading of [
      'Status','Purpose','Relationship to Phase 4.3','Relationship to Phase 4.4','Relationship to Phase 4.6','Relationship to Phase 5.10',
      'Artifact approval versus benchmark planning','Benchmark planning versus benchmark execution','Benchmark execution versus benchmark pass',
      'Benchmark pass versus runtime readiness','Plan prerequisites','Benchmark plan decisions','Plan session statuses','Approved artifact scope',
      'Benchmark plan scope','Scope invalidation','Scenario categories','Measurement requirements','AI Tutor scenarios','Practice Generator scenarios',
      'Writing Coach scenarios','Speaking Coach scenarios','Learner Memory scenarios','Deterministic fallback continuity','Run-count requirements',
      'Failure and crash handling','Device Tier Gate ownership','Benchmark-threshold ownership','Future benchmark-execution boundary',
      'Current production state','Tier-matrix compatibility','Privacy and persistence','Safety invariants','Non-goals',
    ]) assert.match(doc, new RegExp(`^## ${heading}$`, 'm'));
    assert.match(doc, /benchmark evidence plan boundary only/i);
    assert.match(doc, /Current artifact approvals complete = 0/i);
    assert.match(doc, /Benchmark plan approval is not benchmark execution/i);
    assert.match(doc, /Phase 4 blocked-safe closeout remains intact/i);
  });

  it('keeps the existing AI safety verifier clean', () => {
    const result = scanAISafetyRegression({ root: new URL('../..', import.meta.url).pathname });
    assert.deepEqual(result.violations, []);
  });
});
