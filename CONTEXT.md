# Local IELTS Learning Context

This context defines the product language for a local-first IELTS learning coach. These terms are normative across UI copy, services, persistence, tests, and documentation.

## Assessment

**Uncalibrated beta estimate**:
A provisional learning estimate that has not been calibrated against a lawful set of examiner-rated IELTS responses. It is not an official IELTS score.
_Avoid_: IELTS score, official band, examiner score

**Learning evidence**:
A bounded excerpt or measurable signal that explains a coaching observation, such as a sentence, pause count, or words per minute.
_Avoid_: proof of band, examiner evidence

**Evaluation case**:
A versioned input with expected behavioral criteria used to compare candidate engines and prevent regressions.
_Avoid_: gold score, official sample

**Calibration set**:
A lawfully obtained, consented dataset with qualified human ratings that may later map beta estimates to measured error and confidence.
_Avoid_: benchmark prompts, scraped examiner data

## Local AI

**Model tier**:
One of Light, Standard, or Pro Local, representing an approved device/download/quality envelope rather than a permanently assigned model.
_Avoid_: free model, default model

**Model candidate**:
A versioned model artifact being evaluated for a tier and not yet approved for production use.
_Avoid_: selected model, production model

**Approved model artifact**:
A commercially compatible, benchmarked, version-pinned artifact whose integrity metadata is stored in the project manifest.
_Avoid_: Hugging Face model, latest model

**Capability state**:
An explicit runtime result describing whether a feature is ready, needs download, is unsupported, was denied, or failed.
_Avoid_: fallback AI, mock mode

**Deterministic coach**:
A non-generative learning path that uses authored content and measurable rules and never presents itself as AI or invents a band.
_Avoid_: basic AI, simulated AI

## Learner data

**Learner memory**:
User-controlled learning context covering profile, mistakes, vocabulary, history, and study-plan evidence.
_Avoid_: AI brain, self-training data

**Sync consent**:
A versioned, revocable choice permitting named learner-data categories to leave the device for Supabase sync.
_Avoid_: terms accepted, implicit consent

**Raw audio**:
The original microphone recording before transcription or feature extraction; it is ephemeral by default.
_Avoid_: speaking history, learning evidence

**Test fingerprint**:
A deterministic identifier and similarity signature used to prevent exact or near-duplicate generated tests.
_Avoid_: random ID, test hash only

