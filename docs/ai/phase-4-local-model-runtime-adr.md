# Phase 4 Local Model Runtime ADR

## Status

Status: Proposed

This ADR records a candidate direction only. It does not approve, install, configure, download, or execute a model or runtime.

## Context

Phase 3 established generic AI service contracts, runtime-provider boundaries, unavailable-safe coach shells, consent-aware learner memory, metadata-only auditing, settings/privacy controls, feature registry, and safety regression checks. Phase 4 must decide how a web product can add local generation without weakening those boundaries.

The product is browser-first and local-first. A mandatory remote inference service would introduce credential handling, server cost, content transfer, data-retention questions, and an availability dependency that the current foundation intentionally avoids. Requiring a separately installed desktop service would also break the expected web onboarding experience.

Browser-local execution is therefore the preferred research direction, provided device capability, storage, license, artifact integrity, quality, and rollback gates pass.

## Decision

Evaluate **MLC WebLLM** as the leading runtime candidate for Phase 4.2 and Phase 4.3. Keep **Transformers.js** as a secondary browser-runtime candidate. Defer a **llama.cpp WASM/WebGPU-style** path until its browser integration and packaging trade-offs are clearer. Preserve **no local model yet / unavailable-safe** as the mandatory fallback.

No runtime or model is approved by this ADR.

## Options considered

1. **MLC WebLLM in-browser runtime** — strongest fit for browser language-model generation and worker-based execution, but requires WebGPU/device validation and artifact-management work.
2. **Transformers.js / ONNX-style browser runtime** — broad browser ML abstraction with WASM and WebGPU paths, but requires generation-specific quality and performance validation.
3. **llama.cpp WASM/WebGPU-style runtime** — attractive quantized-model ecosystem, but browser WebGPU integration remains a higher-complexity and less mature product path.
4. **No local model yet** — retain current unavailable-safe behavior when validation is incomplete or the device is unsupported.

## Recommended Phase 4 path

- Phase 4.2: build an isolated capability and artifact proof of concept behind existing provider boundaries.
- Phase 4.3: benchmark runtime and model candidates before connecting any coach shell.
- Keep `AIService.execute`, learner-memory consent, audit metadata, and shell output gates unchanged until benchmark and safety gates pass.
- Do not require a separate desktop process or external application.
- Do not make a remote inference service the primary path.

## Candidate runtime matrix

| Candidate | Position | Strengths | Main risks |
|---|---|---|---|
| MLC WebLLM | Leading candidate for validation | Browser-focused LLM runtime, WebGPU acceleration, worker support, local execution | Browser/device coverage, memory, artifact size, cache lifecycle |
| Transformers.js | Secondary candidate | WASM and WebGPU backends, broad model/task abstractions | Generation adaptation, browser variance, model-format constraints |
| llama.cpp browser path | Deferred candidate | Quantized ecosystem and portability | Browser WebGPU maturity, packaging and integration complexity |
| Keep unavailable-safe | Required fallback | Honest and stable on unsupported devices | No generated coach features |

## Candidate model matrix

| Tier | Candidate | Intended evaluation | Approval state |
|---|---|---|---|
| Light | Qwen3-0.6B | Lower-memory feasibility and fallback quality | Not approved or configured |
| Standard | Qwen3-1.7B | Main quality/performance benchmark | Not approved or configured |
| Stronger local | Qwen3-4B | Strong-device quality ceiling | Not approved or configured |

No candidate is approved. Exact artifacts, quantization formats, checksums, sizes, and locations must be selected only after license and benchmark review.

## License and artifact approval checklist

- Verify runtime license and transitive notices.
- Verify each model and tokenizer license against intended distribution and use.
- Record provenance, version, quantization, checksum, and reproducible build/source details.
- Review auxiliary tokenizer and runtime artifacts.
- Approve expected transfer size, installed size, cache location, quota behavior, and eviction behavior.
- Confirm artifact integrity checks and corrupt-cache recovery.
- Confirm removal, rollback, and update procedures.
- Keep real artifact locations out of runtime configuration until approval.

## Device tier assumptions

