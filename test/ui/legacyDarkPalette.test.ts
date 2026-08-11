import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const css = readFileSync(new URL('../../src/index.css', import.meta.url), 'utf8');

test('legacy dark utility classes have concrete Tailwind theme tokens', () => {
  for (const shade of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
    assert.match(css, new RegExp(`--color-dark-${shade}:\\s*#[0-9a-fA-F]{3,8}`));
  }
});

test('legacy dark cards keep readable text after the app moved to warm surfaces', () => {
  assert.match(css, /\.ech-main \.glass-card:not\(\.bg-white\)/);
  assert.match(css, /html:not\(\.dark\) \.ech-main \.text-white \{ color: #10231d; \}/);
  assert.match(css, /\[class\*="bg-slate-900"\][\s\S]*\) \.text-white \{ color: #f8fafc; \}/);
  assert.match(css, /\) \.text-dark-400 \{ color: #cbd5e1; \}/);
});
