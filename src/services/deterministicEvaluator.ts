// src/services/deterministicEvaluator.ts

/**
 * Deterministic Lexical Engine (No-AI).
 * Evaluates user input against a known correct answer purely using deterministic rules,
 * regex parsing, and Levenshtein distance for close typos, ensuring 100% predictability.
 */

export interface EvaluationResult {
  isCorrect: boolean;
  isClose: boolean;
  feedback: string;
  score: number; // 0 to 1
}

// Split text using Intl.Segmenter to properly handle complex unicode graphemes (e.g. CJK, Arabic, Thai, Emojis)
const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });

function getGraphemes(text: string): string[] {
  return Array.from(segmenter.segment(text)).map(s => s.segment);
}

// Unicode-aware Levenshtein distance
export function levenshtein(a: string, b: string): number {
  const arrA = getGraphemes(a);
  const arrB = getGraphemes(b);

  const matrix = Array.from({ length: arrA.length + 1 }, () => Array(arrB.length + 1).fill(0));

  for (let i = 0; i <= arrA.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= arrB.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= arrA.length; i++) {
    for (let j = 1; j <= arrB.length; j++) {
      // Use localeCompare for base character matching regardless of case/accents depending on usage
      // For strict deterministic matching, exact grapheme equality is preferred here,
      // but we ensure prior normalization (NFC + lowercasing).
      const cost = arrA[i - 1] === arrB[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[arrA.length][arrB.length];
}

export const deterministicEvaluator = {
  /**
   * Evaluates text input such as translation or vocabulary typing.
   */
  evaluateText(input: string, target: string): EvaluationResult {
    // 1. Unicode Normalization (NFC)
    // 2. Remove all unicode punctuation and symbols \p{P} (punctuation), \p{S} (symbols)
    // 3. Lowercase using standard string (sufficient for most after NFC, though for full i18n, locale-aware compare is best)
    const normalizeStr = (str: string) => 
      str.normalize('NFC')
         .replace(/[\p{P}\p{S}]/gu, '')
         .trim()
         .toLowerCase();

    const normalizedInput = normalizeStr(input);
    const normalizedTarget = normalizeStr(target);

    if (normalizedInput === normalizedTarget) {
      return {
        isCorrect: true,
        isClose: true,
        feedback: 'evaluation.exact_match', // Translation key
        score: 1.0
      };
    }

    const dist = levenshtein(normalizedInput, normalizedTarget);
    
    const lenA = getGraphemes(normalizedInput).length;
    const lenB = getGraphemes(normalizedTarget).length;
    const maxLen = Math.max(lenA, lenB);
    const similarity = maxLen === 0 ? 0 : 1 - dist / maxLen;

    // Allow 1 typo for every 5 characters (e.g., 80% similarity threshold)
    if (similarity >= 0.8) {
      return {
        isCorrect: true,
        isClose: true,
        feedback: 'evaluation.close_match', // Translation key
        score: similarity
      };
    }

    return {
      isCorrect: false,
      isClose: false,
      feedback: 'evaluation.incorrect', // Translation key
      score: similarity
    };
  }
};
