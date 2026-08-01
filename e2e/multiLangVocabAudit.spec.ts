import { expect, test } from '@playwright/test';

test.describe('Real High-Quality Vocabulary & Practical Collocations E2E Audit', () => {
  test.setTimeout(60000);

  test('Verify 10+ Consecutive Flashcards are 100% Unique with Real Collocations', async ({ page }) => {
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

    // 1. Open /app/vocabulary
    await page.goto('/app/vocabulary?lang=en');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('button:has-text("Thẻ ghi nhớ")', { timeout: 15000 });
    await page.waitForTimeout(1000);

    const bodyText = await page.textContent('body');
    expect(bodyText).toContain('từ vựng & cụm từ giao tiếp thực tế');

    // 2. Iterate through 10 consecutive flashcards and assert ZERO duplicate words or dummy synthetic strings
    const seenWords = new Set<string>();

    for (let i = 0; i < 10; i++) {
      const wordHeading = (await page.locator('h2').textContent())?.trim() || '';
      expect(wordHeading.length).toBeGreaterThan(0);
      expect(wordHeading).not.toContain('Vocab_');
      expect(wordHeading).not.toContain('_');

      // Assert no duplicate words in sequence
      expect(seenWords.has(wordHeading)).toBe(false);
      seenWords.add(wordHeading);

      // Flip card to reveal collocations and practical examples
      await page.click('h2');
      await page.waitForTimeout(300);

      const cardBackHtml = await page.textContent('body');
      expect(cardBackHtml).toContain('Nghĩa Tiếng Việt');
      expect(cardBackHtml).toContain('Cụm từ liên quan');
      expect(cardBackHtml).not.toContain('A common animal.');
      expect(cardBackHtml).not.toContain('(Nghĩa Tiếng Việt)');

      // Click "Tốt" or rating button to move to next card
      await page.click('button:has-text("Tốt")');
      await page.waitForTimeout(300);
    }

    // Assert that all 10 processed words were 100% unique
    expect(seenWords.size).toBe(10);

    // 3. Screenshot proof: ./audit_proof/vocab_real_quality_check.png
    await page.screenshot({ path: './audit_proof/vocab_real_quality_check.png', fullPage: true });
  });
});
