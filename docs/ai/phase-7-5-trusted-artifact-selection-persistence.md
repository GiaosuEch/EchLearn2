# Phase 7.5 - Trusted Artifact-Selection Persistence

Phase 7.5 authors, but does not apply, an append-only Supabase migration for a trusted reviewer attestation of an already selected artifact scope.

The RPC derives the actor from `auth.uid()` and independently checks the least-privilege `record-local-model-artifact-selection` permission. Client actor IDs, roles, assertions, credentials, and tokens are not part of the persistence envelope.

The table has forced RLS, reviewer-only reads, immutable rows, RESTRICT source foreign keys, strict envelope keys, and idempotency only for an exact identical envelope from the same server-derived actor.

Persistence acknowledges only the selection attestation. It does not approve an artifact, verify a checksum, authorize download, benchmark a model, initialize runtime, or activate a model. The app does not apply the migration or submit a record automatically.
