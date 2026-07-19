create table public.local_model_governance_records (
  id bigint generated always as identity primary key,
  persistence_key text not null,
  idempotency_key text not null,
  schema_revision integer not null,
  policy_revision integer not null,
  canonical_record_key text not null,
  canonical_record_revision integer not null,
  canonical_outcome text not null,
  candidate_id text not null,
  candidate_tier text not null,
  model_class text not null,
  exact_model_name text not null,
  official_repository_id text not null,
  observed_revision text not null,
  actor_user_id uuid not null,
  reviewed_at timestamptz not null,
  persistence_envelope jsonb not null,
  constraint local_model_governance_records_persistence_key_not_empty
    check (char_length(persistence_key) > 0 and persistence_key = btrim(persistence_key)),
  constraint local_model_governance_records_idempotency_key_not_empty
    check (char_length(idempotency_key) > 0 and idempotency_key = btrim(idempotency_key)),
  constraint local_model_governance_records_canonical_record_key_not_empty
    check (char_length(canonical_record_key) > 0 and canonical_record_key = btrim(canonical_record_key)),
  constraint local_model_governance_records_observed_revision_not_empty
    check (char_length(observed_revision) > 0 and observed_revision = btrim(observed_revision)),
  constraint local_model_governance_records_schema_revision_positive check (schema_revision > 0),
  constraint local_model_governance_records_policy_revision_positive check (policy_revision > 0),
  constraint local_model_governance_records_record_revision_positive check (canonical_record_revision > 0),
  constraint local_model_governance_records_outcome_allowed check (
    canonical_outcome in ('finalized-proceed', 'finalized-rejected', 'finalized-more-evidence')
  ),
  constraint local_model_governance_records_tier_allowed check (
    candidate_tier in ('light', 'standard', 'pro')
  ),
  constraint local_model_governance_records_candidate_matrix check (
    (
      candidate_id = 'qwen3-0-6b-candidate'
      and candidate_tier = 'light'
      and model_class = '0.6B'
      and exact_model_name = 'Qwen3-0.6B'
      and official_repository_id = 'Qwen/Qwen3-0.6B'
      and observed_revision = 'c1899de289a04d12100db370d81485cdf75e47ca'
    )
    or (
      candidate_id = 'qwen3-1-7b-candidate'
      and candidate_tier = 'standard'
      and model_class = '1.7B'
      and exact_model_name = 'Qwen3-1.7B'
      and official_repository_id = 'Qwen/Qwen3-1.7B'
      and observed_revision = '70d244cc86ccca08cf5af4e1e306ecf908b1ad5e'
    )
    or (
      candidate_id = 'qwen3-4b-candidate'
      and candidate_tier = 'pro'
      and model_class = '4B'
      and exact_model_name = 'Qwen3-4B'
      and official_repository_id = 'Qwen/Qwen3-4B'
      and observed_revision = '1cfa9a7208912126459214e8b04321603b3df60c'
    )
  ),
  constraint local_model_governance_records_envelope_is_object
    check (pg_catalog.jsonb_typeof(persistence_envelope) = 'object'),
  constraint local_model_governance_records_persistence_key_unique unique (persistence_key),
  constraint local_model_governance_records_idempotency_key_unique unique (idempotency_key),
  constraint local_model_governance_records_record_revision_unique
    unique (canonical_record_key, canonical_record_revision)
);

create index local_model_governance_records_candidate_id_idx
  on public.local_model_governance_records (candidate_id);
create index local_model_governance_records_actor_user_id_idx
  on public.local_model_governance_records (actor_user_id);
create index local_model_governance_records_reviewed_at_idx
  on public.local_model_governance_records (reviewed_at);
create index local_model_governance_records_canonical_outcome_idx
  on public.local_model_governance_records (canonical_outcome);

alter table public.local_model_governance_records enable row level security;
alter table public.local_model_governance_records force row level security;

revoke all privileges on table public.local_model_governance_records from public;
revoke all privileges on table public.local_model_governance_records from anon;
revoke insert, update, delete, truncate on table public.local_model_governance_records from authenticated;
grant select on table public.local_model_governance_records to authenticated;

