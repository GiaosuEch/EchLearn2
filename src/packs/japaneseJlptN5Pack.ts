import {
  getJapaneseLessonProgressId,
  JAPANESE_LESSON_REGISTRY,
  resolveJapanesePathProgress,
} from '../curriculum/japaneseCurriculumRegistry.ts';
import { getJapaneseContentLessonId as resolveJapaneseContentLessonId } from '../curriculum/japaneseLessonContentResolver.ts';
import type { LearningPackDefinition, LearningPathNode } from '../domain/learning/learningPackRegistry.ts';
import type { LessonProgress, SRSItem } from '../stores/srsStore.ts';

export const JAPANESE_JLPT_N5_PACK: LearningPackDefinition = {
  manifest: {
    id: 'ja-jlpt-n5', version: '1.0.0', publicationState: 'published', language: 'ja',
    title: 'Japanese JLPT N5 starter', audience: 'Beginners studying JLPT N5 foundations.',
    entitlement: 'standard', contentDelivery: 'local-static', claim: 'starter-foundations',
    disclosure: 'Local foundation content; not an official JLPT examination.',
    skills: ['kana', 'vocabulary', 'grammar', 'reading'],
    routes: ['/app/japanese/kana', '/app/japanese/vocabulary', '/app/japanese/grammar', '/app/japanese/reading'],
  },
  lessons: JAPANESE_LESSON_REGISTRY.map((lesson) => ({
    id: getJapaneseLessonProgressId(lesson.id, lesson.level), skill: lesson.skill, title: lesson.title,
    objective: lesson.objective, masteryThreshold: lesson.masteryThreshold,
    prerequisites: lesson.prerequisites.map((prerequisite) => ({ lessonId: getJapaneseLessonProgressId(prerequisite.lessonId, lesson.level), minimumPercent: prerequisite.minimumPercent })),
  })),
  routes: [
    { path: '/app/japanese/kana', skill: 'kana' }, { path: '/app/japanese/vocabulary', skill: 'vocabulary' },
    { path: '/app/japanese/grammar', skill: 'grammar' }, { path: '/app/japanese/reading', skill: 'reading' },
  ],
};

export function resolveJapaneseJlptN5PackPath(items: Readonly<Record<string, SRSItem>>, lessonProgress: Readonly<Record<string, LessonProgress>>): LearningPathNode[] {
  return resolveJapanesePathProgress({ level: 'N5', reviewItems: items, lessonProgress }).map((node) => ({ id: getJapaneseLessonProgressId(node.id, node.level), skill: node.type, progress: node.progress, status: node.status }));
}

export function getJapaneseContentLessonId(packLessonId: string): string | undefined {
  return resolveJapaneseContentLessonId(packLessonId, 'N5');
}
