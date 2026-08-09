import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const appRoutes = readFileSync(new URL('../../src/App.tsx', import.meta.url), 'utf8');
const publicLayout = readFileSync(new URL('../../src/components/layout/PublicLayout.tsx', import.meta.url), 'utf8');
const trustPages = readFileSync(new URL('../../src/pages/public/TrustPages.tsx', import.meta.url), 'utf8');
const missionPage = readFileSync(new URL('../../src/pages/app/gamification/DailyMissionsPage.tsx', import.meta.url), 'utf8');

test('trust center has real routes and footer links instead of placeholder copy', () => {
  for (const path of ['/privacy', '/terms', '/cookies', '/contact']) {
    assert.match(appRoutes, new RegExp(`<Route path="${path}"`));
    assert.match(publicLayout, new RegExp(`to="${path}"`));
  }
  assert.match(trustPages, /getDiscordCommunityUrl/);
  assert.match(trustPages, /getFacebookCommunityUrl/);
  assert.doesNotMatch(trustPages, /support@|\+84|công ty TNHH/i);
});

test('unfinished daily missions contain a direct learning action and a real reset clock', () => {
  assert.match(missionPage, /function timeUntilNextDay/);
  assert.match(missionPage, /function actionForMission/);
  assert.match(missionPage, /<Link to=\{nextAction\.to\}/);
  assert.doesNotMatch(missionPage, /Resets in 14h 22m/);
});
