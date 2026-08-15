import type { CourseUnit } from './englishCourse.ts';
import { getAllRealworldLessonsForLanguage, type RealworldSurvivalUnit } from './realworldSurvivalData.ts';

const survivalUnits: RealworldSurvivalUnit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export const getRealworldSurvivalCourse = (lang: string): CourseUnit[] => {
  return survivalUnits.flatMap((unit) => {
    const allLessons = getAllRealworldLessonsForLanguage(lang);
    const unitLessons = allLessons.filter((lesson) => lesson.unit === unit);
    
    if (unitLessons.length === 0) {
      return [];
    }

    const firstLesson = unitLessons[0];

    return [{
      id: `${lang}-survival-unit-${unit}`,
      title: `Survival ${unit}: ${firstLesson.titleEn}`,
      description: unitLessons.map((lesson) => lesson.canDoVi).join(' '),
      level: 'Pre-A1–A1',
      lessons: unitLessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.titleEn,
        type: 'speaking',
        referenceId: lesson.id,
      })),
    }];
  });
};
