import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { listLocalModelGovernanceEvidenceClosures } from '../../src/platform/ai/localModelGovernanceEvidenceClosureRegistry.ts';
import { buildLocalModelGovernanceEvidenceClosureViewModel } from '../../src/platform/ai/localModelGovernanceEvidenceClosureViewModel.ts';

function read(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Phase 5.7 governance evidence closure view model and readiness UI', () => {
  it('summarizes three candidates and twelve factual closure requirements', () => {
    const viewModel = buildLocalModelGovernanceEvidenceClosureViewModel();
    assert.equal(viewModel.aggregate.totalCandidates, 3);
    assert.equal(viewModel.aggregate.totalRequirements, 12);
    assert.equal(viewModel.aggregate.factualEvidenceCollectedRequirements, 6);
    assert.equal(viewModel.aggregate.sufficientForHumanDecisionRequirements, 6);
    assert.equal(viewModel.aggregate.unresolvedRequirements, 0);
    assert.equal(viewModel.aggregate.noSeparatePolicyLocatedRequirements, 0);
    assert.equal(viewModel.aggregate.conflictingRequirements, 0);
    assert.equal(viewModel.aggregate.humanDecisionRequiredRequirements, 12);
  });

  it('keeps all production approval and runtime counts at zero', () => {
    const aggregate = buildLocalModelGovernanceEvidenceClosureViewModel().aggregate;
    assert.equal(aggregate.humanDecisionsRecorded, 0);
    assert.equal(aggregate.approvedModels, 0);
    assert.equal(aggregate.approvedLicenses, 0);
    assert.equal(aggregate.selectedArtifacts, 0);
    assert.equal(aggregate.approvedArtifacts, 0);
    assert.equal(aggregate.downloadableArtifacts, 0);
    assert.equal(aggregate.runtimeReadyArtifacts, 0);
    assert.equal(aggregate.activeModels, 0);
  });

  it('uses conservative evidence-closure copy without approval or recommendation claims', () => {
    const viewModel = buildLocalModelGovernanceEvidenceClosureViewModel();
    const copy = [
      viewModel.heading,
      viewModel.closureSummary,
      viewModel.historySummary,
      viewModel.humanDecisionBoundarySummary,
      viewModel.tokenizerLicenseSummary,
      viewModel.acceptableUseSummary,
      viewModel.derivedHostingSummary,
      viewModel.quantizationSummary,
      viewModel.approvalBoundarySummary,
    ].join(' · ');
    assert.match(copy, /Unresolved Model Governance Evidence Closure Review/);
    assert.match(copy, /Evidence closure only/);
    assert.match(copy, /Historical evidence registries remain unchanged/);
    assert.match(copy, /Human governance decisions are not recorded/);
    assert.match(copy, /Tokenizer license scope/i);
    assert.match(copy, /Acceptable-use scope/i);
    assert.match(copy, /Derived-artifact hosting requires human decision/);
    assert.match(copy, /Quantization and conversion require human decision/);
    assert.match(copy, /No model approved/);
    assert.match(copy, /No artifact selected/);
    assert.match(copy, /No artifact approved/);
    assert.match(copy, /No benchmark passed/);
    assert.match(copy, /No download available/);
    assert.match(copy, /No model active/);
    assert.doesNotMatch(copy, /Governance approved|License approved|Hosting approved|Quantization approved|Ready to download|Runtime ready|Model ready|Recommended quantization|4B active/);
  });

  it('renders one candidate row per closure record with human review still required', () => {
    const records = listLocalModelGovernanceEvidenceClosures();
    const rows = buildLocalModelGovernanceEvidenceClosureViewModel(records).candidateRows;
    assert.equal(rows.length, 3);
    assert.ok(rows.every((row) => row.humanReviewRequired === true));
    assert.ok(rows.every((row) => row.humanDecisionRecorded === false));
    assert.ok(rows.every((row) => row.modelApproved === false && row.artifactSelected === false && row.modelActive === false));
  });

  it('adds the Phase 5.7 readiness card while preserving Phase 4 and Phase 5.1–5.6 cards', () => {
    const shell = read('../../src/components/ai/LocalAIReadinessShell.tsx');
    for (const marker of [
      'Phase 4.11 local model acquisition safety closeout',
      'Phase 5.1 exact model and license evidence review',
      'Phase 5.2 human model and license review decision gate',
      'Phase 5.3 official artifact variant and provenance evidence',
      'Phase 5.4 human artifact variant selection decision gate',
      'Phase 5.5 official artifact integrity and exact size evidence',
      'Phase 5.6 model and artifact governance review packet',
      'Phase 5.7 unresolved model governance evidence closure',
    ]) assert.match(shell, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    assert.match(shell, /Unresolved Model Governance Evidence Closure Review/);
    assert.match(shell, /Evidence closure only/);
    assert.match(shell, /Historical evidence registries remain unchanged/);
    assert.match(shell, /Human governance decisions are not recorded/);
    assert.match(shell, /total requirement closures/i);
  });

  it('does not add approval, selection, download, network, persistence or AI service handlers', () => {
    const shell = read('../../src/components/ai/LocalAIReadinessShell.tsx');
    assert.doesNotMatch(shell, /handle(?:Approve|Reject|ArtifactSelect|Download|Activate|Benchmark|Governance)/);
    assert.doesNotMatch(shell, /fetch\s*\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB|CacheStorage|AIService/);
  });

  it('registers both Phase 5.7 tests in test and test:platform without adding dependencies', () => {
    const packageJson = JSON.parse(read('../../package.json')) as {
      scripts: Record<string, string>;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    for (const scriptName of ['test', 'test:platform']) {
      const script = packageJson.scripts[scriptName]!;
      assert.match(script, /test\/platform\/localModelGovernanceEvidenceClosureRegistry\.test\.ts/);
      assert.match(script, /test\/platform\/localModelGovernanceEvidenceClosureViewModel\.test\.ts/);
    }
    assert.equal(Object.keys(packageJson.dependencies).length, 20);
    assert.equal(Object.keys(packageJson.devDependencies).length, 7);
  });

  it('documents the evidence closure and all required safety boundaries', () => {
    const docs = read('../../docs/ai/phase-5-model-governance-evidence-closure.md');
    for (const heading of [
      'Status', 'Purpose', 'Relationship to Phase 5.1', 'Relationship to Phase 5.2',
      'Relationship to Phase 5.3', 'Relationship to Phase 5.4', 'Relationship to Phase 5.5',
      'Relationship to Phase 5.6', 'Evidence closure versus governance decision',
      'Source quality rules', 'Tokenizer provenance', 'Tokenizer license scope',
      'Upstream tokenizer terms', 'Acceptable-use policy search', 'Acceptable-use applicability',
      'Derived-artifact hosting evidence', 'Quantization and conversion evidence',
      'Apache-2.0 modification and redistribution facts', 'Attribution, NOTICE and modification obligations',
      'Trademark limitations', 'Light candidate closure', 'Standard candidate closure', 'Pro candidate closure',
      'Factual requirements closed', 'Requirements still unresolved',
      'Requirements requiring human decision', 'Conflicting evidence', 'Current production state',
      'Tier-matrix compatibility', 'Privacy and persistence', 'Safety invariants', 'Non-goals',
    ]) assert.match(docs, new RegExp(`^## ${heading}$`, 'm'));
    assert.match(docs, /evidence closure is not legal advice/i);
    assert.match(docs, /No human decision is recorded/i);
    assert.match(docs, /No historical registry is modified/i);
    assert.match(docs, /No model active/i);
  });
});
