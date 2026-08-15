import { JAPANESE_N5_COURSE } from '../courses/japaneseN5Course.ts';
import { CHINESE_HSK_REGISTRY } from '../chineseHskRegistry.ts';
import { KOREAN_TOPIK1_REGISTRY } from '../koreanTopikRegistry.ts';

import type { CourseUnit } from '../englishCourse.ts';

/**
 * Maps authored lesson data from different source registries into the standard
 * CourseUnit[] format expected by the CourseRoadmapPage.
 */
export async function getAuthoredRoadmapUnits(lang: string): Promise<CourseUnit[]> {
  const units: CourseUnit[] = [];



  // --- JAPANESE (N5) ---
  if (lang.startsWith('ja')) {
    JAPANESE_N5_COURSE.units.forEach((unit) => {
      units.push({
        id: unit.id,
        title: unit.title,
        description: unit.theme,
        level: 'N5',
        lessons: unit.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          type: (lesson.id.includes('vocab') || lesson.id.includes('kanji') || lesson.id.includes('hiragana') || lesson.id.includes('katakana')) ? 'vocabulary' as const :
                (lesson.id.includes('grammar')) ? 'grammar' as const :
                (lesson.id.includes('listening') || lesson.id.includes('speaking')) ? 'speaking' as const :
                'reading' as const,
          referenceId: lesson.id,
          metadata: { estimatedMinutes: lesson.estimatedMinutes }
        }))
      });
    });

    // Crosswalk: Do not duplicate legacy lessons that have been fully ported to the new N5 course.
    const JAPANESE_REGISTRY_CROSSWALK: Record<string, string> = {
      'kana-1': 'ja-n5-u0-l1-hiragana'
    };
    
    // Add remaining legacy lessons as a supplementary unit
    const legacyLessons = (await import('../japaneseCurriculumRegistry.ts')).JAPANESE_LESSON_REGISTRY
      .filter(l => !JAPANESE_REGISTRY_CROSSWALK[l.id]);

    if (legacyLessons.length > 0) {
      units.push({
        id: 'ja-n5-legacy',
        title: 'JLPT N5 - Bài học bổ trợ (Cũ)',
        description: 'Các bài học ngữ pháp, từ vựng và đọc hiểu từ giáo trình trước đây.',
        level: 'N5',
        lessons: legacyLessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          type: lesson.skill === 'kana' || lesson.skill === 'vocabulary' ? 'vocabulary' : lesson.skill as any,
          referenceId: lesson.id,
          metadata: { estimatedMinutes: lesson.estimatedMinutes }
        }))
      });
    }
  }

  // --- CHINESE (HSK1) ---
  if (lang.startsWith('zh')) {
    units.push({
      id: 'zh-hsk1-u1',
      title: 'HSK 1 - Lộ trình chính',
      description: 'Toàn bộ nội dung học HSK 1 nền tảng.',
      level: 'HSK1',
      lessons: CHINESE_HSK_REGISTRY.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        type: lesson.skill === 'pronunciation' ? 'speaking' : lesson.skill as any,
        referenceId: lesson.id,
        metadata: { estimatedMinutes: lesson.estimatedMinutes }
      }))
    });
  }

  // --- KOREAN (TOPIK1) ---
  if (lang.startsWith('ko')) {
    units.push({
      id: 'ko-topik1-u1',
      title: 'TOPIK 1 - Lộ trình chính',
      description: 'Toàn bộ nội dung học TOPIK 1 nền tảng.',
      level: 'TOPIK1',
      lessons: KOREAN_TOPIK1_REGISTRY.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        type: (lesson.skill === 'hangul' || lesson.skill === 'pronunciation') ? 'speaking' : lesson.skill as any,
        referenceId: lesson.id,
        metadata: { estimatedMinutes: lesson.estimatedMinutes }
      }))
    });
  }

  return units;
}
