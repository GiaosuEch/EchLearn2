import { expect, test } from '@playwright/test';

async function seedLearner(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const userId = 'community_design_user';
    localStorage.setItem('echlern_current_user_id', userId);
    localStorage.setItem('echlern_db_users', JSON.stringify([{
      id: userId, email: 'community@example.com', displayName: 'Minh', username: 'minh', role: 'user', subscriptionTier: 'pro', targetLanguages: ['en'],
    }]));
    localStorage.setItem('echlern_db_user_settings', JSON.stringify([{
      id: userId, userId, interfaceLanguage: 'vi', nativeLanguage: 'vi', targetLanguage: 'en', theme: 'light', soundEffects: true, speechSpeed: 'normal', fontSize: 'medium', dailyXpGoal: 50, ieltsTargetBand: 7, publicProfile: true,
    }]));
  });
}

test.describe('Guided learning design language', () => {
  test.setTimeout(90_000);

  test('public landing presents a concrete first learning action without horizontal overflow', async ({ page }) => {
    for (const viewport of [
      { width: 320, height: 720 },
      { width: 1440, height: 960 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#main-content')).toBeVisible({ timeout: 30_000 });
      await expect(page.getByRole('heading', { name: 'Mỗi ngày 8 phút, tiếng Anh tiến một bước.' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Bắt đầu 8 phút đầu tiên' }).first()).toHaveAttribute('href', '/first-win');
      await expect(page.getByRole('heading', { name: 'Phản xạ tiếng Anh trong 8 phút' })).toBeVisible();
      await expect(page.locator('[role="img"][aria-label*="Ech Buri"]').first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  });

  test('dashboard gives the learner one recorded focus and truthful next actions', async ({ page }) => {
    await seedLearner(page);
    await page.goto('/app/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#app-main')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Kế hoạch học hôm nay')).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Chào / })).toBeVisible();
    await expect(page.getByRole('link', { name: /Bắt đầu Realworld Mastery/ })).toHaveAttribute('href', /^\/app\/survival\?lesson=/);
    await expect(page.getByRole('link', { name: 'Xem lộ trình học' })).toHaveAttribute('href', '/app/roadmap');
    await expect(page.locator('[role="img"][aria-label*="Ech Buri"]').first()).toBeVisible();
  });
});
