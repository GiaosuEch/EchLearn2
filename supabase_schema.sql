-- Ech Lern Supabase Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  display_name text not null,
  username text unique not null,
  avatar_url text,
  bio text,
  native_language text default 'vi',
  target_languages text[] default '{"en"}',
  level integer default 1,
  xp integer default 0,
  streak integer default 0,
  hearts integer default 5,
  ielts_target_band numeric(2,1) default 6.5,
  is_public_profile boolean default true,
  badges text[] default '{}',
  friends uuid[] default '{}',
  joined_groups uuid[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. LEARNING_PROGRESS
create table public.learning_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_id text not null,
  completed_lessons integer default 0,
  is_completed boolean default false,
  last_accessed timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, course_id)
);

-- 3. LESSON_ATTEMPTS
create table public.lesson_attempts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id text not null,
  score integer not null,
  mistakes jsonb default '[]',
  time_spent_seconds integer not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. IELTS_RESULTS
create table public.ielts_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  test_type text not null, -- 'placement', 'mock', 'practice'
  skill text not null, -- 'overall', 'listening', 'reading', 'writing', 'speaking'
  band_score numeric(2,1) not null,
  feedback jsonb,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. VOCABULARY_MASTERY
create table public.vocabulary_mastery (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  word text not null,
  level text not null, -- 'A1', 'B2', etc.
  mastery_level integer default 0, -- 0-100
  next_review_at timestamp with time zone,
  unique(user_id, word)
);

-- 6. GRAMMAR_MASTERY
create table public.grammar_mastery (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  topic_id text not null,
  mastery_level integer default 0, -- 0-100
  unique(user_id, topic_id)
);

-- 7. COMMUNITY_POSTS
create table public.community_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  language text not null,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. STUDY_GROUPS
create table public.study_groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  language text not null,
  created_by uuid references public.profiles(id) on delete set null,
  member_count integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. XP_EVENTS
create table public.xp_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount integer not null,
  reason text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. STREAKS
create table public.streaks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_activity_date date default CURRENT_DATE,
  unique(user_id)
);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.learning_progress enable row level security;
alter table public.lesson_attempts enable row level security;
alter table public.ielts_results enable row level security;
alter table public.vocabulary_mastery enable row level security;
alter table public.grammar_mastery enable row level security;
alter table public.community_posts enable row level security;
alter table public.study_groups enable row level security;
alter table public.xp_events enable row level security;
alter table public.streaks enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( is_public_profile = true or auth.uid() = id );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Standard policies for private user data
create policy "Users can view own data" on learning_progress for select using (auth.uid() = user_id);
create policy "Users can update own data" on learning_progress for all using (auth.uid() = user_id);

create policy "Users can view own data" on lesson_attempts for select using (auth.uid() = user_id);
create policy "Users can insert own data" on lesson_attempts for insert with check (auth.uid() = user_id);

create policy "Users can view own data" on ielts_results for select using (auth.uid() = user_id);
create policy "Users can insert own data" on ielts_results for insert with check (auth.uid() = user_id);

create policy "Users can view own data" on vocabulary_mastery for select using (auth.uid() = user_id);
create policy "Users can update own data" on vocabulary_mastery for all using (auth.uid() = user_id);

create policy "Users can view own data" on grammar_mastery for select using (auth.uid() = user_id);
create policy "Users can update own data" on grammar_mastery for all using (auth.uid() = user_id);

create policy "Users can view own data" on xp_events for select using (auth.uid() = user_id);
create policy "Users can insert own data" on xp_events for insert with check (auth.uid() = user_id);

create policy "Users can view own data" on streaks for select using (auth.uid() = user_id);
create policy "Users can update own data" on streaks for all using (auth.uid() = user_id);

-- Community data policies
create policy "Everyone can view community posts" on community_posts for select using (true);
create policy "Authenticated users can create posts" on community_posts for insert with check (auth.role() = 'authenticated');

create policy "Everyone can view study groups" on study_groups for select using (true);
create policy "Authenticated users can create groups" on study_groups for insert with check (auth.role() = 'authenticated');
