# Platform Core

Platform Core supplies trustworthy local-AI and data infrastructure to every learning experience without depending on a language, curriculum, skill, or exam track.

## Language

**Capability State**:
An explicit result describing whether a platform operation is ready, needs consent or download, is unsupported, was cancelled, or failed.
_Avoid_: fallback AI, mock mode

**Model Candidate**:
A versioned model artifact under license, quality, security, device, and performance evaluation.
_Avoid_: selected model, default model

**Approved Model Artifact**:
A commercially compatible, benchmarked, version-pinned artifact with project-controlled distribution and verified integrity metadata.
_Avoid_: latest model, Hugging Face model

**Artifact Manifest**:
The immutable release record for approved model/runtime bytes, including identity, version, size, origin, digest, license decision, and benchmark link.
_Avoid_: model config, download URL

**Evaluation Benchmark**:
A versioned set of cases, criteria, hardware observations, and promotion thresholds used to compare platform capabilities or model candidates.
_Avoid_: official score set, demo prompts

**Structured Output**:
Untrusted generated data that must parse and satisfy a bounded schema before a consumer can use it.
_Avoid_: model response object, trusted JSON

**Consent Grant**:
A versioned, revocable permission for a named learner-data category and purpose to cross the local-device boundary.
_Avoid_: accepted terms, implicit consent

**Entitlement**:
The platform decision that a user may access a capability or product pack under a named plan, grant, or promotion.
_Avoid_: paid flag, premium boolean

**Platform Event**:
A privacy-filtered operational record describing capability, performance, policy, security, or failure behavior without learner content.
_Avoid_: learner history, raw telemetry

**Local AI Foundation**:
The set of platform contracts that reports and governs local AI capability, artifacts, runtime state, service outcomes and provider eligibility without implying that inference exists.
_Avoid_: local AI engine, working AI

**Runtime Provider**:
A governed execution boundary eligible to create a model runtime adapter only when artifact, benchmark, license, device and permission evidence is complete.
_Avoid_: model, AI vendor

**Provider Placeholder**:
A named provider profile that describes future compatibility while remaining explicitly unable to execute or generate output.
_Avoid_: provider integration, fallback AI

**Provider Selection**:
A fail-closed platform decision that either identifies an implemented compatible provider with complete evidence or returns explicit unavailability reasons.
_Avoid_: automatic fallback, best model

**Inference Readiness**:
The combined state in which capability, approved installed artifact, implemented compatible provider and valid runtime session all permit a supported generated operation.
_Avoid_: device capable, model available
