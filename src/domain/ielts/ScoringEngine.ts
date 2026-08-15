export interface IELTSScoringMetrics {
  wordCount: number;
  uniqueWordCount: number;
  averageSentenceLength: number;
  transitionWordDensity: number;
  academicVocabularyRatio: number;
  complexSentenceRatio: number;
}

export interface IELTSFeedback {
  band: number;
  criteria: {
    ta: { score: number; feedback: string[] };
    cc: { score: number; feedback: string[] };
    lr: { score: number; feedback: string[] };
    gra: { score: number; feedback: string[] };
  };
  overallFeedback: string;
}

const TRANSITION_WORDS = [
  'however', 'therefore', 'moreover', 'furthermore', 'additionally',
  'consequently', 'nevertheless', 'meanwhile', 'subsequently',
  'in contrast', 'on the other hand', 'for instance', 'for example',
  'in conclusion', 'to summarize', 'overall'
];

const ACADEMIC_WORDS = [
  'analyze', 'approach', 'assess', 'assume', 'authority', 'available',
  'benefit', 'concept', 'consist', 'context', 'constitute', 'contract',
  'data', 'define', 'derive', 'distribute', 'economic', 'environment',
  'establish', 'estimate', 'evaluate', 'evidence', 'export', 'factor',
  'financial', 'formula', 'function', 'identify', 'income', 'indicate',
  'individual', 'interpret', 'involve', 'issue', 'labor', 'legal',
  'legislate', 'major', 'method', 'occur', 'percent', 'period', 'policy',
  'principle', 'proceed', 'process', 'require', 'research', 'respond',
  'role', 'section', 'sector', 'significant', 'similar', 'source',
  'specific', 'structure', 'theory', 'variable', 'achieve', 'acquire',
  'administration', 'affect', 'appropriate', 'aspect', 'assist', 'category'
];

export function analyzeTextMetrics(text: string): IELTSScoringMetrics {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const wordCount = words.length;
  const uniqueWords = new Set(words);
  const uniqueWordCount = uniqueWords.size;
  
  const averageSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
  
  let transitionWordCount = 0;
  TRANSITION_WORDS.forEach(tw => {
    const regex = new RegExp(`\\b${tw}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) transitionWordCount += matches.length;
  });
  
  let academicWordCount = 0;
  words.forEach(w => {
    if (ACADEMIC_WORDS.includes(w)) academicWordCount++;
  });
  
  let complexSentenceCount = 0;
  sentences.forEach(s => {
    if (s.includes(',') || s.includes(';') || s.includes(' and ') || s.includes(' but ') || s.includes(' because ')) {
      complexSentenceCount++;
    }
  });

  return {
    wordCount,
    uniqueWordCount,
    averageSentenceLength,
    transitionWordDensity: wordCount > 0 ? transitionWordCount / wordCount : 0,
    academicVocabularyRatio: wordCount > 0 ? academicWordCount / wordCount : 0,
    complexSentenceRatio: sentences.length > 0 ? complexSentenceCount / sentences.length : 0
  };
}

export function calculateBandScore(
  text: string, 
  _taskType: 'Task 1' | 'Task 2',
  expectedWordCount: number
): IELTSFeedback {
  if (!text || text.trim().length === 0) {
    return {
      band: 0,
      criteria: {
        ta: { score: 0, feedback: ['No text provided.'] },
        cc: { score: 0, feedback: ['No text provided.'] },
        lr: { score: 0, feedback: ['No text provided.'] },
        gra: { score: 0, feedback: ['No text provided.'] }
      },
      overallFeedback: 'Please write your essay to receive a score.'
    };
  }

  const metrics = analyzeTextMetrics(text);
  
  // 1. Task Achievement / Task Response (TA)
  let taScore = 5.0;
  const taFeedback: string[] = [];
  
  if (metrics.wordCount < expectedWordCount * 0.8) {
    taScore -= 1.0;
    taFeedback.push(`Significantly under word count. Aim for at least ${expectedWordCount} words.`);
  } else if (metrics.wordCount < expectedWordCount) {
    taScore -= 0.5;
    taFeedback.push(`Slightly under word count. Try to reach ${expectedWordCount} words.`);
  } else {
    taScore = 7.0;
    taFeedback.push('Word count requirement met perfectly.');
  }

  // 2. Coherence and Cohesion (CC)
  let ccScore = 5.0;
  const ccFeedback: string[] = [];
  
  if (metrics.transitionWordDensity > 0.05) {
    ccScore = 7.5;
    ccFeedback.push('Excellent use of transition words for smooth cohesion.');
  } else if (metrics.transitionWordDensity > 0.02) {
    ccScore = 6.5;
    ccFeedback.push('Good use of cohesive devices, but could be more varied.');
  } else {
    ccScore = 5.5;
    ccFeedback.push('Try to use more transition words (however, moreover) to link your ideas.');
  }

  // 3. Lexical Resource (LR)
  let lrScore = 5.0;
  const lrFeedback: string[] = [];
  const ttr = metrics.wordCount > 0 ? metrics.uniqueWordCount / metrics.wordCount : 0;
  
  if (metrics.academicVocabularyRatio > 0.04 && ttr > 0.4) {
    lrScore = 8.0;
    lrFeedback.push('Outstanding academic vocabulary and varied word choice.');
  } else if (metrics.academicVocabularyRatio > 0.02 && ttr > 0.3) {
    lrScore = 6.5;
    lrFeedback.push('Good vocabulary, but could use more advanced academic terms.');
  } else {
    lrScore = 5.5;
    lrFeedback.push('Vocabulary is somewhat basic and repetitive. Try to use more synonyms.');
  }

  // 4. Grammatical Range and Accuracy (GRA)
  let graScore = 5.0;
  const graFeedback: string[] = [];
  
  if (metrics.complexSentenceRatio > 0.6 && metrics.averageSentenceLength > 15) {
    graScore = 7.5;
    graFeedback.push('Strong use of complex sentences and varied grammatical structures.');
  } else if (metrics.complexSentenceRatio > 0.4 && metrics.averageSentenceLength > 10) {
    graScore = 6.5;
    graFeedback.push('Adequate mix of simple and complex sentences.');
  } else {
    graScore = 5.5;
    graFeedback.push('Sentences are too simple or short. Try to combine them using conjunctions.');
  }

  // Cap scores between 0 and 9
  taScore = Math.max(0, Math.min(9, taScore));
  ccScore = Math.max(0, Math.min(9, ccScore));
  lrScore = Math.max(0, Math.min(9, lrScore));
  graScore = Math.max(0, Math.min(9, graScore));

  const overallBand = Math.round((taScore + ccScore + lrScore + graScore) / 4 * 2) / 2;

  let overallFeedback = '';
  if (overallBand >= 7.5) overallFeedback = 'Exceptional work. You are demonstrating advanced academic proficiency.';
  else if (overallBand >= 6.5) overallFeedback = 'Solid essay. Focus on the specific feedback areas to push into the 7.0+ range.';
  else overallFeedback = 'A good start, but significant improvements are needed in structure and vocabulary.';

  return {
    band: overallBand,
    criteria: {
      ta: { score: taScore, feedback: taFeedback },
      cc: { score: ccScore, feedback: ccFeedback },
      lr: { score: lrScore, feedback: lrFeedback },
      gra: { score: graScore, feedback: graFeedback }
    },
    overallFeedback
  };
}
