import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = (relativePath: string) => readFile(new URL(`../../${relativePath}`, import.meta.url), 'utf8');

const componentPath = 'src/components/mascot/EchBuriAnimated.tsx';

test('EchBuriAnimated exposes idle and success vector states with motion safeguards', async () => {
  const component = await source(componentPath);

  assert.match(component, /'idle' \| 'success'/);
  assert.match(component, /useReducedMotion/);
  assert.match(component, /willChange/);
  assert.doesNotMatch(component, /linearGradient|radialGradient|<img/);
});

test('the mascot stays a self-contained vector with no raster or external artwork', async () => {
  const component = await source(componentPath);

  assert.match(component, /<svg viewBox="0 0 240 240"/);
  assert.doesNotMatch(component, /<image|url\(|\.png|\.gif|\.svg'|lottie/i);
});

test('animation is gated on both the user setting and the system reduced-motion preference', async () => {
  const component = await source(componentPath);

  assert.match(component, /mascotAnimation/);
  assert.match(component, /motionEnabled = animate && !reducedMotion && mascotAnimation/);
});

test('new installs enable the companion while reduced motion remains a hard stop', async () => {
  const [store, component] = await Promise.all([
    source('src/stores/appStore.ts'),
    source(componentPath),
  ]);

  assert.match(store, /mascotAnimation: true/);
  assert.match(component, /motionEnabled = animate && !reducedMotion && mascotAnimation/);
});

test('idle breathing and blinking loop while success resolves once', async () => {
  const component = await source(componentPath);

  assert.match(component, /duration: 3\.2[\s\S]*repeat: Infinity/);
  assert.match(component, /duration: 5\.4[\s\S]*repeat: Infinity/);
  assert.match(component, /scaleY: \[1, 1, 0\.12, 1\]/);
  assert.match(component, /success: \{ y: \[0, -12, 0\], rotate: \[0, -3, 3, 0\]/);
});

test('the mascot animates transform and opacity only so it stays on the compositor', async () => {
  const component = await source(componentPath);

  const animatedProperties = [...component.matchAll(/^\s{2}(?:idle|success):/gm)];
  assert.ok(animatedProperties.length >= 3, 'expects idle and success variants for body, eyes and book');
  assert.doesNotMatch(component, /(?:width|height|top|left|margin|boxShadow|filter):\s*\[/);
});

test('the hero and dashboard render the animated mascot instead of the legacy artwork', async () => {
  const [hero, dashboard] = await Promise.all([
    source('src/components/landing/CinematicHero.tsx'),
    source('src/pages/app/DashboardPage.tsx'),
  ]);

  assert.match(hero, /EchBuriAnimated/);
  assert.match(hero, /<EchBuriAnimated size=\{200\}/);
  assert.doesNotMatch(hero, /<Mascot expression="happy"/);

  assert.match(dashboard, /EchBuriAnimated/);
  assert.match(dashboard, /<EchBuriAnimated size=\{120\}/);
  assert.match(dashboard, /<EchBuriAnimated size=\{56\}/);
  assert.match(dashboard, /<EchBuriAnimated size=\{40\}/);
  assert.doesNotMatch(dashboard, /CustomEmote type="mascot-happy"/);
});

test('the landing hero keeps the learning message and mascot side by side on tablet screens', async () => {
  const hero = await source('src/components/landing/CinematicHero.tsx');

  assert.match(hero, /md:grid-cols-\[1\.05fr_0\.95fr\]/);
  assert.match(hero, /bg-\[#fffaf2\]/);
  assert.match(hero, /bg-\[#fff7e8\]/);
});

test('the lesson player maps answer progress and outcomes to one shared mascot state', async () => {
  const lesson = await source('src/pages/app/LessonPlayerPage.tsx');

  assert.match(lesson, /const mascotState(?:: EchBuriAnimationState)? = showResult/);
  assert.match(lesson, /selected \|\| userInput \? 'thinking' : 'idle'/);
  assert.match(lesson, /state=\{mascotState\}/);
});

test('the static mascot component stays available for the screens that still use it', async () => {
  const mascot = await source('src/components/mascot/Mascot.tsx');

  assert.match(mascot, /export/);
});

test('the public community preview uses clear Vietnamese value instead of unverified audience counts', async () => {
  const pages = await source('src/pages/app/AllPages.tsx');
  const preview = pages.slice(pages.indexOf('export function CommunityPreviewPage'));

  assert.match(preview, /Học đều hơn khi có người đồng hành/);
  assert.match(preview, /Nhóm học theo mục tiêu/);
  assert.match(preview, /Bắt đầu cùng cộng đồng/);
  assert.doesNotMatch(preview, /Join Our Community|10,000\+|Active Learners|Join Free/);
});

test('the reset password flow uses the EchLearn brand and an accessible email field', async () => {
  const [translations, resetPage] = await Promise.all([
    source('src/i18n/phase129Text.ts'),
    source('src/pages/auth/ForgotPasswordPage.tsx'),
  ]);

  assert.doesNotMatch(translations, /Ech Lern/);
  assert.match(translations, /EchLearn/);
  assert.match(resetPage, /htmlFor="reset-email"/);
  assert.match(resetPage, /id="reset-email"/);
  assert.match(resetPage, /autoComplete="email"/);
  assert.match(resetPage, /role="alert"/);
});
