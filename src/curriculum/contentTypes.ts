export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LexicalCollocation {
  id: string;
  phrase: string;
  translation: string;
  cefr: CEFRLevel;
  type: 'idiom' | 'phrasal_verb' | 'collocation' | 'academic_word';
  occurrences: string[]; // sentences from the article/podcast where it occurs
}

export interface DeepArticle {
  id: string;
  language: string;
  title: string;
  titleTranslation: string;
  author: string;
  publication: string;
  cefrMapping: CEFRLevel;
  wordCount: number;
  content: {
    paragraphId: string;
    text: string;
    translation: string;
    grammaticalHighlights: {
      text: string;
      explanation: string;
      type: 'passive' | 'conditional' | 'complex_clause' | 'subjunctive';
    }[];
  }[];
  targetCollocations: LexicalCollocation[];
}

export interface TranscriptChunk {
  id: string;
  startTimeSec: number;
  endTimeSec: number;
  speaker: string;
  text: string;
  translation: string;
  phoneticGaps?: { word: string; ipa: string }[];
}

export interface PodcastEpisode {
  id: string;
  language: string;
  title: string;
  titleTranslation: string;
  host: string;
  audioUrl: string; // URL to the full MP3
  cefrMapping: CEFRLevel;
  durationSec: number;
  transcript: TranscriptChunk[];
  targetCollocations: LexicalCollocation[];
}
