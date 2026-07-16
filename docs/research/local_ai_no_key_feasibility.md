# No-API-key local AI feasibility for ECH Lern

**Research date:** 2026-07-16  
**Scope:** React 19.2.7, Vite 8.1.1, TypeScript 6.0.2 web application  
**Source policy:** primary/official documentation, repositories, model cards, and browser standards only. Statements marked **Inference** are engineering judgments derived from those sources rather than claims made by a source.

## Executive decision

A useful, private AI tutor with **no paid model API and no model-provider API key** is feasible. A universally available assistant with frontier-hosted quality, zero download, zero hardware cost, and zero operational cost is not.

The strongest viable design is a **two-tier local architecture**:

1. **Desktop-quality mode:** the web app connects, with explicit user permission, to a locally installed Ollama instance on `http://localhost:11434`. Ollama requires no authentication for its local API and keeps local prompts/data away from ollama.com when running local models. Sources: [Ollama API introduction](https://docs.ollama.com/api/introduction), [Ollama authentication](https://docs.ollama.com/api/authentication), [Ollama FAQ/privacy](https://docs.ollama.com/faq).
2. **Browser-only mode:** use WebLLM for local text generation on WebGPU and Transformers.js for task-specific ONNX models such as Whisper transcription, with WASM fallbacks only for sufficiently small models. Both run inside the browser without an inference server. Sources: [WebLLM official repository](https://github.com/mlc-ai/web-llm), [Transformers.js documentation](https://huggingface.co/docs/transformers.js/en/index), [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/).

For this IELTS product, local AI should be presented as a **learning coach**, not an authoritative examiner. Local ASR can transcribe speech, but transcript-only output is not evidence for phoneme accuracy, stress, intonation, or a defensible IELTS pronunciation band. **Inference:** the product must not convert Whisper text into a claimed pronunciation score without a separate, validated acoustic assessment model and calibration study.

## What “free” can and cannot mean

| Meaning | Feasible? | Reality |
|---|---:|---|
| No OpenAI/Anthropic/Gemini-style API key | Yes | Inference can run in the browser or through a local runtime. |
| No per-token model bill | Yes | Compute is paid implicitly by the user's hardware, electricity, bandwidth, and storage. |
| No first-run download | No | Model weights must reach the device somehow. WebLLM explicitly warns that first model loading requires a potentially long download; subsequent runs can use browser cache. [WebLLM loading and cache](https://github.com/mlc-ai/web-llm#cache-backend-policy) |
| No hosting/bandwidth cost for the product owner | Only if users fetch third-party model artifacts or install models locally | Self-hosting multi-GB weights or a shared GPU server has real bandwidth, storage, and compute costs. **Inference.** |
| Frontier-assistant quality on every phone/laptop | No | Browser-compatible models and available device memory are much smaller than what is practical in a hosted frontier system. See the measured examples below. |

“No key” is therefore a sound requirement. “No cost of any kind” is not a technically honest requirement.

## Option A — fully in-browser inference

### A1. WebLLM for chat and generation

WebLLM runs LLM inference entirely in the browser using WebGPU, exposes an OpenAI-style chat API, supports streaming and JSON mode, and can move heavy computation into dedicated Web Workers. Its Service Worker integration can reduce reload cost, but the browser may terminate a Service Worker at any time, so recovery is required. Sources: [WebLLM overview and features](https://github.com/mlc-ai/web-llm#overview), [worker support](https://github.com/mlc-ai/web-llm#using-workers), [service worker lifecycle warning](https://github.com/mlc-ai/web-llm#use-service-worker).

This fits a Vite/React client because WebLLM is distributed as the `@mlc-ai/web-llm` npm package. It does not require a backend inference service. [WebLLM installation](https://github.com/mlc-ai/web-llm#installation)

Important constraints:

- WebGPU is available only in secure contexts and MDN still classifies it as **limited availability**, so the application must feature-detect `navigator.gpu` and must not assume all browsers/devices work. [MDN WebGPU](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API)
- ONNX Runtime's current support table lists WASM broadly across desktop/mobile browsers, but WebGPU support is much narrower and WebGL is in maintenance mode. [ONNX Runtime Web supported versions](https://onnxruntime.ai/docs/get-started/with-javascript/web.html)
- WebLLM itself requires WebGPU. A WASM text-generation fallback is better handled by Transformers.js/ONNX for very small models, and will generally be much slower. **Inference.**
- Generation belongs in a Worker so it does not freeze React rendering. WebLLM officially provides `WebWorkerMLCEngine`. [WebLLM dedicated worker](https://github.com/mlc-ai/web-llm#dedicated-web-worker)
- Function/tool calling is still described as work in progress in WebLLM. Do not base critical product workflows on unconstrained model-created tool calls. [WebLLM compatibility/features](https://github.com/mlc-ai/web-llm#full-openai-compatibility)

### A2. Transformers.js for task-specific models and small text models

Transformers.js runs ONNX models directly in the browser. CPU execution uses WASM by default; WebGPU is enabled with `device: "webgpu"`. Its documentation recommends quantized types such as `q8` and `q4` in resource-constrained browser environments. Sources: [Transformers.js overview](https://huggingface.co/docs/transformers.js/en/index), [WebGPU guide](https://huggingface.co/docs/transformers.js/guides/webgpu).

It is particularly useful for:

- automatic speech recognition;
- embeddings for local semantic retrieval/memory;
- classification and lightweight feedback helpers;
- browser text generation with very small models.

The official Hugging Face examples include a Qwen3 0.6B WebGPU chat app described as a local browser reasoning model. [Official Qwen3 WebGPU example](https://github.com/huggingface/transformers.js-examples/tree/main/qwen3-webgpu) A quantized ONNX artifact for that 0.6B model is 618 MB. [Qwen3 0.6B quantized ONNX file](https://huggingface.co/onnx-community/Qwen3-0.6B-ONNX/blob/b1ece21c06dfce3839272e86b7fa12a985d97a7a/onnx/model_quantized.onnx)

**Inference:** 0.6B is an acceptable compatibility/demo tier, not a credible “assistant like ChatGPT” tier. It can handle constrained prompts and simple language exercises, but should not be trusted for nuanced IELTS evaluation or complex multi-step reasoning.

### A3. Official size and memory examples

The following values are not generic formulas; they are concrete artifacts and WebLLM configuration records available on the research date.

| Browser model artifact | Download/repository size | WebLLM declared VRAM need | Configured context | Source |
|---|---:|---:|---:|---|
| Llama 3.2 1B Instruct q4f16 | 705 MB | 879 MB | 4,096 | [artifact](https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC/tree/main), [WebLLM config](https://github.com/mlc-ai/web-llm/blob/main/src/config.ts) |
| Llama 3.2 3B Instruct q4f16 | 1.82 GB | 2,264 MB | 4,096 | [artifact](https://huggingface.co/mlc-ai/Llama-3.2-3B-Instruct-q4f16_1-MLC/tree/main), [WebLLM config](https://github.com/mlc-ai/web-llm/blob/main/src/config.ts) |
| Llama 3.1 8B Instruct q4f16 | 4.53 GB | 5,001 MB at 4K context | 4,096 | [artifact](https://huggingface.co/mlc-ai/Llama-3.1-8B-Instruct-q4f16_1-MLC/tree/main), [WebLLM config](https://github.com/mlc-ai/web-llm/blob/main/src/config.ts) |

These figures show why a one-model-for-everyone browser strategy is not credible. A 1–3B model is much easier to deploy, while an 8B model means a multi-GB first run and roughly 5 GB of GPU memory before normal browser/app overhead.

**Inference:** a product eligibility check should consider `navigator.gpu`, adapter features/limits, browser storage estimate, mobile/desktop class, and a small initialization probe. Device RAM is intentionally not reliably exposed by all browsers, so a static “RAM >= X” check cannot be the only gate.

### A4. Cache, storage, and offline behavior

WebLLM supports Cache API (default), IndexedDB, and OPFS cache backends. Transformers.js uses the browser Cache API by default when available, and also caches its WASM binaries. Sources: [WebLLM cache backend policy](https://github.com/mlc-ai/web-llm#cache-backend-policy), [Transformers.js environment/cache API](https://huggingface.co/docs/transformers.js/en/api/env).

Browser data is best-effort by default and may be evicted under storage pressure. The app can request persistent storage, but the browser may deny it. `navigator.storage.estimate()` returns approximate origin usage and quota. Sources: [MDN storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria), [MDN `persist()`](https://developer.mozilla.org/docs/Web/API/StorageManager/persist), [MDN `estimate()`](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate).

Product requirements that follow from this:

- Obtain explicit consent before downloading an “AI pack”; show exact approximate download and storage size.
- Check estimated quota before download and handle `QuotaExceededError`.
- Show download progress, cancellation, retry, current cached models, and a “delete AI models” control.
- Request persistence after meaningful user interaction, while handling rejection.
- Version/pin model artifacts so an app release does not silently redownload a different multi-GB model.
- Treat offline as “available after a successful first download and while cache remains present,” not as a permanent guarantee.

## Option B — local desktop/self-hosted runtime

### B1. Ollama

Ollama exposes its local API at `http://localhost:11434/api`; local access requires no authentication. Official JavaScript and Python libraries are available, but a React app can also use the REST API. Sources: [Ollama API introduction](https://docs.ollama.com/api/introduction), [Ollama authentication](https://docs.ollama.com/api/authentication).

This is the most practical no-key route for a substantially better tutor because a desktop runtime can use CPU RAM, dedicated VRAM, Apple Metal, NVIDIA, AMD, and Vulkan backends. [Ollama hardware support](https://docs.ollama.com/gpu)

Concrete Ollama download examples:

| Local model | Ollama artifact size | Notes | Source |
|---|---:|---|---|
| Qwen3 0.6B | 523 MB | 40K listed context | [Qwen3 tags](https://ollama.com/library/qwen3/tags) |
| Qwen3 1.7B | 1.4 GB | 40K listed context | [Qwen3 tags](https://ollama.com/library/qwen3/tags) |
| Qwen3 4B | 2.5 GB | 256K listed context for current tag | [Qwen3 tags](https://ollama.com/library/qwen3/tags) |
| Qwen3 8B | 5.2 GB | 40K listed context | [Qwen3 tags](https://ollama.com/library/qwen3/tags) |
| Qwen3 14B | 9.3 GB | stronger desktop tier | [Qwen3 tags](https://ollama.com/library/qwen3/tags) |
| Gemma 3 4B | 3.3 GB | vision, 128K listed context | [Gemma 3 library](https://ollama.com/library/gemma3) |
| Gemma 3 12B | 8.1 GB | vision, 128K listed context | [Gemma 3 library](https://ollama.com/library/gemma3) |
| Gemma 3 27B | 17 GB | high-end desktop/workstation | [Gemma 3 library](https://ollama.com/library/gemma3) |

Artifact size is not total runtime memory. Ollama states that RAM requirements grow with parallel requests multiplied by context length, and that larger context increases memory use. Its current automatic defaults are 4K context below 24 GiB VRAM, 32K at 24–48 GiB, and 256K at 48 GiB or more. Sources: [Ollama concurrency/memory FAQ](https://docs.ollama.com/faq), [Ollama context length](https://docs.ollama.com/context-length).

**Inference:** reasonable product tiers are:

- 8 GB system RAM / integrated graphics: only very small models, likely slow;
- 16 GB RAM: a 4B quantized model is the conservative practical target;
- 16–32 GB RAM or 8+ GB useful VRAM: an 8B model is a better tutor target;
- 32+ GB RAM or substantial VRAM: 14B and above become plausible, with speed depending heavily on offload and context.

These are deployment heuristics, not official Ollama guarantees. The app should probe the runtime and allow the user to benchmark, rather than promising a fixed speed.

### B2. Browser-to-localhost integration friction

A deployed web page cannot install or start Ollama. The user must install it, pull a model, and keep the local daemon running. The web app must provide setup and diagnosis UI.

Ollama binds to `127.0.0.1:11434` by default. Additional browser origins require `OLLAMA_ORIGINS`. It should remain loopback-only; exposing `OLLAMA_HOST=0.0.0.0` creates a network service without local API authentication. [Ollama FAQ: host, origins, and exposure](https://docs.ollama.com/faq)

Modern browsers also gate requests from a public website to localhost/local networks. Chrome launched a Local Network Access permission prompt, and MDN documents `fetch()`/WebSocket restrictions and secure-context permission requirements. Sources: [Chrome Local Network Access](https://developer.chrome.com/blog/local-network-access), [MDN Local network access](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Local_network_access).

Therefore the integration flow must:

1. run the website over HTTPS;
2. explain and trigger the loopback/local-network permission from a user gesture;
3. use an exact production-origin allowlist in Ollama configuration;
4. show distinct states for permission denied, Ollama absent, model absent, model loading, and runtime overload;
5. never silently fall back to fake or random “AI” output.

### B3. llama.cpp as a lower-level alternative

`llama.cpp` is an MIT-licensed local C/C++ inference runtime with CPU/GPU hybrid execution, multiple quantization levels, and an OpenAI-compatible `llama-server`. It is more configurable but less user-friendly to install and operate than Ollama. [llama.cpp official repository](https://github.com/ggml-org/llama.cpp), [server documentation](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)

**Recommendation:** use Ollama as the first supported desktop connector. Keep a provider interface that can later support `llama-server`; do not build two local-runtime integrations initially.

## Local audio feasibility

### Speech-to-text

Transformers.js officially demonstrates Whisper ASR on WebGPU using `onnx-community/whisper-tiny.en`. [Transformers.js WebGPU ASR example](https://huggingface.co/docs/transformers.js/guides/webgpu)

The Whisper tiny ONNX repository contains multiple precision variants; the entire `onnx` folder is 1.41 GB because it contains all alternatives, not because a browser must download all of them. Examples include a 59.6 MB fp16 merged decoder and a 16.5 MB fp16 encoder, or smaller int8 components. [Whisper tiny ONNX files](https://huggingface.co/onnx-community/whisper-tiny.en/tree/main/onnx)

Constraints:

- WebGPU gives the best browser experience; WASM is broadly available but can be slow and CPU-intensive for continuous transcription.
- Audio decoding/resampling and inference should run off the React main thread.
- Tiny models trade accuracy for download size and speed; accented speech, noise, and long recordings will increase errors. **Inference.**
- The English-only `.en` checkpoint is appropriate for IELTS answers in English; multilingual interaction needs a multilingual Whisper checkpoint and another size/accuracy test. **Inference.**

The Web Speech API now has a `processLocally` option plus on-device language-pack installation, but MDN marks it experimental. If `processLocally` is false, the browser may choose remote processing, which violates a strict local-only promise. Sources: [MDN `processLocally`](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/processLocally), [MDN local language-pack installation](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/install_static).

**Recommendation:** use explicit local Whisper/Transformers.js for a reliable privacy contract; use `SpeechRecognition.processLocally` only as an optional capability-detected accelerator.

### Text-to-speech

The lowest-cost, broadest fallback is the Web Speech `speechSynthesis` API. Available voices are device-dependent; `getVoices()` returns the voices installed/available on the current device. [MDN `speechSynthesis.getVoices()`](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices)

Neural browser TTS is technically possible. Hugging Face publishes a React/Vite/WebGPU OuteTTS example. The q4f16 ONNX file is 489 MB, but that model is licensed **CC-BY-NC-4.0**, so it is not suitable for a commercial product without separate permission. Sources: [official TTS WebGPU example](https://github.com/huggingface/transformers.js-examples/tree/main/text-to-speech-webgpu), [OuteTTS ONNX sizes and license](https://huggingface.co/onnx-community/OuteTTS-0.2-500M/tree/main/onnx).

**Recommendation:** use device speech synthesis first. Add a neural TTS pack only after confirming target-language voice quality, hardware performance, and a commercially acceptable model license.

### Pronunciation assessment is a separate problem

Whisper ASR produces a transcript. It does not, by itself, expose validated IELTS pronunciation subscores. **Inference:** a credible pronunciation system needs at least phoneme/word alignment, timing, pauses, stress/intonation/prosody features, and calibration against rated learner speech. An LLM can explain transcript-level grammar and vocabulary, but the product must label pronunciation as “not assessed” until a separate acoustic evaluator is validated.

## Privacy and security

### Local privacy boundary

WebLLM/Transformers.js browser inference can keep prompt/audio inference on the device. Ollama states that it does not see prompts or data when models run locally; its cloud features can be disabled with `OLLAMA_NO_CLOUD=1`. [Ollama privacy and local-only mode](https://docs.ollama.com/faq)

However, “local model” does not automatically mean “the whole app is offline/private.” **Inference:** Supabase writes, analytics, crash reports, remote fonts, model downloads, and any web fetch can still transmit metadata or content. The app needs a network/data-flow inventory and a visible Local-only mode that disables nonessential egress.

### Required hardening

- Keep Ollama on loopback; never instruct normal users to expose port 11434 to LAN/Internet.
- Configure only the exact production and local-development origins, never wildcard `OLLAMA_ORIGINS` in production.
- Treat Local Network Access denial as a normal state and explain it; do not bypass browser protections.
- Run generation in constrained workers and terminate/reload a worker on memory or model errors.
- Pin model revision, tokenizer, runtime, and license in a checked-in model manifest.
- Prefer self-hosted/pinned artifacts where bandwidth permits. If artifacts are remote, enforce a strict `connect-src` Content Security Policy and verify integrity.
- WebLLM supports optional SRI hashes for model config, WASM, and tokenizer artifacts; enable failure-on-mismatch. [WebLLM integrity verification](https://github.com/mlc-ai/web-llm#integrity-verification)
- Store chat history/memory locally by default, provide delete/export controls, and never put raw microphone audio into Supabase without separate consent.
- Do not allow model output to directly execute navigation, SQL, filesystem, or account actions. Validate every tool request against a small allowlist and deterministic schema. **Inference.**

## Licensing

Runtime license and model license are separate:

- WebLLM is Apache-2.0. [WebLLM license](https://github.com/mlc-ai/web-llm/blob/main/LICENSE)
- Transformers.js is Apache-2.0. [Transformers.js license](https://github.com/huggingface/transformers.js/blob/main/LICENSE)
- Ollama is MIT. [Ollama license](https://github.com/ollama/ollama/blob/main/LICENSE)
- llama.cpp is MIT. [llama.cpp license](https://github.com/ggml-org/llama.cpp/blob/master/LICENSE)
- Qwen3's official 4B model card lists Apache-2.0. [Qwen3-4B model card](https://huggingface.co/Qwen/Qwen3-4B)
- Whisper's code and weights repository uses MIT. [Whisper license](https://github.com/openai/whisper/blob/main/LICENSE)
- A Transformers.js-compatible model can still forbid commercial use; OuteTTS-0.2-500M is a concrete CC-BY-NC-4.0 example. [OuteTTS model card](https://huggingface.co/onnx-community/OuteTTS-0.2-500M)

Every downloadable model must therefore have its own legal review, attribution/notice handling, model version, source URL, hash, and redistribution decision. A permissively licensed runtime does not grant rights to arbitrary weights.

## Realistic capability gap versus a frontier hosted assistant

| Tier | What it can realistically do | What it should not promise |
|---|---|---|
| Browser 0.6–1B | short constrained chat, vocabulary drills, simple rewriting, intent classification | nuanced tutoring, robust reasoning, reliable IELTS scoring |
| Browser 3B | better explanations and structured exercises on compatible desktop browsers | consistent expert-level evaluation, broad mobile support, long agentic workflows |
| Browser 8B | useful local general chat on high-memory WebGPU devices | universal availability; the example requires a 4.53 GB artifact and ~5 GB declared VRAM at 4K context |
| Ollama 4B | practical baseline tutor on a 16 GB-class desktop | frontier reliability and high-stakes grading |
| Ollama 8B–14B | best practical no-key mode for explanation, correction, planning, and local RAG on capable desktops | matching a frontier assistant across reasoning, factuality, tools, multimodality, and safety |
| Ollama 27B+ | substantially stronger but workstation-class download/memory/latency | “free for everyone”; compute and support costs become the limiting factor |

The Qwen3 model card claims 100+ language/dialect support and documents reasoning/non-reasoning modes, which makes the family a reasonable Vietnamese/English candidate for evaluation. [Qwen3-4B model card](https://huggingface.co/Qwen/Qwen3-4B) This is not evidence that a specific quantized model meets this product's pedagogical or IELTS-quality threshold.

**Inference:** the largest gaps from a frontier hosted assistant will be:

- multi-step reasoning and self-correction consistency;
- factual freshness without a separate approved retrieval source;
- long-context quality and memory under constrained VRAM;
- reliable tool use and recovery from tool errors;
- nuanced bilingual pedagogy;
- calibrated Writing/Speaking scores;
- safety, refusal consistency, and adversarial robustness;
- speed and thermal behavior on mobile/low-end devices.

“Self-learning AI” should mean **user-controlled memory and retrieval**, not autonomous weight updates. Local IndexedDB/OPFS can store learning history, mistakes, preferences, and embeddings; retrieved evidence can be inserted into the prompt. Online self-training inside a browser is too expensive, hard to validate, vulnerable to poisoning, and likely to degrade behavior. **Inference.**

## Recommended product architecture

Create one stable application interface, for example conceptually `LocalAIProvider`, with capability methods for chat, structured generation, embeddings, transcription, and speech. Implement adapters behind it:

1. `OllamaProvider` — preferred high-quality desktop mode; explicit setup and Local Network Access consent.
2. `WebLLMProvider` — browser chat mode for compatible WebGPU devices; worker-based and opt-in model pack.
3. `TransformersProvider` — local Whisper, embeddings, classifiers, and optional tiny browser text generation.
4. `DeterministicLearningProvider` — non-AI rubric/rules/content retrieval fallback; never random or fake AI.

Recommended initial model policy:

- **Desktop:** evaluate Qwen3 8B and 14B quantizations in Ollama against a product-owned Vietnamese/English IELTS test set; select by measured quality/latency, not marketing benchmarks.
- **Browser:** start with a 1–3B WebLLM model only if it passes the same constrained tutoring tests. Offer 8B as an optional high-resource pack, not the default.
- **ASR:** Whisper tiny English as the initial transcript feature, with a visibly stated accuracy limitation.
- **TTS:** browser device voices first.
- **Assessment:** deterministic rubric plus evidence snippets; no official-looking band score unless separately validated against human-rated samples.

The UI should always disclose active engine, model, artifact size, local/remote data status, confidence/limitations, and whether a response is generated or rule-based.

## What a top 0.1% team would insist on

A top team would not start by asking “which free model feels smartest?” It would first define an evidence-based capability contract:

- Which learner outcome must improve?
- Which tasks require generation, retrieval, acoustic analysis, or deterministic rules?
- What quality threshold and failure rate are acceptable per task?
- What exact hardware/browser population must be supported?
- What is the allowed first-run download and response latency?
- Which outputs are advice versus measurements?
- How will every model/version be regression-tested before release?

It would then ship a small local vertical slice, measure it on real target hardware and human-rated IELTS examples, and keep an honest unsupported state. It would not label stochastic output “self-aware,” would not hide downloads, and would not manufacture scores where the available model has no valid measurement basis.

## Blocking questions for the user

Answers to these are needed before a 95%-confidence implementation specification is possible:

1. Must AI work on **phones/tablets**, or is desktop/laptop the primary requirement?
2. What is the minimum supported hardware: OS, RAM, GPU model/VRAM, and browser?
3. May users install and run **Ollama** locally, or must the feature be zero-install browser-only?
4. Is a first-run download of approximately **0.7 GB, 2 GB, or 5+ GB** acceptable, and should users choose the tier?
5. Is the web product commercial, monetized, or planned for commercial use? This determines which model licenses are acceptable.
6. Does “offline” mean after one initial model download, or must installation also work without Internet?
7. Which capabilities are mandatory in the first slice: tutor chat, Writing feedback, Speaking transcript, pronunciation assessment, exercise generation, memory/RAG, or agent/tool actions?
8. Is the AI private and separate on each learner's device, or must many users share one centrally hosted AI? A shared runtime is not zero-cost.
9. For Speaking, is transcript-based coaching sufficient, or is a defensible pronunciation/IELTS band score mandatory?
10. What response latency is acceptable on target hardware: under 2 seconds, under 10 seconds, or slower?
11. May the system show “AI unavailable on this device” instead of returning a lower-quality or fabricated fallback?
12. Should learning memory remain local only, or may selected summaries sync to Supabase with explicit consent?
13. May the app fetch model weights from Hugging Face/MLC on first use, or must all artifacts be hosted under the product's own domain?
14. Which Vietnamese/English evaluation set and human raters will define “good enough” for tutor feedback and IELTS-related claims?

Until these questions are answered, the technically safest default is: **Ollama desktop mode + small browser fallback + local Whisper transcription + system TTS + no claimed pronunciation band + explicit capability/download/privacy disclosure.**
