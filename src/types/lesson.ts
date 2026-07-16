export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  skill: 'listening' | 'speaking' | 'reading' | 'writing' | 'vocabulary' | 'grammar' | 'mixed';
  level: number;
  xpReward: number;
  estimatedMinutes: number;
  exercises: Exercise[];
  vocabularyPreview: VocabularyItem[];
  isCompleted: boolean;
  isLocked: boolean;
  order: number;
}

export interface Exercise {
  id: string;
  lessonId: string;
  type: ExerciseType;
  question: string;
  instruction: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  audioUrl?: string;
  imageUrl?: string;
  pairs?: MatchPair[];
  words?: string[];
  hint?: string;
}

export type ExerciseType =
  | 'multiple-choice'
  | 'fill-blank'
  | 'match-pairs'
  | 'listen-choose'
  | 'speak-compare'
  | 'translate'
  | 'arrange-sentence'
  | 'type-what-you-hear'
  | 'short-writing'
  | 'flashcard-review'
  | 'ai-conversation';

export interface MatchPair {
  left: string;
  right: string;
}

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  audioUrl?: string;
  example: string;
  exampleTranslation: string;
  partOfSpeech: string;
  level: string;
  imageUrl?: string;
  mastery: number;
}

export interface GrammarTopic {
  id: string;
  title: string;
  description: string;
  level: string;
  explanation: string;
  examples: GrammarExample[];
  exercises: Exercise[];
  isCompleted: boolean;
}

export interface GrammarExample {
  sentence: string;
  translation: string;
  highlight: string;
  explanation: string;
}

export interface LessonResult {
  lessonId: string;
  totalExercises: number;
  correctAnswers: number;
  xpEarned: number;
  accuracy: number;
  timeSpent: number;
  mistakes: MistakeItem[];
  newVocabulary: VocabularyItem[];
  streakMaintained: boolean;
  levelUp: boolean;
}

export interface MistakeItem {
  exerciseId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}
