# IELTS Vocabulary Product Pack

## Objective

Provide a deterministic IELTS vocabulary curriculum for Band 6.5, 7.5, and 8.0+ learners. Each entry has a definition, Vietnamese meaning, collocations, contextual example, and application prompt. The learning workflow works offline before any model is installed.

## Architecture

- `src/curriculum/ieltsVocabulary.ts` owns reviewed curriculum data and pure spaced-repetition scheduling.
- `src/pages/app/ielts/IELTSVocabularyPage.tsx` owns browser-local progress and product-pack UI.
- Existing generic AI shells are linked from the pack but remain unavailable-safe until a real local runtime passes its independent governance and benchmark gates.

## Boundaries

- Always: deterministic curriculum, explicit review ratings, device-local progress, and clear unavailable AI states.
- Ask first: external content sources, a new model/runtime dependency, schema changes, or any sync of learner vocabulary progress.
- Never: fabricate an IELTS score, generate unverified definitions/collocations, or place IELTS-specific behavior inside `src/platform/ai`.

## Verification

- `node --test test/platform/ieltsVocabulary.test.ts`
- `npm.cmd test`
- `npm.cmd run lint`
- `npm.cmd run build`

