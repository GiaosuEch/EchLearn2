import { localDb } from '../lib/storage/localDatabase';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { syncQueue } from './syncQueueService';
import { type LearningProfile, type LearningItemProgress, type LearningEvent, type SkillType, asProgressId, asUserId, asItemId } from '../types/learningTypes';

export const progressTable = 'learning_item_progress';
export const eventsTable = 'learning_events';
export const profilesTable = 'learning_profiles';
export const plansTable = 'daily_learning_plans';
export const reviewTable = 'review_queue';

function nowIso() {
  return new Date().toISOString();
}

function normalizeSkill(skill?: string): SkillType {
  const s = String(skill || 'lesson').toLowerCase();
  if (['listening', 'speaking', 'reading', 'writing', 'vocabulary', 'grammar', 'pronunciation', 'lesson'].includes(s)) return s as SkillType;
  if (s.includes('hear') || s.includes('listen')) return 'listening';
  if (s.includes('speak') || s.includes('pronunciation')) return 'speaking';
  if (s.includes('read')) return 'reading';
  if (s.includes('write')) return 'writing';
  if (s.includes('grammar')) return 'grammar';
  if (s.includes('vocab') || s.includes('word')) return 'vocabulary';
  return 'lesson';
}

function toDbProfile(profile: LearningProfile) {
  return {
    id: profile.id,
    user_id: profile.userId,
    target_language: profile.targetLanguage,
    native_language: profile.nativeLanguage,
    current_level: profile.currentLevel,
    placement_score: profile.placementScore,
    weak_skills: profile.weakSkills,
    strong_skills: profile.strongSkills,
    daily_goal: profile.dailyGoal,
    streak: profile.streak,
    total_xp: profile.totalXP,
    active_learning_path: profile.activeLearningPath,
    updated_at: nowIso(),
  };
}

