import { expect, test } from '@playwright/test';

async function seedAuthenticatedLearner(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const userId = 'ech_buri_experience_user';
    localStorage.setItem('echlern_current_user_id', userId);
    localStorage.setItem('echlern_db_users', JSON.stringify([{
      id: userId,
      email: 'learner@example.com',
      displayName: 'Minh',
      username: 'minh',
      role: 'user',
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
  });
}

test.describe.configure({ mode: 'serial' });

test.describe('Signature Ech Buri experience', () => {
  test.setTimeout(90_000);
  test('landing renders Ech Buri in a welcoming pose', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 20_000 });

    const mascot = page.locator('[role="img"][aria-label*="Ech Buri"]').first();
    await expect(mascot).toBeVisible();
    await expect(mascot).toHaveAttribute('data-mascot-state', 'welcome');
  });

  test('landing makes the eight-minute first win the primary public action', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: /Mỗi ngày 8 phút.*tiếng Anh tiến một bước/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Bắt đầu 8 phút đầu tiên/i }).first()).toHaveAttribute('href', '/register');
    await expect(page.getByRole('list', { name: 'Lộ trình ngày đầu tiên' })).toBeVisible();
    await expect(page.getByText('Nhận bước tiếp theo cho ngày mai')).toBeVisible();
  });

  test('landing keeps the welcome mascot responsive without horizontal overflow', async ({ page }) => {
    for (const viewport of [
      { width: 320, height: 720 },
      { width: 768, height: 900 },
      { width: 1024, height: 900 },
      { width: 1440, height: 960 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#main-content')).toBeVisible({ timeout: 20_000 });

      const mascot = page.locator('[role="img"][aria-label*="Ech Buri"]').first();
      await expect(mascot).toBeVisible();
      await expect(mascot).toHaveAttribute('data-mascot-state', 'welcome');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  });

  test('dashboard greets an authenticated learner with Ech Buri', async ({ page }) => {
    await seedAuthenticatedLearner(page);
    await page.goto('/app/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#app-main')).toBeVisible({ timeout: 20_000 });

    const mascot = page.locator('[role="img"][aria-label*="Ech Buri"]').first();
    await expect(mascot).toBeVisible();
    await expect(mascot).toHaveAttribute('data-mascot-state', 'welcome');
  });

  test('registration uses a celebratory Ech Buri encouragement', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('form').first()).toBeVisible({ timeout: 20_000 });

    const mascot = page.locator('[role="img"][aria-label*="Ech Buri"]').first();
    await expect(mascot).toBeVisible();
    await expect(mascot).toHaveAttribute('data-mascot-state', 'success');
  });

  test('streak recovery uses an encouraging recovery pose', async ({ page }) => {
    await seedAuthenticatedLearner(page);
    await page.goto('/app/calendar', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#app-main')).toBeVisible({ timeout: 20_000 });

    const recoveryCard = page.getByText('Keep it going!').locator('..');
    const mascot = recoveryCard.locator('[role="img"][aria-label*="Ech Buri"]');
    await expect(mascot).toBeVisible();
    await expect(mascot).toHaveAttribute('data-mascot-state', 'incorrect');
  });

  test('audio lesson waits in an attentive listening pose', async ({ page }) => {
    await seedAuthenticatedLearner(page);
    await page.goto('/app/lesson?lang=en', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#app-main')).toBeVisible({ timeout: 20_000 });

    const mascot = page.locator('[role="img"][aria-label*="Ech Buri"]').first();
    await expect(mascot).toBeVisible();
    await expect(mascot).toHaveAttribute('data-mascot-state', 'listening');
  });
});
