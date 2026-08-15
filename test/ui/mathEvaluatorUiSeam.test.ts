import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolveBandRevealState } from '../../src/components/ielts/bandScoreRevealState.ts';
import { DTW } from '../../src/lib/dsp/dtw.ts';

const source = (relativePath: string) =>
  readFile(new URL(`../../${relativePath}`, import.meta.url), 'utf8');

const pronunciationCases = [
  { normalized: 1.0, percent: 100, band: 9.0 },
  { normalized: 0.95, percent: 95, band: 9.0 },
  { normalized: 0.94, percent: 94, band: 8.5 },
  { normalized: 0.88, percent: 88, band: 8.5 },
  { normalized: 0.8, percent: 80, band: 8.0 },
  { normalized: 0.7, percent: 70, band: 7.5 },
  { normalized: 0.6, percent: 60, band: 7.0 },
  { normalized: 0.5, percent: 50, band: 6.5 },
  { normalized: 0.4, percent: 40, band: 6.0 },
  { normalized: 0.3, percent: 30, band: 5.5 },
  { normalized: 0.2, percent: 20, band: 5.0 },
  { normalized: 0.1, percent: 10, band: 4.5 },
  { normalized: 0, percent: 0, band: 4.0 },
] as const;

function pronunciationBandFromContract(percent: number): number {
  if (percent >= 95) return 9.0;
  if (percent >= 88) return 8.5;
  if (percent >= 80) return 8.0;
  if (percent >= 70) return 7.5;
  if (percent >= 60) return 7.0;
  if (percent >= 50) return 6.5;
  if (percent >= 40) return 6.0;
  if (percent >= 30) return 5.5;
  if (percent >= 20) return 5.0;
  if (percent >= 10) return 4.5;
  return 4.0;
}

test('Band reveal state machine gives computing precedence before result validation', () => {
  assert.equal(
    resolveBandRevealState({ state: 'computing', band: undefined, scale: 9 }),
    'computing',
  );
  assert.equal(
    resolveBandRevealState({ state: 'computing', band: null, scale: 9 }),
    'computing',
  );
  assert.equal(
    resolveBandRevealState({ state: 'computing', band: Number.NaN, scale: 9 }),
    'computing',
  );
});

test('explicit unavailable state remains authoritative even if a stale Band exists', () => {
  assert.equal(
    resolveBandRevealState({ state: 'unavailable', band: 8.5, scale: 9 }),
    'unavailable',
  );
});

test('ready state accepts only finite Bands inside the declared scale', () => {
  for (const band of [0, 4, 7.5, 9]) {
    assert.equal(resolveBandRevealState({ state: 'ready', band, scale: 9 }), 'ready');
  }

  for (const band of [undefined, null, Number.NaN, Infinity, -0.5, 9.5]) {
    assert.equal(resolveBandRevealState({ state: 'ready', band, scale: 9 }), 'unavailable');
  }

  assert.equal(resolveBandRevealState({ state: 'ready', band: 7, scale: 0 }), 'unavailable');
  assert.equal(resolveBandRevealState({ state: 'ready', band: 7, scale: Number.NaN }), 'unavailable');
});

test('DTW produces deterministic identical-sequence output at the normalized seam', () => {
  const sample = [0.1, 0.25, 0.5, 0.75, 0.9];
  const distance = DTW.calculateDistance(sample, sample, 2);
  const normalized = DTW.evaluateScore(distance, 50);

  assert.equal(distance, 0);
  assert.equal(normalized, 1);
  assert.equal(normalized * 100, 100);
  assert.equal(pronunciationBandFromContract(normalized * 100), 9.0);
});

test('pronunciation unit conversion is exactly normalized 0..1 to percent 0..100 to Band', async () => {
  const [hook, speaking, evaluator] = await Promise.all([
    source('src/hooks/usePronunciationChallenge.ts'),
    source('src/pages/app/ielts/IELTSSpeakingPage.tsx'),
    source('src/domain/curriculum/ieltsEvaluator.ts'),
  ]);

  assert.match(hook, /const normalizedScore = Math\.max\(0, Math\.min\(1, rawScore\)\)/);
  assert.match(hook, /score: Math\.round\(normalizedScore \* 100\)/);
  assert.match(hook, /onEvaluated\(normalizedScore\)/);
  assert.match(speaking, /IELTSEvaluator\.evaluatePronunciation\(score \* 100\)/);
  assert.match(speaking, /value: `\$\{Math\.round\(result\?\.score \?\? 0\)\}%`/);

  for (const entry of pronunciationCases) {
    assert.equal(entry.normalized * 100, entry.percent);
    assert.equal(pronunciationBandFromContract(entry.percent), entry.band);
  }

  for (const threshold of [95, 88, 80, 70, 60, 50, 40, 30, 20, 10]) {
    assert.match(evaluator, new RegExp(`dtwScorePercent >= ${threshold}`));
  }
});

test('AST parser output is passed directly to the grammar evaluator and then to the UI', async () => {
  const [writing, evaluator, parser] = await Promise.all([
    source('src/pages/app/ielts/IELTSWritingPage.tsx'),
    source('src/domain/curriculum/ieltsEvaluator.ts'),
    source('src/lib/nlp/parser.ts'),
  ]);

  assert.match(writing, /const ast = parser\.parse\(\)/);
  assert.match(writing, /const band = IELTSEvaluator\.evaluateGrammar\(ast\)/);
  assert.match(writing, /setGrammarBand\(maxBand\)/);
  assert.match(writing, /band=\{grammarBand\}/);
  assert.match(writing, /state=\{text\.trim\(\) \? 'ready' : 'unavailable'\}/);

  assert.match(parser, /return \{ type: 'ERROR', value: e\.message \}/);
  assert.match(evaluator, /if \(ast\.type === 'ERROR'\) return 5\.0/);
  assert.match(evaluator, /return Math\.max\(4\.0, Math\.min\(9\.0, band\)\)/);
});

test('UI seam contains no random score, canned fallback, or evaluator bypass', async () => {
  const files = await Promise.all([
    source('src/components/ielts/BandScoreReveal.tsx'),
    source('src/components/ielts/bandScoreRevealState.ts'),
    source('src/pages/app/ielts/IELTSSpeakingPage.tsx'),
    source('src/pages/app/ielts/IELTSWritingPage.tsx'),
  ]);
  const seam = files.join('\n');

  assert.doesNotMatch(seam, /Math\.random|crypto\.getRandomValues/);
  assert.doesNotMatch(seam, /band\s*=\s*Math\./);
  const speaking = files[2];
  const scoreWrites = speaking.match(/setBandScore\([^)]*\)/g) ?? [];
  assert.deepEqual(scoreWrites.sort(), ['setBandScore(band)', 'setBandScore(null)']);
  assert.match(seam, /Invalid ready-state data fails closed to `unavailable`/);
});
