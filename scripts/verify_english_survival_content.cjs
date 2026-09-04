#!/usr/bin/env node
const path = require('path');
const { pathToFileURL } = require('url');

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

async function main() {
  const moduleUrl = pathToFileURL(path.join(process.cwd(), 'src/curriculum/englishSurvival30.ts')).href;
  const { englishSurvival30 } = await import(moduleUrl);
  const lessons = Array.isArray(englishSurvival30) ? englishSurvival30 : [];

  assert(lessons.length === 30, `expected 30 lessons, found ${lessons.length}`);
  const unique = (values, label) => assert(new Set(values).size === values.length, `${label} must be unique`);
  unique(lessons.map((lesson) => lesson.id), 'lesson IDs');
  unique(lessons.map((lesson) => lesson.titleVi), 'Vietnamese titles');
  unique(lessons.map((lesson) => lesson.titleEn), 'English titles');
  unique(lessons.map((lesson) => lesson.canDoVi), 'Can-dos');

  for (const lesson of lessons) {
    const prefix = lesson.id;
    assert(/^en-survival-(?:[1-9]|[12]\d|30)$/.test(lesson.id), `${prefix}: invalid lesson ID`);
    assert(Number.isInteger(lesson.unit) && lesson.unit >= 1 && lesson.unit <= 6, `${prefix}: invalid unit`);
    assert(hasText(lesson.titleVi) && hasText(lesson.titleEn) && hasText(lesson.canDoVi), `${prefix}: missing title or Can-do`);
    assert(hasText(lesson.scenario?.settingVi) && Array.isArray(lesson.scenario?.roles) && lesson.scenario.roles.every(hasText), `${prefix}: incomplete scenario`);
    assert(Array.isArray(lesson.dialogue) && lesson.dialogue.length >= 2 && lesson.dialogue.every((line) => hasText(line.text) && hasText(line.vi)), `${prefix}: incomplete dialogue`);
    assert(Array.isArray(lesson.chunks) && lesson.chunks.length >= 2 && lesson.chunks.length <= 4 && lesson.chunks.every((chunk) => hasText(chunk.text) && hasText(chunk.vi) && hasText(chunk.useWhenVi) && hasText(chunk.vietnameseLearnerCueVi)), `${prefix}: incomplete reusable chunks`);
    assert(hasText(lesson.contextCue?.titleVi) && hasText(lesson.contextCue?.bodyVi), `${prefix}: missing context cue`);
    assert(hasText(lesson.comprehension?.promptVi) && lesson.comprehension.options.length >= 2 && lesson.comprehension.options.includes(lesson.comprehension.correctAnswer) && hasText(lesson.comprehension.explanationVi), `${prefix}: incomplete comprehension check`);
    assert(lesson.production?.rejectExactModelCopy === true && hasText(lesson.production?.promptVi) && hasText(lesson.production?.exemplar) && lesson.production.requiredSlots.length > 0, `${prefix}: incomplete personal production`);
    assert(hasText(lesson.retrieval?.promptVi) && Array.isArray(lesson.retrieval?.acceptedPatterns) && lesson.retrieval.acceptedPatterns.length > 0 && hasText(lesson.retrieval.answerHintVi), `${prefix}: incomplete retrieval`);
    assert(Array.isArray(lesson.selfReview) && lesson.selfReview.length === 4 && lesson.selfReview.every(hasText), `${prefix}: self-review must have four prompts`);
    if (lesson.audioAsset) {
      assert(['url', 'owner', 'license', 'accent', 'transcript'].every((key) => hasText(lesson.audioAsset[key])), `${prefix}: published audio needs full ownership metadata`);
      assert(['slow', 'normal'].includes(lesson.audioAsset.speed), `${prefix}: audio speed must be slow or normal`);
    }
  }

  assert(!/IELTS|native audio|native-level|AI chấm|AI scoring|automatic pronunciation/i.test(JSON.stringify(lessons)), 'course content makes an unsupported assessment or proficiency claim');
  if (!process.exitCode) console.log('PASS: English Survival 30 content contract is complete and claim-safe');
}

main().catch((error) => fail(error?.stack || String(error)));
