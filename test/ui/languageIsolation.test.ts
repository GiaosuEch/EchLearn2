import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  LANGUAGE_CONTENT_UNAVAILABLE,
  belongsToLanguage,
  buildDistractors,
  buildQuestionOptions,
  filterByLanguage,
  isScriptConsistent,
  shuffleFairly,
} from '../../src/services/languageIsolation.ts';

const japanese = { language: 'ja', word: '猫', nativeScript: '猫', meaningVietnamese: 'Con mèo' };
const chinese = { language: 'zh', word: '老虎', nativeScript: '老虎', meaningVietnamese: 'Con hổ' };
const english = { language: 'en', word: 'cat', nativeScript: 'cat', meaningVietnamese: 'Con mèo' };
const korean = { language: 'ko', word: '고양이', nativeScript: '고양이', meaningVietnamese: 'Con mèo' };

describe('script consistency', () => {
  it('accepts kana and kanji for Japanese and rejects Latin', () => {
    assert.equal(isScriptConsistent('ねこ', 'ja'), true);
    assert.equal(isScriptConsistent('猫', 'ja'), true);
    assert.equal(isScriptConsistent('ネコ', 'ja'), true);
    assert.equal(isScriptConsistent('cat', 'ja'), false);
  });

  it('accepts Han for Chinese and Hangul for Korean without confusing the two', () => {
    assert.equal(isScriptConsistent('老虎', 'zh'), true);
    assert.equal(isScriptConsistent('고양이', 'zh'), false);
    assert.equal(isScriptConsistent('고양이', 'ko'), true);
    assert.equal(isScriptConsistent('老虎', 'ko'), false);
  });

  it('rejects CJK inside Latin-script languages', () => {
    assert.equal(isScriptConsistent('cat', 'en'), true);
    assert.equal(isScriptConsistent('猫', 'en'), false);
    assert.equal(isScriptConsistent('gatto', 'it'), true);
    assert.equal(isScriptConsistent('привет', 'it'), false);
  });

  it('rejects empty and punctuation-only words', () => {
    assert.equal(isScriptConsistent('', 'en'), false);
    assert.equal(isScriptConsistent('   ', 'ja'), false);
    assert.equal(isScriptConsistent('---', 'en'), false);
    assert.equal(isScriptConsistent('123', 'en'), false);
  });
});

describe('language membership', () => {
  it('rejects an item whose declared language differs from the request', () => {
    assert.equal(belongsToLanguage(english, 'ja'), false);
    assert.equal(belongsToLanguage(chinese, 'ja'), false);
    assert.equal(belongsToLanguage(japanese, 'ja'), true);
  });

  it('rejects a mislabelled item whose script betrays it', () => {
    // Declared Japanese but actually an English word: the script check catches it.
    assert.equal(belongsToLanguage({ language: 'ja', word: 'cat' }, 'ja'), false);
    // Declared nothing at all: fall back to the script check.
    assert.equal(belongsToLanguage({ word: '猫' }, 'ja'), true);
    assert.equal(belongsToLanguage({ word: 'cat' }, 'ja'), false);
  });

  it('treats a locale tag as its base language', () => {
    assert.equal(belongsToLanguage(japanese, 'ja-JP'), true);
    assert.equal(belongsToLanguage(english, 'en-US'), true);
  });
});

describe('filterByLanguage', () => {
  it('never lets English or Chinese words pad a Japanese deck', () => {
    const mixed = [japanese, english, chinese, korean];
    const japaneseOnly = filterByLanguage(mixed, 'ja');
    assert.deepEqual(japaneseOnly, [japanese]);
  });

  it('returns an empty deck rather than substituting another language', () => {
    assert.deepEqual(filterByLanguage([english, chinese], 'ja'), []);
    assert.deepEqual(filterByLanguage(null, 'ja'), []);
    assert.deepEqual(filterByLanguage([], 'th'), []);
  });
});

describe('distractor generation', () => {
  it('draws every distractor from the supplied same-language pool', () => {
    const pool = ['Con hổ', 'Con chó', 'Con chim', 'Con cá'];
    const result = buildDistractors({ answer: 'Con mèo', pool });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.distractors.length, 3);
    for (const distractor of result.distractors) {
      assert.ok(pool.includes(distractor), `${distractor} must come from the language pool`);
    }
  });

  it('never returns the correct answer as a distractor, case-insensitively', () => {
    const result = buildDistractors({ answer: 'Con mèo', pool: ['con mèo', 'CON MÈO', 'Con hổ', 'Con chó', 'Con chim'] });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    for (const distractor of result.distractors) {
      assert.notEqual(distractor.toLocaleLowerCase(), 'con mèo');
    }
  });

  it('fails instead of borrowing when the pool is too thin', () => {
    const result = buildDistractors({ answer: 'Con mèo', pool: ['Con hổ'] });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.reason, 'insufficient-pool');
  });

  it('exposes a user-facing message for the thin-deck case', () => {
    assert.equal(LANGUAGE_CONTENT_UNAVAILABLE, 'Đang cập nhật bài học');
  });
});

describe('question options', () => {
  it('builds four options containing the answer exactly once', () => {
    const result = buildQuestionOptions('Con mèo', ['Con hổ', 'Con chó', 'Con chim', 'Con cá']);
    assert.equal(result.ok, true);
    assert.equal(result.options.length, 4);
    assert.equal(result.options.filter((option) => option === 'Con mèo').length, 1);
  });

  it('reports failure with no options when the deck is too thin', () => {
    const result = buildQuestionOptions('Con mèo', ['Con hổ']);
    assert.equal(result.ok, false);
    assert.deepEqual(result.options, []);
  });
});

describe('shuffleFairly', () => {
  it('preserves every element exactly once', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const output = shuffleFairly(input);
    assert.equal(output.length, input.length);
    assert.deepEqual([...output].sort((a, b) => a - b), input);
  });

  it('does not mutate the input', () => {
    const input = ['a', 'b', 'c'];
    shuffleFairly(input);
    assert.deepEqual(input, ['a', 'b', 'c']);
  });
});