- **Light:** lower-memory devices; must pass strict memory, latency, and stability gates.
- **Standard:** mainstream modern laptops/desktops; target tier for balanced evaluation.
- **Strong:** higher-memory devices; larger candidates must be opt-in and capability-gated.
- **Unsupported:** missing WebGPU, secure context, adapter, sufficient limits, memory, or storage; remain unavailable-safe.

WebGPU support is not uniform across browsers and is restricted to secure contexts. Runtime selection must use capability evidence, not user preference alone.

## Privacy and storage

- Learner inputs should remain on-device for the browser-local path.
- Model artifacts may require large transfers and persistent browser storage.
- Cache quota, eviction, corruption, updates, and user-controlled deletion must be designed before integration.
- Audit history remains metadata-only and must not store prompts, generated output, essays, transcripts, or learner-memory content.
- Preferred model tier remains a preference and never becomes readiness evidence.

## Safety and grading limitations

Small local models can hallucinate, follow instructions inconsistently, and produce uneven feedback quality. Model output must not be treated as an authoritative score or grading truth. Writing, speaking, practice, and tutoring quality must be evaluated separately across all 13 supported languages. Safety, refusal behavior, harmful content, prompt injection, and language-specific failure modes require benchmark coverage.

## Rollback plan

If runtime initialization, device checks, model approval, artifact integrity, storage, performance, multilingual quality, or safety validation fails:

- keep all coach shells unavailable-safe;
- expose no generated content;
- preserve the existing failure and limitation states;
- retain learner-memory consent and metadata-only audit behavior;
- remove or disable the candidate adapter without changing public coach contracts.

## Non-goals

- No inference implementation.
- No runtime dependency installation.
- No model artifact, manifest location, download, or cache operation.
- No change to `AIService.execute`.
- No change to coach shell behavior.
- No change to learner-memory consent.
- No remote credential or server integration.
- No claim that any candidate is approved or ready.

## Phase 4.2 entry criteria

1. Select one runtime for an isolated proof of concept.
2. Complete runtime, model, tokenizer, and artifact license review.
3. Approve a metadata-only artifact manifest design without enabling generation.
4. Define browser secure-context, WebGPU, adapter, feature, and limit detection.
5. Define storage quota, cache lifecycle, corruption recovery, and user deletion.
6. Define cancellation, reload, update, and rollback behavior.
7. Confirm unsupported devices map to unavailable-safe states.
8. Prepare a deterministic benchmark corpus covering all 13 languages.
9. Confirm no dependency or artifact reaches production before explicit approval.

## Phase 4.3 benchmark criteria

1. Artifact transfer size, installed size, cache reuse, and eviction behavior.
2. Initialization time and first-token latency by device tier.
3. Sustained generation speed and peak memory use.
4. Weak-device, unsupported-device, and storage-pressure fallback behavior.
5. Multilingual instruction-following quality across all 13 languages.
6. Hallucination, unsafe output, refusal, and prompt-injection behavior.
7. Writing and speaking feedback quality without treating output as grading truth.
8. Tutor and practice-generation usefulness without canned or fabricated content.
9. Cancellation, tab reload, corrupt cache, and runtime failure recovery.
10. Provenance, audit metadata, and unavailable-safe output gating.

## Primary-source verification record

Verified online on 2026-07-17 using primary or official documentation:

- MLC AI, **WebLLM official GitHub repository and documentation**: in-browser language-model inference, WebGPU acceleration, worker support, and browser cache backends.
- Hugging Face, **Transformers.js official documentation**: browser WASM execution, optional WebGPU acceleration, quantization guidance, and browser support caveats.
- llama.cpp official repository documentation: WebGPU browser work is described as in progress and uses WebAssembly tooling.
- Qwen official model cards and Qwen3 repository/blog: Qwen3-0.6B, Qwen3-1.7B, and Qwen3-4B are published candidates; the official repositories identify Apache-2.0 licensing and broad multilingual support.
- MDN WebGPU documentation: WebGPU remains limited-availability, requires a secure context, and capability detection must request an adapter/device.

These sources support candidate selection only. Product-specific artifact formats, memory requirements, browser coverage, multilingual quality, and grading suitability still require Phase 4.2/4.3 validation.
