import { expect, test } from '@playwright/test';

const FREE_USER = {
  id: 'free_user_001',
  email: 'freelearner@example.com',
  displayName: 'Học Viên Thường',
  username: 'freelearner',
  role: 'user',
  subscriptionTier: 'free',
  targetLanguages: ['en'],
  level: 1,
  xp: 10,
  streak: 1,
  hearts: 5,
  createdAt: new Date().toISOString(),
};

test.describe('Strict Security & Entitlement Router Guard Playwright Suite', () => {
  test.setTimeout(90_000);

  test('1. Free user attempting direct URL access to /app/admin is blocked at Router level and redirected to /app/pricing', async ({ page }) => {
    // Inject Free User session into localDatabase keys before page loads
    await page.addInitScript(({ freeUser }) => {
      const userSettings = {
        id: freeUser.id,
        userId: freeUser.id,
        interfaceLanguage: 'vi',
        nativeLanguage: 'vi',
        targetLanguage: 'en',
        theme: 'light',
      };
      localStorage.setItem('echlern_db_users', JSON.stringify([freeUser]));
      localStorage.setItem('echlern_db_user_settings', JSON.stringify([userSettings]));
      localStorage.setItem('echlern_current_user_id', freeUser.id);
    }, { freeUser: FREE_USER });

    // Hacker scenario: Free user type direct URL to Admin panel
    await page.goto('/app/admin', { waitUntil: 'commit' });
    await page.waitForURL(/\/app\/pricing/, { timeout: 60_000 });

    // Verify redirected URL is /app/pricing
    const currentUrl = page.url();
    expect(currentUrl).toContain('/pricing');

    // Capture proof screenshot
    await page.screenshot({ path: './audit_proof/01_admin_blocked_real.png', fullPage: true });
  });

  test('2. Free user attempting direct URL access to restricted language practice (/app/practice?lang=FR) is blocked and redirected to /app/pricing', async ({ page }) => {
    // Inject Free User session into localDatabase keys before page loads
    await page.addInitScript(({ freeUser }) => {
      const userSettings = {
        id: freeUser.id,
        userId: freeUser.id,
        interfaceLanguage: 'vi',
        nativeLanguage: 'vi',
        targetLanguage: 'en',
        theme: 'light',
      };
      localStorage.setItem('echlern_db_users', JSON.stringify([freeUser]));
      localStorage.setItem('echlern_db_user_settings', JSON.stringify([userSettings]));
      localStorage.setItem('echlern_current_user_id', freeUser.id);
    }, { freeUser: FREE_USER });

    // Hacker scenario: Free user type direct URL to restricted French language practice
    await page.goto('/app/practice?lang=FR', { waitUntil: 'commit' });
    await page.waitForURL(/\/app\/pricing/, { timeout: 60_000 });

    // Verify redirected URL is /app/pricing
    const currentUrl = page.url();
    expect(currentUrl).toContain('/pricing');

    // Capture proof screenshot
    await page.screenshot({ path: './audit_proof/02_language_blocked_real.png', fullPage: true });
  });

});
