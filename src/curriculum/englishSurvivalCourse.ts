import type { CourseUnit } from './englishCourse.ts';
import { englishSurvival30, type EnglishSurvivalUnit } from './englishSurvival30.ts';

const survivalUnits: EnglishSurvivalUnit[] = [1, 2, 3, 4, 5, 6];

export const englishSurvivalCourse: CourseUnit[] = survivalUnits.map((unit) => {
  const unitLessons = englishSurvival30.filter((lesson) => lesson.unit === unit);
  const firstLesson = unitLessons[0];

  return {
    id: `en-survival-unit-${unit}`,
    title: `English Survival ${unit}: ${firstLesson.titleEn}`,
    description: unitLessons.map((lesson) => lesson.canDoVi).join(' '),
    level: 'Pre-A1–A1',
    lessons: unitLessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.titleEn,
      type: 'speaking',
      referenceId: lesson.id,
    })),
  };
});
