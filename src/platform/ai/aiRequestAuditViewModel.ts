import { getAIFeatureById } from './aiFeatureRegistry.ts';
import type {
  AIRequestAuditEntry,
  AIRequestAuditStatus,
} from './aiRequestAuditTypes.ts';

export interface AIRequestAuditEntryViewModel {
  id: string;
  featureLabel: string;
  actionLabel: string;
  source: `/app/${string}`;
  statusLabel: string;
  startedAt: string;
  completedAt?: string;
  durationLabel: string;
  modelRequirementLabel: string;
  learnerMemoryLabel: string;
  errorCode?: string;
  safetyFlags: readonly string[];
}

export interface AIRequestAuditViewModel {
  heading: string;
  description: string;
  privacyNotice: string;
  emptyMessage: string;
  entries: AIRequestAuditEntryViewModel[];
}

const statusLabels: Record<AIRequestAuditStatus, string> = {
  unavailable: 'Unavailable',
  blocked: 'Blocked',
  failed: 'Failed',
  'completed-without-output': 'Completed without output',
  completed: 'Completed',
};

function learnerMemoryLabel(entry: AIRequestAuditEntry): string {
  if (entry.learnerMemoryContextUsed) return 'Consent enabled; context metadata marked used';
  if (entry.learnerMemoryConsentAtRequest) return 'Consent enabled; context not used';
  return 'Consent disabled; context not used';
}

export function buildAIRequestAuditViewModel(
  entries: readonly AIRequestAuditEntry[],
): AIRequestAuditViewModel {
  const newestFirst = [...entries].sort((left, right) => {
    const timestampDifference = Date.parse(right.startedAt) - Date.parse(left.startedAt);
    return timestampDifference !== 0 ? timestampDifference : right.id.localeCompare(left.id);
  });

  return {
    heading: 'AI request audit log',
    description: 'Review local request status and safety metadata for platform AI features.',
    privacyNotice: 'This local history stores metadata only. It does not store learner text or generated text.',
    emptyMessage: 'No audited AI requests have been recorded on this device.',
    entries: newestFirst.map((entry) => ({
      id: entry.id,
      featureLabel: getAIFeatureById(entry.featureId)?.label ?? entry.featureId,
      actionLabel: entry.actionType.replaceAll('-', ' '),
      source: entry.source,
      statusLabel: statusLabels[entry.status],
      startedAt: entry.startedAt,
      completedAt: entry.completedAt,
      durationLabel: entry.durationMs === undefined ? 'Not recorded' : `${entry.durationMs} ms`,
      modelRequirementLabel: entry.requiresLocalModel ? 'Local model required' : 'No local model required',
      learnerMemoryLabel: learnerMemoryLabel(entry),
      errorCode: entry.errorCode,
      safetyFlags: entry.safetyFlags,
    })),
  };
}
