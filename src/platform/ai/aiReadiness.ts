import {
  type AICapabilityReport,
  type AIUnavailableReason,
  type AITier,
} from './aiCapabilityDetector.ts';

export type LocalModelTier = Extract<AITier, 'light-local' | 'standard-local' | 'pro-local'>;

export interface LocalModelDescriptor {
  modelId: string;
  tier: LocalModelTier;
  installed: boolean;
}

export type ModelReadinessState =
  | {
      status: 'not-installed';
      reason: 'model-not-installed';
      modelId?: string;
      requiredTier?: LocalModelTier;
    }
  | {
      status: 'unavailable';
      reason: AIUnavailableReason;
      modelId?: string;
      requiredTier?: LocalModelTier;
    }
  | {
      status: 'ready';
      modelId: string;
      tier: LocalModelTier;
    };

const tierRank: Record<AITier, number> = {
  unavailable: -1,
  basic: 0,
  'light-local': 1,
  'standard-local': 2,
  'pro-local': 3,
};

export function evaluateAIReadiness(
  report: AICapabilityReport,
  model?: LocalModelDescriptor,
): ModelReadinessState {
  if (report.tier === 'unavailable') {
    return {
      status: 'unavailable',
      reason: report.limitations[0] ?? 'runtime-not-installed',
      modelId: model?.modelId,
      requiredTier: model?.tier,
    };
  }

  if (!model || !model.installed) {
    return {
      status: 'not-installed',
      reason: 'model-not-installed',
      modelId: model?.modelId,
      requiredTier: model?.tier,
    };
  }

  if (!model.modelId.trim()) {
    return {
      status: 'unavailable',
      reason: 'runtime-not-installed',
      requiredTier: model.tier,
    };
  }

  if (tierRank[report.tier] < tierRank[model.tier]) {
    return {
      status: 'unavailable',
      reason: 'insufficient-capability',
      modelId: model.modelId,
      requiredTier: model.tier,
    };
  }

  return {
    status: 'ready',
    modelId: model.modelId,
    tier: model.tier,
  };
}