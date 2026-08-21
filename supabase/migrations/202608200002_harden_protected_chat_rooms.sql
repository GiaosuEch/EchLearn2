-- Enforce protected-room passwords at the database trust boundary. Previously
-- clients could insert their own membership row without checking password_hash.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create or replace function private.is_chat_room_creator(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.chat_rooms
    where id = p_room_id and created_by = (select auth.uid())
  );
$$;

revoke all on function private.is_chat_room_creator(uuid) from public, anon, authenticated;

create or replace function private.hash_chat_room_password()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.password_hash is null or btrim(new.password_hash) = '' then
    new.password_hash := null;
  elsif tg_op = 'INSERT' or new.password_hash is distinct from old.password_hash then
    if length(new.password_hash) < 8 or length(new.password_hash) > 128 then
      raise exception 'room password must contain 8 to 128 characters' using errcode = '22023';
    end if;
    new.password_hash := extensions.crypt(new.password_hash, extensions.gen_salt('bf', 10));
  end if;
  return new;
end;
$$;

revoke all on function private.hash_chat_room_password() from public, anon, authenticated;

drop trigger if exists hash_chat_room_password_before_write on public.chat_rooms;

-- Hash legacy plaintext room passwords before enabling the write trigger.
update public.chat_rooms
set password_hash = extensions.crypt(password_hash, extensions.gen_salt('bf', 10))
where password_hash is not null
  and password_hash <> ''
  and password_hash not like '$2%';

create trigger hash_chat_room_password_before_write
before insert or update of password_hash on public.chat_rooms
for each row execute function private.hash_chat_room_password();

drop policy if exists "Users can join rooms" on public.chat_room_members;
drop policy if exists "chat members join self" on public.chat_room_members;
drop policy if exists "Room creators add themselves as owner" on public.chat_room_members;
create policy "Room creators add themselves as owner"
on public.chat_room_members
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'owner'
  and private.is_chat_room_creator(room_id)
);

create or replace function public.join_chat_room(
  p_room_id uuid,
  p_password text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_password_hash text;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select password_hash into v_password_hash
  from public.chat_rooms
  where id = p_room_id;

  if not found then
    return false;
  end if;

  if v_password_hash is not null and (
    p_password is null
    or length(p_password) > 128
    or extensions.crypt(p_password, v_password_hash) <> v_password_hash
  ) then
    return false;
  end if;

  insert into public.chat_room_members (room_id, user_id, role)
  values (p_room_id, v_user_id, 'member')
  on conflict (room_id, user_id) do nothing;

  return true;
end;
$$;

revoke all on function public.join_chat_room(uuid, text) from public, anon;
grant execute on function public.join_chat_room(uuid, text) to authenticated;
