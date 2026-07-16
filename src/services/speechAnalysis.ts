// Speech Analysis Mock Service
// Replace with Whisper/Google Speech-to-Text API

export interface SpeechAnalysisResult {
  transcript: string;
  pronunciation: { score: number; feedback: string };
  fluency: { score: number; feedback: string };
  intonation: { score: number; feedback: string };
  stress: { score: number; feedback: string };
  overallScore: number;
  suggestions: string[];
  wordAnalysis: WordPronunciation[];
}

export interface WordPronunciation {
  word: string;
  score: number;
  phonetic: string;
  issue?: string;
}

export async function analyzeSpeech(_audioBlob: Blob, targetText: string): Promise<SpeechAnalysisResult> {
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  const words = targetText.split(' ');
  const wordAnalysis: WordPronunciation[] = words.map(word => ({
    word,
    score: Math.floor(Math.random() * 30) + 70,
    phonetic: `/${word.toLowerCase()}/`,
    issue: Math.random() > 0.7 ? 'Stress on wrong syllable' : undefined,
  }));

  const pronunciationScore = Math.floor(Math.random() * 25) + 65;
  const fluencyScore = Math.floor(Math.random() * 25) + 60;
  const intonationScore = Math.floor(Math.random() * 25) + 65;
  const stressScore = Math.floor(Math.random() * 25) + 60;

  return {
    transcript: targetText,
    pronunciation: {
      score: pronunciationScore,
      feedback: pronunciationScore > 80
        ? 'Excellent pronunciation! Clear and natural sounding.'
        : pronunciationScore > 60
          ? 'Good effort! Pay attention to vowel sounds and word endings.'
          : 'Keep practicing! Focus on individual sounds first.',
    },
    fluency: {
      score: fluencyScore,
      feedback: fluencyScore > 80
        ? 'Very fluent! Natural pace and rhythm.'
        : fluencyScore > 60
          ? 'Good flow! Try to reduce pauses between phrases.'
          : 'Practice reading aloud to improve your speaking speed.',
    },
    intonation: {
      score: intonationScore,
      feedback: intonationScore > 80
        ? 'Great intonation! Your speech sounds natural.'
        : 'Try to vary your pitch more, especially at the end of questions.',
    },
    stress: {
      score: stressScore,
      feedback: stressScore > 80
        ? 'Word stress is accurate and natural.'
        : 'Focus on stressing the correct syllable in multi-syllable words.',
    },
    overallScore: Math.round((pronunciationScore + fluencyScore + intonationScore + stressScore) / 4),
    suggestions: [
      'Practice tongue twisters for clearer consonant sounds',
      'Record yourself and compare with native speakers',
      'Focus on linking words together naturally',
      'Pay attention to sentence stress patterns',
    ],
    wordAnalysis,
  };
}

export function getIELTSSpeakingBand(overallScore: number): number {
  if (overallScore >= 90) return 9.0;
  if (overallScore >= 85) return 8.5;
  if (overallScore >= 80) return 8.0;
  if (overallScore >= 75) return 7.5;
  if (overallScore >= 70) return 7.0;
  if (overallScore >= 65) return 6.5;
  if (overallScore >= 60) return 6.0;
  if (overallScore >= 55) return 5.5;
  if (overallScore >= 50) return 5.0;
  if (overallScore >= 45) return 4.5;
  if (overallScore >= 40) return 4.0;
  return 3.5;
}
