import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = (relativePath: string) => readFile(new URL(`../../${relativePath}`, import.meta.url), 'utf8');

// ── Slice 7.1 — design-system tokens ────────────────────────────────────────
test('index.css exposes the Phase 7 typography, spacing, radius and motion tokens', async () => {
  const css = await source('src/index.css');

  assert.match(css, /--text-display:\s*2\.5rem/);
  assert.match(css, /--text-h1:/);
  assert.match(css, /--text-caption:/);
  assert.match(css, /--leading-tight:/);
  assert.match(css, /--tracking-tight:/);
  assert.match(css, /--space-4:\s*1rem/);
  assert.match(css, /--radius-xl:/);
  assert.match(css, /--ech-ease-out:/);
  assert.match(css, /--ech-dur-reveal:\s*900ms/);
});

test('index.css keeps the restrained education philosophy — glass stays neutered', async () => {
  const css = await source('src/index.css');
  // The compat block must explicitly disable backdrop-filter for glass classes.
  assert.match(css, /backdrop-filter:\s*none/);
});

// ── Slice 7.2 — shared UI primitives ────────────────────────────────────────
test('AnimatedNumber guarantees the exact final value and honors reduced motion', async () => {
  const component = await source('src/components/ui/AnimatedNumber.tsx');

  assert.match(component, /useReducedMotion/);
  assert.match(component, /guarantee exact final value/);
  assert.match(component, /if \(reducedMotion \|\| !Number\.isFinite\(value\)\)/);
  // Deterministic easing — no randomness anywhere in a value renderer.
  assert.doesNotMatch(component, /Math\.random/);
});

test('ProgressRing clamps its ratio and is an accessible progressbar', async () => {
  const component = await source('src/components/ui/ProgressRing.tsx');

  assert.match(component, /role="progressbar"/);
  assert.match(component, /Math\.min\(1, Math\.max\(0, value\)\)/);
  assert.doesNotMatch(component, /Math\.random/);
});

test('the ui barrel exports every Phase 7 primitive from Platform Core', async () => {
  const barrel = await source('src/components/ui/index.ts');

  for (const name of ['AnimatedNumber', 'ProgressRing', 'Card', 'Button', 'Badge', 'SectionHeading', 'StatTile']) {
    assert.match(barrel, new RegExp(`export \\{ default as ${name} \\}`));
  }
  // Platform Core primitives must not leak IELTS / track terms.
  assert.doesNotMatch(barrel, /IELTS|Band|TOEIC|TOEFL/);
});

test('shared primitives avoid glassmorphism and decorative gradients', async () => {
  const files = await Promise.all([
    source('src/components/ui/Card.tsx'),
    source('src/components/ui/Button.tsx'),
    source('src/components/ui/Badge.tsx'),
  ]);
  for (const file of files) {
    assert.doesNotMatch(file, /backdrop-filter|linearGradient|radial-gradient/i);
  }
});

// ── Slice 7.3 — BandScoreReveal (Product-Pack layer) ────────────────────────
test('BandScoreReveal never fabricates a score and renders an explicit unavailable state', async () => {
  const component = await source('src/components/ielts/BandScoreReveal.tsx');

  assert.match(component, /NON-FABRICATION CONTRACT/);
  assert.match(component, /resolveBandRevealState\(\{ state, band, scale \}\)/);
  assert.match(component, /if \(resolvedState === 'computing'\)/);
  assert.match(component, /if \(resolvedState !== 'ready' \|\| typeof band !== 'number'\)/);
  assert.match(component, /Chưa khả dụng/);
  // The count-up is only used for a real, computed band.
  assert.match(component, /<AnimatedNumber/);
  assert.doesNotMatch(component, /Math\.random/);
  // Deterministic band → color thresholds mirror the evaluator's 5.0 / 7.0 bands.
  assert.match(component, /band >= 7\.0/);
  assert.match(component, /band >= 5\.0/);
});

// ── Slice 7.4 — shared motion preset + PageShell hardening ──────────────────
test('motion presets collapse to an instant, transform-free state under reduced motion', async () => {
  const presets = await source('src/components/ui/motionPresets.ts');

  assert.match(presets, /export function fadeRise/);
  assert.match(presets, /export function fadeIn/);
  assert.match(presets, /if \(reducedMotion\)/);
  assert.match(presets, /initial: false/);
  assert.match(presets, /duration: 0/);
});

test('PageShell drives its entry through the reduced-motion-safe preset', async () => {
  const shell = await source('src/pages/PageShell.tsx');

  assert.match(shell, /useReducedMotion/);
  assert.match(shell, /fadeRise\(reducedMotion\)/);
  assert.match(shell, /fadeIn\(reducedMotion, 0\.2\)/);
  // The old always-on animation must be gone.
  assert.doesNotMatch(shell, /initial=\{\{ opacity: 0, y: 20 \}\}/);
});

// ── Slice 7.5 — wiring into IELTS surfaces (math stays read-only) ───────────
test('IELTS Speaking still derives the Band from the deterministic DTW evaluator', async () => {
  const page = await source('src/pages/app/ielts/IELTSSpeakingPage.tsx');

  assert.match(page, /import BandScoreReveal from '\.\.\/\.\.\/\.\.\/components\/ielts\/BandScoreReveal'/);
  assert.match(page, /IELTSEvaluator\.evaluatePronunciation\(score \* 100\)/);
  assert.match(page, /state="computing"/);
  assert.doesNotMatch(page, /Math\.random/);
});

test('IELTS Writing still derives the GRA Band from the deterministic AST evaluator', async () => {
  const page = await source('src/pages/app/ielts/IELTSWritingPage.tsx');

  assert.match(page, /import BandScoreReveal from '\.\.\/\.\.\/\.\.\/components\/ielts\/BandScoreReveal'/);
  assert.match(page, /IELTSEvaluator\.evaluateGrammar\(ast\)/);
  // No draft => explicit unavailable, never a fabricated 5.0 hero number.
  assert.match(page, /state=\{text\.trim\(\) \? 'ready' : 'unavailable'\}/);
  assert.doesNotMatch(page, /Math\.random/);
});
