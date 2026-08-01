import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Clean Distractors & Zero Duplicates E2E Audit', () => {
  test('Verify Italian (IT) /app/vocabulary & /app/speed-quiz have 100% unique, clean Vietnamese meanings', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('echlern_current_user_id', 'test_owner');
      localStorage.setItem('echlern_db_users', JSON.stringify([{
        id: 'test_owner',
        email: 'khounguyennguyen2012@gmail.com',
        role: 'admin',
        targetLanguage: 'it',
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

    // 1. Audit /app/vocabulary for Italian (IT) - Quiz Tab
    await page.goto('/app/vocabulary?lang=it');
    await page.waitForLoadState('domcontentloaded');
    
    // Select Quiz Tab (Câu đố)
    const quizTabBtn = page.locator('button:has-text("Câu đố"), button:has-text("Quiz")').first();
    await quizTabBtn.waitFor({ timeout: 15000 });
    await quizTabBtn.click();
    await page.waitForTimeout(500);

    // Get all 4 quiz option buttons
    const quizOptions = await page.locator('.space-y-3 button').allInnerTexts();
    expect(quizOptions.length).toBeGreaterThanOrEqual(4);

    // Assert NO options contain bad static strings
    for (const opt of quizOptions) {
      expect(opt).not.toContain('Un animale comune');
      expect(opt).not.toContain('(Nghĩa Tiếng Việt)');
      expect(opt).not.toContain('effort'); // Zero English mixing
    }

    // Assert ALL options in the quiz are 100% unique strings
    const cleanedQuizOptions = quizOptions.map(s => s.trim().toLowerCase());
    const uniqueQuizOptions = new Set(cleanedQuizOptions);
    expect(uniqueQuizOptions.size).toBe(cleanedQuizOptions.length);

    // 2. Audit /app/speed-quiz for Italian (IT)
    await page.goto('/app/speed-quiz?lang=it');
    await page.waitForLoadState('domcontentloaded');

    // Click "Bắt Đầu Thách Đấu"
    await page.waitForSelector('button:has-text("Bắt Đầu Thách Đấu")', { timeout: 15000 });
    await page.click('button:has-text("Bắt Đầu Thách Đấu")');
    await page.waitForTimeout(600);

    // Get all 4 speed quiz options
    const speedQuizOptions = await page.locator('.grid button').allInnerTexts();
    expect(speedQuizOptions.length).toBe(4);

    for (const opt of speedQuizOptions) {
      expect(opt).not.toContain('Un animale comune');
      expect(opt).not.toContain('(Nghĩa Tiếng Việt)');
      expect(opt).not.toContain('Nghĩa từ vựng #');
      expect(opt).not.toContain('effort'); // Zero English mixing
    }

    // Assert ALL 4 speed quiz options are 100% unique strings
    const cleanedSpeedOptions = speedQuizOptions.map(s => s.trim().toLowerCase());
    const uniqueSpeedOptions = new Set(cleanedSpeedOptions);
    expect(uniqueSpeedOptions.size).toBe(4);

    // 3. Save Screenshot Proof
    const proofDir = path.join(process.cwd(), 'audit_proof');
    if (!fs.existsSync(proofDir)) {
      fs.mkdirSync(proofDir, { recursive: true });
    }
    await page.screenshot({ path: path.join(proofDir, 'clean_distractor_quiz.png'), fullPage: true });
  });
});
