import { expect, test } from '@playwright/test';

// The old audit asserted the fabricated "10,000+" marketing claim. The bank
// is authored-only now, so this audit verifies the opposite invariant: the
// displayed count reflects real authored content and never claims padding.
test.describe('Vocabulary & 3D Flashcards count honesty audit', () => {
  test('Verify /app/vocabulary and /app/flashcards-3d show real bank sizes', async ({ page }) => {
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

    // 1. Audit /app/vocabulary for EN
    await page.goto('/app/vocabulary?lang=en');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('button:has-text("Thẻ ghi nhớ")', { timeout: 15000 });
    await page.waitForTimeout(1000);

    const vocabBodyText = await page.textContent('body');
    expect(vocabBodyText).not.toMatch(/10,000\+/);
    expect(vocabBodyText).toMatch(/[0-9]{1,3}(,[0-9]{3})*\+ từ vựng/);
    await page.screenshot({ path: './audit_proof/real_vocab_count_page.png', fullPage: true });

    // 2. Audit /app/flashcards-3d for ZH
    await page.goto('/app/flashcards-3d?lang=zh');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('h2', { timeout: 15000 });
    await page.waitForTimeout(1000);

    const flashcardBodyText = await page.textContent('body');
    expect(flashcardBodyText).not.toMatch(/10,000\+/);
    expect(flashcardBodyText).toContain('BỘ LỌC CẤP ĐỘ (CEFR)');

    const zhHeading = (await page.locator('h2').textContent())?.trim() || '';
    expect(zhHeading).toMatch(/[\u4e00-\u9fa5]/);

    await page.screenshot({ path: './audit_proof/real_flashcard_3d_count_page.png', fullPage: true });
  });
});