import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const appSource = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');
const loaderSource = readFileSync(resolve(process.cwd(), 'src/components/mascot/BuriLoadingState.tsx'), 'utf8');

test('the app router defers page modules instead of eagerly importing the entire product', () => {
  assert.match(appSource, /\blazy\(/, 'route components should be lazy-loaded');
  assert.doesNotMatch(
    appSource,
    /from ['"]\.\/pages\/app\/AllPages['"]/,
    'the legacy AllPages barrel eagerly imports many unrelated screens into the application shell',
  );
});

test('route loading is a recoverable Buri companion state, not a blank line of text', () => {
  assert.match(appSource, /BuriLoadingState/);
  assert.match(appSource, /<ErrorBoundary>/);
  assert.match(loaderSource, /EchBuriAnimated size=\{128\} state="loading"/);
  assert.match(loaderSource, /slowAfterMs = 8_000/);
  assert.match(loaderSource, /Tải lại trang/);
});
