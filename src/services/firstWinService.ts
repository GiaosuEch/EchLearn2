import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/storage/localDatabase';
import { normalizeVocabularyLanguage } from './vocabularyService';

export type FirstWinGoal = 'habit' | 'speaking' | 'ielts';

export interface FirstWinDraft {
  goal: FirstWinGoal;
  targetLanguage: string;
}

export interface FirstWinProgress extends FirstWinDraft {
  id: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface FirstWinCompletion {
  progress: FirstWinProgress;
  didComplete: boolean;
}

const TABLE = 'first_win_progress';
const DRAFT_KEY = 'echlearn_first_win_draft_v1';
const LOCAL_ID_PREFIX = 'first_win_';

function isGoal(value: unknown): value is FirstWinGoal {
  return value === 'habit' || value === 'speaking' || value === 'ielts';
}

function toDb(progress: FirstWinProgress) {
  return {
    user_id: progress.userId,
    target_language: progress.targetLanguage,
    goal: progress.goal,
    started_at: progress.startedAt,
    completed_at: progress.completedAt ?? null,
    updated_at: progress.updatedAt,
  };
}

function fromDb(row: Record<string, unknown>): FirstWinProgress {
  return {
    id: `${LOCAL_ID_PREFIX}${String(row.user_id)}`,
    userId: String(row.user_id),
    targetLanguage: normalizeVocabularyLanguage(row.target_language),
    goal: isGoal(row.goal) ? row.goal : 'habit',
    startedAt: String(row.started_at),
    completedAt: row.completed_at ? String(row.completed_at) : undefined,
    updatedAt: String(row.updated_at),
  };
}

function readLocalProgress(userId: string): FirstWinProgress | null {
  return localDb.getTable<FirstWinProgress>(TABLE).find((record) => record.userId === userId) ?? null;
}

function writeLocalProgress(progress: FirstWinProgress): FirstWinProgress {
  const current = readLocalProgress(progress.userId);
  if (current) {
    localDb.update<FirstWinProgress>(TABLE, current.id, progress);
  } else {
    localDb.insert<FirstWinProgress>(TABLE, progress);
  }
  return progress;
}

async function hasMatchingSession(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.id !== userId) return false;
  return true;
}

export function writeFirstWinDraft(draft: FirstWinDraft): FirstWinDraft {
  const normalized: FirstWinDraft = {
    goal: isGoal(draft.goal) ? draft.goal : 'habit',
    targetLanguage: normalizeVocabularyLanguage(draft.targetLanguage),
  };
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

export function readFirstWinDraft(): FirstWinDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? 'null') as Partial<FirstWinDraft> | null;
    if (!value || !isGoal(value.goal) || typeof value.targetLanguage !== 'string') return null;
    return { goal: value.goal, targetLanguage: normalizeVocabularyLanguage(value.targetLanguage) };
  } catch {
    return null;
  }
}

export function clearFirstWinDraft(): void {
  if (typeof window !== 'undefined') sessionStorage.removeItem(DRAFT_KEY);
}

export async function getFirstWinProgress(userId: string): Promise<FirstWinProgress | null> {
  const local = readLocalProgress(userId);
  if (!(await hasMatchingSession(userId)) || !supabase) return local;

  const { data, error } = await supabase
    .from(TABLE)
    .select('user_id, target_language, goal, started_at, completed_at, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return local;
  const remote = fromDb(data);
  writeLocalProgress(remote);
  return remote;
}

async function persistFirstWinProgress(progress: FirstWinProgress): Promise<FirstWinProgress> {
  writeLocalProgress(progress);
  if (!(await hasMatchingSession(progress.userId)) || !supabase) return progress;

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(toDb(progress), { onConflict: 'user_id' })
    .select('user_id, target_language, goal, started_at, completed_at, updated_at')
    .maybeSingle();

  if (error || !data) return progress;
  const remote = fromDb(data);
  writeLocalProgress(remote);
  return remote;
}

export async function saveFirstWinStart(input: { userId: string; goal: FirstWinGoal; targetLanguage: string }): Promise<FirstWinProgress> {
  const current = await getFirstWinProgress(input.userId);
  if (current) return current;
  const now = new Date().toISOString();
  return persistFirstWinProgress({
    id: `${LOCAL_ID_PREFIX}${input.userId}`,
    userId: input.userId,
    goal: input.goal,
    targetLanguage: normalizeVocabularyLanguage(input.targetLanguage),
    startedAt: now,
    updatedAt: now,
  });
}

export async function completeFirstWin(input: { userId: string; goal: FirstWinGoal; targetLanguage: string }): Promise<FirstWinCompletion> {
  const current = await getFirstWinProgress(input.userId);
  if (current?.completedAt) return { progress: current, didComplete: false };
  const started = current ?? await saveFirstWinStart(input);
  const now = new Date().toISOString();
  const progress = await persistFirstWinProgress({ ...started, completedAt: now, updatedAt: now });
  clearFirstWinDraft();
  return { progress, didComplete: true };
}
