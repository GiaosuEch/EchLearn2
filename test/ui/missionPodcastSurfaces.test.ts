import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const missions = readFileSync(resolve(process.cwd(), 'src/pages/app/gamification/DailyMissionsPage.tsx'), 'utf8');
const podcasts = readFileSync(resolve(process.cwd(), 'src/pages/app/media/LanguagePodcastPage.tsx'), 'utf8');
const appLayout = readFileSync(resolve(process.cwd(), 'src/components/layout/AppLayout.tsx'), 'utf8');

test('missions use readable light-theme cards instead of legacy dark utilities', () => {
  assert.match(missions, /border border-slate-200 bg-white/);
  assert.doesNotMatch(missions, /bg-dark-800 text-dark-400 hover:bg-dark-700/);
  assert.doesNotMatch(missions, /from-primary-900\/20 to-dark-900/);
});

test('podcasts keep content readable and use the EchLearn green palette', () => {
  assert.match(podcasts, /min-w-0 break-words/);
  assert.match(podcasts, /text-emerald-600/);
  assert.doesNotMatch(podcasts, /max-w-4xl mx-auto space-y-6 font-mono/);
  assert.doesNotMatch(podcasts, /text-purple-400/);
});

test('desktop pages reserve space for the persistent player', () => {
  assert.match(appLayout, /p-4 pb-32 lg:p-6 lg:pb-32/);
});
