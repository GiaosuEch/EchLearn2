import { test } from '@playwright/test';

test.describe('Real-Time Search & Multilingual Charts E2E Audit', () => {
  test('Verify Live Search Bar for Japanese and French Reference Charts', async ({ page }) => {
    // High-res viewport
    await page.setViewportSize({ width: 1440, height: 1200 });

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
    
    // Locate placeholder case-insensitively
    const searchInput = page.getByPlaceholder(/Search/i).first();
    await searchInput.waitFor({ state: 'visible', timeout: 15000 });

    // 1. Live Search for Japanese vocabulary: Type "Tháng 1"
    await searchInput.fill('Tháng 1');
    await page.waitForTimeout(800);

    // Capture proof screenshot 01_search_japanese_real.png
    await page.screenshot({ path: './audit_proof/01_search_japanese_real.png', fullPage: true });

    // Clear search bar using selectText & Backspace
    await searchInput.selectText();
    await searchInput.press('Backspace');
    await page.waitForTimeout(500);

    // 2. Switch to French (FR)
    const frenchBtn = page.getByRole('button', { name: /French/i });
    await frenchBtn.click();
    await page.waitForTimeout(600);

    // Live Search for French vocabulary: Type "Bonjour"
    await searchInput.fill('Bonjour');
    await page.waitForTimeout(800);

    // Capture proof screenshot 02_search_french_real.png
    await page.screenshot({ path: './audit_proof/02_search_french_real.png', fullPage: true });
  });
});
