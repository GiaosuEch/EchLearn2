import type { CourseUnit } from './englishCourse.ts';
import { jlptJapaneseData } from '../data/curriculums/jlptJapanese.ts';
import { hskChineseData, topikKoreanData } from '../data/curriculums/otherLanguages.ts';
import type { DeepCurriculumData } from './deepCurriculumTypes.ts';

function slugify(text: string): string {
  return text.toString().toLowerCase()
    .normalize('NFD') // Tách dấu ra khỏi chữ
    .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu vừa tách
    .replace(/đ/g, 'd') // Ngoại lệ: Chữ đ của Tiếng Việt
    // Giữ lại tất cả chữ cái (Bao gồm CJK/Arabic) và số, thay thế phần còn lại thành '_'
    .replace(/[^\p{L}\p{N}]+/gu, '_') 
    .replace(/^_+|_+$/g, ''); // Trim underscores
}

const STANDARD_LEVELS: DeepCurriculumData = {
  languageFamily: 'generic',
  levels: [
    {
      id: 'Beginner',
      name: 'Beginner (Sơ cấp)',
      desc: 'Foundation skills for daily survival.',
      lessons: [
        { title: 'Alphabet & Pronunciation', type: 'vocabulary', officialRubricMapping: 'Generic', estimatedMinutes: 15 },
        { title: 'Basic Greetings', type: 'speaking', officialRubricMapping: 'Generic', estimatedMinutes: 15 },
        { title: 'Numbers & Time', type: 'vocabulary', officialRubricMapping: 'Generic', estimatedMinutes: 15 },
        { title: 'Basic Sentence Structure', type: 'grammar', officialRubricMapping: 'Generic', estimatedMinutes: 20 },
      ]
    },
    {
      id: 'Intermediate',
      name: 'Intermediate (Trung cấp)',
      desc: 'Fluency in general conversational topics.',
      lessons: [
        { title: 'Expressing Opinions', type: 'speaking', officialRubricMapping: 'Generic', estimatedMinutes: 20 },
        { title: 'Past and Future Tenses', type: 'grammar', officialRubricMapping: 'Generic', estimatedMinutes: 25 },
        { title: 'Workplace Vocabulary', type: 'vocabulary', officialRubricMapping: 'Generic', estimatedMinutes: 20 },
      ]
    }
  ]
};

/**
 * Generate highly standard courses mapped to universally recognized, deep curriculum data structures.
 */
export async function generateStandardCourse(languageCode: string, languageName: string): Promise<CourseUnit[]> {
  const modules: CourseUnit[] = [];
  
  let dataBank: DeepCurriculumData;
  
  // Connect to the deep academic data bank
  if (languageCode.startsWith('ja')) {
    dataBank = jlptJapaneseData;
  } else if (languageCode.startsWith('zh')) {
    dataBank = hskChineseData;
  } else if (languageCode.startsWith('ko')) {
    dataBank = topikKoreanData;
  } else if (languageCode.startsWith('en')) {
    try {
      const res = await fetch('/content/ielts.json');
      if (res.ok) {
        dataBank = await res.json();
      } else {
        console.error('Failed to fetch ielts.json, fallback to standard');
        dataBank = STANDARD_LEVELS;
      }
    } catch (e) {
      console.error('Failed to fetch ielts.json', e);
      dataBank = STANDARD_LEVELS;
    }
  } else {
    dataBank = STANDARD_LEVELS;
  }

  for (let mIdx = 0; mIdx < dataBank.levels.length; mIdx++) {
    const levelInfo = dataBank.levels[mIdx];
    
    // Apex Architecture: Unbreakable Identifiers (Slugify)
    const levelSlug = slugify(levelInfo.id);
    
    // Map the deep data back into the CourseUnit schema for the UI
    const mappedLessons = levelInfo.lessons.map((l, lIdx) => ({
      id: `${languageCode}_les_${levelSlug}_${lIdx + 1}`,
      title: `[${l.type.toUpperCase()}] ${l.title}`,
      type: l.type,
      referenceId: `${l.type[0]}_${languageCode}_${levelSlug}_${lIdx + 1}`,
      // Apex Architecture: Academic Metadata Restoration
      metadata: { 
        officialRubricMapping: l.officialRubricMapping, 
        estimatedMinutes: l.estimatedMinutes,
        targetGrammar: l.targetGrammar,
        targetVocabLimit: l.targetVocabLimit,
        examBand: l.examBand,
        examComponent: l.examComponent,
        targetCollocations: l.targetCollocations,
        assessmentPrompt: l.assessmentPrompt,
        modelAnswer: l.modelAnswer,
        commonMistakes: l.commonMistakes
      }
    }));

    modules.push({
      id: `${languageCode}_mod_${levelSlug}`,
      title: `${languageName} - ${levelInfo.name}`,
      description: levelInfo.desc,
      level: levelInfo.id,
      lessons: mappedLessons
    });
  }

  return modules;
}
