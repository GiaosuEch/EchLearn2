# Phase 13 Audio Runtime Fix Report

## Video review

Reviewed `20260714-1200-20.3426281.mp4`.

Visible issues:

1. AI placement/listening questions displayed speaker controls, but the audio action did not reliably play.
2. AI onboarding test used listening items, but the `SpeakerButton` call in the AI placement page used legacy props (`text`, `language`, `size="sm"`) while the shared component only accepted `word`, `languageId`, and numeric `size`. This could result in an empty text value and no audio.
3. IELTS listening data referenced static files under `/mock-audio/*.mp3`, but no audio files existed in the project.
4. Audio code was split across `ttsService`, `audioService`, `useTextToSpeech`, and `SpeakerButton`, increasing the chance that one page would silently fail while another worked.
5. Browser TTS errors were not consistently surfaced to the user.

## Fixes applied

### Shared TTS runtime

Updated `src/services/ttsService.ts`:

- Centralized SpeechSynthesis playback.
- Supports all 13 target languages through locale mapping.
- Accepts both language ids (`ja`) and locales (`ja-JP`).
- Loads browser voices safely using `speechSynthesis.onvoiceschanged` with timeout fallback.
- Cancels previous speech before new playback.
- Resumes paused SpeechSynthesis after route changes/cancel.
- Shows translated visible errors for blocked/failed/missing audio.
- Adds timeout guard so UI is not stuck in loading state if a browser does not fire `onend`.

### SpeakerButton compatibility

Updated `src/components/audio/SpeakerButton.tsx`:

- Accepts canonical props: `word`, `languageId`.
- Accepts legacy aliases: `text`, `language`.
- Accepts numeric and named sizes: `xs`, `sm`, `md`, `lg`, `xl`.
- Does not silently fail on empty audio text.
- Shows loading/error state.
- Adds diagnostic attributes: `data-audio-text` and `data-audio-lang`.

### AI placement test audio

Updated `src/pages/app/onboarding/AIOnboardingPage.tsx`:

- Listening questions now call `<SpeakerButton word={q.targetText} languageId={targetLanguage} />`.
- This fixes the video issue where test audio buttons did not play.

### Hook and legacy service alignment

Updated `src/hooks/useTextToSpeech.ts`:

- Now awaits `ttsService.speak()`.
- Properly reports errors and speaking state.

Updated `src/services/audioService.ts`:

- Routes transcript/pronunciation playback through the same robust `ttsService`.
- Keeps `playUrl()` for future real audio files.

### Missing static audio references

Updated `src/data/ieltsData.ts`:

- Removed references to missing `/mock-audio/listening-s1.mp3` and `/mock-audio/listening-s2.mp3`.
- IELTS Listening currently uses transcript TTS instead of fake/missing audio files.

## Audio asset audit

No static audio files are present in `public` or `src`.

That is acceptable for the current MVP because the app uses browser Text-to-Speech for:

- AI placement listening questions
- Lesson dictation/listening questions
- Vocabulary pronunciation
- Listening practice transcripts
- IELTS listening transcripts

If real recorded audio is added later, it should be placed under `public/audio/...` and referenced explicitly.

## New verification script

Added:

```bash
node scripts/verify_audio_runtime.cjs
```

It verifies:

- TTS service uses SpeechSynthesis.
- Blocked/failed audio errors are visible.
- SpeakerButton supports AI placement aliases.
- `useTextToSpeech` awaits playback.
- AI onboarding listening questions render speaker controls.
- Static audio references point to real files or are removed.
- All 13 language locales are covered.

## Commands run

```bash
node scripts/verify_audio_runtime.cjs
node scripts/verify_tts_language_map.cjs
node scripts/verify_ai_placement_quality.cjs
node scripts/verify_route_component_mapping.cjs
node scripts/verify_ai_personalization.cjs
node scripts/verify_music_integration.cjs
node scripts/verify_vocab_counts.cjs
node scripts/audit_vocab_quality.cjs
node scripts/verify_lesson_options.cjs
node scripts/audit_ui_i18n_runtime.cjs
node scripts/audit_i18n_hardcoded.cjs
```

All commands passed in the patch environment.

## Manual acceptance checklist

1. Go to `/app/ai-onboarding`.
2. Choose a self-rated level.
3. For listening questions, click the speaker icon.
4. Expected: browser speaks the target word in the target language.
5. If the browser has no compatible voice, expected: visible translated error, not silent failure.
6. Go to `/app/lesson` and test dictation/listening item.
7. Go to `/app/listening` and click the transcript play button.
8. Go to `/app/ielts/listening` and click play.
9. No page should reference missing static audio files.

## Known limitations

- This is browser TTS, not studio-recorded native-speaker audio.
- Voice availability depends on Windows/Edge/Chrome installed voices.
- For production-level audio, add real recorded audio packs or cloud TTS generation later.
