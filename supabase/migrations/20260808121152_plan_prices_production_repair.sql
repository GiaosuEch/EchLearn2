-- Repair the missing server-authoritative public pricing table.
-- This intentionally covers only pricing: profile/subscription changes remain
-- in their dedicated migration to avoid coupling unrelated production changes.

create table if not exists public.plan_prices (
  plan_id text primary key check (plan_id in ('free', 'go', 'plus', 'pro')),
  price text not null,
  original_price text,
  period text not null,
  badge text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

alter table public.plan_prices enable row level security;

grant select on table public.plan_prices to anon, authenticated;
revoke insert, update, delete on table public.plan_prices from anon, authenticated;

drop policy if exists "Anyone can read plan prices" on public.plan_prices;
create policy "Anyone can read plan prices"
on public.plan_prices
for select
to anon, authenticated
using (true);

insert into public.plan_prices (plan_id, price, original_price, period, badge) values
  ('free', '0 VNĐ', null, '90 Ngày dùng thử', null),
  ('go', '199.000 VNĐ', '299.000 VNĐ', '6 Tháng (~33k/tháng)', null),
  ('plus', '399.000 VNĐ', '599.000 VNĐ', '12 Tháng (~33k/tháng)', 'Phổ biến nhất'),
  ('pro', '799.000 VNĐ', '1.299.000 VNĐ', 'Trọn đời (Dùng mãi mãi)', 'VIP Trọn Đời')
on conflict (plan_id) do nothing;

create or replace function public.admin_set_plan_price(
  p_plan_id text,
  p_price text,
  p_original_price text,
  p_period text,
  p_badge text
)
returns public.plan_prices
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  result public.plan_prices;
begin
  if not public.is_giaosuech_admin() then
    raise exception 'GiaosuEch administrator access is required' using errcode = '42501';
  end if;

  if p_plan_id not in ('free', 'go', 'plus', 'pro') then
    raise exception 'Unsupported plan id' using errcode = '22023';
  end if;

  if coalesce(btrim(p_price), '') = '' then
    raise exception 'Price is required' using errcode = '22023';
  end if;

  insert into public.plan_prices (plan_id, price, original_price, period, badge, updated_at, updated_by)
  values (
    p_plan_id,
    btrim(p_price),
    nullif(btrim(coalesce(p_original_price, '')), ''),
    coalesce(nullif(btrim(coalesce(p_period, '')), ''), 'Trọn đời'),
    nullif(btrim(coalesce(p_badge, '')), ''),
    now(),
    (select auth.uid())
  )
  on conflict (plan_id) do update set
    price = excluded.price,
    original_price = excluded.original_price,
    period = excluded.period,
    badge = excluded.badge,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by
  returning * into result;

  return result;
end;
$$;

revoke all on function public.admin_set_plan_price(text, text, text, text, text) from public, anon;
grant execute on function public.admin_set_plan_price(text, text, text, text, text) to authenticated;

alter table public.plan_prices replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'plan_prices'
    ) then
      alter publication supabase_realtime add table public.plan_prices;
    end if;
  end if;
end;
$$;
