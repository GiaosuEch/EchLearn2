import { expect, test } from '@playwright/test';

test.describe('Flashcard 3D Large Dynamic Deck & CEFR Filter E2E Audit', () => {
  test('Verify Flashcards 3D renders large dynamic deck (>50+ items) with CEFR level filters', async ({ page }) => {
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

    // 1. Open /app/flashcards-3d with targetLanguage=zh
    await page.goto('/app/flashcards-3d?lang=zh');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('h2', { timeout: 15000 });
    await page.waitForTimeout(1000);

    const bodyText = await page.textContent('body');

    // 2. Assert Level Filter controls exist
    expect(bodyText).toContain('BỘ LỌC CẤP ĐỘ (CEFR)');
    expect(bodyText).toContain('TẤT CẢ');
    expect(bodyText).toContain('A1');
    expect(bodyText).toContain('A2');

    // 3. Assert total deck count is NOT truncated to '1 / 15'
    expect(bodyText).not.toContain('1 / 15');
    expect(bodyText).toMatch(/THẺ:\s*\d+\s*\/\s*([5-9]\d|\d{3,})/); // asserts deck size >= 50 or 100+

    // 4. Click A1 level filter
    await page.click('button:has-text("A1")');
    await page.waitForTimeout(500);

    const a1BodyText = await page.textContent('body');
    expect(a1BodyText).toContain('THẺ:');

    // 5. Screenshot proof: ./audit_proof/flashcard_3d_large_deck_real.png
    await page.screenshot({ path: './audit_proof/flashcard_3d_large_deck_real.png', fullPage: true });
  });
});
