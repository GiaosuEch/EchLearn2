# RFC: IELTS Band 7.5+ Mastery Protocol Pilot (V1)

**Status:** Approved design; implementation not started  
**Decision owner:** Product owner  
**Audience:** IELTS learners currently at Band 5.5–6.0, targeting Band 7.0–7.5+  
**Delivery model:** Parallel pilot route; the existing Vocabulary Trainer remains unchanged

## 1. Product promise and boundaries

V1 provides a deterministic, auditable protocol for mastering a curated core of 600+ IELTS-relevant collocations and idiomatic expressions. It does not promise an IELTS examination result or an official band score.

The product promise is:

> After 90 credit sessions of 25–35 minutes each, a compliant learner completes Short-term Mastery for all 600 entries and at least 200 entries reach Long-term Mastery. Long-term Mastery for the remaining entries completes through the continuing maintenance protocol, by Session 150.

The protocol is for the defined V1 audience only. It excludes beginners, children, and general-language learners. It does not replace the app's existing Vocabulary Trainer during the pilot.

The V1 route is `/app/ielts/mastery`, presented as **IELTS Band 7.5+ Mastery Protocol (Pilot)**. Dashboard entry is an Advanced Track card with explicit eligibility and protocol disclosure before enrolment.

### Non-goals

- No guarantee of IELTS score, band, or examination outcome.
- No AI-generated vocabulary, definitions, examples, prompts, answers, or runtime curriculum updates.
- No model, ASR, voice evaluator, or raw-audio dependency for progression.
- No change to the legacy Vocabulary Trainer during the pilot.
- No use of streaks or XP as substitutes for mastery.

## 2. Curriculum integrity

The curriculum is independently authored, then verified against permitted reference metadata. The application must not copy or redistribute protected dictionary or corpus material without an appropriate licence. Each source reference is evidence for editorial review, not imported source content.

Each published bundle is immutable and contains:

- `schemaVersion`, `curriculumVersion`, publication timestamp, and SHA-256 content hash.
- A fixed collection of unique entries and prompts.
- Provenance metadata: reference link or identifier, reviewer identity, approval time, and content revision.

The curriculum publishing path is:

```text
Independent editorial draft
→ automated schema and integrity checks
→ qualified domain-expert approval
→ immutable versioned bundle + SHA-256
```

An entry must carry identity, semantic/register, application-context, deterministic-prompt, and provenance fields. Minimum concepts are:

```text
id, term, bandLevel, topic, partOfSpeech, coreMeaning,
collocationPattern, collocatesWith, contexts, prompts, provenance
```

Every learner attempt is associated with the exact curriculum and prompt version it used. A curriculum update must never silently alter an existing learner's mastery history.

## 3. Data boundaries

The implementation separates three stores.

| Store | Contains | Rule |
|---|---|---|
| Curriculum bundle | Frozen entry and prompt data plus provenance | Versioned and immutable |
| Learner state | Enrolment, per-entry status, due dates, session state | Mutable, learner-owned |
| Audit attempts | Correctness, latency, focus/integrity result, reviewed version | Metadata-only; no raw answer or audio required |

An audit attempt records at least the reviewed entry and prompt version, activity type, scheduled SRS stage, correctness, latency in milliseconds, latency-valid flag, anti-gaming flag, and completion time. It must not use untrusted generated output to change mastery.

## 4. Deterministic mastery engine

### Required forms

V1 mastery uses exactly two deterministic forms:

1. **Context Match**: select the approved phrase that fits a bounded context. Pass requires an approved answer, stable focus, and a valid first-touch latency.
2. **Active Cloze**: type the approved phrase into a bounded context. Pass requires an exact allowed answer after deterministic normalization, stable focus, and a valid first-keypress latency.

Voice/Speaking Application is optional practice. It does not alter mastery, SRS scheduling, latency metrics, or session credit in V1.

### Latency and integrity rules

`recallLatencyMs` is measured from a fully rendered prompt to the first valid interaction, not submission. A valid latency satisfies:

```text
300 ms <= recallLatencyMs < 2,000 ms
```

The engine invalidates an attempt when focus is lost, when the local clock is materially inconsistent with the session timeline, or when latency is below the minimum floor. A wrong Context Match selection within two seconds is marked as a guessing event and fails the stage. Correctness and latency both matter; speed never overrides a wrong answer.

### State machine

