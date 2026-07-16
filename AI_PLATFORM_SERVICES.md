# AI Platform Services

## Purpose

Define shared, track-neutral AI infrastructure. These services expose capability and policy decisions; they do not evaluate a named exam, choose a curriculum, or render a product-pack result.

## Delivery status

This document is the target service catalog, not a claim that every service is implemented. Phase 2 delivered capability detection, artifact governance/readiness contracts, runtime and AI service boundaries, an honest readiness panel, benchmark planning, legacy safety integration and provider placeholders. Real inference, full artifact download/cache lifecycle, entitlement, privacy-filtered observability and production security integration remain future work. See `LOCAL_AI_FOUNDATION_CLOSEOUT.md` and `PHASE_2_INTEGRATION_READINESS.md`.

## Service catalog

### Capability Detector

Inspects secure context, WebGPU/worker support, storage estimate, cache readiness, and initialization probes. It returns a typed Capability State rather than a boolean or guessed device label.

### Model Registry

Separates Model Candidates from Approved Model Artifacts. Promotion requires immutable identity, commercial-use and redistribution review, notices, project-controlled artifact origin, byte size, digest/integrity, runtime/tokenizer versions, benchmark evidence, device results, and reviewer/date.

### Artifact Manager

Owns consented download, exact size disclosure, quota checks, monotonic progress, cancellation, retry, integrity verification, atomic ready markers, cache inventory, and deletion. Production never depends at runtime on a mutable third-party model path.

### Evaluation Harness

Runs versioned EvaluationBenchmarks against comparable candidates and records structured-output validity, evidence validity, abstention, safety, latency, memory, initialization failures, and target hardware. Pack-specific suites extend this harness without changing it.

### Structured Output Validator

Treats model output as untrusted. It enforces parsing, schema, input/evidence references, size and count limits, allowlisted values, and rejection/abstention behavior. It never executes model-created HTML, SQL, shell, navigation, or account actions.

### AI Honesty Policy

Blocks random, canned, delayed fake, hardcoded personalized, or simulated-success output. Unavailable capabilities remain unavailable. Deterministic learning tools are labeled deterministic, not AI fallback.

### Consent and Data-Control Service

Provides versioned category/purpose consent, revocation, local-first sync, export, and deletion requests. It excludes raw audio by default and never exposes privileged Supabase credentials to the client.

### Entitlement and Pricing Service

Evaluates access to capabilities and Product Packs using declarative plans/grants. It returns allowed/denied/requires-upgrade states and reason codes. It does not contain learning behavior or UI copy.

### Observability and Security Service

Emits privacy-filtered operational events, bounds resource consumption, records artifact/policy versions, and surfaces diagnosable failures without learner content, prompts, transcripts, tokens, or secrets.

## Provider boundary

Track-neutral capability families:

- text generation;
- structured generation;
- transcription;
- embeddings/retrieval support;
- optional acoustic analysis;
- system speech output;
- artifact lifecycle.

Every operation returns either validated data with provenance or a typed failure such as unsupported, consent-required, not-approved, not-downloaded, insufficient-storage, cancelled, integrity-failed, initialization-failed, resource-limited, or output-rejected.

## Runtime direction

- Browser-first and zero-install is the primary contract.
- WebGPU local text generation and browser task models remain candidates, not committed dependencies.
- No Light, Standard, or Pro Local model is selected before benchmark and license approval.
- A future localhost runtime adapter may be added without changing service consumers.
- A deterministic non-AI path remains available where useful and never invents an assessment.

Official implementation sources already captured in `docs/research/local_ai_no_key_feasibility.md` remain the evidence base for WebLLM, Transformers.js, WebGPU, storage, local-network, integrity, privacy, and licensing decisions.

## Release invariants

- Empty approved-model registry is valid and keeps model capabilities unavailable.
- Candidate data cannot be imported by production feature code as an approved artifact.
- Pack entitlement cannot bypass capability, consent, or artifact policy.
- Model output cannot write learner memory directly; a learning service validates and records evidence.
- Observability never logs raw learner text/audio or secrets.
