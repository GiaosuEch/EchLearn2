# Phase 15 — Audio Coverage + Skill QA Report

## Scope

Phase 15 focuses on the core learning experience instead of adding another surface feature:

- real static audio files for everyday listening tasks
- static-audio-first playback with browser TTS fallback
- deeper listening transcript coverage
- AI placement safeguards for Vietnamese/self-language tests
- verification scripts for audio coverage, skill depth, and runtime safety

## Audio system

Runtime order:

1. Use a matching file in `public/audio/audio-manifest.json`.
2. Fall back to browser `speechSynthesis`.
3. Show a translated error if the browser cannot speak the language.

## Static audio coverage

The static starter pack now includes at least 120 unique daily-life listening MP3 files for each eSpeak-supported language:

- English
- French
- German
- Chinese / Mandarin
- Spanish
- Italian
- Portuguese
- Russian
- Vietnamese

This gives 1,080 Phase 15 listening-task audio files, plus the previous core/placement entries.

Japanese, Korean, Thai, and Arabic are intentionally kept as browser/cloud TTS fallback languages for now. They are not faked with the wrong voice.

## Skill content coverage

Each supported language exposes:

- 120 listening tasks
- 120 speaking prompts
- 120 reading passages
- 120 writing prompts

The skill content is generated around everyday situations such as greetings, ordering food, asking directions, transport, supermarket, hotel, doctor, weather, school, work, airport, social media, emergencies, and travel.

## AI placement safeguards

The AI placement engine keeps the Phase 14 safeguards:

- no `common word:` options
- no `Robert` random-person answers
- no `Missing Meaning`
- no `N/A`
- no fake reverse-meaning prompt for Vietnamese-native/Vietnamese-target learners

Vietnamese self-language placement questions use curated literacy/context/listening prompts instead of fake translation exercises.

## Verification commands run

```powershell
node scripts/verify_audio_assets.cjs
node scripts/verify_audio_coverage.cjs
node scripts/verify_skill_content_depth.cjs
node scripts/verify_exercise_diversity.cjs
node scripts/verify_ai_placement_vietnamese.cjs
node scripts/verify_ai_placement_quality.cjs
node scripts/verify_tts_language_map.cjs
node scripts/verify_audio_runtime.cjs
node scripts/verify_route_component_mapping.cjs
node scripts/verify_ai_personalization.cjs
node scripts/verify_music_integration.cjs
node scripts/verify_lesson_options.cjs
node scripts/audit_ui_i18n_runtime.cjs
node scripts/audit_i18n_hardcoded.cjs
```

## Known limitations

This is still a starter audio corpus, not a full commercial audio corpus. Full production quality should add native/cloud TTS generation for:

- Japanese
- Korean
- Thai
- Arabic
- 500–3000 vocabulary items per language
- longer IELTS/listening passages
- natural dialogue recordings

## Next recommended step

Phase 15.2 should connect progress tracking and skill sequencing more deeply:

- weak-skill adaptation
- daily review queue
- skill checkpoints
- spaced repetition for listening/speaking mistakes
- optional cloud TTS cache pipeline
