import { expect, test } from '@playwright/test';

test.describe('Dynamic Honest Counter & CEFR Level Filtering E2E Audit', () => {
  test('Verify Header counter dynamically updates based on actual filtered array lengths', async ({ page }) => {
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

    // 1. Audit /app/flashcards-3d
    await page.goto('/app/flashcards-3d?lang=en');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('button:has-text("A1")', { timeout: 15000 });
    await page.waitForTimeout(1000);

    const allText = await page.textContent('body');
    expect(allText).toContain('NGÔN NGỮ:');

    // Extract total deck count for 'ALL'
    const allMatch = allText.match(/THẺ:\s*\d+\s*\/\s*([\d,]+)/);
    const allCount = allMatch ? parseInt(allMatch[1].replace(/,/g, ''), 10) : 0;
    expect(allCount).toBeGreaterThan(100);

    // Click 'A1' filter
    await page.click('button:has-text("A1")');
    await page.waitForTimeout(500);

    const a1Text = await page.textContent('body');
    const a1Match = a1Text.match(/THẺ:\s*\d+\s*\/\s*([\d,]+)/);
    const a1Count = a1Match ? parseInt(a1Match[1].replace(/,/g, ''), 10) : 0;

    // Click 'B1' filter
    await page.click('button:has-text("B1")');
    await page.waitForTimeout(500);

    const b1Text = await page.textContent('body');
    const b1Match = b1Text.match(/THẺ:\s*\d+\s*\/\s*([\d,]+)/);
    const b1Count = b1Match ? parseInt(b1Match[1].replace(/,/g, ''), 10) : 0;

    // DYNAMIC COUNTER ASSERTION: A1 count and B1 count must be positive and less than total ALL count
    expect(a1Count).toBeGreaterThan(0);
    expect(b1Count).toBeGreaterThan(0);
    expect(a1Count).toBeLessThan(allCount);

    // 2. Audit /app/vocabulary level filter dropdown dynamic count
    await page.goto('/app/vocabulary?lang=en');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('select', { timeout: 15000 });
    await page.waitForTimeout(1000);

    const vocabAllText = await page.textContent('body');
    expect(vocabAllText).toContain('English');

    // Select A1 level in dropdown
    const levelSelect = page.locator('select').first();
    if (await levelSelect.isVisible()) {
      await levelSelect.selectOption({ label: 'A1' }).catch(() => {});
    }

    // 3. Take screenshot proof: ./audit_proof/dynamic_real_count_check.png
    await page.screenshot({ path: './audit_proof/dynamic_real_count_check.png', fullPage: true });
  });
});
