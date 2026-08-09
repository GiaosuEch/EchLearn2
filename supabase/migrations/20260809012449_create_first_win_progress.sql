create table if not exists public.first_win_progress (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  target_language text not null check (char_length(target_language) between 2 and 16),
  goal text not null check (goal in ('habit', 'speaking', 'ielts')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.first_win_progress enable row level security;

grant select, insert, update on table public.first_win_progress to authenticated;
revoke all on table public.first_win_progress from anon;

create policy "Learners read their own first win progress"
on public.first_win_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Learners insert their own first win progress"
on public.first_win_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Learners update their own first win progress"
on public.first_win_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
