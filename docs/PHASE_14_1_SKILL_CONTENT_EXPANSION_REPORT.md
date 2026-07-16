# Phase 14.1 — Skill Content Expansion Report

## Goal

Fix the thin content problem in the core skill areas before moving to Phase 15.

The user specifically reported that the sidebar skill sections were too shallow:

- Listening / Nghe
- Speaking / Nói
- Reading / Đọc
- Writing / Viết

The old runtime fallback only had about 1–2 examples per target language, which is not enough for real learning.

## Product decision

This phase expands the runtime content generator so every supported target language now exposes at least 100 practice items per core skill.

Actual target count used:

- 120 listening tasks per language
- 120 speaking prompts per language
- 120 reading passages per language
- 120 writing prompts per language

For 13 target languages, that produces:

- 1,560 listening tasks
- 1,560 speaking prompts
- 1,560 reading passages
- 1,560 writing prompts
- 6,240 total core-skill practice items

## Supported target languages

- English
- French
- German
- Chinese
- Japanese
- Korean
- Spanish
- Italian
- Portuguese
- Russian
- Vietnamese
- Thai
- Arabic

## Content design

The expanded content is based on daily-life situations rather than abstract textbook-only topics.

Daily-life coverage includes:

- greetings
- ordering coffee/food
- asking directions
- transport
- supermarket shopping
- asking prices and paying
- hotel booking
- doctor/pharmacy
- weather
- self introduction
- morning routine
- school
- work
- meeting friends
- phone calls
- texting
- airport
- public facilities
- hobbies
- music/podcasts
- food delivery
- housing/address
- apologies and thanks
- weekends
- time and appointments
- family
- photos/social media
- emergency situations
- travel review

## YouTube / video examples

The app does not download or rehost YouTube videos.

Instead, each generated task includes YouTube search links for legal reference discovery, for example:

- beginner listening example
- pronunciation example
- daily-life conversation example
- writing/speaking model search

This avoids pretending that the app owns or embeds copyrighted video content. The UI labels the links as YouTube search references.

## Files changed

- `src/services/targetLanguageContent.ts`
- `src/data/languages.ts`
- `src/pages/app/practice/ListeningPracticePage.tsx`
- `src/pages/app/practice/ReadingPracticePage.tsx`
- `src/pages/app/practice/SpeakingPracticePage.tsx`
- `src/pages/app/practice/WritingPracticePage.tsx`
- `scripts/verify_skill_content_depth.cjs`

## Verification

Passed:

```bash
node scripts/verify_skill_content_depth.cjs
node scripts/verify_audio_assets.cjs
node scripts/verify_exercise_diversity.cjs
node scripts/verify_ai_placement_quality.cjs
node scripts/verify_lesson_options.cjs
node scripts/audit_ui_i18n_runtime.cjs
node scripts/audit_i18n_hardcoded.cjs
```

Build note:

`npm run build` could not run in the sandbox because dependencies are not installed in the extracted source. On a local machine, run:

```bash
npm install
npm run build
npm run dev
```

## Known limitations

This phase expands structured MVP content. It is not yet a fully hand-authored professional curriculum with human-recorded audio/video for all 6,240 items.

The correct next step is Phase 15:

- real audio corpus pipeline
- cloud TTS or recorded audio packs
- progressive unlock by CEFR level
- spaced repetition across all generated daily-life content
- deeper manual review of top 500 items per language
