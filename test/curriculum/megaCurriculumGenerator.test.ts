import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateStandardCourse } from '../../src/curriculum/megaCurriculumGenerator.ts';

describe('megaCurriculumGenerator - 13 Language Multi-Track Course Verification', () => {
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ko', name: 'Korean' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'es', name: 'Spanish' },
    { code: 'it', name: 'Italian' },
    { code: 'ru', name: 'Russian' },
    { code: 'th', name: 'Thai' },
    { code: 'ar', name: 'Arabic' },
    { code: 'vi', name: 'Vietnamese' }
  ];

  for (const lang of languages) {
    it(`should generate deep multi-level course for ${lang.name} (${lang.code})`, async () => {
      const course = await generateStandardCourse(lang.code, lang.name);
      assert.ok(course.length > 0, `Course for ${lang.name} must have at least 1 module`);
      
      const firstModule = course[0];
      assert.ok(firstModule.lessons.length > 0, `Module 1 for ${lang.name} must have lessons`);
      
      // Verify lesson structure and metadata
      const firstLesson = firstModule.lessons[0];
      assert.ok(firstLesson.id.startsWith(lang.code), `Lesson ID should start with language code ${lang.code}`);
      assert.ok(firstLesson.title.length > 0, `Lesson title must not be empty`);
      assert.ok(firstLesson.metadata, `Lesson metadata must be present`);
    });
  }
});
