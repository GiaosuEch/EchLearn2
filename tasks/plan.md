# Active Plan: Build Blocker Closure

## Objective

Make `npm run build` pass with the smallest safe changes. This is post-Phase-1 stabilization, not Phase 2. Do not touch `.env`, secrets, curriculum, public data, audio assets, or Supabase migrations unless a blocker proves it is necessary.

## Task 1: Isolate the TSBuildInfo EPERM failure

**Description:** Determine whether `node_modules/.tmp/*.tsbuildinfo` fails because of the managed sandbox or because the project path/ACL is invalid. Prefer an environment-only resolution over a tracked config change.

**Acceptance criteria:**

- [ ] An approved unsandboxed `npm run build` no longer reports `TS5033`, or the filesystem/ACL cause is reproduced outside the sandbox.
- [ ] `node_modules/` remains untracked and no permission workaround is committed blindly.
- [ ] If a config change is truly required, it uses an ignored project cache path and is isolated in its own diff.

**Verification:** `npm run build` reaches normal TypeScript diagnostics without `TS5033`.

**Dependencies:** None.
**Likely files:** None; only if proven necessary: `tsconfig.app.json`, `tsconfig.node.json`, `.gitignore`.
**Estimated scope:** XS.

## Task 2: Resolve the two missing IELTS listening audio fields safely

**Description:** The page currently reads `transcript` through browser TTS and does not consume `IELTSListeningSection.audioUrl`. Do not invent an audio URL or add an asset. Make the pack type accurately represent the optional artifact unless a real existing asset is discovered.

**Acceptance criteria:**

- [ ] Both `TS2741` errors in `src/data/ieltsData.ts` are gone.
- [ ] No fake URL, empty placeholder asset, or new audio file is introduced.
- [ ] IELTS Listening continues using its existing transcript/TTS fallback.

**Verification:** Targeted TypeScript check plus `npm run build`.

**Dependencies:** Task 1 for clean build evidence.
**Likely files:** `src/types/ielts.ts`; `src/data/ieltsData.ts` only if a valid existing URL is used.
**Estimated scope:** XS.

## Task 3: Remove VocabularyTrainer unused imports

**Description:** Delete only `CheckCircle2`, `Filter`, and `XCircle` from the Lucide import. Do not refactor the page or touch its content-variation ledger entries.

**Acceptance criteria:**

- [ ] The three `TS6133` errors disappear.
- [ ] Vocabulary behavior and random-assessment exception line semantics remain unchanged.

**Verification:** Targeted lint/typecheck, scanner, then `npm run build`.

**Dependencies:** None.
**Likely files:** `src/pages/app/practice/VocabularyTrainerPage.tsx`.
**Estimated scope:** XS.

## Task 4: Preserve the media level literal union

**Description:** Add contextual typing or a small typed helper so mapped media items retain `easy | medium | hard` instead of widening to `string`.

**Acceptance criteria:**

- [ ] `getCuratedMedia` returns `LearningMediaItem[]` without a cast that hides invalid values.
- [ ] The three existing level choices and runtime output remain unchanged.
- [ ] The `TS2322` error is gone.

**Verification:** Targeted TypeScript check and `npm run build`.

**Dependencies:** None.
**Likely files:** `src/services/mediaDiscoveryService.ts`.
**Estimated scope:** XS.

## Task 5: Remove the unused TTS voice cache

**Description:** The `voices` field is written but never read; `loadVoices()` already returns its local arrays. Remove only the unused field and its assignments.

**Acceptance criteria:**

- [ ] The `TS6133` error for `voices` disappears.
- [ ] Voice loading, selection, and speech playback flow remain unchanged.

**Verification:** Targeted TypeScript check and `npm run build`.

**Dependencies:** None.
**Likely files:** `src/services/ttsService.ts`.
**Estimated scope:** XS.

## Final checkpoint

- [ ] `npm run build` exits 0 and Vite produces the build artifact.
- [ ] `npm test` remains green.
- [ ] `npm run lint` exits 0; unrelated legacy warnings are only reported.
- [ ] `npm run verify:all` remains green.
- [ ] `git diff --check` passes.
- [ ] Protected paths remain absent from the diff.
- [ ] Phase 2 remains blocked until this checkpoint is reviewed.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Treating a sandbox restriction as a code defect | Re-run build with approved elevation before changing tsconfig. |
| Inventing IELTS audio assets merely to satisfy a type | Model the existing TTS fallback honestly; do not add fake URLs. |
| Hiding the media type error with a broad cast | Use contextual typing or a typed level helper. |
| Scope creep into legacy warning cleanup | Modify only the five listed blocker areas and re-check file names before commit. |
