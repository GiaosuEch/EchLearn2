import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { learningAdviceService } from '../../src/services/aiCoachingService.ts';
import type { UserStats } from '../../src/types/index.ts';

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

const appLayout = read('src/components/layout/AppLayout.tsx');
const loginPage = read('src/pages/auth/LoginPage.tsx');
const adviceService = read('src/services/aiCoachingService.ts');
const weeklyReport = read('src/pages/app/analytics/WeeklyReportPage.tsx');
const syntaxPlayground = read('src/components/immersion/SyntaxPlayground.tsx');

test('development builds cannot synthesize an authenticated administrator', () => {
  for (const source of [appLayout, loginPage]) {
    assert.doesNotMatch(source, /DEV BYPASS|dev-user|role:\s*['"]admin['"]/);
  }
  assert.match(appLayout, /Navigate to=\{`\/register\?redirectTo=/);
});

test('unused simulated AI evaluation client is absent', () => {
  assert.equal(
    existsSync(new URL('../../src/services/aiEvaluationClient.ts', import.meta.url)),
    false,
  );
});

test('weekly guidance is an immediate transparent rules engine', () => {
  assert.match(adviceService, /transparent rules engine, not AI/i);
  assert.doesNotMatch(adviceService, /setTimeout|simulat|LLM|OpenAI|Anthropic|band/i);
  assert.match(weeklyReport, /GỢI Ý TỪ DỮ LIỆU TUẦN/);
  assert.doesNotMatch(weeklyReport, /AI ELITE COACH|Generate AI Coaching/);

  const stats = {
    listeningScore: 80,
    writingScore: 80,
    speakingScore: 80,
    readingScore: 80,
  } as UserStats;
  const noActivity = learningAdviceService.generateAdvice(stats, []);
  assert.deepEqual(noActivity.focusAreas, ['Consistency']);

  const active = learningAdviceService.generateAdvice(stats, [
    { day: 'Monday', xp: 100, minutes: 45, lessons: 2 },
  ]);
  assert.deepEqual(active.focusAreas, ['Review', 'Challenge']);
  assert.match(active.message, /45 phút/);
});

test('syntax tree rendering uses stable keys and exposes accessible feedback', () => {
  assert.doesNotMatch(syntaxPlayground, /key=\{Math\.random\(\)\}/);
  assert.match(syntaxPlayground, /key=\{path\}/);
  assert.match(syntaxPlayground, /htmlFor="syntax-playground-input"/);
  assert.match(syntaxPlayground, /role="alert"/);
});
