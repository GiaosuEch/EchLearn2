#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}
function fail(message) {
  console.error('FAIL:', message);
  process.exit(1);
}
function ok(message) {
  console.log('PASS:', message);
}

const legacyPhase17Files = [
  'src/services/practiceLearningIntegration.ts',
  'src/pages/app/practice/WritingPracticePage.tsx',
  'src/pages/app/practice/SpeakingPracticePage.tsx',
  'src/services/aiLearningEngine.ts',
];
const legacyForbidden = [
  'official IELTS score',
  '100% accurate',
  'perfect pronunciation scoring',
  'examiner official',
];

for (const relativePath of legacyPhase17Files) {
  const source = read(relativePath).toLowerCase();
  for (const claim of legacyForbidden) {
    if (source.includes(claim.toLowerCase())) {
      fail(`${relativePath} contains fake claim: ${claim}`);
    }
  }
}

const practiceService = read('src/services/practiceLearningIntegration.ts').toLowerCase();
if (
  !practiceService.includes('local practice feedback')
  && !practiceService.includes('phản hồi cục bộ')
) {
  fail('missing honest local feedback disclaimer');
}

const speakingService = read('src/services/practiceLearningIntegration.ts');
const speakingEvaluator = speakingService.match(/export function evaluateSpeakingPractice[\s\S]*?\r?\n}\r?\n\r?\nexport async function saveWritingFeedback/);
if (!speakingEvaluator) fail('speaking evaluator is missing');
if (/const\s+(?:pronunciation|fluency|vocabulary|grammar|band|score)\s*=|\b(?:categories|score)\s*:/i.test(speakingEvaluator[0])) {
  fail('speaking evaluator must not fabricate a language proficiency score');
}
if (!/Hệ thống chưa chấm phát âm|does not score pronunciation/i.test(speakingEvaluator[0])) {
  fail('speaking evaluator must disclose that it does not score pronunciation');
}
const speakingPage = read('src/pages/app/practice/SpeakingPracticePage.tsx');
if (/AI Speaking Guide|AI nhận diện phát âm|feedback\.(score|categories|band)/i.test(speakingPage)) {
  fail('speaking page contains a fabricated AI assessment claim or score');
}

const survivalLearningSources = [
  read('src/curriculum/englishSurvival30.ts'),
  read('src/services/englishSurvivalProgressService.ts'),
  read('src/pages/app/EnglishSurvivalLessonPage.tsx'),
].join('\n');
for (const claim of [/native audio/i, /AI scoring/i, /automatic pronunciation/i, /band score/i, /real teacher/i]) {
  if (claim.test(survivalLearningSources)) fail(`English Survival contains unsupported claim: ${claim}`);
}
if (!/window\.speechSynthesis/.test(survivalLearningSources)) {
  fail('English Survival must use browser speech synthesis rather than implying a human model audio source');
}

const marketing = [
  read('src/pages/public/LandingPage.tsx'),
  read('src/pages/app/AllPages.tsx'),
  read('src/components/layout/PublicLayout.tsx'),
].join('\n');
const forbiddenMarketingClaims = [
  /unlimited AI coaching/i,
  /5 AI queries\/day/i,
  /AI-powered/i,
  /AI pronunciation coach/i,
  /AI feedback with band scoring/i,
  /personal AI language tutor available 24\/7/i,
  /IELTS-style band scoring/i,
  /go from band 5\.5 to 7\.5/i,
  /guaranteed band/i,
  /stronger than ELSA/i,
  /ChatGPT-like/i,
];
for (const claim of forbiddenMarketingClaims) {
  if (claim.test(marketing)) fail(`marketing contains unsupported claim: ${claim}`);
}
const placementDisclosure = [
  read('src/pages/app/ielts/IELTSPlacementPage.tsx'),
  read('src/i18n/locales/en.ts'),
].join('\n');
if (/Examiner AI Feedback|definitely ready for the real exam|Our AI tools/i.test(placementDisclosure)) {
  fail('placement flow contains unsupported AI/examiner claims');
}
if (!/uncalibrated beta estimate/i.test(placementDisclosure)) {
  fail('placement flow must label its result as an uncalibrated beta estimate');
}
if (!/local heuristic/i.test(placementDisclosure)) {
  fail('placement flow must disclose its local heuristic limitation');
}

ok('legacy AI services and public claims are unavailable-safe and evidence-honest');
