-- Ech Lern friends and community. Owner/developer setup only.

create table if not exists public.friends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, friend_id),
  check (user_id <> friend_id)
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  language text,
  tags text[] not null default '{}',
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.study_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  avatar_url text,
  language text,
  level text,
  max_members integer not null default 50,
  created_by uuid references public.profiles(id) on delete set null,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.study_group_members (
  group_id uuid not null references public.study_groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','moderator','member')),
  joined_at timestamptz not null default now(),
  primary key(group_id, user_id)
);

create table if not exists public.group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.friends enable row level security;
alter table public.community_posts enable row level security;
alter table public.study_groups enable row level security;
alter table public.study_group_members enable row level security;
alter table public.group_messages enable row level security;

drop policy if exists "friends read involved" on public.friends;
create policy "friends read involved" on public.friends for select using (auth.uid() = user_id or auth.uid() = friend_id);
drop policy if exists "friends request as self" on public.friends;
create policy "friends request as self" on public.friends for insert with check (auth.uid() = user_id);
drop policy if exists "friends update involved" on public.friends;
create policy "friends update involved" on public.friends for update using (auth.uid() = user_id or auth.uid() = friend_id) with check (auth.uid() = user_id or auth.uid() = friend_id);
drop policy if exists "friends delete involved" on public.friends;
create policy "friends delete involved" on public.friends for delete using (auth.uid() = user_id or auth.uid() = friend_id);

drop policy if exists "community posts public read" on public.community_posts;
create policy "community posts public read" on public.community_posts for select using (true);
drop policy if exists "community posts create own" on public.community_posts;
create policy "community posts create own" on public.community_posts for insert with check (auth.uid() = author_id);
drop policy if exists "community posts update own" on public.community_posts;
create policy "community posts update own" on public.community_posts for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists "study groups public read" on public.study_groups;
create policy "study groups public read" on public.study_groups for select using (is_public = true or created_by = auth.uid());
drop policy if exists "study groups create own" on public.study_groups;
create policy "study groups create own" on public.study_groups for insert with check (auth.uid() = created_by);

drop policy if exists "group members read groups" on public.study_group_members;
create policy "group members read groups" on public.study_group_members for select using (true);
drop policy if exists "group members join self" on public.study_group_members;
create policy "group members join self" on public.study_group_members for insert with check (auth.uid() = user_id);
drop policy if exists "group members leave self" on public.study_group_members;
create policy "group members leave self" on public.study_group_members for delete using (auth.uid() = user_id);

drop policy if exists "group messages read members" on public.group_messages;
create policy "group messages read members" on public.group_messages for select using (
  exists (select 1 from public.study_group_members m where m.group_id = group_messages.group_id and m.user_id = auth.uid())
);
drop policy if exists "group messages send members" on public.group_messages;
create policy "group messages send members" on public.group_messages for insert with check (
  auth.uid() = author_id and exists (select 1 from public.study_group_members m where m.group_id = group_messages.group_id and m.user_id = auth.uid())
);
