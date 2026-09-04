/**
 * Authoritative authored-lesson counts per language.
 *
 * The language catalog must never display invented totals. Every number shown
 * to a learner is derived here from the actual authored content modules, so
 * adding or removing content automatically updates the catalog.
 */
import { JAPANESE_LESSON_REGISTRY } from '../curriculum/japaneseCurriculumRegistry.ts';
import { HSK1_LESSONS, HSK1_VOCABULARY_DECKS } from '../curriculum/chineseHsk1Content.ts';
import { KOREAN_TOPIK1_LESSONS, KOREAN_TOPIK1_VOCABULARY_DECKS } from '../curriculum/koreanTopik1Content.ts';
import { englishSurvival30 } from '../curriculum/englishSurvival30.ts';
import {
  hskChineseData,
  topikKoreanData,
  frenchDelfData,
  germanGoetheData,
  spanishDeleData,
  italianCeliData,
  russianTorkiData,
  thaiStandardData,
  arabicStandardData,
  vietnameseVslData,
  portugueseCelpeData,
  ieltsEnglishData,
} from './curriculums/otherLanguages.ts';
import type { DeepCurriculumData } from '../curriculum/deepCurriculumTypes.ts';

function deepLessonCount(data: DeepCurriculumData): number {
  return data.levels.reduce((total, level) => total + level.lessons.length, 0);
}

export const AUTHORED_LESSON_COUNTS: Readonly<Record<string, number>> = {
  en: englishSurvival30.length + deepLessonCount(ieltsEnglishData),
  ja: JAPANESE_LESSON_REGISTRY.length,
  zh: HSK1_LESSONS.length + HSK1_VOCABULARY_DECKS.length + deepLessonCount(hskChineseData),
  ko: KOREAN_TOPIK1_LESSONS.length + KOREAN_TOPIK1_VOCABULARY_DECKS.length + deepLessonCount(topikKoreanData),
  fr: deepLessonCount(frenchDelfData),
  de: deepLessonCount(germanGoetheData),
  es: deepLessonCount(spanishDeleData),
  it: deepLessonCount(italianCeliData),
  pt: deepLessonCount(portugueseCelpeData),
  ru: deepLessonCount(russianTorkiData),
  th: deepLessonCount(thaiStandardData),
  ar: deepLessonCount(arabicStandardData),
  vi: deepLessonCount(vietnameseVslData),
};

export function authoredLessonCount(languageCode: string): number {
  return AUTHORED_LESSON_COUNTS[languageCode.toLowerCase()] ?? 0;
}
