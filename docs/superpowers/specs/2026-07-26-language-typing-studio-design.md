# Language Typing Studio Design

**Status:** Approved design; implementation waits for review of this written specification.

## Goal

Let learners transcribe what they hear in Japanese and Chinese with the device's native input method editor (IME), while offering a small learning-oriented on-screen aid. The feature must never submit or score an answer while the learner is composing a character.

## Scope

### First release

- Add a reusable LanguageTypingInput to existing Japanese and Chinese type-what-you-hear exercises in LessonPlayerPage.
- Support native device IME as the primary input method.
- Provide a Japanese kana helper board that inserts kana only at the text cursor.
- Provide a Chinese input guide: Pinyin tone reference and an explicit system-IME hint. It must not expose expected Hanzi before submit.
- Add script-aware answer comparison for ja and zh only in `type-what-you-hear`; existing matching behaviour remains unchanged for multiple-choice and other exercises.
- Do not persist IME method or composition data in this release. `LessonPlayerPage` records a direct learning event whose schema has no safe metadata field for it.
- Keep standard text inputs unchanged for other languages.

### Follow-up release

- Add a dictation exercise type to target-language listening content and render it in ListeningPracticePage.
- Reuse LanguageTypingInput in the VocabularyTrainer fill workflow.
- Extend the same input contract for future Korean, Thai, and Arabic keyboards.

## Interaction and accessibility

LanguageTypingInput receives language, value, change, submit, disabled, and optional helper settings. It renders a labelled native textarea/input with:

- lang ja-JP or zh-CN, spellCheck false, autoCapitalize off, and a clear IME hint.
- compositionstart, compositionupdate, and compositionend tracking, exposed to the parent as `isComposing`.
- Both Enter and the Check action refuse to submit while composing. The Check action is visibly disabled during composition and `checkAnswer` defensively returns without scoring in that state.
- After `compositionend`, submission uses the committed input value from the event/ref, not a possibly stale React state closure. A rapid Enter immediately after committing remains safe.
- A keyboard-operable kana helper that uses native buttons, has non-empty labels, and is hidden when the language is not Japanese. It keeps an input ref, replaces the current `selectionStart`/`selectionEnd` range, returns focus to the input, and restores the caret after the inserted kana. Its pointer interaction preserves the input selection before the button receives focus.
- An accessible instruction and a visible input-mode status that does not rely only on colour.
- no custom fake CJK conversion engine, no remote keyboard service, no raw-audio retention change.

## Answer contract

Create a pure `compareTypedAnswer(answer, expected, language, acceptedAnswers?)` function, where `expected` may be a string or the existing `Exercise.correctAnswer` string array. The caller passes every declared alternative; it must not silently drop array entries.

1. Normalize all values with Unicode NFC and trim leading/trailing whitespace.
2. Use case-insensitive comparison only for scripts that define it; Japanese and Chinese retain character case as entered.
3. Exact normalized expected text is correct.
4. An explicit normalized acceptedAnswers entry is correct.
5. Pinyin is not accepted for Hanzi, and Romaji is not accepted for Kana/Kanji, unless the lesson explicitly places that form in acceptedAnswers.
6. Punctuation/inner-space tolerance is not inferred. A lesson must explicitly declare an accepted alternate form.

The function returns a small result object containing `exact`, `acceptedAlternate`, `normalizedAnswer`, and `normalizedExpected`; UI saves the learner's original answer unchanged. For the supported Japanese/Chinese dictation branch, `isCorrect = exact || acceptedAlternate`, `typedExact = exact`, and `typedClose = false` until a separately designed near-match policy exists.

## Data and privacy

The existing direct `learning_events` flow owns raw `answer`, `correct_answer`, `typed_exact`, and `typed_close`; `practice_attempt_summaries` stores aggregate scores and metadata rather than individual answers. The first release adds no database table, schema field, or raw-audio retention. It never stores composition buffers, candidate choices, input method, or other transient IME data.

## Integration points

- LessonPlayerPage: replace the current type-what-you-hear input and unconditional Enter submit. Its existing generic matcher continues to own every other exercise; only type-what-you-hear with target ja or zh uses the new comparator branch.
- targetLanguageContent and ListeningPracticePage: follow-up dictation contract only after the shared input and comparator are verified.
- VocabularyTrainerPage: follow-up consumer of the same component.
- languageUtils/currentLanguage: source of the ja-JP and zh-CN language attributes.
- Existing adaptive learning and practice attempt APIs remain unchanged except for optional additive metadata.

## Error and fallback behaviour

- If an operating system IME is unavailable, the normal text input remains usable; Japanese learners can use kana helper keys.
- Chinese users receive an accessible Pinyin/IME setup hint rather than a fake character picker.
- A disabled exercise disables the helper buttons and submit control.
- Composition state clears on blur and compositionend without replacing typed content.

## Verification

- Node built-in tests prove NFC comparison, explicit alternate acceptance, correct handling of `string[]` answers, and rejection of unlisted Pinyin/Romaji alternatives. No new browser-test dependency is required.
- A pure `shouldSubmitFromKey({ key, isComposing })` helper and committed-value handler tests prove Enter and Check are ignored while composing, then submit the committed value after composition has ended.
- Tests cover kana insertion at a selection range and caret restoration; source contracts additionally require the input ref and composition guards.
- Existing learning-event calls remain responsible for preserving the raw answer and `typedExact` fields; this release does not claim aggregate practice summaries retain individual answers.
- Browser QA covers Japanese and Chinese native IME entry, 375/768/1024/1440 px, keyboard-only kana insertion, reduced motion, and screen-reader labels.
