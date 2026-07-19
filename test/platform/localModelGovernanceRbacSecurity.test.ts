import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { buildLocalModelGovernanceBenchmarkCloseout } from '../../src/platform/ai/localModelGovernanceBenchmarkCloseout.ts';
import { LOCAL_MODEL_GOVERNANCE_RBAC_MIGRATION_PATH } from '../../src/platform/ai/localModelGovernanceRbacFoundationTypes.ts';
const root = fileURLToPath(new URL('../../', import.meta.url));
function read(relativePath: string): string { return readFileSync(join(root, relativePath), 'utf8'); }
function sql(): string { return read(LOCAL_MODEL_GOVERNANCE_RBAC_MIGRATION_PATH).replace(/\r\n/g, '\n'); }
function helperBody(source: string): string {
  const match = source.match(/create\s+or\s+replace\s+function\s+private\.has_local_model_governance_permission\s*\(\s*\)[\s\S]*?as\s+\$\$([\s\S]*?)\$\$\s*;/i);
  assert.ok(match, 'authorization helper body must exist'); return match[1];
}

describe('Phase 6.5A governance RBAC security boundary', () => {
  it('enables and forces default-deny RLS on all four private tables without client policies', () => {
    const source = sql();
    for (const table of ['local_model_governance_roles','local_model_governance_permissions','local_model_governance_role_permissions','local_model_governance_user_roles']) {
      assert.match(source, new RegExp(`alter table private\\.${table} enable row level security`, 'i'));
      assert.match(source, new RegExp(`alter table private\\.${table} force row level security`, 'i'));
    }
    assert.doesNotMatch(source, /create\s+policy/i);
    assert.doesNotMatch(source, /using\s*\(\s*true\s*\)|with\s+check\s*\(\s*true\s*\)/i);
  });

  it('revokes all client table privileges and grants no catalog or assignment DML', () => {
    const source = sql();
    assert.match(source, /revoke all(?: privileges)? on schema private from public\s*;/i);
    assert.match(source, /revoke all(?: privileges)? on schema private from anon\s*;/i);
    assert.match(source, /revoke all(?: privileges)? on schema private from authenticated\s*;/i);
    for (const grantee of ['public','anon','authenticated']) assert.match(source, new RegExp(`revoke all(?: privileges)? on table[\\s\\S]*?from ${grantee}\\s*;`, 'i'));
    assert.doesNotMatch(source, /grant\s+(?:select|insert|update|delete|truncate|references|trigger|all)[\s\S]*?to\s+(?:anon|authenticated)/i);
  });

  it('defines one parameterless exact authorization helper using auth.uid and fully qualified private tables', () => {
    const source = sql(); const body = helperBody(source);
    assert.equal((source.match(/create\s+(?:or\s+replace\s+)?function/gi) ?? []).length, 1);
    assert.match(source, /function\s+private\.has_local_model_governance_permission\s*\(\s*\)\s*returns\s+boolean/i);
    assert.match(source, /language\s+sql/i); assert.match(source, /stable/i); assert.match(source, /security\s+definer/i); assert.match(source, /set\s+search_path\s*=\s*''/i);
    assert.match(body, /auth\.uid\(\)/i); assert.match(body, /private\.local_model_governance_user_roles/i); assert.match(body, /private\.local_model_governance_role_permissions/i);
    assert.match(body, /ur\.role_id\s*=\s*'model-governance-reviewer'/i); assert.match(body, /rp\.permission_id\s*=\s*'record-model-governance-decision'/i); assert.match(body, /auth\.uid\(\)\s+is\s+null/i);
    assert.doesNotMatch(body, /\bexecute\b|\bformat\s*\(|\binsert\b|\bupdate\b|\bdelete\b/i);
  });

  it('restricts helper execution to authenticated and exposes no assignment-management operation', () => {
    const source = sql();
    assert.match(source, /revoke execute on function private\.has_local_model_governance_permission\(\) from public\s*;/i);
    assert.match(source, /revoke execute on function private\.has_local_model_governance_permission\(\) from anon\s*;/i);
    assert.match(source, /grant usage on schema private to authenticated\s*;/i);
    assert.match(source, /grant execute on function private\.has_local_model_governance_permission\(\) to authenticated\s*;/i);
    assert.doesNotMatch(source, /function\s+[^\s(]*(?:assign|revoke|manage|list)_.*role/i);
  });

  it('does not use client-controlled authorization or unrelated role systems', () => {
    const source = sql();
    for (const pattern of [/user_metadata|raw_user_meta_data|app_metadata/i,/profile(?:s)?\s*\.|profile_role/i,/study_group|chat_room|membership/i,/subscription|entitlement|email|domain/i,/'admin'|'owner'|'moderator'|'staff'|'super-admin'/i,/service[_-]?role/i,/create\s+(?:or\s+replace\s+)?function\s+[^\s(]*(?:assign|revoke|manage)/i,/access_token_hook|custom_access_token/i]) assert.doesNotMatch(source, pattern);
  });

  it('keeps prior platform governance foundations blocked-safe and runtime source inert', () => {
    const closeout = buildLocalModelGovernanceBenchmarkCloseout();
    assert.equal(closeout.status, 'foundation-complete'); assert.equal(closeout.phase5FoundationComplete, true); assert.equal(closeout.productionBlockedSafe, true); assert.equal(closeout.aggregate.activeModels, 0);
    const productionSource = [read('src/platform/ai/localModelGovernanceRbacFoundationTypes.ts'),read('src/platform/ai/localModelGovernanceRbacFoundationViewModel.ts'),read('src/components/ai/LocalAIReadinessShell.tsx')].join('\n');
    for (const pattern of [/createClient/,/\.from\s*\(/,/\.rpc\s*\(/,/fetch\s*\(/,/localStorage|sessionStorage|indexedDB|AIService|\.execute\s*\(/,/Math\.random|Date\.now|setTimeout/,/migrationApplied\s*:\s*true|remoteDatabaseApplied\s*:\s*true|localDatabaseVerified\s*:\s*true/,/assignmentApiConfigured\s*:\s*true|roleAssignmentsSeeded\s*:\s*[1-9]|authorizedReviewers\s*:\s*[1-9]/,/governanceRecordsPersisted\s*:\s*[1-9]|modelActive\s*:\s*true/]) assert.doesNotMatch(productionSource, pattern);
  });

  it('does not introduce a second migration with the same suffix', () => {
    assert.equal(readdirSync(join(root, 'supabase/migrations')).filter((name) => name.endsWith('create_local_model_governance_rbac.sql')).length, 1);
  });
});
