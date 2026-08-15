export type SkillType = 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing';

export interface DeepLessonContent {
  id: string;
  title: string;
  type: SkillType;
  officialRubricMapping: string;
  targetGrammar?: string[];
  targetVocabLimit?: number;
  estimatedMinutes: number;
  // Specific properties for exam-focused tracks like IELTS
  examBand?: string;
  examComponent?: string;
  
  // Advanced Pedagogical Enrichment
  targetCollocations?: string[];
  assessmentPrompt?: string;
  modelAnswer?: string;
  commonMistakes?: string[];
}

export interface DeepModuleContent {
  id: string;
  name: string;
  desc: string;
  lessons: Omit<DeepLessonContent, 'id'>[];
}

export interface DeepCurriculumData {
  languageFamily: string;
  levels: DeepModuleContent[];
}
