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
  const context = createLearnerMemoryAIContext(record);
  return context ? { available: true, ...context } : { available: false };
}


function optionalMemoryText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized || undefined;
}

function optionalMemoryList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const normalized = value
    .map(optionalMemoryText)
    .filter((item): item is string => item !== undefined);
  return normalized.length > 0 ? normalized : undefined;
}

export function createLearnerMemoryAIContext(
  record: LearnerMemoryRecord,
): Omit<LearnerMemoryAIContext, 'available'> | undefined {
  if (!record.consent || !record.snapshot || typeof record.snapshot !== 'object') {
    return undefined;
  }

  const snapshot = record.snapshot as unknown as Record<string, unknown>;
  const textFields = [
    'targetLanguage',
    'nativeLanguage',
    'skillFocus',
    'difficultyPreference',
    'recentPracticeSummary',
  ] as const;
  if (textFields.some((key) => (
    snapshot[key] !== undefined && typeof snapshot[key] !== 'string'
  ))) {
    return undefined;
  }
  if (
    snapshot.weakSkills !== undefined
      && (!Array.isArray(snapshot.weakSkills)
        || snapshot.weakSkills.some((item) => typeof item !== 'string'))
    || snapshot.preferredExerciseTypes !== undefined
      && (!Array.isArray(snapshot.preferredExerciseTypes)
        || snapshot.preferredExerciseTypes.some((item) => typeof item !== 'string'))
  ) {
    return undefined;
  }

  const context: Omit<LearnerMemoryAIContext, 'available'> = {};
  const targetLanguage = optionalMemoryText(snapshot.targetLanguage);
  const nativeLanguage = optionalMemoryText(snapshot.nativeLanguage);
  const skillFocus = optionalMemoryText(snapshot.skillFocus);
  const difficultyPreference = optionalMemoryText(snapshot.difficultyPreference);
  const weakSkills = optionalMemoryList(snapshot.weakSkills);
  const preferredExerciseTypes = optionalMemoryList(snapshot.preferredExerciseTypes);
  const recentPracticeSummary = optionalMemoryText(snapshot.recentPracticeSummary);

  if (targetLanguage) context.targetLanguage = targetLanguage;
  if (nativeLanguage) context.nativeLanguage = nativeLanguage;
  if (skillFocus) context.skillFocus = skillFocus;
  if (difficultyPreference) context.difficultyPreference = difficultyPreference;
  if (weakSkills) context.weakSkills = weakSkills;
  if (preferredExerciseTypes) context.preferredExerciseTypes = preferredExerciseTypes;
  if (recentPracticeSummary) context.recentPracticeSummary = recentPracticeSummary;

  return Object.keys(context).length > 0 ? context : undefined;
}
