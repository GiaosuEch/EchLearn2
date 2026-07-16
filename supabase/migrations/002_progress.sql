-- Ech Lern learning progress persistence. Owner/developer setup only.

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_language text not null default 'en',
  daily_xp integer not null default 0,
  total_xp integer not null default 0,
  streak integer not null default 0,
  last_active_date date,
  weak_words jsonb not null default '[]'::jsonb,
  completed_lessons text[] not null default '{}',
  vocabulary_mastery jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(user_id, target_language)
);

create table if not exists public.lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null,
  target_language text not null default 'en',
  score integer not null default 0,
  total_questions integer not null default 0,
  status text not null default 'completed',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.vocabulary_mastery (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  target_language text not null default 'en',
  mastery_level integer not null default 0 check (mastery_level between 0 and 100),
  next_review_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, item_id, target_language)
);

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  reason text not null default 'Practice',
  created_at timestamptz not null default now()
);

create table if not exists public.writing_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  prompt_id text not null,
  target_language text not null default 'en',
  content text not null,
  feedback jsonb not null default '{}'::jsonb,
  local_estimated_score numeric(3,1),
  created_at timestamptz not null default now()
);

create table if not exists public.speaking_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  prompt_id text not null,
  target_language text not null default 'en',
  transcript text,
  feedback jsonb not null default '{}'::jsonb,
  local_estimated_score numeric(3,1),
  created_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;
alter table public.lesson_attempts enable row level security;
alter table public.vocabulary_mastery enable row level security;
alter table public.xp_events enable row level security;
alter table public.writing_submissions enable row level security;
alter table public.speaking_attempts enable row level security;

create index if not exists idx_lesson_attempts_user_created on public.lesson_attempts(user_id, created_at desc);
create index if not exists idx_xp_events_user_created on public.xp_events(user_id, created_at desc);

-- owner-only rows

do $$
declare t text;
begin
  foreach t in array array['user_progress','lesson_attempts','vocabulary_mastery','xp_events','writing_submissions','speaking_attempts'] loop
    execute format('drop policy if exists "%s read own" on public.%I', t, t);
    execute format('create policy "%s read own" on public.%I for select using (auth.uid() = user_id)', t, t);
    execute format('drop policy if exists "%s insert own" on public.%I', t, t);
    execute format('create policy "%s insert own" on public.%I for insert with check (auth.uid() = user_id)', t, t);
    execute format('drop policy if exists "%s update own" on public.%I', t, t);
    execute format('create policy "%s update own" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t, t);
    execute format('drop policy if exists "%s delete own" on public.%I', t, t);
    execute format('create policy "%s delete own" on public.%I for delete using (auth.uid() = user_id)', t, t);
  end loop;
end $$;
