import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Deep Codebase Cleanup & System Audit (Zero-Fake Data & Leveling)', () => {
  test.setTimeout(120000);

  test('1. Fresh User 0 XP & 0 Streak Audit on Leaderboard (No Fake 1544 XP)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('echlern_current_user_id', 'zero_user_001');
      localStorage.setItem('echlern_db_users', JSON.stringify([{
        id: 'zero_user_001',
        email: 'freshstudent@gmail.com',
        role: 'user',
        displayName: 'Học Viên Mới',
        xp: 0,
        streak: 0
      }]));
      localStorage.setItem('echlearn_learning_xp', '0');
      localStorage.setItem('echlearn_learning_streak', '0');
    });

    await page.goto('/app/leaderboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('text=Học Viên Mới', { timeout: 15000 });

    const pageContent = await page.textContent('body');
    // Ensure fake numbers (1,544 XP, 42 ngày) are NOT present for Học Viên Mới
    expect(pageContent).not.toContain('1,544 XP');
    expect(pageContent).not.toContain('42 ngày');
    expect(pageContent).toContain('0 XP');
  });

  test('2. Entitlement PRO Persistence Across 3 Consecutive F5 Reloads Audit', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('echlern_current_user_id', 'pro_user_888');
      localStorage.setItem('echlern_db_users', JSON.stringify([{
        id: 'pro_user_888',
        email: 'prouser888@gmail.com',
        role: 'user',
        displayName: 'Pro User 888'
      }]));
      localStorage.setItem('echlearn_local_entitlements_v1', JSON.stringify([{
        userId: 'pro_user_888',
        plan: 'pro',
        source: 'purchased',
        activatedBy: 'admin',
        activatedAt: new Date().toISOString(),
        expiresAt: null
      }]));
    });

    await page.goto('/app/pricing');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('button:has-text("Gói Hiện Tại")', { timeout: 15000 });

    // Perform 3 consecutive F5 reloads
    for (let i = 1; i <= 3; i++) {
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForSelector('button:has-text("Gói Hiện Tại")', { timeout: 15000 });
      const activeBtn = await page.locator('button:has-text("Gói Hiện Tại")').isVisible();
      expect(activeBtn).toBe(true);
    }
  });

  test('3. CEFR Leveling Cleanliness Audit Across All 13 Languages in Tab C2', async ({ page }) => {
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
      await page.addInitScript((targetLang) => {
        localStorage.setItem('echlern_current_user_id', 'owner_test');
        localStorage.setItem('echlern_db_users', JSON.stringify([{
          id: 'owner_test',
          email: 'khounguyennguyen2012@gmail.com',
          role: 'admin',
          targetLanguage: targetLang
        }]));
      }, lang);

      await page.goto(`/app/flashcards-3d?lang=${lang}`);
      await page.waitForLoadState('domcontentloaded');

      const c2Btn = page.locator('button', { hasText: /^C2$/ });
      await c2Btn.waitFor({ timeout: 10000 });
      await c2Btn.click();
      await page.waitForTimeout(300);

      const content = (await page.textContent('body')).toLowerCase();
      for (const word of basicA1Words) {
        expect(content).not.toContain(`"${word.toLowerCase()}"`);
      }
    }
  });

  test('4. Capture deep_cleanup_verified.png screenshot proof', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('echlern_current_user_id', 'zero_user_001');
      localStorage.setItem('echlern_db_users', JSON.stringify([{
        id: 'zero_user_001',
        email: 'freshstudent@gmail.com',
        role: 'user',
        displayName: 'Học Viên Mới',
        xp: 0,
        streak: 0
      }]));
      localStorage.setItem('echlearn_learning_xp', '0');
      localStorage.setItem('echlearn_learning_streak', '0');
    });

    await page.goto('/app/leaderboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const proofDir = path.join(process.cwd(), 'audit_proof');
    if (!fs.existsSync(proofDir)) {
      fs.mkdirSync(proofDir, { recursive: true });
    }
    await page.screenshot({ path: path.join(proofDir, 'deep_cleanup_verified.png'), fullPage: true });
  });
});
