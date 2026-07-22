insert into private.local_model_governance_permissions (permission_id, permission_revision)
values ('verify-local-model-artifact-selection', 1);
insert into private.local_model_governance_role_permissions (role_id, permission_id, mapping_revision)
values ('model-governance-reviewer', 'verify-local-model-artifact-selection', 1);

create or replace function private.has_local_model_artifact_selection_verification_permission()
returns boolean language sql stable security definer set search_path = '' as $$
  select case when auth.uid() is null then false else exists (
    select 1 from private.local_model_governance_user_roles ur
    join private.local_model_governance_role_permissions rp on rp.role_id = ur.role_id
    where ur.user_id = auth.uid() and ur.role_id = 'model-governance-reviewer'
      and rp.permission_id = 'verify-local-model-artifact-selection'
  ) end;
$$;

drop policy if exists local_model_artifact_selection_records_reviewer_select on public.local_model_governance_artifact_selection_records;
revoke select on table public.local_model_governance_artifact_selection_records from authenticated;

create or replace function public.verify_local_model_governance_artifact_selection_record(p_selection_decision_key text)
returns table (
  verification_status text, selection_decision_key text, selection_idempotency_key text,
  schema_revision integer, selection_policy_revision integer, bridge_decision_key text,
  source_application_decision_key text, source_governance_persistence_key text,
  canonical_record_key text, canonical_record_revision integer, canonical_outcome text,
  candidate_id text, candidate_tier text, observed_revision text, selected_option_id text,
  selection_decision text, selection_status text, human_selection_recorded boolean,
  selection_scope jsonb, created_at timestamptz
)
language plpgsql security definer set search_path to '' as $$
declare v_actor uuid;
begin
  v_actor := auth.uid();
  if v_actor is null then raise exception using errcode = '28000', message = 'artifact-selection-verification-authentication-required'; end if;
  if not private.has_local_model_artifact_selection_verification_permission() then raise exception using errcode = '42501', message = 'artifact-selection-verification-authorization-required'; end if;
  if coalesce(p_selection_decision_key, '') = '' or p_selection_decision_key <> btrim(p_selection_decision_key) then raise exception using errcode = '22023', message = 'artifact-selection-verification-key-invalid'; end if;
  return query select
    'verified-record'::text, r.selection_decision_key, r.selection_idempotency_key,
    r.schema_revision, r.selection_policy_revision, r.bridge_decision_key,
    r.source_application_decision_key, r.source_governance_persistence_key,
    r.canonical_record_key, r.canonical_record_revision, r.canonical_outcome,
    r.candidate_id, r.candidate_tier, r.observed_revision, r.selected_option_id,
    r.selection_decision, r.selection_status, r.human_selection_recorded,
    r.selection_scope, r.created_at
  from public.local_model_governance_artifact_selection_records r
  where r.selection_decision_key = p_selection_decision_key and r.selection_actor_user_id = v_actor;
end;
$$;

revoke execute on function private.has_local_model_artifact_selection_verification_permission() from public, anon, authenticated, service_role;
grant usage on schema private to authenticated;
grant execute on function private.has_local_model_artifact_selection_verification_permission() to authenticated;
revoke execute on function public.verify_local_model_governance_artifact_selection_record(text) from public, anon, authenticated, service_role;
grant execute on function public.verify_local_model_governance_artifact_selection_record(text) to authenticated;
