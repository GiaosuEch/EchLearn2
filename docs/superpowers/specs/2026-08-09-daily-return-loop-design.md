# Daily-return loop design

**Goal:** Give an authenticated learner one honest, actionable next step every day and make Ech Buri visibly acknowledge the learner's live progress from day two onward.

## Scope

This is the second product loop after first-win onboarding. It improves the authenticated dashboard only. It does not add reminders, notifications, payments, social proof, or a new progress table.

## Chosen approach

Use the existing deterministic daily missions and persisted `daily_mission_progress` as the source of truth. A small pure view-model selects one unfinished mission as the learner's daily focus and maps it to an existing, working learning route. The dashboard renders that single action above secondary cards.

This is preferred over a new multi-step dashboard wizard because the site already records mission events, supports remote mission hydration, and has real learning destinations. It avoids another state store and makes the dashboard's promise testable.

## Daily focus rules

1. Generate the learner's three normal daily missions using the existing date and user seed.
2. Apply the persisted counters and claimed rewards.
3. Pick the first unfinished mission in the generated order. Its action must route to a real screen:
   - `listening` → `/app/listening`
   - `speaking` → `/app/speaking`
   - `reading` → `/app/reading`
   - `writing` → `/app/writing`
   - `vocabulary` → `/app/vocabulary`
   - `grammar` → `/app/grammar`
   - `xp`, `lessons`, `perfect_lessons` → the adaptive recommended lesson, with the current language query.
4. If all daily missions are complete, show a completion state, an explicit link to claim available rewards, and no invented “tomorrow” lesson.
5. Progress copy uses real `progress / target`; it never says that a streak is at risk unless the app has real streak data.

## Ech Buri behavior

The existing vector mascot remains canonical and respects both reduced-motion and the learner's animation preference.

- Before progress: `welcome` with a clear invitation to begin the one focus.
- In progress: `thinking`; the focus card shows the exact remaining count.
- Listening focus: `listening`.
- A non-zero streak: a new `streak` state, visually distinct through a small orange flame halo and a confident bounce, not an unrelated raster asset.
- All daily missions complete: `cheering` with the existing celebration treatment.

The state is derived from actual dashboard data with this priority: daily complete → listening focus → active streak → unfinished focus → welcome. Existing lesson pages retain their more granular correct/incorrect response states.

## Accessibility and resilience

- The focus action is a semantic link with a concrete Vietnamese accessible name.
- Progress changes are announced via a short polite live region.
- The layout maintains one page `main` landmark and works from 320px upward without horizontal overflow.
- If adaptive-plan loading fails, the focus still routes to the generic current-language lesson.
- Mission data continues to use the existing local-first, matching-session Supabase sync; this work introduces no new personal-data collection.

## Validation

- Unit tests cover focus selection, route mapping, completion, and mascot-state priority.
- Browser tests seed an authenticated learner, confirm a single primary daily action, then complete a mission event and observe focus/mascot feedback change.
- Run the existing full unit suite, production build, and the focused browser suite before release.
