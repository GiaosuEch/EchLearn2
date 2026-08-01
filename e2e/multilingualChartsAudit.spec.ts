import { test } from '@playwright/test';

test.describe('Multilingual Reference Charts Playwright Audit', () => {
  test('Capture Asian, Latin, and Cyrillic/Thai/Arabic Reference Charts', async ({ page }) => {
    // Inject auth state into localStorage
    await page.addInitScript(() => {
      window.localStorage.setItem('echlern_current_user_id', 'admin-001');
      window.localStorage.setItem(
        'echlern_db_users',
        JSON.stringify([
          {
            id: 'admin-001',
            email: 'khounguyennguyen2012@gmail.com',
            displayName: 'GiaosuEch',
            role: 'admin',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        ])
      );
    });

    await page.goto('http://127.0.0.1:5173/app/reference-charts', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Trung Tâm Bảng Học Cơ Bản', { timeout: 15000 });

    // 1. Asian (Japanese / Chinese) - Default is Japanese
    await page.screenshot({ path: './audit_proof/chart_asian_ja_zh.png', fullPage: true });

    // 2. Click French (Latin)
    await page.click('button:has-text("French")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: './audit_proof/chart_latin_fr_de.png', fullPage: true });

    // 3. Click Russian (Other - Cyrillic/Thai/Arabic)
    await page.click('button:has-text("Russian")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: './audit_proof/chart_other_ru_th.png', fullPage: true });
  });
});
