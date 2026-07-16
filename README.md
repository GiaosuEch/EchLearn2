# Ech Lern

Ech Lern is an AI-assisted language learning web app built with React, Vite, TypeScript, Supabase-ready persistence, multilingual UI, lessons, vocabulary, IELTS practice, profile, community, chat, and room MVP flows.

## Important product rule

Normal learners do **not** create Supabase projects.

Supabase is the hidden backend owned by the app owner. A learner should only:

1. Open the deployed website.
2. Sign up or log in.
3. Choose native/interface/target languages.
4. Learn and save progress.

## Backend modes

### Production Supabase mode

Set these env vars in Netlify/Vercel/local `.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

Do not include service-role/private secrets in frontend env.

### Local MVP mode

If env vars are missing, the app runs with localStorage fallback. This is useful for development and demos.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Production setup docs

- `docs/SUPABASE_PRODUCTION_SETUP.md`
- `docs/DEPLOYMENT_NETLIFY.md`
- `docs/PHASE_12_8_PRODUCTION_SUPABASE_INTEGRATION_REPORT.md`

## Verification

```bash
node scripts/check_supabase_env.cjs
node scripts/audit_no_service_role_frontend.cjs
node scripts/verify_supabase_migrations.cjs
node scripts/verify_auth_routes.cjs
node scripts/verify_vocab_counts.cjs
node scripts/audit_vocab_quality.cjs
node scripts/verify_lesson_options.cjs
node scripts/audit_ui_i18n_runtime.cjs
npm run build
```

## Supabase migrations

Run in order for the app owner's production Supabase project:

1. `supabase/migrations/000_init.sql`
2. `supabase/migrations/001_profiles.sql`
3. `supabase/migrations/002_progress.sql`
4. `supabase/migrations/003_social.sql`
5. `supabase/migrations/004_chat_rooms.sql`
6. `supabase/migrations/005_ielts_attempts.sql`


### Phase 15 — Audio Coverage + Skill QA

Phase 15 adds real static WAV audio coverage for daily-life listening tasks in supported eSpeak languages, keeps browser/cloud TTS fallback for languages without reliable local voices, and adds stricter QA scripts for audio coverage and skill content depth. See `docs/PHASE_15_AUDIO_COVERAGE_AND_SKILL_QA_REPORT.md`.


## Phase 17 — Practice Integration + Feedback

Core practice pages now write results into the adaptive learning engine. Writing and speaking have honest local feedback, persistence, and Supabase/local fallback. Run `supabase/migrations/008_practice_feedback.sql` for production persistence.
