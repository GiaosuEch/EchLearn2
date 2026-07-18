import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { buildCurrentLocalModelAcquisitionCloseout } from '../../src/platform/ai/localModelAcquisitionCloseout.ts';
import { buildLocalModelAcquisitionCloseoutViewModel } from '../../src/platform/ai/localModelAcquisitionCloseoutViewModel.ts';

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

describe('Phase 4.11 closeout view model and readiness integration', () => {
  it('uses honest foundation-complete copy without model-ready claims', () => {
    const viewModel = buildLocalModelAcquisitionCloseoutViewModel(
      buildCurrentLocalModelAcquisitionCloseout(),
    );
    const serialized = JSON.stringify(viewModel);

    assert.equal(viewModel.heading, 'Phase 4 Local Model Acquisition Safety Closeout');
    assert.equal(viewModel.foundationSummary, 'Phase 4 acquisition foundation complete');
    assert.equal(viewModel.statusLabel, 'Safety closeout passed');
    assert.equal(viewModel.productionExecutionSummary, 'Production model execution remains unavailable');
    assert.equal(viewModel.executorSummary, 'Production executor unavailable');
    assert.equal(viewModel.approvalSummary, 'No model approved');
    assert.equal(viewModel.benchmarkSummary, 'No benchmark passed');
    assert.equal(viewModel.downloadSummary, 'No download started');
    assert.equal(viewModel.cacheSummary, 'No cache written');
    assert.equal(viewModel.runtimeSummary, 'No runtime initialized');
    assert.equal(viewModel.modelStateSummary, 'No model active');
    assert.equal(viewModel.coreAppSummary, 'Core app remains available');
    assert.equal(viewModel.fallbackSummary, 'Deterministic fallback remains available');
    assert.doesNotMatch(serialized, /Local AI ready|Runtime ready|Model ready|Ready to download|Download enabled|4B active|Recommended model|Best model|AI-generated recommendation/i);
  });

  it('maps production aggregate counts exactly', () => {
    const viewModel = buildLocalModelAcquisitionCloseoutViewModel(
      buildCurrentLocalModelAcquisitionCloseout(),
    );

    assert.equal(viewModel.aggregate.totalChecks, viewModel.checks.length);
    assert.equal(viewModel.aggregate.failedChecks, 0);
    assert.equal(viewModel.aggregate.approvedCandidates, 0);
    assert.equal(viewModel.aggregate.downloadableCandidates, 0);
    assert.equal(viewModel.aggregate.consentAvailableCandidates, 0);
    assert.equal(viewModel.aggregate.authorizedCandidates, 0);
    assert.equal(viewModel.aggregate.executionEligibleCandidates, 0);
    assert.equal(viewModel.aggregate.downloadsStarted, 0);
    assert.equal(viewModel.aggregate.activeModels, 0);
  });

  it('adds the Phase 4.11 card while preserving Phase 4.1-4.10 cards and no action handlers', () => {
    const source = read('../../src/components/ai/LocalAIReadinessShell.tsx');

    for (const phase of ['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9', '4.10', '4.11']) {
      assert.match(source, new RegExp(`Phase ${phase.replace('.', '\\.')}`, 'i'));
    }
    assert.match(source, /Phase 4 Local Model Acquisition Safety Closeout/);
    assert.match(source, /Phase 4 acquisition foundation complete/);
    assert.match(source, /Production model execution remains unavailable/);
    assert.match(source, /No download started/);
    assert.match(source, /No model active/);
    assert.match(source, /Deterministic fallback remains available/);
    assert.doesNotMatch(source, /handle.*(?:download|install|activate)|onClick=.*(?:download|install|activate)/i);
  });

  it('registers both Phase 4.11 tests in package scripts', () => {
    const packageJson = JSON.parse(read('../../package.json')) as {
      scripts: Record<string, string>;
    };
    for (const script of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[script], /test\/platform\/localModelAcquisitionCloseout\.test\.ts/);
      assert.match(packageJson.scripts[script], /test\/platform\/localModelAcquisitionCloseoutViewModel\.test\.ts/);
    }
  });

  it('documents all required closeout boundaries and non-goals', () => {
    const doc = read('../../docs/ai/phase-4-local-model-acquisition-closeout.md');
    const headings = [
      'Status', 'Purpose', 'Phase 4 foundations', 'Closeout definition',
      'Foundation complete versus model ready', 'Production blocked-safe state',
      'Approval and benchmark state', 'Tier-matrix compatibility',
      'Artifact and cache state', 'Capability probe state', 'Preflight state',
      'Consent state', 'Authorization state', 'Executor boundary state',
      'Feature parity and fallback', 'End-to-end invariants', 'Privacy and persistence',
      'Failure handling', 'Safety invariants', 'Phase 4 closeout decision', 'Non-goals',
    ];
    for (const heading of headings) assert.match(doc, new RegExp(`^## ${heading}$`, 'm'));
    assert.match(doc, /Phase 4 acquisition foundation is complete/i);
    assert.match(doc, /Production model execution remains unavailable/i);
    assert.match(doc, /Production executor remains unavailable/i);
    assert.match(doc, /no network/i);
    assert.match(doc, /no persistence/i);
    assert.match(doc, /feature parity/i);
    assert.match(doc, /model parity/i);
    assert.match(doc, /synthetic failures.*test-only/i);
  });

  it('keeps the existing AI safety verifier clean', () => {
    const result = scanAISafetyRegression({ root: new URL('../..', import.meta.url).pathname });
    assert.deepEqual(result.violations, []);
  });
});
