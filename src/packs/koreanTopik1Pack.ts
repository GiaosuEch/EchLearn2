import {
  validateProductPackManifest,
  type ProductPackManifest,
} from '../domain/learning/productPackManifest.ts';
import { KOREAN_TOPIK1_REGISTRY, resolveKoreanTopikPath } from '../curriculum/koreanTopikRegistry.ts';
import type { LearningPackDefinition, LearningPathNode } from '../domain/learning/learningPackRegistry.ts';
import type { LessonProgress, SRSItem } from '../stores/srsStore.ts';

export const KOREAN_TOPIK1_PACK = Object.freeze({
  id: 'ko-topik1-starter',
  version: '1.0.0',
  publicationState: 'published',
  language: 'ko',
  title: 'Tiếng Hàn: Nền tảng TOPIK I',
  audience: 'Người mới bắt đầu học Hangul và giao tiếp nền tảng.',
  entitlement: 'standard',
  contentDelivery: 'local-static',
  claim: 'starter-foundations',
  disclosure: 'Đây là bộ nền tảng, không phải coverage đầy đủ cho kỳ thi TOPIK I.',
  skills: ['hangul', 'vocabulary', 'grammar', 'reading', 'pronunciation'],
  routes: [
    '/app/korean',
    '/app/korean/hangul',
    '/app/korean/vocabulary',
    '/app/korean/grammar',
    '/app/korean/reading',
    '/app/korean/pronunciation',
  ],
} satisfies ProductPackManifest);

export const KOREAN_TOPIK1_DEFINITION: LearningPackDefinition = {
  manifest: KOREAN_TOPIK1_PACK,
  lessons: KOREAN_TOPIK1_REGISTRY.map((lesson) => ({
    id: lesson.id,
    skill: lesson.skill,
    title: lesson.title,
    objective: lesson.objective,
    masteryThreshold: lesson.masteryThreshold,
    prerequisites: lesson.prerequisites,
    reviewItemIds: lesson.reviewItemIds,
  })),
  routes: [
    { path: '/app/korean/hangul', skill: 'hangul' },
    { path: '/app/korean/vocabulary', skill: 'vocabulary' },
    { path: '/app/korean/grammar', skill: 'grammar' },
    { path: '/app/korean/reading', skill: 'reading' },
    { path: '/app/korean/pronunciation', skill: 'pronunciation' },
  ],
};

export function resolveKoreanTopik1PackPath(items: Readonly<Record<string, SRSItem>>, lessonProgress: Readonly<Record<string, LessonProgress>>): LearningPathNode[] {
  return resolveKoreanTopikPath({ reviewItems: items, lessonProgress }).map((node) => ({ id: node.id, skill: node.type, progress: node.progress, status: node.status }));
}

const packs = new Map<string, ProductPackManifest>([[KOREAN_TOPIK1_PACK.id, KOREAN_TOPIK1_PACK]]);

export { validateProductPackManifest };

export function getRegisteredProductPack(id: string): ProductPackManifest | undefined {
  return packs.get(id);
}
