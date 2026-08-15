import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createOwnerScopedStorage } from './srsOwnerStorage';
import { useAuthStore } from './authStore';
import { 
  type CheckpointAttemptResult, 
  type LearnerCompetencyProfile,
  buildCompetencyProfile 
} from '../domain/curriculum/competencyTracker';
import { JAPANESE_N5_COURSE } from '../curriculum/courses/japaneseN5Course';
import { type CurriculumCourse } from '../domain/curriculum/curriculumEngine';

interface CompetencyState {
  results: Record<string, CheckpointAttemptResult[]>;
  effectiveStudyMinutes: number;
  addCheckpointResult: (result: CheckpointAttemptResult) => void;
  addStudyMinutes: (minutes: number) => void;
  getCompetencyProfile: (course: CurriculumCourse) => LearnerCompetencyProfile;
}

export const useCompetencyStore = create<CompetencyState>()(
  persist(
    (set, get) => ({
      results: {},
      effectiveStudyMinutes: 0,

      addCheckpointResult: (result) => set((state) => {
        const courseId = JAPANESE_N5_COURSE.id; // For now we assume N5 course, but better to key by course.
        // We'll key the results by courseId for scalability
        const currentResults = state.results[courseId] || [];
        return {
          results: {
            ...state.results,
            [courseId]: [...currentResults, result]
          }
        };
      }),

      addStudyMinutes: (minutes) => set((state) => ({
        effectiveStudyMinutes: state.effectiveStudyMinutes + minutes
      })),

      getCompetencyProfile: (course) => {
        const state = get();
        const checkpointResults = state.results[course.id] || [];
        
        return buildCompetencyProfile({
          learnerId: useAuthStore.getState().user?.id || 'anonymous',
          course,
          checkpointResults,
          effectiveStudyMinutes: state.effectiveStudyMinutes,
          currentUnitIndex: 0,
        });
      }
    }),
    {
      name: 'competency-storage',
      storage: createJSONStorage(() =>
        createOwnerScopedStorage(window.localStorage, () => useAuthStore.getState().user?.id || null)
      ),
    }
  )
);
