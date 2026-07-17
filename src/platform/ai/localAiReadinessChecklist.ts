export type LocalAIReadinessStatus =
  | 'completed'
  | 'pending-phase-4'
  | 'blocked'
  | 'informational';

export interface LocalAIReadinessItem {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly status: LocalAIReadinessStatus;
  readonly evidencePaths: readonly string[];
}

export const LOCAL_AI_READINESS_CHECKLIST: readonly LocalAIReadinessItem[] = [
  {
    id: 'ai-service-boundary',
    label: 'AI service boundary',
    description: 'Generic request, response, provenance, limitation, and safety contracts are in place.',
    status: 'completed',
    evidencePaths: [
      'src/platform/ai/aiServiceTypes.ts',
      'src/platform/ai/aiService.ts',
    ],
  },
  {
    id: 'runtime-provider-boundary',
    label: 'Runtime provider boundary',
    description: 'Runtime provider contracts and selection foundations are isolated from coach shells.',
    status: 'completed',
    evidencePaths: [
      'src/platform/ai/runtimeProvider.ts',
      'src/platform/ai/runtimeProviderTypes.ts',
      'src/platform/ai/runtimeProviderSelection.ts',
    ],
  },
  {
    id: 'model-artifact-foundation',
    label: 'Model artifact foundation',
    description: 'Artifact manifests, integrity checks, approval rules, and local storage states are defined.',
    status: 'completed',
    evidencePaths: [
      'src/platform/ai/modelArtifactManager.ts',
      'src/platform/ai/modelArtifactManifest.ts',
      'src/platform/ai/modelArtifactIntegrity.ts',
    ],
  },
  {
    id: 'feature-registry',
    label: 'AI feature registry',
    description: 'AI-facing features have centralized routes, model requirements, consent support, and safety notes.',
    status: 'completed',
    evidencePaths: [
      'src/platform/ai/aiFeatureRegistry.ts',
      'src/platform/ai/aiFeatureRegistryViewModel.ts',
    ],
  },
  {
    id: 'request-audit-log',
    label: 'Metadata request audit',
    description: 'The local audit foundation stores bounded, metadata-only history and removes unknown content fields.',
    status: 'completed',
    evidencePaths: [
      'src/platform/ai/aiRequestAuditTypes.ts',
      'src/platform/ai/aiRequestAuditStore.ts',
      'src/platform/ai/aiRequestAuditViewModel.ts',
    ],
  },
  {
    id: 'settings-privacy',
    label: 'Settings and privacy shell',
    description: 'Local preferences, consent awareness, and metadata controls are available without claiming readiness.',
    status: 'completed',
    evidencePaths: [
      'src/platform/ai/aiSettingsTypes.ts',
      'src/platform/ai/aiSettingsStore.ts',
      'src/platform/ai/aiSettingsViewModel.ts',
    ],
  },
  {
    id: 'learner-memory-consent',
    label: 'Learner Memory consent',
    description: 'Learner Memory remains consent-gated and is the single source of truth for its consent state.',
    status: 'completed',
    evidencePaths: [
      'src/platform/learning/learnerMemoryStore.ts',
      'src/platform/learning/learnerMemoryViewModel.ts',
    ],
  },
  {
    id: 'safety-regression-verifier',
    label: 'AI safety regression verifier',
    description: 'Scoped regression checks protect runtime copy, audit metadata, registry contracts, and shell output gates.',
    status: 'completed',
    evidencePaths: [
      'scripts/verify_ai_safety_regression.cjs',
      'test/platform/aiSafetyRegression.test.ts',
    ],
  },
  {
    id: 'unavailable-safe-shells',
    label: 'Unavailable-safe coach shells',
    description: 'Coach shells expose generated content only after a successful, provenance-backed response.',
    status: 'completed',
    evidencePaths: [
      'src/components/ai/AITutorShell.tsx',
      'src/components/ai/PracticeGeneratorShell.tsx',
      'src/components/ai/WritingCoachShell.tsx',
      'src/components/ai/SpeakingCoachShell.tsx',
    ],
  },
  {
    id: 'remote-dependency-free',
    label: 'Local-first dependency boundary',
    description: 'The Phase 3 foundation does not require a remote service to display shells, settings, consent, or metadata history.',
    status: 'completed',
    evidencePaths: [
      'src/platform/ai/aiService.ts',
      'src/platform/ai/aiSettingsStore.ts',
      'src/platform/ai/aiRequestAuditStore.ts',
    ],
  },
  {
    id: 'honest-output-contract',
    label: 'Honest generated-content contract',
    description: 'Unavailable and failed states remain content-free, and no score or recommendation is manufactured by the platform shell layer.',
    status: 'completed',
    evidencePaths: [
      'src/platform/ai/aiServiceTypes.ts',
      'scripts/verify_ai_safety_regression.cjs',
    ],
  },
  {
    id: 'approved-local-model',
    label: 'Approved local model',
    description: 'No approved local model is configured. Selection, approval, installation, and integrity validation remain Phase 4 work.',
    status: 'pending-phase-4',
    evidencePaths: [
      'src/platform/ai/localModelApprovalTypes.ts',
      'src/platform/ai/localModelApprovalRegistry.ts',
      'src/platform/ai/localModelApprovalViewModel.ts',
      'src/platform/ai/modelArtifactManifest.ts',
      'src/platform/ai/modelArtifactManager.ts',
      'docs/ai/phase-4-model-approval-checklist.md',
    ],
  },
  {
    id: 'runtime-integration',
    label: 'Generated-content runtime integration',
    description: 'A generated-content runtime is not connected. Phase 4 must integrate and verify it before coach generation is enabled.',
    status: 'pending-phase-4',
    evidencePaths: [
      'src/platform/ai/localRuntimeAdapter.ts',
      'src/platform/ai/localRuntimeState.ts',
      'src/platform/ai/runtimeProvider.ts',
    ],
  },
  {
    id: 'generated-output-gate',
    label: 'Generated content remains blocked',
    description: 'Generated coach content remains blocked until Phase 4 supplies an approved model and a verified runtime response with provenance.',
    status: 'blocked',
    evidencePaths: [
      'src/platform/ai/aiService.ts',
      'src/components/ai/AITutorShell.tsx',
      'src/components/ai/PracticeGeneratorShell.tsx',
      'src/components/ai/WritingCoachShell.tsx',
      'src/components/ai/SpeakingCoachShell.tsx',
    ],
  },
  {
    id: 'phase-boundary',
    label: 'Phase boundary',
    description: 'Phase 3 closes the shell, safety, consent, settings, registry, and audit foundations. Phase 4 owns local model integration.',
    status: 'informational',
    evidencePaths: [
      'src/platform/ai/aiFeatureRegistry.ts',
      'src/platform/ai/aiSettingsViewModel.ts',
    ],
  },
  {
    id: 'preferred-tier',
    label: 'Preferred tier remains a preference',
    description: 'The selected tier prepares a future choice only and does not confirm model or runtime availability.',
    status: 'informational',
    evidencePaths: [
      'src/platform/ai/aiSettingsTypes.ts',
      'src/platform/ai/aiSettingsViewModel.ts',
    ],
  },
] as const;
