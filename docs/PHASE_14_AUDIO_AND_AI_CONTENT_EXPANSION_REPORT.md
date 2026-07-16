# Phase 14 — Real Audio Starter Pack + AI/Test/Exercise Quality Repair

## Why this phase was needed

Video review showed three core problems:

1. Audio/test speaker buttons were still unreliable.
2. The project had no real static audio files; it depended on browser TTS only.
3. AI placement and lesson exercises were still too thin and could produce poor Vietnamese-learning prompts.

## Audio system changes

### Added static audio pack

A starter static audio pack was generated under:

```txt
public/audio/core/
public/audio/audio-manifest.json
```

Generated static audio languages:

- English
- French
- German
- Chinese/Mandarin
- Spanish
- Italian
- Portuguese
- Russian
- Vietnamese

Total generated audio files: **75**.

### Honest fallback languages

The local sandbox has no reliable offline voices for Japanese, Korean, Thai, and Arabic file generation. For those languages the app keeps browser/cloud TTS fallback and declares that honestly in the manifest.

Fallback languages:

- Japanese
- Korean
- Thai
- Arabic

### Runtime behavior

The app now uses this order:

1. If a matching static file exists in `audio-manifest.json`, play the file.
2. If no file exists, use browser SpeechSynthesis TTS.
3. If TTS cannot play, show a visible translated error instead of silently failing.

Files changed:

- `src/services/audioManifestService.ts`
- `src/services/audioService.ts`
- `src/components/audio/SpeakerButton.tsx`
- `src/hooks/useTextToSpeech.ts`
- `scripts/generate_core_audio_pack.cjs`
- `scripts/verify_audio_assets.cjs`

## Exercise diversity changes

Lesson generation was expanded from a narrow multiple-choice/dictation pattern to a broader set:

- multiple choice
- listen and choose
- type what you hear
- fill in the blank
- match pairs
- translate from meaning to target word

The generator now samples more vocabulary items and guards against:

- `Missing Meaning`
- `N/A`
- `Meaning:` prefixes
- `common word:` placeholders
- proper-name distractors such as `Robert`
- English answer options when nativeLanguage is Vietnamese
- target word being used as its own answer

File changed:

- `src/curriculum/exerciseGenerator.ts`

## AI placement repair

AI placement now has a special safe path for:

```txt
targetLanguage = vi
nativeLanguage = vi
```

This avoids fake prompts like “choose the synonym for feeling” when the user is actually studying Vietnamese. It now uses a curated Vietnamese literacy/meaning bank instead.

Files changed:

- `src/services/aiLearningEngine.ts`
- `scripts/verify_ai_placement_vietnamese.cjs`

## Verification run

Passed:

```powershell
node scripts/verify_audio_assets.cjs
node scripts/verify_audio_runtime.cjs
node scripts/verify_exercise_diversity.cjs
node scripts/verify_ai_placement_vietnamese.cjs
node scripts/verify_ai_placement_quality.cjs
node scripts/verify_tts_language_map.cjs
node scripts/verify_route_component_mapping.cjs
node scripts/verify_ai_personalization.cjs
node scripts/verify_music_integration.cjs
node scripts/verify_lesson_options.cjs
node scripts/audit_ui_i18n_runtime.cjs
node scripts/audit_i18n_hardcoded.cjs
```

## Known limitations

- The static audio pack is a starter pack, not a full 39,000-file professional corpus.
- Japanese/Korean/Thai/Arabic still depend on browser/cloud TTS until licensed or generated audio is added.
- The generated audio uses local eSpeak voices, so it is functional but not as natural as professional recordings or premium cloud TTS.
- For production quality, the next step should be Cloud TTS generation + caching or a licensed audio dataset.
