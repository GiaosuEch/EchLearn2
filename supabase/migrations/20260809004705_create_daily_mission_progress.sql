-- Production repair: the mission-progress service has been live while its
-- original migration was absent from the deployed project. Keep this repair
-- self-contained so newer entitlement migrations are never replayed.
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