revoke all privileges on sequence public.local_model_governance_records_id_seq from public;
revoke all privileges on sequence public.local_model_governance_records_id_seq from anon;
revoke all privileges on sequence public.local_model_governance_records_id_seq from authenticated;

create policy local_model_governance_records_reviewer_select
on public.local_model_governance_records
for select
to authenticated
using (private.has_local_model_governance_permission());

create or replace function private.local_model_governance_json_has_exact_keys(
  p_value jsonb,
  p_expected text[]
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    pg_catalog.jsonb_typeof(p_value) = 'object'
    and p_value ?& p_expected
    and not exists (
      select 1
      from pg_catalog.jsonb_object_keys(p_value) as object_key(key_name)
      where not (object_key.key_name = any (p_expected))
    ),
    false
  );
$$;

create or replace function private.validate_local_model_governance_persistence_envelope(
  p_envelope jsonb,
  p_actor_user_id uuid
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_record jsonb;
  v_scope jsonb;
  v_decisions jsonb;
  v_record_outcome text;
  v_canonical_outcome text;
  v_candidate_id text;
  v_candidate_tier text;
  v_model_class text;
  v_exact_model_name text;
  v_repository_id text;
  v_observed_revision text;
  v_record_revision integer;
  v_evidence_revision integer;
  v_decision_policy_revision integer;
  v_record_policy_revision integer;
  v_reviewed_at timestamptz;
  v_expected_record_key text;
  v_expected_persistence_key text;
  v_expected_idempotency_key text;
  v_requirement_count integer;
  v_distinct_requirement_count integer;
  v_proceed_count integer;
  v_reject_count integer;
  v_more_evidence_count integer;
begin
  if p_actor_user_id is null then
    raise exception using errcode = '28000', message = 'governance-persistence-authentication-required';
  end if;

  if not private.local_model_governance_json_has_exact_keys(
    p_envelope,
    array[
      'persistenceKey', 'idempotencyKey', 'schemaRevision', 'policyRevision',
      'operation', 'duplicatePolicy', 'canonicalRecord', 'canonicalRecordKey',
      'canonicalRecordRevision', 'canonicalOutcome', 'candidateId', 'candidateTier',
      'createdFromReviewedAt', 'immutable', 'appendOnly', 'updateAllowed',
      'deleteAllowed', 'clientDeleteAllowed', 'clientOverwriteAllowed',
      'persistenceBoundaryOnly'
    ]::text[]
  ) then
    raise exception using errcode = '22023', message = 'governance-persistence-envelope-fields-invalid';
  end if;

  if not private.local_model_governance_json_has_exact_keys(
    p_envelope -> 'duplicatePolicy',
    array['identical', 'conflicting']::text[]
  )
  or p_envelope #>> '{duplicatePolicy,identical}' is distinct from 'idempotent-if-identical'
  or p_envelope #>> '{duplicatePolicy,conflicting}' is distinct from 'reject-if-conflicting' then
    raise exception using errcode = '22023', message = 'governance-persistence-duplicate-policy-invalid';
  end if;

  v_record := p_envelope -> 'canonicalRecord';
  if not private.local_model_governance_json_has_exact_keys(
    v_record,
    array[
      'recordKey', 'recordRevision', 'candidateId', 'candidateTier', 'scope',
      'decisions', 'actorSubjectId', 'actorRole', 'reviewedAt', 'outcome',
      'allDecisionsExplicit', 'recordValidForCurrentScope',
      'eligibleForTrustedPersistence', 'eligibleForArtifactSelectionRecordingReview',
      'decisionRecordOnly', 'persisted', 'signed', 'appliedToArtifactSelection',
      'modelApproved', 'licenseApproved', 'artifactSelected', 'artifactApproved',
      'checksumVerified', 'benchmarkVerified', 'downloadable', 'runtimeReady',
      'modelActive'
    ]::text[]
  ) then
    raise exception using errcode = '22023', message = 'governance-persistence-canonical-record-fields-invalid';
  end if;

  v_scope := v_record -> 'scope';
  if not private.local_model_governance_json_has_exact_keys(
    v_scope,
    array[
      'candidateId', 'candidateTier', 'modelClass', 'exactModelName',
      'officialRepositoryId', 'observedRevision', 'tokenizerLicenseClosureStatus',
      'acceptableUseClosureStatus', 'derivedHostingClosureStatus',
      'quantizationClosureStatus', 'evidenceClosureRevision',
      'governanceDecisionPolicyRevision', 'governanceDecisionRecordPolicyRevision',
      'recordRevision'
    ]::text[]
  ) then
    raise exception using errcode = '22023', message = 'governance-persistence-record-scope-fields-invalid';
  end if;

  v_decisions := v_record -> 'decisions';
  if pg_catalog.jsonb_typeof(v_decisions) <> 'array'
    or pg_catalog.jsonb_array_length(v_decisions) <> 4 then
    raise exception using errcode = '22023', message = 'governance-persistence-decision-count-invalid';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_array_elements(v_decisions) as decision_item(value)
    where not private.local_model_governance_json_has_exact_keys(
      decision_item.value,
      array[
        'requirementId', 'evidenceClosureStatus', 'decision',
        'explicitlyRecorded', 'blockers', 'warnings'
      ]::text[]
    )
  ) then
    raise exception using errcode = '22023', message = 'governance-persistence-decision-fields-invalid';
  end if;

  select
    pg_catalog.count(*)::integer,
    pg_catalog.count(distinct decision_item.value ->> 'requirementId')::integer,
    pg_catalog.count(*) filter (where decision_item.value ->> 'decision' = 'proceed')::integer,
    pg_catalog.count(*) filter (where decision_item.value ->> 'decision' = 'reject')::integer,
    pg_catalog.count(*) filter (where decision_item.value ->> 'decision' = 'request-more-evidence')::integer
  into
    v_requirement_count,
    v_distinct_requirement_count,
    v_proceed_count,
    v_reject_count,
    v_more_evidence_count
  from pg_catalog.jsonb_array_elements(v_decisions) as decision_item(value);

  if v_requirement_count <> 4
    or v_distinct_requirement_count <> 4
    or exists (
      select 1
      from pg_catalog.jsonb_array_elements(v_decisions) as decision_item(value)
      where decision_item.value ->> 'requirementId' not in (
        'tokenizer-license-scope',
        'acceptable-use-scope',
        'derived-artifact-hosting',
        'quantization-conversion'
      )
    )
    or exists (
      select required.requirement_id
      from pg_catalog.unnest(array[
        'tokenizer-license-scope',
        'acceptable-use-scope',
        'derived-artifact-hosting',
        'quantization-conversion'
      ]::text[]) as required(requirement_id)
      where not exists (
        select 1
        from pg_catalog.jsonb_array_elements(v_decisions) as decision_item(value)
        where decision_item.value ->> 'requirementId' = required.requirement_id
      )
    ) then
    raise exception using errcode = '22023', message = 'governance-persistence-requirement-set-invalid';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_array_elements(v_decisions) as decision_item(value)
    where decision_item.value ->> 'decision' = 'not-recorded'
      or coalesce(decision_item.value ->> 'decision', '') not in (
        'proceed', 'reject', 'request-more-evidence'
      )
      or decision_item.value ->> 'explicitlyRecorded' is distinct from 'true'
      or coalesce(decision_item.value ->> 'evidenceClosureStatus', '') not in (
        'unresolved', 'factual-evidence-collected', 'sufficient-for-human-decision',
        'no-separate-policy-located', 'conflicting-evidence', 'rejected'
      )
      or pg_catalog.jsonb_typeof(decision_item.value -> 'blockers') is distinct from 'array'
      or pg_catalog.jsonb_typeof(decision_item.value -> 'warnings') is distinct from 'array'
  ) then
    raise exception using errcode = '22023', message = 'governance-persistence-decision-invalid';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_array_elements(v_decisions) as decision_item(value)
    where exists (
        select 1
        from pg_catalog.jsonb_array_elements(decision_item.value -> 'blockers') as blocker(value)
        where pg_catalog.jsonb_typeof(blocker.value) is distinct from 'string'
      )
      or exists (
        select 1
        from pg_catalog.jsonb_array_elements(decision_item.value -> 'warnings') as warning(value)
        where pg_catalog.jsonb_typeof(warning.value) is distinct from 'string'
      )
  ) then
    raise exception using errcode = '22023', message = 'governance-persistence-decision-message-invalid';
  end if;

  if coalesce(p_envelope ->> 'schemaRevision', '') !~ '^[1-9][0-9]*$'
    or coalesce(p_envelope ->> 'policyRevision', '') !~ '^[1-9][0-9]*$'
    or (p_envelope ->> 'schemaRevision')::integer <> 1
    or (p_envelope ->> 'policyRevision')::integer <> 1
    or p_envelope ->> 'operation' is distinct from 'append'
    or p_envelope ->> 'immutable' is distinct from 'true'
    or p_envelope ->> 'appendOnly' is distinct from 'true'
    or p_envelope ->> 'updateAllowed' is distinct from 'false'
    or p_envelope ->> 'deleteAllowed' is distinct from 'false'
    or p_envelope ->> 'clientDeleteAllowed' is distinct from 'false'
    or p_envelope ->> 'clientOverwriteAllowed' is distinct from 'false'
    or p_envelope ->> 'persistenceBoundaryOnly' is distinct from 'true' then
    raise exception using errcode = '22023', message = 'governance-persistence-envelope-semantics-invalid';
  end if;

  if coalesce(v_record ->> 'recordRevision', '') !~ '^[1-9][0-9]*$'
    or coalesce(v_scope ->> 'recordRevision', '') !~ '^[1-9][0-9]*$'
    or coalesce(v_scope ->> 'evidenceClosureRevision', '') !~ '^[1-9][0-9]*$'
    or coalesce(v_scope ->> 'governanceDecisionPolicyRevision', '') !~ '^[1-9][0-9]*$'
    or coalesce(v_scope ->> 'governanceDecisionRecordPolicyRevision', '') !~ '^[1-9][0-9]*$' then
    raise exception using errcode = '22023', message = 'governance-persistence-record-revision-invalid';
  end if;

  v_record_revision := (v_record ->> 'recordRevision')::integer;
  v_evidence_revision := (v_scope ->> 'evidenceClosureRevision')::integer;
  v_decision_policy_revision := (v_scope ->> 'governanceDecisionPolicyRevision')::integer;
  v_record_policy_revision := (v_scope ->> 'governanceDecisionRecordPolicyRevision')::integer;

  if (v_scope ->> 'recordRevision')::integer <> v_record_revision
    or v_evidence_revision <> 1
    or v_decision_policy_revision <> 1
    or v_record_policy_revision <> 1 then
    raise exception using errcode = '22023', message = 'governance-persistence-record-policy-revision-mismatch';
  end if;

  if v_record ->> 'allDecisionsExplicit' is distinct from 'true'
    or v_record ->> 'recordValidForCurrentScope' is distinct from 'true'
    or v_record ->> 'eligibleForTrustedPersistence' is distinct from 'true'
    or v_record ->> 'decisionRecordOnly' is distinct from 'true'
    or v_record ->> 'persisted' is distinct from 'false'
    or v_record ->> 'signed' is distinct from 'false'
    or v_record ->> 'appliedToArtifactSelection' is distinct from 'false'
    or v_record ->> 'modelApproved' is distinct from 'false'
    or v_record ->> 'licenseApproved' is distinct from 'false'
    or v_record ->> 'artifactSelected' is distinct from 'false'
    or v_record ->> 'artifactApproved' is distinct from 'false'
    or v_record ->> 'checksumVerified' is distinct from 'false'
    or v_record ->> 'benchmarkVerified' is distinct from 'false'
    or v_record ->> 'downloadable' is distinct from 'false'
    or v_record ->> 'runtimeReady' is distinct from 'false'
    or v_record ->> 'modelActive' is distinct from 'false' then
    raise exception using errcode = '22023', message = 'governance-persistence-record-state-invalid';
  end if;

  v_record_outcome := v_record ->> 'outcome';
  v_canonical_outcome := p_envelope ->> 'canonicalOutcome';
  if not (
    (
      v_record_outcome is not distinct from 'proceed'
      and v_canonical_outcome is not distinct from 'finalized-proceed'
      and v_proceed_count = 4
      and v_reject_count = 0
      and v_more_evidence_count = 0
      and v_record ->> 'eligibleForArtifactSelectionRecordingReview' is not distinct from 'true'
    )
    or (
      v_record_outcome is not distinct from 'rejected'
      and v_canonical_outcome is not distinct from 'finalized-rejected'
      and v_reject_count > 0
      and v_record ->> 'eligibleForArtifactSelectionRecordingReview' is not distinct from 'false'
    )
    or (
      v_record_outcome is not distinct from 'more-evidence'
      and v_canonical_outcome is not distinct from 'finalized-more-evidence'
      and v_reject_count = 0
      and v_more_evidence_count > 0
      and v_record ->> 'eligibleForArtifactSelectionRecordingReview' is not distinct from 'false'
    )
  ) then
    raise exception using errcode = '22023', message = 'governance-persistence-outcome-inconsistent';
  end if;

  v_candidate_id := v_scope ->> 'candidateId';
  v_candidate_tier := v_scope ->> 'candidateTier';
  v_model_class := v_scope ->> 'modelClass';
  v_exact_model_name := v_scope ->> 'exactModelName';
  v_repository_id := v_scope ->> 'officialRepositoryId';
  v_observed_revision := v_scope ->> 'observedRevision';

  if v_record ->> 'candidateId' is distinct from v_candidate_id
    or v_record ->> 'candidateTier' is distinct from v_candidate_tier
    or p_envelope ->> 'candidateId' is distinct from v_candidate_id
    or p_envelope ->> 'candidateTier' is distinct from v_candidate_tier then
    raise exception using errcode = '22023', message = 'governance-persistence-candidate-scope-mismatch';
  end if;

  if not (
    (
      v_candidate_id is not distinct from 'qwen3-0-6b-candidate'
      and v_candidate_tier is not distinct from 'light'
      and v_model_class is not distinct from '0.6B'
      and v_exact_model_name is not distinct from 'Qwen3-0.6B'
      and v_repository_id is not distinct from 'Qwen/Qwen3-0.6B'
      and v_observed_revision is not distinct from 'c1899de289a04d12100db370d81485cdf75e47ca'
    )
    or (
      v_candidate_id is not distinct from 'qwen3-1-7b-candidate'
      and v_candidate_tier is not distinct from 'standard'
      and v_model_class is not distinct from '1.7B'
      and v_exact_model_name is not distinct from 'Qwen3-1.7B'
      and v_repository_id is not distinct from 'Qwen/Qwen3-1.7B'
      and v_observed_revision is not distinct from '70d244cc86ccca08cf5af4e1e306ecf908b1ad5e'
    )
    or (
      v_candidate_id is not distinct from 'qwen3-4b-candidate'
      and v_candidate_tier is not distinct from 'pro'
      and v_model_class is not distinct from '4B'
      and v_exact_model_name is not distinct from 'Qwen3-4B'
      and v_repository_id is not distinct from 'Qwen/Qwen3-4B'
      and v_observed_revision is not distinct from '1cfa9a7208912126459214e8b04321603b3df60c'
    )
  ) then
    raise exception using errcode = '22023', message = 'governance-persistence-candidate-identity-invalid';
  end if;

  if coalesce(v_scope ->> 'tokenizerLicenseClosureStatus', '') not in (
      'unresolved', 'factual-evidence-collected', 'sufficient-for-human-decision',
      'no-separate-policy-located', 'conflicting-evidence', 'rejected'
    )
    or coalesce(v_scope ->> 'acceptableUseClosureStatus', '') not in (
      'unresolved', 'factual-evidence-collected', 'sufficient-for-human-decision',
      'no-separate-policy-located', 'conflicting-evidence', 'rejected'
    )
    or coalesce(v_scope ->> 'derivedHostingClosureStatus', '') not in (
      'unresolved', 'factual-evidence-collected', 'sufficient-for-human-decision',
      'no-separate-policy-located', 'conflicting-evidence', 'rejected'
    )
    or coalesce(v_scope ->> 'quantizationClosureStatus', '') not in (
      'unresolved', 'factual-evidence-collected', 'sufficient-for-human-decision',
      'no-separate-policy-located', 'conflicting-evidence', 'rejected'
    ) then
    raise exception using errcode = '22023', message = 'governance-persistence-closure-status-invalid';
  end if;

  if coalesce(v_record ->> 'actorSubjectId', '') !~ '^[A-Za-z0-9._:-]{8,128}$'
    or v_record ->> 'actorSubjectId' is distinct from p_actor_user_id::text
    or v_record ->> 'actorRole' is distinct from 'model-governance-reviewer' then
    raise exception using errcode = '22023', message = 'governance-persistence-actor-binding-invalid';
  end if;

  if coalesce(v_record ->> 'reviewedAt', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{3})?Z$'
    or p_envelope ->> 'createdFromReviewedAt' is distinct from v_record ->> 'reviewedAt' then
    raise exception using errcode = '22023', message = 'governance-persistence-reviewed-at-invalid';
  end if;

  begin
    v_reviewed_at := (v_record ->> 'reviewedAt')::timestamptz;
  exception
    when others then
      raise exception using errcode = '22023', message = 'governance-persistence-reviewed-at-invalid';
  end;

  v_expected_record_key := pg_catalog.concat_ws(
    ':',
    'governance-record',
    v_candidate_id,
    v_observed_revision,
    'e' || v_evidence_revision::text,
    'd' || v_decision_policy_revision::text,
    'p' || v_record_policy_revision::text,
    'r' || v_record_revision::text
  );

  if v_record ->> 'recordKey' is distinct from v_expected_record_key
    or p_envelope ->> 'canonicalRecordKey' is distinct from v_expected_record_key
    or coalesce(p_envelope ->> 'canonicalRecordRevision', '') !~ '^[1-9][0-9]*$'
    or (p_envelope ->> 'canonicalRecordRevision')::integer <> v_record_revision then
    raise exception using errcode = '22023', message = 'governance-persistence-canonical-key-invalid';
  end if;

  v_expected_persistence_key := pg_catalog.concat_ws(
    ':',
    'local-model-governance-record',
    v_candidate_id,
    v_observed_revision,
    v_expected_record_key,
    'record-revision-' || v_record_revision::text,
    'schema-1'
  );
  v_expected_idempotency_key := v_expected_persistence_key || ':idempotency';

  if p_envelope ->> 'persistenceKey' is distinct from v_expected_persistence_key
    or p_envelope ->> 'idempotencyKey' is distinct from v_expected_idempotency_key then
    raise exception using errcode = '22023', message = 'governance-persistence-logical-key-invalid';
  end if;
