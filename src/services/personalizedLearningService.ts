import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/storage/localDatabase';
import type { PlacementQuestion, PlacementResult, SelfAssessedLevel } from './aiLearningEngine';

export interface AiOnboardingRecord {
  id?: string;
  userId: string;
  targetLanguage: string;
  nativeLanguage: string;
  selfAssessedLevel: SelfAssessedLevel;
  testSeed: string;
  questions: PlacementQuestion[];
  answers?: Record<string, string>;
  result?: PlacementResult;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

const table = 'ai_onboarding_results';

const toDb = (record: AiOnboardingRecord) => ({
  id: record.id,
  user_id: record.userId,
  target_language: record.targetLanguage,
  native_language: record.nativeLanguage,
  self_assessed_level: record.selfAssessedLevel,
  test_seed: record.testSeed,
  questions_json: record.questions,
  answers_json: record.answers || {},
  result_json: record.result || null,
  completed_at: record.completedAt || null,
  updated_at: new Date().toISOString(),
});

const fromDb = (row: any): AiOnboardingRecord => ({
  id: row.id,
  userId: row.user_id,
  targetLanguage: row.target_language,
  nativeLanguage: row.native_language,
  selfAssessedLevel: row.self_assessed_level,
  testSeed: row.test_seed,
  questions: row.questions_json || [],
  answers: row.answers_json || {},
  result: row.result_json || undefined,
  completedAt: row.completed_at || undefined,
  createdAt: row.created_at || undefined,
  updatedAt: row.updated_at || undefined,
});

export const personalizedLearningService = {
  async save(record: AiOnboardingRecord): Promise<AiOnboardingRecord> {
    const id = record.id || `ai_${crypto.randomUUID()}`;
    const withId = { ...record, id, updatedAt: new Date().toISOString() };
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from(table).upsert(toDb(withId), { onConflict: 'id' }).select('*').maybeSingle();
      if (!error && data) return fromDb(data);
    }
    const existing = localDb.findById<AiOnboardingRecord>(table, id);
    if (existing) localDb.update<AiOnboardingRecord>(table, id, withId);
    else localDb.insert<AiOnboardingRecord>(table, withId);
    return withId;
  },

  async getLatest(userId: string, targetLanguage?: string): Promise<AiOnboardingRecord | null> {
    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from(table).select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1);
      if (targetLanguage) query = query.eq('target_language', targetLanguage);
      const { data, error } = await query.maybeSingle();
      if (!error && data) return fromDb(data);
    }
    const local = localDb.getTable<AiOnboardingRecord>(table)
      .filter((row) => row.userId === userId && (!targetLanguage || row.targetLanguage === targetLanguage))
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    return local[0] || null;
  },

  async hasCompleted(userId: string, targetLanguage?: string): Promise<boolean> {
    const latest = await this.getLatest(userId, targetLanguage);
    return Boolean(latest?.result);
  },
};
