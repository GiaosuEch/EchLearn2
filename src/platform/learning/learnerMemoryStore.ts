import type {
  LearnerMemoryExport,
  LearnerMemoryRecord,
  LearnerMemorySnapshot,
  LearnerMemorySnapshotInput,
} from './learnerMemoryTypes.ts';

export interface LearnerMemoryStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const LEARNER_MEMORY_STORAGE_KEY = 'echlern_learner_memory_v1';
const LEARNER_MEMORY_SOURCE = 'learner-memory-shell';

function defaultRecord(): LearnerMemoryRecord {
  return { consent: false, snapshot: null };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isSnapshotShape(value: unknown): value is LearnerMemorySnapshot {
  if (typeof value !== 'object' || value === null) return false;
  const snapshot = value as Record<string, unknown>;
  return (
    typeof snapshot.updatedAt === 'string'
    && typeof snapshot.source === 'string'
    && isStringArray(snapshot.weakSkills)
    && isStringArray(snapshot.preferredExerciseTypes)
  );
}

function isRecordShape(value: unknown): value is LearnerMemoryRecord {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  if (typeof record.consent !== 'boolean') return false;
  return record.snapshot === null || isSnapshotShape(record.snapshot);
}

export function createInMemoryStorageAdapter(): LearnerMemoryStorageAdapter {
  const store = new Map<string, string>();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

export function getSafeLocalStorageAdapter(): LearnerMemoryStorageAdapter | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const storage = window.localStorage;
    if (!storage) return undefined;
    return storage;
  } catch {
    return undefined;
  }
}

export function readLearnerMemoryRecord(
  storage: LearnerMemoryStorageAdapter,
): LearnerMemoryRecord {
  try {
    const raw = storage.getItem(LEARNER_MEMORY_STORAGE_KEY);
    if (!raw) return defaultRecord();
    const parsed = JSON.parse(raw);
    return isRecordShape(parsed) ? parsed : defaultRecord();
  } catch {
    return defaultRecord();
  }
}

function writeLearnerMemoryRecord(
  storage: LearnerMemoryStorageAdapter,
  record: LearnerMemoryRecord,
): void {
  try {
    storage.setItem(LEARNER_MEMORY_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage write failures (quota, disabled storage) must not crash the app.
  }
}

export function enableLearnerMemory(
  storage: LearnerMemoryStorageAdapter,
  input: LearnerMemorySnapshotInput,
): LearnerMemoryRecord {
  const snapshot: LearnerMemorySnapshot = {
    targetLanguage: input.targetLanguage,
    nativeLanguage: input.nativeLanguage,
    skillFocus: input.skillFocus,
    difficultyPreference: input.difficultyPreference,
    recentPracticeSummary: input.recentPracticeSummary,
    weakSkills: input.weakSkills ?? [],
    preferredExerciseTypes: input.preferredExerciseTypes ?? [],
    updatedAt: new Date().toISOString(),
    source: LEARNER_MEMORY_SOURCE,
  };
  const record: LearnerMemoryRecord = { consent: true, snapshot };
  writeLearnerMemoryRecord(storage, record);
  return record;
}

export function disableLearnerMemory(
  storage: LearnerMemoryStorageAdapter,
): LearnerMemoryRecord {
  const current = readLearnerMemoryRecord(storage);
  const record: LearnerMemoryRecord = { consent: false, snapshot: current.snapshot };
  writeLearnerMemoryRecord(storage, record);
  return record;
}

export function deleteLearnerMemory(
  storage: LearnerMemoryStorageAdapter,
): LearnerMemoryRecord {
  try {
    storage.removeItem(LEARNER_MEMORY_STORAGE_KEY);
  } catch {
    // Removal failures must not crash the app.
  }
  return defaultRecord();
}

export function exportLearnerMemory(
  storage: LearnerMemoryStorageAdapter,
): LearnerMemoryExport {
  const record = readLearnerMemoryRecord(storage);
  return {
    consent: record.consent,
    snapshot: record.snapshot,
    exportedAt: new Date().toISOString(),
  };
}
