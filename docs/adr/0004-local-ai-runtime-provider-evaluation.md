# ADR-0004: Evaluate local AI runtime providers before integration

## Status

Proposed. No provider is approved by this ADR. The current production-safe behavior remains the null/unavailable local runtime adapter.

## Context

The language-learning platform has capability detection, artifact manifests, an artifact manager, a local runtime adapter boundary, a generic AI service boundary and a readiness panel. Those layers intentionally do not download or execute a model yet. Phase 2.6 needs a reversible decision process before adding a runtime dependency or hosting an artifact.

The candidates have different constraints:

- WebLLM is a WebGPU-accelerated in-browser LLM engine with browser cache options, but model libraries and weights are large and WebGPU support is uneven.
- Transformers.js supports task-specific browser inference, using WASM by default and WebGPU when requested; model format/operator coverage and model licenses vary.
- A WASM-only profile has broad CPU compatibility but may be too slow or memory-intensive for some devices.
- A future cloud-boost adapter can cover devices that cannot run a local model, but it introduces consent, data-transfer, cost, residency and secret-management requirements.
- The null/unavailable adapter is the only currently integrated provider and safely returns typed unavailable/needs-model responses.

Official documentation confirms that WebLLM and Transformers.js source are Apache-2.0, ONNX Runtime is MIT, and model artifacts are licensed per repository/model rather than by the runtime package. See the source list below.

## Decision

1. Keep `createUnavailableLocalRuntimeAdapter()` as the default and fail-closed provider until a candidate passes the promotion gates.
2. Evaluate WebLLM and Transformers.js as **candidates**, with a WASM-only execution profile as the compatibility fallback. Do not install either dependency in this phase.
3. Keep a future cloud provider behind the existing `AIService`/runtime adapter boundary. Do not select a vendor or expose a browser API key.
4. Require a candidate benchmark record with real measurements, exact artifact checksums, license evidence, tier fit, task coverage, calibration status and limitations before approval.
5. Require explicit user-initiated artifact download only after approval. Runtime/provider selection must not resolve mutable model URLs or download implicitly at page load.
6. Keep provider decisions platform-level. Generic task IDs are allowed; exam-pack concepts and official exam scores do not belong in this ADR or benchmark harness.

## Alternatives considered

### Install WebLLM now

Rejected for Phase 2.6: it would add a large runtime/model supply chain before license, device and performance evidence exists. WebLLM's own documentation states that first model loading can take significant time and requires caching/integrity handling.

### Install Transformers.js now

Rejected for Phase 2.6: it is a plausible first benchmark target, but adding it without an approved artifact and measurements would still create remote-loading, bundle, cache and model-license risk. Keep the adapter seam provider-neutral.

### Use a cloud provider as the default

Rejected: it conflicts with the product's local-first/privacy posture and would require a provider-specific legal, data-processing, cost and secret-management decision.

### Build a custom runtime immediately

Rejected: custom WebAssembly/WebGPU builds increase maintenance, security, binary-hosting and reproducibility burden before baseline measurements are available.

## Promotion gates

A provider/model pair can move to `approved` only when:

- runtime and every artifact have compatible, verified commercial-use and redistribution rights;
- exact versions/revisions and checksums are pinned;
- benchmark status is `passed` with reproducible evidence on at least one declared device tier;
- generic task behavior, structured output, quality limitations and calibration status are recorded;
- latency, memory, failure, cancellation and offline/cache behavior meet the tier's written threshold;
- consent, privacy, security, telemetry, export/delete and rollback controls pass review;
- no fake output, random assessment or uncalibrated official-score claim is possible;
- hosting, storage quota, progress, cancel/retry, cache management and artifact revocation are operationally tested.

Otherwise the candidate remains `not-approved`, `needs-evidence` or `rejected`, and the null adapter is used.

## Consequences

### Positive

- Runtime choice is evidence-based and reversible.
- Artifact manager remains the only download/integrity boundary.
- Device tiers and readiness states remain truthful instead of implying capability equals readiness.
- Legal/privacy review is tied to concrete artifacts and provider terms.

### Costs and risks

- Real benchmark runs require a device matrix, test fixtures and storage for evidence.
- We defer AI output until a candidate clears gates.
- WebGPU and browser storage behavior will continue to vary by browser/driver and may require per-tier fallbacks.

## Revisit trigger

Revisit this ADR when a benchmark run has complete evidence for at least one candidate, or when browser/runtime support, model licensing, privacy requirements or product task scope materially changes. A subsequent ADR must supersede this one; do not silently edit the decision history.

## Official sources

- WebLLM capabilities, cache backends, model loading, worker support, integrity checks and license: https://github.com/mlc-ai/web-llm
- WebLLM custom model artifact guidance: https://webllm.mlc.ai/docs/developer/add_models.html
- Transformers.js overview and WASM/WebGPU behavior: https://huggingface.co/docs/transformers.js/en/index
- Transformers.js WebGPU limitations: https://huggingface.co/docs/transformers.js/en/guides/webgpu
- Transformers.js remote/local model and cache configuration: https://huggingface.co/docs/transformers.js/main/api/env
- ONNX Runtime Web execution-provider/browser matrix: https://onnxruntime.ai/docs/get-started/with-javascript/web.html
- ONNX Runtime Web deployment, cache and file-size guidance: https://onnxruntime.ai/docs/tutorials/web/deploy.html
- WebGPU secure-context and browser availability: https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API
- Hugging Face license metadata and model-card guidance: https://huggingface.co/docs/hub/en/repositories-licenses
- ONNX Runtime MIT license: https://github.com/microsoft/onnxruntime/blob/main/LICENSE
