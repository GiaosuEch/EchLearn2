import { expect, test } from '@playwright/test';

test.describe('Signature Ech Buri experience', () => {
  test('landing renders Ech Buri in a welcoming pose', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const mascot = page.locator('[role="img"][aria-label*="Ech Buri"]').first();
    await expect(mascot).toBeVisible();
    await expect(mascot).toHaveAttribute('data-mascot-state', 'welcome');
  });
});
