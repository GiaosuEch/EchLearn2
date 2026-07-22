# Phase 7.7 - Artifact-Selection Verification Hardening

This authored migration removes direct reviewer `SELECT` access to selection records. A self-bound, least-privilege RPC checks server-derived `auth.uid()` and returns only the immutable selection projection required for verification. It does not expose actor identity, raw envelope, credentials, or database errors, and it cannot approve, verify, download, benchmark, initialize, or activate a model.
