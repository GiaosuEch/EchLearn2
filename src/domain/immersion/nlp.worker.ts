import type { TranscriptChunk, LexicalCollocation } from '../../curriculum/contentTypes';

// Messages from Main Thread
export type NLPWorkerRequest = 
  | { type: 'ALIGN_TRANSCRIPT'; payload: { chunks: TranscriptChunk[]; currentTimeSec: number; reqId: string } }
  | { type: 'CALCULATE_DENSITY'; payload: { text: string; languageCode: string; reqId: string } }
  | { type: 'PROCESS_SHADOWING'; payload: { failedWord: string; contextSentence: string; collocations: LexicalCollocation[]; reqId: string } }
  | { type: 'EVALUATE_PEDAGOGICAL_RESPONSE'; payload: { userAnswer: string; modelAnswer: string; commonMistakes?: string[]; targetCollocations?: string[]; languageCode?: string; reqId: string } };

// Messages to Main Thread
export type NLPWorkerResponse = 
  | { type: 'ALIGN_RESULT'; payload: { chunk: TranscriptChunk | null; reqId: string } }
  | { type: 'DENSITY_RESULT'; payload: { density: number; reqId: string } }
  | { type: 'SHADOWING_RESULT'; payload: { 
        action: 'LOGGED_COLLOCATION' | 'LOGGED_WORD_GAP'; 
        collocation?: LexicalCollocation; 
        word?: string;
        mistakePayload: { type: 'Listening' | 'Speaking' | 'Reading' | 'Writing' | 'Vocabulary' | 'Grammar'; mistake: string; correction: string; notes: string };
        reqId: string 
    } }
  | { type: 'EVALUATION_RESULT'; payload: {
        isCorrect: boolean;
        feedback: string;
        matchedMistake?: string;
        usedCollocations?: string[];
        reqId: string;
    } };

