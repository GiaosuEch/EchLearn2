do $$
begin
  if not exists (
    select 1
    from private.local_model_governance_roles
    where role_id = 'model-governance-reviewer'
  ) then
    raise exception using errcode = '55000', message = 'governance-application-reviewer-role-required';
  end if;
end;
$$;

insert into private.local_model_governance_permissions (
  permission_id,
  permission_revision
)
values ('record-model-governance-application', 1)
on conflict (permission_id) do nothing;

insert into private.local_model_governance_role_permissions (
  role_id,
  permission_id,
  mapping_revision
)
values (
  'model-governance-reviewer',
  'record-model-governance-application',
  1
)
on conflict (role_id, permission_id) do nothing;

do $$
begin
  if not exists (
    select 1
    from private.local_model_governance_permissions
    where permission_id = 'record-model-governance-application'
      and permission_revision = 1
  ) or not exists (
    select 1
    from private.local_model_governance_role_permissions
    where role_id = 'model-governance-reviewer'
      and permission_id = 'record-model-governance-application'
      and mapping_revision = 1
  ) then
    raise exception using errcode = '55000', message = 'governance-application-permission-catalog-invalid';
  end if;
end;
$$;

create or replace function private.has_local_model_governance_application_permission()
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select case
    when auth.uid() is null then false
    else exists (
      select 1
      from private.local_model_governance_user_roles as ur
      inner join private.local_model_governance_role_permissions as rp
        on rp.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and ur.role_id = 'model-governance-reviewer'
        and rp.permission_id = 'record-model-governance-application'
    )
  end;
$$;

create table public.local_model_governance_application_records (
  id bigint generated always as identity primary key,
  application_decision_key text not null,
  application_idempotency_key text not null,
  schema_revision integer not null,
  application_policy_revision integer not null,
  source_governance_persistence_key text not null,
  canonical_record_key text not null,
  canonical_record_revision integer not null,
  canonical_outcome text not null,
  candidate_id text not null,
  candidate_tier text not null,
  observed_revision text not null,
  application_status text not null,
  artifact_selection_review_eligible boolean not null,
  application_actor_user_id uuid not null,
  application_envelope jsonb not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint local_model_governance_application_records_decision_key_not_empty
    check (char_length(application_decision_key) > 0 and application_decision_key = btrim(application_decision_key)),
  constraint local_model_governance_application_records_idempotency_key_not_empty
    check (char_length(application_idempotency_key) > 0 and application_idempotency_key = btrim(application_idempotency_key)),
  constraint local_model_governance_application_records_source_key_not_empty
    check (char_length(source_governance_persistence_key) > 0 and source_governance_persistence_key = btrim(source_governance_persistence_key)),
  constraint local_model_governance_application_records_canonical_key_not_empty
    check (char_length(canonical_record_key) > 0 and canonical_record_key = btrim(canonical_record_key)),
  constraint local_model_governance_application_records_observed_revision_not_empty
    check (char_length(observed_revision) > 0 and observed_revision = btrim(observed_revision)),
  constraint local_model_governance_application_records_schema_revision_exact
    check (schema_revision = 1),
  constraint local_model_governance_application_records_policy_revision_positive
    check (application_policy_revision > 0),
  constraint local_model_governance_application_records_record_revision_positive
    check (canonical_record_revision > 0),
  constraint local_model_governance_application_records_outcome_exact
    check (canonical_outcome = 'finalized-proceed'),
  constraint local_model_governance_application_records_status_exact
    check (application_status = 'eligible-for-downstream-review'),
  constraint local_model_governance_application_records_review_eligibility_exact
    check (artifact_selection_review_eligible = true),
  constraint local_model_governance_application_records_tier_allowed
    check (candidate_tier in ('light', 'standard', 'pro')),
  constraint local_model_governance_application_records_candidate_matrix
    check (
      (
        candidate_id = 'qwen3-0-6b-candidate'
        and candidate_tier = 'light'
        and observed_revision = 'c1899de289a04d12100db370d81485cdf75e47ca'
      )
      or (
        candidate_id = 'qwen3-1-7b-candidate'
        and candidate_tier = 'standard'
        and observed_revision = '70d244cc86ccca08cf5af4e1e306ecf908b1ad5e'
      )
      or (
        candidate_id = 'qwen3-4b-candidate'
        and candidate_tier = 'pro'
        and observed_revision = '1cfa9a7208912126459214e8b04321603b3df60c'
      )
    ),
  constraint local_model_governance_application_records_envelope_is_object
    check (pg_catalog.jsonb_typeof(application_envelope) = 'object'),
  constraint local_model_governance_application_records_decision_key_unique
    unique (application_decision_key),
  constraint local_model_governance_application_records_idempotency_key_unique
    unique (application_idempotency_key),
  constraint local_model_governance_application_records_source_governance_fk
    foreign key (source_governance_persistence_key)
    references public.local_model_governance_records(persistence_key)
    on update restrict
    on delete restrict
);

