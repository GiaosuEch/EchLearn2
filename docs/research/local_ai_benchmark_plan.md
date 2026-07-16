# Local AI benchmark and promotion plan

## Purpose

This plan defines the evidence required to compare runtime/model candidates for a language-learning platform. It deliberately contains no invented latency, memory, accuracy, quality, calibration or cost numbers. Until a test run produces an evidence record, the value is `null` and the status is `not-run` or `needs-evidence`.

## Candidate benchmark record

Each run must identify a complete candidate and environment. The shape is compatible with the platform's `EvaluationBenchmark` and artifact contracts:

```text
candidateId: string
modelVersion: string
runtimeProvider: string
runtimeVersion: string
requiredDeviceTier: basic | light-local | standard-local | pro-local
licenseStatus: verified | needs-verification | rejected
artifactSizeBytes: number | null
artifactChecksum: string | null
coldStartMs: number | null
peakMemoryBytes: number | null
p50LatencyMs: number | null
qualityScore: number | null
languageCoverage: string[]
taskCoverage: string[]
calibrationStatus: not-applicable | internal | calibrated
benchmarkStatus: not-run | needs-evidence | passed | failed
approvalStatus: candidate | not-approved | approved
productionReady: boolean
evidenceRefs: string[]
rejectionReasons: string[]
```

`qualityScore` is optional and must never be populated from a fabricated or untraceable value. A score is meaningful only when benchmark cases, rubric version, evaluator, run metadata and evidence references are available.

## Generic task suite

Use platform-level task IDs so the benchmark can be reused by product packs:

- `conversation`
- `explain`
- `feedback`
- `generate-practice`
- `summarize`
- `classify`
- `assess`
- `plan-study`
- `recommend-next-practice`

Each case must have a stable `caseId`, an input fixture reference, expected behaviors, a rubric version and an evaluator record. Fixtures should be synthetic or openly licensed; learner content and raw audio are out of scope for the benchmark corpus.

## Measurement protocol

1. **Pin the environment.** Record browser/OS, device tier, CPU/GPU identifiers where available, memory estimate, concurrency, network mode, cache state, runtime version, model revision and artifact checksums.
2. **Separate cold and warm runs.** A cold run includes artifact initialization; a warm run starts only after a complete verified cache. Do not compare a cached WebLLM run with a first-download WASM run.
3. **Measure actual resources.** Capture download bytes, initialization time, first-token/first-result latency, p50/p95 latency, peak memory, failure rate, thermal/battery observations where available and cancellation behavior. Missing measurements remain `null`.
4. **Run across tiers.** A candidate may only be recommended for a tier whose device matrix has evidence. A model requiring `standard-local` cannot be recommended for `basic` based on capability labels alone.
5. **Evaluate behavior, not just speed.** Record structured-output validity, schema adherence, instruction following, language coverage, feedback usefulness and refusal/limitation behavior. Assessment outputs remain uncalibrated unless lawful reference data exists.
6. **Repeat and retain evidence.** Store run ID, timestamp, harness version, case IDs, raw measurements, failure logs and artifact digests. Results must be reproducible from the pinned manifest.

## Status and promotion rules

| State | Meaning | Allowed product behavior |
|---|---|---|
| `not-run` | No benchmark execution exists. | Candidate may appear in research docs only. No download, inference or recommendation. |
| `needs-evidence` | A run exists but one or more required measurements, license records, checksums or quality references are missing. | Keep `not-approved`; show unavailable/needs-review state. No production inference. |
| `passed` | Required benchmark data and evidence are complete, and the candidate meets the written benchmark thresholds. Approval review is still required. | Candidate can be compared internally. No production promotion until all non-benchmark gates pass. |
| `failed` | A hard gate failed or a reproducible safety/license/performance issue was found. | Block download and inference; record failure reason. |
| `approvalStatus: approved` | License, integrity, benchmark, tier fit, privacy/security and operational gates all passed. | Artifact manager may expose explicit user-initiated download for the pinned manifest. |

Promotion requires all of:

- verified commercial-use and redistribution rights for every artifact;
- pinned version/revision and real checksum/integrity evidence;
- benchmark status `passed` on at least one declared device tier;
- quality and structured-output evidence for intended generic tasks;
- memory/latency/failure behavior within an agreed tier-specific threshold;
- no unresolved security, privacy, consent, export/delete or telemetry violation;
- clear limitations and a rollback/revocation path;
- no fake output or random/canned assessment outcome;
- artifact host/CDN, cache quota, progress, cancel/retry and deletion behavior tested.

Missing evidence blocks promotion. There is no “best model” claim before comparison runs.

## Runtime/provider test matrix

| Provider profile | Minimum tests | Key failure to record |
|---|---|---|
| WebLLM/WebGPU | adapter acquisition, worker responsiveness, first load, warm load, cache backend, integrity failure, cancellation, context limits | WebGPU unavailable, shader/driver failure, model-library mismatch, cache quota/eviction |
| Transformers.js WebGPU | pipeline initialization, operator coverage, structured output, WebGPU-to-WASM fallback behavior, cache completeness | experimental WebGPU failure, unsupported operator/model format, fallback latency |
| WASM-only | browser/Node compatibility, SIMD/thread variant, CPU latency, memory peak, offline warm run, cancellation | long CPU latency, memory exhaustion, worker failure, missing WASM binary |
| Cloud boost (future) | consent gate, offline denial, server-side secret handling, timeout/retry, rate/cost limits, deletion/retention | accidental learner-data upload, key exposure, outage loop, unbounded cost |
| Null/unavailable | every unavailable/not-installed/unapproved path returns no output and a typed reason | accidental fake success, fabricated benchmark or score |

## Privacy and data handling

- Use synthetic/public fixtures; never upload learner content or raw audio to a benchmark provider without separate, recorded consent and research approval.
- Keep raw prompts/outputs scoped to test artifacts and redact personal data. Export/delete run evidence through the project process.
- Test offline behavior explicitly: no network request is a pass criterion for local providers after a complete verified cache; a cloud provider must fail closed offline.
- Record only operational telemetry needed to reproduce a run. Do not treat browser capability or latency as learner assessment evidence.

## Official sources

- Project evaluation contract: `src/platform/evaluation/evaluationBenchmark.ts` (`EvaluationBenchmark`, `EvaluationScope`, calibration status).
- Project artifact contract: `src/platform/ai/modelArtifactManifest.ts` (`ModelArtifactManifest`, integrity/license/download/storage fields).
- Project runtime safety boundary: `src/platform/ai/localRuntimeAdapter.ts` (`createUnavailableLocalRuntimeAdapter`).
- ONNX Runtime Web development flow and local/offline trade-offs: https://onnxruntime.ai/docs/tutorials/web/
- ONNX Runtime Web deployment, cache, binary and file-size requirements: https://onnxruntime.ai/docs/tutorials/web/deploy.html
- Transformers.js environment controls for remote/local models and browser cache: https://huggingface.co/docs/transformers.js/main/api/env
- Transformers.js cache completeness API: https://huggingface.co/docs/transformers.js/api/utils/model_registry
- WebLLM model-loading progress, caching and integrity verification: https://github.com/mlc-ai/web-llm
- Hugging Face model license/evidence guidance: https://huggingface.co/docs/hub/en/repositories-licenses
