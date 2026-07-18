import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { buildLocalModelHumanGovernanceDecisionViewModel } from '../../src/platform/ai/localModelHumanGovernanceDecisionViewModel.ts';

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

describe('Phase 5.8 governance decision view model and readiness integration', () => {
  it('reports three available awaiting sessions and twelve unrecorded decisions', () => {
    const viewModel = buildLocalModelHumanGovernanceDecisionViewModel();
    assert.equal(viewModel.aggregate.totalCandidates, 3);
    assert.equal(viewModel.aggregate.totalDecisionItems, 12);
    assert.equal(viewModel.aggregate.availableDecisionSessions, 3);
    assert.equal(viewModel.aggregate.awaitingHumanDecisionCandidates, 3);
    assert.equal(viewModel.aggregate.partiallyRecordedCandidates, 0);
    assert.equal(viewModel.aggregate.moreEvidenceRequestedCandidates, 0);
    assert.equal(viewModel.aggregate.governanceDecisionsCompleteCandidates, 0);
    assert.equal(viewModel.aggregate.rejectedCandidates, 0);
    assert.equal(viewModel.aggregate.invalidatedCandidates, 0);
    assert.equal(viewModel.aggregate.attentionRequiredCandidates, 0);
    assert.equal(viewModel.aggregate.recordedDecisionItems, 0);
    assert.equal(viewModel.aggregate.proceedDecisionItems, 0);
    assert.equal(viewModel.aggregate.rejectedDecisionItems, 0);
    assert.equal(viewModel.aggregate.moreEvidenceDecisionItems, 0);
    assert.equal(viewModel.aggregate.candidatesEligibleForArtifactSelectionReview, 0);
    assert.equal(viewModel.aggregate.modelApprovedCandidates, 0);
    assert.equal(viewModel.aggregate.licenseApprovedCandidates, 0);
    assert.equal(viewModel.aggregate.selectedArtifacts, 0);
    assert.equal(viewModel.aggregate.approvedArtifacts, 0);
    assert.equal(viewModel.aggregate.downloadableArtifacts, 0);
    assert.equal(viewModel.aggregate.activeModels, 0);
  });

  it('uses honest decision-boundary copy without approval or readiness claims', () => {
    const viewModel = buildLocalModelHumanGovernanceDecisionViewModel();
    const serialized = JSON.stringify(viewModel);
    assert.equal(viewModel.heading, 'Explicit Human Governance Decision Boundary');
    assert.equal(viewModel.boundarySummary, 'Human decisions are not recorded');
    assert.equal(viewModel.evidenceSummary, 'Governance evidence is available for review');
    assert.equal(viewModel.decisionSummary, 'Twelve explicit requirement decisions are required');
    assert.equal(viewModel.artifactSelectionBoundarySummary, 'No governance decision session is complete · No candidate can proceed to artifact selection review');
    assert.match(viewModel.approvalBoundarySummary, /No model approved/);
    assert.match(viewModel.approvalBoundarySummary, /No license approved/);
    assert.match(viewModel.approvalBoundarySummary, /No artifact selected/);
    assert.match(viewModel.approvalBoundarySummary, /No artifact approved/);
    assert.match(viewModel.approvalBoundarySummary, /No benchmark passed/);
    assert.match(viewModel.approvalBoundarySummary, /No download available/);
    assert.match(viewModel.approvalBoundarySummary, /No model active/);
    assert.doesNotMatch(serialized, /governance approved|artifact ready|ready to download|runtime ready|model ready|recommended model|4B active/i);
  });

  it('adds the Phase 5.8 card while preserving Phase 5.1–5.7 and Phase 4 closeout cards', () => {
    const shell = read('../../src/components/ai/LocalAIReadinessShell.tsx');
    assert.match(shell, /Phase 5\.8 explicit human governance decision boundary/i);
    assert.match(shell, /Explicit Human Governance Decision Boundary/);
    assert.match(shell, /Human decisions are not recorded/);
    assert.match(shell, /Governance evidence is available for review/);
    assert.match(shell, /total required decisions/i);
    for (const phase of ['5.1','5.2','5.3','5.4','5.5','5.6','5.7']) {
      assert.match(shell, new RegExp(`Phase ${phase.replace('.', '\\.')}`, 'i'));
    }
    assert.match(shell, /Phase 4\.11 local model acquisition safety closeout/i);
    assert.doesNotMatch(shell, /handle(?:GovernanceProceed|GovernanceReject|GovernanceDecision|ArtifactSelect|ArtifactDownload)/);
  });

  it('keeps runtime integration free of network, persistence, AI service, and automatic decisions', () => {
    const files = [
      '../../src/platform/ai/localModelHumanGovernanceDecisionTypes.ts',
      '../../src/platform/ai/localModelHumanGovernanceDecisionPolicy.ts',
      '../../src/platform/ai/localModelHumanGovernanceDecisionViewModel.ts',
      '../../src/components/ai/LocalAIReadinessShell.tsx',
    ];
    const forbidden = /fetch\s*\(|XMLHttpRequest|WebSocket|indexedDB|CacheStorage|caches\.open|localStorage|sessionStorage|requestAdapter\s*\(|requestDevice\s*\(|AIService|\.execute\s*\(|Math\.random|Date\.now|setTimeout\s*\(|Worker\s*\(|SharedWorker\s*\(|serviceWorker\.register/;
    for (const file of files) assert.doesNotMatch(read(file), forbidden, file);

    const phase58Source = files.slice(0, 3).map(read).join('\n');
    assert.doesNotMatch(phase58Source, /https?:\/\//);
    assert.doesNotMatch(phase58Source, /modelApproved:\s*true|licenseApproved:\s*true|artifactSelected:\s*true|artifactApproved:\s*true|checksumPinned:\s*true|benchmarkVerified:\s*true|downloadable:\s*true|runtimeReady:\s*true|modelActive:\s*true/);
    assert.doesNotMatch(phase58Source, /reviewer(?:Name|Email|Id)|signature|decisionTimestamp|randomDecision/i);
  });

  it('registers both Phase 5.8 tests and documents the decision boundary', () => {
    const packageJson = JSON.parse(read('../../package.json')) as { scripts: Record<string, string> };
    for (const script of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[script], /test\/platform\/localModelHumanGovernanceDecisionPolicy\.test\.ts/);
      assert.match(packageJson.scripts[script], /test\/platform\/localModelHumanGovernanceDecisionViewModel\.test\.ts/);
    }

    const doc = read('../../docs/ai/phase-5-model-human-governance-decision-boundary.md');
    for (const heading of [
      'Status','Purpose','Relationship to Phase 5.2','Relationship to Phase 5.6',
      'Relationship to Phase 5.7','Evidence closure versus human decision',
      'Decision boundary versus model approval','Governance requirements','Decision item statuses',
      'Decision session statuses','Decision prerequisites','Decision scope','Scope invalidation',
      'Partial decisions','More-evidence requests','Rejections','Governance decisions complete',
      'Artifact-selection review boundary','Current production state','Tier-matrix compatibility',
      'Privacy and persistence','Failure handling','Safety invariants','Non-goals',
    ]) assert.match(doc, new RegExp(`^## ${heading}$`, 'm'));
    assert.match(doc, /human decision boundary only/i);
    assert.match(doc, /Current human decisions recorded = 0/i);
    assert.match(doc, /Twelve explicit requirement decisions are required/i);
    assert.match(doc, /Governance decisions complete is not artifact selection/i);
    assert.match(doc, /Phase 4 blocked-safe closeout remains intact/i);
  });

  it('keeps the existing AI safety verifier clean', () => {
    const result = scanAISafetyRegression({ root: new URL('../..', import.meta.url).pathname });
    assert.deepEqual(result.violations, []);
  });
});
