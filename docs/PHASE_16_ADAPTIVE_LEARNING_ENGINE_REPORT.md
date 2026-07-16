# Phase 16 — Adaptive Learning Engine Report

## Goal

Phase 16 turns Ech Lern from a set of independent lessons into an adaptive learning system. The app now records how the learner performs, calculates mastery, schedules reviews, and recommends what to study next.

## What changed

### Adaptive learning service

Added `src/services/adaptiveLearningEngine.ts` with:

- `LearningProfile`
- `LearningItemProgress`
- `LearningEvent`
- `TodayPlan`
- `calculateMasteryScore()`
- `scheduleNextReview()`
- `recordLearningEvent()`
- `createInitialPathFromPlacement()`
- `getTodayPlan()`

The service supports Supabase production mode and localStorage fallback mode.

### Mastery rules

Mastery is scored from 0 to 100.

- Correct on first try: +15 mastery
- Correct after mistake: +7 mastery
- Wrong answer: -5 mastery
- Repeated wrong answer: -10 mastery
- Audio replay/support signal: +1 mastery
- Typed exact answer: +15 mastery
- Typed close answer: +8 mastery
- Skipped: -8 mastery

Labels:

- 0–24: Chưa chắc
- 25–49: Đang học
- 50–74: Khá ổn
- 75–89: Gần thành thạo
- 90–100: Thành thạo

### Spaced repetition rules

- Mastery under 25 or wrong answer: review in 10 minutes
- 25–49: review in 1 day
- 50–74: review in 3 days
- 75–89: review in 7 days
- 90–100: review in 21 days

### Dashboard changes

Dashboard now shows:

- adaptive learning plan
- why the app recommends the next action
- due review count
- weak skills
- estimated study time
- recommended next lesson/action
- mastery status for due review items

### Lesson runtime integration

`LessonPlayerPage` now records every answer into the adaptive learning engine. Each attempt updates:

- correct/wrong count
- mastery score
- confidence
- next review date
- XP event
- review queue

### AI placement integration

After AI onboarding is completed or skipped, the app creates an initial learning profile with:

- estimated level
- placement score
- weak skills
- strong skills
- active learning path

This prevents placement results from being isolated from the rest of the app.

### Supabase migration

Added:

`supabase/migrations/007_learning_engine.sql`

Tables:

- `learning_profiles`
- `learning_item_progress`
- `learning_events`
- `review_queue`
- `daily_learning_plans`

RLS policies restrict rows to the authenticated owner using `auth.uid() = user_id`.

## Verification

Added scripts:

- `scripts/verify_learning_engine.cjs`
- `scripts/verify_spaced_repetition.cjs`
- `scripts/verify_progress_persistence.cjs`
- `scripts/verify_dashboard_plan.cjs`

Recommended commands:

```powershell
node scripts\verify_learning_engine.cjs
node scripts\verify_spaced_repetition.cjs
node scripts\verify_progress_persistence.cjs
node scripts\verify_dashboard_plan.cjs
node scripts\verify_audio_coverage.cjs
node scripts\verify_skill_content_depth.cjs
node scripts\verify_ai_placement_quality.cjs
node scripts\verify_lesson_options.cjs
npm run build
```

## Known limitations

- Speaking and writing still need deeper AI feedback in a later phase.
- The current adaptive system estimates mastery from local app events, not from human teacher review.
- Audio coverage exists for many languages but Japanese, Korean, Thai, and Arabic still rely more heavily on TTS fallback until real audio packs are added.

## Manual QA checklist

1. Complete AI onboarding.
2. Confirm dashboard shows an adaptive daily plan.
3. Complete a lesson.
4. Return to dashboard.
5. Confirm due reviews / weak skills update.
6. Refresh the page.
7. Confirm progress persists locally or in Supabase.
8. In Supabase production mode, verify rows appear in `learning_item_progress`, `learning_events`, and `daily_learning_plans`.
