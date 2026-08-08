import { expect, test } from '@playwright/test';

const routes = [
  '/app',
  '/app/ai-onboarding',
  '/app/mastery-mission',
  '/app/languages',
  '/app/dashboard',
  '/app/roadmap',
  '/app/courses',
  '/app/music',
  '/app/lesson?lang=en',
  '/app/practice?lang=en',
  '/app/listening?lang=en',
  '/app/listening/videos?lang=en',
  '/app/speaking?lang=en',
  '/app/reading?lang=en',
  '/app/reading/news?lang=en',
  '/app/writing?lang=en',
  '/app/writing/master?lang=en',
  '/app/vocabulary?lang=en',
  '/app/grammar?lang=en',
  '/app/reference-charts',
  '/app/ielts',
  '/app/ielts/placement',
  '/app/ielts/listening',
  '/app/ielts/reading',
  '/app/ielts/writing',
  '/app/ielts/speaking',
  '/app/ielts/vocabulary',
  '/app/mock-tests',
  '/app/podcasts',
  '/app/quizzes',
  '/app/speed-quiz?lang=en',
  '/app/flashcards-3d?lang=en',
  '/app/flashcards?lang=en',
  '/app/weekly-report',
  '/app/missions',
  '/app/calendar',
  '/app/leaderboard',
  '/app/achievements',
  '/app/community',
  '/app/groups',
  '/app/groups/english-practice',
  '/app/voice-rooms',
  '/app/chat',
  '/app/friends',
  '/app/discord',
  '/app/community/friends',
  '/app/community/chat',
  '/app/community/voice-rooms',
  '/app/community/discord',
  '/app/profile',
  '/app/edit-profile',
  '/app/notifications',
  '/app/settings',
  '/app/customize',
  '/app/pricing',
  '/app/admin',
  '/app/admin/subscriptions',
];

const publicRoutes = ['/', '/about', '/pricing', '/languages', '/ielts-program', '/community-preview'];

test.describe.configure({ mode: 'serial' });

test.describe('Authenticated application route runtime audit', () => {
  test.setTimeout(180_000);

  test('every internal route renders an application shell without an uncaught page error', async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.addInitScript(() => {
      const userId = 'route_audit_admin';
      localStorage.setItem('echlern_current_user_id', userId);
      localStorage.setItem('echlern_db_users', JSON.stringify([{
        id: userId,
        email: 'khounguyennguyen2012@gmail.com',
        displayName: 'GiaosuEch',
        username: 'GiaosuEch',
        role: 'admin',
        subscriptionTier: 'pro',
        targetLanguages: ['en'],
        nativeLanguage: 'vi',
      }]));
      localStorage.setItem('echlern_db_user_settings', JSON.stringify([{
        id: userId,
        userId,
        interfaceLanguage: 'vi',
        nativeLanguage: 'vi',
        targetLanguage: 'en',
        theme: 'light',
        soundEffects: true,
        speechSpeed: 'normal',
        fontSize: 'medium',
        dailyXpGoal: 50,
        ieltsTargetBand: 7,
        publicProfile: true,
      }]));
      localStorage.setItem('echlearn_local_entitlements_v1', JSON.stringify([{
        userId,
        plan: 'pro',
        source: 'purchased',
        activatedBy: userId,
        activatedAt: new Date().toISOString(),
        expiresAt: null,
      }]));
    });

    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#app-main')).toBeVisible({ timeout: 15_000 });
      await expect(page.locator('[role="alert"]')).toHaveCount(0);
      expect(page.url(), route).toContain('/app');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      expect(await page.evaluate(() => {
        const ids = Array.from(document.querySelectorAll('[id]')).map((element) => element.id);
        return ids.filter((id, index) => ids.indexOf(id) !== index);
      })).toEqual([]);

      await page.setViewportSize({ width: 390, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.setViewportSize({ width: 1280, height: 900 });
    }

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('every public route stays within the mobile viewport and keeps its navigation usable', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of publicRoutes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#main-content')).toBeVisible({ timeout: 15_000 });
      await expect(page.locator('[role="alert"]')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      expect(await page.evaluate(() => {
        const ids = Array.from(document.querySelectorAll('[id]')).map((element) => element.id);
        return ids.filter((id, index) => ids.indexOf(id) !== index);
      })).toEqual([]);
    }

    // The home hero previously broke around tablet widths, between its desktop
    // and mobile breakpoints. Keep that interpolation in the audit as well.
    await page.setViewportSize({ width: 970, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 15_000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    const keyboardPage = await page.context().newPage();
    await keyboardPage.setViewportSize({ width: 390, height: 844 });
    await keyboardPage.goto('/pricing', { waitUntil: 'domcontentloaded' });
    const skipLink = keyboardPage.locator('a[href="#main-content"]');
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
    await keyboardPage.keyboard.press('Enter');
    await expect(keyboardPage.locator('#main-content')).toBeFocused();
    await keyboardPage.close();

    const menuToggle = page.locator('button[aria-controls="public-mobile-menu"]');
    await expect(menuToggle).toBeVisible();
    await menuToggle.click();
    await expect(page.locator('#public-mobile-menu')).toBeVisible();
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});
