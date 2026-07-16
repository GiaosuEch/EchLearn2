-- Ech Lern profiles and settings. Owner/developer setup only.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text not null default 'Learner',
  username text unique,
  avatar_url text,
  banner_url text,
  bio text default '',
  custom_status text default '',
  profile_theme text default 'frog-green',
  native_language text not null default 'vi',
  interface_language text not null default 'vi',
  target_languages text[] not null default array['en'],
  level integer not null default 1,
  total_xp integer not null default 0,
  hearts integer not null default 5,
  is_public_profile boolean not null default true,
  show_online_status boolean not null default true,
  allow_friend_requests boolean not null default true,
  allow_group_invites boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  interface_language text not null default 'vi',
  native_language text not null default 'vi',
  target_language text not null default 'en',
  theme text not null default 'dark',
  sound_effects boolean not null default true,
  speech_speed text not null default 'normal',
  font_size text not null default 'medium',
  daily_xp_goal integer not null default 50,
  ielts_target_band numeric(3,1) not null default 7.0,
  public_profile boolean not null default true,
  show_online_status boolean not null default true,
  allow_friend_requests boolean not null default true,
  allow_group_invites boolean not null default true,
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    display_name,
    username,
    native_language,
    interface_language,
    target_languages
  ) values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1), 'Learner'),
    lower(regexp_replace(coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1), 'learner'), '[^a-zA-Z0-9_]+', '', 'g')) || '_' || substr(new.id::text, 1, 6),
    coalesce(new.raw_user_meta_data ->> 'native_language', 'vi'),
    coalesce(new.raw_user_meta_data ->> 'interface_language', new.raw_user_meta_data ->> 'native_language', 'vi'),
    coalesce((select array_agg(value::text) from jsonb_array_elements_text(coalesce(new.raw_user_meta_data -> 'target_languages', '["en"]'::jsonb)) as value), array['en'])
  ) on conflict (id) do nothing;

  insert into public.user_settings (user_id, native_language, interface_language, target_language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'native_language', 'vi'),
    coalesce(new.raw_user_meta_data ->> 'interface_language', new.raw_user_meta_data ->> 'native_language', 'vi'),
    coalesce((new.raw_user_meta_data -> 'target_languages' ->> 0), 'en')
  ) on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "profiles readable public or own" on public.profiles;
create policy "profiles readable public or own" on public.profiles
for select using (is_public_profile = true or auth.uid() = id);

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "settings read own" on public.user_settings;
create policy "settings read own" on public.user_settings
for select using (auth.uid() = user_id);

drop policy if exists "settings insert own" on public.user_settings;
create policy "settings insert own" on public.user_settings
for insert with check (auth.uid() = user_id);

drop policy if exists "settings update own" on public.user_settings;
create policy "settings update own" on public.user_settings
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
