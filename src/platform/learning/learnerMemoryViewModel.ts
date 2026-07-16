import type { LearnerMemoryAIContext, LearnerMemoryRecord } from './learnerMemoryTypes.ts';

export interface LearnerMemoryViewModel {
  status: 'off' | 'on';
  heading: string;
  description: string;
  consent: boolean;
  hasSnapshot: boolean;
}

export function createLearnerMemoryViewModel(
  record: LearnerMemoryRecord,
): LearnerMemoryViewModel {
  if (!record.consent) {
    return {
      status: 'off',
      heading: 'Learner memory is off',
      description: 'Enable local learner memory to store a consent-gated snapshot on this device.',
      consent: false,
      hasSnapshot: record.snapshot !== null,
    };
  }

  return {
    status: 'on',
    heading: 'Learner memory is on',
    description: 'Local learner memory is stored on this device only and used as future AI context once an approved local model is ready.',
    consent: true,
    hasSnapshot: record.snapshot !== null,
  };
}

export function createFutureAIContext(
  record: LearnerMemoryRecord,
): LearnerMemoryAIContext {
  if (!record.consent || !record.snapshot) {
    return { available: false };
  }

  const snapshot = record.snapshot;
  return {
    available: true,
    targetLanguage: snapshot.targetLanguage,
    nativeLanguage: snapshot.nativeLanguage,
    skillFocus: snapshot.skillFocus,
    difficultyPreference: snapshot.difficultyPreference,
    recentPracticeSummary: snapshot.recentPracticeSummary,
    weakSkills: snapshot.weakSkills,
    preferredExerciseTypes: snapshot.preferredExerciseTypes,
  };
}
