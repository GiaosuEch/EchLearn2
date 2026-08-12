import test from 'node:test';
import assert from 'node:assert/strict';
import type { EnglishSurvivalUnit } from '../../src/curriculum/englishSurvival30.ts';
import {
  englishSurvival30,
  getEnglishSurvivalLesson,
  isEnglishSurvivalLesson,
} from '../../src/curriculum/englishSurvival30.ts';

test('English Survival 30 is a complete, unique thirty-lesson starter course', () => {
  assert.equal(englishSurvival30.length, 30);

  const ids = englishSurvival30.map((lesson) => lesson.id);
  const vietnameseTitles = englishSurvival30.map((lesson) => lesson.titleVi);
  const titles = englishSurvival30.map((lesson) => lesson.titleEn);
  const canDos = englishSurvival30.map((lesson) => lesson.canDoVi);
  const units: EnglishSurvivalUnit[] = [1, 2, 3, 4, 5, 6];
  assert.equal(new Set(ids).size, 30, 'lesson IDs must be unique');
  assert.equal(new Set(vietnameseTitles).size, 30, 'Vietnamese lesson titles must be unique');
  assert.equal(new Set(titles).size, 30, 'English lesson titles must be unique');
  assert.equal(new Set(canDos).size, 30, 'Vietnamese Can-dos must be unique');

  for (const [index, lesson] of englishSurvival30.entries()) {
    assert.equal(lesson.order, index + 1, `${lesson.id} needs its course order`);
    assert.ok(units.includes(lesson.unit), `${lesson.id} needs a valid course unit`);
    assert.ok(lesson.titleVi && lesson.titleEn && lesson.canDoVi, `${lesson.id} needs truthful lesson identity`);
    assert.ok(lesson.scenario.settingVi && lesson.scenario.roles.every(Boolean), `${lesson.id} needs a usable scenario`);
    assert.ok(lesson.dialogue.length >= 2 && lesson.dialogue.every((line) => line.text && line.vi), `${lesson.id} needs bilingual dialogue`);
    assert.ok(lesson.chunks.length >= 2 && lesson.chunks.length <= 4, `${lesson.id} needs 2–4 usable chunks`);
    assert.ok(lesson.chunks.every((chunk) => chunk.text && chunk.vi && chunk.useWhenVi && chunk.vietnameseLearnerCueVi), `${lesson.id} chunks need learner support`);
    assert.ok(lesson.contextCue.titleVi && lesson.contextCue.bodyVi, `${lesson.id} needs a context cue`);
    assert.ok(lesson.comprehension.promptVi && lesson.comprehension.options.length >= 2 && lesson.comprehension.options.includes(lesson.comprehension.correctAnswer) && lesson.comprehension.explanationVi, `${lesson.id} needs a checkable comprehension activity`);
    assert.equal(lesson.production.rejectExactModelCopy, true, `${lesson.id} must reject copied model answers`);
    assert.ok(lesson.production.promptVi && lesson.production.requiredSlots.length >= 1 && lesson.production.exemplar, `${lesson.id} needs a personal production task`);
    assert.ok(lesson.retrieval.promptVi && lesson.retrieval.acceptedPatterns.length >= 1 && lesson.retrieval.answerHintVi, `${lesson.id} needs an answerable retrieval prompt`);
    assert.equal(lesson.selfReview.length, 4, `${lesson.id} needs four self-review prompts`);
    assert.equal(lesson.audioAsset, undefined, `${lesson.id} must not publish unlicensed audio`);
  }
});

test('English Survival 30 retrieves only known lessons and avoids prohibited claims', () => {
  assert.equal(getEnglishSurvivalLesson('en-survival-1')?.titleEn, 'Say hello and introduce yourself');
  assert.equal(getEnglishSurvivalLesson('en-survival-31'), undefined);
  assert.equal(isEnglishSurvivalLesson('en-survival-30'), true);
  assert.equal(isEnglishSurvivalLesson('not-a-lesson'), false);

  const serializedCourse = JSON.stringify(englishSurvival30).toLowerCase();
  assert.doesNotMatch(serializedCourse, /ielts|native audio|ai scoring|native-level|automatic pronunciation/);
});
