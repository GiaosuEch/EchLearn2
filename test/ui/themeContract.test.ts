import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = (relativePath: string) => readFile(new URL(`../../${relativePath}`, import.meta.url), 'utf8');

test('the application shell has one explicit token set for both colour modes', async () => {
  const css = await source('src/index.css');

  assert.match(css, /--lingfrog-canvas:/);
  assert.match(css, /html\.dark\s*\{[\s\S]*--lingfrog-canvas:/);
  assert.doesNotMatch(css, /UNIFIED UNIVERSAL LIGHT & DARK MODE THEME SYSTEM/);
  assert.doesNotMatch(css, /html:not\(\.dark\) \.text-white/);
});

test('navigation exposes pricing without any Upgrade to Pro control', async () => {
  const appLayout = await source('src/components/layout/AppLayout.tsx');

  assert.match(appLayout, /key: 'pricing', path: '\/app\/pricing'/);
  assert.doesNotMatch(appLayout, /Upgrade to Pro/i);
});
