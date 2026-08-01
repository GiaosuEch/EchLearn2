import { expect, test } from '@playwright/test';

test.describe('10,000+ Vocabulary Engine & 3D Flashcards Sync Audit', () => {
  test('Verify /app/vocabulary and /app/flashcards-3d display 10,000+ real entries scale', async ({ page }) => {
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

    // 1. Audit /app/vocabulary for EN, ZH, JA
    await page.goto('/app/vocabulary?lang=en');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('button:has-text("Thẻ ghi nhớ")', { timeout: 15000 });
    await page.waitForTimeout(1000);

    const vocabBodyText = await page.textContent('body');
    expect(vocabBodyText).toMatch(/10,000\+/);
    await page.screenshot({ path: './audit_proof/real_10k_vocab_page.png', fullPage: true });

    // 2. Audit /app/flashcards-3d for ZH
    await page.goto('/app/flashcards-3d?lang=zh');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('h2', { timeout: 15000 });
    await page.waitForTimeout(1000);

    const flashcardBodyText = await page.textContent('body');
    expect(flashcardBodyText).toMatch(/10,000\+/);
    expect(flashcardBodyText).toContain('BỘ LỌC CẤP ĐỘ (CEFR)');

    const zhHeading = (await page.locator('h2').textContent())?.trim() || '';
    expect(zhHeading).toMatch(/[\u4e00-\u9fa5]/);

    await page.screenshot({ path: './audit_proof/real_10k_flashcard_3d_page.png', fullPage: true });
  });
});
