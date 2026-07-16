# Phase 12.7 — All-Language Runtime Completion Report

## Scope completed

This repair pass focused on runtime behavior, not just data counts.

### Implemented fixes

- Rebuilt `LessonPlayerPage.tsx` so it no longer crashes on missing exercise data.
- Lesson answer choices are normalized before render.
- Lesson meaning quizzes now use the user's native/base language for answers.
- Lesson player no longer renders `Missing Meaning`, `N/A`, `Meaning:` prefixes, blank options, or the target word as its own meaning.
- Lesson UI labels use i18n keys for progress, exercise type, instructions, buttons, feedback, fallback states, and errors.
- Rebuilt the vocabulary trainer to load chunked vocabulary for the selected target language and show meanings in the native language.
- Vocabulary trainer now supports flashcards, quiz, fill, match, search, level filter, topic filter, weak-first review, mastery state, and speaker buttons.
- Rebuilt settings so interface/native/target language are separate and persist in Zustand/local storage.
- Settings now applies interface language, theme, font size, sound effects, speech speed, daily XP goal, IELTS target band, and privacy immediately.
- Rebuilt `TopBar` language selector with fixed high z-index dropdown to avoid card clipping.
- Rebuilt `AppLayout` navigation to avoid invalid hook usage and translate sidebar sections/items.
- Rebuilt writing and speaking practice pages with translated UI, real prompts, editor/recorder, local feedback, and persistence.
- Rebuilt profile and edit-profile MVP with avatar/banner upload using local data URLs when Supabase Storage is not configured.
- Improved TTS service using `SpeechSynthesisUtterance`, BCP-47 language mapping, voice loading, error handling, and visible translated errors.
- Added route aliases for `/app/community/friends`, `/app/community/chat`, and `/app/community/voice-rooms`.
- Updated locale files for broader UI coverage across supported interface languages.

## Verification commands run

```bash
node scripts/verify_vocab_counts.cjs
node scripts/audit_vocab_quality.cjs
node scripts/verify_lesson_options.cjs
node scripts/audit_ui_i18n_runtime.cjs
node scripts/audit_i18n_hardcoded.cjs
```

All five verification scripts passed.

## Vocabulary count status

All supported learning languages have 3000 vocabulary entries:

- English: PASS
- French: PASS
- German: PASS
- Chinese: PASS
- Japanese: PASS
- Korean: PASS
- Spanish: PASS
- Italian: PASS
- Portuguese: PASS
- Russian: PASS
- Vietnamese: PASS
- Thai: PASS
- Arabic: PASS

## Manual QA matrix to run on Windows

Run locally with:

```powershell
npm install
npm run dev
```

Then test:

1. Interface Language = Vietnamese, Native Language = Vietnamese, Target Language = Japanese.
   - UI should be Vietnamese.
   - Learning content should be Japanese.
   - Answer meanings should be Vietnamese.
   - Speaker should play Japanese or show a translated error.
2. Interface Language = Spanish, Native Language = Vietnamese, Target Language = Japanese.
   - UI should be Spanish.
   - Learning content should remain Japanese.
   - Answer meanings should remain Vietnamese.
3. Interface Language = German, Native Language = Vietnamese, Target Language = English.
   - UI should be German.
   - Learning content should be English.
   - Answer meanings should be Vietnamese.
4. Visit `/app/lesson`, `/app/vocabulary`, `/app/writing`, `/app/speaking`, `/app/profile`, `/app/settings`, `/app/friends`, `/app/chat`, `/app/voice-rooms`.
   - No blank dark pages.
   - No `Missing Meaning`.
   - No blank answer choices.
   - No `Meaning:` prefixes.
   - No hardcoded `Check` / `Next Question` when interface language is not English.

## Known limitations

- Real voice/video calling still requires WebRTC/LiveKit integration. Current voice rooms support room state/UI and should honestly show the limitation if backend calling is not connected.
- Avatar/banner upload is MVP local data URL storage when Supabase Storage is not configured.
- IELTS scoring remains a local estimate and must be displayed as not official IELTS scoring.
- The source package intentionally excludes `.env`, `node_modules`, and `dist`.
