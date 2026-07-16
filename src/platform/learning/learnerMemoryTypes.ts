export interface LearnerMemorySnapshot {
  targetLanguage?: string;
  nativeLanguage?: string;
  skillFocus?: string;
  difficultyPreference?: string;
  recentPracticeSummary?: string;
  weakSkills: string[];
  preferredExerciseTypes: string[];
  updatedAt: string;
  source: string;
}

export interface LearnerMemorySnapshotInput {
  targetLanguage?: string;
  nativeLanguage?: string;
  skillFocus?: string;
  difficultyPreference?: string;
  recentPracticeSummary?: string;
  weakSkills?: string[];
  preferredExerciseTypes?: string[];
}

export interface LearnerMemoryRecord {
  consent: boolean;
  snapshot: LearnerMemorySnapshot | null;
}

export interface LearnerMemoryExport {
  consent: boolean;
  snapshot: LearnerMemorySnapshot | null;
  exportedAt: string;
}

export interface LearnerMemoryAIContext {
  available: boolean;
  targetLanguage?: string;
  nativeLanguage?: string;
  skillFocus?: string;
  difficultyPreference?: string;
  recentPracticeSummary?: string;
  weakSkills?: string[];
  preferredExerciseTypes?: string[];
}
