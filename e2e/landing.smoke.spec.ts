import { expect, test } from '@playwright/test';

test('the public landing page renders its primary content', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('EchLearn');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByText('Ech Buri', { exact: false })).toBeVisible();
});
