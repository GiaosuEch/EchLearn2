import { CHINESE_HSK_REGISTRY, resolveChineseHskPath } from '../curriculum/chineseHskRegistry.ts';
import type { LearningPackDefinition, LearningPathNode } from '../domain/learning/learningPackRegistry.ts';
import type { LessonProgress, SRSItem } from '../stores/srsStore.ts';

export const CHINESE_HSK1_PACK: LearningPackDefinition = {
  manifest: {
    id: 'zh-hsk1', version: '1.0.0', publicationState: 'published', language: 'zh',
    title: 'Chinese HSK 1 starter', audience: 'Beginners studying HSK 1 foundations.',
    entitlement: 'standard', contentDelivery: 'local-static', claim: 'starter-foundations',
    disclosure: 'Local foundation content; not an official HSK examination.',
    skills: ['vocabulary', 'grammar', 'reading', 'pronunciation'],
    routes: ['/app/chinese/vocabulary', '/app/chinese/grammar', '/app/chinese/reading', '/app/chinese/pronunciation'],
  },
  lessons: CHINESE_HSK_REGISTRY.map((lesson) => ({ id: lesson.id, skill: lesson.skill, title: lesson.title, objective: lesson.objective, masteryThreshold: lesson.masteryThreshold, prerequisites: lesson.prerequisites, reviewItemIds: lesson.reviewItemIds })),
  routes: [
    { path: '/app/chinese/vocabulary', skill: 'vocabulary' }, { path: '/app/chinese/grammar', skill: 'grammar' },
    { path: '/app/chinese/reading', skill: 'reading' }, { path: '/app/chinese/pronunciation', skill: 'pronunciation' },
  ],
};

export function resolveChineseHsk1PackPath(items: Readonly<Record<string, SRSItem>>, lessonProgress: Readonly<Record<string, LessonProgress>>): LearningPathNode[] {
  return resolveChineseHskPath({ level: 'HSK1', reviewItems: items, lessonProgress }).map((node) => ({ id: node.id, skill: node.type, progress: node.progress, status: node.status }));
}
