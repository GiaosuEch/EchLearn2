import {
  JLPT_N5_LESSONS,
  type JLPTN5Lesson,
} from './jlptN5Lessons.ts';
import type { JLPTLevel } from './japaneseCurriculumRegistry.ts';

/**
 * The authored lesson source is deliberately selected before looking up an ID.
 * This prevents a future N4 route from silently rendering an identically named
 * N5 lesson while that level's content has not been registered yet.
 */
export type JapaneseAuthoredLesson = JLPTN5Lesson;

type JapaneseLessonSource = Readonly<Record<string, JapaneseAuthoredLesson>>;

const LESSONS_BY_LEVEL: Readonly<Partial<Record<JLPTLevel, JapaneseLessonSource>>> = {
  N5: JLPT_N5_LESSONS,
};

export function getJapaneseAuthoredLessons(
  level: JLPTLevel,
): readonly JapaneseAuthoredLesson[] {
  return Object.values(LESSONS_BY_LEVEL[level] ?? {});
}

export function getJapaneseAuthoredLesson(
  level: JLPTLevel,
  lessonId: string,
): JapaneseAuthoredLesson | undefined {
  const lesson = LESSONS_BY_LEVEL[level]?.[lessonId];

  return lesson?.level === level ? lesson : undefined;
}

export function getJapaneseContentLessonId(
  progressId: string,
  level: JLPTLevel,
): string | undefined {
  const prefix = `ja:jlpt:${level.toLowerCase()}:`;

  if (!progressId.startsWith(prefix)) {
    return undefined;
  }

  const lessonId = progressId.slice(prefix.length);
  return lessonId.length > 0 ? lessonId : undefined;
}
