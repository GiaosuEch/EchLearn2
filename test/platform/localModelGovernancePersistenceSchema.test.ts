import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import {
  LOCAL_MODEL_GOVERNANCE_PERSISTENCE_SCHEMA_MIGRATION_PATH,
  LOCAL_MODEL_GOVERNANCE_PERSISTENCE_SCHEMA_STATE,
} from '../../src/platform/ai/localModelGovernancePersistenceSchemaTypes.ts';
import { buildLocalModelGovernancePersistenceSchemaViewModel } from '../../src/platform/ai/localModelGovernancePersistenceSchemaViewModel.ts';

const root = fileURLToPath(new URL('../..', import.meta.url));
const migrationsDirectory = join(root, 'supabase/migrations');
const suffix = 'create_local_model_governance_records.sql';
const rbacMigration = '20260713_create_local_model_governance_rbac.sql';
function read(relativePath: string): string { return readFileSync(join(root, relativePath), 'utf8'); }
function migrationName(): string {
  const matches = readdirSync(migrationsDirectory).filter((name) => name.endsWith(suffix)).sort();
  assert.equal(matches.length, 1, `expected one ${suffix} migration, found ${matches.length}`);
  return matches[0]!;
}
function sql(): string { return read(join('supabase/migrations', migrationName())).replace(/\r\n/g, '\n'); }

function tableBody(source: string): string {
  const match = source.match(/create\s+table\s+public\.local_model_governance_records\s*\(([\s\S]*?)\n\);/i);
  assert.ok(match, 'governance records table must exist');
  return match[1]!;
}

