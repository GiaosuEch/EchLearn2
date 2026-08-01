import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const appSource = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');

test('the app router defers page modules instead of eagerly importing the entire product', () => {
  assert.match(appSource, /\blazy\(/, 'route components should be lazy-loaded');
  assert.doesNotMatch(
    appSource,
    /from ['"]\.\/pages\/app\/AllPages['"]/,
    'the legacy AllPages barrel eagerly imports many unrelated screens into the application shell',
  );
});
