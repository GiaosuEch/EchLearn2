import { localDb } from '../lib/storage/localDatabase';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { progressService } from './progressService';
import { type LearningProfile, type LearningItemProgress, type LearningEvent, type TodayPlan, type SkillType, asUserId, asProfileId, asItemId } from '../types/learningTypes';
import { 
  calculateMasteryScore, 
  calculateNewDifficulty, 
  scheduleNextReview, 
  getMasteryLabel 
} from './fsrsCalculator';
import { 
  getProgress, 
  saveProgress, 
  saveEvent, 
  addReviewItem, 
  fetchProfile, 
  saveProfileDb,
  saveTodayPlan,
  progressTable,
  fromDbProgress,
  fromDbProfile
} from './learningRepository';

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

function xpForEvent(isCorrect: boolean, masteryAfter: number, skillType: SkillType) {
  const base = isCorrect ? 10 : 3;
  const bonus = masteryAfter >= 90 ? 5 : masteryAfter >= 75 ? 3 : 0;
  const skillBonus = skillType === 'speaking' || skillType === 'writing' ? 3 : 0;
  return base + bonus + skillBonus;
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

function defaultProfile(userId: string, targetLanguage: string, nativeLanguage: string): LearningProfile {
  return {
    id: asProfileId(`lp_${userId}_${targetLanguage}`),
    userId: asUserId(userId),
    targetLanguage,
    nativeLanguage,
    currentLevel: 'beginner',
    placementScore: 0,
    weakSkills: ['listening', 'vocabulary'],
    strongSkills: [],
    dailyGoal: 50,
    streak: 0,
    totalXP: 0,
    activeLearningPath: ['placement', 'survival-vocabulary', 'daily-listening', 'guided-speaking', 'weak-review'].map(asItemId),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

function buildPlan(userId: string, targetLanguage: string, nativeLanguage: string, profile: LearningProfile, dueReviews: LearningItemProgress[]): TodayPlan {
  const weakSkills: SkillType[] = (profile.weakSkills?.length ? profile.weakSkills : ['listening', 'vocabulary']) as SkillType[];
  const primarySkill = dueReviews[0]?.skillType || weakSkills[0] || 'lesson';
  const primaryAction = actionForSkill(primarySkill);
  const skillText = skillLabelsVi[primarySkill] || primarySkill;
  const actions: Array<{
    id: string;
    label: string;
    path: string;
    skillType: SkillType;
    reason: string;
  }> = [
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
    userId: asUserId(userId),
    targetLanguage,
    nativeLanguage,
    title: 'Kế hoạch học hôm nay',
    reason: dueReviews.length
      ? `Bạn có ${dueReviews.length} mục cần ôn. Ưu tiên ${skillText} trước để tránh quên.`
      : `Dựa trên bài test và lịch sử học, hôm nay nên tập trung vào ${skillText}.`,
    estimatedTime: dueReviews.length ? 18 : 15,
    recommendedLesson: {
      id: asItemId('adaptive_next_lesson'),
      title: primaryAction.label,
      path: primaryAction.path,
      skillType: primarySkill,
    },
    reviewQueue: dueReviews,
    weakSkills,
    actions: actions.map(a => ({ ...a, id: asItemId(a.id) })),
    generatedAt: nowIso(),
  };
}

export const learningCoordinator = {
  normalizeSkill,
  getMasteryLabel,
  calculateMasteryScore,
  scheduleNextReview,

  async getLearningProfile(userId: string, targetLanguage: string, nativeLanguage: string): Promise<LearningProfile> {
    const data = await fetchProfile(userId, targetLanguage);
    if (data) return fromDbProfile(data);

    const local = localDb.getTable<LearningProfile>('learning_profiles')
      .find((row) => row.userId === userId && row.targetLanguage === targetLanguage);
    return local || defaultProfile(userId, targetLanguage, nativeLanguage);
  },

  async saveLearningProfile(profile: LearningProfile): Promise<LearningProfile> {
    const withId: LearningProfile = { 
      ...profile, 
      id: profile.id ? asProfileId(profile.id) : asProfileId(`lp_${profile.userId}_${profile.targetLanguage}`), 
      updatedAt: nowIso() 
    };
    await saveProfileDb(withId);
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
      id: asProfileId(`lp_${params.userId}_${params.targetLanguage}`),
      userId: asUserId(params.userId),
      targetLanguage: params.targetLanguage,
      nativeLanguage: params.nativeLanguage,
      currentLevel: params.estimatedLevel || params.selfRatedLevel || 'beginner',
      placementScore: Number(params.placementScore || 0),
      weakSkills: weakSkills.length ? weakSkills : ['listening', 'vocabulary'],
      strongSkills,
      dailyGoal: 50,
      streak: 0,
      totalXP: 0,
      activeLearningPath: activeLearningPath.map(asItemId),
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
    
    const newDifficulty = calculateNewDifficulty(Number(input.difficulty || previous.difficulty || 2.5), input.isCorrect);
    
    const updated: LearningItemProgress = {
      ...previous,
      skillType,
      attempts: previous.attempts + 1,
      correctCount: previous.correctCount + (input.isCorrect ? 1 : 0),
      wrongCount: previous.wrongCount + (input.isCorrect ? 0 : 1),
      lastPracticedAt: nowIso(),
      nextReviewAt: scheduleNextReview(masteryAfter, !input.isCorrect, newDifficulty, input.isCorrect ? previous.correctCount + 1 : 0),
      masteryScore: masteryAfter,
      confidence: clamp((previous.confidence || 0) + (input.isCorrect ? 8 : -6)),
      difficulty: newDifficulty,
    };
    
    const savedProgress = await saveProgress(updated);
    await addReviewItem(savedProgress);
    
    const xpEarned = xpForEvent(input.isCorrect, masteryAfter, skillType);
    const event: LearningEvent = {
      userId: asUserId(input.userId),
      targetLanguage: input.targetLanguage,
      itemId: asItemId(input.itemId),
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
    const newPlan = buildPlan(userId, targetLanguage, nativeLanguage, profile, dueReviews);
    const id = `plan_${userId}_${targetLanguage}_${todayKey()}`;
    
    await saveTodayPlan(id, newPlan);
    
    return newPlan;
  }
};
