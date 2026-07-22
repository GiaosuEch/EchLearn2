insert into private.local_model_governance_permissions (permission_id, permission_revision)
values ('record-local-model-artifact-selection', 1);

insert into private.local_model_governance_role_permissions (role_id, permission_id, mapping_revision)
values ('model-governance-reviewer', 'record-local-model-artifact-selection', 1);

create or replace function private.has_local_model_artifact_selection_permission()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case when auth.uid() is null then false else exists (
    select 1 from private.local_model_governance_user_roles as ur
    inner join private.local_model_governance_role_permissions as rp on rp.role_id = ur.role_id
    where ur.user_id = auth.uid()
      and ur.role_id = 'model-governance-reviewer'
      and rp.permission_id = 'record-local-model-artifact-selection'
  ) end;
$$;

create table public.local_model_governance_artifact_selection_records (
  id bigint generated always as identity primary key,
  selection_decision_key text not null,
  selection_idempotency_key text not null,
  schema_revision integer not null,
  selection_policy_revision integer not null,
  bridge_decision_key text not null,
  source_application_decision_key text not null references public.local_model_governance_application_records(application_decision_key) on update restrict on delete restrict,
  source_governance_persistence_key text not null references public.local_model_governance_records(persistence_key) on update restrict on delete restrict,
  canonical_record_key text not null,
  canonical_record_revision integer not null,
  canonical_outcome text not null,
  candidate_id text not null,
  candidate_tier text not null,
  observed_revision text not null,
  selected_option_id text not null,
  selection_decision text not null,
  selection_status text not null,
  human_selection_recorded boolean not null,
  selection_actor_user_id uuid not null,
  selection_scope jsonb not null,
  selection_envelope jsonb not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint local_model_artifact_selection_records_schema check (schema_revision = 1),
  constraint local_model_artifact_selection_records_policy check (selection_policy_revision = 1),
  constraint local_model_artifact_selection_records_revision check (canonical_record_revision > 0),
  constraint local_model_artifact_selection_records_outcome check (canonical_outcome = 'finalized-proceed'),
  constraint local_model_artifact_selection_records_decision check (selection_decision = 'select' and selection_status = 'selection-recorded' and human_selection_recorded = true),
  constraint local_model_artifact_selection_records_tier check (candidate_tier in ('light', 'standard', 'pro')),
  constraint local_model_artifact_selection_records_candidate_matrix check (
    (candidate_id = 'qwen3-0-6b-candidate' and candidate_tier = 'light' and observed_revision = 'c1899de289a04d12100db370d81485cdf75e47ca') or
    (candidate_id = 'qwen3-1-7b-candidate' and candidate_tier = 'standard' and observed_revision = '70d244cc86ccca08cf5af4e1e306ecf908b1ad5e') or
    (candidate_id = 'qwen3-4b-candidate' and candidate_tier = 'pro' and observed_revision = '1cfa9a7208912126459214e8b04321603b3df60c')
  ),
  constraint local_model_artifact_selection_records_scope_object check (pg_catalog.jsonb_typeof(selection_scope) = 'object'),
  constraint local_model_artifact_selection_records_envelope_object check (pg_catalog.jsonb_typeof(selection_envelope) = 'object'),
  constraint local_model_artifact_selection_records_decision_key_unique unique (selection_decision_key),
  constraint local_model_artifact_selection_records_idempotency_key_unique unique (selection_idempotency_key)
);

alter table public.local_model_governance_artifact_selection_records enable row level security;
alter table public.local_model_governance_artifact_selection_records force row level security;
create policy local_model_artifact_selection_records_reviewer_select
on public.local_model_governance_artifact_selection_records for select to authenticated
using (private.has_local_model_artifact_selection_permission());

