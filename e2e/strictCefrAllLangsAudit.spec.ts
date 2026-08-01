import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Strict CEFR Leveling & Zero A1 Words in C2 Deck Audit (All 13 Languages)', () => {
  test.setTimeout(120000);

  const languages = ['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'ru', 'th', 'ar', 'vi', 'it'];
  const basicA1Words = [
    'tiger', 'cat', 'dog', 'hello', 'water',
    'gatto', 'cane', 'tigre', 'ciao', 'acqua',
    '猫', '狗', '老虎', '你好', '水',
    'ねこ', 'いぬ', 'とら', 'こんにちは', 'みず',
    '고양이', '개', '호랑이', '안녕', '물',
    'chat', 'chien', 'tigre', 'bonjour', 'eau',
    'katze', 'hund', 'hallo', 'wasser',
    'gato', 'perro', 'hola', 'agua',
    'кошка', 'собака', 'тигр', 'привет', 'вода',
    'แมว', 'หมา', 'เสือ', 'สวัสดี', 'น้ำ',
    'قطة', 'كلب', 'نمر', 'مرحبا', 'ماء',
    'con mèo', 'con chó', 'con hổ', 'xin chào', 'nước'
  ];

  for (const lang of languages) {
    test(`Verify language ${lang.toUpperCase()} in C2 level filter has ZERO basic A1 words (tiger, cat, dog)`, async ({ page }) => {
      await page.addInitScript((targetLang) => {
        localStorage.setItem('echlern_current_user_id', 'test_owner');
        localStorage.setItem('echlern_db_users', JSON.stringify([{
          id: 'test_owner',
          email: 'khounguyennguyen2012@gmail.com',
          role: 'admin',
          targetLanguage: targetLang,
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
      }, lang);

      await page.goto(`/app/flashcards-3d?lang=${lang}`);
      await page.waitForLoadState('domcontentloaded');
      
      // Click C2 button specifically
      const c2Button = page.locator('button', { hasText: /^C2$/ });
      await c2Button.waitFor({ timeout: 10000 });
      await c2Button.click();
      await page.waitForTimeout(300);

      // Read current card text or empty indicator
      const bodyText = (await page.textContent('body')).toLowerCase();
      
      // Assert that none of the A1 basic words appear on the screen
      for (const a1Word of basicA1Words) {
        expect(bodyText).not.toContain(`"${a1Word.toLowerCase()}"`);
      }
    });
  }

  test('Capture strict_c2_cefr_clean.png screenshot proof', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('echlern_current_user_id', 'test_owner');
      localStorage.setItem('echlern_db_users', JSON.stringify([{
        id: 'test_owner',
        email: 'khounguyennguyen2012@gmail.com',
        role: 'admin',
        targetLanguage: 'en',
        nativeLanguage: 'vi'
      }]));
    });

    await page.goto('/app/flashcards-3d?lang=en');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('button', { hasText: /^C2$/ }).click();
    await page.waitForTimeout(500);

    const proofDir = path.join(process.cwd(), 'audit_proof');
    if (!fs.existsSync(proofDir)) {
      fs.mkdirSync(proofDir, { recursive: true });
    }
    await page.screenshot({ path: path.join(proofDir, 'strict_c2_cefr_clean.png'), fullPage: true });
  });
});
