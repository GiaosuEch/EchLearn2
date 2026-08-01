-- Course-plan access is a server-authoritative record. Browser storage is
-- only a local-development fallback and must not be used to authorize sales.
create table if not exists public.course_entitlements (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  plan text not null check (plan in ('free', 'go', 'plus', 'pro')),
  source text not null check (source in ('trial', 'purchased')),
  activated_by uuid not null references public.profiles(id),
  activated_at timestamptz not null default now(),
  expires_at timestamptz,
  updated_at timestamptz not null default now(),
  check ((plan = 'pro' and expires_at is null) or (plan <> 'pro' and expires_at is not null))
);

alter table public.course_entitlements enable row level security;
revoke all on table public.course_entitlements from anon;
grant select on table public.course_entitlements to authenticated;

create or replace function public.is_giaosuech_admin()
returns boolean
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select coalesce((select auth.jwt() ->> 'email'), '') = 'khounguyennguyen2012@gmail.com';
$$;

create policy "Learners and GiaosuEch can read course entitlements"
on public.course_entitlements
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or public.is_giaosuech_admin()
);

create or replace function public.activate_course_entitlement(
  p_user_id uuid,
  p_plan text,
  p_source text
)
returns public.course_entitlements
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  result public.course_entitlements;
  duration_days integer;
begin
  if not public.is_giaosuech_admin() then
    raise exception 'GiaosuEch administrator access is required' using errcode = '42501';
  end if;

  if p_plan not in ('free', 'go', 'plus', 'pro') then
    raise exception 'Unsupported entitlement plan' using errcode = '22023';
  end if;

  if p_source not in ('trial', 'purchased') then
    raise exception 'Unsupported entitlement source' using errcode = '22023';
  end if;

  duration_days := case p_plan when 'free' then 90 when 'go' then 180 when 'plus' then 365 else null end;

  insert into public.course_entitlements (user_id, plan, source, activated_by, activated_at, expires_at, updated_at)
  values (
    p_user_id,
    p_plan,
    p_source,
    (select auth.uid()),
    now(),
    case when duration_days is null then null else now() + make_interval(days => duration_days) end,
    now()
  )
  on conflict (user_id) do update set
    plan = excluded.plan,
    source = excluded.source,
    activated_by = excluded.activated_by,
    activated_at = excluded.activated_at,
    expires_at = excluded.expires_at,
    updated_at = excluded.updated_at
  returning * into result;

  return result;
end;
$$;

revoke all on function public.activate_course_entitlement(uuid, text, text) from public, anon;
grant execute on function public.activate_course_entitlement(uuid, text, text) to authenticated;
