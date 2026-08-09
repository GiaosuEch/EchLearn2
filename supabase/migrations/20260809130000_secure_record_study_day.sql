-- The streak writer is an authenticated RPC: direct table writes remain closed
-- and the function itself validates auth.uid() before changing any row.
revoke all on function public.record_study_day(date) from public, anon;
grant execute on function public.record_study_day(date) to authenticated;
alter function public.record_study_day(date) set search_path = public, pg_temp;