export function fromDbProfile(row: any): LearningProfile {
  return {
    id: row.id,
    userId: row.user_id,
    targetLanguage: row.target_language,
    nativeLanguage: row.native_language,
    currentLevel: row.current_level || 'beginner',
    placementScore: Number(row.placement_score || 0),
    weakSkills: (row.weak_skills || []).map(normalizeSkill),
    strongSkills: (row.strong_skills || []).map(normalizeSkill),
    dailyGoal: Number(row.daily_goal || 50),
    streak: Number(row.streak || 0),
    totalXP: Number(row.total_xp || 0),
    activeLearningPath: row.active_learning_path || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDbProgress(progress: LearningItemProgress) {
  return {
    id: progress.id,
    user_id: progress.userId,
    target_language: progress.targetLanguage,
    item_id: progress.itemId,
    skill_type: progress.skillType,
    attempts: progress.attempts,
    correct_count: progress.correctCount,
    wrong_count: progress.wrongCount,
    last_practiced_at: progress.lastPracticedAt,
    next_review_at: progress.nextReviewAt,
    mastery_score: progress.masteryScore,
    confidence: progress.confidence,
    difficulty: progress.difficulty,
    updated_at: nowIso(),
  };
}

export function fromDbProgress(row: any): LearningItemProgress {
  return {
    id: row.id,
    userId: row.user_id,
    targetLanguage: row.target_language,
    itemId: row.item_id,
    skillType: normalizeSkill(row.skill_type),
    attempts: Number(row.attempts || 0),
    correctCount: Number(row.correct_count || 0),
    wrongCount: Number(row.wrong_count || 0),
    lastPracticedAt: row.last_practiced_at || undefined,
    nextReviewAt: row.next_review_at || undefined,
    masteryScore: Number(row.mastery_score || 0),
    confidence: Number(row.confidence || 0),
    difficulty: Number(row.difficulty || 1),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function fallbackProgress(userId: string, targetLanguage: string, itemId: string, skillType: SkillType): LearningItemProgress {
  return {
    id: asProgressId(`lip_${userId}_${targetLanguage}_${itemId}`.replace(/[^a-zA-Z0-9_-]/g, '_')),
    userId: asUserId(userId),
    targetLanguage,
    itemId: asItemId(itemId),
    skillType,
    attempts: 0,
    correctCount: 0,
    wrongCount: 0,
    masteryScore: 0,
    confidence: 0,
    difficulty: 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

export async function getProgress(userId: string, targetLanguage: string, itemId: string, skillType: SkillType): Promise<LearningItemProgress> {
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase
      .from(progressTable)
      .select('*')
      .eq('user_id', userId)
      .eq('target_language', targetLanguage)
      .eq('item_id', itemId)
      .maybeSingle();
    if (data) return fromDbProgress(data);
  }
  const local = localDb.getTable<LearningItemProgress>(progressTable)
    .find((row) => row.userId === userId && row.targetLanguage === targetLanguage && row.itemId === itemId);
  return local || fallbackProgress(userId, targetLanguage, itemId, skillType);
}

export async function saveProgress(progress: LearningItemProgress) {
  const withDates = { ...progress, updatedAt: nowIso() };
  if (isSupabaseConfigured() && supabase) {
    await syncQueue.pushChange(progressTable, toDbProgress(withDates));
  }
  const existing = localDb.findById<LearningItemProgress>(progressTable, withDates.id || '');
  if (existing && withDates.id) localDb.update(progressTable, withDates.id, withDates);
  else localDb.insert(progressTable, withDates);
  return withDates;
}

export async function saveEvent(event: LearningEvent) {
  if (isSupabaseConfigured() && supabase) {
    await syncQueue.pushChange(eventsTable, {
      user_id: event.userId,
      target_language: event.targetLanguage,
      item_id: event.itemId,
      skill_type: event.skillType,
      is_correct: event.isCorrect,
      answer: event.answer || null,
      correct_answer: event.correctAnswer || null,
      time_spent_sec: event.timeSpentSec || 0,
      audio_replays: event.audioReplays || 0,
      skipped: Boolean(event.skipped),
      typed_exact: Boolean(event.typedExact),
      typed_close: Boolean(event.typedClose),
      xp_earned: event.xpEarned,
      mastery_before: event.masteryBefore,
      mastery_after: event.masteryAfter,
    });
  }
  localDb.insert<LearningEvent>(eventsTable, event);
}

export async function addReviewItem(progress: LearningItemProgress) {
  const review = {
    id: `rq_${progress.id}`,
    userId: progress.userId,
    targetLanguage: progress.targetLanguage,
    itemId: progress.itemId,
    skillType: progress.skillType,
    dueAt: progress.nextReviewAt,
    masteryScore: progress.masteryScore,
    reason: progress.masteryScore < 50 ? 'weak_item' : 'scheduled_review',
    updatedAt: nowIso(),
  };
  if (isSupabaseConfigured() && supabase) {
    await syncQueue.pushChange(reviewTable, {
      id: review.id,
      user_id: review.userId,
      target_language: review.targetLanguage,
      item_id: review.itemId,
      skill_type: review.skillType,
      due_at: review.dueAt,
      mastery_score: review.masteryScore,
      reason: review.reason,
      updated_at: review.updatedAt,
    });
  }
  const existing = localDb.findById<any>(reviewTable, review.id);
  if (existing) localDb.update(reviewTable, review.id, review);
  else localDb.insert(reviewTable, review);
}

export async function fetchProfile(userId: string, targetLanguage: string): Promise<any> {
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase
      .from(profilesTable)
      .select('*')
      .eq('user_id', userId)
      .eq('target_language', targetLanguage)
      .maybeSingle();
    return data;
  }
  return null;
}

export async function saveProfileDb(profile: LearningProfile) {
  if (isSupabaseConfigured() && supabase) {
    await syncQueue.pushChange(profilesTable, toDbProfile(profile));
  }
  const existing = localDb.findById<LearningProfile>(profilesTable, profile.id || '');
  if (existing && profile.id) localDb.update(profilesTable, profile.id, profile);
  else localDb.insert(profilesTable, profile);
}

export async function fetchTodayPlan(id: string): Promise<any> {
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase.from(plansTable).select('*').eq('id', id).maybeSingle();
    return data;
  }
  return null;
}

export async function saveTodayPlan(id: string, plan: any) {
  if (isSupabaseConfigured() && supabase) {
    await syncQueue.pushChange(plansTable, { id, ...plan });
  }
  const existing = localDb.findById(plansTable, id);
  if (existing) localDb.update(plansTable, id, { id, ...plan });
  else localDb.insert(plansTable, { id, ...plan });
}
