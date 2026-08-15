import type { LexicalCollocation } from '../../curriculum/contentTypes';
import { nlpBridge } from './NLPWorkerBridge';

export class LexicalResonanceEngine {
  /**
   * (ASYNC) Scans a text for target collocations and logs them to the learner's spaced repetition notebook
   * if they fail to recognize or shadow them correctly.
   * Execution is offloaded to a Web Worker to prevent UI thread blocking.
   */
  static async processShadowingGap(
    _userId: string,
    _language: string,
    failedWordOrPhrase: string,
    contextSentence: string,
    collocationsInContext: LexicalCollocation[]
  ): Promise<any> {
    return nlpBridge.processShadowingGap(failedWordOrPhrase, contextSentence, collocationsInContext);
  }

  /**
   * (ASYNC) Calculates a Lexical Density Score for an article paragraph to determine
   * if it should trigger cognitive highlighting.
   * Execution is offloaded to a Web Worker to prevent UI thread blocking.
   */
  static async calculateLexicalDensity(text: string, languageCode: string): Promise<number> {
    // Optimization: Avoid structured cloning overhead for tiny strings
    if (text.length < 500) {
      if (text.trim().length === 0) return 0;
      
      let wordsCount = 0;
      let charsCount = 0;
      
      // True Multilingual Tokenization (CJK, Arabic, etc.) with strict language binding
      if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter(languageCode, { granularity: 'word' });
        const segments = segmenter.segment(text);
        for (const segment of segments) {
          if (segment.isWordLike) {
            wordsCount++;
            charsCount += segment.segment.replace(/[^\p{L}\p{N}]/gu, '').length;
          }
        }
      } else {
        // Fallback for old environments
        const words = text.split(/\s+/).filter(w => w.trim().length > 0);
        wordsCount = words.length;
        charsCount = words.reduce((acc, word) => acc + word.replace(/[^\p{L}\p{N}]/gu, '').length, 0);
      }
      
      if (wordsCount === 0) return 0;
      return charsCount / wordsCount;
    }

    return nlpBridge.calculateLexicalDensity(text, languageCode);
  }

  /**
   * (ASYNC) Evaluates a learner's pedagogical response against the model answer and common mistakes.
   * Execution is offloaded to a Web Worker for NLP matching.
   */
  static async evaluatePedagogicalResponse(
    userAnswer: string,
    modelAnswer: string,
    commonMistakes?: string[],
    targetCollocations?: string[],
    languageCode?: string
  ): Promise<{ isCorrect: boolean; feedback: string; matchedMistake?: string; usedCollocations?: string[] }> {
    return nlpBridge.evaluatePedagogicalResponse(userAnswer, modelAnswer, commonMistakes, targetCollocations, languageCode);
  }
}