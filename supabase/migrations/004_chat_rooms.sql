-- Ech Lern chat rooms and voice-room metadata. Owner/developer setup only.

create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  name text,
  type text not null default 'group' check (type in ('direct','group','voice')),
  password_hash text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_room_members (
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  joined_at timestamptz not null default now(),
  primary key(room_id, user_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.message_reads (
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key(message_id, user_id)
);

create table if not exists public.voice_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  topic text,
  language text,
  host_id uuid not null references public.profiles(id) on delete cascade,
  room_code text unique,
  password_hash text,
  is_live boolean not null default true,
  max_participants integer not null default 10,
  study_timer integer,
  created_at timestamptz not null default now()
);

create table if not exists public.voice_room_participants (
  room_id uuid not null references public.voice_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  is_speaking boolean not null default false,
  is_muted boolean not null default true,
  joined_at timestamptz not null default now(),
  primary key(room_id, user_id)
);

alter table public.chat_rooms enable row level security;
alter table public.chat_room_members enable row level security;
alter table public.chat_messages enable row level security;
alter table public.message_reads enable row level security;
alter table public.voice_rooms enable row level security;
alter table public.voice_room_participants enable row level security;

drop policy if exists "chat rooms read members" on public.chat_rooms;
create policy "chat rooms read members" on public.chat_rooms for select using (
  exists (select 1 from public.chat_room_members m where m.room_id = chat_rooms.id and m.user_id = auth.uid())
);
drop policy if exists "chat rooms create own" on public.chat_rooms;
create policy "chat rooms create own" on public.chat_rooms for insert with check (auth.uid() = created_by);

drop policy if exists "chat members read same room" on public.chat_room_members;
create policy "chat members read same room" on public.chat_room_members for select using (
  exists (select 1 from public.chat_room_members m where m.room_id = chat_room_members.room_id and m.user_id = auth.uid())
);
drop policy if exists "chat members join self" on public.chat_room_members;
create policy "chat members join self" on public.chat_room_members for insert with check (auth.uid() = user_id);
drop policy if exists "chat members leave self" on public.chat_room_members;
create policy "chat members leave self" on public.chat_room_members for delete using (auth.uid() = user_id);

drop policy if exists "chat messages read members" on public.chat_messages;
create policy "chat messages read members" on public.chat_messages for select using (
  exists (select 1 from public.chat_room_members m where m.room_id = chat_messages.room_id and m.user_id = auth.uid())
);
drop policy if exists "chat messages send members" on public.chat_messages;
create policy "chat messages send members" on public.chat_messages for insert with check (
  auth.uid() = sender_id and exists (select 1 from public.chat_room_members m where m.room_id = chat_messages.room_id and m.user_id = auth.uid())
);

drop policy if exists "message reads own" on public.message_reads;
create policy "message reads own" on public.message_reads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "voice rooms public live read" on public.voice_rooms;
create policy "voice rooms public live read" on public.voice_rooms for select using (is_live = true or auth.uid() = host_id);
drop policy if exists "voice rooms create host" on public.voice_rooms;
create policy "voice rooms create host" on public.voice_rooms for insert with check (auth.uid() = host_id);
drop policy if exists "voice rooms update host" on public.voice_rooms;
create policy "voice rooms update host" on public.voice_rooms for update using (auth.uid() = host_id) with check (auth.uid() = host_id);

drop policy if exists "voice participants read authenticated" on public.voice_room_participants;
create policy "voice participants read authenticated" on public.voice_room_participants for select using (auth.role() = 'authenticated');
drop policy if exists "voice participants join self" on public.voice_room_participants;
create policy "voice participants join self" on public.voice_room_participants for insert with check (auth.uid() = user_id);
drop policy if exists "voice participants update self" on public.voice_room_participants;
create policy "voice participants update self" on public.voice_room_participants for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "voice participants leave self" on public.voice_room_participants;
create policy "voice participants leave self" on public.voice_room_participants for delete using (auth.uid() = user_id);
