import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { buildLocalModelCandidateEvidenceViewModel } from '../../src/platform/ai/localModelCandidateEvidenceViewModel.ts';

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

describe('Phase 5.1 evidence view model and readiness integration', () => {
  it('reports three human-review candidates and zero approval/download/runtime states', () => {
    const viewModel = buildLocalModelCandidateEvidenceViewModel();
    assert.equal(viewModel.aggregate.totalCandidates, 3);
    assert.equal(viewModel.aggregate.humanReviewRequiredCandidates, 3);
    assert.equal(viewModel.aggregate.approvedCandidates, 0);
    assert.equal(viewModel.aggregate.downloadableCandidates, 0);
    assert.equal(viewModel.aggregate.activeModels, 0);
    assert.equal(viewModel.evidenceOnly, true);
    assert.equal(viewModel.humanReviewRequired, true);
    assert.equal(viewModel.modelApproved, false);
    assert.equal(viewModel.modelActive, false);
  });

  it('uses honest evidence-only copy and makes no approval or recommendation claim', () => {
    const viewModel = buildLocalModelCandidateEvidenceViewModel();
    const serialized = JSON.stringify(viewModel);
    assert.equal(viewModel.heading, 'Exact Model Candidate & License Evidence Review');
    assert.equal(viewModel.reviewSummary, 'Evidence review only');
    assert.equal(viewModel.approvalSummary, 'Human approval still required');
    assert.equal(viewModel.modelApprovalSummary, 'No model approved');
    assert.equal(viewModel.artifactApprovalSummary, 'No artifact approved');
    assert.equal(viewModel.benchmarkSummary, 'No benchmark passed');
    assert.equal(viewModel.downloadSummary, 'No download available');
    assert.equal(viewModel.modelStateSummary, 'No model active');
    assert.equal(viewModel.executionSummary, 'Production execution remains unavailable');
    assert.doesNotMatch(serialized, /License approved|Runtime ready|Model ready|Ready to download|Recommended model|Best model|4B active/i);
  });

  it('adds the Phase 5.1 card while preserving all Phase 4 cards and no action/network handlers', () => {
    const source = read('../../src/components/ai/LocalAIReadinessShell.tsx');
    for (const phase of ['4.1','4.2','4.3','4.4','4.5','4.6','4.7','4.8','4.9','4.10','4.11','5.1']) {
      assert.match(source, new RegExp(`Phase ${phase.replace('.', '\\.')}`, 'i'));
    }
    assert.match(source, /Exact Model Candidate & License Evidence Review/);
    assert.match(source, /Evidence review only/);
    assert.match(source, /Human approval still required/);
    assert.match(source, /Production execution remains unavailable/);
    assert.doesNotMatch(source, /handle.*(?:approve|download|activate|benchmark)|onClick=.*(?:approve|download|activate|benchmark)/i);
    assert.doesNotMatch(source, /fetch\s*\(|XMLHttpRequest|WebSocket|AIService/);
  });

  it('registers both Phase 5.1 tests in package scripts', () => {
    const packageJson = JSON.parse(read('../../package.json')) as { scripts: Record<string, string> };
    for (const script of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[script], /test\/platform\/localModelCandidateEvidenceRegistry\.test\.ts/);
      assert.match(packageJson.scripts[script], /test\/platform\/localModelCandidateEvidenceViewModel\.test\.ts/);
    }
  });

  it('documents official evidence, missing evidence, and approval boundaries', () => {
    const doc = read('../../docs/ai/phase-5-model-candidate-license-evidence.md');
    for (const heading of [
      'Status','Purpose','Phase 4 baseline','Candidate identity','Evidence methodology','Source quality rules',
      'Light candidate evidence','Standard candidate evidence','Pro candidate evidence','License comparison',
      'Commercial-use evidence','Redistribution evidence','Derivative and quantization evidence',
      'Attribution and notice requirements','Acceptable-use restrictions','Tokenizer evidence',
      'Runtime compatibility evidence','Missing evidence','Conflicting evidence','Human review requirements',
      'Approval boundaries','Current production state','Safety invariants','Non-goals',
    ]) assert.match(doc, new RegExp(`^## ${heading}$`, 'm'));
    assert.match(doc, /Evidence review is not legal approval/i);
    assert.match(doc, /Evidence review is not model approval/i);
    assert.match(doc, /Qwen3-0\.6B/);
    assert.match(doc, /Qwen3-1\.7B/);
    assert.match(doc, /Qwen3-4B/);
    assert.match(doc, /Apache-2\.0/);
    assert.match(doc, /no direct artifact URL/i);
    assert.match(doc, /Phase 4 blocked-safe invariants remain intact/i);
  });

  it('keeps the existing AI safety verifier clean', () => {
    const result = scanAISafetyRegression({ root: new URL('../..', import.meta.url).pathname });
    assert.deepEqual(result.violations, []);
  });
});
