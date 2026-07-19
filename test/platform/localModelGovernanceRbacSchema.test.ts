import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import {
  LOCAL_MODEL_GOVERNANCE_DECISION_PERMISSION_ID,
  LOCAL_MODEL_GOVERNANCE_RBAC_EXPECTED_INITIAL_ASSIGNMENTS,
  LOCAL_MODEL_GOVERNANCE_RBAC_FOUNDATION_STATE,
  LOCAL_MODEL_GOVERNANCE_RBAC_MIGRATION_PATH,
  LOCAL_MODEL_GOVERNANCE_REVIEWER_ROLE_ID,
} from '../../src/platform/ai/localModelGovernanceRbacFoundationTypes.ts';
import { buildLocalModelGovernanceRbacFoundationViewModel } from '../../src/platform/ai/localModelGovernanceRbacFoundationViewModel.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
const migrationsDirectory = join(root, 'supabase/migrations');
const suffix = 'create_local_model_governance_rbac.sql';
const baselineLatestMigration = '20260712_initial_schema.sql';
function read(relativePath: string): string { return readFileSync(join(root, relativePath), 'utf8'); }
function findMigration(): string {
  const matches = readdirSync(migrationsDirectory).filter((name) => name.endsWith(suffix)).sort();
  assert.equal(matches.length, 1, `expected one ${suffix} migration, found ${matches.length}`);
  return matches[0];
}
function normalizedSql(): string { return read(join('supabase/migrations', findMigration())).replace(/\r\n/g, '\n'); }

