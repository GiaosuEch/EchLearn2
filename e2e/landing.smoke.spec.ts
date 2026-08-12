import { expect, test } from '@playwright/test';

test('the public landing page renders its primary guided-learning experience', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page).toHaveTitle('EchLearn');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mỗi ngày 8 phút, tiếng Anh tiến một bước.' })).toBeVisible();
  await expect(page.locator('[role="img"][aria-label*="Ech Buri"]').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Bắt đầu 8 phút đầu tiên' }).first()).toHaveAttribute('href', '/first-win');
  await expect(page.getByText('Lộ trình học có cấu trúc')).toBeVisible();
  await expect(page.getByText('Luyện theo từng kỹ năng')).toBeVisible();
  await expect(page.getByText('Không gian ôn luyện IELTS')).toBeVisible();
  await expect(page.getByText('kết quả hiện có không được quy đổi thành band IELTS', { exact: false })).toBeVisible();
  for (const forbiddenClaim of ['Top 1 thế giới', '50,000+', 'AI 24/7', 'Band 7.5', 'Target Daily Streak', '2.5M', '98.4', 'Target IELTS', 'Cambridge Examiners', 'ôn luyện bằng AI']) {
    await expect(page.getByText(forbiddenClaim, { exact: false })).toHaveCount(0);
  }
});
