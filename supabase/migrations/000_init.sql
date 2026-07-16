-- Ech Lern Phase 12.8 base setup
-- Run this once in the app owner's Supabase project. End users do not run this.

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
