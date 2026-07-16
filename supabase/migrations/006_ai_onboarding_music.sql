-- Phase 12.9: AI onboarding, personalized placement, and music/podcast learning metadata.
-- End users do not configure Supabase. The app owner runs this migration once.

create table if not exists public.ai_onboarding_results (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  target_language text not null,
  native_language text not null default 'vi',
  self_assessed_level text not null check (self_assessed_level in ('none','some','known','fluent')),
  test_seed text not null,
  questions_json jsonb not null default '[]'::jsonb,
  answers_json jsonb not null default '{}'::jsonb,
  result_json jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_media_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_language text not null,
  provider text not null default 'spotify',
  media_kind text not null check (media_kind in ('song','podcast')),
  title text not null,
  external_url text not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.ai_onboarding_results enable row level security;
alter table public.learning_media_saves enable row level security;

drop policy if exists "Users can read own ai onboarding" on public.ai_onboarding_results;
create policy "Users can read own ai onboarding"
  on public.ai_onboarding_results for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own ai onboarding" on public.ai_onboarding_results;
create policy "Users can insert own ai onboarding"
  on public.ai_onboarding_results for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own ai onboarding" on public.ai_onboarding_results;
create policy "Users can update own ai onboarding"
  on public.ai_onboarding_results for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own media saves" on public.learning_media_saves;
create policy "Users can read own media saves"
  on public.learning_media_saves for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own media saves" on public.learning_media_saves;
create policy "Users can insert own media saves"
  on public.learning_media_saves for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own media saves" on public.learning_media_saves;
create policy "Users can delete own media saves"
  on public.learning_media_saves for delete
  using (auth.uid() = user_id);
