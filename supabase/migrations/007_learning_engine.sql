-- Phase 16: Adaptive learning engine, mastery, spaced repetition, and daily plans.
-- End users do not create Supabase. The app owner runs this once in the production project.

create table if not exists public.learning_profiles (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  target_language text not null,
  native_language text not null default 'vi',
  current_level text not null default 'beginner',
  placement_score int not null default 0 check (placement_score between 0 and 100),
  weak_skills text[] not null default '{}',
  strong_skills text[] not null default '{}',
  daily_goal int not null default 50,
  streak int not null default 0,
  total_xp int not null default 0,
  active_learning_path jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, target_language)
);

create table if not exists public.learning_item_progress (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  target_language text not null,
  item_id text not null,
  skill_type text not null check (skill_type in ('listening','speaking','reading','writing','vocabulary','grammar','pronunciation','lesson')),
  attempts int not null default 0,
  correct_count int not null default 0,
  wrong_count int not null default 0,
  last_practiced_at timestamptz,
  next_review_at timestamptz,
  mastery_score int not null default 0 check (mastery_score between 0 and 100),
  confidence int not null default 0 check (confidence between 0 and 100),
  difficulty int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, target_language, item_id)
);

create table if not exists public.learning_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_language text not null,
  item_id text not null,
  skill_type text not null check (skill_type in ('listening','speaking','reading','writing','vocabulary','grammar','pronunciation','lesson')),
  is_correct boolean not null default false,
  answer text,
  correct_answer text,
  time_spent_sec int not null default 0,
  audio_replays int not null default 0,
  skipped boolean not null default false,
  typed_exact boolean not null default false,
  typed_close boolean not null default false,
  xp_earned int not null default 0,
  mastery_before int not null default 0,
  mastery_after int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.review_queue (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  target_language text not null,
  item_id text not null,
  skill_type text not null check (skill_type in ('listening','speaking','reading','writing','vocabulary','grammar','pronunciation','lesson')),
  due_at timestamptz,
  mastery_score int not null default 0,
  reason text not null default 'scheduled_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, target_language, item_id)
);

create table if not exists public.daily_learning_plans (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  target_language text not null,
  native_language text not null default 'vi',
  plan_date date not null default current_date,
  plan_json jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, target_language, plan_date)
);

alter table public.learning_profiles enable row level security;
alter table public.learning_item_progress enable row level security;
alter table public.learning_events enable row level security;
alter table public.review_queue enable row level security;
alter table public.daily_learning_plans enable row level security;

drop policy if exists "learning_profiles_select_own" on public.learning_profiles;
create policy "learning_profiles_select_own" on public.learning_profiles for select using (auth.uid() = user_id);
drop policy if exists "learning_profiles_insert_own" on public.learning_profiles;
create policy "learning_profiles_insert_own" on public.learning_profiles for insert with check (auth.uid() = user_id);
drop policy if exists "learning_profiles_update_own" on public.learning_profiles;
create policy "learning_profiles_update_own" on public.learning_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);


drop policy if exists "learning_item_progress_select_own" on public.learning_item_progress;
create policy "learning_item_progress_select_own" on public.learning_item_progress for select using (auth.uid() = user_id);
drop policy if exists "learning_item_progress_insert_own" on public.learning_item_progress;
create policy "learning_item_progress_insert_own" on public.learning_item_progress for insert with check (auth.uid() = user_id);
drop policy if exists "learning_item_progress_update_own" on public.learning_item_progress;
create policy "learning_item_progress_update_own" on public.learning_item_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "learning_events_select_own" on public.learning_events;
create policy "learning_events_select_own" on public.learning_events for select using (auth.uid() = user_id);
drop policy if exists "learning_events_insert_own" on public.learning_events;
create policy "learning_events_insert_own" on public.learning_events for insert with check (auth.uid() = user_id);

drop policy if exists "review_queue_select_own" on public.review_queue;
create policy "review_queue_select_own" on public.review_queue for select using (auth.uid() = user_id);
drop policy if exists "review_queue_insert_own" on public.review_queue;
create policy "review_queue_insert_own" on public.review_queue for insert with check (auth.uid() = user_id);
drop policy if exists "review_queue_update_own" on public.review_queue;
create policy "review_queue_update_own" on public.review_queue for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "daily_learning_plans_select_own" on public.daily_learning_plans;
create policy "daily_learning_plans_select_own" on public.daily_learning_plans for select using (auth.uid() = user_id);
drop policy if exists "daily_learning_plans_insert_own" on public.daily_learning_plans;
create policy "daily_learning_plans_insert_own" on public.daily_learning_plans for insert with check (auth.uid() = user_id);
drop policy if exists "daily_learning_plans_update_own" on public.daily_learning_plans;
create policy "daily_learning_plans_update_own" on public.daily_learning_plans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_learning_item_progress_due on public.learning_item_progress(user_id, target_language, next_review_at);
create index if not exists idx_learning_events_user_created on public.learning_events(user_id, created_at desc);
create index if not exists idx_review_queue_due on public.review_queue(user_id, target_language, due_at);
create index if not exists idx_daily_learning_plans_user_date on public.daily_learning_plans(user_id, target_language, plan_date desc);
