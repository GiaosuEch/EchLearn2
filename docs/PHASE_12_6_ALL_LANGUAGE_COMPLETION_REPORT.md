# Phase 12.6 — All Language Runtime Completion Report

## Result

Phase 12.6 focuses on the actual runtime issues seen in manual testing: wrong lesson answer language, `Missing Meaning`, silent speaker buttons, incomplete interface-language control, and unusable lesson choices.

## Fixes Applied

### 1. Lesson answer mapping

Updated `src/curriculum/exerciseGenerator.ts` so lessons now separate language responsibilities:

- `interfaceLanguage` controls UI labels through i18n.
- `targetLanguage` controls the word/sentence being learned.
- `nativeLanguage` controls meanings, explanations, and answer options.

For meaning quizzes, the generator now:

- uses `meaningVietnamese` first when the effective native language is Vietnamese;
- strips `Meaning:` / `Nghĩa:` prefixes;
- rejects `Missing Meaning`, `N/A`, empty choices, placeholders, and target-word-as-answer choices;
- generates distractors from other vocabulary meanings in the same target language;
- includes `audioText` / `targetText` for dictation and speaker buttons.

### 2. Lesson runtime UI

Updated `src/pages/app/LessonPlayerPage.tsx` so:

- lesson regeneration responds to target language, interface language, and effective native answer language;
- dictation uses `audioText` / `targetText` instead of blindly reading `correctAnswer`;
- feedback buttons and answer labels use i18n;
- hardcoded visible strings in lesson feedback, retry, skip, finish, and match instructions were replaced.

### 3. Speaker button / audio

Updated `src/components/audio/SpeakerButton.tsx` and existing TTS flow so user-facing button titles use i18n and speaker buttons route through `ttsService`.

### 4. Full locale coverage baseline

Rewrote locale files under `src/i18n/locales/*.ts` so all 13 supported UI languages have the core namespaces used across the app:

- `common`
- `lesson`
- `vocabulary`
- `settings`
- `profile`
- `practice`
- `ielts`
- `social`

This prevents Spanish/German/Japanese/etc. from falling back to English for core lesson/vocabulary/settings labels.

### 5. Vocabulary runtime normalization

Added `scripts/normalize_vocab_for_runtime.cjs` and normalized all vocabulary JSON chunks under `public/data/vocabulary/<lang>/part-*.json`.

Normalization ensures:

- no `Meaning:` prefixes in meanings;
- no `Missing Meaning` / `N/A` in meaning fields;
- valid `pronunciationLocale` values such as `ja-JP`, `de-DE`, `vi-VN`, etc.;
- usable `meaning`, `translation`, `meaningEnglish`, and `meaningVietnamese` fields for runtime.

### 6. Verification scripts

Updated `scripts/verify_lesson_options.cjs` so it runs without unavailable `tsx` dependencies and verifies every target language against Vietnamese answer meanings.

Updated `scripts/audit_vocab_quality.cjs` so it now catches:

- `Meaning:` prefixes;
- invalid `-XX` pronunciation locales;
- empty meanings;
- `Missing Meaning` / `N/A` quality failures.

## Verification Commands Run

```bash
node scripts/verify_vocab_counts.cjs
node scripts/audit_vocab_quality.cjs
node scripts/verify_lesson_options.cjs
node scripts/audit_ui_i18n_runtime.cjs
node scripts/audit_i18n_hardcoded.cjs
npx tsc -b
```

## Verification Results

### Vocabulary counts

All supported target languages pass `3000 / 3000`:

- EN: PASS
- DE: PASS
- FR: PASS
- ES: PASS
- JA: PASS
- KO: PASS
- ZH: PASS
- IT: PASS
- PT: PASS
- RU: PASS
- VI: PASS
- TH: PASS
- AR: PASS

### Vocabulary quality

`audit_vocab_quality.cjs` passes for all 13 languages.

### Lesson options

`verify_lesson_options.cjs` passes for all 13 languages. It verifies that generated lesson options are visible, localized to Vietnamese meanings for Vietnamese-native mode, and do not contain:

- blank text;
- `Missing Meaning`;
- `N/A`;
- `Meaning:` prefixes;
- `Random option`;
- target word as its own answer.

### i18n audits

Both i18n audits pass:

- `audit_ui_i18n_runtime.cjs`
- `audit_i18n_hardcoded.cjs`

### TypeScript

`npx tsc -b` passes.

## Local Build Note

`npm run build` could not be fully completed inside the Linux sandbox because the uploaded project includes Windows-installed `node_modules` and Vite/Rolldown is missing the Linux native optional binding. This is a dependency packaging issue from moving `node_modules` across operating systems, not a TypeScript error. TypeScript compilation passes with `npx tsc -b`.

On the user’s Windows machine, run:

```powershell
npm run build
```

If Vite/Rolldown complains about optional dependencies, run:

```powershell
npm install
npm run build
```

## Manual QA to Run in Browser

1. `interfaceLanguage = vi`, `targetLanguage = ja`: lesson options should be Vietnamese meanings for Japanese words.
2. No lesson option should show `Missing Meaning`, `N/A`, `Meaning:`, or a blank option.
3. Speaker buttons should play target-language audio or show a translated browser-voice error.
4. `interfaceLanguage = es` should change core lesson/vocabulary/settings/profile labels to Spanish.
5. `interfaceLanguage = de` should change core lesson/vocabulary/settings/profile labels to German.
6. `/app/lesson`, `/app/vocabulary`, `/app/settings`, `/app/profile`, and IELTS pages should not crash or render blank black pages.

## Remaining Honest Limitation

The project now has 3000 normalized entries per supported language and runtime-safe lesson generation. However, true native-level educational quality for all 39,000 entries still requires human/editorial review over time. The app now avoids showing broken placeholder text in the learning UI and prioritizes usable runtime behavior.
