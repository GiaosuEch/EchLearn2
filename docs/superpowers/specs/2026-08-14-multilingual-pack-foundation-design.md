# Multilingual Pack Foundation Design

## Purpose

Make Japanese JLPT N5, Chinese HSK 1, and Korean TOPIK I starter use one authoritative learning-domain contract for content identity, publication, route ownership, learner progress, and UX-only unlocking. This replaces three drifting ad-hoc implementations without treating browser state as security.

## Scope and non-goals

In scope: the three local/static beginner packs, their public lesson routes, deep-link validation, current SRS-derived progress, and deterministic unit and browser checks.

Out of scope: adding a fourth language; changing paid plans; moving static content to a server; claiming an official JLPT/HSK/TOPIK curriculum; treating a client-side guard as authorization; and changing unrelated IELTS flows.

## Decision

Introduce a generic `LearningPackRegistry` in the Learning Domain. A pack declares a versioned manifest and its lessons through a shared `LearningLessonDescriptor`. The registry validates unique pack IDs, route ownership, canonical lesson IDs, publication state, prerequisite references, cycles, and duplicate routes. It returns an explicit resolution result for a route or lesson ID instead of silently selecting the first lesson.

Each pack supplies only a `resolveProgress` adapter because its existing local content has different review-card IDs. The generic registry accepts this adapter and applies a single unlock policy: lesson completion is monotonic (the highest completed state is retained), while current progress is still calculated from the latest mastery data. A learner who once completed a prerequisite must not see later lessons relock after an SRS lapse; the UI will label this as progress history, not an access control decision.

`ProductPackManifest` becomes the pack metadata input to the registry. Pack entitlement remains declarative. Routes may use the existing `LanguageEntitlementGuard` for UI navigation, but any premium server resource must still enforce its own authorization separately.

## Route behavior

For each Japanese, Chinese, and Korean learning route:

1. Resolve the owning pack from a centrally declared route table.
2. Validate an optional `lesson` query parameter against that route's compatible skill and the pack's published content.
3. If missing, select the first active compatible lesson deterministically.
4. If malformed, unknown, incompatible, locked, draft, or not owned by that route, render an explicit recoverable state with a link back to the pack dashboard. Never silently fall back to unrelated content.
5. The dashboard may render locked/active/completed states, but those states are instructional UX only.

## Content and progress invariants

- Local static content is versioned by pack manifest and has no runtime text-generation API.
- A lesson ID is namespaced by language and track; legacy Japanese IDs are mapped explicitly at the pack boundary.
- A published lesson references existing content and all declared review IDs are unique inside a pack.
- A score attempt records the best percentage. Completion is monotonic after the lesson threshold is met.
- Failed first SRS reviews never count as vocabulary mastery or unlock progress.
- The registry reports errors rather than throwing during route resolution so the UI can display a safe recovery path.

## Accessibility and visual behavior

The existing education UI primitives remain in use. Invalid-route/recovery cards are keyboard-reachable, have a visible focus state, use semantic headings and links, and preserve `lang` annotations for Japanese, Chinese, Korean, and romanization text. No decorative change is accepted in place of these states.

## Tests and acceptance evidence

Automated tests must prove: all three packs validate; each published route has exactly one owner; unknown and cross-skill lesson links return explicit invalid results; locked lessons are not started by a deep link; vocabulary progress excludes failed reviews; completion stays unlocked after later SRS failure; duplicate IDs, routes, missing content, and prerequisite cycles fail validation.

Browser tests must cover one keyboard navigation/recovery interaction for each language route family. Production build, source lint, and the full unit suite must pass. Any verification that cannot be run is reported as a limitation, not implied by adjacent green checks.

## Architectural self-critique

The current design is structurally compromised: `ContentRegistry` is IELTS-specific while three language curricula duplicate their own ID, progress, and unlock semantics; Korean has a manifest but no platform registry; deep links can silently substitute content; and route guards do not cover the language routes. Those are not harmless omissions: they make correctness accidental and future packs expensive. This design fixes the contract and failure behavior first, while deliberately refusing to misrepresent client-side locks as security or starter content as full exam coverage.
