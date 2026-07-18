import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { buildLocalModelHumanArtifactSelectionViewModel } from '../../src/platform/ai/localModelHumanArtifactSelectionViewModel.ts';

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

describe('Phase 5.9 artifact selection view model and readiness integration', () => {
  it('reports three unavailable sessions and zero recorded selections or approvals', () => {
    const viewModel = buildLocalModelHumanArtifactSelectionViewModel();
    assert.equal(viewModel.aggregate.totalCandidates, 3);
    assert.equal(viewModel.aggregate.unavailableSelectionSessions, 3);
    assert.equal(viewModel.aggregate.awaitingHumanSelectionCandidates, 0);
    assert.equal(viewModel.aggregate.selectionRecordedCandidates, 0);
    assert.equal(viewModel.aggregate.moreEvidenceRequestedCandidates, 0);
    assert.equal(viewModel.aggregate.rejectedCandidates, 0);
    assert.equal(viewModel.aggregate.invalidatedCandidates, 0);
    assert.equal(viewModel.aggregate.attentionRequiredCandidates, 0);
    assert.equal(viewModel.aggregate.humanSelectionsRecorded, 0);
    assert.equal(viewModel.aggregate.selectedArtifacts, 0);
    assert.equal(viewModel.aggregate.candidatesEligibleForArtifactApprovalReview, 0);
    assert.equal(viewModel.aggregate.approvedArtifacts, 0);
    assert.equal(viewModel.aggregate.checksumPinnedArtifacts, 0);
    assert.equal(viewModel.aggregate.checksumVerifiedArtifacts, 0);
    assert.equal(viewModel.aggregate.downloadableArtifacts, 0);
    assert.equal(viewModel.aggregate.runtimeReadyArtifacts, 0);
    assert.equal(viewModel.aggregate.activeModels, 0);
  });

  it('uses honest boundary copy without recommendation or readiness claims', () => {
    const viewModel = buildLocalModelHumanArtifactSelectionViewModel();
    const serialized = JSON.stringify(viewModel);
    assert.equal(viewModel.heading, 'Explicit Human Artifact Selection Recording Boundary');
    assert.equal(viewModel.governanceBoundarySummary, 'Governance decisions are not complete');
    assert.equal(viewModel.artifactEvidenceSummary, 'Artifact selection is unavailable');
    assert.equal(viewModel.selectionSummary, 'Human artifact selection is not recorded · No artifact selected');
    assert.match(viewModel.artifactApprovalBoundarySummary, /No candidate can proceed to artifact approval review/);
    assert.match(viewModel.artifactApprovalBoundarySummary, /No artifact approved/);
    assert.match(viewModel.artifactApprovalBoundarySummary, /No checksum pinned/);
    assert.match(viewModel.artifactApprovalBoundarySummary, /No checksum verified/);
    assert.match(viewModel.artifactApprovalBoundarySummary, /No benchmark passed/);
    assert.match(viewModel.artifactApprovalBoundarySummary, /No download available/);
    assert.match(viewModel.artifactApprovalBoundarySummary, /No model active/);
    assert.doesNotMatch(serialized, /artifact ready|selected artifact ready|ready to download|runtime ready|model ready|recommended artifact|best quantization|4B active/i);
  });

  it('adds Phase 5.9 card while preserving Phase 5.1–5.8 and Phase 4 closeout cards', () => {
    const shell = read('../../src/components/ai/LocalAIReadinessShell.tsx');
    assert.match(shell, /Phase 5\.9 explicit human artifact selection recording boundary/i);
    assert.match(shell, /Explicit Human Artifact Selection Recording Boundary/);
    assert.match(shell, /Governance decisions are not complete/);
    assert.match(shell, /Artifact selection is unavailable/);
    assert.match(shell, /recorded selections/i);
    for (const phase of ['5.1','5.2','5.3','5.4','5.5','5.6','5.7','5.8']) {
      assert.match(shell, new RegExp(`Phase ${phase.replace('.', '\\.')}`, 'i'));
    }
    assert.match(shell, /Phase 4\.11 local model acquisition safety closeout/i);
    assert.doesNotMatch(shell, /handle(?:ArtifactSelection|ArtifactSelect|ArtifactReject|ArtifactApprove|ArtifactDownload)/);
  });

  it('keeps Phase 5.9 runtime sources free of network, persistence, AI service, automatic selection, and approvals', () => {
    const files = [
      '../../src/platform/ai/localModelHumanArtifactSelectionTypes.ts',
      '../../src/platform/ai/localModelHumanArtifactSelectionPolicy.ts',
      '../../src/platform/ai/localModelHumanArtifactSelectionViewModel.ts',
      '../../src/components/ai/LocalAIReadinessShell.tsx',
    ];
    const forbidden = /fetch\s*\(|XMLHttpRequest|WebSocket|indexedDB|CacheStorage|caches\.open|localStorage|sessionStorage|requestAdapter\s*\(|requestDevice\s*\(|AIService|\.execute\s*\(|Math\.random|Date\.now|setTimeout\s*\(|Worker\s*\(|SharedWorker\s*\(|serviceWorker\.register/;
    for (const file of files) assert.doesNotMatch(read(file), forbidden, file);
    const source = files.slice(0, 3).map(read).join('\n');
    assert.doesNotMatch(source, /https?:\/\//);
    assert.doesNotMatch(source, /modelApproved:\s*true|licenseApproved:\s*true|artifactSelected:\s*true|artifactApproved:\s*true|checksumPinned:\s*true|checksumVerified:\s*true|benchmarkVerified:\s*true|downloadable:\s*true|runtimeReady:\s*true|modelActive:\s*true/);
    assert.doesNotMatch(source, /reviewer(?:Name|Email|Id)|signature|selectionTimestamp|randomSelection/i);
  });

  it('registers both Phase 5.9 tests and documents the selection boundary', () => {
    const packageJson = JSON.parse(read('../../package.json')) as { scripts: Record<string, string> };
    for (const script of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[script], /test\/platform\/localModelHumanArtifactSelectionPolicy\.test\.ts/);
      assert.match(packageJson.scripts[script], /test\/platform\/localModelHumanArtifactSelectionViewModel\.test\.ts/);
    }
    const doc = read('../../docs/ai/phase-5-model-human-artifact-selection-boundary.md');
    for (const heading of [
      'Status','Purpose','Relationship to Phase 5.3','Relationship to Phase 5.4','Relationship to Phase 5.5',
      'Relationship to Phase 5.8','Governance decision versus artifact selection','Artifact selection versus artifact approval',
      'Selection prerequisites','Selectable artifact options','Selection decisions','Selection session statuses','Selection scope',
      'Scope invalidation','Base and quantized variants','Repository and revision identity','Exact size and integrity identity',
      'More-evidence requests','Rejections','Selection recorded','Artifact-approval review boundary','Current production state',
      'Tier-matrix compatibility','Privacy and persistence','Failure handling','Safety invariants','Non-goals',
    ]) assert.match(doc, new RegExp(`^## ${heading}$`, 'm'));
    assert.match(doc, /artifact-selection recording boundary only/i);
    assert.match(doc, /Current governance decisions complete = 0/i);
    assert.match(doc, /Current human artifact selections recorded = 0/i);
    assert.match(doc, /select is not artifact approval/i);
    assert.match(doc, /Phase 4 blocked-safe closeout remains intact/i);
  });

  it('keeps the existing AI safety verifier clean', () => {
    const result = scanAISafetyRegression({ root: new URL('../..', import.meta.url).pathname });
    assert.deepEqual(result.violations, []);
  });
});
