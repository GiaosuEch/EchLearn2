-- Ech Lern IELTS local-estimate attempts. Owner/developer setup only.

create table if not exists public.ielts_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill text not null check (skill in ('listening','reading','writing','speaking','placement','mock')),
  task_id text,
  target_band numeric(3,1),
  local_estimated_band numeric(3,1),
  feedback jsonb not null default '{}'::jsonb,
  content text,
  created_at timestamptz not null default now()
);

alter table public.ielts_attempts enable row level security;

drop policy if exists "ielts attempts read own" on public.ielts_attempts;
create policy "ielts attempts read own" on public.ielts_attempts for select using (auth.uid() = user_id);
drop policy if exists "ielts attempts insert own" on public.ielts_attempts;
create policy "ielts attempts insert own" on public.ielts_attempts for insert with check (auth.uid() = user_id);
drop policy if exists "ielts attempts update own" on public.ielts_attempts;
create policy "ielts attempts update own" on public.ielts_attempts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
