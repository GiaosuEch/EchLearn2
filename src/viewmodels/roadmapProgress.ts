type RoadmapLesson = { readonly id: string };
type RoadmapModule = { readonly id: string; readonly lessons: readonly RoadmapLesson[] };

export interface NextLesson {
  moduleId: string;
  lessonId: string;
  path: string;
}

export function resolveNextLesson(modules: readonly RoadmapModule[], completedLessonIds: string[]): NextLesson | null {
  const completed = new Set(completedLessonIds);

  for (const module of modules) {
    const lesson = module.lessons.find((item) => !completed.has(item.id));
    if (lesson) {
      const isSurvival = lesson.id.includes('survival');
      return {
        moduleId: module.id,
        lessonId: lesson.id,
        path: isSurvival 
          ? `/app/survival?lesson=${encodeURIComponent(lesson.id)}`
          : `/app/lesson?id=${encodeURIComponent(module.id)}&lesId=${encodeURIComponent(lesson.id)}`,
      };
    }
  }

  return null;
}
