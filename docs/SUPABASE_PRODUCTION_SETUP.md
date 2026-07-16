# Supabase Production Setup — Ech Lern

End users do **not** create Supabase projects. Supabase is the hidden production backend owned by the Ech Lern app owner.

## Product model

Production mode:
- One app-owned Supabase project stores all user accounts, profiles, settings, progress, friends, chat, rooms, and IELTS attempts.
- Learners only open the website, sign up, confirm email if enabled, log in, and learn.
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are public frontend env vars and are safe only when RLS is enabled.

Developer/local mode:
- If Supabase env vars are missing, the app falls back to local MVP storage.
- Local mode is for development and demos, not production data.

## Required environment variables

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

Never put these in frontend/Vite env:
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `JWT_SECRET`
- any private API key

## Database setup

Run migrations in this order inside Supabase SQL Editor or your migration pipeline:

1. `supabase/migrations/000_init.sql`
2. `supabase/migrations/001_profiles.sql`
3. `supabase/migrations/002_progress.sql`
4. `supabase/migrations/003_social.sql`
5. `supabase/migrations/004_chat_rooms.sql`
6. `supabase/migrations/005_ielts_attempts.sql`

These migrations include RLS policies. Do not disable RLS in production.

## Auth setup

Recommended settings:
- Email/password enabled.
- Email confirmation enabled for public deployment.
- Optional Google OAuth enabled when you have OAuth credentials configured in Supabase.
- Redirect URLs include your local dev URL and deployed URL.

Example redirect URLs:
- `http://localhost:5173/*`
- `https://your-site.netlify.app/*`

## Storage note

Avatar/banner upload uses local MVP fallback unless Supabase Storage buckets are configured. This is intentional so the product does not pretend cloud upload works before storage policies are added.

## Verification

Run:

```bash
node scripts/check_supabase_env.cjs
node scripts/audit_no_service_role_frontend.cjs
node scripts/verify_supabase_migrations.cjs
node scripts/verify_auth_routes.cjs
npm run build
```

## Phase 12.9 AI onboarding migration

Run this migration after the earlier Phase 12.8 migrations:

```txt
supabase/migrations/006_ai_onboarding_music.sql
```

It adds:

- `ai_onboarding_results`: per-user self-assessed level, unique placement test, answers, and generated roadmap.
- `learning_media_saves`: optional saved music/podcast resources.

Both tables use Row Level Security. Users can only read/write their own placement and media save records.

## Optional Spotify configuration

End users do not configure Spotify. The app owner may create a Spotify Developer app and set this public frontend env var:

```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
```

Do not add any Spotify client secret to frontend code or Netlify public env vars. Browser apps should use Authorization Code with PKCE.
