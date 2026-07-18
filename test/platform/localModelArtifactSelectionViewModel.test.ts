import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { buildLocalModelArtifactSelectionViewModel } from '../../src/platform/ai/localModelArtifactSelectionViewModel.ts';

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

describe('Phase 5.4 artifact selection view model and readiness integration', () => {
  it('reports three blocked candidates and zero selections, approvals, checksums, downloads, runtime-ready artifacts, or active models', () => {
    const viewModel = buildLocalModelArtifactSelectionViewModel();
    assert.equal(viewModel.aggregate.totalCandidates, 3);
    assert.equal(viewModel.aggregate.blockedByModelLicenseReviewCandidates, 3);
    assert.equal(viewModel.aggregate.needsMoreArtifactEvidenceCandidates, 3);
    assert.equal(viewModel.aggregate.awaitingHumanSelectionCandidates, 0);
    assert.equal(viewModel.aggregate.selectedForArtifactApprovalReviewCandidates, 0);
    assert.equal(viewModel.aggregate.selectedArtifacts, 0);
    assert.equal(viewModel.aggregate.approvedArtifacts, 0);
    assert.equal(viewModel.aggregate.checksumPinnedArtifacts, 0);
    assert.equal(viewModel.aggregate.downloadableArtifacts, 0);
    assert.equal(viewModel.aggregate.runtimeReadyArtifacts, 0);
    assert.equal(viewModel.aggregate.activeModels, 0);
  });

  it('uses honest selection-gate copy without readiness or recommendation claims', () => {
    const viewModel = buildLocalModelArtifactSelectionViewModel();
    const serialized = JSON.stringify(viewModel);
    assert.equal(viewModel.heading, 'Human Artifact Variant Selection Decision Gate');
    assert.equal(viewModel.modelLicenseReviewSummary, 'Model and license review has not passed');
    assert.equal(viewModel.artifactEvidenceSummary, 'More artifact evidence is required');
    assert.equal(viewModel.selectionSummary, 'Human artifact selection not recorded');
    assert.equal(viewModel.artifactSelectionSummary, 'No artifact selected');
    assert.equal(viewModel.artifactApprovalSummary, 'No artifact approved');
    assert.equal(viewModel.checksumSummary, 'No checksum pinned');
    assert.equal(viewModel.downloadLocationSummary, 'No download location configured');
    assert.equal(viewModel.benchmarkSummary, 'No benchmark passed');
    assert.equal(viewModel.downloadSummary, 'No download available');
    assert.equal(viewModel.modelStateSummary, 'No model active');
    assert.doesNotMatch(serialized, /best quantization|recommended artifact|selected artifact ready|ready to download|checksum verified|runtime ready|model ready|4B active/i);
  });

  it('adds the Phase 5.4 card while preserving Phase 5.1–5.3 and Phase 4 closeout cards', () => {
    const shell = read('../../src/components/ai/LocalAIReadinessShell.tsx');
    assert.match(shell, /Phase 5\.4 human artifact variant selection decision gate/i);
    assert.match(shell, /Human Artifact Variant Selection Decision Gate/);
    assert.match(shell, /Model and license review has not passed/);
    assert.match(shell, /More artifact evidence is required/);
    assert.match(shell, /Human artifact selection not recorded/);
    assert.match(shell, /Phase 5\.1 exact model and license evidence review/i);
    assert.match(shell, /Phase 5\.2 human model and license review decision gate/i);
    assert.match(shell, /Phase 5\.3 official artifact variant and provenance evidence/i);
    assert.match(shell, /Phase 4\.11 local model acquisition safety closeout/i);
    assert.doesNotMatch(shell, /handle(?:ArtifactSelect|ArtifactApprove|ArtifactDownload|ArtifactActivate|ArtifactSelection)/);
  });

  it('keeps runtime integration free of network, persistence, AI service, and artifact actions', () => {
    const files = [
      '../../src/platform/ai/localModelArtifactSelectionTypes.ts',
      '../../src/platform/ai/localModelArtifactSelectionPolicy.ts',
      '../../src/platform/ai/localModelArtifactSelectionViewModel.ts',
      '../../src/components/ai/LocalAIReadinessShell.tsx',
    ];
    const forbidden = /fetch\s*\(|XMLHttpRequest|WebSocket|indexedDB|CacheStorage|caches\.open|localStorage|sessionStorage|requestAdapter\s*\(|requestDevice\s*\(|AIService|\.execute\s*\(|Math\.random|Date\.now|setTimeout\s*\(|Worker\s*\(|SharedWorker\s*\(|serviceWorker\.register/;
    for (const file of files) assert.doesNotMatch(read(file), forbidden, file);

    const selectionSource = files.slice(0, 3).map(read).join('\n');
    assert.doesNotMatch(selectionSource, /https?:\/\//);
    assert.doesNotMatch(selectionSource, /artifactApproved:\s*true|checksumPinned:\s*true|downloadable:\s*true|runtimeReady:\s*true|modelActive:\s*true/);
  });

  it('registers both Phase 5.4 tests and documents the selection boundary', () => {
    const packageJson = JSON.parse(read('../../package.json')) as { scripts: Record<string, string> };
    for (const script of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[script], /test\/platform\/localModelArtifactSelectionPolicy\.test\.ts/);
      assert.match(packageJson.scripts[script], /test\/platform\/localModelArtifactSelectionViewModel\.test\.ts/);
    }

    const doc = read('../../docs/ai/phase-5-model-artifact-selection-decision.md');
    for (const heading of [
      'Status','Purpose','Relationship to Phase 5.1','Relationship to Phase 5.2',
      'Relationship to Phase 5.3','Artifact evidence versus artifact selection',
      'Artifact selection versus artifact approval','Selection prerequisites','Selection scope',
      'Variant and format identity','Revision and size identity','Selection statuses',
      'Invalid selection combinations','Scope invalidation','Current production state',
      'Tier-matrix compatibility','Approval registry and manifest boundary',
      'Privacy and persistence','Failure handling','Safety invariants','Non-goals',
    ]) assert.match(doc, new RegExp(`^## ${heading}$`, 'm'));
    assert.match(doc, /human artifact-selection gate only/i);
    assert.match(doc, /Current selected artifact count is zero/i);
    assert.match(doc, /Selected-for-artifact-approval-review is not artifact approval/i);
    assert.match(doc, /Phase 4 blocked-safe closeout remains intact/i);
  });

  it('keeps the existing AI safety verifier clean', () => {
    const result = scanAISafetyRegression({ root: new URL('../..', import.meta.url).pathname });
    assert.deepEqual(result.violations, []);
  });
});
