import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { LOCAL_MODEL_GOVERNANCE_PERSISTENCE_SCHEMA_MIGRATION_PATH } from '../../src/platform/ai/localModelGovernancePersistenceSchemaTypes.ts';
import { buildLocalModelGovernanceBenchmarkCloseout } from '../../src/platform/ai/localModelGovernanceBenchmarkCloseout.ts';

const root = fileURLToPath(new URL('../..', import.meta.url));
function read(relativePath: string): string { return readFileSync(join(root, relativePath), 'utf8'); }
function sql(): string { return read(LOCAL_MODEL_GOVERNANCE_PERSISTENCE_SCHEMA_MIGRATION_PATH).replace(/\r\n/g, '\n'); }
function functionBody(source: string, qualifiedName: string): string {
  const escaped = qualifiedName.replace('.', '\\.');
  const match = source.match(new RegExp(`create\\s+or\\s+replace\\s+function\\s+${escaped}[\\s\\S]*?as\\s+\\$\\$([\\s\\S]*?)\\$\\$\\s*;`, 'i'));
  assert.ok(match, `${qualifiedName} body must exist`);
  return match[1]!;
}

describe('Phase 6.5 governance persistence RLS and RPC', () => {
  it('enables and forces RLS with a reviewer-only SELECT policy that reuses Phase 6.5A authorization', () => {
    const source = sql();
    assert.match(source, /alter table public\.local_model_governance_records enable row level security/i);
    assert.match(source, /alter table public\.local_model_governance_records force row level security/i);
    assert.match(source, /create policy [^\n]+\s+on public\.local_model_governance_records\s+for select\s+to authenticated\s+using\s*\(\s*private\.has_local_model_governance_permission\(\)\s*\)/i);
    assert.equal((source.match(/has_local_model_governance_permission\s*\(/gi) ?? []).length >= 2, true);
    assert.doesNotMatch(source, /create\s+(?:or\s+replace\s+)?function\s+private\.has_local_model_governance_permission/i);
    assert.doesNotMatch(source, /create\s+policy[\s\S]*?for\s+(?:insert|update|delete)/i);
    assert.doesNotMatch(source, /to\s+anon|using\s*\(\s*true\s*\)|with\s+check\s*\(\s*true\s*\)|auth\.role\(\)\s*=\s*'authenticated'/i);
  });

  it('revokes direct writes and grants only RLS-protected SELECT to authenticated', () => {
    const source = sql();
    assert.match(source, /revoke all(?: privileges)? on table public\.local_model_governance_records from public\s*;/i);
    assert.match(source, /revoke all(?: privileges)? on table public\.local_model_governance_records from anon\s*;/i);
    assert.match(source, /revoke insert\s*,\s*update\s*,\s*delete\s*,\s*truncate on table public\.local_model_governance_records from authenticated\s*;/i);
    assert.match(source, /grant select on table public\.local_model_governance_records to authenticated\s*;/i);
    assert.doesNotMatch(source, /grant\s+(?:all|insert|update|delete|truncate)[^;]*to\s+authenticated/i);
    assert.match(source, /revoke all(?: privileges)? on sequence public\.local_model_governance_records_id_seq from public\s*;/i);
    assert.match(source, /revoke all(?: privileges)? on sequence public\.local_model_governance_records_id_seq from anon\s*;/i);
    assert.match(source, /revoke all(?: privileges)? on sequence public\.local_model_governance_records_id_seq from authenticated\s*;/i);
  });

  it('authors a protected one-argument append RPC with locked search path and minimal privileges', () => {
    const source = sql();
    assert.match(source, /function public\.append_local_model_governance_record\s*\(\s*p_envelope\s+jsonb\s*\)/i);
    assert.match(source, /returns table\s*\(\s*result_status\s+text\s*,\s*record_id\s+bigint\s*,\s*persistence_key\s+text\s*\)/i);
    assert.match(source, /security definer/i);
    assert.match(source, /set search_path\s*=\s*''/i);
    assert.match(source, /revoke execute on function public\.append_local_model_governance_record\(jsonb\) from public\s*;/i);
    assert.match(source, /revoke execute on function public\.append_local_model_governance_record\(jsonb\) from anon\s*;/i);
    assert.match(source, /grant execute on function public\.append_local_model_governance_record\(jsonb\) to authenticated\s*;/i);
    const body = functionBody(source, 'public.append_local_model_governance_record');
    assert.match(body, /auth\.uid\(\)/i);
    assert.match(body, /private\.has_local_model_governance_permission\(\)/i);
    assert.match(body, /private\.validate_local_model_governance_persistence_envelope/i);
    assert.match(body, /insert into public\.local_model_governance_records/i);
    assert.match(body, /exception\s+when\s+unique_violation/i);
    assert.match(body, /identical-existing-envelope/i);
    assert.match(body, /governance-persistence-conflicting-duplicate/i);
    assert.doesNotMatch(body, /execute\s+format|on\s+conflict\s+do\s+update|\bupsert\b|\bupdate\s+public\.|\bdelete\s+from\s+public\./i);
    assert.doesNotMatch(source, /append_local_model_governance_record\s*\([^)]*(?:actor|role|permission)/i);
  });

  it('strictly validates the exact envelope, canonical record, decisions, actor binding, and logical keys', () => {
    const source = sql();
    const body = functionBody(source, 'private.validate_local_model_governance_persistence_envelope');
    for (const field of [
      'persistenceKey','idempotencyKey','schemaRevision','policyRevision','operation','duplicatePolicy','canonicalRecord',
      'canonicalRecordKey','canonicalRecordRevision','canonicalOutcome','candidateId','candidateTier','createdFromReviewedAt',
      'immutable','appendOnly','updateAllowed','deleteAllowed','clientDeleteAllowed','clientOverwriteAllowed','persistenceBoundaryOnly',
    ]) assert.ok(body.includes(`'${field}'`), `missing envelope allowlist field ${field}`);
    assert.match(body, /private\.local_model_governance_json_has_exact_keys/i);
    assert.match(body, /operation[\s\S]*?'append'/i);
    assert.match(body, /immutable[\s\S]*?true/i);
    assert.match(body, /appendOnly[\s\S]*?true/i);
    assert.match(body, /updateAllowed[\s\S]*?false/i);
    assert.match(body, /deleteAllowed[\s\S]*?false/i);
    assert.match(body, /clientDeleteAllowed[\s\S]*?false/i);
    assert.match(body, /clientOverwriteAllowed[\s\S]*?false/i);
    assert.match(body, /tokenizer-license-scope/i);
    assert.match(body, /acceptable-use-scope/i);
    assert.match(body, /derived-artifact-hosting/i);
    assert.match(body, /quantization-conversion/i);
    assert.match(body, /explicitlyRecorded/i);
    assert.match(body, /not-recorded/i);
    assert.match(body, /finalized-proceed/i);
    assert.match(body, /finalized-rejected/i);
    assert.match(body, /finalized-more-evidence/i);
    assert.match(body, /actorSubjectId[\s\S]*?p_actor_user_id::text/i);
    assert.match(body, /actorRole[\s\S]*?model-governance-reviewer/i);
    assert.match(body, /local-model-governance-record/i);
    assert.match(body, /record-revision-/i);
    assert.match(body, /schema-/i);
    assert.match(body, /:idempotency/i);
    assert.match(body, /createdFromReviewedAt[\s\S]*?reviewedAt/i);
    assert.doesNotMatch(body, /md5\s*\(|digest\s*\(|sha(?:1|256)|pgcrypto|raw envelope|raise[^;]*p_envelope/i);
  });

  it('fails closed for JSON nulls instead of treating SQL null as a valid comparison', () => {
    const source = sql();
    const keyBody = functionBody(source, 'private.local_model_governance_json_has_exact_keys');
    const validatorBody = functionBody(source, 'private.validate_local_model_governance_persistence_envelope');
    assert.match(keyBody, /select\s+coalesce\s*\(/i);
    assert.match(validatorBody, /p_envelope\s*->>\s*'operation'\s+is\s+distinct\s+from\s+'append'/i);
    assert.match(validatorBody, /v_record\s*->>\s*'persisted'\s+is\s+distinct\s+from\s+'false'/i);
    assert.match(validatorBody, /p_envelope\s*->>\s*'createdFromReviewedAt'\s+is\s+distinct\s+from\s+v_record\s*->>\s*'reviewedAt'/i);
  });

  it('implements concurrency-safe identical no-op and conflicting duplicate rejection without leaking records', () => {
    const source = sql();
    const body = functionBody(source, 'public.append_local_model_governance_record');
    assert.match(body, /unique_violation/i);
    assert.match(body, /existing\.persistence_key\s*=\s*v_persistence_key\s+or\s+existing\.idempotency_key\s*=\s*v_idempotency_key/i);
    assert.match(body, /persistence_envelope\s*=\s*p_envelope/i);
    assert.match(body, /return query[\s\S]*?'inserted'/i);
    assert.match(body, /return query[\s\S]*?'identical-existing-envelope'/i);
    assert.match(body, /governance-persistence-conflicting-duplicate/i);
    assert.doesNotMatch(source, /returns table\s*\([^)]*(?:actor_user_id|persistence_envelope|reviewed_at|decisions)/i);
  });

  it('adds a private immutable trigger that rejects update and delete and no mutation RPC', () => {
    const source = sql();
    assert.match(source, /function private\.reject_local_model_governance_record_mutation\s*\(\s*\)/i);
    assert.match(source, /set search_path\s*=\s*''/i);
    assert.match(source, /before update or delete on public\.local_model_governance_records/i);
    const body = functionBody(source, 'private.reject_local_model_governance_record_mutation');
    assert.match(body, /local-model-governance-records-immutable/i);
    assert.doesNotMatch(source, /function\s+(?:public|private)\.[^\s(]*(?:update|delete)_local_model_governance_record/i);
  });

  it('contains no client-controlled authorization, secrets, network, or downstream activation', () => {
    const source = sql();
    for (const pattern of [
      /user_metadata|raw_user_meta_data|profile_role|study_group|chat_room|subscription|entitlement/i,
      /generic admin|'admin'|'owner'|email[_ -]?domain/i,
      /service[_-]?role[_-]?(?:key|secret)|access[_-]?token|refresh[_-]?token|rawjwt|password|document\.cookie/i,
      /create\s+(?:or\s+replace\s+)?function\s+private\.has_local_model_governance_permission/i,
      /on\s+conflict\s+do\s+update|\bupsert\b|operation\s*=\s*'replace'/i,
      /webhook|http_request|net\.|AIService|\.execute\s*\(/i,
    ]) assert.doesNotMatch(source, pattern);
  });

  it('keeps prior sources blocked-safe and application source inert', () => {
    const closeout = buildLocalModelGovernanceBenchmarkCloseout();
    assert.equal(closeout.status, 'foundation-complete');
    assert.equal(closeout.productionBlockedSafe, true);
    assert.equal(closeout.aggregate.activeModels, 0);
    const productionSource = [
      read('src/platform/ai/localModelGovernancePersistenceSchemaTypes.ts'),
      read('src/platform/ai/localModelGovernancePersistenceSchemaViewModel.ts'),
      read('src/components/ai/LocalAIReadinessShell.tsx'),
    ].join('\n');
    for (const pattern of [
      /createClient|\.from\s*\(|\.rpc\s*\(|fetch\s*\(|XMLHttpRequest|WebSocket/i,
      /localStorage|sessionStorage|indexedDB|CacheStorage|AIService|\.execute\s*\(/i,
      /Math\.random|Date\.now|performance\.now|setTimeout/i,
      /migrationAppliedByApplication\s*:\s*true|remoteDatabaseApplied\s*:\s*true|repositoryConfigured\s*:\s*true/i,
      /applicationPersistenceAttempts\s*:\s*[1-9]|applicationRepositoryWrites\s*:\s*[1-9]|applicationPersistedRecords\s*:\s*[1-9]/i,
      /recordsAppliedDownstream\s*:\s*[1-9]|modelActive\s*:\s*true/i,
    ]) assert.doesNotMatch(productionSource, pattern);
  });
});
