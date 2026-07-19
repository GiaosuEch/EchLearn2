import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  buildLocalModelGovernancePersistedRecordVerificationViewModel,
} from '../../src/platform/ai/localModelGovernancePersistedRecordVerificationViewModel.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8');
}

describe('Phase 6.7 persisted governance record verification view model', () => {
  it('reports an authored boundary without faking a production connection, query, visible row, or verification', () => {
    const viewModel = buildLocalModelGovernancePersistedRecordVerificationViewModel();
    assert.equal(viewModel.heading, 'Phase 6.7 Persisted Governance Record Verification Boundary');
    assert.deepEqual(viewModel.aggregate, {
      totalCandidates: 3,
      verificationBoundaryAuthored: true,
      productionReadClientConnected: false,
      automaticReadCalls: 0,
      explicitVerificationAttempts: 0,
      readInvocations: 0,
      visibleRecords: 0,
      verifiedRecords: 0,
      notFoundOrNotVisibleResults: 0,
      malformedRecords: 0,
      verificationMismatches: 0,
      recordsAppliedDownstream: 0,
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
    assert.equal(viewModel.verificationBoundaryOnly, true);
    assert.equal(viewModel.productionReadClientConnected, false);
    assert.equal(viewModel.verificationAttempts, 0);
    assert.equal(viewModel.verifiedRecords, 0);
    assert.equal(viewModel.activeModels, 0);
  });

  it('uses honest RLS-aware copy and never claims a database connection, found row, verified record, approval, model, or runtime readiness', () => {
    const text = JSON.stringify(buildLocalModelGovernancePersistedRecordVerificationViewModel());
    for (const phrase of [
      'Persisted-record verification boundary is authored',
      'Reads remain subject to Phase 6.5 forced RLS',
      'Only explicit verification requests may query',
      'Zero rows mean not found or not visible',
      'The Phase 6.4 expected envelope is required',
      'Persisted rows are verified without exposing raw records',
      'No production read attempt has occurred',
      'No persisted record is claimed verified by the app',
      'No verified record has been applied downstream',
      'No model is active',
    ]) assert.match(text, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    for (const forbidden of [
      'Database connected',
      'Verification online',
      'Record found',
      'Record verified',
      'Governance approved',
      'Model ready',
      'Runtime ready',
      'Production query tested',
    ]) assert.doesNotMatch(text, new RegExp(forbidden, 'i'));
  });

  it('adds a read-only Phase 6.7 card while preserving all earlier governance cards without repository or Supabase calls', () => {
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
    ]) assert.match(shell, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(shell, /buildLocalModelGovernancePersistedRecordVerificationViewModel/);
    assert.doesNotMatch(shell, /createLocalModelGovernancePersistedRecordVerificationRepository|verifyPersistedLocalModelGovernanceRecord/);
    assert.doesNotMatch(shell, /from\s*\(\s*['"]local_model_governance_records|supabase\.(?:from|rpc)/i);

    const start = shell.indexOf('Phase 6.7 Persisted governance record verification boundary');
    const end = shell.indexOf('<div className="grid gap-4 lg:grid-cols-2">', start);
    assert.ok(start >= 0 && end > start);
    const card = shell.slice(start, end);
    assert.doesNotMatch(card, /<button|onClick|>\s*(?:Verify|Refresh|Search|Retry)\s*</i);
    assert.doesNotMatch(card, /<input|spinner|setTimeout|useEffect/i);
    assert.match(card, /production attempts/);
    assert.match(card, /verified records claimed by app/);
    assert.match(card, /downstream applications/);
    assert.match(card, /active models/);
  });

  it('registers both Phase 6.7 tests without removing Phase 6.5 or Phase 6.6 registrations or changing dependencies', () => {
    const packageSource = read('package.json');
    const packageJson = JSON.parse(packageSource) as {
      scripts: Record<string, string>;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    for (const scriptName of ['test', 'test:platform']) {
      const script = packageJson.scripts[scriptName]!;
      assert.match(script, /test\/platform\/localModelGovernancePersistedRecordVerificationRepository\.test\.ts/);
      assert.match(script, /test\/platform\/localModelGovernancePersistedRecordVerificationViewModel\.test\.ts/);
      assert.match(script, /test\/platform\/localModelGovernancePersistenceSchema\.test\.ts/);
      assert.match(script, /test\/platform\/localModelGovernancePersistenceRls\.test\.ts/);
      assert.match(script, /test\/platform\/localModelGovernancePersistenceRepository\.test\.ts/);
      assert.match(script, /test\/platform\/localModelGovernancePersistenceRepositoryViewModel\.test\.ts/);
    }
    assert.equal(packageJson.dependencies['@supabase/supabase-js'], '^2.110.2');
    assert.doesNotMatch(packageSource, /phase-6\.7|supabase db push|supabase link/i);
  });

  it('leaves migrations, Phase 6.4/6.6, Supabase client, approval registry, and artifact manifest outside the Phase 6.7 implementation scope', () => {
    const phase67Sources = [
      read('src/platform/ai/localModelGovernancePersistedRecordVerificationTypes.ts'),
      read('src/platform/ai/localModelGovernancePersistedRecordVerificationRepository.ts'),
      read('src/platform/ai/localModelGovernancePersistedRecordVerificationViewModel.ts'),
    ].join('\n');
    assert.doesNotMatch(phase67Sources, /createClient|import\.meta\.env|process\.env|service[_-]?role/i);
    assert.doesNotMatch(phase67Sources, /migration|append_local_model_governance_record|localModelApprovalRegistry|localModelArtifactManifest/i);
    assert.match(read('supabase/migrations/20260714_create_local_model_governance_records.sql'), /force row level security/i);
    assert.match(read('src/lib/supabase.ts'), /export const supabase/);
    assert.match(read('src/platform/ai/localModelGovernanceRecordPersistencePolicy.ts'), /validateLocalModelGovernanceRecordPersistenceEnvelope/);
    assert.match(read('src/platform/ai/localModelGovernancePersistenceRepository.ts'), /append_local_model_governance_record/);
    assert.match(read('src/platform/ai/localModelApprovalRegistry.ts'), /export/);
    assert.match(read('src/platform/ai/localModelArtifactManifest.ts'), /export/);
  });
});
