# ANTI Local IELTS Coach

## Stack

- React 19, TypeScript 6, Vite 8, Tailwind CSS 4.
- Supabase for authentication and consented sync.
- Netlify is the default frontend host; deployment code must remain portable to Vercel or a conventional static/VPS host.
- Local inference must not require a paid model API or model-provider API key.

## Commands

- Install: `npm.cmd ci --ignore-scripts`
- Build: `npm.cmd run build`
- Lint: `npm.cmd run lint`
- Test: `npm.cmd test`
- Full verification: `npm.cmd run verify:all`

## Non-negotiable product rules

- Every Writing or Speaking band-like output must visibly say `uncalibrated beta estimate`; it is never an official IELTS result.
- Speaking feedback based on transcript/audio signals must also say: `Estimated feedback based on transcript and measurable audio signals.`
- Never use random, hardcoded, delayed canned, or fabricated output as AI evaluation.
- If a required local capability is unavailable, return an explicit disabled/unavailable state. Do not simulate success.
- Do not select a Light, Standard, or Pro Local model until it passes the checked-in benchmark and commercial-license review.
- Production model artifacts are project-hosted, version-pinned, integrity-checked, and opt-in downloads with progress, cancel, retry, quota warning, and cache deletion.
- Raw audio is not retained by default. Transcript or learning evidence may sync only after explicit consent.
- Every Supabase learner-data table must enforce owner-only RLS for select/insert/update/delete.
- Keep Ech Buri and the green identity. Prefer a restrained, readable education UI over glassmorphism or decorative gradients.

## Delivery order

1. Quality and evaluation foundation.
2. Writing Coach.
3. Speaking Coach.
4. Test Generator.
5. Learner Memory and Study Planner.
6. IELTS UI polish.
7. Hard verification.

Do not expose a later phase before the current phase exit gates pass.

## Engineering discipline

- Read `CONTEXT.md`, relevant ADRs, the active local issue, and the relevant source/test files before editing.
- Follow thin TDD slices: RED, GREEN, REFACTOR, build, commit.
- Treat model output as untrusted data. Parse and validate structured output; never execute it as HTML, SQL, shell, navigation, or account actions.
- Keep changes minimal and rollback-friendly. Do not refactor unrelated code.
- Never read, print, stage, or commit `.env`, credentials, raw learner audio, model binaries, or local caches.
- Status claims must trail evidence. A phase is not complete until its tests, build, lint, verification scripts, and relevant browser checks pass.

## Agent skills

### Issue tracker

Issues and specs live in `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

The local tracker uses the canonical triage states. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository with `CONTEXT.md` and root ADRs in `docs/adr/`. See `docs/agents/domain.md`.

