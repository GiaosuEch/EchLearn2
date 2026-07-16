-- Phase 17: practice feedback and practice attempt summaries.
-- End users never configure this. The app owner runs it once in Supabase SQL Editor.

create table if not exists public.practice_attempt_summaries (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  target_language text not null,
  skill_type text not null,
  activity_id text not null,
  activity_title text,
  score numeric not null default 0,
  total numeric not null default 1,
  percent numeric not null default 0,
  xp_earned integer not null default 0,
  mastery_average numeric not null default 0,
  weak_items jsonb not null default '[]'::jsonb,
  next_action jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.writing_feedback_results (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  target_language text not null,
  prompt_id text not null,
  text text not null,
  feedback jsonb not null default '{}'::jsonb,
  score numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.speaking_feedback_results (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  target_language text not null,
  prompt_id text not null,
  audio_url text,
  feedback jsonb not null default '{}'::jsonb,
  score numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.practice_attempt_summaries enable row level security;
alter table public.writing_feedback_results enable row level security;
alter table public.speaking_feedback_results enable row level security;

drop policy if exists "practice summaries owner read" on public.practice_attempt_summaries;
create policy "practice summaries owner read" on public.practice_attempt_summaries for select using (auth.uid() = user_id);
drop policy if exists "practice summaries owner insert" on public.practice_attempt_summaries;
create policy "practice summaries owner insert" on public.practice_attempt_summaries for insert with check (auth.uid() = user_id);

drop policy if exists "writing feedback owner read" on public.writing_feedback_results;
create policy "writing feedback owner read" on public.writing_feedback_results for select using (auth.uid() = user_id);
drop policy if exists "writing feedback owner insert" on public.writing_feedback_results;
create policy "writing feedback owner insert" on public.writing_feedback_results for insert with check (auth.uid() = user_id);

drop policy if exists "speaking feedback owner read" on public.speaking_feedback_results;
create policy "speaking feedback owner read" on public.speaking_feedback_results for select using (auth.uid() = user_id);
drop policy if exists "speaking feedback owner insert" on public.speaking_feedback_results;
create policy "speaking feedback owner insert" on public.speaking_feedback_results for insert with check (auth.uid() = user_id);

create index if not exists idx_practice_attempt_summaries_user_skill on public.practice_attempt_summaries(user_id, target_language, skill_type, created_at desc);
create index if not exists idx_writing_feedback_user on public.writing_feedback_results(user_id, target_language, created_at desc);
create index if not exists idx_speaking_feedback_user on public.speaking_feedback_results(user_id, target_language, created_at desc);