describe('Phase 6.5 governance persistence schema', () => {
  it('authors exactly one migration after the verified RBAC migration', () => {
    const name = migrationName();
    assert.ok(name > rbacMigration);
    assert.equal(LOCAL_MODEL_GOVERNANCE_PERSISTENCE_SCHEMA_MIGRATION_PATH, `supabase/migrations/${name}`);
    assert.ok(sql().trim().length > 0);
  });

  it('creates the exact append-only governance audit table and allowlisted columns', () => {
    const source = sql();
    const body = tableBody(source);
    const expectedColumns = [
      'id', 'persistence_key', 'idempotency_key', 'schema_revision', 'policy_revision',
      'canonical_record_key', 'canonical_record_revision', 'canonical_outcome',
      'candidate_id', 'candidate_tier', 'model_class', 'exact_model_name',
      'official_repository_id', 'observed_revision', 'actor_user_id', 'reviewed_at',
      'persistence_envelope',
    ];
    for (const column of expectedColumns) assert.match(body, new RegExp(`\\b${column}\\b`, 'i'));
    assert.match(body, /id\s+bigint\s+generated\s+always\s+as\s+identity\s+primary\s+key/i);
    assert.match(body, /persistence_key\s+text\s+not\s+null/i);
    assert.match(body, /idempotency_key\s+text\s+not\s+null/i);
    assert.match(body, /actor_user_id\s+uuid\s+not\s+null/i);
    assert.match(body, /reviewed_at\s+timestamptz\s+not\s+null/i);
    assert.match(body, /persistence_envelope\s+jsonb\s+not\s+null/i);
    assert.doesNotMatch(body, /actor_email|display_name|reviewer_name|access_token|refresh_token|jwt|session|signature|learner_content|transcript|writing_submission|audio|prompt|raw_evidence|model_url|download_url/i);
    assert.doesNotMatch(source, /created_at\s+[^,;]*default\s+now\s*\(/i);
  });

  it('enforces revisions, outcomes, tiers, exact candidates, uniqueness, and JSON object shape', () => {
    const source = sql();
    for (const pattern of [
      /schema_revision\s*>\s*0/i,
      /policy_revision\s*>\s*0/i,
      /canonical_record_revision\s*>\s*0/i,
      /canonical_outcome\s+in\s*\(\s*'finalized-proceed'\s*,\s*'finalized-rejected'\s*,\s*'finalized-more-evidence'\s*\)/i,
      /candidate_tier\s+in\s*\(\s*'light'\s*,\s*'standard'\s*,\s*'pro'\s*\)/i,
      /pg_catalog\.jsonb_typeof\s*\(\s*persistence_envelope\s*\)\s*=\s*'object'/i,
      /unique\s*\(\s*persistence_key\s*\)/i,
      /unique\s*\(\s*idempotency_key\s*\)/i,
      /unique\s*\(\s*canonical_record_key\s*,\s*canonical_record_revision\s*\)/i,
    ]) assert.match(source, pattern);

    const matrix = [
      ['qwen3-0-6b-candidate', 'light', '0.6B', 'Qwen3-0.6B', 'Qwen/Qwen3-0.6B', 'c1899de289a04d12100db370d81485cdf75e47ca'],
      ['qwen3-1-7b-candidate', 'standard', '1.7B', 'Qwen3-1.7B', 'Qwen/Qwen3-1.7B', '70d244cc86ccca08cf5af4e1e306ecf908b1ad5e'],
      ['qwen3-4b-candidate', 'pro', '4B', 'Qwen3-4B', 'Qwen/Qwen3-4B', '1cfa9a7208912126459214e8b04321603b3df60c'],
    ];
    for (const values of matrix) for (const value of values) assert.ok(source.includes(`'${value}'`), `missing candidate matrix value ${value}`);
    assert.doesNotMatch(source, /ultra-low/i);
  });

  it('creates only minimal non-duplicate indexes and never cascades or seeds runtime records', () => {
    const source = sql();
    for (const column of ['candidate_id', 'actor_user_id', 'reviewed_at', 'canonical_outcome']) {
      assert.match(source, new RegExp(`create index [^;]+ on public\\.local_model_governance_records \\(\\s*${column}\\s*\\)`, 'i'));
    }
    assert.doesNotMatch(source, /create\s+(?:unique\s+)?index[^;]+\(\s*(?:persistence_key|idempotency_key)\s*\)/i);
    assert.doesNotMatch(source, /on\s+delete\s+cascade|\bdrop\b|\bcascade\b|webhook|realtime|storage\s+bucket/i);
    assert.doesNotMatch(source, /insert\s+into\s+auth\.users/i);
    assert.equal((source.match(/insert\s+into\s+public\.local_model_governance_records/gi) ?? []).length, 1);
    assert.match(source, /function public\.append_local_model_governance_record[\s\S]*?insert\s+into\s+public\.local_model_governance_records/i);
  });

  it('keeps static application status conservative and view-model paths exact', () => {
    const state = LOCAL_MODEL_GOVERNANCE_PERSISTENCE_SCHEMA_STATE;
    assert.equal(state.status, 'migration-authored-not-applied');
    assert.equal(state.prerequisiteRbacRuntimeVerifiedLocally, true);
    assert.equal(state.migrationAuthored, true);
    assert.equal(state.migrationAppliedByApplication, false);
    assert.equal(state.localDatabaseVerified, false);
    assert.equal(state.remoteDatabaseApplied, false);
    assert.equal(state.rlsAuthored, true);
    assert.equal(state.appendRpcAuthored, true);
    assert.equal(state.immutableTriggerAuthored, true);
    assert.equal(state.repositoryConfigured, false);
    assert.equal(state.applicationPersistenceAttempts, 0);
    assert.equal(state.applicationRepositoryWrites, 0);
    assert.equal(state.applicationPersistedRecords, 0);
    assert.equal(state.recordsAppliedDownstream, 0);
    assert.equal(state.modelActive, false);

    const viewModel = buildLocalModelGovernancePersistenceSchemaViewModel();
    assert.equal(viewModel.migrationPath, LOCAL_MODEL_GOVERNANCE_PERSISTENCE_SCHEMA_MIGRATION_PATH);
    assert.equal(viewModel.status, 'migration-authored-not-applied');
    assert.match(viewModel.phaseSummary, /RBAC prerequisite was verified locally/i);
    assert.match(viewModel.migrationSummary, /authored but not applied by the app/i);
    assert.match(viewModel.remoteDeploymentSummary, /has not occurred/i);
    assert.equal(viewModel.aggregate.totalCandidates, 3);
    assert.equal(viewModel.aggregate.remoteMigrationsApplied, 0);
    assert.equal(viewModel.aggregate.persistedRecords, 0);
    assert.equal(viewModel.aggregate.activeModels, 0);
  });

  it('registers the tests and adds the read-only Phase 6.5 card without removing earlier cards', () => {
    const packageJson = JSON.parse(read('package.json')) as { scripts: Record<string, string> };
    for (const script of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[script]!, /test\/platform\/localModelGovernancePersistenceSchema\.test\.ts/);
      assert.match(packageJson.scripts[script]!, /test\/platform\/localModelGovernancePersistenceRls\.test\.ts/);
    }
    const shell = read('src/components/ai/LocalAIReadinessShell.tsx');
    assert.match(shell, /Phase 6\.5 Supa\{'base'\} governance persistence schema and RLS/i);
    assert.match(shell, /\{governancePersistenceSchema\.heading\}/);
    assert.match(shell, /RBAC prerequisite locally verified/);
    assert.match(shell, /governance migration authored, not applied by app/i);
    assert.match(shell, /Phase 6\.5A server-authoritative governance RBAC foundation/i);
    assert.match(shell, /Phase 6\.4 trusted governance record persistence contract boundary/i);
    assert.match(shell, /Phase 5\.12 model governance and benchmark planning safety closeout/i);
    assert.match(shell, /Phase 4 Local Model Acquisition Safety Closeout/);
    assert.doesNotMatch(shell, /onClick=.*(?:save|persist|retry|delete)|handle.*(?:save|persist|retry|delete)|actorSubjectId|persistenceKey/i);
  });
});
