-- Make paid access server-authoritative across devices.  The entitlement
-- ledger records the transaction, while these profile fields drive feature
-- gates and must never be writable by the learner directly.

alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists is_pro boolean not null default false;
alter table public.profiles add column if not exists subscription_tier text not null default 'free';
alter table public.profiles add column if not exists pro_granted_at timestamptz;

alter table public.profiles drop constraint if exists profiles_role_allowed;
alter table public.profiles add constraint profiles_role_allowed check (role in ('admin', 'pro', 'user'));
alter table public.profiles drop constraint if exists profiles_subscription_tier_allowed;
alter table public.profiles add constraint profiles_subscription_tier_allowed check (subscription_tier in ('free', 'go', 'plus', 'pro'));

create index if not exists profiles_is_pro_idx on public.profiles (is_pro) where is_pro;

update public.profiles p
set is_pro = true,
    subscription_tier = e.plan,
    role = case when p.role = 'admin' then 'admin' else 'pro' end,
    pro_granted_at = coalesce(p.pro_granted_at, e.activated_at)
from public.course_entitlements e
where e.user_id = p.id
  and e.plan in ('plus', 'pro')
  and (e.expires_at is null or e.expires_at > now());

update public.profiles
set is_pro = true,
    subscription_tier = 'pro',
    role = 'admin',
    pro_granted_at = coalesce(pro_granted_at, now())
where lower(email) = 'khounguyennguyen2012@gmail.com';

create or replace function public.admin_set_pro_access(
  p_user_id uuid,
  p_plan text,
  p_is_pro boolean
)
returns public.profiles
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  result public.profiles;
begin
  if not public.is_giaosuech_admin() then
    raise exception 'GiaosuEch administrator access is required' using errcode = '42501';
  end if;

  if p_plan not in ('free', 'go', 'plus', 'pro') then
    raise exception 'Unsupported plan id' using errcode = '22023';
  end if;

  update public.profiles
  set is_pro = coalesce(p_is_pro, false),
      subscription_tier = p_plan,
      role = case
        when role = 'admin' then 'admin'
        when coalesce(p_is_pro, false) then 'pro'
        else 'user'
      end,
      pro_granted_at = case
        when coalesce(p_is_pro, false) then coalesce(pro_granted_at, now())
        else null
      end,
      updated_at = now()
  where id = p_user_id
  returning * into result;

  if result is null then
    raise exception 'Profile not found' using errcode = 'P0002';
  end if;

  return result;
end;
$$;

revoke all on function public.admin_set_pro_access(uuid, text, boolean) from public, anon;
grant execute on function public.admin_set_pro_access(uuid, text, boolean) to authenticated;

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
  profile_result public.profiles;
  duration_days integer;
  profile_is_pro boolean;
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
  profile_is_pro := p_plan in ('plus', 'pro');

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

  update public.profiles
  set is_pro = profile_is_pro,
      subscription_tier = p_plan,
      role = case
        when role = 'admin' then 'admin'
        when profile_is_pro then 'pro'
        else 'user'
      end,
      pro_granted_at = case
        when profile_is_pro then coalesce(pro_granted_at, now())
        else null
      end,
      updated_at = now()
  where id = p_user_id
  returning * into profile_result;

  if profile_result is null then
    raise exception 'Profile not found' using errcode = 'P0002';
  end if;

  return result;
end;
$$;

revoke all on function public.activate_course_entitlement(uuid, text, text) from public, anon;
grant execute on function public.activate_course_entitlement(uuid, text, text) to authenticated;

-- Replace permissive generic policies that would otherwise let a learner set
-- the newly-added paid access fields on their own row.
drop policy if exists "Users can update own profile." on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
create policy "Users can update own safe profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check (
  (select auth.uid()) = id
  and is_pro = (select p.is_pro from public.profiles p where p.id = profiles.id)
  and subscription_tier = (select p.subscription_tier from public.profiles p where p.id = profiles.id)
  and role = (select p.role from public.profiles p where p.id = profiles.id)
);

drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;
create policy "Users can insert only a free profile"
on public.profiles
for insert
to authenticated
with check (
  (select auth.uid()) = id
  and is_pro = false
  and subscription_tier = 'free'
  and role = 'user'
);
