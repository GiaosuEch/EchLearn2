export interface IELTSModule {
  id: string;
  skill: IELTSSkill;
  bandRange: IELTSBandRange;
  title: string;
  description: string;
  content: IELTSContent;
  estimatedMinutes: number;
  isCompleted: boolean;
}

export type IELTSSkill = 'listening' | 'reading' | 'writing' | 'speaking';

export interface IELTSBandRange {
  id: string;
  name: string;
  minBand: number;
  maxBand: number;
  description: string;
  color: string;
}

export const IELTS_BAND_RANGES: IELTSBandRange[] = [
  { id: 'foundation', name: 'Foundation', minBand: 0, maxBand: 3, description: 'Building basics', color: '#94A3B8' },
  { id: 'beginner', name: 'Beginner', minBand: 3, maxBand: 4, description: 'Getting started', color: '#60A5FA' },
  { id: 'pre-intermediate', name: 'Pre-Intermediate', minBand: 4, maxBand: 5, description: 'Growing confidence', color: '#34D399' },
  { id: 'intermediate', name: 'Intermediate', minBand: 5, maxBand: 6, description: 'Steady progress', color: '#FBBF24' },
  { id: 'upper-intermediate', name: 'Upper-Intermediate', minBand: 6, maxBand: 7, description: 'Strong ability', color: '#F97316' },
  { id: 'advanced', name: 'Advanced', minBand: 7, maxBand: 8, description: 'Expert level', color: '#A78BFA' },
  { id: 'mastery', name: 'Mastery', minBand: 8, maxBand: 9, description: 'Near native', color: '#F43F5E' },
];

export type IELTSContent =
  | IELTSListeningContent
  | IELTSReadingContent
  | IELTSWritingContent
  | IELTSSpeakingContent;

export interface IELTSListeningContent {
  type: 'listening';
  sections: IELTSListeningSection[];
}

export interface IELTSListeningSection {
  id: string;
  sectionNumber: 1 | 2 | 3 | 4;
  title: string;
  audioUrl: string;
  transcript: string;
  questions: IELTSQuestion[];
  duration: number;
}

export interface IELTSReadingContent {
  type: 'reading';
  passages: IELTSReadingPassage[];
}

export interface IELTSReadingPassage {
  id: string;
  title: string;
  text: string;
  wordCount: number;
  questions: IELTSQuestion[];
  keywords: string[];
}

export interface IELTSWritingContent {
  type: 'writing';
  tasks: IELTSWritingTask[];
}

export interface IELTSWritingTask {
  id: string;
  taskType: 'task1-academic' | 'task1-general' | 'task2';
  prompt: string;
  imageUrl?: string;
  chartData?: unknown;
  wordLimit: { min: number; max: number };
  timeLimit: number;
  tips: string[];
  modelAnswer?: string;
  scoringCriteria: IELTSWritingCriteria[];
}

export interface IELTSWritingCriteria {
  name: string;
  description: string;
  weight: number;
}

export interface IELTSSpeakingContent {
  type: 'speaking';
  parts: IELTSSpeakingPart[];
}

export interface IELTSSpeakingPart {
  id: string;
  partNumber: 1 | 2 | 3;
  title: string;
  questions: string[];
  cueCard?: IELTSCueCard;
  preparationTime?: number;
  speakingTime: number;
  tips: string[];
}

export interface IELTSCueCard {
  topic: string;
  bulletPoints: string[];
  followUpQuestions: string[];
}

export interface IELTSQuestion {
  id: string;
  type: IELTSQuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
}

export type IELTSQuestionType =
  | 'multiple-choice'
  | 'true-false-not-given'
  | 'yes-no-not-given'
  | 'matching-headings'
  | 'gap-fill'
  | 'sentence-completion'
  | 'form-completion'
  | 'map-labeling'
  | 'matching';

export interface WritingSubmission {
  id: string;
  userId: string;
  taskType: string;
  prompt: string;
  text: string;
  feedback: WritingFeedback;
  estimatedBand: number;
  createdAt: string;
}

export interface WritingFeedback {
  taskResponse: { score: number; comments: string };
  coherenceCohesion: { score: number; comments: string };
  lexicalResource: { score: number; comments: string };
  grammaticalRange: { score: number; comments: string };
  overallBand: number;
  strengths: string[];
  improvements: string[];
  rewriteSuggestion: string;
  vocabularyUpgrades: VocabularyUpgrade[];
  grammarCorrections: GrammarCorrection[];
}

export interface VocabularyUpgrade {
  original: string;
  suggested: string;
  reason: string;
}

export interface GrammarCorrection {
  original: string;
  corrected: string;
  rule: string;
}

export interface SpeakingSubmission {
  id: string;
  userId: string;
  partNumber: number;
  audioUrl: string;
  transcript: string;
  feedback: SpeakingFeedback;
  estimatedBand: number;
  createdAt: string;
}

export interface SpeakingFeedback {
  pronunciation: { score: number; comments: string };
  fluency: { score: number; comments: string };
  lexicalResource: { score: number; comments: string };
  grammaticalRange: { score: number; comments: string };
  overallBand: number;
  strengths: string[];
  improvements: string[];
}

export interface MockTest {
  id: string;
  title: string;
  type: 'full' | 'listening' | 'reading' | 'writing' | 'speaking';
  bandTarget: string;
  duration: number;
  totalQuestions: number;
  isCompleted: boolean;
  score?: number;
  completedAt?: string;
}
