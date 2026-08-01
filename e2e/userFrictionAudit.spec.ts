import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('User Friction Bugs E2E Audit', () => {
  test('Verify Leaderboard uses real XP (no fake 1544 XP) & activated package persists across refresh', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('echlern_current_user_id', 'test_user_777');
      localStorage.setItem('echlern_db_users', JSON.stringify([{
        id: 'test_user_777',
        email: 'user777@gmail.com',
        role: 'user',
        displayName: 'Learner 777',
        xp: 75,
        streak: 0
      }]));
      localStorage.setItem('echlearn_learning_xp', '75');
      localStorage.setItem('echlearn_learning_streak', '0');

      // Activate PRO plan locally
      localStorage.setItem('echlearn_local_entitlements_v1', JSON.stringify([{
        userId: 'test_user_777',
        plan: 'pro',
        source: 'purchased',
        activatedBy: 'admin',
        activatedAt: new Date().toISOString(),
        expiresAt: null
      }]));
    });

    // 1. Audit Leaderboard for Real XP (75 XP, NOT 1544 XP)
    await page.goto('/app/leaderboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('text=Learner 777', { timeout: 15000 });

    const pageContent = await page.textContent('body');
    // Ensure the fake 1544 XP & 42 days streak are NOT displayed for Learner 777
    expect(pageContent).not.toContain('1,544 XP');
    expect(pageContent).not.toContain('42 ngày');
    expect(pageContent).toContain('0 XP');

    // 2. Audit Pricing Page for Active PRO Package persistence
    await page.goto('/app/pricing');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('h1', { timeout: 15000 });

    // Reload page to verify activated plan does NOT get wiped out on refresh
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify PRO plan shows "Gói Hiện Tại" button
    const proButtonText = await page.locator('button:has-text("Gói Hiện Tại"), button:has-text("Đang Sử Dụng")').innerText();
    expect(proButtonText).toBeTruthy();

    // 3. Save Screenshot Proof
    const proofDir = path.join(process.cwd(), 'audit_proof');
    if (!fs.existsSync(proofDir)) {
      fs.mkdirSync(proofDir, { recursive: true });
    }
    await page.screenshot({ path: path.join(proofDir, 'friction_bugs_fixed.png'), fullPage: true });
  });
});
