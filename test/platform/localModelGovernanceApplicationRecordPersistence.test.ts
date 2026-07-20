import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, test } from 'node:test';

import type { LocalModelGovernanceRecordApplicationDecision } from '../../src/platform/ai/localModelGovernanceRecordApplicationTypes.ts';
import {
  LOCAL_MODEL_GOVERNANCE_APPLICATION_APPEND_RPC_NAME,
  LOCAL_MODEL_GOVERNANCE_APPLICATION_PERMISSION_ID,
  LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_SCHEMA_REVISION,
  LOCAL_MODEL_GOVERNANCE_APPLICATION_ROLE_ID,
} from '../../src/platform/ai/localModelGovernanceApplicationRecordPersistenceTypes.ts';
import {
  buildLocalModelGovernanceApplicationRecordIdempotencyKey,
  buildLocalModelGovernanceApplicationRecordPersistenceEnvelope,
  validateLocalModelGovernanceApplicationRecordPersistenceEnvelope,
} from '../../src/platform/ai/localModelGovernanceApplicationRecordPersistencePolicy.ts';
import {
  buildLocalModelGovernanceApplicationRecordPersistenceViewModel,
} from '../../src/platform/ai/localModelGovernanceApplicationRecordPersistenceViewModel.ts';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const migrationPath = join(
  repoRoot,
  'supabase/migrations/20260715_create_local_model_governance_application_records.sql',
);
const shellPath = join(repoRoot, 'src/components/ai/LocalAIReadinessShell.tsx');
const packagePath = join(repoRoot, 'package.json');
const approvalRegistryPath = join(repoRoot, 'src/platform/ai/localModelApprovalRegistry.ts');
const artifactManifestPath = join(repoRoot, 'src/platform/ai/localModelArtifactManifest.ts');

const candidateId = 'qwen3-0-6b-candidate';
const candidateTier = 'light' as const;
const observedRevision = 'c1899de289a04d12100db370d81485cdf75e47ca';
const canonicalRecordKey = [
  'governance-record',
  candidateId,
  observedRevision,
  'e1',
  'd1',
  'p1',
  'r1',
].join(':');
const sourceGovernancePersistenceKey = [
  'local-model-governance-record',
  candidateId,
  observedRevision,
  canonicalRecordKey,
  'record-revision-1',
  'schema-1',
].join(':');
const applicationDecisionKey = [
  'local-model-governance-application',
  candidateId,
  observedRevision,
  canonicalRecordKey,
  'finalized-proceed',
  'application-policy-revision-1',
].join(':');

