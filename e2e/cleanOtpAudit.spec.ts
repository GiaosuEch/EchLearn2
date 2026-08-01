import { expect, test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Clean Email OTP Verification Screen Audit', () => {
  test('Capture clean OTP verification screen without cheat banner or OTP toast', async ({ page }) => {
    // Force clear all local storage before navigation
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    // 1. Navigate to Register page
    await page.goto('/register');
    await page.waitForSelector('h1:has-text("TẠO TÀI KHOẢN")', { timeout: 15000 });

    // 2. Fill step 1 registration form with unique email
    const testEmail = `testuser_${Date.now()}@example.com`;
    const nameInput = page.locator('input[type="text"]').first();
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput1 = page.locator('input[type="password"]').nth(0);
    const passwordInput2 = page.locator('input[type="password"]').nth(1);

    await nameInput.fill('Nguyen Van Test');
    await emailInput.fill(testEmail);
    await passwordInput1.fill('Password123!');
    await passwordInput2.fill('Password123!');

    // 3. Click "Gửi Mã OTP Xác Thực"
    const submitBtn = page.getByRole('button', { name: /Gửi Mã OTP/i }).first();
    await submitBtn.click();
    await page.waitForTimeout(1500);

    // 4. Verify Step 2 OTP screen is displayed
    const bodyText = await page.textContent('body');
    expect(bodyText).toContain('Mã OTP 6 chữ số cho tài khoản email');

    // 5. CRITICAL VERIFICATION: Ensure NO cheat banner "710653" or "Điền nhanh ⚡" exists
    expect(bodyText).not.toContain('Điền nhanh ⚡');
    expect(bodyText).not.toContain('🔑 Mã xác thực OTP:');

    // 6. Capture screenshot to ./audit_proof/real_otp_screen_clean.png
    await page.screenshot({ path: './audit_proof/real_otp_screen_clean.png', fullPage: true });
  });
});
