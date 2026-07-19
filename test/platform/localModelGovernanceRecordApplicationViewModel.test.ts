import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  buildLocalModelGovernanceRecordApplicationViewModel,
} from '../../src/platform/ai/localModelGovernanceRecordApplicationViewModel.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8');
}

describe('Phase 6.8 governance record application view model and readiness integration', () => {
  it('reports the exact conservative production aggregate', () => {
    const viewModel = buildLocalModelGovernanceRecordApplicationViewModel();
    assert.equal(viewModel.heading, 'Phase 6.8 Explicit Persisted Governance Record Application Boundary');
    assert.deepEqual(viewModel.aggregate, {
      totalCandidates: 3,
      applicationBoundaryAuthored: true,
      automaticApplications: 0,
      explicitProductionApplicationAttempts: 0,
      acceptedVerifications: 0,
      eligibleApplicationDecisions: 0,
      replayedApplicationDecisions: 0,
      staleVerifications: 0,
      rejectedOutcomes: 0,
      moreEvidenceOutcomes: 0,
      persistedApplicationRecords: 0,
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
    assert.equal(viewModel.applicationBoundaryOnly, true);
    assert.equal(viewModel.applicationAttempts, 0);
    assert.equal(viewModel.persistedApplicationRecords, 0);
    assert.equal(viewModel.activeModels, 0);
  });

  it('uses honest copy without claiming application, selection, approval, model, or runtime readiness', () => {
    const text = JSON.stringify(buildLocalModelGovernanceRecordApplicationViewModel());
    for (const phrase of [
      'Explicit application boundary is authored',
      'Only a fully verified Phase 6.7 result may enter evaluation',
      'Application requires a literal explicit human action',
      'Verification and candidate scope are revalidated before eligibility',
      'Rejected and more-evidence outcomes remain blocked',
      'Eligible means downstream review may begin; no artifact is selected',
      'No application decision has been persisted',
      'No production application attempt has occurred',
      'No governance record has been applied downstream',
      'No model is active',
    ]) assert.match(text, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    for (const forbidden of [
      'Application online',
      'Governance applied',
      'Artifact eligible for download',
      'Artifact selected',
      'Model approved',
      'Model ready',
      'Runtime ready',
      'Production decision verified',
    ]) assert.doesNotMatch(text, new RegExp(forbidden, 'i'));
  });

  it('adds a read-only Phase 6.8 card while preserving all prior governance cards', () => {
    const shell = read('src/components/ai/LocalAIReadinessShell.tsx');
    for (const marker of [
      'Phase 5.12 model governance and benchmark planning safety closeout',
      'Phase 6.1 trusted human governance decision record contract',
      'Phase 6.2 external trusted actor context adapter boundary',
      'Phase 6.3 trusted admin governance review workspace boundary',
      'Phase 6.4 trusted governance record persistence contract boundary',
      'Phase 6.5A server-authoritative governance RBAC foundation',
      "Phase 6.5 Supa{'base'} governance persistence schema and RLS",
      'Phase 6.6 Governance persistence repository boundary',
      'Phase 6.7 Persisted governance record verification boundary',
      'Phase 6.8 Explicit governance record application boundary',
    ]) assert.match(shell, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(shell, /buildLocalModelGovernanceRecordApplicationViewModel/);
    assert.doesNotMatch(shell, /evaluateLocalModelGovernanceRecordApplication|buildLocalModelGovernanceRecordApplicationScope/);

    const start = shell.indexOf('Phase 6.8 Explicit governance record application boundary');
    const end = shell.indexOf('<div className="grid gap-4 lg:grid-cols-2">', start);
    assert.ok(start >= 0 && end > start);
    const card = shell.slice(start, end);
    assert.doesNotMatch(card, /<button|onClick|<input|<form|checkbox|spinner|useEffect|fetch|setTimeout/i);
    assert.match(card, /automatic applications/);
    assert.match(card, /production attempts/);
    assert.match(card, /persisted application decisions/);
    assert.match(card, /downstream applications/);
    assert.match(card, /selected artifacts/);
    assert.match(card, /active models/);
  });

  it('registers both Phase 6.8 tests without removing Phase 6.5 through Phase 6.7 registrations or changing dependencies', () => {
    const packageSource = read('package.json');
    const packageJson = JSON.parse(packageSource) as {
      scripts: Record<string, string>;
      dependencies: Record<string, string>;
    };
    for (const scriptName of ['test', 'test:platform']) {
      const script = packageJson.scripts[scriptName]!;
      assert.match(script, /test\/platform\/localModelGovernanceRecordApplicationPolicy\.test\.ts/);
      assert.match(script, /test\/platform\/localModelGovernanceRecordApplicationViewModel\.test\.ts/);
      assert.match(script, /test\/platform\/localModelGovernancePersistenceSchema\.test\.ts/);
      assert.match(script, /test\/platform\/localModelGovernancePersistenceRls\.test\.ts/);
      assert.match(script, /test\/platform\/localModelGovernancePersistenceRepository\.test\.ts/);
      assert.match(script, /test\/platform\/localModelGovernancePersistenceRepositoryViewModel\.test\.ts/);
      assert.match(script, /test\/platform\/localModelGovernancePersistedRecordVerificationRepository\.test\.ts/);
      assert.match(script, /test\/platform\/localModelGovernancePersistedRecordVerificationViewModel\.test\.ts/);
    }
    assert.equal(packageJson.dependencies['@supabase/supabase-js'], '^2.110.2');
    assert.doesNotMatch(packageSource, /supabase db push|supabase link|phase-6\.8/i);
  });

  it('keeps migrations, Phase 6.1-6.7, Supabase client, approval registry, and artifact manifest outside Phase 6.8 scope', () => {
    assert.match(read('supabase/migrations/20260714_create_local_model_governance_records.sql'), /force row level security/i);
    assert.match(read('src/lib/supabase.ts'), /export const supabase/);
    assert.match(read('src/platform/ai/localModelGovernanceRecordPersistencePolicy.ts'), /validateLocalModelGovernanceRecordPersistenceEnvelope/);
    assert.match(read('src/platform/ai/localModelGovernancePersistedRecordVerificationRepository.ts'), /local_model_governance_records/);
    assert.match(read('src/platform/ai/localModelApprovalRegistry.ts'), /export/);
    assert.match(read('src/platform/ai/localModelArtifactManifest.ts'), /export/);
  });
});
