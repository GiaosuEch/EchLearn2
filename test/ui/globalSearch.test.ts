import test from 'node:test';
import assert from 'node:assert/strict';
import { findGlobalSearchResults } from '../../src/viewmodels/globalSearch.ts';

test('global search finds roadmap from Vietnamese keywords', () => {
  const results = findGlobalSearchResults('lo trinh');

  assert.equal(results[0]?.to, '/app/roadmap');
  assert.match(results[0]?.label ?? '', /Lộ trình/i);
});

test('global search returns no result for blank input', () => {
  assert.deepEqual(findGlobalSearchResults('   '), []);
});
