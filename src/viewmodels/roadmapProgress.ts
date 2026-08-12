type RoadmapLesson = { id: string };
type RoadmapModule = { id: string; lessons: RoadmapLesson[] };

export interface NextLesson {
  moduleId: string;
  lessonId: string;
  path: string;
}

export function resolveNextLesson(modules: RoadmapModule[], completedLessonIds: string[]): NextLesson | null {
  const completed = new Set(completedLessonIds);

  for (const module of modules) {
    const lesson = module.lessons.find((item) => !completed.has(item.id));
    if (lesson) {
      return {
        moduleId: module.id,
        lessonId: lesson.id,
        path: `/app/lesson?id=${encodeURIComponent(module.id)}&lesId=${encodeURIComponent(lesson.id)}`,
      };
    }
  }

  return null;
}
