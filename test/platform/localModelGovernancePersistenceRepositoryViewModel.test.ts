import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildLocalModelGovernancePersistenceRepositoryViewModel } from '../../src/platform/ai/localModelGovernancePersistenceRepositoryViewModel.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8');
}

describe('Phase 6.6 governance persistence repository view model', () => {
  it('reports the authored boundary without faking a production connection or persistence activity', () => {
    const viewModel = buildLocalModelGovernancePersistenceRepositoryViewModel();
    assert.equal(viewModel.heading, 'Phase 6.6 Typed Governance Persistence Repository and RPC Client Boundary');
    assert.equal(viewModel.repositoryBoundaryOnly, true);
    assert.equal(viewModel.aggregate.totalCandidates, 3);
    assert.equal(viewModel.aggregate.repositoryBoundaryAuthored, true);
    assert.equal(viewModel.aggregate.productionRpcClientConnected, false);
    assert.equal(viewModel.aggregate.automaticRpcCalls, 0);
    assert.equal(viewModel.aggregate.explicitPersistenceAttempts, 0);
    assert.equal(viewModel.aggregate.rpcInvocations, 0);
    assert.equal(viewModel.aggregate.insertedRecordsAcknowledged, 0);
    assert.equal(viewModel.aggregate.identicalExistingRecordsAcknowledged, 0);
    assert.equal(viewModel.aggregate.persistenceFailures, 0);
    assert.equal(viewModel.aggregate.recordsAppliedDownstream, 0);
    assert.equal(viewModel.aggregate.approvedModels, 0);
    assert.equal(viewModel.aggregate.approvedLicenses, 0);
    assert.equal(viewModel.aggregate.selectedArtifacts, 0);
    assert.equal(viewModel.aggregate.approvedArtifacts, 0);
    assert.equal(viewModel.aggregate.checksumsVerified, 0);
    assert.equal(viewModel.aggregate.benchmarksPassed, 0);
    assert.equal(viewModel.aggregate.downloadableArtifacts, 0);
    assert.equal(viewModel.aggregate.runtimeReadyArtifacts, 0);
    assert.equal(viewModel.aggregate.activeModels, 0);
  });

  it('uses honest copy and never claims persistence, database, governance, model, or runtime readiness', () => {
    const viewModel = buildLocalModelGovernancePersistenceRepositoryViewModel();
    const copy = [
      viewModel.phaseSummary,
      viewModel.rpcSummary,
      viewModel.actionGateSummary,
      viewModel.validationSummary,
      viewModel.authorizationSummary,
      viewModel.productionStateSummary,
    ].join(' ');
    assert.match(copy, /Typed repository boundary is authored/i);
    assert.match(copy, /append RPC remains server-authoritative/i);
    assert.match(copy, /exact Phase 6\.4 envelope/i);
    assert.match(copy, /Actor authorization remains derived by the database/i);
    assert.match(copy, /No actor, role or permission is sent as a separate RPC argument/i);
    assert.match(copy, /RPC is not called automatically/i);
    assert.match(copy, /No production persistence attempt has occurred/i);
    assert.match(copy, /No governance record is claimed persisted by the app/i);
    assert.match(copy, /No persisted record has been applied downstream/i);
    assert.match(copy, /No model is active/i);
    assert.doesNotMatch(copy, /Persistence online|Database connected|Record saved|Governance approved|Model ready|Runtime ready|Production RPC verified/i);
  });

  it('adds a read-only Phase 6.6 card and preserves all previous phase cards without actions or RPC calls', () => {
    const shell = read('src/components/ai/LocalAIReadinessShell.tsx');
    assert.match(shell, /Phase 6\.6 Governance persistence repository boundary/i);
    assert.match(shell, /repository boundary authored/i);
    assert.match(shell, /explicit action required/i);
    assert.match(shell, /no automatic RPC invocation/i);
    assert.match(shell, /persisted records claimed by app/i);
    assert.match(shell, /Phase 6\.5 Supa\{'base'\} governance persistence schema and RLS/i);
    assert.match(shell, /Phase 6\.5A server-authoritative governance RBAC foundation/i);
    assert.match(shell, /Phase 6\.4 trusted governance record persistence contract boundary/i);
    assert.match(shell, /Phase 6\.1 trusted human governance decision record contract/i);
    assert.match(shell, /Phase 5\.12 model governance and benchmark planning safety closeout/i);
    assert.match(shell, /Phase 4 Local Model Acquisition Safety Closeout/i);
    assert.doesNotMatch(shell, /createLocalModelGovernancePersistenceRepository|appendLocalModelGovernanceRecord|append_local_model_governance_record|\.rpc\s*\(/i);
    assert.doesNotMatch(shell, /onClick=.*(?:save|persist|retry|delete|connect)|handle.*(?:save|persist|retry|delete|connect)/i);
  });

  it('registers both Phase 6.6 tests without removing earlier registrations or changing dependencies', () => {
    const packageJson = JSON.parse(read('package.json')) as {
      scripts: Record<string, string>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    for (const script of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[script]!, /test\/platform\/localModelGovernancePersistenceRepository\.test\.ts/);
      assert.match(packageJson.scripts[script]!, /test\/platform\/localModelGovernancePersistenceRepositoryViewModel\.test\.ts/);
      assert.match(packageJson.scripts[script]!, /test\/platform\/localModelGovernancePersistenceSchema\.test\.ts/);
      assert.match(packageJson.scripts[script]!, /test\/platform\/localModelGovernancePersistenceRls\.test\.ts/);
      assert.match(packageJson.scripts[script]!, /test\/platform\/localModelGovernanceRecordPersistencePolicy\.test\.ts/);
    }
    const allDependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    assert.equal(allDependencies['@supabase/supabase-js'], '^2.110.2');
  });

  it('leaves migrations, Phase 6.4, approval registry, and artifact manifest unchanged by scope', () => {
    const repositorySource = read('src/platform/ai/localModelGovernancePersistenceRepository.ts');
    assert.doesNotMatch(repositorySource, /supabase\/migrations|localModelApprovalRegistry|localModelArtifactManifest/i);
    assert.ok(read('supabase/migrations/20260713_create_local_model_governance_rbac.sql').length > 0);
    assert.ok(read('supabase/migrations/20260714_create_local_model_governance_records.sql').length > 0);
    assert.ok(read('src/platform/ai/localModelGovernanceRecordPersistencePolicy.ts').length > 0);
    assert.ok(read('src/platform/ai/localModelApprovalRegistry.ts').length > 0);
    assert.ok(read('src/platform/ai/localModelArtifactManifest.ts').length > 0);
  });
});
