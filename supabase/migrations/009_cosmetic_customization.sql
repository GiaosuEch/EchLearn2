-- Phase 19: Discord-like customization and mascot skin settings.
-- End users do not create Supabase; this is owner/developer migration only.

alter table if exists public.user_settings
  add column if not exists accent_palette_id text default 'frog-default',
  add column if not exists mascot_skin_id text default 'frog-starter-001',
  add column if not exists ui_surface text default 'glass' check (ui_surface in ('glass', 'solid', 'cozy', 'compact')),
  add column if not exists mascot_animation boolean default true,
  add column if not exists seasonal_effects boolean default true;