end;
$$;

create or replace function public.append_local_model_governance_record(p_envelope jsonb)
returns table (
  result_status text,
  record_id bigint,
  persistence_key text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_user_id uuid;
  v_record jsonb;
  v_scope jsonb;
  v_persistence_key text;
  v_idempotency_key text;
  v_record_id bigint;
  v_existing_count integer;
  v_existing_id bigint;
  v_existing_key text;
  v_existing_identical boolean;
  v_reviewed_at timestamptz;
begin
  v_actor_user_id := auth.uid();
  if v_actor_user_id is null then
    raise exception using errcode = '28000', message = 'governance-persistence-authentication-required';
  end if;

  if not private.has_local_model_governance_permission() then
    raise exception using errcode = '42501', message = 'governance-persistence-authorization-required';
  end if;

  perform private.validate_local_model_governance_persistence_envelope(
    p_envelope,
    v_actor_user_id
  );

  v_record := p_envelope -> 'canonicalRecord';
  v_scope := v_record -> 'scope';
  v_persistence_key := p_envelope ->> 'persistenceKey';
  v_idempotency_key := p_envelope ->> 'idempotencyKey';
  v_reviewed_at := (v_record ->> 'reviewedAt')::timestamptz;

  begin
    insert into public.local_model_governance_records (
      persistence_key,
      idempotency_key,
      schema_revision,
      policy_revision,
      canonical_record_key,
      canonical_record_revision,
      canonical_outcome,
      candidate_id,
      candidate_tier,
      model_class,
      exact_model_name,
      official_repository_id,
      observed_revision,
      actor_user_id,
      reviewed_at,
      persistence_envelope
    ) values (
      v_persistence_key,
      v_idempotency_key,
      (p_envelope ->> 'schemaRevision')::integer,
      (p_envelope ->> 'policyRevision')::integer,
      p_envelope ->> 'canonicalRecordKey',
      (p_envelope ->> 'canonicalRecordRevision')::integer,
      p_envelope ->> 'canonicalOutcome',
      p_envelope ->> 'candidateId',
      p_envelope ->> 'candidateTier',
      v_scope ->> 'modelClass',
      v_scope ->> 'exactModelName',
      v_scope ->> 'officialRepositoryId',
      v_scope ->> 'observedRevision',
      v_actor_user_id,
      v_reviewed_at,
      p_envelope
    )
    returning id into v_record_id;

    return query
      select 'inserted'::text, v_record_id, v_persistence_key;
    return;
  exception
    when unique_violation then
      select
        pg_catalog.count(*)::integer,
        pg_catalog.min(existing.id),
        pg_catalog.min(existing.persistence_key),
        pg_catalog.bool_and(existing.persistence_envelope = p_envelope)
      into
        v_existing_count,
        v_existing_id,
        v_existing_key,
        v_existing_identical
      from public.local_model_governance_records as existing
      where existing.persistence_key = v_persistence_key
        or existing.idempotency_key = v_idempotency_key;

      if v_existing_count = 1 and v_existing_identical then
        return query
          select 'identical-existing-envelope'::text, v_existing_id, v_existing_key;
        return;
      end if;

      raise exception using errcode = '23505', message = 'governance-persistence-conflicting-duplicate';
  end;
end;
$$;

create or replace function private.reject_local_model_governance_record_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception using errcode = '55000', message = 'local-model-governance-records-immutable';
end;
$$;

create trigger local_model_governance_records_immutable
before update or delete on public.local_model_governance_records
for each row execute function private.reject_local_model_governance_record_mutation();

revoke execute on function private.local_model_governance_json_has_exact_keys(jsonb, text[]) from public;
revoke execute on function private.local_model_governance_json_has_exact_keys(jsonb, text[]) from anon;
revoke execute on function private.local_model_governance_json_has_exact_keys(jsonb, text[]) from authenticated;
revoke execute on function private.validate_local_model_governance_persistence_envelope(jsonb, uuid) from public;
revoke execute on function private.validate_local_model_governance_persistence_envelope(jsonb, uuid) from anon;
revoke execute on function private.validate_local_model_governance_persistence_envelope(jsonb, uuid) from authenticated;
revoke execute on function private.reject_local_model_governance_record_mutation() from public;
revoke execute on function private.reject_local_model_governance_record_mutation() from anon;
revoke execute on function private.reject_local_model_governance_record_mutation() from authenticated;
revoke execute on function public.append_local_model_governance_record(jsonb) from public;
revoke execute on function public.append_local_model_governance_record(jsonb) from anon;
grant execute on function public.append_local_model_governance_record(jsonb) to authenticated;

-- Phase 6.5 final privilege hardening
-- Client and service roles receive no direct mutation capability.

revoke all privileges
  on table public.local_model_governance_records
  from public;

revoke all privileges
  on table public.local_model_governance_records
  from anon;

revoke all privileges
  on table public.local_model_governance_records
  from authenticated;

revoke all privileges
  on table public.local_model_governance_records
  from service_role;

grant select
  on table public.local_model_governance_records
  to authenticated;

revoke all privileges
  on sequence public.local_model_governance_records_id_seq
  from public;

revoke all privileges
  on sequence public.local_model_governance_records_id_seq
  from anon;

revoke all privileges
  on sequence public.local_model_governance_records_id_seq
  from authenticated;

revoke all privileges
  on sequence public.local_model_governance_records_id_seq
  from service_role;
