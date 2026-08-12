import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function source(path: string) {
  return readFileSync(path, 'utf8');
}

test('group list and detail use the same repository with explicit states', () => {
  const list = source('src/pages/app/community/StudyGroupsPage.tsx');
  const detail = source('src/pages/app/community/StudyGroupDetailPage.tsx');

  assert.match(list, /loading/);
  assert.match(list, /loadError/);
  assert.match(detail, /communitySupabaseService\.getStudyGroups\(\)/);
  assert.doesNotMatch(detail, /data\/communityData/);
  assert.match(detail, /Tham gia nhóm chưa khả dụng/);
});

test('community repository does not fabricate social posts or groups', () => {
  const repository = source('src/services/communitySupabaseService.ts');
  assert.doesNotMatch(repository, /post_001|group_001|IELTS 8\.0|weeklyXP:\s*1250/);
});

test('podcast route uses authored clips and browser speech without false attribution', () => {
  const podcast = source('src/pages/app/media/LanguagePodcastPage.tsx');
  assert.match(podcast, /SpeechSynthesisUtterance/);
  assert.doesNotMatch(podcast, /pixabay|BBC Learning English|ChinesePod|native audio|bản xứ chuẩn giọng/i);
  assert.doesNotMatch(podcast, /useTextToSpeech|<audio/);
});

test('daily missions explains the identity requirement instead of rendering blank', () => {
  const missions = source('src/pages/app/gamification/DailyMissionsPage.tsx');
  assert.match(missions, /if \(!userId\)/);
  assert.match(missions, /Chưa có hồ sơ để tạo nhiệm vụ/);
  assert.match(missions, /redirectTo=%2Fapp%2Fmissions/);
});

test('learning layout does not mount a remote music widget over every route', () => {
  const layout = source('src/components/layout/AppLayout.tsx');
  assert.doesNotMatch(layout, /JapaneseLofiPlayer|Spotify Official|Open lofi music player/);
});
