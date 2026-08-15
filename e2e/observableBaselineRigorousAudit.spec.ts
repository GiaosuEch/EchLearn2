import { test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type Category =
  | 'document-load'
  | 'console-error'
  | 'console-warning'
  | 'page-error'
  | 'failed-request'
  | 'broken-image'
  | 'accessible-name'
  | 'image-alt'
  | 'horizontal-overflow'
  | 'duplicate-id'
  | 'empty-interactive'
  | 'invalid-internal-navigation'
  | 'landmark-title';

type Finding = {
  category: Category;
  route: string;
  viewport: string;
  evidence: string;
  url?: string;
  status?: number;
};

const publicAndAuthRoutes = [
  '/', '/first-win', '/about', '/pricing', '/languages', '/ielts-program',
  '/community-preview', '/privacy', '/terms', '/cookies', '/contact',
  '/login', '/register', '/forgot-password', '/reset-password',
];

// Representative smoke routes are taken directly from src/App.tsx and span the
// application shell, learning, immersion, exam, language-pack, gamification,
// community, account, and admin surfaces. No route is invented for this audit.
const applicationRoutes = [
  '/app', '/app/languages', '/app/roadmap', '/app/practice?lang=en',
  '/app/immersion/article', '/app/reference-charts', '/app/ielts',
  '/app/japanese', '/app/chinese', '/app/korean', '/app/podcasts',
  '/app/quizzes', '/app/community', '/app/groups', '/app/profile',
  '/app/settings', '/app/customize', '/app/admin',
];

const routes = [...publicAndAuthRoutes, ...applicationRoutes];
const viewports = [
  { name: 'desktop-1280x900', width: 1280, height: 900 },
  { name: 'mobile-390x844', width: 390, height: 844 },
];

const knownStaticPaths = new Set([
  ...publicAndAuthRoutes,
  '/app', '/app/ai-onboarding', '/app/first-win', '/app/mastery-mission',
  '/app/languages', '/app/dashboard', '/app/pricing', '/app/roadmap',
  '/app/courses', '/app/music', '/app/infinity-demo', '/app/infinity-integration',
  '/app/lesson', '/app/survival', '/app/practice', '/app/listening',
  '/app/listening/videos', '/app/speaking', '/app/reading', '/app/reading/news',
  '/app/writing', '/app/writing/master', '/app/vocabulary', '/app/grammar',
  '/app/immersion/article', '/app/immersion/podcast', '/app/reference-charts',
  '/app/ielts', '/app/ielts/placement', '/app/ielts/listening',
  '/app/ielts/reading', '/app/ielts/writing', '/app/ielts/speaking',
  '/app/ielts/vocabulary', '/app/mock-tests', '/app/japanese',
  '/app/chinese', '/app/korean', '/app/japanese/kana',
  '/app/japanese/vocabulary', '/app/japanese/reading', '/app/japanese/grammar',
  '/app/chinese/vocabulary', '/app/chinese/grammar', '/app/chinese/reading',
  '/app/chinese/pronunciation', '/app/korean/hangul', '/app/korean/vocabulary',
  '/app/korean/grammar', '/app/korean/reading', '/app/korean/pronunciation',
  '/app/podcasts', '/app/quizzes', '/app/speed-quiz', '/app/flashcards',
  '/app/flashcards-3d', '/app/weekly-report', '/app/missions', '/app/calendar',
  '/app/leaderboard', '/app/achievements', '/app/community', '/app/groups',
  '/app/voice-rooms', '/app/chat', '/app/community/friends',
  '/app/community/chat', '/app/community/voice-rooms', '/app/community/discord',
  '/app/discord', '/app/profile', '/app/edit-profile', '/app/friends',
  '/app/notifications', '/app/settings', '/app/customize', '/app/admin',
  '/app/admin/subscriptions',
]);

const reportPath = path.resolve('test-results', 'observable-baseline-rigorous-audit.json');

test('collects observable baseline findings across real application routes', async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  const findings: Finding[] = [];
  let activeRoute = 'before-navigation';
  let activeViewport = 'unknown';

  const add = (finding: Omit<Finding, 'route' | 'viewport'>) => {
    findings.push({ route: activeRoute, viewport: activeViewport, ...finding });
  };

  page.on('console', (message) => {
    if (message.type() === 'error') add({ category: 'console-error', evidence: message.text() });
    if (message.type() === 'warning') add({ category: 'console-warning', evidence: message.text() });
  });
  page.on('pageerror', (error) => add({ category: 'page-error', evidence: error.message }));
  page.on('requestfailed', (request) => {
    const errorText = request.failure()?.errorText ?? 'unknown failure';
    // A route change cancels in-flight module/media requests. Those browser-side
    // cancellations are audit mechanics, not evidence that the server failed.
    if (errorText.includes('ERR_ABORTED')) return;
    add({
      category: 'failed-request',
      evidence: `${request.method()} ${request.url()} — ${errorText}`,
      url: request.url(),
    });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) add({
      category: 'failed-request',
      evidence: `${response.request().method()} ${response.url()} returned ${response.status()}`,
      url: response.url(),
      status: response.status(),
    });
  });

  for (const viewport of viewports) {
    activeViewport = viewport.name;
    await page.setViewportSize(viewport);

    for (const route of routes) {
      activeRoute = route;
      let response = null;
      try {
        response = await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15_000 });
        await page.waitForTimeout(250);
      } catch (error) {
        add({ category: 'document-load', evidence: `Navigation threw: ${String(error)}` });
        continue;
      }

      if (!response) {
        add({ category: 'document-load', evidence: 'Navigation produced no observable main-resource response.' });
      } else if (response.status() >= 400) {
        add({
          category: 'document-load',
          evidence: `Main document returned HTTP ${response.status()}.`,
          url: response.url(),
          status: response.status(),
        });
      }

      let snapshot;
      try {
        snapshot = await page.evaluate(() => {
        const selector = (element: Element) => {
          const tag = element.tagName.toLowerCase();
          const id = element.id ? `#${element.id}` : '';
          const classes = Array.from(element.classList).slice(0, 2).map((value) => `.${value}`).join('');
          return `${tag}${id}${classes}`;
        };
        const accessibleName = (element: Element) => {
          const labelledBy = element.getAttribute('aria-labelledby');
          const labelledText = labelledBy
            ? labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' ')
            : '';
          return [element.getAttribute('aria-label'), labelledText, element.getAttribute('alt'),
            element.getAttribute('title'), element.textContent, (element as HTMLInputElement).value]
            .find((value) => value?.trim())?.trim() ?? '';
        };
        const interactive = Array.from(document.querySelectorAll(
          'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [role="link"]',
        )).filter((element) => !(element as HTMLElement).hidden && element.getAttribute('aria-hidden') !== 'true');
        const ids = Array.from(document.querySelectorAll('[id]')).map((element) => element.id).filter(Boolean);
        const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
        const images = Array.from(document.images);
        const currentOrigin = location.origin;
        const internalLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]')).flatMap((link) => {
          try {
            const url = new URL(link.href, location.href);
            return url.origin === currentOrigin ? [{ href: link.getAttribute('href') ?? '', pathname: url.pathname, hash: url.hash, selector: selector(link) }] : [];
          } catch {
            return [{ href: link.getAttribute('href') ?? '', pathname: '', hash: '', selector: selector(link) }];
          }
        });
        return {
          title: document.title.trim(),
          htmlLang: document.documentElement.lang.trim(),
          mainCount: document.querySelectorAll('main, [role="main"]').length,
          navCount: document.querySelectorAll('nav, [role="navigation"]').length,
          overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
          duplicateIds,
          brokenImages: images.filter((image) => image.complete && image.naturalWidth === 0).map((image) => `${selector(image)} src=${image.currentSrc || image.src}`),
          missingAlt: images.filter((image) => !image.hasAttribute('alt')).map(selector),
          unnamedInteractive: interactive.filter((element) => !accessibleName(element)).map(selector),
          emptyLinksButtons: interactive.filter((element) => (element.matches('a,button,[role="button"],[role="link"]')) && !accessibleName(element)).map(selector),
          internalLinks,
        };
      });
      } catch (error) {
        add({ category: 'document-load', evidence: `DOM inspection failed after navigation: ${String(error)}` });
        continue;
      }

      if (!snapshot.title) add({ category: 'landmark-title', evidence: 'Document title is empty.' });
      if (!snapshot.htmlLang) add({ category: 'landmark-title', evidence: 'The html element has no lang value.' });
      if (snapshot.mainCount !== 1) add({ category: 'landmark-title', evidence: `Expected one main landmark; observed ${snapshot.mainCount}.` });
      if (snapshot.navCount === 0) add({ category: 'landmark-title', evidence: 'No navigation landmark was observed.' });
      if (snapshot.overflow > 1) add({ category: 'horizontal-overflow', evidence: `Document exceeds viewport by ${snapshot.overflow}px.` });
      for (const id of snapshot.duplicateIds) add({ category: 'duplicate-id', evidence: `Duplicate id="${id}".` });
      for (const evidence of snapshot.brokenImages) add({ category: 'broken-image', evidence });
      for (const evidence of snapshot.missingAlt) add({ category: 'image-alt', evidence: `${evidence} has no alt attribute.` });
      for (const evidence of snapshot.unnamedInteractive) add({ category: 'accessible-name', evidence: `${evidence} has no observable accessible name.` });
      for (const evidence of snapshot.emptyLinksButtons) add({ category: 'empty-interactive', evidence: `${evidence} is an empty link/button.` });

      for (const link of snapshot.internalLinks) {
        if (!link.pathname) {
          add({ category: 'invalid-internal-navigation', evidence: `${link.selector} has an unparsable href: ${link.href}` });
          continue;
        }
        const validDynamicGroup = /^\/app\/groups\/[^/]+$/.test(link.pathname);
        if (!knownStaticPaths.has(link.pathname) && !validDynamicGroup) {
          add({ category: 'invalid-internal-navigation', evidence: `${link.selector} points to an internal path absent from src/App.tsx: ${link.href}` });
        }
        const currentPathname = new URL(page.url()).pathname;
        if (link.hash && link.pathname === currentPathname) {
          const fragmentExists = await page.evaluate((hash) => Boolean(document.getElementById(decodeURIComponent(hash.slice(1)))), link.hash);
          if (!fragmentExists) add({ category: 'invalid-internal-navigation', evidence: `${link.selector} points to missing fragment target ${link.hash}.` });
        }
      }
    }
  }

  const counts = findings.reduce<Record<string, number>>((acc, finding) => {
    acc[finding.category] = (acc[finding.category] ?? 0) + 1;
    return acc;
  }, {});
  const report = {
    audit: 'observable baseline Playwright audit',
    generatedAt: new Date().toISOString(),
    baseURL: testInfo.project.use.baseURL,
    sourceRoutes: 'src/App.tsx',
    routesAudited: routes,
    viewports,
    outcome: findings.length ? 'completed-with-findings' : 'completed-without-findings',
    counts,
    findings,
    limitations: [
      'No committed Playwright screenshot baseline was found; this audit does not claim pixel-perfect visual validation.',
      'Accessibility checks are observable DOM heuristics, not a complete WCAG conformance assessment.',
      'Authenticated production behavior is not proven: the running Vite development build contains a development-only auth bypass, while production redirects unauthenticated users.',
      'Route smoke coverage is representative across route families; parameterized group detail pages are validated as route patterns rather than exhaustively enumerated.',
      'Third-party availability and browser-extension behavior are outside the application baseline and may appear as network findings when observable.',
    ],
  };

  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
});
