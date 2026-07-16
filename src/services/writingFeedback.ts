// Writing Feedback Mock Service
// Replace with OpenAI/Claude API for real grading

import type { WritingFeedback } from '../types';

export async function analyzeWriting(text: string, taskType: string): Promise<WritingFeedback> {
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;
  const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);

  // Mock scoring based on text characteristics
  const lengthBonus = Math.min(wordCount / 250, 1) * 10;
  const complexityBonus = Math.min(avgWordsPerSentence / 15, 1) * 10;
  const baseScore = 5.0;

  const taskScore = Math.min(9, baseScore + lengthBonus * 0.3 + Math.random() * 1.5);
  const coherenceScore = Math.min(9, baseScore + complexityBonus * 0.2 + Math.random() * 1.5);
  const lexicalScore = Math.min(9, baseScore + Math.random() * 2);
  const grammarScore = Math.min(9, baseScore + Math.random() * 1.5);

  const roundToHalf = (n: number) => Math.round(n * 2) / 2;
  const overallBand = roundToHalf((taskScore + coherenceScore + lexicalScore + grammarScore) / 4);

  const isTask1 = taskType.includes('task1');

  return {
    taskResponse: {
      score: roundToHalf(taskScore),
      comments: isTask1
        ? `Your response ${wordCount >= 150 ? 'meets' : 'does not meet'} the minimum word count. ${taskScore >= 6 ? 'Key features are well identified.' : 'Try to identify more key features and trends.'}`
        : `Your essay ${wordCount >= 250 ? 'meets' : 'does not meet'} the minimum word count. ${taskScore >= 6 ? 'You address the task well with a clear position.' : 'Try to develop your arguments more fully and take a clearer position.'}`,
    },
    coherenceCohesion: {
      score: roundToHalf(coherenceScore),
      comments: coherenceScore >= 6
        ? 'Ideas are generally well organized with clear progression. Good use of cohesive devices.'
        : 'Work on organizing your ideas more clearly. Use linking words like "however", "furthermore", "in contrast".',
    },
    lexicalResource: {
      score: roundToHalf(lexicalScore),
      comments: lexicalScore >= 6
        ? 'Good range of vocabulary with some less common items. Minor errors do not impede communication.'
        : 'Try to use more varied vocabulary. Avoid repeating the same words. Use synonyms and academic vocabulary.',
    },
    grammaticalRange: {
      score: roundToHalf(grammarScore),
      comments: grammarScore >= 6
        ? 'Mix of simple and complex sentence structures. Most sentences are error-free.'
        : 'Try to use more complex sentence structures. Watch out for subject-verb agreement and tense consistency.',
    },
    overallBand,
    strengths: [
      taskScore >= 6 ? 'Clear task response with relevant ideas' : 'Attempts to address the task',
      coherenceScore >= 6 ? 'Logical organization of ideas' : 'Basic paragraph structure present',
      lexicalScore >= 6 ? 'Good vocabulary range' : 'Adequate vocabulary for the topic',
    ],
    improvements: [
      'Use more complex sentence structures to boost grammatical range',
      'Include specific examples and evidence to support arguments',
      'Use topic sentences at the start of each paragraph',
      'Proofread for spelling and punctuation errors',
    ],
    rewriteSuggestion: `Here is a suggested improvement for your opening paragraph:\n\n"${
      isTask1
        ? 'The given [chart/graph/table] illustrates [key information]. Overall, it is clearly evident that [main trend]. The most notable feature is [significant detail].'
        : 'In contemporary society, [topic] has become a subject of considerable debate. While some argue that [view 1], others contend that [view 2]. This essay will examine both perspectives before presenting my own viewpoint.'
    }"`,
    vocabularyUpgrades: [
      { original: 'good', suggested: 'beneficial / advantageous', reason: 'More academic and precise' },
      { original: 'bad', suggested: 'detrimental / adverse', reason: 'Higher-level vocabulary' },
      { original: 'a lot of', suggested: 'a considerable number of / numerous', reason: 'More formal register' },
      { original: 'important', suggested: 'crucial / paramount / significant', reason: 'Varied vocabulary shows lexical range' },
      { original: 'think', suggested: 'believe / contend / maintain', reason: 'Academic alternatives' },
    ],
    grammarCorrections: [
      { original: 'informations', corrected: 'information', rule: '"Information" is uncountable — no plural form' },
      { original: 'peoples', corrected: 'people', rule: '"People" is already plural (except when meaning "ethnic groups")' },
      { original: 'more better', corrected: 'better / much better', rule: 'Do not use "more" with comparative adjectives ending in -er' },
    ],
  };
}

export async function getStudyPlan(targetBand: number, currentBand: number, weeksAvailable: number) {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const bandGap = targetBand - currentBand;
  const weeklyHours = bandGap > 2 ? 15 : bandGap > 1 ? 10 : 7;

  return {
    targetBand,
    currentBand,
    estimatedWeeks: Math.ceil(bandGap * 6),
    weeklyHours,
    dailyPlan: {
      listening: Math.round(weeklyHours * 0.25 / 7 * 60),
      reading: Math.round(weeklyHours * 0.25 / 7 * 60),
      writing: Math.round(weeklyHours * 0.3 / 7 * 60),
      speaking: Math.round(weeklyHours * 0.2 / 7 * 60),
    },
    weeklyGoals: [
      `Complete ${Math.ceil(weeksAvailable / 2)} mock tests`,
      `Write ${Math.ceil(weeklyHours / 3)} essays per week`,
      `Practice speaking ${Math.ceil(weeklyHours / 5)} times per week`,
      `Learn ${Math.ceil(weeklyHours * 3)} new vocabulary words per week`,
    ],
    focusAreas: bandGap > 1.5
      ? ['Vocabulary building', 'Grammar fundamentals', 'Basic writing structure', 'Listening comprehension']
      : ['Advanced vocabulary', 'Complex grammar', 'Essay coherence', 'Fluency improvement'],
  };
}
