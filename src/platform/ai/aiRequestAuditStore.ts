import {
  AI_FEATURE_REGISTRY,
  getAIFeatureById,
  type AIFeatureId,
} from './aiFeatureRegistry.ts';
import type {
  AIRequestAuditActionType,
  AIRequestAuditEntry,
  AIRequestAuditRecordInput,
  AIRequestAuditSafetyFlag,
  AIRequestAuditStatus,
} from './aiRequestAuditTypes.ts';

export const AI_REQUEST_AUDIT_STORAGE_KEY = 'language-platform.ai-request-audit.v1';
export const DEFAULT_AI_REQUEST_AUDIT_LIMIT = 50;

const actionTypes = new Set<AIRequestAuditActionType>([
  'conversation',
  'explain',
  'feedback',
  'generate-practice',
  'summarize',
  'classify',
  'assess',
  'plan-study',
  'recommend-next-practice',
  'manage-learner-memory',
]);

const statuses = new Set<AIRequestAuditStatus>([
  'unavailable',
  'blocked',
  'failed',
  'completed-without-output',
  'completed',
]);

const safetyFlags = new Set<AIRequestAuditSafetyFlag>([
  'no-raw-content-stored',
  'learner-memory-context-used',
  'learner-memory-context-not-used',
  'learner-memory-consent-disabled',
  'runtime-not-ready',
  'model-not-installed',
  'request-validation-failed',
  'response-not-generated',
  'safety-blocked',
]);

const featureIds = new Set<AIFeatureId>(AI_FEATURE_REGISTRY.map((feature) => feature.id));

export interface AIRequestAuditStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface AIRequestAuditStoreDependencies {
  storage: AIRequestAuditStorageAdapter;
  maxEntries?: number;
  now?: () => string;
  createId?: () => string;
}

export interface AIRequestAuditStore {
  read(): AIRequestAuditEntry[];
  record(input: AIRequestAuditRecordInput): AIRequestAuditEntry;
  clear(): void;
  exportJSON(): string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 40 && Number.isFinite(Date.parse(value));
}

function normalizeErrorCode(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  return /^[a-z0-9-]{1,80}$/.test(normalized) ? normalized : undefined;
}

function normalizeDuration(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.round(value)
    : undefined;
}

function normalizeSafetyFlags(value: unknown): AIRequestAuditSafetyFlag[] {
  if (!Array.isArray(value)) return ['no-raw-content-stored'];

  const normalized = value.filter(
    (flag): flag is AIRequestAuditSafetyFlag => typeof flag === 'string' && safetyFlags.has(flag as AIRequestAuditSafetyFlag),
  );

  if (!normalized.includes('no-raw-content-stored')) {
    normalized.unshift('no-raw-content-stored');
  }

  return [...new Set(normalized)].slice(0, 12);
}

function normalizeStoredEntry(value: unknown): AIRequestAuditEntry | undefined {
  if (!isObject(value)) return undefined;
  if (typeof value.id !== 'string' || !/^[a-zA-Z0-9-]{1,128}$/.test(value.id)) return undefined;
  if (typeof value.featureId !== 'string' || !featureIds.has(value.featureId as AIFeatureId)) return undefined;
  if (typeof value.actionType !== 'string' || !actionTypes.has(value.actionType as AIRequestAuditActionType)) return undefined;
  if (typeof value.status !== 'string' || !statuses.has(value.status as AIRequestAuditStatus)) return undefined;
  if (!isTimestamp(value.startedAt)) return undefined;
  if (typeof value.learnerMemoryContextUsed !== 'boolean') return undefined;
  if (typeof value.learnerMemoryConsentAtRequest !== 'boolean') return undefined;

  const featureId = value.featureId as AIFeatureId;
  const feature = getAIFeatureById(featureId);
  if (!feature) return undefined;

  return {
    id: value.id,
    featureId,
    actionType: value.actionType as AIRequestAuditActionType,
    source: feature.route,
    status: value.status as AIRequestAuditStatus,
    startedAt: value.startedAt,
    completedAt: isTimestamp(value.completedAt) ? value.completedAt : undefined,
    durationMs: normalizeDuration(value.durationMs),
    requiresLocalModel: feature.requiresLocalModel,
    learnerMemoryContextUsed: value.learnerMemoryContextUsed,
    learnerMemoryConsentAtRequest: value.learnerMemoryConsentAtRequest,
    errorCode: normalizeErrorCode(value.errorCode),
    safetyFlags: normalizeSafetyFlags(value.safetyFlags),
  };
}

