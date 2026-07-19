import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  buildLocalModelGovernancePhase6CloseoutViewModel,
} from '../../src/platform/ai/localModelGovernancePhase6CloseoutViewModel.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8');
}

describe('Phase 6.9 governance persistence and application safety closeout view model', () => {
  it('reports all nine boundaries closed while every production and downstream counter remains zero', () => {
    const viewModel = buildLocalModelGovernancePhase6CloseoutViewModel();
    assert.equal(viewModel.heading, 'Phase 6.9 Governance Persistence and Application Safety Closeout');
    assert.deepEqual(viewModel.aggregate, {
      totalPhase6Boundaries: 9,
      completedPhase6Boundaries: 9,
      phase6Closed: true,
      phase7DesignEntryEligible: true,
      automaticWrites: 0,
      automaticReads: 0,
      automaticApplications: 0,
      productionPersistenceAttempts: 0,
      productionVerificationAttempts: 0,
      productionApplicationAttempts: 0,
      persistedGovernanceRecordsClaimed: 0,
      verifiedGovernanceRecordsClaimed: 0,
      persistedApplicationDecisions: 0,
      recordsAppliedDownstream: 0,
      artifactSelectionReviewsEligible: 0,
      approvedModels: 0,
      approvedLicenses: 0,
      selectedArtifacts: 0,
      approvedArtifacts: 0,
      checksumsVerified: 0,
      benchmarksPassed: 0,
      downloadableArtifacts: 0,
      runtimeReadyArtifacts: 0,
      activeModels: 0,
    });
    assert.equal(viewModel.phase6CloseoutOnly, true);
    assert.equal(viewModel.productionGovernanceAttempts, 0);
    assert.equal(viewModel.persistedApplicationDecisions, 0);
    assert.equal(viewModel.activeModels, 0);
  });

  it('uses honest closeout copy without claiming a live database, production flow, applied record, selected artifact, or ready model', () => {
    const text = JSON.stringify(buildLocalModelGovernancePhase6CloseoutViewModel());
    for (const phrase of [
      'Phase 6 governance source contracts are closed',
      'Nine Phase 6 boundaries are authored and regression-checked',
      'Server-authoritative RBAC, forced RLS and append-only persistence remain required',
      'Persistence, verification and application remain explicit',
      'No production governance flow has executed',
      'No application decision is persisted',
      'No governance record is applied downstream',
      'No artifact is selected or approved',
      'Phase 7 may begin as a separate artifact-selection and execution program',
      'No model is active',
    ]) assert.match(text, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    for (const forbidden of [
      'Governance live',
      'Database online',
      'Production flow verified',
      'Record applied',
      'Artifact ready',
      'Model approved',
      'Download ready',
      'Runtime ready',
      'Model active',
    ]) assert.doesNotMatch(text, new RegExp(forbidden, 'i'));
  });

  it('adds a read-only Phase 6.9 card while preserving Phase 6.1-6.8 cards and avoiding action/repository/Supabase calls', () => {
    const shell = read('src/components/ai/LocalAIReadinessShell.tsx');
    for (const marker of [
      'Phase 6.1 trusted human governance decision record contract',
      'Phase 6.2 external trusted actor context adapter boundary',
      'Phase 6.3 trusted admin governance review workspace boundary',
      'Phase 6.4 trusted governance record persistence contract boundary',
      'Phase 6.5A server-authoritative governance RBAC foundation',
      "Phase 6.5 Supa{'base'} governance persistence schema and RLS",
      'Phase 6.6 Governance persistence repository boundary',
      'Phase 6.7 Persisted governance record verification boundary',
      'Phase 6.8 Explicit governance record application boundary',
      'Phase 6.9 Governance persistence and application safety closeout',
    ]) assert.match(shell, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(shell, /buildLocalModelGovernancePhase6CloseoutViewModel/);
    assert.doesNotMatch(shell, /evaluateLocalModelGovernancePhase6Closeout|buildLocalModelGovernancePhase6CloseoutInput/);

    const start = shell.indexOf('Phase 6.9 Governance persistence and application safety closeout');
    const end = shell.indexOf('<div className="grid gap-4 lg:grid-cols-2">', start);
    assert.ok(start >= 0 && end > start);
    const card = shell.slice(start, end);
    assert.doesNotMatch(card, /<button|<input|onClick|useEffect|supabase|\.rpc\s*\(|\.from\s*\(/i);
    assert.match(card, /9\/9 boundaries authored/);
    assert.match(card, /production governance attempts/);
    assert.match(card, /application decisions persisted/);
    assert.match(card, /downstream applications/);
    assert.match(card, /selected artifacts/);
    assert.match(card, /active models/);
    assert.match(card, /Phase 7 design entry eligible/);
  });

  it('registers both Phase 6.9 tests without changing dependencies or removing earlier registrations', () => {
    const packageSource = read('package.json');
    const packageJson = JSON.parse(packageSource) as {
      scripts: Record<string, string>;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    for (const scriptName of ['test', 'test:platform']) {
      const script = packageJson.scripts[scriptName]!;
      assert.match(script, /test\/platform\/localModelGovernancePhase6Closeout\.test\.ts/);
      assert.match(script, /test\/platform\/localModelGovernancePhase6CloseoutViewModel\.test\.ts/);
      assert.match(script, /test\/platform\/localModelGovernanceRecordApplicationPolicy\.test\.ts/);
      assert.match(script, /test\/platform\/localModelGovernanceRecordApplicationViewModel\.test\.ts/);
      assert.match(script, /test\/platform\/localModelGovernancePersistedRecordVerificationRepository\.test\.ts/);
      assert.match(script, /test\/platform\/localModelGovernancePersistenceRepository\.test\.ts/);
    }
    assert.equal(packageJson.dependencies['@supabase/supabase-js'], '^2.110.2');
    assert.doesNotMatch(packageSource, /supabase db push|supabase link|phase-6\.9/i);
  });

  it('leaves migrations, Phase 6.1-6.8, Supabase client, approval registry, and artifact manifest outside Phase 6.9 scope', () => {
    assert.match(read('supabase/migrations/20260713_create_local_model_governance_rbac.sql'), /model-governance-reviewer/);
    assert.match(read('supabase/migrations/20260714_create_local_model_governance_records.sql'), /force row level security/i);
    assert.match(read('src/lib/supabase.ts'), /export const supabase/);
    assert.match(read('src/platform/ai/localModelGovernanceRecordApplicationPolicy.ts'), /eligible-for-downstream-review/);
    assert.match(read('src/platform/ai/localModelGovernancePersistedRecordVerificationRepository.ts'), /not-found-or-not-visible/);
    assert.match(read('src/platform/ai/localModelApprovalRegistry.ts'), /export/);
    assert.match(read('src/platform/ai/localModelArtifactManifest.ts'), /export/);
  });
});
