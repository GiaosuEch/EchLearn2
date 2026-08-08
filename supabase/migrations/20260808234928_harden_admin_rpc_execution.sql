-- Keep the public RPC surface small: authorization runs in a non-exposed
-- helper and every privileged function resolves only explicitly qualified names.
create schema if not exists private;
revoke all on schema private from public;

create or replace function private.is_giaosuech_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as profile
    where profile.id = (select auth.uid())
      and profile.role = 'admin'
      and lower(profile.email) = 'khounguyennguyen2012@gmail.com'
  );
$$;

revoke all on function private.is_giaosuech_admin() from public, anon, authenticated;

create or replace function public.is_giaosuech_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_giaosuech_admin();
$$;

revoke all on function public.is_giaosuech_admin() from public, anon, authenticated;

alter function public.activate_course_entitlement(uuid, text, text) set search_path = '';
alter function public.admin_set_plan_price(text, text, text, text, text) set search_path = '';
alter function public.admin_set_pro_access(uuid, text, boolean) set search_path = '';

revoke all on function public.activate_course_entitlement(uuid, text, text) from public, anon;
grant execute on function public.activate_course_entitlement(uuid, text, text) to authenticated;

revoke all on function public.admin_set_plan_price(text, text, text, text, text) from public, anon;
grant execute on function public.admin_set_plan_price(text, text, text, text, text) to authenticated;

revoke all on function public.admin_set_pro_access(uuid, text, boolean) from public, anon;
grant execute on function public.admin_set_pro_access(uuid, text, boolean) to authenticated;
