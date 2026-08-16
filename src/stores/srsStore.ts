import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createOwnerScopedSrsStorage } from './srsOwnerStorage';
import type { SRSItemKind } from '../domain/curriculum/curriculumEngine';
import { EventBusService, SystemEvents } from '../lib/events/EventBus';

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export interface SRSItem {
  id: string; // reviewable item id (word, grammar question, or reading question)
  kind: SRSItemKind; // item type: vocabulary, sentence-pattern, grammar-error, reading-comprehension, production-prompt
  n: number; // repetitions
  ef: number; // ease factor
  interval: number; // inter-repetition interval in days
  nextReviewDate: number; // timestamp
  history: number[]; // past qualities
  /** Optional source lesson for traceability. */
  sourceLesson?: string;
  /** Optional source unit. */
  sourceUnit?: string;
  /** For grammar-error items: the stimulus/prompt. */
  stimulus?: string;
  /** For grammar-error items: the correct response. */
  response?: string;
}

export interface LessonProgress {
  id: string;
  attempts: number;
  lastScore: number;
  bestScore: number;
  total: number;
  percent: number;
  completed: boolean;
  completedAt?: number;
}

interface SRSStore {
  items: Record<string, SRSItem>;
  lessonProgress: Record<string, LessonProgress>;
  recordReview: (id: string, quality: Quality) => void;
  recordLessonAttempt: (lessonId: string, correct: number, total: number) => LessonProgress;
  migrateLessonProgress: (legacyLessonId: string, scopedLessonId: string) => void;
  getDueItems: (limit?: number) => SRSItem[];
  getDueItemsByKind: (kind: SRSItemKind, limit?: number) => SRSItem[];
  getItem: (id: string) => SRSItem;
  getLessonProgress: (lessonId: string) => LessonProgress;
  /** Record a grammar error as an SRS item for targeted review. */
  recordGrammarError: (lessonId: string, questionId: string, wrongAnswer: string, correctAnswer: string, unitId?: string) => void;
  /** Record a sentence pattern for SRS review. */
  recordSentencePattern: (patternId: string, stimulus: string, response: string, lessonId?: string, unitId?: string) => void;
}

const SRS_STORAGE_NAME = 'echlearn_srs_mastery';
let activeSrsOwnerId: string | null = null;

const srsStorage = createJSONStorage<SRSStore>(() => createOwnerScopedSrsStorage(window.localStorage, () => window.localStorage.getItem('echlern_current_user_id')));

const EMPTY_LESSON_PROGRESS = (id: string): LessonProgress => ({
  id,
  attempts: 0,
  lastScore: 0,
  bestScore: 0,
  total: 0,
  percent: 0,
  completed: false,
});

