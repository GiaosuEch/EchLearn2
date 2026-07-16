// @ts-nocheck
import { localDb } from '../lib/storage/localDatabase';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { progressService } from './progressService';

export type SkillType = 'listening' | 'speaking' | 'reading' | 'writing' | 'vocabulary' | 'grammar' | 'pronunciation' | 'lesson';
export type MasteryLabel = 'Chưa chắc' | 'Đang học' | 'Khá ổn' | 'Gần thành thạo' | 'Thành thạo';

export interface LearningProfile {
  id?: string;
  userId: string;
  targetLanguage: string;
  nativeLanguage: string;
  currentLevel: string;
  placementScore: number;
  weakSkills: SkillType[];
  strongSkills: SkillType[];
  dailyGoal: number;
  streak: number;
  totalXP: number;
  activeLearningPath: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningItemProgress {
  id?: string;
  userId: string;
  targetLanguage: string;
  itemId: string;
  skillType: SkillType;
  attempts: number;
  correctCount: number;
  wrongCount: number;
  lastPracticedAt?: string;
  nextReviewAt?: string;
  masteryScore: number;
  confidence: number;
  difficulty: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningEvent {
  id?: string;
  userId: string;
  targetLanguage: string;
  itemId: string;
  skillType: SkillType;
  isCorrect: boolean;
  answer?: string;
  correctAnswer?: string;
  timeSpentSec?: number;
  audioReplays?: number;
  skipped?: boolean;
  typedExact?: boolean;
  typedClose?: boolean;
  xpEarned: number;
  masteryBefore: number;
  masteryAfter: number;
  createdAt?: string;
}

export interface TodayPlan {
  userId: string;
  targetLanguage: string;
  nativeLanguage: string;
  title: string;
  reason: string;
  estimatedTime: number;
  recommendedLesson: {
    id: string;
    title: string;
    path: string;
    skillType: SkillType;
  };
  reviewQueue: LearningItemProgress[];
  weakSkills: SkillType[];
  actions: Array<{
    id: string;
    label: string;
    path: string;
    skillType: SkillType;
    reason: string;
  }>;
  generatedAt: string;
}

const progressTable = 'learning_item_progress';
const eventsTable = 'learning_events';
const profilesTable = 'learning_profiles';
const plansTable = 'daily_learning_plans';
const reviewTable = 'review_queue';

const skillLabelsVi: Record<string, string> = {
  listening: 'nghe', speaking: 'nói', reading: 'đọc', writing: 'viết', vocabulary: 'từ vựng', grammar: 'ngữ pháp', pronunciation: 'phát âm', lesson: 'bài học',
};

function nowIso() {
  return new Date().toISOString();
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
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

function fromDbProfile(row: any): LearningProfile {
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

function fromDbProgress(row: any): LearningItemProgress {
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

export function getMasteryLabel(score: number): MasteryLabel {
  if (score >= 90) return 'Thành thạo';
  if (score >= 75) return 'Gần thành thạo';
  if (score >= 50) return 'Khá ổn';
  if (score >= 25) return 'Đang học';
  return 'Chưa chắc';
}

export function calculateMasteryScore(params: {
  currentScore: number;
  isCorrect: boolean;
  hadMistake?: boolean;
  repeatedWrong?: boolean;
  audioReplay?: boolean;
  typedExact?: boolean;
  typedClose?: boolean;
  skipped?: boolean;
}) {
  let delta = 0;
  if (params.skipped) delta -= 8;
  if (params.isCorrect && !params.hadMistake) delta += 15;
  else if (params.isCorrect) delta += 7;
  if (!params.isCorrect) delta += params.repeatedWrong ? -10 : -5;
  if (params.audioReplay) delta += 1;
  if (params.typedExact) delta += 15;
  else if (params.typedClose) delta += 8;
  return clamp(params.currentScore + delta);
}

export function scheduleNextReview(masteryScore: number, wasWrong = false, fromDate = new Date()) {
  const next = new Date(fromDate);
  if (wasWrong || masteryScore < 25) next.setMinutes(next.getMinutes() + 10);
  else if (masteryScore < 50) next.setDate(next.getDate() + 1);
  else if (masteryScore < 75) next.setDate(next.getDate() + 3);
  else if (masteryScore < 90) next.setDate(next.getDate() + 7);
  else next.setDate(next.getDate() + 21);
  return next.toISOString();
}

function defaultProfile(userId: string, targetLanguage: string, nativeLanguage: string): LearningProfile {
  return {
    id: `lp_${userId}_${targetLanguage}`,
    userId,
    targetLanguage,
    nativeLanguage,
    currentLevel: 'beginner',
    placementScore: 0,
    weakSkills: ['listening', 'vocabulary'],
    strongSkills: [],
    dailyGoal: 50,
    streak: 0,
    totalXP: 0,
    activeLearningPath: ['placement', 'survival-vocabulary', 'daily-listening', 'guided-speaking', 'weak-review'],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

function fallbackProgress(userId: string, targetLanguage: string, itemId: string, skillType: SkillType): LearningItemProgress {
  return {
    id: `lip_${userId}_${targetLanguage}_${itemId}`.replace(/[^a-zA-Z0-9_-]/g, '_'),
    userId,
    targetLanguage,
    itemId,
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

function xpForEvent(isCorrect: boolean, masteryAfter: number, skillType: SkillType) {
  const base = isCorrect ? 10 : 3;
  const bonus = masteryAfter >= 90 ? 5 : masteryAfter >= 75 ? 3 : 0;
  const skillBonus = skillType === 'speaking' || skillType === 'writing' ? 3 : 0;
  return base + bonus + skillBonus;
}

async function getProgress(userId: string, targetLanguage: string, itemId: string, skillType: SkillType): Promise<LearningItemProgress> {
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

async function saveProgress(progress: LearningItemProgress) {
  const withDates = { ...progress, updatedAt: nowIso() };
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from(progressTable).upsert(toDbProgress(withDates), { onConflict: 'user_id,target_language,item_id' });
    if (!error) return withDates;
  }
  const existing = localDb.findById<LearningItemProgress>(progressTable, withDates.id || '');
  if (existing && withDates.id) localDb.update(progressTable, withDates.id, withDates);
  else localDb.insert(progressTable, withDates);
  return withDates;
}

async function addReviewItem(progress: LearningItemProgress) {
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
    const { error } = await supabase.from(reviewTable).upsert({
      id: review.id,
      user_id: review.userId,
      target_language: review.targetLanguage,
      item_id: review.itemId,
      skill_type: review.skillType,
      due_at: review.dueAt,
      mastery_score: review.masteryScore,
      reason: review.reason,
      updated_at: review.updatedAt,
    }, { onConflict: 'id' });
    if (!error) return;
  }
  const existing = localDb.findById<any>(reviewTable, review.id);
  if (existing) localDb.update(reviewTable, review.id, review);
  else localDb.insert(reviewTable, review);
}

async function saveEvent(event: LearningEvent) {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from(eventsTable).insert({
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
    if (!error) return;
  }
  localDb.insert<LearningEvent>(eventsTable, event);
}

function actionForSkill(skill: SkillType) {
  const map: Record<string, { label: string; path: string }> = {
    listening: { label: 'Luyện nghe', path: '/app/listening' },
    speaking: { label: 'Luyện nói', path: '/app/speaking' },
    reading: { label: 'Luyện đọc', path: '/app/reading' },
    writing: { label: 'Luyện viết', path: '/app/writing' },
    vocabulary: { label: 'Ôn từ vựng', path: '/app/vocabulary' },
    grammar: { label: 'Ôn ngữ pháp', path: '/app/grammar' },
    pronunciation: { label: 'Luyện phát âm', path: '/app/speaking' },
    lesson: { label: 'Tiếp tục bài học', path: '/app/lesson' },
  };
  return map[skill] || map.lesson;
}

function buildPlan(userId: string, targetLanguage: string, nativeLanguage: string, profile: LearningProfile, dueReviews: LearningItemProgress[]): TodayPlan {
  const weakSkills = profile.weakSkills?.length ? profile.weakSkills : ['listening', 'vocabulary'];
  const primarySkill = dueReviews[0]?.skillType || weakSkills[0] || 'lesson';
  const primaryAction = actionForSkill(primarySkill);
  const skillText = skillLabelsVi[primarySkill] || primarySkill;
  const actions = [
    {
      id: 'weak-review',
      label: dueReviews.length ? `Ôn ${dueReviews.length} mục đến hạn` : `Ôn kỹ năng ${skillText}`,
      path: primaryAction.path,
      skillType: primarySkill,
      reason: dueReviews.length ? 'Có mục cần ôn theo spaced repetition.' : `Kỹ năng ${skillText} đang cần củng cố.`,
    },
    {
      id: 'next-lesson',
      label: 'Bài học tiếp theo',
      path: '/app/lesson',
      skillType: 'lesson',
      reason: 'Tiếp tục lộ trình chính để mở khóa nội dung mới.',
    },
    {
      id: 'balanced-practice',
      label: 'Luyện cân bằng 4 kỹ năng',
      path: '/app/practice',
      skillType: 'lesson',
      reason: 'Giữ nhịp học đều giữa nghe, nói, đọc và viết.',
    },
  ];
  return {
    userId,
    targetLanguage,
    nativeLanguage,
    title: 'Kế hoạch học hôm nay',
    reason: dueReviews.length
      ? `Bạn có ${dueReviews.length} mục cần ôn. Ưu tiên ${skillText} trước để tránh quên.`
      : `Dựa trên bài test và lịch sử học, hôm nay nên tập trung vào ${skillText}.`,
    estimatedTime: dueReviews.length ? 18 : 15,
    recommendedLesson: {
      id: 'adaptive_next_lesson',
      title: primaryAction.label,
      path: primaryAction.path,
      skillType: primarySkill,
    },
    reviewQueue: dueReviews,
    weakSkills,
    actions,
    generatedAt: nowIso(),
  };
}

export const adaptiveLearningEngine = {
  normalizeSkill,
  getMasteryLabel,
  calculateMasteryScore,
  scheduleNextReview,

  async getLearningProfile(userId: string, targetLanguage: string, nativeLanguage: string): Promise<LearningProfile> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase
        .from(profilesTable)
        .select('*')
        .eq('user_id', userId)
        .eq('target_language', targetLanguage)
        .maybeSingle();
      if (data) return fromDbProfile(data);
    }
    const local = localDb.getTable<LearningProfile>(profilesTable)
      .find((row) => row.userId === userId && row.targetLanguage === targetLanguage);
    return local || defaultProfile(userId, targetLanguage, nativeLanguage);
  },

  async saveLearningProfile(profile: LearningProfile): Promise<LearningProfile> {
    const withId = { ...profile, id: profile.id || `lp_${profile.userId}_${profile.targetLanguage}`, updatedAt: nowIso() };
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from(profilesTable).upsert(toDbProfile(withId), { onConflict: 'user_id,target_language' }).select('*').maybeSingle();
      if (!error && data) return fromDbProfile(data);
    }
    const existing = localDb.findById<LearningProfile>(profilesTable, withId.id || '');
    if (existing && withId.id) localDb.update(profilesTable, withId.id, withId);
    else localDb.insert(profilesTable, withId);
    return withId;
  },

  async createInitialPathFromPlacement(params: {
    userId: string;
    targetLanguage: string;
    nativeLanguage: string;
    placementScore: number;
    estimatedLevel: string;
    weakSkills: string[];
    strongSkills: string[];
    selfRatedLevel?: string;
  }): Promise<LearningProfile> {
    const weakSkills = (params.weakSkills || []).map(normalizeSkill).filter(Boolean);
    const strongSkills = (params.strongSkills || []).map(normalizeSkill).filter(Boolean);
    const activeLearningPath = [
      'weak-review',
      weakSkills.includes('listening') ? 'daily-listening' : 'survival-vocabulary',
      weakSkills.includes('speaking') ? 'guided-speaking' : 'guided-lesson',
      weakSkills.includes('writing') ? 'short-writing' : 'reading-context',
      'checkpoint-1',
    ];
    return this.saveLearningProfile({
      id: `lp_${params.userId}_${params.targetLanguage}`,
      userId: params.userId,
      targetLanguage: params.targetLanguage,
      nativeLanguage: params.nativeLanguage,
      currentLevel: params.estimatedLevel || params.selfRatedLevel || 'beginner',
      placementScore: Number(params.placementScore || 0),
      weakSkills: weakSkills.length ? weakSkills : ['listening', 'vocabulary'],
      strongSkills,
      dailyGoal: 50,
      streak: 0,
      totalXP: 0,
      activeLearningPath,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
  },

  async recordLearningEvent(input: {
    userId: string;
    targetLanguage: string;
    itemId: string;
    skillType?: string;
    isCorrect: boolean;
    answer?: string;
    correctAnswer?: string;
    hadMistake?: boolean;
    repeatedWrong?: boolean;
    audioReplay?: boolean;
    typedExact?: boolean;
    typedClose?: boolean;
    skipped?: boolean;
    timeSpentSec?: number;
    difficulty?: number;
  }): Promise<{ progress: LearningItemProgress; event: LearningEvent }> {
    const skillType = normalizeSkill(input.skillType);
    const previous = await getProgress(input.userId, input.targetLanguage, input.itemId, skillType);
    const masteryBefore = previous.masteryScore || 0;
    const masteryAfter = calculateMasteryScore({
      currentScore: masteryBefore,
      isCorrect: input.isCorrect,
      hadMistake: input.hadMistake,
      repeatedWrong: input.repeatedWrong || (!input.isCorrect && previous.wrongCount > 0),
      audioReplay: input.audioReplay,
      typedExact: input.typedExact,
      typedClose: input.typedClose,
      skipped: input.skipped,
    });
    const updated: LearningItemProgress = {
      ...previous,
      skillType,
      attempts: previous.attempts + 1,
      correctCount: previous.correctCount + (input.isCorrect ? 1 : 0),
      wrongCount: previous.wrongCount + (input.isCorrect ? 0 : 1),
      lastPracticedAt: nowIso(),
      nextReviewAt: scheduleNextReview(masteryAfter, !input.isCorrect),
      masteryScore: masteryAfter,
      confidence: clamp((previous.confidence || 0) + (input.isCorrect ? 8 : -6)),
      difficulty: Number(input.difficulty || previous.difficulty || 1),
    };
    const savedProgress = await saveProgress(updated);
    await addReviewItem(savedProgress);
    const xpEarned = xpForEvent(input.isCorrect, masteryAfter, skillType);
    const event: LearningEvent = {
      userId: input.userId,
      targetLanguage: input.targetLanguage,
      itemId: input.itemId,
      skillType,
      isCorrect: input.isCorrect,
      answer: input.answer,
      correctAnswer: input.correctAnswer,
      timeSpentSec: input.timeSpentSec || 0,
      audioReplays: input.audioReplay ? 1 : 0,
      skipped: Boolean(input.skipped),
      typedExact: Boolean(input.typedExact),
      typedClose: Boolean(input.typedClose),
      xpEarned,
      masteryBefore,
      masteryAfter,
      createdAt: nowIso(),
    };
    await saveEvent(event);
    try {
      await progressService.addXPEvent(input.userId, xpEarned, `adaptive_${skillType}`);
    } catch {
      // XP persistence should never block lesson flow.
    }
    return { progress: savedProgress, event };
  },

  async getDueReviews(userId: string, targetLanguage: string): Promise<LearningItemProgress[]> {
    const cutoff = nowIso();
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase
        .from(progressTable)
        .select('*')
        .eq('user_id', userId)
        .eq('target_language', targetLanguage)
        .lte('next_review_at', cutoff)
        .order('mastery_score', { ascending: true })
        .limit(12);
      if (data) return data.map(fromDbProgress);
    }
    return localDb.getTable<LearningItemProgress>(progressTable)
      .filter((row) => row.userId === userId && row.targetLanguage === targetLanguage && (!row.nextReviewAt || row.nextReviewAt <= cutoff))
      .sort((a, b) => (a.masteryScore || 0) - (b.masteryScore || 0))
      .slice(0, 12);
  },

  async getTodayPlan(userId: string, targetLanguage: string, nativeLanguage: string): Promise<TodayPlan> {
    const profile = await this.getLearningProfile(userId, targetLanguage, nativeLanguage);
    const dueReviews = await this.getDueReviews(userId, targetLanguage);
    const plan = buildPlan(userId, targetLanguage, nativeLanguage, profile, dueReviews);
    const id = `plan_${userId}_${targetLanguage}_${todayKey()}`;
    if (isSupabaseConfigured() && supabase) {
      await supabase.from(plansTable).upsert({
        id,
        user_id: userId,
        target_language: targetLanguage,
        native_language: nativeLanguage,
        plan_date: todayKey(),
        plan_json: plan,
        generated_at: plan.generatedAt,
        updated_at: nowIso(),
      }, { onConflict: 'id' });
    } else {
      const existing = localDb.findById<any>(plansTable, id);
      const row = { id, userId, targetLanguage, nativeLanguage, planDate: todayKey(), plan, generatedAt: plan.generatedAt, updatedAt: nowIso() };
      if (existing) localDb.update(plansTable, id, row);
      else localDb.insert(plansTable, row);
    }
    return plan;
  },
};

export function validateAdaptiveLearningEngine() {
  const initial = 20;
  const firstCorrect = calculateMasteryScore({ currentScore: initial, isCorrect: true });
  const wrong = calculateMasteryScore({ currentScore: firstCorrect, isCorrect: false, repeatedWrong: true });
  const dueLow = scheduleNextReview(10, false, new Date('2026-01-01T00:00:00.000Z'));
  const dueHigh = scheduleNextReview(95, false, new Date('2026-01-01T00:00:00.000Z'));
  return {
    ok: firstCorrect === 35 && wrong === 25 && dueLow.includes('00:10:00') && dueHigh.startsWith('2026-01-22'),
    checks: [
      `firstCorrect=${firstCorrect}`,
      `repeatedWrong=${wrong}`,
      `lowDue=${dueLow}`,
      `highDue=${dueHigh}`,
      `label=${getMasteryLabel(91)}`,
    ],
  };
}
