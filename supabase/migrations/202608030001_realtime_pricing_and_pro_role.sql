-- Phase 21 — Realtime plan pricing + explicit PRO role flags.
--
-- Two problems this fixes:
--   1. Admin price edits lived only in one browser's localStorage, so other
--      devices kept showing stale prices. Prices now live in a table that is
--      published to Supabase Realtime, so every open client gets the new row.
--   2. Granting PRO only wrote an entitlement ledger row. The profile itself
--      never carried the flag, so RLS policies and feature gates could not see
--      it. `profiles.role` / `profiles.is_pro` are now the authoritative flags.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Plan prices (public read, GiaosuEch-admin write, realtime broadcast)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.plan_prices (
  plan_id text primary key check (plan_id in ('free', 'go', 'plus', 'pro')),
  price text not null,
  original_price text,
  period text not null,
  badge text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

alter table public.plan_prices enable row level security;

-- Pricing is public marketing data: anonymous visitors on the landing/pricing
-- page must be able to read it, so `anon` keeps SELECT.
grant select on table public.plan_prices to anon, authenticated;
revoke insert, update, delete on table public.plan_prices from anon, authenticated;

drop policy if exists "Anyone can read plan prices" on public.plan_prices;
create policy "Anyone can read plan prices"
on public.plan_prices
for select
to anon, authenticated
using (true);

insert into public.plan_prices (plan_id, price, original_price, period, badge) values
  ('free', '0 VNĐ',        null,              '90 Ngày dùng thử',           null),
  ('go',   '199.000 VNĐ',  '299.000 VNĐ',     '6 Tháng (~33k/tháng)',       null),
  ('plus', '399.000 VNĐ',  '599.000 VNĐ',     '12 Tháng (~33k/tháng)',      'Phổ biến nhất'),
  ('pro',  '799.000 VNĐ',  '1.299.000 VNĐ',   'Trọn đời (Dùng mãi mãi)',    'VIP Trọn Đời')
on conflict (plan_id) do nothing;

-- Only the owner account may change prices. SECURITY DEFINER so the write can
-- happen without granting UPDATE to every authenticated user.
create or replace function public.admin_set_plan_price(
  p_plan_id text,
  p_price text,
  p_original_price text,
  p_period text,
  p_badge text
)
returns public.plan_prices
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  result public.plan_prices;
begin
  if not public.is_giaosuech_admin() then
    raise exception 'GiaosuEch administrator access is required' using errcode = '42501';
  end if;

  if p_plan_id not in ('free', 'go', 'plus', 'pro') then
    raise exception 'Unsupported plan id' using errcode = '22023';
  end if;

  if coalesce(btrim(p_price), '') = '' then
    raise exception 'Price is required' using errcode = '22023';
  end if;

  insert into public.plan_prices (plan_id, price, original_price, period, badge, updated_at, updated_by)
  values (
    p_plan_id,
    btrim(p_price),
    nullif(btrim(coalesce(p_original_price, '')), ''),
    coalesce(nullif(btrim(coalesce(p_period, '')), ''), 'Trọn đời'),
    nullif(btrim(coalesce(p_badge, '')), ''),
    now(),
    (select auth.uid())
  )
  on conflict (plan_id) do update set
    price = excluded.price,
    original_price = excluded.original_price,
    period = excluded.period,
    badge = excluded.badge,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by
  returning * into result;

  return result;
end;
$$;

revoke all on function public.admin_set_plan_price(text, text, text, text, text) from public, anon;
grant execute on function public.admin_set_plan_price(text, text, text, text, text) to authenticated;

-- Realtime: postgres_changes on plan_prices is what pushes the new price to
-- every open browser. REPLICA IDENTITY FULL keeps the payload complete on UPDATE.
alter table public.plan_prices replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'plan_prices'
    ) then
      alter publication supabase_realtime add table public.plan_prices;
    end if;
  end if;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. PRO flags on profiles
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles add column if not exists is_pro boolean not null default false;
alter table public.profiles add column if not exists subscription_tier text not null default 'free';
alter table public.profiles add column if not exists pro_granted_at timestamptz;

-- `role` already exists (013_admin_role_assignment.sql) and held 'admin' | 'user'.
-- It now also accepts 'pro'. 'admin' outranks 'pro' and is never overwritten.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_role_allowed'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_role_allowed check (role in ('admin', 'pro', 'user'));
  end if;
end;
$$;

create index if not exists profiles_is_pro_idx on public.profiles (is_pro) where is_pro;

-- Backfill from the entitlement ledger so existing paid learners light up.
update public.profiles p
set is_pro = true,
    subscription_tier = e.plan,
    role = case when p.role = 'admin' then 'admin' else 'pro' end,
    pro_granted_at = coalesce(p.pro_granted_at, e.activated_at)
from public.course_entitlements e
where e.user_id = p.id
  and e.plan in ('plus', 'pro')
  and (e.expires_at is null or e.expires_at > now());

-- The owner account is always PRO.
update public.profiles
set is_pro = true,
    subscription_tier = 'pro',
    role = 'admin',
    pro_granted_at = coalesce(pro_granted_at, now())
where lower(email) = 'khounguyennguyen2012@gmail.com';

-- Server-authoritative PRO grant. Called by the admin panel right after the
-- entitlement is activated so the profile flags never drift from the ledger.
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
      -- Never demote the owner account out of 'admin'.
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

-- A learner may read their own PRO flags; the admin may read everyone's.
-- (Profiles are already publicly readable for the leaderboard, so this only
-- documents the write side: nobody but the RPC above can set is_pro.)
drop policy if exists "Learners cannot self-grant pro" on public.profiles;
create policy "Learners cannot self-grant pro"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id or public.is_giaosuech_admin())
with check (
  public.is_giaosuech_admin()
  or (
    (select auth.uid()) = id
    and is_pro = (select p.is_pro from public.profiles p where p.id = profiles.id)
    and role = (select p.role from public.profiles p where p.id = profiles.id)
  )
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Daily mission progress
-- ─────────────────────────────────────────────────────────────────────────────
-- `DailyMissionsPage` used to hard-code `progress: 0`, so a learner who finished
-- ten lessons still saw 0/10 and could never claim. Completions now write
-- counters, and this table carries them across devices and reinstalls.
--
-- One row per learner per calendar day. `counters` is keyed by MissionTemplate
-- type ('xp', 'lessons', 'perfect_lessons', 'speaking', …) and `claimed` holds
-- the mission ids already paid out, so a reward is never granted twice.
create table if not exists public.daily_mission_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  mission_date date not null,
  counters jsonb not null default '{}'::jsonb,
  claimed jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, mission_date)
);

create index if not exists daily_mission_progress_date_idx
  on public.daily_mission_progress (mission_date);

alter table public.daily_mission_progress enable row level security;

grant select, insert, update on table public.daily_mission_progress to authenticated;
revoke all on table public.daily_mission_progress from anon;

-- Mission progress is private: a learner reads and writes only their own row.
-- There is deliberately no admin-write policy — nobody hands out mission credit.
drop policy if exists "Learners read their own mission progress" on public.daily_mission_progress;
create policy "Learners read their own mission progress"
on public.daily_mission_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Learners insert their own mission progress" on public.daily_mission_progress;
create policy "Learners insert their own mission progress"
on public.daily_mission_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Learners update their own mission progress" on public.daily_mission_progress;
create policy "Learners update their own mission progress"
on public.daily_mission_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
