import {
  validateProductPackManifest,
  type ProductPackManifest,
} from './productPackManifest.ts';

export type LearningLessonStatus = 'locked' | 'active' | 'completed';

export interface LearningLessonPrerequisite {
  lessonId: string;
  minimumPercent: number;
}

export interface LearningLessonDescriptor {
  id: string;
  skill: string;
  title: string;
  objective: string;
  masteryThreshold: number;
  prerequisites: readonly LearningLessonPrerequisite[];
  reviewItemIds?: readonly string[];
}

export interface LearningPathNode {
  id: string;
  skill: string;
  progress: number;
  status: LearningLessonStatus;
}

export interface LearningPackRoute {
  path: string;
  skill: string;
}

export interface LearningPackDefinition {
  manifest: ProductPackManifest;
  lessons: readonly LearningLessonDescriptor[];
  routes: readonly LearningPackRoute[];
}

export type LessonRouteResolution =
  | { kind: 'ready'; pack: LearningPackDefinition; lesson: LearningLessonDescriptor }
  | { kind: 'invalid'; reason: 'unknown-route' | 'invalid-lesson' | 'locked-lesson' };

export class LearningPackRegistry {
  private readonly packs: readonly LearningPackDefinition[];

  public constructor(packs: readonly LearningPackDefinition[]) {
    this.packs = packs;
  }

  public getPackForRoute(path: string): LearningPackDefinition | undefined {
    return this.packs.find((pack) => pack.manifest.publicationState === 'published' && pack.routes.some((route) => route.path === path));
  }

  public resolveLessonRoute(
    path: string,
    requestedLessonId: string | null,
    nodes: readonly LearningPathNode[],
  ): LessonRouteResolution {
    const pack = this.getPackForRoute(path);
    if (!pack) return { kind: 'invalid', reason: 'unknown-route' };

    const route = pack.routes.find((candidate) => candidate.path === path);
    if (!route) return { kind: 'invalid', reason: 'unknown-route' };

    const lesson = requestedLessonId
      ? pack.lessons.find((candidate) => candidate.id === requestedLessonId)
      : pack.lessons.find((candidate) => candidate.skill === route.skill && nodes.some((node) => node.id === candidate.id && node.status !== 'locked'));

    if (!lesson || lesson.skill !== route.skill) return { kind: 'invalid', reason: 'invalid-lesson' };

    const node = nodes.find((candidate) => candidate.id === lesson.id);
    if (!node || node.status === 'locked') return { kind: 'invalid', reason: 'locked-lesson' };

    return { kind: 'ready', pack, lesson };
  }

  public validate(): string[] {
    const issues: string[] = [];
    const packIds = new Set<string>();
    const routeOwners = new Map<string, string>();

    for (const pack of this.packs) {
      if (packIds.has(pack.manifest.id)) issues.push(`duplicate pack id: ${pack.manifest.id}`);
      packIds.add(pack.manifest.id);
      issues.push(...validateProductPackManifest(pack.manifest));

      const lessonIds = new Set<string>();
      const reviewItemIds = new Set<string>();
      for (const lesson of pack.lessons) {
        if (lessonIds.has(lesson.id)) issues.push(`duplicate lesson id: ${pack.manifest.id}:${lesson.id}`);
        lessonIds.add(lesson.id);
        if (!lesson.id.includes(':')) issues.push(`non-namespaced lesson id: ${pack.manifest.id}:${lesson.id}`);
        if (!lesson.skill.trim() || !lesson.title.trim() || !lesson.objective.trim()) issues.push(`missing lesson metadata: ${pack.manifest.id}:${lesson.id}`);
        if (lesson.masteryThreshold < 1 || lesson.masteryThreshold > 100) issues.push(`invalid mastery threshold: ${pack.manifest.id}:${lesson.id}`);
        for (const reviewItemId of lesson.reviewItemIds ?? []) {
          if (reviewItemIds.has(reviewItemId)) issues.push(`duplicate review item: ${pack.manifest.id}:${reviewItemId}`);
          reviewItemIds.add(reviewItemId);
        }
      }

      for (const route of pack.routes) {
        const owner = routeOwners.get(route.path);
        if (owner) issues.push(`duplicate route: ${route.path} (${owner}, ${pack.manifest.id})`);
        routeOwners.set(route.path, pack.manifest.id);
        if (!pack.manifest.routes.includes(route.path)) issues.push(`unmanifested route: ${pack.manifest.id}:${route.path}`);
        if (!pack.lessons.some((lesson) => lesson.skill === route.skill)) issues.push(`route without lesson skill: ${pack.manifest.id}:${route.path}`);
      }

      issues.push(...validatePrerequisites(pack));
    }

    return [...new Set(issues)];
  }
}

function validatePrerequisites(pack: LearningPackDefinition): string[] {
  const issues: string[] = [];
  const lessonsById = new Map(pack.lessons.map((lesson) => [lesson.id, lesson]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (lessonId: string): void => {
    if (visiting.has(lessonId)) {
      issues.push(`prerequisite cycle: ${pack.manifest.id}:${lessonId}`);
      return;
    }
    if (visited.has(lessonId)) return;
    const lesson = lessonsById.get(lessonId);
    if (!lesson) return;
    visiting.add(lessonId);
    for (const prerequisite of lesson.prerequisites) {
      if (!lessonsById.has(prerequisite.lessonId)) issues.push(`missing prerequisite: ${pack.manifest.id}:${lesson.id} -> ${prerequisite.lessonId}`);
      if (prerequisite.minimumPercent < 1 || prerequisite.minimumPercent > 100) issues.push(`invalid prerequisite threshold: ${pack.manifest.id}:${lesson.id}`);
      visit(prerequisite.lessonId);
    }
    visiting.delete(lessonId);
    visited.add(lessonId);
  };

  pack.lessons.forEach((lesson) => visit(lesson.id));
  return issues;
}
