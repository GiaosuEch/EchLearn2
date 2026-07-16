# Phase 18 - Production QA, Deploy Readiness, and Real User Flow

## Goal

Phase 18 stops adding broad new features and turns Ech Lern into a build that can be tested like a real product. The focus is the complete user journey:

1. Register or log in.
2. Choose native and target language.
3. Complete AI onboarding or continue an existing roadmap.
4. Land on a dashboard with an adaptive daily plan.
5. Study a lesson or practice skill.
6. Save progress, XP, mastery, and review schedule.
7. Return to dashboard and see the recommendation update.
8. Use settings, profile, community, chat, and rooms without blank pages.
9. Deploy with Supabase production mode or local fallback mode.

## What changed

- Added dashboard aliases so both `/app` and `/app/dashboard` render the dashboard.
- Added course alias so `/app/courses` and `/app/roadmap` both render the roadmap.
- Localized the login and forgot password runtime screens with the same lightweight i18n helper used by registration and onboarding.
- Hardened auth error rendering so empty red error boxes are not shown.
- Added a production readiness registry in `src/services/productionReadinessService.ts` for smoke routes and manual acceptance steps.
- Added Phase 18 verification scripts.
- Added `npm run verify:phase18` and `npm run verify:all`.
- Added a Node engine note because the current React Router dependency requires a newer Node 22 build.

## Verification scripts added

- `scripts/verify_route_smoke.cjs`
- `scripts/verify_user_flow.cjs`
- `scripts/verify_supabase_runtime_contract.cjs`
- `scripts/verify_no_blank_pages.cjs`
- `scripts/verify_no_empty_error_boxes.cjs`
- `scripts/verify_i18n_runtime_pages.cjs`
- `scripts/verify_deploy_readiness.cjs`

Run:

```bash
npm run verify:phase18
```

For the broad project gate, run:

```bash
npm run verify:all
npm run build
```

## Manual QA checklist

### Auth and onboarding

- `/register` renders without a blank red error box.
- After account creation, new users go to `/app/ai-onboarding?fresh=1`.
- `/login` is localized when interface language is Vietnamese.
- `/forgot-password` is localized and never shows an empty error box.

### Route smoke

These routes must render visible content:

- `/app`
- `/app/dashboard`
- `/app/courses`
- `/app/roadmap`
- `/app/lesson`
- `/app/practice`
- `/app/listening`
- `/app/speaking`
- `/app/reading`
- `/app/writing`
- `/app/vocabulary`
- `/app/grammar`
- `/app/music`
- `/app/ielts`
- `/app/profile`
- `/app/settings`
- `/app/community`
- `/app/community/friends`
- `/app/community/chat`
- `/app/community/voice-rooms`

### Supabase production

- End users do not create Supabase.
- App owner sets `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- `VITE_SUPABASE_URL` must be the base project URL and must not include `/rest/v1`.
- No `service_role`, `DATABASE_URL`, or JWT secret is used in frontend env.
- Migrations `000` through `008` are available and contain RLS policies.

### Deployment

- Netlify publish directory is `dist`.
- SPA redirect points unknown routes to `/index.html`.
- Public env vars are configured in Netlify.
- Build runs on Node `>=22.22.0`.

## Known limitations

- Phase 18 is a production QA/deploy readiness pass, not a full manual browser automation suite.
- Scripts are static smoke gates; final verification still needs browser testing with real Supabase credentials.
- Japanese, Korean, Thai, and Arabic still rely on browser TTS unless a real audio corpus is added later.
- Writing and speaking feedback remains local estimate unless a real AI scoring backend is added.

## Final acceptance gate

Do not deploy publicly until all of this is true:

- `npm run verify:all` passes.
- `npm run build` passes on the target machine.
- Supabase migrations 000-008 have been applied.
- Register -> AI onboarding -> dashboard -> lesson/practice -> dashboard update works in browser.
- No blank pages appear in the main route smoke list.
