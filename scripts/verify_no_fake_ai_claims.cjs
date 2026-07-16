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

const tutor = read('src/services/aiTutor.ts');
if (!tutor.includes('createUnavailableAIService') || !tutor.includes('AIServiceResponse')) {
  fail('legacy tutor is not routed through the safe AI service boundary');
}
if (/Math\.random|tutorResponses|setTimeout|Present Perfect|essay structure/i.test(tutor)) {
  fail('legacy tutor still contains simulated or canned AI output');
}

const safeAssessmentServices = [
  read('src/services/speechAnalysis.ts'),
  read('src/services/writingFeedback.ts'),
].join('\n');
if (/Math\.random|setTimeout|isAiGenerated\s*:\s*true/i.test(safeAssessmentServices)) {
  fail('speech or writing assessment service contains fake/random AI behavior');
}

const legacyCoachPages = [
  read('src/pages/app/ielts/AIWritingCoachPage.tsx'),
  read('src/pages/app/ielts/AISpeakingCoachPage.tsx'),
].join('\n');
if (/setTimeout|overall:\s*6\.5|pronunciation:\s*82|Examiner AI Feedback|band 7\+/i.test(legacyCoachPages)) {
  fail('legacy coach page still contains hardcoded assessment output');
}
if (!/unavailable/i.test(legacyCoachPages)) {
  fail('legacy coach pages must show explicit unavailable states');
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
if (!/Local AI foundation in development/i.test(marketing)) {
  fail('marketing must disclose that the local AI foundation is still in development');
}
if (!/Automated assessment unavailable until an approved model is installed/i.test(marketing)) {
  fail('marketing must disclose that automated assessment is unavailable');
}

const placementDisclosure = [
  read('src/components/mascot/MascotIELTSFeedback.tsx'),
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
