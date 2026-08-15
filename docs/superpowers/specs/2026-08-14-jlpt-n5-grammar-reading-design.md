# JLPT N5 Grammar and Reading Design

## Goal

Replace the Japanese grammar and reading placeholders with two deterministic N5 lessons that work offline, preserve question-level SM-2 review, and expose lesson-level unlock/completion state to the JLPT skill tree.

## Content boundary

`src/curriculum/jlptN5Lessons.ts` is the Japanese product-pack content boundary. It contains exactly two authored lessons: `grammar-1` for 「A は B です」 and `reading-1` for a short morning-routine passage. Japanese is represented as `JapaneseSegment` values so the UI renders every annotated term through `FuriganaText`. No network, model, generated content, or answer shuffling is used.

## Progress model

`srsStore` continues to apply SM-2 to every reviewable question using namespaced IDs such as `jlpt:n5:grammar-1:q1`. A separate persisted `lessonProgress` map records attempt count, last score, best score, percentage, and completion. Completion is deterministic at 80%; progress is the best achieved percentage so a later weak retry cannot erase an unlocked lesson.

Grammar is unlocked once legacy vocabulary review progress reaches 50%. Reading is unlocked after `grammar-1` is completed. The dashboard excludes `jlpt:` IDs from the vocabulary prerequisite count, preventing grammar or reading reviews from unlocking their own prerequisites.

## Experience

Grammar shows rule explanation, formula, furigana examples, then one answerable question at a time. Reading shows a furigana passage, multiple-choice questions, and per-question analysis after submission. Correct, incorrect, and completed events emit Happy, Sad, and Celebrate mascot feedback respectively. XP is 10 per correct answer plus a 20 XP completion bonus.

## Verification

A node test asserts both lessons are fully authored local data and validates the 80% completion / XP rules. Type-checking and the production build validate page, route, store, and Tailwind class integration.
