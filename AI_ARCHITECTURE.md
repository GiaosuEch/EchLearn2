# Local AI architecture

## Architectural objective

Provide honest, useful IELTS coaching with no paid model API, no model-provider API key, and no mandatory desktop installation. The app remains functional as a deterministic learning product on unsupported devices and enables opt-in local models only after capability, license, benchmark, and artifact gates pass.

## Runtime layers

```text
IELTS feature
  -> coaching/evaluation contract
     -> policy and output validation
        -> deterministic coach (always available)
        -> local text provider (approved browser model, when ready)
        -> local ASR provider (approved browser model, when ready)
     -> provenance + learner evidence
     -> local persistence
     -> consent gate -> Supabase sync
```

Feature code depends on capabilities, not a runtime package or model name. A future local desktop connector can implement the same boundary, but zero-install browser use is the primary contract.

## Capability contract

Every operation returns either a validated result or a typed failure. Required states include:

- `READY`
- `DETERMINISTIC_ONLY`
- `WEBGPU_UNAVAILABLE`
- `INSECURE_CONTEXT`
- `MODEL_NOT_APPROVED`
- `MODEL_NOT_DOWNLOADED`
- `INSUFFICIENT_STORAGE`
- `DOWNLOAD_CANCELLED`
- `INTEGRITY_FAILED`
- `WORKER_INITIALIZATION_FAILED`
- `OUTPUT_REJECTED`
- `CONSENT_REQUIRED`

No state is converted into canned content. Deterministic coaching is labeled rule-based, not “AI fallback.”

Conceptual operations:

- inspect text-generation, transcription, embedding, storage, and offline readiness;
- download an approved artifact with progress and cancellation;
- list and delete cached artifacts;
- generate bounded text or schema-constrained data;
- transcribe an ephemeral audio input;
- produce embeddings for local retrieval;
- dispose of workers and in-memory media.

## Model tiers and promotion

Tier names are stable; model assignments are not.

| Tier | Product envelope | Approval expectation |
| --- | --- | --- |
| Light | Smallest viable opt-in download, constrained coaching, widest compatible-device target. | Must beat deterministic baselines on its declared tasks; a sub-500 MB target is aspirational, not a reason to approve a weak model. |
| Standard | Approximately 1–2 GB class, primary desktop-browser local coach. | Must meet Writing/explanation/structured-output thresholds on target hardware. |
| Pro Local | Larger explicit opt-in pack for high-memory WebGPU devices. | Must show material quality gain over Standard that justifies download, memory, latency, and thermal cost. |

A promotion record must include:

- model and converted-artifact identity;
- immutable version/revision;
- runtime/tokenizer versions;
- commercial-use and redistribution decision;
- required notices;
- byte size and project-controlled CDN URL;
- SHA-256 or stronger digest plus supported runtime integrity metadata;
- benchmark dataset/rubric version and per-task results;
- target browser/hardware results, latency, peak memory, failure rate;
- approval status and reviewer/date.

Missing data means `MODEL_NOT_APPROVED`, never an implicit development default.

## Browser execution

- Text generation runs outside the React main thread. WebLLM provides a dedicated worker engine and WebGPU local inference: https://github.com/mlc-ai/web-llm#dedicated-web-worker
- Task-specific browser models such as ASR and embeddings may use Transformers.js, which supports WASM and opt-in WebGPU execution: https://huggingface.co/docs/transformers.js/en/index
- WebGPU is secure-context-only and not universally available, so feature detection and a real initialization probe are mandatory: https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API
- Browser storage is quota-managed and may be evicted. Quota estimation, optional persistence requests, cache recovery, and honest offline wording are required: https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate and https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist

Runtime packages will not be added until the benchmark harness and dependency/license review seam exist. This avoids selecting architecture by demo convenience.

## Artifact lifecycle

1. Fetch signed/versioned manifest from the project origin.
2. Check capability, exact size, current quota estimate, and existing valid cache.
3. Ask the learner to confirm download and disclose size/local data behavior.
4. Stream with monotonic byte progress and an `AbortSignal`.
5. Verify digest/integrity before marking ready.
6. Initialize in a worker and run a health/schema probe.
7. Record only non-sensitive artifact metadata locally.
8. On mismatch or interruption, keep the artifact unavailable and offer explicit retry/delete.

Production must not reference a mutable Hugging Face path at runtime. Third-party repositories may be provenance sources during review; approved bytes are copied to project-controlled storage under the license decision.

## Assessment boundary

The model proposes coaching observations; application policy decides whether they are displayable.

Every displayed assessment contains:

- method: deterministic, local-generated, or measured-audio-signal;
- fixed `uncalibrated beta estimate` label for band-like values;
- criterion-level evidence tied to learner input;
- confidence with a documented interpretation;
- explicit limitations and abstention reason where applicable;
- prompt/rubric/model/artifact/evaluation versions in provenance.

Speaking must also display `Estimated feedback based on transcript and measurable audio signals.` Pronunciation remains `not assessed` until a validated acoustic pipeline exists. ASR transcript confidence is not pronunciation evidence.

## Internal evaluation and later calibration

Evaluation and calibration are separate registries.

- Internal evaluation compares task usefulness, evidence validity, schema reliability, hallucination/abstention behavior, latency, memory, and safety across candidate models. It can use authored/synthetic cases and expert review but cannot validate an official band claim.
- Later calibration requires a lawful dataset of representative learner responses, qualified independent ratings, rater-agreement protocol, consent/license provenance, subgroup bias analysis, held-out evaluation, error intervals, and versioned mapping. Calibration may adjust or remove estimates; it never rewrites historical provenance.

## Learner memory

“Self-learning” means retrieval from learner-controlled evidence, not online model-weight training.

- Guest: local IndexedDB/OPFS-compatible storage.
- Authenticated: local-first plus consented Supabase sync.
- Categories: learning profile, mistakes, vocabulary, Writing history, Speaking history, test history, study plan.
- Retrieval is owner-scoped and size-bounded; model prompts never receive unrelated categories, raw secrets, or another user's data.
- Corrections, export, revocation, and deletion are first-class flows.

## Trust boundaries and controls

| Boundary | Main threats | Controls |
| --- | --- | --- |
| Learner input -> app | oversized/malformed text/audio, XSS | size/type validation, React escaping, bounded processing |
| Model artifact -> worker | tampering, license drift, supply-chain compromise | self-host, immutable manifest, digest/integrity, review, worker isolation |
| Model output -> product | prompt injection, invalid JSON, false evidence, excessive content | parse, schema and evidence validation, allowlists, token/size limits, no tool execution |
| Local data -> Supabase | missing consent, cross-user disclosure | category consent, owner-only RLS, two-user policy tests, no service-role key in client |
| Microphone -> transcription | unexpected retention or upload | ephemeral blob, local provider, explicit indicators, no raw-audio persistence |
| Cache/offline -> browser | eviction, partial artifacts, quota denial | readiness probe, atomic valid marker, retry/delete, honest offline copy |

## Deployment boundary

The build produces a static PWA suitable for Netlify. Supabase owns authentication/sync/database. Host-specific redirects and headers stay in deploy configuration; providers, domain services, model manifest, and persistence interfaces use web standards so the same build can move to Vercel or VPS.

## Non-goals

- Frontier-equivalent general intelligence on every device.
- Official IELTS grading.
- Silent model downloads or updates.
- Raw-audio cloud archive.
- Model-generated SQL, shell commands, HTML, navigation, or account actions.

