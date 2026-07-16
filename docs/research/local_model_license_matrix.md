# Local AI runtime and model license matrix

## Scope and legal posture

This matrix is an engineering gate, not legal advice. “Commercial use” and “redistribution” are separate checks. A permissive runtime license never clears the license of a model, tokenizer, dataset-derived asset, quantized conversion or compiled model library. Every production artifact must have a reviewable license record in `ModelArtifactManifest` before download or inference is enabled.

## Matrix

| Component/artifact class | Upstream evidence | Current status | Commercial/redistribution interpretation | Required project evidence before approval |
|---|---|---|---|---|
| WebLLM runtime package | Apache-2.0 license shown by official repository: https://github.com/mlc-ai/web-llm | **Needs verification at pinned version** | Apache-2.0 generally permits commercial use and redistribution subject to notices, copyright and license terms. Review the exact pinned release and bundled third-party notices. | Pinned package version, lockfile entry, license notice bundle, dependency/SBOM review and security review. |
| Transformers.js runtime package | Apache-2.0 license: https://github.com/huggingface/transformers.js/blob/main/LICENSE | **Needs verification at pinned version** | Runtime licensing does not license any model files loaded through the API. | Pinned version, notices, dependency/SBOM review and exact model artifact records. |
| ONNX Runtime Web / WASM backend | MIT license: https://github.com/microsoft/onnxruntime/blob/main/LICENSE | **Needs verification at pinned version** | MIT notice must be preserved. Package includes/uses additional components, so published notices and exact build must be reviewed. | Pinned package/build, `ThirdPartyNotices.txt` equivalent, selected execution-provider build and security review. |
| WebAssembly binaries compiled for a selected runtime | Runtime-specific source/build plus package notices; deployment requirements: https://onnxruntime.ai/docs/tutorials/web/deploy.html | **Not present** | Binary inherits selected runtime/build and third-party terms. A CDN copy or custom build is a redistributable artifact that needs provenance. | Source commit/build recipe, checksum, binary provenance, license bundle and hosting record. |
| Model weights, tokenizer and config | License metadata is declared per Hub repository/model card; official guidance: https://huggingface.co/docs/hub/en/repositories-licenses and https://huggingface.co/docs/hub/model-release-checklist | **No candidate approved** | Must verify exact model revision, license text, commercial-use allowance, attribution, acceptable-use restrictions, geographic/sector limits and redistribution terms. `unknown`, `other`, non-commercial, research-only or gated terms block approval until review resolves them. | Exact revision/digest, license ID/text, evidence URL, commercial-use and redistribution booleans, attribution/notice path, restrictions and reviewer/date. |
| Quantized or converted model | Original model plus converter/runtime terms | **No candidate approved** | Quantization/conversion may introduce a new artifact license or obligations. It does not automatically inherit a permissive license from the original model. | Conversion provenance, source revision, output checksum, license compatibility analysis and notice bundle. |
| WebLLM MLC model library (`.wasm`) | WebLLM custom-model documentation: https://webllm.mlc.ai/docs/developer/add_models.html | **No candidate approved** | Compiled model library is a separately hosted artifact and must be checked alongside weights/tokenizer/config. | Exact binary checksum, build provenance, license/notice evidence and compatibility with runtime version. |
| Future cloud provider | Provider terms/DPA not selected | **Unverified / not a candidate** | Review API terms, output rights, commercial use, retention, training use, subprocessors, data residency, regional availability and key-handling model. | Provider ADR, DPA/security review, server-side broker design, consent copy, retention/deletion controls and cost limits. |
| Null/unavailable adapter | Internal project adapter: `src/platform/ai/localRuntimeAdapter.ts` | **Current safe fallback** | No model inference, model download or third-party model redistribution. | Keep as default for all unapproved/unavailable states. |

## Approval checklist

The artifact manager must be able to answer all of the following for a single pinned artifact:

- `license.status` is verified, with stable `licenseId` and evidence URL.
- `commercialUse` and `redistribution` are explicitly recorded; neither may be inferred from a package name.
- Runtime, model, tokenizer, config and compiled libraries have compatible terms and preserved notices.
- Exact artifact revision has a cryptographic checksum and integrity verification record.
- No gated/private download, mutable `main` branch, unreviewed CDN or user-supplied URL is used in production.
- Acceptable-use, attribution, geographic and field-of-use restrictions are documented.
- A benchmark has run on at least one supported device tier, and its evidence is linked.
- Privacy, consent, deletion/export, telemetry and offline behavior have been reviewed.
- If any answer is unknown, the artifact remains `not-approved`, download is disabled, and the null adapter is used.

## Evidence storage contract

The existing `ModelArtifactManifest` fields are the minimum platform contract:

```text
license.status
license.licenseId
license.commercialUse
license.redistribution
license.evidenceUrl
license.noticePath
integrity
runtime.runtimeId / runtime.runtimeVersion / runtime.format
download.url (only after approval)
download.requiresUserAction
storage
```

This matrix does not approve any concrete model. It records what must be verified before a candidate can move from `candidate` to `approved`.
