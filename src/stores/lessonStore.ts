import { create } from 'zustand';
import type { FocusState } from '../domain/cognitive/cognitiveState';
import { globalEventBus, SystemEvents } from '../lib/events/EventBus';

export interface Exercise {
  id: string;
  type: string;
  question: string;
  instruction?: string;
  options?: unknown[];
  correctAnswer: string | string[];
  explanation?: string;
  audioText?: string;
  targetText?: string;
  words?: string[];
  pairs?: { left: string; right: string }[];
}

interface LessonState {
  exercises: Exercise[];
  currentIndex: number;
  focusState: FocusState;
  
  setExercises: (exercises: Exercise[]) => void;
  nextExercise: () => void;
  injectRemedial: (exercise: Exercise) => void;
  setFocusState: (state: FocusState) => void;
  reset: () => void;
}

export const useLessonStore = create<LessonState>((set) => {
  // Listen for intervention events directly to keep view layers dumb
  globalEventBus.on(SystemEvents.INTERVENTION_REQUIRED, (payload: any) => {
    if (!payload?.originalExercise) return;
    
    // Auto-escalate focus
    set({ focusState: 'DEEP_FOCUS' });

    // Inject remedial exercise
    const remedial: Exercise = {
      id: `remedial-${Date.now()}`,
      type: payload.originalExercise.type,
      question: `(Củng cố) ${payload.originalExercise.question}`,
      instruction: 'Hệ thống nhận thấy lỗ hổng kiến thức. Hãy thử lại để củng cố bộ nhớ!',
      options: payload.originalExercise.options,
      correctAnswer: payload.originalExercise.correctAnswer,
      audioText: payload.originalExercise.audioText,
      targetText: payload.originalExercise.targetText
    };

    set((state) => {
      const newEx = [...state.exercises];
      newEx.splice(state.currentIndex + 1, 0, remedial);
      return { exercises: newEx };
    });
  });

  return {
    exercises: [],
    currentIndex: 0,
    focusState: 'NORMAL',
    
    setExercises: (exercises) => set({ exercises, currentIndex: 0, focusState: 'NORMAL' }),
    nextExercise: () => set((state) => ({ currentIndex: state.currentIndex + 1 })),
    injectRemedial: (exercise) => set((state) => {
      const newEx = [...state.exercises];
      newEx.splice(state.currentIndex + 1, 0, exercise);
      return { exercises: newEx };
    }),
    setFocusState: (focusState) => set({ focusState }),
    reset: () => set({ exercises: [], currentIndex: 0, focusState: 'NORMAL' })
  };
});
