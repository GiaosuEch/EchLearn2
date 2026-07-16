import type { CourseUnit } from './englishCourse';

// Import auto-generated courses
import { course as enCourse } from './languages/en/course';
import { course as frCourse } from './languages/fr/course';
import { course as deCourse } from './languages/de/course';
import { course as zhCourse } from './languages/zh/course';
import { course as jaCourse } from './languages/ja/course';
import { course as koCourse } from './languages/ko/course';
import { course as esCourse } from './languages/es/course';
import { course as itCourse } from './languages/it/course';
import { course as ptCourse } from './languages/pt/course';
import { course as ruCourse } from './languages/ru/course';
import { course as viCourse } from './languages/vi/course';
import { course as thCourse } from './languages/th/course';
import { course as arCourse } from './languages/ar/course';

export const courseRegistry: Record<string, CourseUnit[]> = {
  'en': enCourse,
  'en-US': enCourse,
  'fr': frCourse,
  'fr-FR': frCourse,
  'de': deCourse,
  'de-DE': deCourse,
  'zh': zhCourse,
  'zh-CN': zhCourse,
  'ja': jaCourse,
  'ja-JP': jaCourse,
  'ko': koCourse,
  'ko-KR': koCourse,
  'es': esCourse,
  'es-ES': esCourse,
  'it': itCourse,
  'it-IT': itCourse,
  'pt': ptCourse,
  'pt-BR': ptCourse,
  'ru': ruCourse,
  'ru-RU': ruCourse,
  'vi': viCourse,
  'vi-VN': viCourse,
  'th': thCourse,
  'th-TH': thCourse,
  'ar': arCourse,
  'ar-SA': arCourse,
};

export function getCourseForLanguage(languageId: string): CourseUnit[] | null {
  return courseRegistry[languageId] || null;
}
