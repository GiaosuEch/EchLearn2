-- Trigger functions do not need to be callable from the Data API.  Explicit
-- search paths also prevent a caller-controlled schema from affecting them.

alter function public.update_updated_at_column() set search_path = public, pg_temp;
alter function public.handle_new_user() set search_path = public, pg_temp;
alter function public.set_updated_at() set search_path = public, pg_temp;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