alter table public.local_model_governance_application_records enable row level security;
alter table public.local_model_governance_application_records force row level security;

create policy local_model_governance_application_records_reviewer_select
on public.local_model_governance_application_records
for select
to authenticated
using (private.has_local_model_governance_application_permission());

create or replace function private.validate_local_model_governance_application_envelope(
  p_application jsonb
)
returns void
language plpgsql
set search_path to ''
as $$
declare
  v_application_decision_key text;
  v_application_idempotency_key text;
  v_source_governance_persistence_key text;
  v_canonical_record_key text;
  v_candidate_id text;
  v_candidate_tier text;
  v_observed_revision text;
  v_schema_revision integer;
  v_application_policy_revision integer;
  v_canonical_record_revision integer;
  v_expected_application_decision_key text;
  v_expected_application_idempotency_key text;
  v_expected_source_governance_persistence_key text;
begin
  if not private.local_model_governance_json_has_exact_keys(
    p_application,
    array[
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
      'modelActive'
    ]::text[]
  ) then
    raise exception using errcode = '22023', message = 'governance-application-envelope-fields-invalid';
  end if;

  if coalesce(p_application ->> 'applicationDecisionKey', '') = ''
    or p_application ->> 'applicationDecisionKey' is distinct from btrim(p_application ->> 'applicationDecisionKey')
    or coalesce(p_application ->> 'applicationIdempotencyKey', '') = ''
    or p_application ->> 'applicationIdempotencyKey' is distinct from btrim(p_application ->> 'applicationIdempotencyKey')
    or coalesce(p_application ->> 'sourceGovernancePersistenceKey', '') = ''
    or p_application ->> 'sourceGovernancePersistenceKey' is distinct from btrim(p_application ->> 'sourceGovernancePersistenceKey')
    or coalesce(p_application ->> 'canonicalRecordKey', '') = ''
    or p_application ->> 'canonicalRecordKey' is distinct from btrim(p_application ->> 'canonicalRecordKey')
    or coalesce(p_application ->> 'candidateId', '') = ''
    or coalesce(p_application ->> 'observedRevision', '') = '' then
    raise exception using errcode = '22023', message = 'governance-application-logical-fields-invalid';
  end if;

  if coalesce(p_application ->> 'schemaRevision', '') !~ '^[1-9][0-9]*$'
    or coalesce(p_application ->> 'applicationPolicyRevision', '') !~ '^[1-9][0-9]*$'
    or coalesce(p_application ->> 'canonicalRecordRevision', '') !~ '^[1-9][0-9]*$' then
    raise exception using errcode = '22023', message = 'governance-application-revision-invalid';
  end if;

  begin
    v_schema_revision := (p_application ->> 'schemaRevision')::integer;
    v_application_policy_revision := (p_application ->> 'applicationPolicyRevision')::integer;
    v_canonical_record_revision := (p_application ->> 'canonicalRecordRevision')::integer;
  exception
    when others then
      raise exception using errcode = '22023', message = 'governance-application-revision-invalid';
  end;

  if v_schema_revision <> 1 then
    raise exception using errcode = '22023', message = 'governance-application-revision-invalid';
  end if;

  if p_application ->> 'operation' is distinct from 'append'
    or p_application ->> 'canonicalOutcome' is distinct from 'finalized-proceed'
    or p_application ->> 'applicationStatus' is distinct from 'eligible-for-downstream-review'
    or p_application -> 'artifactSelectionReviewEligible' is distinct from 'true'::jsonb
    or p_application -> 'immutable' is distinct from 'true'::jsonb
    or p_application -> 'appendOnly' is distinct from 'true'::jsonb then
    raise exception using errcode = '22023', message = 'governance-application-contract-flags-invalid';
  end if;

  if p_application -> 'applicationRecordPersisted' is distinct from 'false'::jsonb
    or p_application -> 'recordAppliedDownstream' is distinct from 'false'::jsonb
    or p_application -> 'modelApproved' is distinct from 'false'::jsonb
    or p_application -> 'licenseApproved' is distinct from 'false'::jsonb
    or p_application -> 'artifactSelected' is distinct from 'false'::jsonb
    or p_application -> 'artifactApproved' is distinct from 'false'::jsonb
    or p_application -> 'checksumVerified' is distinct from 'false'::jsonb
    or p_application -> 'benchmarkVerified' is distinct from 'false'::jsonb
    or p_application -> 'downloadable' is distinct from 'false'::jsonb
    or p_application -> 'runtimeReady' is distinct from 'false'::jsonb
    or p_application -> 'modelActive' is distinct from 'false'::jsonb then
    raise exception using errcode = '22023', message = 'governance-application-safety-flags-invalid';
  end if;

  v_application_decision_key := p_application ->> 'applicationDecisionKey';
  v_application_idempotency_key := p_application ->> 'applicationIdempotencyKey';
  v_source_governance_persistence_key := p_application ->> 'sourceGovernancePersistenceKey';
  v_canonical_record_key := p_application ->> 'canonicalRecordKey';
  v_candidate_id := p_application ->> 'candidateId';
  v_candidate_tier := p_application ->> 'candidateTier';
  v_observed_revision := p_application ->> 'observedRevision';

  if not (
    (
      v_candidate_id is not distinct from 'qwen3-0-6b-candidate'
      and v_candidate_tier is not distinct from 'light'
      and v_observed_revision is not distinct from 'c1899de289a04d12100db370d81485cdf75e47ca'
    )
    or (
      v_candidate_id is not distinct from 'qwen3-1-7b-candidate'
      and v_candidate_tier is not distinct from 'standard'
      and v_observed_revision is not distinct from '70d244cc86ccca08cf5af4e1e306ecf908b1ad5e'
    )
    or (
      v_candidate_id is not distinct from 'qwen3-4b-candidate'
      and v_candidate_tier is not distinct from 'pro'
      and v_observed_revision is not distinct from '1cfa9a7208912126459214e8b04321603b3df60c'
    )
  ) then
    raise exception using errcode = '22023', message = 'governance-application-candidate-identity-invalid';
  end if;

  v_expected_application_decision_key := pg_catalog.concat_ws(
    ':',
    'local-model-governance-application',
    v_candidate_id,
    v_observed_revision,
    v_canonical_record_key,
    'finalized-proceed',
    'application-policy-revision-' || v_application_policy_revision::text
  );
  v_expected_application_idempotency_key :=
    v_expected_application_decision_key || ':idempotency:schema-1';
  v_expected_source_governance_persistence_key := pg_catalog.concat_ws(
    ':',
    'local-model-governance-record',
    v_candidate_id,
    v_observed_revision,
    v_canonical_record_key,
    'record-revision-' || v_canonical_record_revision::text,
    'schema-1'
  );

  if v_application_decision_key is distinct from v_expected_application_decision_key
    or v_application_idempotency_key is distinct from v_expected_application_idempotency_key
    or v_source_governance_persistence_key is distinct from v_expected_source_governance_persistence_key then
    raise exception using errcode = '22023', message = 'governance-application-logical-key-invalid';
  end if;
