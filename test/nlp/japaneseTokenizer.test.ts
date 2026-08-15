import test from 'node:test';
import assert from 'node:assert/strict';
import {
  JapaneseTokenizer,
  tokenizeJapanese,
} from '../../src/lib/nlp/japaneseTokenizer.ts';
import { evaluateJapanese } from '../../src/domain/curriculum/japaneseEvaluator.ts';

test('tokenizes non-spaced Japanese into distinct AST Token nodes', () => {
  const ast = tokenizeJapanese('私は学生です');

  assert.equal(ast.type, 'Document');
  assert.equal(ast.source, '私は学生です');
  assert.deepEqual(ast.children.map(({ value }) => value), ['私', 'は', '学生', 'です']);
  assert.deepEqual(ast.children.map(({ type }) => type), ['Token', 'Token', 'Token', 'Token']);
  assert.deepEqual(ast.children.map(({ start, end }) => [start, end]), [
    [0, 1], [1, 2], [2, 4], [4, 6],
  ]);
  assert.deepEqual(ast.children.map(({ script }) => script), [
    'kanji', 'hiragana', 'kanji', 'hiragana',
  ]);
});

test('preserves punctuation as deterministic nodes and reconstructs compact source', () => {
  const ast = JapaneseTokenizer.tokenize('東京へ行きます。');

  assert.equal(ast.children.at(-1)?.value, '。');
  assert.equal(ast.children.at(-1)?.script, 'punctuation');
  assert.equal(ast.children.map(({ value }) => value).join(''), ast.source);
});

test('normalizes token values without mutating source text or offsets', () => {
  const ast = tokenizeJapanese('ｶﾀｶﾅを読む');
  const first = ast.children[0];

  assert.equal(ast.source, 'ｶﾀｶﾅを読む');
  assert.equal(first.value, 'ｶﾀｶﾅ');
  assert.equal(first.normalized, 'カタカナ');
  assert.equal(ast.source.slice(first.start, first.end), first.value);
});

test('returns an empty document for empty input', () => {
  assert.deepEqual(tokenizeJapanese(''), {
    type: 'Document',
    source: '',
    children: [],
  });
});

test('is deterministic across repeated runs', () => {
  const input = 'スーパーでコーヒーを買います。';
  assert.deepEqual(tokenizeJapanese(input), tokenizeJapanese(input));
});

test('Japanese evaluator returns evidence-complete deterministic results', () => {
  const input = {
    response: '私はスーパーでコーヒーを買います。',
    reference: '私はスーパーでコーヒーを買います。',
    level: 'N5' as const,
  };
  const first = evaluateJapanese(input);
  const second = evaluateJapanese(input);

  assert.deepEqual(first, second);
  assert.equal(first.status, 'completed');
  assert.equal(first.trackValue?.namespace, 'japanese-jlpt');
  assert.equal(first.trackValue?.score, 100);
  assert.ok(first.criteria.every(({ value }) => value === 100));
  assert.ok(first.criteria.every(({ evidenceIds }) => evidenceIds.length > 0));
  assert.ok(first.limitations.some(({ code }) => code === 'text-only'));
});

test('Japanese evaluator detects particle and textual vowel-length differences', () => {
  const result = evaluateJapanese({
    response: '私がスーパーでコヒーを買います。',
    reference: '私はスーパーでコーヒーを買います。',
    level: 'N5',
  });

  assert.equal(result.status, 'completed');
  assert.ok((result.trackValue?.score ?? 100) < 100);
  assert.ok(result.criteria.find(({ criterionId }) => criterionId === 'jlpt-particles')!.value < 100);
  assert.ok(result.criteria.find(({ criterionId }) => criterionId === 'japanese-vowel-lengths')!.value < 100);
  assert.ok(result.feedback.some(({ skillArea }) => skillArea === 'grammar'));
  assert.ok(result.feedback.some(({ skillArea }) => skillArea === 'pronunciation'));
});

test('Japanese evaluator abstains instead of inventing a score without evidence', () => {
  const result = evaluateJapanese({ response: '', reference: '私は学生です', level: 'N5' });

  assert.equal(result.status, 'abstained');
  assert.equal(result.trackValue, undefined);
  assert.equal(result.criteria.length, 0);
  assert.match(result.abstentionReason ?? '', /empty/i);
});
