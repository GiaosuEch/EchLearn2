import { expect, test } from '@playwright/test';

test.describe('All 13+ Languages Null Safety & Runtime Crash Audit', () => {
  test.setTimeout(90000);

  const languages = ['it', 'pt', 'ru', 'th', 'ar', 'vi', 'ko', 'fr', 'de', 'es', 'ja', 'zh', 'en'];

  for (const lang of languages) {
    test(`Verify /app/flashcards-3d and /app/speed-quiz load cleanly for language: ${lang}`, async ({ page }) => {
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

      // 1. Audit /app/flashcards-3d for language
      await page.goto(`/app/flashcards-3d?lang=${lang}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForSelector('h2', { timeout: 15000 });

      const f3dText = await page.textContent('body');
      expect(f3dText).not.toContain('undefined');
      expect(f3dText).toContain('THẺ:');

      // 2. Audit /app/speed-quiz for language
      await page.goto(`/app/speed-quiz?lang=${lang}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForSelector('button:has-text("Bắt Đầu Thách Đấu")', { timeout: 15000 });

      const quizText = await page.textContent('body');
      expect(quizText).toContain('Bắt Đầu Thách Đấu');
    });
  }
});
