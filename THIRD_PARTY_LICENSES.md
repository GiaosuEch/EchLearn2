# Third-party runtime and model license register

This file is a release gate, not legal advice. Runtime-code license and model-weight license are reviewed separately. A candidate marked `NEEDS_VERIFICATION` cannot enter the production approved-model manifest.

## Existing/runtime dependencies relevant to local AI

| Component | Upstream license evidence | Intended use | Status |
| --- | --- | --- | --- |
| WebLLM | Apache-2.0: https://github.com/mlc-ai/web-llm/blob/main/LICENSE | Candidate browser text-generation runtime. | Runtime license verified from upstream; dependency/version/supply-chain review pending before addition. |
| Transformers.js | Apache-2.0: https://github.com/huggingface/transformers.js/blob/main/LICENSE | Candidate browser ASR/embedding/task runtime. | Runtime license verified from upstream; dependency/version/supply-chain review pending before addition. |
| Ollama | MIT: https://github.com/ollama/ollama/blob/main/LICENSE | Possible future optional localhost adapter, not required for zero-install contract. | Not a current production dependency. |
| llama.cpp | MIT: https://github.com/ggml-org/llama.cpp/blob/master/LICENSE | Possible future optional local runtime. | Not a current production dependency. |

## Model candidates

| Candidate family/artifact | Upstream evidence | Commercial/redistribution status | Production status |
| --- | --- | --- | --- |
| Qwen3 official weights | Official model card lists Apache-2.0 for reviewed upstream variants: https://huggingface.co/Qwen/Qwen3-4B | Converted browser artifact, tokenizer files, notices, revision, and project redistribution must be reviewed per candidate. | `NEEDS_VERIFICATION`; not selected for any tier. |
| Whisper official weights/code | MIT repository license: https://github.com/openai/whisper/blob/main/LICENSE | Specific ONNX conversion provenance, files, notices, revision, and redistribution must be reviewed. | `NEEDS_VERIFICATION`; not approved for ASR. |
| Any MLC/ONNX community conversion | Artifact-specific model card and file provenance required. | Never inherit permission merely from WebLLM/Transformers.js runtime license. | `NEEDS_VERIFICATION` until complete approval record. |

## Required approval record per downloadable artifact

- Exact upstream owner, repository, immutable revision, file list, and conversion provenance.
- Base-model license and converted-artifact license/terms.
- Commercial use, modification, and redistribution decision.
- Attribution, notice, acceptable-use, naming, and downstream disclosure duties.
- Export/sanctions or jurisdiction review where relevant.
- Runtime/tokenizer compatibility versions.
- Project-controlled artifact URL, exact byte size, SHA-256 or stronger digest, and supported integrity metadata.
- Security scan and benchmark promotion record.
- Reviewer, date, and re-review trigger.

## Explicitly disallowed

- Non-commercial weights for a commercial product without separate permission.
- Runtime links to mutable `main`/`latest` model paths.
- Treating a repository badge or runtime license as permission for model weights.
- Shipping an artifact whose license, provenance, checksum, or notices are incomplete.

