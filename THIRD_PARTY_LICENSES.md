# Third-party runtime and model license register

This file is a release gate, not legal advice. Runtime-code license and model-weight license are reviewed separately. A candidate marked `NEEDS_VERIFICATION` cannot enter the production approved-model manifest.

## Learning-content corpora

Machine-readable mirror of this table: `src/services/contentLicenses.ts`. The
allowlist there is enforced by `scripts/audit_vocab_quality.cjs` — content whose
`provenance.license` is not on the list fails the build.

| Corpus | License | Evidence | Use in product | Obligations |
| --- | --- | --- | --- | --- |
| Tatoeba | CC BY 2.0 FR | https://tatoeba.org/en/downloads | Example sentences and their translations. | Credit "Tatoeba" and link the sentence. Not share-alike, so it may sit beside proprietary text. Audio excluded — per-contributor licences. |
| Wiktionary via Wiktextract / kaikki.org | CC BY-SA 4.0 (+ GFDL) | https://en.wiktionary.org/wiki/Wiktionary:Copyrights | Headwords, IPA, part of speech, inflections, and definition glosses. | **Share-alike.** Definition text is kept in a demarcated, attributed layer and is not blended into proprietary glosses. Extracted facts (IPA, POS, inflection) are not copyrightable and carry no share-alike duty. Wiktextract *code* is MIT; the *data* is not. |
| hermitdave/FrequencyWords | MIT (code) / CC BY-SA 4.0 (content) | https://github.com/hermitdave/FrequencyWords | **Internal ordering only.** Used at build time by `scripts/generate_vocab_batches.cjs` to rank which words to teach first. | The list itself is never redistributed — only the resulting ordering of our own wordlist, which is a fact. Derived from OpenSubtitles via OPUS, so no sentence from it is shipped. |
| CEFR-J Vocabulary & Grammar Profile | Free for research and commercial use with citation | https://github.com/openlanguageprofiles/olp-en-cefrj | CEFR level assignment for English. | Cite Tono Lab, TUFS. |

### Rejected corpora and why

Recorded so the decision is not silently reversed. Mirrored in `DENIED_SOURCES`
in `src/services/contentLicenses.ts`.

| Corpus | Reason |
| --- | --- |
| OPUS / OpenSubtitles sentences | OPUS publishes no license statement, and the subtitles are user-uploaded derivatives of copyrighted films. Frequency counts derived from it are used internally for ordering only; no sentence is shipped. |
| Mozilla Common Voice | Historically CC0, but since October 2025 distribution moved to the Mozilla Data Collective with paid/conditional access. Current terms unverified — re-verify before any use. |
| Oxford 3000 / 5000 | Proprietary to Oxford University Press. No open license. |
| English Vocabulary Profile | Free to view, not redistributable. |
| Facebook / Instagram / TikTok / YouTube content | All four prohibit scraping in their terms. Users retain copyright in their posts and the platform licence is not sublicensable to us. YouTube may be **embedded** via the IFrame player; it may not be ingested. |
| Universal Dependencies (as shipped content) | Licences are per-treebank and many are CC BY-NC or CC BY-NC-SA, which bar commercial use. Usable only after filtering to CC BY / CC BY-SA treebanks per language. |

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

