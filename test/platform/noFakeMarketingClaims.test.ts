import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const marketingFiles = [
  'src/pages/public/LandingPage.tsx',
  'src/pages/app/AllPages.tsx',
  'src/components/layout/PublicLayout.tsx',
];

function marketingSource(): string {
  return marketingFiles
    .map(relativePath => readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8'))
    .join('\n');
}

describe('public AI marketing honesty', () => {
  it('does not advertise AI features that have no approved runtime/model', () => {
    const source = marketingSource();

    assert.doesNotMatch(source, /unlimited AI coaching|5 AI queries\/day/i);
    assert.doesNotMatch(source, /AI-powered|AI pronunciation coach|AI feedback with band scoring/i);
    assert.doesNotMatch(source, /personal AI language tutor available 24\/7/i);
  });

  it('does not make unsupported exam or competitor claims', () => {
    const source = marketingSource();

    assert.doesNotMatch(source, /guaranteed band|stronger than ELSA|ChatGPT-like/i);
    assert.doesNotMatch(source, /go from band 5\.5 to 7\.5|IELTS-style band scoring/i);
  });

  it('uses explicit development/unavailable language for local AI', () => {
    const source = marketingSource();

    assert.match(source, /Local AI foundation in development/i);
    assert.match(source, /Automated assessment unavailable until an approved model is installed/i);
  });
});
