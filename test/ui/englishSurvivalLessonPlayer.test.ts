import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const playerPath = fileURLToPath(new URL('../../src/pages/app/EnglishSurvivalLessonPage.tsx', import.meta.url));
const appPath = fileURLToPath(new URL('../../src/App.tsx', import.meta.url));
const roadmapPath = fileURLToPath(new URL('../../src/pages/app/CourseRoadmapPage.tsx', import.meta.url));
const dashboardPath = fileURLToPath(new URL('../../src/pages/app/DashboardPage.tsx', import.meta.url));
const practiceHubPath = fileURLToPath(new URL('../../src/pages/app/PracticeHubPage.tsx', import.meta.url));
const player = readFileSync(playerPath, 'utf8');
const app = readFileSync(appPath, 'utf8');
const roadmap = readFileSync(roadmapPath, 'utf8');
const dashboard = readFileSync(dashboardPath, 'utf8');
const practiceHub = readFileSync(practiceHubPath, 'utf8');

test('English Survival player presents all six evidence-based stages', () => {
  for (const label of ['Tình huống', 'Hiểu ý', 'Nghe & nhại', 'Bóc tách ngữ cảnh', 'Tự tạo câu', 'Ôn nhanh & tự rà soát']) {
    assert.ok(player.includes(label), `missing stage: ${label}`);
  }
  assert.ok(player.includes('lesson.comprehension.explanationVi'));
  assert.ok(player.includes('lesson.contextCue'));
  assert.ok(player.includes('lesson.selfReview.map'));
});

test('player uses browser-only speech and accurately discloses the source', () => {
  assert.ok(player.includes('Trình đọc giọng nói của trình duyệt'));
  assert.ok(player.includes('SpeechSynthesis'));
  assert.ok(player.includes('window.speechSynthesis.speak(utterance)'));
  assert.ok(player.includes('không tải hay phát audio từ nguồn ngoài'));
  assert.equal(player.includes('useTextToSpeech'), false);
  assert.equal(player.includes('audioService'), false);
  for (const prohibited of ['native audio', 'AI scoring', 'automatic pronunciation', 'band score', 'real teacher']) {
    assert.equal(player.toLowerCase().includes(prohibited), false, `prohibited claim: ${prohibited}`);
  }
});

test('player handles invalid lessons and persists completion through the dedicated service', () => {
  assert.ok(player.includes("getEnglishSurvivalLesson(searchParams.get('lesson') || '')"));
  assert.ok(player.includes('Bài học không khả dụng'));
  assert.ok(player.includes('completeEnglishSurvivalLesson'));
  assert.ok(player.includes('result.messageVi'));
  assert.ok(player.includes("to=\"/app/roadmap\""));
  assert.ok(player.includes('role="alert" aria-live="assertive"'));
  assert.ok(player.includes('role="status" aria-live="polite"'));
});

test('curated English lessons route through the guarded survival player', () => {
  assert.ok(app.includes('const EnglishSurvivalLessonPage'));
  const guardStart = app.indexOf('<Route element={<LanguageEntitlementGuard />}>');
  const guardEnd = app.indexOf('</Route>', guardStart);
  const guardedRoutes = app.slice(guardStart, guardEnd);
  assert.ok(guardedRoutes.includes('path="english-survival" element={<EnglishSurvivalLessonPage />}'));
  assert.ok(roadmap.includes("currentLanguage === 'en' || currentLanguage === 'en-US'"));
  assert.ok(roadmap.includes('`/app/english-survival?lesson=${nextEnglishSurvivalLesson.id}`'));
});

test('dashboard exposes a direct English Survival entry point for English learners', () => {
  assert.ok(dashboard.includes('English Survival'));
  assert.ok(dashboard.includes('`/app/english-survival?lesson=${nextSurvivalLesson.id}`'));
  assert.ok(dashboard.includes('progressService.getCompletedLessons'));
  assert.ok(dashboard.includes('primaryActionPath'));
});

test('practice hub exposes English Survival for English learners', () => {
  assert.ok(practiceHub.includes("id: 'english-survival'"));
  assert.ok(practiceHub.includes('/app/english-survival?lesson=en-survival-1'));
  assert.ok(practiceHub.includes("currentLanguage === 'en' || currentLanguage === 'en-US'"));
});