describe('Phase 6.5A governance RBAC schema foundation', () => {
  it('authors exactly one lexicographically later non-empty migration', () => {
    const migration = findMigration();
    assert.ok(migration > baselineLatestMigration);
    assert.equal(LOCAL_MODEL_GOVERNANCE_RBAC_MIGRATION_PATH, `supabase/migrations/${migration}`);
    assert.ok(normalizedSql().trim().length > 0);
  });
  it('creates the private RBAC catalog, mapping, and assignment tables', () => {
    const sql = normalizedSql();
    assert.match(sql, /create schema if not exists private\s*;/i);
    for (const table of ['local_model_governance_roles','local_model_governance_permissions','local_model_governance_role_permissions','local_model_governance_user_roles']) {
      assert.match(sql, new RegExp(`create table private\\.${table}\\s*\\(`, 'i'));
    }
    assert.match(sql, /role_id\s+text\s+primary key/i);
    assert.match(sql, /permission_id\s+text\s+primary key/i);
    assert.match(sql, /primary key\s*\(\s*role_id\s*,\s*permission_id\s*\)/i);
    assert.match(sql, /primary key\s*\(\s*user_id\s*,\s*role_id\s*\)/i);
    assert.match(sql, /references auth\.users\s*\(\s*id\s*\)/i);
    assert.match(sql, /check\s*\(\s*assignment_revision\s*>\s*0\s*\)/i);
    assert.doesNotMatch(sql, /on\s+delete\s+cascade/i);
  });
  it('seeds only the exact catalog entries and exact mapping, never a user assignment', () => {
    const sql = normalizedSql();
    assert.equal(LOCAL_MODEL_GOVERNANCE_REVIEWER_ROLE_ID, 'model-governance-reviewer');
    assert.equal(LOCAL_MODEL_GOVERNANCE_DECISION_PERMISSION_ID, 'record-model-governance-decision');
    assert.match(sql, /insert into private\.local_model_governance_roles[\s\S]*?'model-governance-reviewer'[\s\S]*?\b1\b\s*\)/i);
    assert.match(sql, /insert into private\.local_model_governance_permissions[\s\S]*?'record-model-governance-decision'[\s\S]*?\b1\b\s*\)/i);
    assert.match(sql, /insert into private\.local_model_governance_role_permissions[\s\S]*?'model-governance-reviewer'[\s\S]*?'record-model-governance-decision'[\s\S]*?\b1\b\s*\)/i);
    assert.doesNotMatch(sql, /insert\s+into\s+private\.local_model_governance_user_roles/i);
    assert.equal(LOCAL_MODEL_GOVERNANCE_RBAC_EXPECTED_INITIAL_ASSIGNMENTS, 0);
    assert.equal(LOCAL_MODEL_GOVERNANCE_RBAC_FOUNDATION_STATE.roleAssignmentsSeeded, 0);
    assert.equal(LOCAL_MODEL_GOVERNANCE_RBAC_FOUNDATION_STATE.authorizedReviewers, 0);
  });

  it('contains no reviewer identity, credential, entitlement, learner content, or governance persistence objects', () => {
    const sql = normalizedSql();
    for (const pattern of [/@[a-z0-9.-]+\.[a-z]{2,}/i,/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,/access[_ ]?token|refresh[_ ]?token|rawjwt|session|password/i,/subscription|entitlement|learner[_ ]?content|transcript|writing[_ ]?submission|audio|prompt/i,/local_model_governance_records|append_local_model_governance_record/i,/custom_access_token|access_token_hook/i,/create\s+policy/i,/\bdrop\b|\bcascade\b|webhook|realtime|storage\s+bucket/i]) assert.doesNotMatch(sql, pattern);
  });

  it('keeps static application state honest and the view model bound to the authored migration', () => {
    const state = LOCAL_MODEL_GOVERNANCE_RBAC_FOUNDATION_STATE;
    assert.equal(state.status, 'migration-authored-not-applied');
    assert.equal(state.migrationAuthored, true);
    assert.equal(state.migrationApplied, false);
    assert.equal(state.localDatabaseVerified, false);
    assert.equal(state.remoteDatabaseApplied, false);
    assert.equal(state.privateSchemaAuthored, true);
    assert.equal(state.roleCatalogAuthored, true);
    assert.equal(state.permissionCatalogAuthored, true);
    assert.equal(state.rolePermissionMappingAuthored, true);
    assert.equal(state.userRoleAssignmentTableAuthored, true);
    assert.equal(state.exactAuthorizationHelperAuthored, true);
    assert.equal(state.rlsAuthored, true);
    assert.equal(state.grantsRestricted, true);
    assert.equal(state.assignmentApiConfigured, false);
    assert.equal(state.governanceRecordsPersisted, 0);
    assert.equal(state.activeModels, 0);
    const viewModel = buildLocalModelGovernanceRbacFoundationViewModel();
    assert.equal(viewModel.migrationPath, LOCAL_MODEL_GOVERNANCE_RBAC_MIGRATION_PATH);
    assert.equal(viewModel.status, 'migration-authored-not-applied');
    assert.equal(viewModel.aggregate.authorizedReviewers, 0);
    assert.equal(viewModel.aggregate.governanceRecordsPersisted, 0);
    assert.equal(viewModel.aggregate.activeModels, 0);
    assert.match(viewModel.migrationSummary, /authored but not applied by the app/i);
    assert.match(viewModel.databaseVerificationSummary, /has not run/i);
    assert.match(viewModel.phase65EntrySummary, /remains blocked until RBAC is verified/i);
  });

  it('registers tests and adds a read-only readiness card while retaining prior cards', () => {
    const packageJson = JSON.parse(read('package.json')) as { scripts: Record<string, string> };
    for (const script of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[script], /test\/platform\/localModelGovernanceRbacSchema\.test\.ts/);
      assert.match(packageJson.scripts[script], /test\/platform\/localModelGovernanceRbacSecurity\.test\.ts/);
    }
    const shell = read('src/components/ai/LocalAIReadinessShell.tsx');
    assert.match(shell, /Phase 6\.5A server-authoritative governance RBAC foundation/i);
    assert.match(shell, /\{governanceRbacFoundation\.heading\}/);
    assert.match(shell, /Migration authored, not applied by the app/);
    assert.match(shell, /No reviewer user assignment exists/);
    assert.match(shell, /Ordinary users cannot self-assign/);
    assert.match(shell, /Local data\{'base'\} verification has not run/);
    assert.match(shell, /Phase 6\.4 trusted governance record persistence contract boundary/i);
    assert.match(shell, /Phase 5\.12 model governance and benchmark planning safety closeout/i);
    assert.match(shell, /Phase 4 Local Model Acquisition Safety Closeout/);
    assert.doesNotMatch(shell, /onClick=.*(?:assign|revoke|save)|handle.*(?:assign|revoke|save)|actorSubjectId|reviewerEmail/i);
  });
});
