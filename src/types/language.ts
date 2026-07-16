export interface Language {
  id: string;
  name: string;
  nativeName: string;
  code: string;
  flag: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  totalLessons: number;
  totalLearners: number;
  description: string;
  skills: LanguageSkill[];
  hasIELTS: boolean;
}

export interface LanguageSkill {
  id: string;
  name: 'listening' | 'speaking' | 'reading' | 'writing';
  progress: number;
  totalLessons: number;
  completedLessons: number;
}

export interface Course {
  id: string;
  languageId: string;
  title: string;
  level: CourseLevel;
  description: string;
  totalLessons: number;
  completedLessons: number;
  xpReward: number;
  imageUrl?: string;
  skills: string[];
  isLocked: boolean;
  order: number;
}

export type CourseLevel = 'beginner' | 'elementary' | 'intermediate' | 'upper-intermediate' | 'advanced' | 'mastery';
