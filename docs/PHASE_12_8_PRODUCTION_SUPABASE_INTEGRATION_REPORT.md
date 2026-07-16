# Phase 12.8 — Production Supabase Integration Report

## Decision

Ech Lern now treats Supabase as app-owned infrastructure. Learners do not create Supabase projects. They only sign up/log in inside Ech Lern.

## Backend modes

### Production mode

When both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present and valid, the app runs in Supabase mode:
- Supabase auth handles signup/login/session.
- Profiles load from `profiles`.
- Settings save to `user_settings`.
- Progress tables exist for XP, lessons, vocabulary mastery, writing, speaking, and IELTS attempts.
- Social/chat/room tables have RLS-first policies.

### Local MVP mode

When env vars are missing, the app uses local fallback mode:
- Local demo accounts and localStorage persistence work.
- The top bar shows Local Mode.
- This is for development/demo only.

## Security summary

- `src/lib/supabase.ts` rejects `/rest/v1` URLs.
- Frontend never uses service-role/private keys.
- `audit_no_service_role_frontend.cjs` scans frontend files.
- Migrations enable RLS and use `auth.uid()` ownership checks.

## Auth flow status

- Email/password login: wired.
- Signup: wired with native/target language metadata.
- Email confirmation UX: Vietnamese confirmation message included.
- Password reset: wired to Supabase when configured, local no-op fallback otherwise.
- OAuth buttons: wired to Supabase Google/GitHub when configured, honest local-mode error otherwise.

## Persistence status

- Profile: Supabase/local fallback.
- Settings: Supabase/local fallback via `settingsService`.
- Progress schema: ready for Supabase persistence.
- Social/chat/rooms schema: ready with RLS.
- IELTS attempts schema: ready with local-estimate language.

## Deployment status

Added:
- `.env.example`
- `netlify.toml`
- `docs/SUPABASE_PRODUCTION_SETUP.md`
- `docs/DEPLOYMENT_NETLIFY.md`
- verification scripts

## Known limitations

- Supabase Storage buckets/policies for real cloud avatar/banner upload are not enabled yet; local MVP upload remains honest fallback.
- True realtime chat subscriptions are not required for this phase; stored messages are supported by schema/service foundations.
- Live voice/video requires WebRTC/LiveKit integration; current voice rooms are metadata/chat MVP.

## Verification run in sandbox

Passed:

```bash
node scripts/check_supabase_env.cjs
node scripts/audit_no_service_role_frontend.cjs
node scripts/verify_supabase_migrations.cjs
node scripts/verify_auth_routes.cjs
node scripts/verify_vocab_counts.cjs
node scripts/audit_vocab_quality.cjs
node scripts/verify_lesson_options.cjs
node scripts/audit_ui_i18n_runtime.cjs
node scripts/audit_i18n_hardcoded.cjs
```

`npm run build` should be run on the user's Windows machine after `npm install`. The sandbox install was incomplete due package install timeout, so final production build is intentionally left for the local environment.
