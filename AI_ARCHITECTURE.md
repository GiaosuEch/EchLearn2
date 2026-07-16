# AI Architecture Index

This repository uses track-neutral AI Platform Services inside the broader AI Language Learning Platform. IELTS Academic is a consumer Product Pack, not the architecture owner.

## Authoritative documents

- `LANGUAGE_PLATFORM_ARCHITECTURE.md` — three-layer dependency and ownership model.
- `AI_PLATFORM_SERVICES.md` — local AI, model/artifact, evaluation, validation, privacy, entitlement, observability, and security services.
- `ASSESSMENT_RUBRIC_ENGINE.md` — generic AssessmentResult/Rubric/Evidence contract.
- `TRACK_MODULE_DESIGN.md` — Product Pack registration and isolation.
- `PRODUCT_PACKS.md` — product/pack strategy and IELTS Academic positioning.
- `docs/research/local_ai_no_key_feasibility.md` — official-source feasibility and constraints.

## Locked decisions

- Browser-first, zero-install local AI is the primary no-key contract.
- Deterministic learning remains available and is never marketed as AI.
- Capability failures are explicit and never converted into canned success.
- Models are selected per tier only after commercial-license, benchmark, artifact, device, and security approval.
- Approved artifacts are project-hosted, immutable, pinned, and integrity-verified.
- Model output is untrusted structured data.
- Learner content stays local by default; category/purpose consent gates sync.
- Raw audio is ephemeral by default.
- Pack-specific tasks, scores, disclosures, and uniqueness rules never enter Platform Core.

The earlier IELTS-first architecture is superseded by these documents. Its useful local-AI, privacy, license, and calibration research remains preserved and rehomed at the appropriate layer.
