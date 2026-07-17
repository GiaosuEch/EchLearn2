import {
  AI_FEATURE_REGISTRY,
  type AIFeatureDefinition,
} from './aiFeatureRegistry.ts';
import type {
  AISettingsPreferences,
  PreferredLocalAITier,
} from './aiSettingsTypes.ts';
import type { LearnerMemoryRecord } from '../learning/learnerMemoryTypes.ts';

export interface AISettingsSummaryViewModel {
  totalFeatures: number;
  modelRequiredFeatures: number;
  learnerMemorySupportedFeatures: number;
}

export interface AISettingsViewModel {
  heading: string;
  description: string;
  localAIStatusLabel: string;
  localAIStatusDescription: string;
  preferredTierLabel: string;
  preferredTierDescription: string;
  learnerMemoryConsentEnabled: boolean;
  learnerMemoryConsentLabel: string;
  learnerMemoryConsentDescription: string;
  auditPreferenceLabel: string;
  auditPreferenceDescription: string;
  summary: AISettingsSummaryViewModel;
}

const tierLabels: Record<PreferredLocalAITier, string> = {
  auto: 'Automatic preference',
  light: 'Light preference',
  standard: 'Standard preference',
  pro: 'Pro preference',
};

export function buildAISettingsViewModel(
  settings: AISettingsPreferences,
  learnerMemory: LearnerMemoryRecord,
  registry: readonly AIFeatureDefinition[] = AI_FEATURE_REGISTRY,
): AISettingsViewModel {
  const modelRequiredFeatures = registry.filter((feature) => feature.requiresLocalModel).length;
  const learnerMemorySupportedFeatures = registry.filter(
    (feature) => feature.supportsLearnerMemory,
  ).length;

  return {
    heading: 'AI Settings and Privacy',
    description: 'Review local-first preferences and links to consent and metadata controls. This shell does not require a remote service.',
    localAIStatusLabel: 'Local AI readiness not verified',
    localAIStatusDescription:
      'This page does not verify an approved local model or runtime. Coach shells remain unavailable-safe until those foundations are ready.',
    preferredTierLabel: tierLabels[settings.preferredLocalAiTier],
    preferredTierDescription:
      'This tier is a preparation preference only. It does not indicate model readiness or availability.',
    learnerMemoryConsentEnabled: learnerMemory.consent,
    learnerMemoryConsentLabel: learnerMemory.consent ? 'Enabled' : 'Disabled',
    learnerMemoryConsentDescription:
      'Learner Memory remains the source of truth. Manage consent on the Learner Memory page.',
    auditPreferenceLabel: settings.allowMetadataAuditLog
      ? 'Metadata audit preference enabled'
      : 'Metadata audit preference disabled',
    auditPreferenceDescription:
      'Only request metadata may be recorded. This preference does not create request history by itself.',
    summary: {
      totalFeatures: registry.length,
      modelRequiredFeatures,
      learnerMemorySupportedFeatures,
    },
  };
}
