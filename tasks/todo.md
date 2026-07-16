# Build Blocker Task Board

## Ready

- [ ] BB-01 Re-run `npm run build` outside the managed sandbox and isolate the TSBuildInfo `EPERM` cause.
- [ ] BB-02 Resolve the optional IELTS listening audio contract without inventing assets.
- [ ] BB-03 Remove only the three unused VocabularyTrainer icon imports.
- [ ] BB-04 Preserve `LearningMediaItem['level']` as `easy | medium | hard` during mapping.
- [ ] BB-05 Remove only the unused TTS `voices` field and assignments.

## Verification checkpoint

- [ ] `npm run build` exits 0.
- [ ] `npm test` passes.
- [ ] `npm run lint` exits 0; remaining warnings are classified legacy.
- [ ] `npm run verify:all` passes.
- [ ] `git diff --check` passes.
- [ ] No `.env`, secret, curriculum, public data, audio, or Supabase migration changes.

## Blocked

- [ ] Phase 2 Local AI Runtime / Artifact Manager remains blocked pending review of the build-green checkpoint.
