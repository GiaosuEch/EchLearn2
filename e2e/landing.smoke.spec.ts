import { expect, test } from '@playwright/test';

test('the public landing page renders its primary content', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('EchLearn');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Học tiếng Anh theo nhịp của bạn' })).toBeVisible();
  await expect(page.getByText('Ech Buri', { exact: false })).toBeVisible();
  await expect(page.getByText('Top 1 thế giới', { exact: false })).toHaveCount(0);
  await expect(page.getByText('50,000+', { exact: false })).toHaveCount(0);
});
