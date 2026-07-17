# Phase 4 Runtime Capability Probe

## Status

Proposed metadata-only capability layer. No model is active, approved, downloaded, cached, benchmarked, or connected to inference in Phase 4.6.

## Purpose

The probe collects safe, best-effort browser and device metadata after the readiness shell mounts. It converts observed metadata into the existing `LocalAiDeviceProfile` contract so the Adaptive Device Tier Gate can produce a candidate classification. The probe is metadata only and does not establish model eligibility or activation.

## Observed metadata

The probe may observe secure-context status, the presence of `navigator.gpu`, approximate device memory, storage quota and usage estimates, Network Information fields, Battery API fields, normalized browser and operating-system labels, and clear mobile or tablet signals. An injected clock may supply `collectedAt`; without one, the field remains `null`.

## Unknown metadata

Unavailable or invalid fields remain unknown or `null`. Unknown WebGPU maps conservatively to the existing `unchecked` device-profile state. The browser cannot reliably determine HDD versus SSD, and it cannot reliably determine laptop versus desktop. Storage kind therefore remains unknown unless a trusted caller supplies an explicit hint. Desktop or laptop kind also remains unknown without a trusted hint. Thermal status defaults to unknown.

## Injected environment boundary

Tests and controlled callers pass a small environment contract containing window availability, secure-context status, a navigator-like object, optional trusted device hints, and an optional clock. Production probing creates no trusted hints. Global `window` and `navigator` access occurs only inside the default-environment factory, never at module import time.

## Secure context and WebGPU

A secure context is supported only when the observed value is explicitly `true`. An explicit `false` value is unsupported. The probe checks only whether `navigator.gpu` is present. It does not request an adapter or device. WebGPU presence does not mean runtime readiness, benchmark success, model approval, artifact approval, or an active model. WebGPU outside a secure context maps to unsupported.

## Storage estimate

When `navigator.storage.estimate` exists, quota and usage are read and converted from bytes to binary MiB using `1024 * 1024`. Values must be finite and non-negative. Remaining space is computed only when both quota and usage are valid, and it is clamped to zero. Storage failure is isolated and leaves storage metadata unknown. Quota does not reveal HDD or SSD and is never used to infer storage kind.

## Network and battery metadata

The probe reads existing navigator metadata and makes no network request. Explicit offline state maps to offline. Only an explicit connection type of Wi-Fi or cellular maps to those labels; effective connection type remains informational and never implies cellular. Data saver adds a warning but does not invent a connection kind. Battery metadata is optional, isolated from other APIs, and validated before level is converted to a percentage.

## Device-profile mapping

Valid approximate memory, normalized browser and OS labels, observed or trusted device kind, trusted storage kind, WebGPU state, battery percentage, trusted thermal state, and connection kind map into `LocalAiDeviceProfile`. Unknown probe WebGPU becomes `unchecked`; an insecure context becomes `unsupported`. The mapper does not assign a model tier, entitlement, benchmark result, or model state.

## Adaptive tier integration

The view model calls the existing Adaptive Device Tier Gate with the selected access tier, defaulting to `free`. Benchmark status for light, standard, and pro is always `not-run`. The assigned tier is a candidate device tier and does not equal model eligibility. A strong device still requires model approval, artifact approval, and a real benchmark before any model attempt. `allowedModelTiers` remains empty and `canAttempt4B` remains false in Phase 4.6.

## Privacy and persistence

Probe data stays in current component memory. There is no local storage, session storage, database, cache storage, analytics upload, cloud sync, or audit persistence. Raw user-agent text is used only transiently for normalization and is not stored in the result or displayed.

## Failure handling

Missing browser globals, missing optional APIs, rejected storage estimates, rejected battery reads, invalid numeric fields, and property access failures return fallback-safe metadata rather than crashing the core app. Optional API failures are isolated from each other. Core app features and deterministic fallback do not depend on probe success.

## Safety invariants

The result always states `metadataOnly: true`, `modelActive: false`, and `benchmarkVerified: false`. Candidate classification is not model activation. No model download occurs. No model cache is written. The probe does not benchmark a model, approve a model, approve an artifact, run inference, call an AI service, or make a network request.

## Non-goals

- Model download, cache, deletion, integrity checks, or artifact acquisition
- Runtime initialization, adapter/device requests, model loading, or inference
- Benchmark execution, benchmark approval, model approval, or artifact approval
- Active model selection or a readiness claim
- Reliable CPU, HDD/SSD, laptop/desktop, or thermal detection from browser heuristics
- Persistence, analytics upload, cloud synchronization, or learner-content collection
