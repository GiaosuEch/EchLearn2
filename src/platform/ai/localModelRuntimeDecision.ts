export type LocalModelRuntimeDecisionStatus = 'proposed';

export type LocalModelRuntimeOptionId =
  | 'mlc-webllm'
  | 'transformers-js'
  | 'llama-cpp-browser'
  | 'keep-unavailable-safe';

export interface LocalModelRuntimeOption {
  readonly id: LocalModelRuntimeOptionId;
  readonly label: string;
  readonly candidatePosition: 'candidate-for-validation' | 'secondary-candidate' | 'defer' | 'fallback';
  readonly strengths: readonly string[];
  readonly risks: readonly string[];
  readonly rollbackFallback: boolean;
}

export interface LocalModelCandidate {
  readonly tier: 'light' | 'standard' | 'pro';
  readonly name: string;
  readonly role: string;
  readonly deviceAssumption: string;
  readonly licenseStatus: 'candidate-needs-review';
  readonly approved: false;
  readonly configured: false;
}

export interface LocalModelRuntimeDecision {
  readonly status: LocalModelRuntimeDecisionStatus;
  readonly implemented: false;
  readonly runtimeApproved: false;
  readonly modelApproved: false;
  readonly recommendedRuntimeId: LocalModelRuntimeOptionId;
  readonly remoteInferencePolicy: 'not-primary';
  readonly runtimeOptions: readonly LocalModelRuntimeOption[];
  readonly modelCandidates: readonly LocalModelCandidate[];
  readonly productFit: {
    readonly browserLocalRationale: string;
    readonly externalAppRationale: string;
  };
  readonly licenseAndArtifactApprovalChecklist: readonly string[];
  readonly phase42EntryCriteria: readonly string[];
  readonly phase43BenchmarkCriteria: readonly string[];
  readonly rollbackPlan: {
    readonly shellBehavior: 'unavailable-safe';
    readonly description: string;
  };
}

export const LOCAL_MODEL_RUNTIME_DECISION: LocalModelRuntimeDecision = {
  status: 'proposed',
  implemented: false,
  runtimeApproved: false,
  modelApproved: false,
  recommendedRuntimeId: 'mlc-webllm',
  remoteInferencePolicy: 'not-primary',
  runtimeOptions: [
    {
      id: 'mlc-webllm',
      label: 'MLC WebLLM browser runtime',
      candidatePosition: 'candidate-for-validation',
      strengths: [
        'Designed for language-model inference inside the browser.',
        'Uses browser GPU acceleration and worker-compatible execution patterns.',
        'Fits the existing local-first web product boundary.',
      ],
      risks: [
        'Requires device capability checks and secure browser context.',
        'Large artifacts can create bandwidth, cache, and storage pressure.',
        'Performance and memory use may vary widely across devices.',
      ],
      rollbackFallback: false,
    },
    {
      id: 'transformers-js',
      label: 'Transformers.js browser runtime',
      candidatePosition: 'secondary-candidate',
      strengths: [
        'Supports browser execution through WASM and browser GPU acceleration.',
        'Has broad task and model-family abstractions.',
      ],
      risks: [
        'General-purpose abstractions may require more adaptation for chat generation.',
        'Browser GPU support and performance remain device-dependent.',
      ],
      rollbackFallback: false,
    },
    {
      id: 'llama-cpp-browser',
      label: 'llama.cpp WASM and browser GPU path',
      candidatePosition: 'defer',
      strengths: [
        'Strong quantized-model ecosystem and portable native foundation.',
        'Potentially useful for future artifact-format flexibility.',
      ],
      risks: [
        'Browser GPU support remains less mature for this product path.',
        'Integration and packaging complexity is higher than the leading candidate.',
      ],
      rollbackFallback: false,
    },
    {
      id: 'keep-unavailable-safe',
      label: 'Keep current unavailable-safe behavior',
      candidatePosition: 'fallback',
      strengths: [
        'Preserves honest behavior on unsupported or weak devices.',
        'Requires no runtime or model changes.',
      ],
      risks: [
        'Generated coach features remain unavailable.',
      ],
      rollbackFallback: true,
    },
  ],
  modelCandidates: [
    {
      tier: 'light',
      name: 'Qwen3-0.6B',
      role: 'Small-device feasibility and fallback-quality candidate.',
      deviceAssumption: 'Lower-memory device tier after measured validation.',
      licenseStatus: 'candidate-needs-review',
      approved: false,
      configured: false,
    },
    {
      tier: 'standard',
      name: 'Qwen3-1.7B',
      role: 'Primary quality and performance benchmark candidate.',
      deviceAssumption: 'Mainstream device tier after memory and latency validation.',
      licenseStatus: 'candidate-needs-review',
      approved: false,
      configured: false,
    },
    {
      tier: 'pro',
      name: 'Qwen3-4B',
      role: 'Higher-quality candidate limited to stronger devices.',
      deviceAssumption: 'High-memory device tier with explicit capability gates.',
      licenseStatus: 'candidate-needs-review',
      approved: false,
      configured: false,
    },
  ],
  productFit: {
    browserLocalRationale:
      'Browser-local execution matches the web product, keeps user content on the device, and avoids a mandatory remote inference service.',
    externalAppRationale:
      'The core web experience must not require users to install or operate a separate external application.',
  },
  licenseAndArtifactApprovalChecklist: [
    'Verify the runtime license and all transitive notices.',
    'Verify the selected model license and redistribution conditions.',
    'Record model provenance, version, quantization, and checksum.',
    'Review tokenizer and auxiliary artifact licenses.',
    'Approve artifact size, storage location, and cache lifecycle.',
    'Confirm no real artifact location is committed before approval.',
    'Document removal and rollback procedures.',
  ],
  phase42EntryCriteria: [
    'Select one runtime candidate for an isolated proof of concept.',
    'Complete runtime and model license review.',
    'Approve an artifact manifest without enabling coach generation.',
    'Define secure-context and browser capability detection.',
    'Define cache quota, eviction, and user-consent behavior.',
    'Define failure mapping back to unavailable-safe shells.',
    'Confirm no coach, consent, or audit contract changes are required.',
    'Approve a benchmark dataset covering all 13 supported languages.',
  ],
  phase43BenchmarkCriteria: [
    'Measure first-load artifact transfer and cache reuse.',
    'Measure initialization time and first-token latency by device tier.',
    'Measure sustained generation speed and peak memory use.',
    'Include weak-device and unsupported-device fallback coverage.',
    'Evaluate instruction following across all 13 languages.',
    'Evaluate hallucination, unsafe output, and refusal behavior.',
    'Evaluate writing and speaking feedback quality without treating output as grading truth.',
    'Compare deterministic benchmark prompts across candidate tiers.',
    'Verify cancellation, tab reload, cache corruption, and storage pressure recovery.',
    'Require unavailable-safe rollback for every failed readiness gate.',
  ],
  rollbackPlan: {
    shellBehavior: 'unavailable-safe',
    description:
      'If runtime, artifact, device, license, or quality validation fails, all coach shells remain unavailable-safe and expose no generated content.',
  },
} as const;
