import test from 'node:test';
import assert from 'node:assert/strict';
import { generateExercisesForModule } from '../../src/curriculum/exerciseGenerator.ts';
import { canUseEntitlementLanguages } from '../../src/services/entitlementService.ts';

const ALL_LANGUAGES = ['en', 'fr', 'de', 'zh', 'ja', 'ko', 'es', 'it', 'pt', 'ru', 'vi', 'th', 'ar'] as const;

const dummyT = (key: string, options?: Record<string, unknown>) => {
  return options?.defaultValue ? String(options.defaultValue) : key;
};

test('exercise generator produces clean, high-quality options for ALL 13 languages', async () => {
  for (const lang of ALL_LANGUAGES) {
    const moduleId = `${lang}_mod_1`;
    const exercises = await generateExercisesForModule(moduleId, lang, 'vi', dummyT, `${lang}_les_1`);

    assert.ok(Array.isArray(exercises), `Exercises for ${lang} must be an array`);
    
    for (const ex of exercises) {
      assert.ok(ex.question, `Exercise question for ${lang} must not be empty`);
      assert.ok(ex.correctAnswer, `Correct answer for ${lang} must not be empty`);

      if (ex.options && ex.options.length > 0) {
        assert.equal(ex.options.length, 4, `Exercise for ${lang} should have exactly 4 options`);

        for (const opt of ex.options) {
          const str = String(opt).trim();
          assert.ok(str.length > 0, `Option in ${lang} exercise must not be empty`);

          // Verify no generic junk or foreign script leaks when learning with Vietnamese native language
          const hasForeignScript = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af\u0e00-\u0e7f\u0600-\u06ff]/.test(str);
          assert.equal(
            hasForeignScript,
            false,
            `Option "${str}" in ${lang} lesson contains foreign script leaked into Vietnamese native options!`,
          );

          const isGenericJunk = /일반적인|commun|thông thường|thực hiện hành động|che đậy|hành động giặt|placeholder|missing meaning/i.test(str);
          assert.equal(
            isGenericJunk,
            false,
            `Option "${str}" in ${lang} lesson contains generic junk text!`,
          );
        }
      }
    }
  }
});

test('entitlement policy allows admin access to ALL 13 languages while restricting Free tier', () => {
  // Free tier plan permits only starter languages ['en', 'zh', 'ja']
  assert.equal(canUseEntitlementLanguages('free', ['en', 'zh', 'ja']), true);
  assert.equal(canUseEntitlementLanguages('free', ['en', 'ko']), false);
  assert.equal(canUseEntitlementLanguages('free', ['en', 'fr']), false);

  // PRO plan allows all languages
  for (const lang of ALL_LANGUAGES) {
    assert.equal(canUseEntitlementLanguages('pro', [lang]), true);
  }
  assert.equal(canUseEntitlementLanguages('pro', [...ALL_LANGUAGES]), true);
});
