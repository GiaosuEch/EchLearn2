# Phase 13 — Hard QA Fix Report

## Goal
Fix the exact runtime problems found in the uploaded video review: AI placement quality, language mapping, localized roadmap text, Practice Hub i18n, route correctness, target-language learning content, TTS coverage, and music/podcast honesty.

## Top 0.1% product decision
The app should not add more shiny features while the placement test can still show bad options such as `common word: are` or `Robert`. Phase 13 prioritizes trust: every diagnostic question must use safe native-language meanings, routes must render the correct skill, and UI must respect the selected interface language.

## What changed

### AI placement quality
- Rebuilt `src/services/aiLearningEngine.ts` with stricter option normalization.
- Added forbidden placeholder guards for `common word:`, `Meaning:`, `Missing Meaning`, `N/A`, `Robert`, and random placeholder values.
- Added Vietnamese fallback/dictionary mapping for common English meanings such as `Fast -> nhanh`.
- Ensured generated diagnostic options do not equal the target word.
- Roadmap titles/goals are now Vietnamese-oriented instead of hardcoded English when shown in the Vietnamese-first app flow.

### AI onboarding UI
- Localized AI QA sidebar labels.
- Replaced `Native`, `Target`, `Score`, `AI QA`, and status items with runtime translation helpers.
- Preserved the first-step self-assessment flow with four levels: none, some, known, fluent.

### Practice Hub and Course Roadmap
- Rewrote `PracticeHubPage` to use interface-language labels.
- Patched `CourseRoadmapPage` to remove hardcoded English title/subtitle/lesson labels.

### Target-language content
- Added `src/services/targetLanguageContent.ts`.
- Added runtime target-language fallback content for listening, reading, speaking, and writing.
- For non-English target languages, Listening/Reading/Speaking/Writing now show target-language text instead of generic English-only content.

### Music and podcast lab
- Improved curated Spotify search intents per language.
- Localized listening-plan text for Vietnamese interface.
- Kept Spotify honest: if `VITE_SPOTIFY_CLIENT_ID` is missing, the app uses Spotify search fallback and does not pretend the API is connected.

### Route QA and TTS QA
- Added route verification script to ensure `/app/speaking` renders Speaking, `/app/listening` renders Listening, etc.
- Added TTS locale verification script for all 13 supported languages.

### Data cleanup
- Normalized vocabulary entries that contained `common word:` or raw `Robert` placeholders so they no longer leak into tests or option text.
- Kept 3000 words per language.

## New scripts
- `scripts/verify_ai_placement_quality.cjs`
- `scripts/verify_route_component_mapping.cjs`
- `scripts/verify_tts_language_map.cjs`

## Verification run
Passed in this environment:

```bash
node scripts/verify_ai_placement_quality.cjs
node scripts/verify_route_component_mapping.cjs
node scripts/verify_tts_language_map.cjs
node scripts/verify_ai_personalization.cjs
node scripts/verify_music_integration.cjs
node scripts/verify_vocab_counts.cjs
node scripts/audit_vocab_quality.cjs
node scripts/verify_lesson_options.cjs
node scripts/audit_ui_i18n_runtime.cjs
node scripts/audit_i18n_hardcoded.cjs
```

## Build note
`npm install` could not complete cleanly inside the sandbox because the current Node version is `v22.16.0` while `react-router@8.2.0` declares `node >=22.22.0`, and the install stalled before recreating `.bin` entries. Run the build on the user's Windows machine after installing dependencies:

```powershell
npm install
npm run build
npm run dev
```

If install fails, upgrade Node to 22.22+ or use the exact Node version required by the router package.

## Manual acceptance checklist
1. `/app/ai-onboarding` asks the self-assessed level first if no completed onboarding exists.
2. With interface/native = Vietnamese and target = Chinese, placement options are Vietnamese meanings and do not show `common word:`, `Robert`, `Missing Meaning`, or `N/A`.
3. Roadmap text is Vietnamese-first and not `Week 1: sounds and survival words`.
4. `/app/practice` is localized.
5. `/app/speaking` renders speaking practice, not listening practice.
6. `/app/listening` renders listening practice with target-language transcript.
7. `/app/reading` renders a target-language passage.
8. `/app/music` clearly shows Spotify fallback if no Client ID is configured.
