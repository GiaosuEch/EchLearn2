import type {
  AISettingsPreferences,
  AISettingsUpdate,
  PreferredLocalAITier,
} from './aiSettingsTypes.ts';

export const AI_SETTINGS_STORAGE_KEY = 'language-platform.ai-settings.v1';

const preferredTiers = new Set<PreferredLocalAITier>([
  'auto',
  'light',
  'standard',
  'pro',
]);

const DEFAULT_AI_SETTINGS: AISettingsPreferences = {
  preferredLocalAiTier: 'auto',
  showUnavailableAiFeatures: true,
  allowMetadataAuditLog: false,
  updatedAt: null,
};

export interface AISettingsStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface AISettingsStoreDependencies {
  storage: AISettingsStorageAdapter;
  now?: () => string;
}

export interface AISettingsStore {
  read(): AISettingsPreferences;
  update(input: AISettingsUpdate): AISettingsPreferences;
  reset(): AISettingsPreferences;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPreferredTier(value: unknown): value is PreferredLocalAITier {
  return typeof value === 'string' && preferredTiers.has(value as PreferredLocalAITier);
}

function normalizeTimestamp(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== 'string' || value.length > 40) return null;
  return Number.isFinite(Date.parse(value)) ? value : null;
}

function sanitizePreferences(value: unknown): AISettingsPreferences {
  if (!isObject(value)) return { ...DEFAULT_AI_SETTINGS };

  return {
    preferredLocalAiTier: isPreferredTier(value.preferredLocalAiTier)
      ? value.preferredLocalAiTier
      : DEFAULT_AI_SETTINGS.preferredLocalAiTier,
    showUnavailableAiFeatures: typeof value.showUnavailableAiFeatures === 'boolean'
      ? value.showUnavailableAiFeatures
      : DEFAULT_AI_SETTINGS.showUnavailableAiFeatures,
    allowMetadataAuditLog: typeof value.allowMetadataAuditLog === 'boolean'
      ? value.allowMetadataAuditLog
      : DEFAULT_AI_SETTINGS.allowMetadataAuditLog,
    updatedAt: normalizeTimestamp(value.updatedAt),
  };
}

function safeTimestamp(now: () => string): string {
  try {
    return normalizeTimestamp(now()) ?? '1970-01-01T00:00:00.000Z';
  } catch {
    return '1970-01-01T00:00:00.000Z';
  }
}

function writePreferences(
  storage: AISettingsStorageAdapter,
  preferences: AISettingsPreferences,
): void {
  try {
    storage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Storage failures must not crash the settings shell.
  }
}

export function createInMemoryAISettingsStorageAdapter(): AISettingsStorageAdapter {
  const values = new Map<string, string>();
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

export function getSafeAISettingsLocalStorageAdapter(): AISettingsStorageAdapter | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function createAISettingsStore({
  storage,
  now = () => new Date().toISOString(),
}: AISettingsStoreDependencies): AISettingsStore {
  function read(): AISettingsPreferences {
    try {
      const raw = storage.getItem(AI_SETTINGS_STORAGE_KEY);
      if (!raw) return { ...DEFAULT_AI_SETTINGS };

      const parsed: unknown = JSON.parse(raw);
      if (!isObject(parsed)) {
        storage.removeItem(AI_SETTINGS_STORAGE_KEY);
        return { ...DEFAULT_AI_SETTINGS };
      }

      const sanitized = sanitizePreferences(parsed);
      if (JSON.stringify(parsed) !== JSON.stringify(sanitized)) {
        writePreferences(storage, sanitized);
      }
      return sanitized;
    } catch {
      try {
        storage.removeItem(AI_SETTINGS_STORAGE_KEY);
      } catch {
        // Removal failures must not crash the settings shell.
      }
      return { ...DEFAULT_AI_SETTINGS };
    }
  }

  return {
    read,
    update(input) {
      const current = read();
      const next: AISettingsPreferences = {
        preferredLocalAiTier: isPreferredTier(input.preferredLocalAiTier)
          ? input.preferredLocalAiTier
          : current.preferredLocalAiTier,
        showUnavailableAiFeatures: typeof input.showUnavailableAiFeatures === 'boolean'
          ? input.showUnavailableAiFeatures
          : current.showUnavailableAiFeatures,
        allowMetadataAuditLog: typeof input.allowMetadataAuditLog === 'boolean'
          ? input.allowMetadataAuditLog
          : current.allowMetadataAuditLog,
        updatedAt: safeTimestamp(now),
      };
      writePreferences(storage, next);
      return next;
    },
    reset() {
      try {
        storage.removeItem(AI_SETTINGS_STORAGE_KEY);
      } catch {
        // Removal failures must not crash the settings shell.
      }
      return { ...DEFAULT_AI_SETTINGS };
    },
  };
}