function buildEligibleDecision(): LocalModelGovernanceRecordApplicationDecision {
  return {
    status: 'eligible-for-downstream-review',
    blockers: [],
    warnings: [],
    explicitApplicationRequested: true,
    expectedEnvelopeValid: true,
    verificationAccepted: true,
    verificationCurrent: true,
    applicationEligible: true,
    applicationDecisionKey,
    candidateId,
    candidateTier,
    persistenceKey: sourceGovernancePersistenceKey,
    canonicalRecordKey,
    canonicalOutcome: 'finalized-proceed',
    canonicalRecordRevision: 1,
    applicationPolicyRevision: 1,
    previousDecisionPresent: false,
    replayDetected: false,
    staleVerificationDetected: false,
    candidateScopeVerified: true,
    modelIdentityVerified: true,
    revisionScopeVerified: true,
    outcomeEligible: true,
    applicationRecordPersisted: false,
    recordAppliedDownstream: false,
    artifactSelectionReviewEligible: true,
    modelApproved: false,
    licenseApproved: false,
    artifactSelected: false,
    artifactApproved: false,
    checksumVerified: false,
    benchmarkVerified: false,
    downloadable: false,
    runtimeReady: false,
    modelActive: false,
  };
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function requireBuiltEnvelope() {
  const result = buildLocalModelGovernanceApplicationRecordPersistenceEnvelope(buildEligibleDecision());
  assert.equal(result.valid, true);
  assert.deepEqual(result.issues, []);
  assert.ok(result.envelope);
  return result.envelope;
}

describe('Phase 7.1 application-envelope policy', () => {
  test('module import is side-effect free and exact constants are stable', () => {
    assert.equal(LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_SCHEMA_REVISION, 1);
    assert.equal(LOCAL_MODEL_GOVERNANCE_APPLICATION_PERMISSION_ID, 'record-model-governance-application');
    assert.equal(LOCAL_MODEL_GOVERNANCE_APPLICATION_ROLE_ID, 'model-governance-reviewer');
    assert.equal(LOCAL_MODEL_GOVERNANCE_APPLICATION_APPEND_RPC_NAME, 'append_local_model_governance_application_record');
  });

  test('eligible Phase 6.8 decision builds the exact sanitized envelope without mutation', () => {
    const decision = buildEligibleDecision();
    const before = deepClone(decision);
    const first = buildLocalModelGovernanceApplicationRecordPersistenceEnvelope(decision);
    const second = buildLocalModelGovernanceApplicationRecordPersistenceEnvelope(decision);

    assert.deepEqual(decision, before);
    assert.deepEqual(first, second);
    assert.equal(first.valid, true);
    assert.deepEqual(first.issues, []);
    assert.ok(first.envelope);
    assert.deepEqual(Object.keys(first.envelope), [
      'applicationDecisionKey',
      'applicationIdempotencyKey',
      'schemaRevision',
      'applicationPolicyRevision',
      'operation',
      'sourceGovernancePersistenceKey',
      'canonicalRecordKey',
      'canonicalRecordRevision',
      'canonicalOutcome',
      'candidateId',
      'candidateTier',
      'observedRevision',
      'applicationStatus',
      'artifactSelectionReviewEligible',
      'immutable',
      'appendOnly',
      'applicationRecordPersisted',
      'recordAppliedDownstream',
      'modelApproved',
      'licenseApproved',
      'artifactSelected',
      'artifactApproved',
      'checksumVerified',
      'benchmarkVerified',
      'downloadable',
      'runtimeReady',
      'modelActive',
    ]);
    assert.equal(first.envelope.applicationDecisionKey, applicationDecisionKey);
    assert.equal(first.envelope.applicationIdempotencyKey, `${applicationDecisionKey}:idempotency:schema-1`);
    assert.equal(first.envelope.schemaRevision, 1);
    assert.equal(first.envelope.operation, 'append');
    assert.equal(first.envelope.canonicalOutcome, 'finalized-proceed');
    assert.equal(first.envelope.applicationStatus, 'eligible-for-downstream-review');
    assert.equal(first.envelope.sourceGovernancePersistenceKey, sourceGovernancePersistenceKey);
    assert.equal(first.envelope.observedRevision, observedRevision);
    assert.equal(first.envelope.artifactSelectionReviewEligible, true);
    assert.equal(first.envelope.immutable, true);
    assert.equal(first.envelope.appendOnly, true);
    assert.equal(first.envelope.applicationRecordPersisted, false);
    assert.equal(first.envelope.recordAppliedDownstream, false);
    assert.equal(first.envelope.modelApproved, false);
    assert.equal(first.envelope.licenseApproved, false);
    assert.equal(first.envelope.artifactSelected, false);
    assert.equal(first.envelope.artifactApproved, false);
    assert.equal(first.envelope.checksumVerified, false);
    assert.equal(first.envelope.benchmarkVerified, false);
    assert.equal(first.envelope.downloadable, false);
    assert.equal(first.envelope.runtimeReady, false);
    assert.equal(first.envelope.modelActive, false);

    const serialized = JSON.stringify(first.envelope);
    const forbiddenNames = [
      'actorId',
      'actorRole',
      'permission',
      ['access', 'Token'].join(''),
      ['j', 'wt'].join(''),
      ['ses', 'sion'].join(''),
      'timestamp',
      'reviewer',
    ];
    for (const forbidden of forbiddenNames) {
      assert.equal(serialized.includes(forbidden), false);
    }
  });

  test('idempotency key is deterministic and contains no actor, timestamp, hash, or random value', () => {
    const key = buildLocalModelGovernanceApplicationRecordIdempotencyKey(applicationDecisionKey);
    assert.equal(key, `${applicationDecisionKey}:idempotency:schema-1`);
    assert.equal(buildLocalModelGovernanceApplicationRecordIdempotencyKey(applicationDecisionKey), key);
    assert.equal(/actor|timestamp|hash|checksum|signature|random/i.test(key), false);
  });

  test('builder fails closed for ineligible, stale, unsafe, missing-key, malformed, and hostile inputs', () => {
    const cases: unknown[] = [
      { ...buildEligibleDecision(), status: 'outcome-rejected', canonicalOutcome: 'finalized-rejected', applicationEligible: false, outcomeEligible: false, artifactSelectionReviewEligible: false },
      { ...buildEligibleDecision(), status: 'more-evidence-required', canonicalOutcome: 'finalized-more-evidence', applicationEligible: false, outcomeEligible: false, artifactSelectionReviewEligible: false },
      { ...buildEligibleDecision(), staleVerificationDetected: true, verificationCurrent: false },
      { ...buildEligibleDecision(), applicationEligible: false },
      { ...buildEligibleDecision(), verificationAccepted: false },
      { ...buildEligibleDecision(), verificationCurrent: false },
      { ...buildEligibleDecision(), artifactSelectionReviewEligible: false },
      { ...buildEligibleDecision(), recordAppliedDownstream: true },
      { ...buildEligibleDecision(), modelApproved: true },
      { ...buildEligibleDecision(), downloadable: true },
      { ...buildEligibleDecision(), runtimeReady: true },
      { ...buildEligibleDecision(), modelActive: true },
      { ...buildEligibleDecision(), applicationDecisionKey: '' },
      { ...buildEligibleDecision(), applicationPolicyRevision: 2 },
      { ...buildEligibleDecision(), candidateId: 'unknown-candidate', persistenceKey: sourceGovernancePersistenceKey.replace(candidateId, 'unknown-candidate') },
      null,
      {},
    ];

    for (const value of cases) {
      const result = buildLocalModelGovernanceApplicationRecordPersistenceEnvelope(
        value as LocalModelGovernanceRecordApplicationDecision,
      );
      assert.equal(result.valid, false);
      assert.equal(result.envelope, null);
      assert.ok(result.issues.length > 0);
      assert.equal(JSON.stringify(result.issues).includes(sourceGovernancePersistenceKey), false);
    }

    const hostile = new Proxy({}, {
      get() {
        throw new Error('sensitive-hostile-value');
      },
    });
    const hostileResult = buildLocalModelGovernanceApplicationRecordPersistenceEnvelope(
      hostile as LocalModelGovernanceRecordApplicationDecision,
    );
    assert.equal(hostileResult.valid, false);
    assert.equal(hostileResult.envelope, null);
    assert.equal(JSON.stringify(hostileResult).includes('sensitive-hostile-value'), false);
  });

  test('validator accepts exact envelope and rejects missing, extra, invalid-key, revision, outcome, status, and safety mutations deterministically', () => {
    const envelope = requireBuiltEnvelope();
    assert.deepEqual(validateLocalModelGovernanceApplicationRecordPersistenceEnvelope(envelope), {
      valid: true,
      issues: [],
    });

    const variants: unknown[] = [
      (() => { const copy = { ...envelope } as Record<string, unknown>; delete copy.applicationDecisionKey; return copy; })(),
      { ...envelope, unexpected: true },
      { ...envelope, applicationDecisionKey: 'invalid' },
      { ...envelope, applicationIdempotencyKey: 'invalid' },
      { ...envelope, schemaRevision: 2 },
      { ...envelope, applicationPolicyRevision: 2 },
      { ...envelope, canonicalOutcome: 'finalized-rejected' },
      { ...envelope, applicationStatus: 'outcome-rejected' },
      { ...envelope, applicationRecordPersisted: true },
      { ...envelope, artifactSelected: true },
    ];

    for (const variant of variants) {
      const first = validateLocalModelGovernanceApplicationRecordPersistenceEnvelope(variant);
      const second = validateLocalModelGovernanceApplicationRecordPersistenceEnvelope(variant);
      assert.equal(first.valid, false);
      assert.ok(first.issues.length > 0);
      assert.deepEqual(first, second);
      assert.equal(JSON.stringify(first.issues).includes(sourceGovernancePersistenceKey), false);
    }
  });
});

describe('Phase 7.1 migration, RBAC, RLS, RPC, and immutability contract', () => {
  const sql = existsSync(migrationPath) ? readFileSync(migrationPath, 'utf8') : '';
  const normalized = sql.replace(/\s+/g, ' ').toLowerCase();

  test('migration filename and protected object names are exact', () => {
    assert.equal(existsSync(migrationPath), true);
    assert.ok(sql.length > 0);
    assert.match(sql, /record-model-governance-application/);
    assert.match(sql, /model-governance-reviewer/);
    assert.match(sql, /create table public\.local_model_governance_application_records/i);
    assert.match(sql, /private\.has_local_model_governance_application_permission\(\)/i);
    assert.match(sql, /public\.append_local_model_governance_application_record\(\s*p_application jsonb\s*\)/i);
    assert.equal(/create table[^;]*governance.*role/i.test(sql), false);
  });

  test('permission mapping is seeded without user assignment, auth user, or application record seed', () => {
    assert.match(sql, /insert into private\.local_model_governance_permissions/i);
    assert.match(sql, /insert into private\.local_model_governance_role_permissions/i);
    assert.equal(/insert into private\.local_model_governance_user_roles/i.test(sql), false);
    assert.equal(/insert into auth\.users/i.test(sql), false);
    const applicationInsertCount = (sql.match(/insert into public\.local_model_governance_application_records/gi) ?? []).length;
    assert.equal(applicationInsertCount, 1);
  });

  test('table has exact immutable audit columns, constraints, foreign key, and no cascade', () => {
    for (const column of [
      'id bigint generated always as identity primary key',
      'application_decision_key text not null',
      'application_idempotency_key text not null',
      'schema_revision integer not null',
      'application_policy_revision integer not null',
      'source_governance_persistence_key text not null',
      'canonical_record_key text not null',
      'canonical_record_revision integer not null',
      'canonical_outcome text not null',
      'candidate_id text not null',
      'candidate_tier text not null',
      'observed_revision text not null',
      'application_status text not null',
      'artifact_selection_review_eligible boolean not null',
      'application_actor_user_id uuid not null',
      'application_envelope jsonb not null',
      'created_at timestamptz not null default transaction_timestamp()',
    ]) {
      assert.ok(normalized.includes(column), column);
    }
    assert.match(sql, /references public\.local_model_governance_records\s*\(persistence_key\)\s*on update restrict\s*on delete restrict/i);
    assert.match(sql, /unique\s*\(application_decision_key\)/i);
    assert.match(sql, /unique\s*\(application_idempotency_key\)/i);
    assert.equal(/on delete cascade/i.test(sql), false);
  });

  test('RBAC helper is server-authoritative and exact', () => {
    assert.match(sql, /create or replace function private\.has_local_model_governance_application_permission\(\)\s*returns boolean/i);
    assert.match(sql, /security definer/i);
    assert.match(sql, /set search_path\s*(?:=|to)\s*''/i);
    assert.match(sql, /auth\.uid\(\)/i);
    assert.match(sql, /ur\.role_id\s*=\s*'model-governance-reviewer'/i);
    assert.match(sql, /rp\.permission_id\s*=\s*'record-model-governance-application'/i);
    assert.equal(/user_metadata|raw_user_meta_data|generic admin|profile.*role/i.test(sql), false);
    assert.equal(/has_local_model_governance_application_permission\s*\([^)]*(user|role|permission)/i.test(sql), false);
  });

  test('forced RLS allows only authorized SELECT and no client mutation policy', () => {
    assert.match(sql, /alter table public\.local_model_governance_application_records enable row level security/i);
    assert.match(sql, /alter table public\.local_model_governance_application_records force row level security/i);
    assert.match(sql, /create policy local_model_governance_application_records_reviewer_select[\s\S]*for select[\s\S]*to authenticated[\s\S]*using \(private\.has_local_model_governance_application_permission\(\)\)/i);
    assert.equal(/create policy[\s\S]{0,160}for insert/i.test(sql), false);
    assert.equal(/create policy[\s\S]{0,160}for update/i.test(sql), false);
    assert.equal(/create policy[\s\S]{0,160}for delete/i.test(sql), false);
  });

  test('append RPC derives actor, validates exact payload, rechecks source record, and returns sanitized statuses', () => {
    assert.match(sql, /create or replace function public\.append_local_model_governance_application_record\(\s*p_application jsonb\s*\)/i);
    assert.match(sql, /returns table\s*\(\s*result_status text,\s*record_id bigint,\s*application_decision_key text\s*\)/i);
    assert.match(sql, /security definer/i);
    assert.match(sql, /set search_path\s*(?:=|to)\s*''/i);
    assert.match(sql, /v_actor_user_id\s*:=\s*auth\.uid\(\)/i);
    assert.match(sql, /private\.has_local_model_governance_application_permission\(\)/i);
    assert.match(sql, /errcode\s*=\s*'28000'.*governance-application-authentication-required/is);
    assert.match(sql, /errcode\s*=\s*'42501'.*governance-application-authorization-required/is);
    assert.match(sql, /errcode\s*=\s*'22023'.*governance-application-source-record-required/is);
    assert.match(sql, /errcode\s*=\s*'22023'.*governance-application-source-record-mismatch/is);
    assert.match(sql, /errcode\s*=\s*'23505'.*governance-application-conflicting-duplicate/is);
    assert.match(sql, /identical-existing-application-envelope/);
    assert.match(sql, /from public\.local_model_governance_records/i);
    for (const field of ['canonical_record_key', 'canonical_record_revision', 'canonical_outcome', 'candidate_id', 'candidate_tier', 'observed_revision']) {
      assert.ok(normalized.includes(field), field);
    }
    assert.match(sql, /application_actor_user_id[\s\S]*v_actor_user_id/i);
    assert.equal(/p_application\s*->>\s*'actor/i.test(sql), false);
    assert.match(sql, /local_model_governance_json_has_exact_keys/i);
    assert.equal(/pg_catalog\.coalesce/i.test(sql), false);
  });

  test('immutable trigger and privilege hardening deny direct mutation for client and service roles', () => {
    assert.match(sql, /before update or delete on public\.local_model_governance_application_records/i);
    assert.match(sql, /errcode\s*=\s*'55000'.*local-model-governance-application-records-immutable/is);
    for (const role of ['public', 'anon', 'authenticated', 'service_role']) {
      assert.match(normalized, new RegExp(`revoke all privileges on table public\\.local_model_governance_application_records from ${role}`));
      assert.match(normalized, new RegExp(`revoke all privileges on sequence public\\.local_model_governance_application_records_id_seq from ${role}`));
    }
    assert.match(normalized, /grant select on table public\.local_model_governance_application_records to authenticated/);
    assert.equal(/grant\s+(insert|update|delete|truncate|references|trigger)[\s\S]*authenticated/i.test(sql), false);
    assert.equal(/grant[\s\S]*on table public\.local_model_governance_application_records[\s\S]*to service_role/i.test(sql), false);
    assert.match(normalized, /revoke execute on function public\.append_local_model_governance_application_record\(jsonb\) from public/);
    assert.match(normalized, /revoke execute on function public\.append_local_model_governance_application_record\(jsonb\) from anon/);
    assert.match(normalized, /revoke execute on function public\.append_local_model_governance_application_record\(jsonb\) from service_role/);
    assert.match(normalized, /grant execute on function public\.append_local_model_governance_application_record\(jsonb\) to authenticated/);
    assert.equal(/on conflict do update|\bupsert\b/i.test(sql), false);
  });

  test('migration contains no credential, URL, assignment seed, or extra protected table insert', () => {
    const forbidden = [
      new RegExp(['service', 'role', 'key'].join('[_-]?'), 'i'),
      new RegExp(['service', 'role', 'credential'].join('[_-]?'), 'i'),
      new RegExp(['supabase', 'service', 'role', 'key'].join('[_-]?'), 'i'),
      new RegExp(['database', 'url'].join('[_-]?'), 'i'),
      new RegExp(['j', 'wt', 'secret'].join('[_-]?'), 'i'),
      new RegExp(['access', 'token'].join('[_ -]?'), 'i'),
      new RegExp(['refresh', 'token'].join('[_ -]?'), 'i'),
      /https?:\/\//i,
    ];
    for (const pattern of forbidden) assert.equal(pattern.test(sql), false, String(pattern));
  });
});

describe('Phase 7.1 view model, readiness integration, registration, and patch safety', () => {
  test('view model reports authored boundary and zero production/downstream state', () => {
    const viewModel = buildLocalModelGovernanceApplicationRecordPersistenceViewModel();
    assert.equal(viewModel.heading, 'Phase 7.1 Authoritative Governance Application Record');
    assert.equal(viewModel.aggregate.totalCandidates, 3);
    assert.equal(viewModel.aggregate.applicationPersistenceBoundaryAuthored, true);
    assert.equal(viewModel.aggregate.existingReviewerRoleReused, true);
    assert.equal(viewModel.aggregate.separateApplicationPermissionAuthored, true);
    assert.equal(viewModel.aggregate.newRolesCreated, 0);
    assert.equal(viewModel.aggregate.seededReviewerAssignments, 0);
    assert.equal(viewModel.aggregate.seededApplicationRecords, 0);
    assert.equal(viewModel.aggregate.automaticPersistenceAttempts, 0);
    assert.equal(viewModel.aggregate.explicitProductionPersistenceAttempts, 0);
    assert.equal(viewModel.aggregate.productionRpcInvocations, 0);
    assert.equal(viewModel.aggregate.persistedApplicationRecordsClaimed, 0);
    assert.equal(viewModel.aggregate.recordsAppliedDownstream, 0);
    assert.equal(viewModel.aggregate.selectedArtifacts, 0);
    assert.equal(viewModel.aggregate.approvedArtifacts, 0);
    assert.equal(viewModel.aggregate.approvedModels, 0);
    assert.equal(viewModel.aggregate.approvedLicenses, 0);
    assert.equal(viewModel.aggregate.checksumsVerified, 0);
    assert.equal(viewModel.aggregate.benchmarksPassed, 0);
    assert.equal(viewModel.aggregate.downloadableArtifacts, 0);
    assert.equal(viewModel.aggregate.runtimeReadyArtifacts, 0);
    assert.equal(viewModel.aggregate.activeModels, 0);
    const copy = JSON.stringify(viewModel);
    assert.match(copy, /server-derived/i);
    assert.match(copy, /source governance record/i);
    assert.match(copy, /append-only and immutable/i);
    assert.equal(/production rpc connected|record saved|model ready|runtime ready/i.test(copy), false);
  });

  test('readiness shell keeps Phase 6.9 and adds read-only Phase 7.1 card', () => {
    const shell = readFileSync(shellPath, 'utf8');
    assert.match(shell, /Phase 6\.9 Governance persistence and application safety closeout/);
    assert.match(shell, /Phase 7\.1 Authoritative governance application record/);
    assert.match(shell, /buildLocalModelGovernanceApplicationRecordPersistenceViewModel/);
    const phase71Section = shell.slice(shell.indexOf('Phase 7.1 Authoritative governance application record'));
    assert.equal(/<button|onClick=|Persist button|Save button|Apply button|Retry button|Connect button/i.test(phase71Section.slice(0, 2200)), false);
    assert.equal(/\.rpc\(|createClient|supabase\./i.test(phase71Section.slice(0, 2200)), false);
  });

  test('package scripts register exactly one Phase 7.1 test without losing previous registrations', () => {
    const pkg = JSON.parse(readFileSync(packagePath, 'utf8')) as { scripts: Record<string, string>; dependencies?: Record<string, string> };
    for (const scriptName of ['test', 'test:platform']) {
      const script = pkg.scripts[scriptName];
      assert.ok(script.includes('test/platform/localModelGovernanceApplicationRecordPersistence.test.ts'));
      assert.ok(script.includes('test/platform/localModelGovernancePhase6Closeout.test.ts'));
      assert.ok(script.includes('test/platform/localModelGovernanceRecordApplicationPolicy.test.ts'));
      assert.equal((script.match(/localModelGovernanceApplicationRecordPersistence\.test\.ts/g) ?? []).length, 1);
    }
    assert.equal(pkg.dependencies?.['@supabase/supabase-js'], '^2.110.2');
  });

  test('protected foundations remain present and Phase 7.1 production source has no network, client credential, or executor behavior', () => {
    assert.equal(existsSync(approvalRegistryPath), true);
    assert.equal(existsSync(artifactManifestPath), true);
    const sourceFiles = [
      'src/platform/ai/localModelGovernanceApplicationRecordPersistenceTypes.ts',
      'src/platform/ai/localModelGovernanceApplicationRecordPersistencePolicy.ts',
      'src/platform/ai/localModelGovernanceApplicationRecordPersistenceViewModel.ts',
    ].map((path) => readFileSync(join(repoRoot, path), 'utf8')).join('\n');
    for (const pattern of [
      /createClient/,
      /fetch\(/,
      /\.rpc\(/,
      /\.from\(/,
      /localStorage/,
      /sessionStorage/,
      /indexedDB/,
      /setTimeout/,
      /Date\.now/,
      /Math\.random/,
      /crypto\.randomUUID/,
      /console\.log/,
      /AIService/,
      /service[_-]?role[_-]?key/i,
      /https?:\/\//,
    ]) {
      assert.equal(pattern.test(sourceFiles), false, String(pattern));
    }
  });
});
