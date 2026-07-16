-- Phase 20: Discord-style profile polish and community configuration.
-- End users do not create Supabase; this is owner/developer migration only.

alter table if exists public.profiles
  add column if not exists discord_handle text,
  add column if not exists profile_nameplate_id text default 'frog-default',
  add column if not exists profile_status_emoji text default '🐸',
  add column if not exists featured_widget_ids text[] default array['learning-board','mascot-style','social-card'];

alter table if exists public.user_settings
  add column if not exists discord_channel_url text,
  add column if not exists show_discord_cta boolean default true;