function createDefaultIdGenerator(): () => string {
  let counter = 0;

  return () => {
    if (typeof globalThis.crypto?.randomUUID === 'function') {
      return globalThis.crypto.randomUUID();
    }

    counter += 1;
    return `audit-local-${counter}`;
  };
}

function safeRemove(storage: AIRequestAuditStorageAdapter): void {
  try {
    storage.removeItem(AI_REQUEST_AUDIT_STORAGE_KEY);
  } catch {
    // Disabled or unavailable storage must not crash the app.
  }
}

function safeWrite(storage: AIRequestAuditStorageAdapter, entries: readonly AIRequestAuditEntry[]): void {
  try {
    storage.setItem(AI_REQUEST_AUDIT_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Quota or disabled storage must not crash the app.
  }
}

export function createAIRequestAuditStore(
  dependencies: AIRequestAuditStoreDependencies,
): AIRequestAuditStore {
  const maxEntries = Math.max(
    1,
    Math.min(100, Math.floor(dependencies.maxEntries ?? DEFAULT_AI_REQUEST_AUDIT_LIMIT)),
  );
  const now = dependencies.now ?? (() => new Date().toISOString());
  const createId = dependencies.createId ?? createDefaultIdGenerator();

  function read(): AIRequestAuditEntry[] {
    try {
      const raw = dependencies.storage.getItem(AI_REQUEST_AUDIT_STORAGE_KEY);
      if (!raw) return [];

      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        safeRemove(dependencies.storage);
        return [];
      }

      const normalized = parsed
        .map(normalizeStoredEntry)
        .filter((entry): entry is AIRequestAuditEntry => entry !== undefined)
        .slice(-maxEntries);

      if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
        if (normalized.length === 0) safeRemove(dependencies.storage);
        else safeWrite(dependencies.storage, normalized);
      }

      return normalized;
    } catch {
      safeRemove(dependencies.storage);
      return [];
    }
  }

  function record(input: AIRequestAuditRecordInput): AIRequestAuditEntry {
    const feature = getAIFeatureById(input.featureId);
    if (!feature) throw new Error('Unknown AI feature id.');
    if (!actionTypes.has(input.actionType)) throw new Error('Unknown audit action type.');
    if (!statuses.has(input.status)) throw new Error('Unknown audit status.');

    const startedAt = isTimestamp(input.startedAt) ? input.startedAt : now();
    const completedAt = isTimestamp(input.completedAt) ? input.completedAt : undefined;
    const computedDuration = completedAt
      ? Math.max(0, Date.parse(completedAt) - Date.parse(startedAt))
      : undefined;

    const entry: AIRequestAuditEntry = {
      id: createId(),
      featureId: feature.id,
      actionType: input.actionType,
      source: feature.route,
      status: input.status,
      startedAt,
      completedAt,
      durationMs: normalizeDuration(input.durationMs) ?? computedDuration,
      requiresLocalModel: feature.requiresLocalModel,
      learnerMemoryContextUsed: input.learnerMemoryContextUsed === true,
      learnerMemoryConsentAtRequest: input.learnerMemoryConsentAtRequest === true,
      errorCode: normalizeErrorCode(input.errorCode),
      safetyFlags: normalizeSafetyFlags(input.safetyFlags),
    };

    const entries = [...read(), entry].slice(-maxEntries);
    safeWrite(dependencies.storage, entries);
    return entry;
  }

  return {
    read,
    record,
    clear: () => safeRemove(dependencies.storage),
    exportJSON: () => JSON.stringify(read(), null, 2),
  };
}

export function createInMemoryAIRequestAuditStorage(): AIRequestAuditStorageAdapter {
  const values = new Map<string, string>();

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}
