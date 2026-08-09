# EchLearn first-win onboarding design

## Goal

Deliver the real activation loop promised by the public landing: CTA to goal selection, an eight-minute starter lesson, and durable progress for the next visit.

## User flow

1. A guest opens `/first-win` from the public CTA.
2. They choose one goal (daily habit, confident speaking, or IELTS foundation) and one available target language.
3. The selection is stored as a non-sensitive browser draft. The user continues to `/register?activation=first-win&goal=<goal>&lang=<lang>`.
4. Registration preselects the language from the query and, after successful authentication, redirects to `/app/first-win?goal=<goal>` instead of the longer placement onboarding.
5. The authenticated first-win page presents a three-task starter lesson from real vocabulary for the chosen language. Completing the tasks is the completion event; no time claim is fabricated.
6. Completion writes `first_win_progress`, records one lesson completion for daily missions, and gives a link to the real lesson player.

## Data model

`first_win_progress` contains one owned record per user:

- `user_id uuid primary key` referencing `profiles(id)`
- `target_language text not null`
- `goal text not null` constrained to `habit`, `speaking`, or `ielts`
- `started_at timestamptz not null`
- `completed_at timestamptz null`
- `updated_at timestamptz not null`

The client uses Supabase only for a matching authenticated session and otherwise falls back to local storage. The exposed table has explicit authenticated grants, RLS, and owner-only SELECT/INSERT/UPDATE policies.

## Components

- `FirstWinStartPage`: public goal/language selector and registration handoff.
- `FirstWinPage`: authenticated three-task starter lesson, completion feedback, and next lesson link.
- `firstWinService`: typed draft/progress interface and safe Supabase/local persistence.
- Existing `RegisterPage` and `CinematicHero`: preserve selected intent across authentication.

## Reliability and accessibility

- Native radio inputs/fieldset labels, visible errors, keyboard-safe buttons, `aria-live` status for persistence, one h1 per page.
- The activity reads authentic vocabulary through `vocabularyService`; it never invents translation content.
- Completion is idempotent: revisiting does not add mission progress twice.
- Existing reduced-motion and Ech Buri state support remain in use.

## Verification

- Test draft encoding, first-win record mapping, session ownership guard, and completion idempotency.
- Browser test guest handoff and authenticated page shell/lesson completion.
- Apply and query the migration, then build and run relevant route tests.
