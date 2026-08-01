-- Migration: Assign Admin Role to Khounguyennguyen2012@gmail.com

-- 1. Ensure role column exists in public.profiles
alter table public.profiles add column if not exists role text not null default 'user';

-- 2. Update existing profile for Khounguyennguyen2012@gmail.com if present
update public.profiles
set role = 'admin',
    display_name = 'GiaosuEch'
where lower(email) = 'khounguyennguyen2012@gmail.com';

-- 3. Update handle_new_user trigger to assign admin role to Khounguyennguyen2012@gmail.com
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean;
  user_role text;
  user_display text;
  user_name text;
begin
  is_admin := (lower(new.email) = 'khounguyennguyen2012@gmail.com');
  user_role := case when is_admin then 'admin' else 'user' end;
  user_display := case when is_admin then 'GiaosuEch' else coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1), 'Learner') end;
  user_name := case when is_admin then 'GiaosuEch' else lower(regexp_replace(coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1), 'learner'), '[^a-zA-Z0-9_]+', '', 'g')) || '_' || substr(new.id::text, 1, 6) end;

  insert into public.profiles (
    id,
    email,
    display_name,
    username,
    role,
    native_language,
    interface_language,
    target_languages
  ) values (
    new.id,
    new.email,
    user_display,
    user_name,
    user_role,
    coalesce(new.raw_user_meta_data ->> 'native_language', 'vi'),
    coalesce(new.raw_user_meta_data ->> 'interface_language', new.raw_user_meta_data ->> 'native_language', 'vi'),
    coalesce((select array_agg(value::text) from jsonb_array_elements_text(coalesce(new.raw_user_meta_data -> 'target_languages', '["en"]'::jsonb)) as value), array['en'])
  ) on conflict (id) do update set
    role = excluded.role,
    display_name = excluded.display_name;

  insert into public.user_settings (user_id, native_language, interface_language, target_language, theme)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'native_language', 'vi'),
    coalesce(new.raw_user_meta_data ->> 'interface_language', new.raw_user_meta_data ->> 'native_language', 'vi'),
    coalesce((new.raw_user_meta_data -> 'target_languages' ->> 0), 'en'),
    'light'
  ) on conflict (user_id) do nothing;

  return new;
end;
$$;
