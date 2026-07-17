import {
  LOCAL_AI_READINESS_CHECKLIST,
  type LocalAIReadinessItem,
  type LocalAIReadinessStatus,
} from './localAiReadinessChecklist.ts';

export interface LocalAIReadinessSummary {
  readonly total: number;
  readonly completed: number;
  readonly pendingPhase4: number;
  readonly blocked: number;
  readonly informational: number;
}

export interface LocalAIReadinessGroup {
  readonly status: LocalAIReadinessStatus;
  readonly label: string;
  readonly description: string;
  readonly items: readonly LocalAIReadinessItem[];
}

export interface LocalAIReadinessViewModel {
  readonly heading: string;
  readonly description: string;
  readonly currentStatusLabel: string;
  readonly currentStatusDescription: string;
  readonly phase3Description: string;
  readonly phase4Description: string;
  readonly preferredTierNote: string;
  readonly summary: LocalAIReadinessSummary;
  readonly groups: readonly LocalAIReadinessGroup[];
}

const groupCopy: Record<LocalAIReadinessStatus, { label: string; description: string }> = {
  completed: {
    label: 'Completed in Phase 3',
    description: 'Foundation contracts and safety controls already present in the platform.',
  },
  'pending-phase-4': {
    label: 'Pending for Phase 4',
    description: 'Implementation work intentionally deferred to local model integration.',
  },
  blocked: {
    label: 'Blocked until readiness passes',
    description: 'Behavior that must remain unavailable until model and runtime evidence is valid.',
  },
  informational: {
    label: 'Important boundaries',
    description: 'Context that prevents preferences and shell readiness from being mistaken for model readiness.',
  },
};

const groupOrder: readonly LocalAIReadinessStatus[] = [
  'completed',
  'pending-phase-4',
  'blocked',
  'informational',
];

export function buildLocalAIReadinessViewModel(
  checklist: readonly LocalAIReadinessItem[] = LOCAL_AI_READINESS_CHECKLIST,
): LocalAIReadinessViewModel {
  const count = (status: LocalAIReadinessStatus) => (
    checklist.filter((item) => item.status === status).length
  );

  return {
    heading: 'Local AI Readiness',
    description: 'Phase 3 closeout for the platform shell, consent, privacy, audit, registry, and safety foundations.',
    currentStatusLabel: 'Foundation ready for Phase 4 work',
    currentStatusDescription:
      'No approved local model is configured and a generated-content runtime is not connected.',
    phase3Description:
      'Phase 3 prepared unavailable-safe coach shells, learner consent, local preferences, metadata auditing, and regression protection.',
    phase4Description:
      'Phase 4 must select and approve a local model, connect a runtime, and pass readiness checks before generated coach content is exposed.',
    preferredTierNote:
      'The preferred tier in AI Settings is a preparation preference only. It does not confirm model or runtime availability.',
    summary: {
      total: checklist.length,
      completed: count('completed'),
      pendingPhase4: count('pending-phase-4'),
      blocked: count('blocked'),
      informational: count('informational'),
    },
    groups: groupOrder.map((status) => ({
      status,
      label: groupCopy[status].label,
      description: groupCopy[status].description,
      items: checklist.filter((item) => item.status === status),
    })),
  };
}
