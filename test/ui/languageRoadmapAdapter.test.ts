import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getAuthoredRoadmapUnits } from '../../src/curriculum/roadmap/languageRoadmapAdapter.ts';
import { getProductPackForLanguage } from '../../src/curriculum/courseRegistry.ts';

describe('languageRoadmapAdapter', () => {
  test('getAuthoredRoadmapUnits - parses standard product pack units', async () => {
    const units = await getAuthoredRoadmapUnits('ja');
    assert.ok(units.length > 0, 'Should return units for Japanese');
    
    const survivalUnit = units.find(u => u.id.includes('survival'));
    if (survivalUnit) {
      assert.strictEqual(survivalUnit.lessons.length > 0, true, 'Survival unit should have lessons');
    }

    const n5Unit = units.find(u => u.id === 'ja-n5-kana' || u.id === 'n5-kana');
    if (n5Unit) {
      assert.ok(n5Unit.lessons.length > 0, 'N5 Kana unit should have lessons');
    }
  });

  test('getAuthoredRoadmapUnits - no survival unit duplication', async () => {
    const units = await getAuthoredRoadmapUnits('ja');
    const survivalCount = units.filter(u => u.id === 'ja-survival-1' || u.title.includes('Nhật Bản Sinh Tồn')).length;
    // Survival should only appear once (from courseRegistry)
    assert.strictEqual(survivalCount <= 1, true, 'Survival unit should not be duplicated');
  });

  test('getProductPackForLanguage - no survival unit duplication', async () => {
    // We must test getProductPackForLanguage because courseRegistry merges survival
    const pack = await getProductPackForLanguage('ja');
    const survivalCount = pack.units.filter(u => u.id === 'ja-survival-unit-1' || u.title.includes('Survival 1')).length;
    // Survival should only appear once (from courseRegistry)
    assert.strictEqual(survivalCount, 1, `Expected exactly 1 Survival unit, found ${survivalCount}`);
  });

  test('getAuthoredRoadmapUnits - full Japanese registry coverage', async () => {
    const units = await getAuthoredRoadmapUnits('ja');
    const allLessonIds = new Set(units.flatMap(u => u.lessons.map(l => l.id)));
    
    // Crosswalk: Do not duplicate legacy lessons that have been fully ported to the new N5 course.
    const JAPANESE_REGISTRY_CROSSWALK: Record<string, string> = {
      'kana-1': 'ja-n5-u0-l1-hiragana'
    };

    const { JAPANESE_LESSON_REGISTRY } = await import('../../src/curriculum/japaneseCurriculumRegistry.ts');
    
    for (const legacyLesson of JAPANESE_LESSON_REGISTRY) {
      const isMapped = !!JAPANESE_REGISTRY_CROSSWALK[legacyLesson.id];
      const isIncluded = allLessonIds.has(legacyLesson.id);
      
      assert.ok(isMapped || isIncluded, `Legacy lesson ${legacyLesson.id} must be in the roadmap or explicitly mapped in the crosswalk`);
    }
  });

  test('getProductPackForLanguage - no empty units', async () => {
    for (const lang of ['ja', 'zh', 'ko', 'en']) {
      const pack = await getProductPackForLanguage(lang);
      for (const unit of pack.units) {
        assert.ok(unit.lessons.length > 0, `Unit ${unit.id} in language ${lang} has no lessons. Empty units must not be rendered.`);
      }
    }
  });
});