create or replace function private.validate_local_model_artifact_selection_envelope(p_selection jsonb)
returns void language plpgsql set search_path to '' as $$
declare
  v_keys text[] := array['selectionDecisionKey','selectionIdempotencyKey','schemaRevision','selectionPolicyRevision','operation','bridgeDecisionKey','sourceApplicationDecisionKey','sourceGovernancePersistenceKey','canonicalRecordKey','canonicalRecordRevision','canonicalOutcome','candidateId','candidateTier','observedRevision','selectedOptionId','selectionDecision','selectionStatus','humanSelectionRecorded','selectionScope','immutable','appendOnly','decisionPersisted','artifactSelected','artifactApproved','modelApproved','licenseApproved','checksumVerified','benchmarkVerified','downloadable','runtimeReady','modelActive'];
begin
  if pg_catalog.jsonb_typeof(p_selection) <> 'object'
    or (select array_agg(key order by key) from jsonb_object_keys(p_selection) as key) <> (select array_agg(key order by key) from unnest(v_keys) as key) then
    raise exception using errcode = '22023', message = 'artifact-selection-envelope-fields-invalid';
  end if;
  if coalesce(p_selection ->> 'selectionDecisionKey','') = '' or coalesce(p_selection ->> 'sourceApplicationDecisionKey','') = ''
    or coalesce(p_selection ->> 'sourceGovernancePersistenceKey','') = '' or coalesce(p_selection ->> 'selectedOptionId','') = ''
    or p_selection ->> 'operation' <> 'append' or p_selection ->> 'canonicalOutcome' <> 'finalized-proceed'
    or p_selection ->> 'selectionDecision' <> 'select' or p_selection ->> 'selectionStatus' <> 'selection-recorded'
    or p_selection -> 'humanSelectionRecorded' <> 'true'::jsonb or p_selection -> 'immutable' <> 'true'::jsonb or p_selection -> 'appendOnly' <> 'true'::jsonb
    or p_selection -> 'decisionPersisted' <> 'false'::jsonb or p_selection -> 'artifactSelected' <> 'false'::jsonb or p_selection -> 'artifactApproved' <> 'false'::jsonb
    or p_selection -> 'modelApproved' <> 'false'::jsonb or p_selection -> 'licenseApproved' <> 'false'::jsonb or p_selection -> 'checksumVerified' <> 'false'::jsonb
    or p_selection -> 'benchmarkVerified' <> 'false'::jsonb or p_selection -> 'downloadable' <> 'false'::jsonb or p_selection -> 'runtimeReady' <> 'false'::jsonb or p_selection -> 'modelActive' <> 'false'::jsonb
    or pg_catalog.jsonb_typeof(p_selection -> 'selectionScope') <> 'object' then
    raise exception using errcode = '22023', message = 'artifact-selection-envelope-contract-invalid';
  end if;
end;
$$;

