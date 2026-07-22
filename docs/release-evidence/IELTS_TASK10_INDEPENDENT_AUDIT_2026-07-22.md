# IELTS Mastery Pilot — Independent Final Audit (Task 10)

**Audit date:** 2026-07-22  
**Audited branch:** `feat/ielts-mastery-pilot`  
**Audited HEAD:** `cc229cbeb78fab0072561a4af3f786d8a98c2f4b`  
**Task 10 implementation commit:** `3e442fe`  
**Approved telemetry base declared by project:** `996cc74`

## Verdict

**NOT CLEAN — FIX LOOP OPEN.**

The deterministic Node gates pass, but independent audit found release-blocking integrity/lifecycle defects not covered by the current source-level tests. Browser E2E, live Supabase staging, coverage, flaky-proof, and production observation remain pending.

## Independently executed checks

| Check | Result | Notes |
| --- | --- | --- |
| `git diff --check 996cc74...cc229cb` | PASS | Exit 0. |
| Focused Task 10 tests | PASS | 8 tests, 2 suites, 0 failures. |
| Pilot pretest | PASS | 95 tests, 10 suites, 0 failures. |
| Full `npm test` | PASS | 894 tests, 107 suites, 0 failures. |
| `verify:all` | PASS | All configured verification scripts completed. |
| Frontend service-role scan | PASS | No service-role/database/JWT secret pattern found in frontend scan scope. |

The audit host has Node `22.16.0`, while the repository requires Node `>=22.22.0`. Tests and verification were rerun with `NODE_OPTIONS=--experimental-strip-types`; therefore these are valid independent behavioral runs on the audited source, but not a substitute for the clean-install/build/lint evidence on the exact supported toolchain.

## Release blockers

### F-01 — Task 8 credit-session commit is not atomic across tabs

`startMasterySessionAtAction()` performs a check, then `saveSession()`, then `saveEnrollment()` as separate LocalStorage read/modify/write operations. There is no transaction, CAS, unique day key, or cross-tab lock.

A deterministic adversarial interleaving produced two successful `credit-session` results for the same learner/day, both with `sessionNumber: 1`, while the enrollment retained `sessionCount: 1`.

**Required direction:** replace the credit write boundary with an atomic local transaction (prefer a feature-isolated IndexedDB repository with a unique enrollment/day credit key). If the transactional store is unavailable, fail closed for credit. Add a two-context concurrency test proving exactly one credit and no partial session/enrollment write.

### F-02 — Attempt commit does not revalidate clock/fingerprint at its write boundary

The UI rechecks clock/fingerprint before starting a session, but `submit()` later creates `reviewedAt` from the current wall clock and calls `recordMasteryAttempt()` with the render-time enrollment. The attempt path does not re-read the enrollment, verify the frozen curriculum, or reassess clock integrity before appending the attempt and mutating SRS state.

**Required direction:** introduce an atomic `commitAttempt` boundary that re-reads enrollment/session state, validates curriculum fingerprint and clock integrity, and commits attempt + SRS state together. Extra Practice must remain unable to write SRS state.

### F-03 — Pilot route gate cannot distinguish auth hydration from anonymous state

`main.tsx` starts asynchronous auth initialization without awaiting it. The auth store initially exposes `user: null`, `isAuthenticated: false`, and `isLoading: false`. `MasteryPilotFeatureGate` immediately redirects when `subjectId` is absent, while `AppLayout` renders the outlet immediately.

This creates a direct-reload lifecycle in which an eligible user can be redirected to `/app/vocabulary` before their identity is hydrated.

**Required direction:** add an explicit fail-closed auth bootstrap state (`loading/resolved/error`). During loading, render no Pilot content and do not perform the final redirect. On anonymous/error, deny. Add browser E2E for direct reload with an allowlisted user and a percentage-cohort user.

### F-04 — Telemetry appended after the initial empty flush is not scheduled for delivery

The app host starts the transport once. The transport performs one idle flush. Queue `record()` does not notify the host/transport, and there is no bounded polling loop. A later event can remain durable in IndexedDB until a reload, auth transition, online event, or another external resume trigger.

The independent reproduction showed:

- after initial empty flush: `sends=0`, `queued=0`, `rescheduled=false`;
- after later append: `sends=0`, `queued=1`, `rescheduled=false`.

**Required direction:** add a local queue-change signal owned by the queue/app-host boundary (including cross-tab delivery), or a bounded background polling mechanism. Task 8 must still perform no network call; it may only append locally and emit a local signal. Add a regression test for append-after-empty-start and a multi-tab append.

### F-05 — Authenticated clients can poison rollout telemetry metrics

`ingest_pilot_telemetry` only requires `auth.uid()` to be non-null, and execute is granted to the entire `authenticated` role. It accepts client-supplied valid-looking hashes/metrics without server-owned Pilot membership, entitlement, nonce, or rate limit. Any authenticated non-Pilot account can generate unlimited events and influence the dashboard used for rollout decisions.

**Required direction:** enforce server-owned Pilot participant eligibility at RPC time and add abuse bounds in a private schema. Live staging must prove anonymous and authenticated non-participant ingestion are denied, while eligible participants are accepted. Keep event tables metadata-only and operations access default-deny.

## Evidence-candor corrections

- `.superpowers/sdd/task-10-implementer-report.md` says the existing route is `/app/ielts/vocabulary`; the actual preserved legacy route is `/app/vocabulary`.
- The source comment calling the Vite false switch an “immediate circuit breaker” should be narrowed to the current build/runtime. The Runbook correctly states that rollback requires rebuild, deployment, and reload.
- The repository contains summary evidence, not the complete raw output required by the Runbook. Preserve/attach raw logs with exit codes and candidate SHA in the release record; do not treat summary prose alone as independently replayable evidence.

## Pending gate matrix

### Browser E2E

Must cover disabled/malformed flags, allowlist and percentage cohorts, direct reload after auth hydration, legacy Vocabulary preservation, two-tab same-day start race, clock/fingerprint changes at start and attempt commit, Extra Practice SRS read-only behavior, recovery/reload, and explicit verification that Task 8 causes no direct browser network transport.

### Live Supabase staging

Must verify anonymous ingest denial, non-participant authenticated ingest denial, participant acceptance, malformed/raw-field rejection, direct table denial, terminal completion upsert, non-operator dashboard denial, operator aggregate access, logout/in-flight behavior, queue ACK only after RPC success, and timely append-after-start delivery.

### Flaky proof

Run critical Node and browser suites repeatedly with retries disabled, preserve every exit code, and exercise both serial and parallel browser execution. A suggested minimum is 50 consecutive Pilot Node runs and 20 repeats of each critical browser scenario, but the release owner must approve the formal threshold.

### Coverage

Generate coverage for changed Task 8/9/10 modules and record uncovered security/integrity branches. Source-regex tests are not sufficient coverage for route lifecycle, transactional behavior, or live RLS/RPC behavior.

## Gate status after this audit

| Gate | Status |
| --- | --- |
| Deterministic Node integration | PASS (independently rerun) |
| Full Node test suite | PASS (independently rerun) |
| Repository verification scripts | PASS (independently rerun) |
| Service-role frontend scan | PASS (independently rerun) |
| Clean install/build/lint/audit on supported exact toolchain | Previously reported PASS/attention; not independently rerun from this archive |
| Browser E2E | PENDING and required before clean verdict |
| Live Supabase/RLS/RPC | PENDING and current design has an ingest-integrity blocker |
| Flaky proof | PENDING |
| Coverage | PENDING |
| Final Independent Audit | **FAILED CLEAN VERDICT; FIX LOOP OPEN** |
