import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { buildLocalModelArtifactEvidenceViewModel } from '../../src/platform/ai/localModelArtifactEvidenceViewModel.ts';

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

describe('Phase 5.3 artifact evidence view model and readiness integration', () => {
  it('reports three evidence candidates and zero selected, approved, downloadable, runtime-ready, or active artifacts', () => {
    const viewModel = buildLocalModelArtifactEvidenceViewModel();
    assert.equal(viewModel.aggregate.totalCandidates, 3);
    assert.equal(viewModel.aggregate.selectedArtifacts, 0);
    assert.equal(viewModel.aggregate.approvedArtifacts, 0);
    assert.equal(viewModel.aggregate.downloadableArtifacts, 0);
    assert.equal(viewModel.aggregate.runtimeReadyArtifacts, 0);
    assert.equal(viewModel.aggregate.activeModels, 0);
    assert.equal(viewModel.evidenceOnly, true);
    assert.equal(viewModel.artifactSelected, false);
    assert.equal(viewModel.artifactApproved, false);
    assert.equal(viewModel.modelActive, false);
  });

  it('uses honest evidence-only copy without readiness or recommendation claims', () => {
    const viewModel = buildLocalModelArtifactEvidenceViewModel();
    const serialized = JSON.stringify(viewModel);
    assert.equal(viewModel.heading, 'Official Artifact Variant & Provenance Evidence Review');
    assert.equal(viewModel.evidenceSummary, 'Artifact evidence only');
    assert.equal(viewModel.selectionSummary, 'Human artifact selection still required');
    assert.equal(viewModel.artifactSelectionSummary, 'No artifact selected');
    assert.equal(viewModel.artifactApprovalSummary, 'No artifact approved');
    assert.equal(viewModel.checksumSummary, 'No checksum pinned');
    assert.equal(viewModel.downloadLocationSummary, 'No download location configured');
    assert.equal(viewModel.benchmarkSummary, 'No benchmark passed');
    assert.equal(viewModel.downloadSummary, 'No download available');
    assert.equal(viewModel.modelStateSummary, 'No model active');
    assert.equal(viewModel.executionSummary, 'Production execution remains unavailable');
    assert.doesNotMatch(serialized, /artifact ready|ready to download|checksum verified|runtime ready|model ready|recommended artifact|best quantization|4B active/i);
    assert.doesNotMatch(serialized, /browser compatible|WebGPU compatible|WebLLM compatible/i);
  });

  it('exposes repository, revision, format and only officially confirmed aggregate-size evidence', () => {
    const viewModel = buildLocalModelArtifactEvidenceViewModel();
    const expectedSizeLabels = new Map([
      ['qwen3-0-6b-candidate', 'Exact aggregate size not confirmed'],
      ['qwen3-1-7b-candidate', '3875.2 MiB official aggregate'],
      ['qwen3-4b-candidate', '7672.2 MiB official aggregate'],
    ]);
    for (const row of viewModel.candidateRows) {
      assert.match(row.officialRepositoryId, /^Qwen\/Qwen3-/);
      assert.match(row.observedRevision ?? '', /^[a-f0-9]{40}$/);
      assert.equal(row.artifactFormat, 'safetensors');
      assert.equal(row.aggregateSizeLabel, expectedSizeLabels.get(row.candidateId));
      assert.equal(row.artifactSelected, false);
      assert.equal(row.artifactApproved, false);
    }
  });

  it('adds the Phase 5.3 card while preserving Phase 5.1, Phase 5.2, and Phase 4 closeout cards', () => {
    const shell = read('../../src/components/ai/LocalAIReadinessShell.tsx');
    assert.match(shell, /Phase 5\.3 official artifact variant and provenance evidence/i);
    assert.match(shell, /Official Artifact Variant & Provenance Evidence Review/);
    assert.match(shell, /Artifact evidence only/);
    assert.match(shell, /Human artifact selection still required/);
    assert.match(shell, /Phase 5\.1 exact model and license evidence review/i);
    assert.match(shell, /Phase 5\.2 human model and license review decision gate/i);
    assert.match(shell, /Phase 4\.11 local model acquisition safety closeout/i);
    assert.match(shell, /selected artifacts/i);
    assert.match(shell, /approved artifacts/i);
    assert.match(shell, /downloadable artifacts/i);
    assert.match(shell, /active models/i);
    assert.doesNotMatch(shell, /handle(?:ArtifactSelect|ArtifactApprove|ArtifactDownload|ArtifactActivate)/);
  });

  it('keeps runtime integration free of network, persistence, AI service, and artifact actions', () => {
    const files = [
      '../../src/platform/ai/localModelArtifactEvidenceTypes.ts',
      '../../src/platform/ai/localModelArtifactEvidenceRegistry.ts',
      '../../src/platform/ai/localModelArtifactEvidenceViewModel.ts',
      '../../src/components/ai/LocalAIReadinessShell.tsx',
    ];
    const forbidden = /fetch\s*\(|XMLHttpRequest|WebSocket|indexedDB|CacheStorage|caches\.open|localStorage|sessionStorage|requestAdapter\s*\(|requestDevice\s*\(|AIService|\.execute\s*\(|Math\.random|Date\.now|setTimeout\s*\(|serviceWorker\.register/;
    for (const file of files) assert.doesNotMatch(read(file), forbidden, file);
  });

  it('registers both Phase 5.3 tests in package scripts and documents the complete evidence boundary', () => {
    const packageJson = JSON.parse(read('../../package.json')) as { scripts: Record<string, string> };
    for (const script of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[script], /test\/platform\/localModelArtifactEvidenceRegistry\.test\.ts/);
      assert.match(packageJson.scripts[script], /test\/platform\/localModelArtifactEvidenceViewModel\.test\.ts/);
    }

    const doc = read('../../docs/ai/phase-5-model-artifact-provenance-evidence.md');
    for (const heading of [
      'Status','Purpose','Relationship to Phase 5.1','Relationship to Phase 5.2',
      'Artifact evidence versus artifact selection','Source quality rules','Official repository identity',
      'Revision and immutability evidence','Weight format evidence','File inventory evidence',
      'Aggregate size evidence','Config evidence','Tokenizer evidence','License and NOTICE evidence',
      'LFS and integrity metadata','Official quantized variants','Light candidate artifact evidence',
      'Standard candidate artifact evidence','Pro candidate artifact evidence','Missing evidence',
      'Conflicting evidence','Human artifact review requirements','Current production state',
      'Tier-matrix compatibility','Privacy and runtime boundaries','Safety invariants','Non-goals',
    ]) assert.match(doc, new RegExp(`^## ${heading}$`, 'm'));
    assert.match(doc, /Artifact evidence is not artifact selection/i);
    assert.match(doc, /Revision evidence is not checksum verification/i);
    assert.match(doc, /Current human decision gate remains blocked/i);
    assert.match(doc, /Phase 4 production blocked-safe invariants remain intact/i);
  });

  it('keeps the existing AI safety verifier clean', () => {
    const result = scanAISafetyRegression({ root: new URL('../..', import.meta.url).pathname });
    assert.deepEqual(result.violations, []);
  });
});