create or replace function public.append_local_model_governance_artifact_selection_record(p_selection jsonb)
returns table (result_status text, record_id bigint, selection_decision_key text)
language plpgsql security definer set search_path to '' as $$
declare v_actor uuid; v_application public.local_model_governance_application_records%rowtype; v_existing public.local_model_governance_artifact_selection_records%rowtype;
begin
  v_actor := auth.uid();
  if v_actor is null then raise exception using errcode = '28000', message = 'artifact-selection-authentication-required'; end if;
  if not private.has_local_model_artifact_selection_permission() then raise exception using errcode = '42501', message = 'artifact-selection-authorization-required'; end if;
  perform private.validate_local_model_artifact_selection_envelope(p_selection);
  select * into v_application from public.local_model_governance_application_records where application_decision_key = p_selection ->> 'sourceApplicationDecisionKey' for key share;
  if not found or v_application.source_governance_persistence_key is distinct from p_selection ->> 'sourceGovernancePersistenceKey'
    or v_application.candidate_id is distinct from p_selection ->> 'candidateId' or v_application.candidate_tier is distinct from p_selection ->> 'candidateTier'
    or v_application.observed_revision is distinct from p_selection ->> 'observedRevision' or v_application.canonical_record_key is distinct from p_selection ->> 'canonicalRecordKey'
    or v_application.canonical_record_revision is distinct from (p_selection ->> 'canonicalRecordRevision')::integer
    or v_application.canonical_outcome <> 'finalized-proceed' or v_application.artifact_selection_review_eligible <> true then
    raise exception using errcode = '22023', message = 'artifact-selection-source-record-mismatch';
  end if;
  begin
    insert into public.local_model_governance_artifact_selection_records (selection_decision_key,selection_idempotency_key,schema_revision,selection_policy_revision,bridge_decision_key,source_application_decision_key,source_governance_persistence_key,canonical_record_key,canonical_record_revision,canonical_outcome,candidate_id,candidate_tier,observed_revision,selected_option_id,selection_decision,selection_status,human_selection_recorded,selection_actor_user_id,selection_scope,selection_envelope)
    values (p_selection ->> 'selectionDecisionKey',p_selection ->> 'selectionIdempotencyKey',(p_selection ->> 'schemaRevision')::integer,(p_selection ->> 'selectionPolicyRevision')::integer,p_selection ->> 'bridgeDecisionKey',p_selection ->> 'sourceApplicationDecisionKey',p_selection ->> 'sourceGovernancePersistenceKey',p_selection ->> 'canonicalRecordKey',(p_selection ->> 'canonicalRecordRevision')::integer,p_selection ->> 'canonicalOutcome',p_selection ->> 'candidateId',p_selection ->> 'candidateTier',p_selection ->> 'observedRevision',p_selection ->> 'selectedOptionId',p_selection ->> 'selectionDecision',p_selection ->> 'selectionStatus',(p_selection ->> 'humanSelectionRecorded')::boolean,v_actor,p_selection -> 'selectionScope',p_selection)
    returning id, selection_decision_key into record_id, selection_decision_key;
    result_status := 'inserted'; return next;
  exception when unique_violation then
    select * into v_existing from public.local_model_governance_artifact_selection_records where selection_decision_key = p_selection ->> 'selectionDecisionKey' or selection_idempotency_key = p_selection ->> 'selectionIdempotencyKey';
    if found and v_existing.selection_actor_user_id = v_actor and v_existing.selection_envelope = p_selection then
      result_status := 'identical-existing-selection-envelope'; record_id := v_existing.id; selection_decision_key := v_existing.selection_decision_key; return next;
    end if;
    raise exception using errcode = '23505', message = 'artifact-selection-conflicting-duplicate';
  end;
end;
$$;

create or replace function private.reject_local_model_artifact_selection_record_mutation() returns trigger language plpgsql set search_path to '' as $$ begin raise exception using errcode = '55000', message = 'local-model-artifact-selection-records-immutable'; end; $$;
create trigger local_model_artifact_selection_records_immutable before update or delete on public.local_model_governance_artifact_selection_records for each row execute function private.reject_local_model_artifact_selection_record_mutation();

revoke all privileges on table public.local_model_governance_artifact_selection_records from public, anon, authenticated, service_role;
revoke all privileges on sequence public.local_model_governance_artifact_selection_records_id_seq from public, anon, authenticated, service_role;
revoke execute on function private.has_local_model_artifact_selection_permission() from public, anon, authenticated, service_role;
grant usage on schema private to authenticated;
grant execute on function private.has_local_model_artifact_selection_permission() to authenticated;
revoke execute on function private.validate_local_model_artifact_selection_envelope(jsonb) from public, anon, authenticated, service_role;
revoke execute on function private.reject_local_model_artifact_selection_record_mutation() from public, anon, authenticated, service_role;
revoke execute on function public.append_local_model_governance_artifact_selection_record(jsonb) from public, anon, authenticated, service_role;
grant select on table public.local_model_governance_artifact_selection_records to authenticated;
grant execute on function public.append_local_model_governance_artifact_selection_record(jsonb) to authenticated;
