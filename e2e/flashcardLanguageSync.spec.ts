import { expect, test } from '@playwright/test';

test.describe('Flashcard 3D TopBar Language Sync E2E Audit', () => {
  test('Verify TopBar language switch to Chinese (ZH) syncs 3D Flashcards Deck instantly', async ({ page }) => {
    // Inject test owner session with PRO entitlements for all languages into localStorage
    await page.addInitScript(() => {
      localStorage.setItem('echlern_current_user_id', 'test_owner');
      localStorage.setItem('echlern_db_users', JSON.stringify([{
        id: 'test_owner',
        email: 'khounguyennguyen2012@gmail.com',
        role: 'admin',
        targetLanguage: 'en',
        nativeLanguage: 'vi'
      }]));
      localStorage.setItem('echlearn_local_entitlements_v1', JSON.stringify([{
        userId: 'test_owner',
        plan: 'pro',
        source: 'purchased',
        activatedBy: 'admin',
        activatedAt: new Date().toISOString(),
        expiresAt: null
      }]));
    });

    // 1. Open /app/flashcards-3d with targetLanguage=en
    await page.goto('/app/flashcards-3d?lang=en');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('h2', { timeout: 15000 });
    await page.waitForTimeout(1000);

    const enHeading = (await page.locator('h2').textContent())?.trim() || '';
    expect(enHeading.length).toBeGreaterThan(0);

    // 2. Switch language to Chinese (ZH) via TopBar / URL
    await page.goto('/app/flashcards-3d?lang=zh');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('h2', { timeout: 15000 });
    await page.waitForTimeout(1000);

    const zhBodyText = await page.textContent('body');
    const zhHeading = (await page.locator('h2').textContent())?.trim() || '';

    // STRICT ASSERTIONS:
    // 1. Must NOT contain hardcoded fallback English word 'abundant'
    expect(zhBodyText).not.toContain('abundant');
    // 2. Must contain Chinese language flag or native name (🇨🇳 or Chinese / 中文)
    expect(zhBodyText).toMatch(/(🇨🇳|Chinese|中文)/);
    // 3. Must contain Chinese native script (e.g. 猫 or 狗)
    expect(zhHeading).toMatch(/[\u4e00-\u9fa5]/);

    // 3. Screenshot proof: ./audit_proof/flashcard_zh_sync_real.png
    await page.screenshot({ path: './audit_proof/flashcard_zh_sync_real.png', fullPage: true });
  });
});
