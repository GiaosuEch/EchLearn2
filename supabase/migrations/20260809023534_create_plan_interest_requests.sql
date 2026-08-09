create table if not exists public.plan_interest_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null check (plan_id in ('go', 'plus', 'pro')),
  status text not null default 'requested' check (status in ('requested', 'contacted', 'converted', 'closed')),
  requested_at timestamptz not null default timezone('utc', now()),
  unique (user_id, plan_id)
);

create index if not exists plan_interest_requests_user_requested_idx
  on public.plan_interest_requests (user_id, requested_at desc);

alter table public.plan_interest_requests enable row level security;

grant select, insert on table public.plan_interest_requests to authenticated;

create policy "Learners read their own plan requests"
  on public.plan_interest_requests
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Learners request their own plan"
  on public.plan_interest_requests
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