export const useSRSStore = create<SRSStore>()(
  persist(
    (set, get) => ({
      items: {},
      lessonProgress: {},
      recordReview: (id: string, quality: Quality) => {
        set((state) => {
          const now = Date.now();
          const item = state.items[id] || {
            id,
            kind: 'vocabulary' as SRSItemKind,
            n: 0,
            ef: 2.5,
            interval: 0,
            nextReviewDate: now,
            history: [],
          };

          let newN = item.n;
          let newInterval = item.interval;
          let newEF = item.ef;

          if (quality >= 3) {
            if (item.n === 0) {
              newInterval = 1;
            } else if (item.n === 1) {
              newInterval = 6;
            } else {
              newInterval = Math.round(item.interval * item.ef);
            }
            newN += 1;
          } else {
            newN = 0;
            newInterval = 1;
          }

          newEF = item.ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
          if (newEF < 1.3) newEF = 1.3;

          const nextReviewDate = now + newInterval * 24 * 60 * 60 * 1000;

          return {
            items: {
              ...state.items,
              [id]: {
                ...item,
                id,
                kind: item.kind || 'vocabulary',
                n: newN,
                ef: newEF,
                interval: newInterval,
                nextReviewDate,
                history: [...item.history, quality].slice(-10),
              },
            },
          };
        });
      },
      recordLessonAttempt: (lessonId: string, correct: number, total: number) => {
        const safeTotal = Math.max(1, total);
        const safeCorrect = Math.max(0, Math.min(correct, safeTotal));
        const attemptPercent = Math.round((safeCorrect / safeTotal) * 100);
        const now = Date.now();
        let result = EMPTY_LESSON_PROGRESS(lessonId);

        set((state) => {
          const current = state.lessonProgress[lessonId] || EMPTY_LESSON_PROGRESS(lessonId);
          const bestScore = Math.max(current.bestScore, safeCorrect);
          const bestPercent = Math.max(current.percent, attemptPercent);
          const completed = current.completed || bestPercent >= 80;
          result = {
            id: lessonId,
            attempts: current.attempts + 1,
            lastScore: safeCorrect,
            bestScore,
            total: safeTotal,
            percent: bestPercent,
            completed,
            completedAt: completed ? current.completedAt || now : undefined,
          };

          return {
            lessonProgress: {
              ...state.lessonProgress,
              [lessonId]: result,
            },
          };
        });

        return result;
      },
      migrateLessonProgress: (legacyLessonId: string, scopedLessonId: string) => {
        if (legacyLessonId === scopedLessonId) return;
        set((state) => {
          const legacy = state.lessonProgress[legacyLessonId];
          if (!legacy || state.lessonProgress[scopedLessonId]) return state;
          return {
            lessonProgress: {
              ...state.lessonProgress,
              [scopedLessonId]: { ...legacy, id: scopedLessonId },
            },
          };
        });
      },
      getDueItems: (limit = 50) => {
        const now = Date.now();
        const { items } = get();
        return Object.values(items)
          .filter((item) => item.nextReviewDate <= now)
          .sort((a, b) => a.nextReviewDate - b.nextReviewDate)
          .slice(0, limit);
      },
      getDueItemsByKind: (kind: SRSItemKind, limit = 50) => {
        const now = Date.now();
        const { items } = get();
        return Object.values(items)
          .filter((item) => (item.kind || 'vocabulary') === kind && item.nextReviewDate <= now)
          .sort((a, b) => a.nextReviewDate - b.nextReviewDate)
          .slice(0, limit);
      },
      getItem: (id: string) => {
        return (
          get().items[id] || {
            id,
            kind: 'vocabulary' as SRSItemKind,
            n: 0,
            ef: 2.5,
            interval: 0,
            nextReviewDate: Date.now(),
            history: [],
          }
        );
      },
      getLessonProgress: (lessonId: string) => get().lessonProgress[lessonId] || EMPTY_LESSON_PROGRESS(lessonId),
      recordGrammarError: (lessonId: string, questionId: string, wrongAnswer: string, correctAnswer: string, unitId?: string) => {
        const id = `grammar-error:${lessonId}:${questionId}`;
        set((state) => {
          // Don't overwrite if already exists
          if (state.items[id]) return state;
          const now = Date.now();
          return {
            items: {
              ...state.items,
              [id]: {
                id,
                kind: 'grammar-error' as SRSItemKind,
                n: 0,
                ef: 2.5,
                interval: 0,
                nextReviewDate: now,
                history: [],
                sourceLesson: lessonId,
                sourceUnit: unitId,
                stimulus: `Bạn đã trả lời "${wrongAnswer}" — đáp án đúng là gì?`,
                response: correctAnswer,
              },
            },
          };
        });
      },
      recordSentencePattern: (patternId: string, stimulus: string, response: string, lessonId?: string, unitId?: string) => {
        const id = `sentence-pattern:${patternId}`;
        set((state) => {
          if (state.items[id]) return state;
          const now = Date.now();
          return {
            items: {
              ...state.items,
              [id]: {
                id,
                kind: 'sentence-pattern' as SRSItemKind,
                n: 0,
                ef: 2.5,
                interval: 0,
                nextReviewDate: now,
                history: [],
                sourceLesson: lessonId,
                sourceUnit: unitId,
                stimulus,
                response,
              },
            },
          };
        });
      },
    }),
    {
      name: SRS_STORAGE_NAME,
      storage: srsStorage,
    }
  )
);

/** Rehydrate the in-memory SRS view when the authenticated learner changes. */
export async function activateSRSOwner(userId: string | null): Promise<void> {
  const normalizedUserId = userId?.trim() || null;
  if (activeSrsOwnerId === normalizedUserId) return;
  activeSrsOwnerId = normalizedUserId;
  useSRSStore.setState({ items: {}, lessonProgress: {} });
  await useSRSStore.persist.rehydrate();
}

export function attachSRSStoreEvents(eventBus: EventBusService) {
  eventBus.on(SystemEvents.AUTH_USER_LOGGED_IN, (userId: string) => {
    activateSRSOwner(userId).catch(console.error);
  });

  eventBus.on(SystemEvents.AUTH_USER_LOGGED_OUT, () => {
    activateSRSOwner(null).catch(console.error);
  });
}