self.onmessage = (e: MessageEvent<NLPWorkerRequest>) => {
  const req = e.data;
  
  switch (req.type) {
    case 'ALIGN_TRANSCRIPT': {
      const { chunks, currentTimeSec, reqId } = req.payload;
      if (!chunks || chunks.length === 0) {
        self.postMessage({ type: 'ALIGN_RESULT', payload: { chunk: null, reqId } });
        return;
      }

      // In the future, AST-based or deep alignment could replace this.
      let left = 0;
      let right = chunks.length - 1;
      let result: TranscriptChunk | null = null;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const chunk = chunks[mid];

        if (currentTimeSec >= chunk.startTimeSec && currentTimeSec <= chunk.endTimeSec) {
          result = chunk;
          break;
        }

        if (currentTimeSec < chunk.startTimeSec) {
          right = mid - 1;
        } else {
          left = mid + 1;
        }
      }

      self.postMessage({ type: 'ALIGN_RESULT', payload: { chunk: result, reqId } });
      break;
    }
    
    case 'CALCULATE_DENSITY': {
      const { text, languageCode, reqId } = req.payload;
      
      let wordsCount = 0;
      let charsCount = 0;
      
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
        const words = text.split(/\s+/).filter(w => w.trim().length > 0);
        wordsCount = words.length;
        charsCount = words.reduce((acc, word) => acc + word.replace(/[^\p{L}\p{N}]/gu, '').length, 0);
      }
      
      const density = wordsCount > 0 ? charsCount / wordsCount : 0;
      self.postMessage({ type: 'DENSITY_RESULT', payload: { density, reqId } });
      break;
    }

    case 'PROCESS_SHADOWING': {
      const { failedWord, contextSentence, collocations, reqId } = req.payload;
      const normalizedFail = failedWord.toLowerCase().trim();

      const matchedCollocation = collocations.find((col) =>
        col.phrase.toLowerCase().includes(normalizedFail) || normalizedFail.includes(col.phrase.toLowerCase())
      );

      if (matchedCollocation) {
        self.postMessage({
          type: 'SHADOWING_RESULT',
          payload: {
            reqId,
            action: 'LOGGED_COLLOCATION',
            collocation: matchedCollocation,
            mistakePayload: {
              type: 'Vocabulary',
              mistake: failedWord,
              correction: matchedCollocation.phrase,
              notes: `Context: ${contextSentence}. Translation: ${matchedCollocation.translation} (${matchedCollocation.type}, CEFR ${matchedCollocation.cefr})`
            }
          }
        });
      } else {
        self.postMessage({
          type: 'SHADOWING_RESULT',
          payload: {
            reqId,
            action: 'LOGGED_WORD_GAP',
            word: failedWord,
            mistakePayload: {
              type: 'Speaking',
              mistake: failedWord,
              correction: failedWord,
              notes: `Failed to shadow word in context: ${contextSentence}`
            }
          }
        });
      }
      break;
    }
    case 'EVALUATE_PEDAGOGICAL_RESPONSE': {
      const { userAnswer, modelAnswer, commonMistakes, targetCollocations, languageCode, reqId } = req.payload;
      
      const normalizedUser = userAnswer.toLowerCase().trim();
      const normalizedModel = modelAnswer.toLowerCase().trim();
      const lang = languageCode || 'en';
      
      let matchedMistake: string | undefined;
      let usedCollocations: string[] = [];
      let feedback = '';
      
      // 1. Check for common mistakes
      if (commonMistakes && commonMistakes.length > 0) {
        for (const mistake of commonMistakes) {
          // Simplistic NLP matching for MVP: Check if mistake keyword exists in user answer.
          // Note: A real NLP system would use semantic similarity or dependency parsing.
          const lowerMistake = mistake.toLowerCase();
          
          // Heuristic: Extract keywords from the mistake description (e.g. 'Omitting "zài"')
          // We look for quoted terms in the mistake string.
          const quoteMatch = lowerMistake.match(/['"]([^'"]+)['"]/);
          if (quoteMatch) {
             const keyword = quoteMatch[1];
             if (normalizedUser.includes(keyword) || (lowerMistake.includes('omitting') && !normalizedUser.includes(keyword))) {
                 matchedMistake = mistake;
                 break;
             }
          }
        }
      }

      // 2. Check for target collocations
      if (targetCollocations && targetCollocations.length > 0) {
        for (const col of targetCollocations) {
          if (normalizedUser.includes(col.toLowerCase())) {
            usedCollocations.push(col);
          }
        }
      }

      // 3. Simple exact or high-overlap match for correctness
      // Use Segmenter for CJK if available, else regex
      let userTokens: string[] = [];
      let modelTokens: string[] = [];
      
      const stripPunctuation = (str: string) => str.replace(/[^\p{L}\p{N}\s]/gu, '');
      const cleanUser = stripPunctuation(normalizedUser);
      const cleanModel = stripPunctuation(normalizedModel);
      
      if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter(lang, { granularity: 'word' });
        userTokens = Array.from(segmenter.segment(cleanUser)).filter(s => s.isWordLike).map(s => s.segment);
        modelTokens = Array.from(segmenter.segment(cleanModel)).filter(s => s.isWordLike).map(s => s.segment);
      } else {
        userTokens = cleanUser.split(/\s+/).filter(Boolean);
        modelTokens = cleanModel.split(/\s+/).filter(Boolean);
      }

      // Remove hedging words for English to increase match rate for Band 9 essays
      if (lang.startsWith('en')) {
        const hedges = new Set(['perhaps', 'arguably', 'ostensibly', 'conceivably', 'probably', 'maybe', 'often', 'sometimes']);
        userTokens = userTokens.filter(t => !hedges.has(t));
        modelTokens = modelTokens.filter(t => !hedges.has(t));
      }

      // Check for Phrasal Verbs & Idioms exact matches (IELTS Band 9)
      let academicScoreBonus = 0;
      if (targetCollocations && targetCollocations.length > 0) {
        for (const col of targetCollocations) {
          if (normalizedUser.includes(col.toLowerCase())) {
            academicScoreBonus += 0.15; // 15% overlap bonus per collocation
          }
        }
      }

      const isExact = normalizedUser === normalizedModel;
      const intersection = userTokens.filter(t => modelTokens.includes(t));
      const overlapRatio = userTokens.length === 0 && modelTokens.length === 0 ? 1 : intersection.length / Math.max(userTokens.length, modelTokens.length);
      
      const finalScore = overlapRatio + academicScoreBonus;
      const isCorrect = isExact || finalScore > 0.70; // Harder threshold for Band 9 / HSK6
      
      if (matchedMistake) {
         feedback = `Chú ý: Lỗi ngữ pháp hoặc cụm từ thường gặp: "${matchedMistake}". `;
      } else if (!isCorrect) {
         feedback = `Gần đúng. Để đạt chuẩn học thuật (Band 9 / HSK6), một cách diễn đạt tốt hơn là: "${modelAnswer}".`;
      } else {
         feedback = 'Rất xuất sắc! Cấu trúc câu và từ vựng chuẩn xác.';
      }
      
      if (usedCollocations.length > 0) {
         feedback += ` Bạn đã dùng thành công các từ vựng học thuật/thành ngữ: ${usedCollocations.join(', ')}.`;
      }

      self.postMessage({
        type: 'EVALUATION_RESULT',
        payload: {
          reqId,
          isCorrect: isCorrect && !matchedMistake,
          feedback,
          matchedMistake,
          usedCollocations
        }
      });
      break;
    }
  }
};
