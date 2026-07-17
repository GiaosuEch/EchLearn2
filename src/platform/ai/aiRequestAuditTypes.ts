import type { AIFeatureId } from './aiFeatureRegistry.ts';

export type AIRequestAuditActionType =
  | 'conversation'
  | 'explain'
  | 'feedback'
  | 'generate-practice'
  | 'summarize'
  | 'classify'
  | 'assess'
  | 'plan-study'
  | 'recommend-next-practice'
  | 'manage-learner-memory';

export type AIRequestAuditStatus =
  | 'unavailable'
  | 'blocked'
  | 'failed'
  | 'completed-without-output'
  | 'completed';

export type AIRequestAuditSafetyFlag =
  | 'no-raw-content-stored'
  | 'learner-memory-context-used'
  | 'learner-memory-context-not-used'
  | 'learner-memory-consent-disabled'
  | 'runtime-not-ready'
  | 'model-not-installed'
  | 'request-validation-failed'
  | 'response-not-generated'
  | 'safety-blocked';

export interface AIRequestAuditEntry {
  readonly id: string;
  readonly featureId: AIFeatureId;
  readonly actionType: AIRequestAuditActionType;
  readonly source: `/app/${string}`;
  readonly status: AIRequestAuditStatus;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly durationMs?: number;
  readonly requiresLocalModel: boolean;
  readonly learnerMemoryContextUsed: boolean;
  readonly learnerMemoryConsentAtRequest: boolean;
  readonly errorCode?: string;
  readonly safetyFlags: readonly AIRequestAuditSafetyFlag[];
}

export interface AIRequestAuditRecordInput {
  readonly featureId: AIFeatureId;
  readonly actionType: AIRequestAuditActionType;
  readonly status: AIRequestAuditStatus;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly durationMs?: number;
  readonly learnerMemoryContextUsed: boolean;
  readonly learnerMemoryConsentAtRequest: boolean;
  readonly errorCode?: string;
  readonly safetyFlags?: readonly AIRequestAuditSafetyFlag[];
}
