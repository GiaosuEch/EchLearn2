export type AIFeatureId =
  | 'ai-tutor'
  | 'practice-generator'
  | 'learner-memory'
  | 'writing-coach'
  | 'speaking-coach';

export type AIFeatureCategory = 'coaching' | 'practice' | 'memory';

export type AIFeatureStatus = 'shell-ready' | 'available-without-model';

export interface AIFeatureDefinition {
  readonly id: AIFeatureId;
  readonly label: string;
  readonly description: string;
  readonly route: `/app/${string}`;
  readonly category: AIFeatureCategory;
  readonly requiresLocalModel: boolean;
  readonly supportsLearnerMemory: boolean;
  readonly requiresLearnerMemoryConsent: boolean;
  readonly status: AIFeatureStatus;
  readonly safetyNote: string;
}

const localGenerationSafetyNote =
  'Generated output appears only after a valid local AI response; otherwise the shell remains unavailable-safe.';

export const AI_FEATURE_REGISTRY: readonly AIFeatureDefinition[] = [
  {
    id: 'ai-tutor',
    label: 'AI Tutor',
    description: 'Open a general language-learning tutor shell and check local generation availability.',
    route: '/app/ai-tutor',
    category: 'coaching',
    requiresLocalModel: true,
    supportsLearnerMemory: true,
    requiresLearnerMemoryConsent: true,
    status: 'shell-ready',
    safetyNote: localGenerationSafetyNote,
  },
  {
    id: 'practice-generator',
    label: 'Practice Generator',
    description: 'Configure a generic learning activity and check local generation availability.',
    route: '/app/practice-generator',
    category: 'practice',
    requiresLocalModel: true,
    supportsLearnerMemory: true,
    requiresLearnerMemoryConsent: true,
    status: 'shell-ready',
    safetyNote: localGenerationSafetyNote,
  },
  {
    id: 'learner-memory',
    label: 'Learner Memory',
    description: 'Manage local, consent-gated learner context stored on this device.',
    route: '/app/learner-memory',
    category: 'memory',
    requiresLocalModel: false,
    supportsLearnerMemory: false,
    requiresLearnerMemoryConsent: true,
    status: 'available-without-model',
    safetyNote: 'This feature manages consent and local learner context. It does not generate coaching output.',
  },
  {
    id: 'writing-coach',
    label: 'Writing Coach',
    description: 'Request generic writing feedback when an approved local model and runtime are ready.',
    route: '/app/ai-writing',
    category: 'coaching',
    requiresLocalModel: true,
    supportsLearnerMemory: true,
    requiresLearnerMemoryConsent: true,
    status: 'shell-ready',
    safetyNote: localGenerationSafetyNote,
  },
  {
    id: 'speaking-coach',
    label: 'Speaking Coach',
    description: 'Request transcript-based speaking feedback when local generation is available.',
    route: '/app/ai-speaking',
    category: 'coaching',
    requiresLocalModel: true,
    supportsLearnerMemory: true,
    requiresLearnerMemoryConsent: true,
    status: 'shell-ready',
    safetyNote: localGenerationSafetyNote,
  },
] as const;

export function getAIFeatureById(id: AIFeatureId): AIFeatureDefinition | undefined {
  return AI_FEATURE_REGISTRY.find((feature) => feature.id === id);
}
