import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';

import { VocabularyEngine } from '../../src/services/vocabularyEngine.ts';

const root = path.resolve(import.meta.dirname, '../..');
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('persona honesty (IQ-80 & senior friendly)', () => {
  it('maps technical auth errors to actionable Vietnamese before a learner sees them', () => {
    const toast = read('src/components/ui/Toast.tsx');
    assert.match(toast, /lower\.includes\('captcha'\)/, 'captcha errors must be translated for the learner');
    assert.match(toast, /Bước xác minh chưa hoàn tất/, 'captcha guidance must state the next action');
    assert.match(toast, /Kết nối quá chậm hoặc bị gián đoạn/, 'timeout guidance must state the next action');
  });

  it('never shows the meaningless lone "Cước" badge on the register language grid', () => {
    const page = read('src/pages/auth/RegisterPage.tsx');
    assert.doesNotMatch(page, />Cước</, 'the truncated "gói cước" badge must stay removed');
    assert.match(page, />Trả phí</, 'paid languages must carry a self-explanatory badge');
  });

  it('keeps the paid-language warning short enough for slow readers', () => {
    const page = read('src/pages/auth/RegisterPage.tsx');
    const toast = page.match(/toast\(`"\$\{l\.name\}" cần gói trả phí[^`]*`/);
    assert.ok(toast, 'paid-language warning must exist');
    assert.ok(toast[0].length < 120, 'warning must stay under ~100 characters of Vietnamese');
  });

  it('vocabulary banks contain no synthetic padding clones for any language', () => {
    const langs = ['en', 'fr', 'de', 'zh', 'ja', 'ko', 'es', 'it', 'pt', 'ru', 'vi', 'th', 'ar'];
    for (const lang of langs) {
      const seed = JSON.parse(fs.readFileSync(path.join(root, 'public/data/vocabulary', `${lang}.json`), 'utf8'));
      const bank = VocabularyEngine.getAuthenticBank(lang, seed);
      assert.ok(bank.length > 0, `${lang} bank must not be empty`);
      assert.ok(bank.length < 2000, `${lang} bank must reflect authored size, not padded 10k (${bank.length})`);
      for (const item of bank) {
        assert.doesNotMatch(item.id, /-ext-/, `${lang}: synthetic clone id leaked (${item.id})`);
      }
    }
  });
});