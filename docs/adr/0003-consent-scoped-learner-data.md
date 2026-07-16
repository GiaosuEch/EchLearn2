---
status: accepted
---

# Keep learner data local unless category-specific sync consent exists

Guest learning data and model inference remain local by default, raw microphone audio is ephemeral, and transcript or learning evidence syncs only after versioned category-specific consent. Supabase stores authenticated rows behind owner-only RLS and supports export, revocation, and deletion; deployment may change hosts without changing these privacy boundaries.

