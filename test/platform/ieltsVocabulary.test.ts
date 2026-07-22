import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import {
  IELTS_VOCABULARY,
  buildIeltsVocabularyReviewQueue,
  createIeltsVocabularyProgress,
  filterIeltsVocabulary,
  gradeIeltsVocabularyReview,
} from '../../src/curriculum/ieltsVocabulary.ts';

describe('IELTS vocabulary curriculum and offline spaced repetition', () => {
  it('provides verified deterministic entries across bands and topics', () => {
    assert.ok(IELTS_VOCABULARY.length >= 24);
    assert.ok(IELTS_VOCABULARY.every((entry) => (
      entry.term.length > 0
      && entry.definition.length > 0
      && entry.collocations.length >= 2
      && entry.example.length > 0
      && entry.practicePrompt.length > 0
    )));
    assert.ok(new Set(IELTS_VOCABULARY.map((entry) => entry.band)).size >= 3);
    assert.ok(new Set(IELTS_VOCABULARY.map((entry) => entry.topic)).size >= 5);
  });

  it('filters curriculum without mutating the canonical data', () => {
    const original = structuredClone(IELTS_VOCABULARY);
    const results = filterIeltsVocabulary({ band: '7.5', topic: 'Technology' });

    assert.ok(results.length > 0);
    assert.ok(results.every((entry) => entry.band === '7.5' && entry.topic === 'Technology'));
    assert.deepEqual(IELTS_VOCABULARY, original);
  });

  it('prioritizes due items, then unseen items, with deterministic ordering', () => {
    const now = '2026-07-21T10:00:00.000Z';
    const due = {
      ...createIeltsVocabularyProgress('ielts-environment-mitigate', now),
      repetitions: 1,
      dueAt: '2026-07-20T10:00:00.000Z',
    };
    const later = { ...createIeltsVocabularyProgress('ielts-technology-ubiquitous', now), dueAt: '2026-07-25T10:00:00.000Z' };
    const queue = buildIeltsVocabularyReviewQueue([due, later], now, 8);

    assert.equal(queue[0].entry.id, due.entryId);
    assert.ok(queue.some((item) => item.progress.repetitions === 0));
    assert.equal(queue.some((item) => item.entry.id === later.entryId), false);
  });

  it('schedules successful recall farther away and an incorrect recall sooner', () => {
    const now = '2026-07-21T10:00:00.000Z';
    const initial = createIeltsVocabularyProgress('ielts-education-curriculum', now);
    const good = gradeIeltsVocabularyReview(initial, 'good', now);
    const again = gradeIeltsVocabularyReview(good, 'again', now);

    assert.equal(good.repetitions, 1);
    assert.ok(good.dueAt > now);
    assert.equal(again.repetitions, 0);
    assert.ok(again.dueAt < good.dueAt);
    assert.ok(again.lapses > good.lapses);
  });

  it('registers an IELTS product-pack route without leaking exam logic into platform AI core', () => {
    const app = readFileSync(new URL('../../src/App.tsx', import.meta.url), 'utf8');
    const page = readFileSync(new URL('../../src/pages/app/ielts/IELTSVocabularyPage.tsx', import.meta.url), 'utf8');

    assert.match(app, /path="ielts\/vocabulary"/);
    assert.match(page, /Practice Generator/);
    assert.match(page, /Writing Coach/);
    assert.match(page, /Speaking Coach/);
    assert.doesNotMatch(page, /AIService|createPlatformAIService|fetch\s*\(/);
  });
});
