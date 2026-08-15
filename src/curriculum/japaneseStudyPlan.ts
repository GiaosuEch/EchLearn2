import type { JapanesePathNode } from './japaneseCurriculumRegistry.ts';

export interface JapaneseStudyPlan {
  dueReviewCount: number;
  dueReviewHref: string | null;
  nextLesson: { id: string; title: string; href: string; progress: number } | null;
}

function getJapaneseLessonIdFromReviewItemId(reviewItemId: string): string | null {
  if (reviewItemId.startsWith('ja_v_')) return 'vocab-1';

  const [language, curriculum, level, lessonId] = reviewItemId.split(':');
  return language === 'ja' && curriculum === 'jlpt' && level === 'n5' && lessonId ? lessonId : null;
}

function getReviewHref(reviewItemIds: readonly string[], nodes: readonly JapanesePathNode[]): string | null {
  for (const reviewItemId of reviewItemIds) {
    const lessonId = getJapaneseLessonIdFromReviewItemId(reviewItemId);
    const node = lessonId ? nodes.find((candidate) => candidate.id === lessonId && candidate.status !== 'locked') : undefined;
    if (node) return `/app/japanese/${node.type}?level=${node.level}&lesson=${node.id}&review=${encodeURIComponent(reviewItemId)}`;
  }
  return null;
}

export function createJapaneseStudyPlan(input: Readonly<{ dueReviewItemIds: readonly string[]; nodes: readonly JapanesePathNode[] }>): JapaneseStudyPlan {
  const next = input.nodes.find((node) => node.status === 'active');
  return {
    dueReviewCount: input.dueReviewItemIds.length,
    dueReviewHref: getReviewHref(input.dueReviewItemIds, input.nodes),
    nextLesson: next ? {
      id: next.id,
      title: next.title,
      href: `/app/japanese/${next.type}?level=${next.level}&lesson=${next.id}`,
      progress: next.progress,
    } : null,
  };
}
