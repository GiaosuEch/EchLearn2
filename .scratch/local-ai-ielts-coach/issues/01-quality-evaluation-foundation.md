# Quality and evaluation foundation

Status: in-progress  
Phase: 1  
Blocked by: none

## Outcome

Replace false-green verification with enforceable assessment, provider, model-registry, and evaluation contracts before any major coach UI work.

## Exit gates

- Deterministic tests prove disclaimer/evidence/abstention policy.
- Candidate models cannot be promoted without license, benchmark, pinned artifact, and checksum.
- Verification scans all relevant IELTS/evaluation sources and catches seeded fake/random failures.
- Build, test, lint, and quality scripts pass.

## Risks

- Existing scripts report success while known fake behavior remains.
- Adding a runtime dependency before benchmark would prematurely lock architecture.

## Decisions

- First slice is pure contracts/policy/registry with no model runtime dependency.
- Node's built-in test runner is preferred for pure TypeScript policy seams if the current toolchain can execute it without extra packages; otherwise a test dependency requires explicit supply-chain review.

## Verification evidence

Pending.

