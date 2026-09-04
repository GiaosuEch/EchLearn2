import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';

import { VocabularyEngine } from '../../src/services/vocabularyEngine.ts';

const root = path.resolve(import.meta.dirname, '../..');
const vocabDir = path.join(root, 'public', 'data', 'vocabulary');

const LANGUAGES = ['en', 'fr', 'de', 'zh', 'ja', 'ko', 'es', 'it', 'pt', 'ru', 'vi', 'th', 'ar'];

const TEMPLATE_JUNK = [
  /^to perform the action of/i,
  /^the quality of being/i,
  /^một món ăn/i,
  /^để thực hiện/i,
  /^đặc điểm của việc/i,
  /^một khái niệm/i,
];

function isSelfReferential(word: string, ...meanings: Array<string | undefined>): boolean {
  const target = word.trim().toLowerCase();
  const genuine = meanings.some(candidate => {
    const text = String(candidate || '').trim().toLowerCase();
    if (!text) return false;
    const stripped = text.replace(/^[^:]{2,40}:\s*/, '');
    if (stripped === target || text === target) return false;
    if (TEMPLATE_JUNK.some(pattern => pattern.test(text))) return false;
    return true;
  });
  return !genuine;
}

describe('vocabulary bank self-meaning filter', () => {
  it('drops every self-referential meaning record for all languages', () => {
    for (const lang of LANGUAGES) {
      const file = path.join(vocabDir, `${lang}.json`);
      assert.ok(fs.existsSync(file), `${lang}.json must exist`);
      const seed = JSON.parse(fs.readFileSync(file, 'utf8'));
      const bank = VocabularyEngine.getAuthenticBank(lang, seed);

      assert.ok(bank.length > 0, `${lang} bank must not be empty after filtering`);

      for (const item of bank) {
        const word = String(item.word || item.nativeScript || '');
        assert.equal(
          isSelfReferential(word, item.meaning, item.translation, item.meaningVietnamese),
          false,
          `${lang}: "${word}" still carries a self-referential meaning (${item.meaning} / ${item.translation})`,
        );
      }

      const dropped = seed.length - bank.filter(b => seed.some(s => s.id === b.id)).length;
      if (dropped > 0) {
        assert.ok(dropped < seed.length, `${lang} must never drop its entire bank`);
      }
    }
  });

  it('never fabricates filler collocations', () => {
    for (const lang of LANGUAGES) {
      const seed = JSON.parse(fs.readFileSync(path.join(vocabDir, `${lang}.json`), 'utf8'));
      const bank = VocabularyEngine.getAuthenticBank(lang, seed);
      for (const item of bank) {
        for (const collocation of item.collocations || []) {
          assert.doesNotMatch(
            collocation.phrase,
            /^useful phrase with /i,
            `${lang}: fabricated collocation on "${item.word}"`,
          );
          assert.doesNotMatch(
            collocation.phrase,
            / expression$/i,
            `${lang}: fabricated collocation on "${item.word}"`,
          );
        }
      }
    }
  });
});

describe('authored starter vocabulary quality', () => {
  it('carries only hand-written entries with real meanings and examples', async () => {
    const { STARTER_VOCABULARY } = await import('../../src/services/starterVocabulary.ts');
    const langs = Object.keys(STARTER_VOCABULARY);
    assert.ok(langs.length >= 13, 'starter packs must cover all languages');
    for (const lang of langs) {
      const pack = STARTER_VOCABULARY[lang];
      assert.ok(pack.length >= 300, `${lang} starter pack must have at least 90 real words (${pack.length})`);
      const ids = new Set<string>();
      for (const item of pack) {
        assert.ok(Boolean(item.romanization), `${lang}: '${item.word}' needs romanization/phonetic reading`);
        assert.ok(!ids.has(item.id), `${lang}: duplicate starter id ${item.id}`);
        ids.add(item.id);
        assert.ok(item.word && item.translation, `${lang}: word and Vietnamese meaning required`);
        assert.notEqual(item.word.trim().toLowerCase(), item.translation.trim().toLowerCase(), `${lang}: "${item.word}" must not be its own meaning`);
        assert.ok(item.example && item.example.length >= 4, `${lang}: "${item.word}" needs a real example sentence`);
        assert.ok(item.exampleTranslation && item.exampleTranslation.length >= 4, `${lang}: "${item.word}" needs a Vietnamese example translation`);
        assert.ok(!isSelfReferential(item.word, item.meaningVietnamese, item.translation), `${lang}: "${item.word}" meaning is self-referential`);
      }
    }
  });
});
