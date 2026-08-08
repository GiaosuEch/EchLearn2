import { test } from '@playwright/test';

test.describe('Detailed High-Res Proof Audit for Thai and Arabic Reference Charts', () => {
  test('Capture zoomed-in 4-column vocabulary tables for Thai and Arabic', async ({ page }) => {
    // Set high resolution viewport so the text is crystal clear
    await page.setViewportSize({ width: 1440, height: 1600 });

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

    await page.goto('/app/reference-charts', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Trung Tâm Bảng Học Cơ Bản', { timeout: 15000 });

    // 1. Select Thai (TH)
    await page.click('button:has-text("Thai")');
    await page.waitForTimeout(600);

    // Scroll to section 2 (4-Column Core Tables)
    const tablesGrid = page.locator('div.grid.lg\\:grid-cols-2.gap-6');
    await tablesGrid.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    // Capture Thai 4-column detail screenshot
    await page.screenshot({ path: './audit_proof/chart_thai_detail.png', fullPage: true });

    // 2. Select Arabic (SA)
    await page.click('button:has-text("Arabic")');
    await page.waitForTimeout(600);

    await tablesGrid.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    // Capture Arabic 4-column detail screenshot
    await page.screenshot({ path: './audit_proof/chart_arabic_detail.png', fullPage: true });
  });
});