end;
$$;

create or replace function public.append_local_model_governance_application_record(
  p_application jsonb
)
returns table (
  result_status text,
  record_id bigint,
  application_decision_key text
)
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_actor_user_id uuid;
  v_source_governance_persistence_key text;
  v_application_decision_key text;
  v_application_idempotency_key text;
  v_source_record public.local_model_governance_records%rowtype;
  v_record_id bigint;
  v_existing_count integer;
  v_existing_id bigint;
  v_existing_decision_key text;
  v_existing_identical boolean;
begin
  v_actor_user_id := auth.uid();
  if v_actor_user_id is null then
    raise exception using errcode = '28000', message = 'governance-application-authentication-required';
  end if;

  if not private.has_local_model_governance_application_permission() then
    raise exception using errcode = '42501', message = 'governance-application-authorization-required';
  end if;

  perform private.validate_local_model_governance_application_envelope(p_application);

  v_source_governance_persistence_key := p_application ->> 'sourceGovernancePersistenceKey';
  v_application_decision_key := p_application ->> 'applicationDecisionKey';
  v_application_idempotency_key := p_application ->> 'applicationIdempotencyKey';

  select source_record.*
  into v_source_record
  from public.local_model_governance_records as source_record
  where source_record.persistence_key = v_source_governance_persistence_key;

  if not found then
    raise exception using errcode = '22023', message = 'governance-application-source-record-required';
  end if;

  if v_source_record.persistence_key is distinct from v_source_governance_persistence_key
    or v_source_record.canonical_record_key is distinct from p_application ->> 'canonicalRecordKey'
    or v_source_record.canonical_record_revision is distinct from (p_application ->> 'canonicalRecordRevision')::integer
    or v_source_record.canonical_outcome is distinct from 'finalized-proceed'
    or v_source_record.canonical_outcome is distinct from p_application ->> 'canonicalOutcome'
    or v_source_record.candidate_id is distinct from p_application ->> 'candidateId'
    or v_source_record.candidate_tier is distinct from p_application ->> 'candidateTier'
    or v_source_record.observed_revision is distinct from p_application ->> 'observedRevision' then
    raise exception using errcode = '22023', message = 'governance-application-source-record-mismatch';
  end if;

  begin
    insert into public.local_model_governance_application_records (
      application_decision_key,
      application_idempotency_key,
      schema_revision,
      application_policy_revision,
      source_governance_persistence_key,
      canonical_record_key,
      canonical_record_revision,
      canonical_outcome,
      candidate_id,
      candidate_tier,
      observed_revision,
      application_status,
      artifact_selection_review_eligible,
      application_actor_user_id,
      application_envelope
    ) values (
      v_application_decision_key,
      v_application_idempotency_key,
      (p_application ->> 'schemaRevision')::integer,
      (p_application ->> 'applicationPolicyRevision')::integer,
      v_source_governance_persistence_key,
      p_application ->> 'canonicalRecordKey',
      (p_application ->> 'canonicalRecordRevision')::integer,
      p_application ->> 'canonicalOutcome',
      p_application ->> 'candidateId',
      p_application ->> 'candidateTier',
      p_application ->> 'observedRevision',
      p_application ->> 'applicationStatus',
      (p_application ->> 'artifactSelectionReviewEligible')::boolean,
      v_actor_user_id,
      p_application
    )
    returning id into v_record_id;

    return query
      select 'inserted'::text, v_record_id, v_application_decision_key;
    return;
  exception
    when unique_violation then
      select
        pg_catalog.count(*)::integer,
        pg_catalog.min(existing.id),
        pg_catalog.min(existing.application_decision_key),
        pg_catalog.bool_and(
          existing.application_decision_key = v_application_decision_key
          and existing.application_idempotency_key = v_application_idempotency_key
          and existing.schema_revision = (p_application ->> 'schemaRevision')::integer
          and existing.application_policy_revision = (p_application ->> 'applicationPolicyRevision')::integer
          and existing.source_governance_persistence_key = v_source_governance_persistence_key
          and existing.canonical_record_key = p_application ->> 'canonicalRecordKey'
          and existing.canonical_record_revision = (p_application ->> 'canonicalRecordRevision')::integer
          and existing.canonical_outcome = p_application ->> 'canonicalOutcome'
          and existing.candidate_id = p_application ->> 'candidateId'
          and existing.candidate_tier = p_application ->> 'candidateTier'
          and existing.observed_revision = p_application ->> 'observedRevision'
          and existing.application_status = p_application ->> 'applicationStatus'
          and existing.artifact_selection_review_eligible = (p_application ->> 'artifactSelectionReviewEligible')::boolean
          and existing.application_actor_user_id = v_actor_user_id
          and existing.application_envelope = p_application
        )
      into
        v_existing_count,
        v_existing_id,
        v_existing_decision_key,
        v_existing_identical
      from public.local_model_governance_application_records as existing
      where existing.application_decision_key = v_application_decision_key
        or existing.application_idempotency_key = v_application_idempotency_key;

      if v_existing_count = 1 and v_existing_identical then
        return query
          select
            'identical-existing-application-envelope'::text,
            v_existing_id,
            v_existing_decision_key;
        return;
      end if;

      raise exception using errcode = '23505', message = 'governance-application-conflicting-duplicate';
  end;