```text
Unseen
→ Learning (T+1, T+3)
→ Short-term Candidate (T+7)
→ Short-term Mastered (pass both forms at T+7 and T+16)
→ Long-term Candidate (T+30)
→ Long-term Mastered (pass both forms at T+30 and T+60)
```

A failed required form, invalid latency, focus failure, or anti-gaming failure returns the entry to Learning and schedules a new review sequence. Entry mastery is binary: there is no partial-mastered state used for reporting.

The 88% retention target is a **cohort KPI**, not a per-entry percentage:

```text
cohortRetentionRate = longTermMasteredEntries / totalEntriesInCohort
```

For the first 200-entry cohort, the target is at least 176 Long-term Mastered entries once every member has had the relevant scheduled opportunity.

## 5. Session protocol and pacing

The course measures **90 credit sessions**, not 90 calendar days. One calendar day can contribute at most one credit session; additional same-day work is recorded as Extra Practice and cannot add new entries or advance the session count.

SRS spacing remains calendar-based: T+1, T+3, T+7, T+16, T+30, and T+60 are real elapsed-calendar intervals. The learner's enrolment timezone is recorded and any suspicious device-clock discontinuity pauses credit until it can be safely reconciled.

Each credit session is capped at 35 minutes:

```text
due reviews
→ estimate remaining capacity
→ grant new entries only if capacity remains
```

New items are suspended when projected review debt consumes 30 minutes or more. Sessions 1–73 may introduce new entries within the remaining time budget. Sessions 74–90 introduce no new entries and clear required T+16 reviews.

The recommended adherence is at least five credit sessions per calendar week. This makes the protocol roughly 18 calendar weeks, while protecting calendar-based spacing and avoiding cramming.

## 6. Learner experience

The pilot onboarding discloses the learner profile, 90-session commitment, time budget, deterministic mastery methods, data boundaries, and the fact that it does not guarantee an IELTS score.

The daily screen prioritizes:

- reviews due now;
- time remaining in the session;
- whether new items are available and why;
- Short-term Mastered count, Long-term Mastered count, review debt, and session number.

When review debt or attendance is insufficient, the learner enters **Recovery Mode**. New entries pause, the interface explains the cause and recommended action, and it shows a revised ETA. Recovery Mode is not punitive and does not falsify progress.

Pilot analytics are restricted to approved staff and use operational metadata only: session completion, review debt, accuracy, latency buckets, curriculum version, topic, and engine/sync failures.

## 7. Pilot rollout and quality gates

### Stages

1. Internal dogfood validates the deterministic engine and route behavior.
2. Closed pilot enrols 50–100 eligible, consented learners.
3. A 30-credit-session evaluation assesses usability and operational feasibility.
4. Product owners choose promote, hold, or refine based on predeclared gates.

### Hard gates before pilot enrolment

- All published entries pass schema, uniqueness, prompt-completeness, provenance, reviewer-approval, and hash verification.
- Tests cover every state transition, latency/focus failure, guessing, clock jump, extra-practice cap, review debt, bundle-version mismatch, and recovery path.
- Offline-to-online synchronization does not lose or duplicate attempts and cannot award duplicate mastery.
- Browser checks cover both required forms, Recovery Mode, keyboard use, and screen-reader semantics.
- Privacy checks prove that analytics contain no raw answers or audio, and that learner export/delete works.
- A feature flag can stop new enrolment without deleting a pilot learner's read or export access.

### Evaluation targets after 30 sessions

- At least 70% of the enrolled cohort maintains at least five credit sessions per week.
- At least 80% first-attempt Active Cloze accuracy.
- At least 65% of eligible attempts have valid latency below two seconds.
- No unresolved P0/P1 fault involving SRS correctness, data loss, synchronization, or incorrect mastery award.

Self-selection into the pilot can demonstrate operational feasibility but cannot establish superiority over the legacy trainer. Any claim that it outperforms the legacy route requires a predeclared randomized or appropriately matched comparison.

### Rollback and promotion

Promotion requires every hard gate and pilot target to pass. On failure, the team freezes new enrolment, preserves pilot data for read/export, keeps the legacy trainer intact, diagnoses the cause, and revises the prompt, pacing, SRS policy, or UX without manipulating the reported metrics.

## 8. Definition of done for V1

V1 is ready for pilot only when the route, immutable verified curriculum bundle, deterministic pair of mastery forms, calendar-aware SRS engine, privacy-safe telemetry, feature flag, rollback behavior, and all hard-gate tests exist and pass. It becomes a recommended route only after the predeclared pilot gates pass.
