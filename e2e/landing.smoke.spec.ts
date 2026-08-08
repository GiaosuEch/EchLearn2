import { expect, test } from '@playwright/test';

test('the public landing page renders its primary community experience', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page).toHaveTitle('EchLearn');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Học một mình, nhưng không cô đơn.' })).toBeVisible();
  await expect(page.locator('[role="img"][aria-label*="Ech Buri"]').first()).toBeVisible();
  await expect(page.getByText('Thử thách 7 ngày: phản xạ tiếng Anh')).toBeVisible();
  await expect(page.getByText('Lộ trình học có cấu trúc')).toBeVisible();
  await expect(page.getByText('Luyện theo từng kỹ năng')).toBeVisible();
  await expect(page.getByText('Không gian ôn luyện IELTS')).toBeVisible();
  await expect(page.getByText('Top 1 thế giới', { exact: false })).toHaveCount(0);
  await expect(page.getByText('50,000+', { exact: false })).toHaveCount(0);
  await expect(page.getByText('AI 24/7', { exact: false })).toHaveCount(0);
  await expect(page.getByText('Band 7.5', { exact: false })).toHaveCount(0);
  await expect(page.getByText('Target Daily Streak', { exact: false })).toHaveCount(0);
  await expect(page.getByText('2.5M', { exact: false })).toHaveCount(0);
  await expect(page.getByText('98.4', { exact: false })).toHaveCount(0);
  await expect(page.getByText('Target IELTS', { exact: false })).toHaveCount(0);
  await expect(page.getByText('Cambridge Examiners', { exact: false })).toHaveCount(0);
});