end;
$$;

create or replace function private.reject_local_model_governance_application_record_mutation()
returns trigger
language plpgsql
set search_path to ''
as $$
begin
  raise exception using errcode = '55000', message = 'local-model-governance-application-records-immutable';
end;
$$;

create trigger local_model_governance_application_records_immutable
before update or delete on public.local_model_governance_application_records
for each row execute function private.reject_local_model_governance_application_record_mutation();

revoke execute on function private.has_local_model_governance_application_permission() from public;
revoke execute on function private.has_local_model_governance_application_permission() from anon;
revoke execute on function private.has_local_model_governance_application_permission() from authenticated;
revoke execute on function private.has_local_model_governance_application_permission() from service_role;
grant usage on schema private to authenticated;
grant execute on function private.has_local_model_governance_application_permission() to authenticated;

revoke execute on function private.validate_local_model_governance_application_envelope(jsonb) from public;
revoke execute on function private.validate_local_model_governance_application_envelope(jsonb) from anon;
revoke execute on function private.validate_local_model_governance_application_envelope(jsonb) from authenticated;
revoke execute on function private.validate_local_model_governance_application_envelope(jsonb) from service_role;

revoke execute on function private.reject_local_model_governance_application_record_mutation() from public;
revoke execute on function private.reject_local_model_governance_application_record_mutation() from anon;
revoke execute on function private.reject_local_model_governance_application_record_mutation() from authenticated;
revoke execute on function private.reject_local_model_governance_application_record_mutation() from service_role;

revoke execute on function public.append_local_model_governance_application_record(jsonb) from public;
revoke execute on function public.append_local_model_governance_application_record(jsonb) from anon;
revoke execute on function public.append_local_model_governance_application_record(jsonb) from service_role;
grant execute on function public.append_local_model_governance_application_record(jsonb) to authenticated;

revoke all privileges on table public.local_model_governance_application_records from public;
revoke all privileges on table public.local_model_governance_application_records from anon;
revoke all privileges on table public.local_model_governance_application_records from authenticated;
revoke all privileges on table public.local_model_governance_application_records from service_role;
grant select on table public.local_model_governance_application_records to authenticated;

revoke all privileges on sequence public.local_model_governance_application_records_id_seq from public;
revoke all privileges on sequence public.local_model_governance_application_records_id_seq from anon;
revoke all privileges on sequence public.local_model_governance_application_records_id_seq from authenticated;
revoke all privileges on sequence public.local_model_governance_application_records_id_seq from service_role;
