import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe.configure({ mode: 'serial' });

test.describe('Default Light Theme & Theme Toggle Sync E2E Audit', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('echlern_current_user_id', 'light_user_100');
      localStorage.setItem('echlern_db_users', JSON.stringify([{
        id: 'light_user_100',
        email: 'lightstudent100@gmail.com',
        role: 'user',
        displayName: 'Light Student 100'
      }]));
    });
  });

  test('Verify fresh user defaults to Light Mode (NO dark class) and persists across F5 reloads', async ({ page }) => {
    await page.goto('/app/pricing');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('h1', { timeout: 15000 });

    // Assert HTML element DOES NOT contain class 'dark'
    const htmlClass = await page.getAttribute('html', 'class');
    expect(htmlClass || '').not.toContain('dark');

    // Assert HTML dataset theme is 'light'
    const dataTheme = await page.getAttribute('html', 'data-theme');
    expect(dataTheme).toBe('light');

    // Perform 2 consecutive F5 reloads and verify Light Mode persists
    for (let i = 1; i <= 2; i++) {
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForSelector('h1', { timeout: 15000 });

      const currentHtmlClass = await page.getAttribute('html', 'class');
      expect(currentHtmlClass || '').not.toContain('dark');

      const currentDataTheme = await page.getAttribute('html', 'data-theme');
      expect(currentDataTheme).toBe('light');
    }

    // Capture screenshot proof
    const proofDir = path.join(process.cwd(), 'audit_proof');
    if (!fs.existsSync(proofDir)) {
      fs.mkdirSync(proofDir, { recursive: true });
    }
    await page.screenshot({ path: path.join(proofDir, 'default_light_theme_verified.png'), fullPage: true });
  });

  test('Verify Theme Toggle switches back and forth cleanly and persists in localStorage', async ({ page }) => {
    await page.goto('/app/vocabulary');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('#theme-toggle-topbar', { timeout: 15000 });

    // Toggle theme via topbar button to Dark Mode
    const btn = page.locator('#theme-toggle-topbar');
    await btn.click();
    await page.waitForTimeout(300);

    let htmlClass = await page.getAttribute('html', 'class');
    expect(htmlClass || '').toContain('dark');

    let dataTheme = await page.getAttribute('html', 'data-theme');
    expect(dataTheme).toBe('dark');

    // Reload page to verify Dark Mode persisted in localStorage/settingsService across F5
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    console.log('DEBUG: URL after reload:', page.url());
    const debugUser = await page.evaluate(() => localStorage.getItem('echlern_current_user_id'));
    console.log('DEBUG: User ID after reload:', debugUser);

    await page.waitForSelector('#theme-toggle-topbar', { timeout: 15000 });

    const reloadedHtmlClass = await page.getAttribute('html', 'class');
    expect(reloadedHtmlClass || '').toContain('dark');

    const reloadedDataTheme = await page.getAttribute('html', 'data-theme');
    expect(reloadedDataTheme).toBe('dark');

    // Toggle back to light
    await btn.click();
    await page.waitForTimeout(300);

    const finalHtmlClass = await page.getAttribute('html', 'class');
    expect(finalHtmlClass || '').not.toContain('dark');

    const finalDataTheme = await page.getAttribute('html', 'data-theme');
    expect(finalDataTheme).toBe('light');
  });
});
