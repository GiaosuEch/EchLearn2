alter table public.streaks enable row level security;

grant select on table public.streaks to authenticated;
revoke all on table public.streaks from anon;

drop policy if exists "Learners read their own streak" on public.streaks;
create policy "Learners read their own streak"
on public.streaks for select to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.record_study_day(p_study_date date default (timezone('utc', now()))::date)
returns table(current_streak integer, longest_streak integer, last_active_date date, did_advance boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  current_row public.streaks%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.streaks (user_id, current_streak, longest_streak, last_active_date)
  values (actor_id, 0, 0, null)
  on conflict (user_id) do nothing;

  select * into current_row
  from public.streaks
  where user_id = actor_id
  for update;

  if current_row.last_active_date is not null and current_row.last_active_date >= p_study_date then
    return query select current_row.current_streak, current_row.longest_streak, current_row.last_active_date, false;
    return;
  end if;

  if current_row.last_active_date = p_study_date - 1 then
    current_row.current_streak := current_row.current_streak + 1;
  else
    current_row.current_streak := 1;
  end if;
  current_row.longest_streak := greatest(current_row.longest_streak, current_row.current_streak);
  current_row.last_active_date := p_study_date;

  update public.streaks
  set current_streak = current_row.current_streak,
      longest_streak = current_row.longest_streak,
      last_active_date = current_row.last_active_date
  where user_id = actor_id;

  return query select current_row.current_streak, current_row.longest_streak, current_row.last_active_date, true;
end;
$$;

revoke all on function public.record_study_day(date) from public;
grant execute on function public.record_study_day(date) to authenticated;
