# Phase 7.4 - Trusted Artifact-Selection Decision Contract

## Purpose

Phase 7.4 binds a completed, explicit human artifact selection to the existing external trusted-reviewer context. It produces only an in-memory decision contract for a future persistence design.

## Required Inputs

- A Phase 7.3 result with `ready-for-human-selection` and a verified immutable bridge scope.
- A Phase 5.9 result with a recorded `select` decision whose selected option and scope exactly match candidate, tier, and revision.
- A Phase 6 external trusted-actor adapter result with a validated `model-governance-reviewer` context from `external-auth-boundary`.
- Literal `explicitDecisionRequested === true`.

## Safety Boundary

This policy performs no authentication or authorization, reads no credentials or tokens, and makes no database, RPC, storage, download, checksum, benchmark, runtime, or activation call. Its outputs keep every persistence, approval, integrity, download, runtime, and activation flag `false`.

The existing governance-application record is intentionally not reused for selection persistence. That append-only record only establishes review eligibility and its schema requires all selection and downstream flags to remain `false`.

## Next Phase

Actual artifact-selection persistence requires separately approved authentication and RLS work: a least-privilege permission, append-only table/RPC, server-derived actor identity, forced RLS, immutable envelope validation, and duplicate semantics. Until then, this decision is non-persistent and cannot authorize a model action.
