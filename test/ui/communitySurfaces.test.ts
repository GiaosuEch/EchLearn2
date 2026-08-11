import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const communityFeed = readFileSync(resolve(process.cwd(), 'src/pages/app/community/CommunityFeedPage.tsx'), 'utf8');
const studyGroups = readFileSync(resolve(process.cwd(), 'src/pages/app/community/StudyGroupsPage.tsx'), 'utf8');
const studyGroupDetail = readFileSync(resolve(process.cwd(), 'src/pages/app/community/StudyGroupDetailPage.tsx'), 'utf8');
const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');

test('the community feed uses light companion surfaces instead of inherited dark cards', () => {
  assert.match(communityFeed, /rounded-3xl border border-slate-200 bg-white/);
  assert.doesNotMatch(communityFeed, /glass-card p-5/);
  assert.doesNotMatch(communityFeed, /border-dashed border-2 border-dark-700 bg-dark-900\/50/);
  assert.doesNotMatch(css, /\.ech-main \.glass-card:not\(\.bg-white\)/);
});

test('study groups use the same readable community surfaces as the feed', () => {
  assert.match(studyGroups, /border border-slate-200 bg-white/);
  assert.doesNotMatch(studyGroups, /bg-dark-800\/50 border border-dark-700/);
  assert.doesNotMatch(studyGroups, /from-primary-900\/40 to-dark-800/);
  assert.doesNotMatch(studyGroups, /glass-card flex flex-col/);
});

test('study group detail stays readable after opening a group', () => {
  assert.match(studyGroupDetail, /border border-slate-200 bg-white/);
  assert.doesNotMatch(studyGroupDetail, /from-primary-900\/40 to-dark-800/);
  assert.doesNotMatch(studyGroupDetail, /bg-dark-800 rounded-lg text-primary-400/);
  assert.doesNotMatch(studyGroupDetail, /glass-card p-6/);
});
