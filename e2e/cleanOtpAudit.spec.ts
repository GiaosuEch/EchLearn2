import { expect, test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Registration flow audit', () => {
  test('moves from personal details to language selection without exposing an OTP shortcut', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    await page.goto('/register');
    await expect(page.locator('#register-name')).toBeVisible();

    const testEmail = `testuser_${Date.now()}@example.com`;
    await page.locator('#register-name').fill('Nguyen Van Test');
    await page.locator('#register-username').fill('nguyenvantest');
    await page.locator('#register-email').fill(testEmail);
    await page.locator('#register-password').fill('Password123!');

    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#register-name')).toHaveCount(0);
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    const bodyText = await page.textContent('body');
    expect(bodyText).not.toMatch(/OTP|710653/);

    await page.screenshot({ path: './audit_proof/registration_language_step.png', fullPage: true });
  });
});
