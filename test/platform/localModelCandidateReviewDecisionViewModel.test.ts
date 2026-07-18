import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { buildLocalModelCandidateReviewDecisionViewModel } from '../../src/platform/ai/localModelCandidateReviewDecisionViewModel.ts';

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

describe('Phase 5.2 review decision view model and readiness integration', () => {
  it('reports three needs-more-evidence candidates and zero approval/download/model states', () => {
    const viewModel = buildLocalModelCandidateReviewDecisionViewModel();
    assert.equal(viewModel.aggregate.totalCandidates, 3);
    assert.equal(viewModel.aggregate.needsMoreEvidenceCandidates, 3);
    assert.equal(viewModel.aggregate.awaitingHumanDecisionCandidates, 0);
    assert.equal(viewModel.aggregate.approvedForArtifactReviewCandidates, 0);
    assert.equal(viewModel.aggregate.rejectedCandidates, 0);
    assert.equal(viewModel.aggregate.modelApprovedCandidates, 0);
    assert.equal(viewModel.aggregate.licenseApprovedCandidates, 0);
    assert.equal(viewModel.aggregate.artifactApprovedCandidates, 0);
    assert.equal(viewModel.aggregate.downloadableCandidates, 0);
    assert.equal(viewModel.aggregate.activeModels, 0);
    assert.equal(viewModel.decisionGateOnly, true);
    assert.equal(viewModel.modelApproved, false);
    assert.equal(viewModel.modelActive, false);
  });

  it('uses honest decision-gate copy without readiness or recommendation claims', () => {
    const viewModel = buildLocalModelCandidateReviewDecisionViewModel();
    const serialized = JSON.stringify(viewModel);
    assert.equal(viewModel.heading, 'Human Model & License Review Decision Gate');
    assert.equal(viewModel.reviewSummary, 'Human decision not recorded');
    assert.equal(viewModel.evidenceSummary, 'More evidence is required');
    assert.equal(viewModel.decisionSummary, 'No candidate approved for artifact review');
    assert.equal(viewModel.modelApprovalSummary, 'No model approved');
    assert.equal(viewModel.licenseApprovalSummary, 'No license approved');
    assert.equal(viewModel.artifactApprovalSummary, 'No artifact approved');
    assert.equal(viewModel.benchmarkSummary, 'No benchmark passed');
    assert.equal(viewModel.downloadSummary, 'No download available');
    assert.equal(viewModel.modelStateSummary, 'No model active');
    assert.equal(viewModel.executionSummary, 'Production execution remains unavailable');
    assert.doesNotMatch(serialized, /Model ready|Runtime ready|Recommended model|Best model|Ready for download|4B active/i);
  });

  it('adds the Phase 5.2 card while preserving Phase 5.1 and Phase 4 closeout without action handlers', () => {
    const source = read('../../src/components/ai/LocalAIReadinessShell.tsx');
    for (const phase of ['4.1','4.2','4.3','4.4','4.5','4.6','4.7','4.8','4.9','4.10','4.11','5.1','5.2']) {
      assert.match(source, new RegExp(`Phase ${phase.replace('.', '\\.')}`, 'i'));
    }
    assert.match(source, /Human Model & License Review Decision Gate/);
    assert.match(source, /Human decision not recorded/);
    assert.match(source, /More evidence is required/);
    assert.match(source, /No candidate approved for artifact review/);
    assert.doesNotMatch(source, /handle.*(?:approve|reject|download|activate)|onClick=.*(?:approve|reject|download|activate)/i);
    assert.doesNotMatch(source, /fetch\s*\(|XMLHttpRequest|WebSocket|AIService|localStorage|sessionStorage/);
  });

  it('keeps Phase 5.2 runtime sources side-effect-free and free of reviewer identity or direct URLs', () => {
    const files = [
      '../../src/platform/ai/localModelCandidateReviewDecisionTypes.ts',
      '../../src/platform/ai/localModelCandidateReviewDecisionPolicy.ts',
      '../../src/platform/ai/localModelCandidateReviewDecisionViewModel.ts',
      '../../src/components/ai/LocalAIReadinessShell.tsx',
    ];
    const forbidden = /fetch\s*\(|XMLHttpRequest|WebSocket|indexedDB|CacheStorage|caches\.open|localStorage|sessionStorage|requestAdapter\s*\(|requestDevice\s*\(|AIService|\.execute\s*\(|Math\.random|Date\.now|setTimeout|Worker\s*\(|SharedWorker\s*\(|serviceWorker\.register|https?:\/\/|reviewer(?:Name|Email|Id)|signature|reviewedAt|decisionId/i;
    for (const file of files) assert.doesNotMatch(read(file), forbidden, file);
  });

  it('registers both Phase 5.2 tests in package scripts', () => {
    const packageJson = JSON.parse(read('../../package.json')) as { scripts: Record<string, string> };
    for (const script of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[script], /test\/platform\/localModelCandidateReviewDecisionPolicy\.test\.ts/);
      assert.match(packageJson.scripts[script], /test\/platform\/localModelCandidateReviewDecisionViewModel\.test\.ts/);
    }
  });

  it('documents the evidence boundary, invalid decisions, privacy, and production pending state', () => {
    const doc = read('../../docs/ai/phase-5-model-license-human-review-decision.md');
    for (const heading of [
      'Status','Purpose','Relationship to Phase 5.1','Evidence versus human decision','Human review categories',
      'Evidence completeness gate','Decision statuses','Approved-for-artifact-review meaning',
      'Invalid decision combinations','Current production state','Tier-matrix compatibility',
      'Approval registry boundary','Privacy and persistence','Failure handling','Safety invariants','Non-goals',
    ]) assert.match(doc, new RegExp(`^## ${heading}$`, 'm'));
    assert.match(doc, /decision gate only/i);
    assert.match(doc, /current three candidates need more evidence/i);
    assert.match(doc, /no human decision.*recorded/i);
    assert.match(doc, /Approved-for-artifact-review.*not model approval/i);
    assert.match(doc, /Phase 4 blocked-safe foundation remains intact/i);
  });

  it('keeps the existing AI safety verifier clean', () => {
    const result = scanAISafetyRegression({ root: new URL('../..', import.meta.url).pathname });
    assert.deepEqual(result.violations, []);
  });
});
