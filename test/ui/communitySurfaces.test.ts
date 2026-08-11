import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const communityFeed = readFileSync(resolve(process.cwd(), 'src/pages/app/community/CommunityFeedPage.tsx'), 'utf8');
const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');

test('the community feed uses light companion surfaces instead of inherited dark cards', () => {
  assert.match(communityFeed, /rounded-3xl border border-slate-200 bg-white/);
  assert.doesNotMatch(communityFeed, /glass-card p-5/);
  assert.doesNotMatch(communityFeed, /border-dashed border-2 border-dark-700 bg-dark-900\/50/);
  assert.doesNotMatch(css, /\.ech-main \.glass-card:not\(\.bg-white\)/);
});
