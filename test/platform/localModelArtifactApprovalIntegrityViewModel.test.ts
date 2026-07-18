import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { buildLocalModelArtifactApprovalIntegrityViewModel } from '../../src/platform/ai/localModelArtifactApprovalIntegrityViewModel.ts';

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

describe('Phase 5.10 artifact approval integrity view model and readiness integration', () => {
  it('reports three unavailable sessions and zero approvals, pins, or benchmark eligibility', () => {
    const viewModel = buildLocalModelArtifactApprovalIntegrityViewModel();
    assert.equal(viewModel.aggregate.totalCandidates, 3);
    assert.equal(viewModel.aggregate.unavailableApprovalSessions, 3);
    assert.equal(viewModel.aggregate.awaitingHumanApprovalCandidates, 0);
    assert.equal(viewModel.aggregate.partiallyRecordedCandidates, 0);
    assert.equal(viewModel.aggregate.moreEvidenceRequestedCandidates, 0);
    assert.equal(viewModel.aggregate.artifactApprovalCompleteCandidates, 0);
    assert.equal(viewModel.aggregate.rejectedCandidates, 0);
    assert.equal(viewModel.aggregate.invalidatedCandidates, 0);
    assert.equal(viewModel.aggregate.attentionRequiredCandidates, 0);
    assert.equal(viewModel.aggregate.artifactApprovalDecisionsRecorded, 0);
    assert.equal(viewModel.aggregate.integrityPinningDecisionsRecorded, 0);
    assert.equal(viewModel.aggregate.approvedArtifacts, 0);
    assert.equal(viewModel.aggregate.approvedIntegrityPinPlans, 0);
    assert.equal(viewModel.aggregate.checksumPinnedArtifacts, 0);
    assert.equal(viewModel.aggregate.checksumVerifiedArtifacts, 0);
    assert.equal(viewModel.aggregate.candidatesEligibleForBenchmarkPlanning, 0);
    assert.equal(viewModel.aggregate.downloadableArtifacts, 0);
    assert.equal(viewModel.aggregate.runtimeReadyArtifacts, 0);
    assert.equal(viewModel.aggregate.activeModels, 0);
  });

  it('uses honest boundary copy without approval, verification, download, or readiness claims', () => {
    const viewModel = buildLocalModelArtifactApprovalIntegrityViewModel();
    const serialized = JSON.stringify(viewModel);
    assert.equal(viewModel.heading, 'Explicit Human Artifact Approval & Integrity Pinning Boundary');
    assert.equal(viewModel.selectionBoundarySummary, 'No artifact selection has been recorded');
    assert.equal(viewModel.artifactApprovalSummary, 'Artifact approval is unavailable · Human artifact approval is not recorded');
    assert.equal(viewModel.integrityPinningSummary, 'Integrity pinning approval is not recorded · No checksum pinned');
    assert.match(viewModel.verificationBoundarySummary, /No checksum verified/);
    assert.match(viewModel.benchmarkPlanningBoundarySummary, /No candidate can proceed to benchmark planning/);
    assert.match(viewModel.benchmarkPlanningBoundarySummary, /No benchmark passed/);
    assert.match(viewModel.benchmarkPlanningBoundarySummary, /No download available/);
    assert.match(viewModel.benchmarkPlanningBoundarySummary, /No model active/);
    assert.doesNotMatch(serialized, /artifact ready|ready to download|benchmark ready|runtime ready|model ready|recommended artifact|4B active/i);
  });

  it('adds Phase 5.10 card while preserving Phase 5.1–5.9 and Phase 4 closeout cards', () => {
    const shell = read('../../src/components/ai/LocalAIReadinessShell.tsx');
    assert.match(shell, /Phase 5\.10 explicit human artifact approval and integrity pinning boundary/i);
    assert.match(shell, /Explicit Human Artifact Approval & Integrity Pinning Boundary/);
    assert.match(shell, /No artifact selection has been recorded/);
    assert.match(shell, /Artifact approval is unavailable/);
    assert.match(shell, /Integrity pinning approval is not recorded/);
    for (const phase of ['5.1','5.2','5.3','5.4','5.5','5.6','5.7','5.8','5.9']) {
      assert.match(shell, new RegExp(`Phase ${phase.replace('.', '\\.')}`, 'i'));
    }
    assert.match(shell, /Phase 4\.11 local model acquisition safety closeout/i);
    assert.doesNotMatch(shell, /handle(?:ArtifactApproval|IntegrityPin|ChecksumVerify|ArtifactDownload)/);
  });

  it('keeps Phase 5.10 runtime sources free of network, persistence, AI service, automatic approval, and production digests', () => {
    const files = [
      '../../src/platform/ai/localModelArtifactApprovalIntegrityTypes.ts',
      '../../src/platform/ai/localModelArtifactApprovalIntegrityPolicy.ts',
      '../../src/platform/ai/localModelArtifactApprovalIntegrityViewModel.ts',
      '../../src/components/ai/LocalAIReadinessShell.tsx',
    ];
    const forbidden = /fetch\s*\(|XMLHttpRequest|WebSocket|indexedDB|CacheStorage|caches\.open|localStorage|sessionStorage|requestAdapter\s*\(|requestDevice\s*\(|AIService|\.execute\s*\(|Math\.random|Date\.now|setTimeout\s*\(|Worker\s*\(|SharedWorker\s*\(|serviceWorker\.register/;
    for (const file of files) assert.doesNotMatch(read(file), forbidden, file);
    const source = files.slice(0, 3).map(read).join('\n');
    assert.doesNotMatch(source, /https?:\/\//);
    assert.doesNotMatch(source, /[a-f0-9]{64}/);
    assert.doesNotMatch(source, /modelApproved:\s*true|licenseApproved:\s*true|checksumVerified:\s*true|benchmarkVerified:\s*true|downloadable:\s*true|runtimeReady:\s*true|modelActive:\s*true/);
    assert.doesNotMatch(source, /reviewer(?:Name|Email|Id)|signature|approvalTimestamp|randomApproval/i);
  });

  it('registers both Phase 5.10 tests and documents the approval and pinning boundary', () => {
    const packageJson = JSON.parse(read('../../package.json')) as { scripts: Record<string, string> };
    for (const script of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[script], /test\/platform\/localModelArtifactApprovalIntegrityPolicy\.test\.ts/);
      assert.match(packageJson.scripts[script], /test\/platform\/localModelArtifactApprovalIntegrityViewModel\.test\.ts/);
    }
    const doc = read('../../docs/ai/phase-5-model-artifact-approval-integrity-boundary.md');
    for (const heading of [
      'Status','Purpose','Relationship to Phase 5.5','Relationship to Phase 5.8','Relationship to Phase 5.9',
      'Artifact selection versus artifact approval','Artifact approval versus model and license approval',
      'Integrity evidence versus pinning','Integrity pinning versus verification','Approval prerequisites',
      'Human approval decisions','Integrity pin plan','Supported integrity algorithms','Required file coverage',
      'Approval scope','Scope invalidation','Partial decisions','More-evidence requests','Rejections',
      'Artifact approval complete','Benchmark-planning boundary','Approval registry boundary','Artifact manifest boundary',
      'Current production state','Tier-matrix compatibility','Privacy and persistence','Failure handling','Safety invariants','Non-goals',
    ]) assert.match(doc, new RegExp(`^## ${heading}$`, 'm'));
    assert.match(doc, /artifact approval and integrity-pinning boundary only/i);
    assert.match(doc, /Current artifact selections recorded = 0/i);
    assert.match(doc, /Pinning does not verify checksum/i);
    assert.match(doc, /Phase 4 blocked-safe closeout remains intact/i);
  });

  it('keeps the existing AI safety verifier clean', () => {
    const result = scanAISafetyRegression({ root: new URL('../..', import.meta.url).pathname });
    assert.deepEqual(result.violations, []);
  });
});
