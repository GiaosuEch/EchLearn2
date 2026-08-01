import type { CourseUnit } from './englishCourse';
import { generateMegaCourse } from './megaCurriculumGenerator';

// Generate 200-Lesson courses for all 13 supported languages
export const enCourse = generateMegaCourse('en', 'Tiếng Anh');
export const frCourse = generateMegaCourse('fr', 'Tiếng Pháp');
export const deCourse = generateMegaCourse('de', 'Tiếng Đức');
export const zhCourse = generateMegaCourse('zh', 'Tiếng Trung');
export const jaCourse = generateMegaCourse('ja', 'Tiếng Nhật');
export const koCourse = generateMegaCourse('ko', 'Tiếng Hàn');
export const esCourse = generateMegaCourse('es', 'Tiếng Tây Ban Nha');
export const itCourse = generateMegaCourse('it', 'Tiếng Ý');
export const ptCourse = generateMegaCourse('pt', 'Tiếng Bồ Đào Nha');
export const ruCourse = generateMegaCourse('ru', 'Tiếng Nga');
export const viCourse = generateMegaCourse('vi', 'Tiếng Việt');
export const thCourse = generateMegaCourse('th', 'Tiếng Thái');
export const arCourse = generateMegaCourse('ar', 'Tiếng Ả Rập');

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
  return courseRegistry[languageId] || enCourse;
}
