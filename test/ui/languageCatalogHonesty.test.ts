import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { languages } from '../../src/data/languages.ts';
import { AUTHORED_LESSON_COUNTS, authoredLessonCount } from '../../src/data/authoredLessonCounts.ts';
import { generateStandardCourse } from '../../src/curriculum/megaCurriculumGenerator.ts';
import {
  frenchDelfData,
  germanGoetheData,
  spanishDeleData,
  italianCeliData,
  russianTorkiData,
  thaiStandardData,
  arabicStandardData,
  vietnameseVslData,
  portugueseCelpeData,
  ieltsEnglishData,
  hskChineseData,
  topikKoreanData,
} from '../../src/data/curriculums/otherLanguages.ts';

const ALL_DEEP_BANKS = [
  frenchDelfData, germanGoetheData, spanishDeleData, italianCeliData,
  russianTorkiData, thaiStandardData, arabicStandardData, vietnameseVslData,
  portugueseCelpeData, ieltsEnglishData, hskChineseData, topikKoreanData,
];

describe('language catalog honesty', () => {
  it('derives every published lesson total from authored content, never a hardcoded 480', () => {
    for (const lang of languages) {
      assert.equal(
        lang.totalLessons,
        authoredLessonCount(lang.code),
        `${lang.code} must publish its authored count`,
      );
      assert.notEqual(lang.totalLessons, 480, `${lang.code} must not fall back to the fabricated 480`);
      assert.ok(lang.totalLessons > 0, `${lang.code} must expose at least one authored lesson`);
    }
  });

  it('publishes no fabricated social proof (learner counts are gone)', () => {
    for (const lang of languages) {
      assert.equal('totalLearners' in lang, false, `${lang.code} must not carry invented learner totals`);
      assert.equal(lang.skills, undefined, `${lang.code} must not carry invented per-skill lesson totals`);
    }
  });

  it('keeps the count ledger in sync with every supported catalog language', () => {
    for (const lang of languages) {
      assert.ok(lang.code in AUTHORED_LESSON_COUNTS, `${lang.code} missing from AUTHORED_LESSON_COUNTS`);
    }
  });
});

describe('language isolation in the curriculum generator', () => {
  const codes = ['fr', 'de', 'es', 'it', 'pt', 'ru', 'th', 'ar', 'vi', 'zh', 'ko'];

  it('routes every language to its own bank and never leaks English IELTS content', async () => {
    for (const code of codes) {
      const modules = await generateStandardCourse(code, code.toUpperCase());
      assert.ok(modules.length > 0, `${code} must resolve to at least one module`);
      for (const mod of modules) {
        assert.equal(
          mod.level.startsWith('IELTS'), false,
          `${code} leaked the English IELTS bank (level ${mod.level})`,
        );
      }
    }
  });

  it('gives Portuguese real Portuguese levels, not an English fallback', async () => {
    const modules = await generateStandardCourse('pt', 'Portuguese');
    assert.ok(modules.some((m) => m.level.startsWith('PORTUGUESE_')), 'pt must resolve to the Portuguese bank');
  });
});

describe('deep curriculum lesson quality gates', () => {
  it('every authored deep lesson is pedagogically complete across all languages', () => {
    for (const bank of ALL_DEEP_BANKS) {
      for (const level of bank.levels) {
        assert.ok(level.lessons.length > 0, `${bank.languageFamily}/${level.id} has no lessons`);
        for (const lesson of level.lessons) {
          const where = `${bank.languageFamily}/${level.id}/${lesson.title}`;
          assert.ok(lesson.title && lesson.title.length > 5, `${where}: missing title`);
          assert.ok(lesson.officialRubricMapping, `${where}: missing official rubric mapping`);
          assert.ok(lesson.estimatedMinutes >= 10, `${where}: unrealistic duration`);
          assert.ok(
            Array.isArray(lesson.targetCollocations) && lesson.targetCollocations.length >= 3,
            `${where}: needs at least 3 target collocations`,
          );
          assert.ok(lesson.assessmentPrompt, `${where}: missing assessment prompt`);
          assert.ok(lesson.modelAnswer && lesson.modelAnswer.length >= 40, `${where}: model answer too thin`);
          assert.ok(
            Array.isArray(lesson.commonMistakes) && lesson.commonMistakes.length >= 1,
            `${where}: missing common mistakes`,
          );
        }
      }
    }
  });
});
