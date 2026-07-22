import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const root = fileURLToPath(new URL('../..', import.meta.url));
const path = join(root, 'supabase/migrations/20260716_create_local_model_governance_artifact_selection_records.sql');
const sql = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

describe('Phase 7.5 trusted artifact-selection persistence schema', () => {
  it('uses a distinct least-privilege permission without seeding any reviewer identity', () => {
    assert.match(sql, /'record-local-model-artifact-selection'/);
    assert.match(sql, /private\.has_local_model_artifact_selection_permission\(\)/);
    assert.doesNotMatch(sql, /insert\s+into\s+private\.local_model_governance_user_roles/i);
  });
  it('authors an immutable append-only table with restricted source foreign keys and forced RLS', () => {
    assert.match(sql, /create table public\.local_model_governance_artifact_selection_records/i);
    assert.match(sql, /source_application_decision_key[^,]+references public\.local_model_governance_application_records\(application_decision_key\) on update restrict on delete restrict/i);
    assert.match(sql, /source_governance_persistence_key[^,]+references public\.local_model_governance_records\(persistence_key\) on update restrict on delete restrict/i);
    assert.match(sql, /force row level security/i);
    assert.match(sql, /before update or delete/i);
    assert.match(sql, /local-model-artifact-selection-records-immutable/);
  });
  it('derives actor identity and authorization inside the SECURITY DEFINER RPC', () => {
    assert.match(sql, /function public\.append_local_model_governance_artifact_selection_record\(p_selection jsonb\)[\s\S]*?security definer[\s\S]*?auth\.uid\(\)/i);
    assert.match(sql, /artifact-selection-authentication-required/);
    assert.match(sql, /artifact-selection-authorization-required/);
    assert.match(sql, /artifact-selection-source-record-mismatch/);
    assert.match(sql, /artifact-selection-conflicting-duplicate/);
    assert.match(sql, /selection_actor_user_id[\s\S]*?v_actor/i);
  });
  it('keeps the persisted envelope constrained and downstream flags false', () => {
    for (const field of ['decisionPersisted','artifactSelected','artifactApproved','modelApproved','licenseApproved','checksumVerified','benchmarkVerified','downloadable','runtimeReady','modelActive']) {
      assert.match(sql, new RegExp(`p_selection -> '${field}' <> 'false'::jsonb`));
    }
    assert.match(sql, /jsonb_object_keys\(p_selection\)/i);
    assert.doesNotMatch(sql, /access_token|refresh_token|rawjwt|password|download_url/i);
  });
  it('allows no direct mutation grants, no delete cascade, and no client role assignment', () => {
    assert.match(sql, /revoke all privileges on table public\.local_model_governance_artifact_selection_records from public, anon, authenticated, service_role/i);
    assert.match(sql, /grant execute on function public\.append_local_model_governance_artifact_selection_record\(jsonb\) to authenticated/i);
    assert.doesNotMatch(sql, /on delete cascade|\bupsert\b|insert\s+into\s+auth\.users/i);
  });
});
