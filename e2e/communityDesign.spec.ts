import { expect, test } from '@playwright/test';

test.describe('Community design language', () => {
  test.setTimeout(90_000);

  test('public landing presents the community challenge hero without horizontal overflow', async ({ page }) => {
    for (const viewport of [
      { width: 320, height: 720 },
      { width: 1440, height: 960 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#main-content')).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText('Năng lượng cộng đồng')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Học một mình, nhưng không cô đơn.' })).toBeVisible();
      await expect(page.getByText('Thử thách 7 ngày: phản xạ tiếng Anh')).toBeVisible();
      await expect(page.locator('[role="img"][aria-label*="Ech Buri"]').first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  });
});
