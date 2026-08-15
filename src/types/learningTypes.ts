// --- BRANDED TYPES FOR 100% TYPE SAFETY ---
export type Brand<K, T> = K & { readonly __brand: T };

export type UserId = Brand<string, 'UserId'>;
export type ItemId = Brand<string, 'ItemId'>;
export type ProfileId = Brand<string, 'ProfileId'>;
export type ProgressId = Brand<string, 'ProgressId'>;
export type EventId = Brand<string, 'EventId'>;

// Type assertion factories
export const asUserId = (id: string) => id as UserId;
export const asItemId = (id: string) => id as ItemId;
export const asProfileId = (id: string) => id as ProfileId;
export const asProgressId = (id: string) => id as ProgressId;
export const asEventId = (id: string) => id as EventId;

export type SkillType = 'listening' | 'speaking' | 'reading' | 'writing' | 'vocabulary' | 'grammar' | 'pronunciation' | 'lesson';
export type MasteryLabel = 'Chưa chắc' | 'Đang học' | 'Khá ổn' | 'Gần thành thạo' | 'Thành thạo';

export interface LearningProfile {
  id?: ProfileId;
  userId: UserId;
  targetLanguage: string;
  nativeLanguage: string;
  currentLevel: string;
  placementScore: number;
  weakSkills: SkillType[];
  strongSkills: SkillType[];
  dailyGoal: number;
  streak: number;
  totalXP: number;
  activeLearningPath: ItemId[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningItemProgress {
  id?: ProgressId;
  userId: UserId;
  targetLanguage: string;
  itemId: ItemId;
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
  id?: EventId;
  userId: UserId;
  targetLanguage: string;
  itemId: ItemId;
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
  userId: UserId;
  targetLanguage: string;
  nativeLanguage: string;
  title: string;
  reason: string;
  estimatedTime: number;
  recommendedLesson: {
    id: ItemId;
    title: string;
    path: string;
    skillType: SkillType;
  };
  reviewQueue: LearningItemProgress[];
  weakSkills: SkillType[];
  actions: Array<{
    id: ItemId;
    label: string;
    path: string;
    skillType: SkillType;
    reason: string;
  }>;
  generatedAt: string;
}
