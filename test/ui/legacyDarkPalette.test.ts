import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const css = readFileSync(new URL('../../src/index.css', import.meta.url), 'utf8');

test('legacy dark utility classes have concrete Tailwind theme tokens', () => {
  for (const shade of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
    assert.match(css, new RegExp(`--color-dark-${shade}:\\s*#[0-9a-fA-F]{3,8}`));
  }
});

test('legacy dark utilities keep readable text without forcing every card dark', () => {
  assert.doesNotMatch(css, /\.ech-main \.glass-card:not\(\.bg-white\)/);
});
