import { expect, test, type Page } from '@playwright/test';

async function seedAdmin(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('echlern_current_user_id', 'admin-001');
    window.localStorage.setItem('echlern_db_users', JSON.stringify([{
      id: 'admin-001',
      email: 'admin@example.com',
      displayName: 'Admin',
      role: 'admin',
      createdAt: '2026-01-01T00:00:00.000Z',
    }]));
  });
}

test.describe('Truthful IELTS practice feedback', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdmin(page);
    await page.setViewportSize({ width: 1440, height: 1200 });
  });

  test('reading reports passage correctness and evidence without inventing a band', async ({ page }) => {
    await page.goto('/app/ielts/reading', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('IELTS Reading Practice Suite')).toBeVisible({ timeout: 20_000 });

    await page.getByRole('button', { name: /Roman Aqueducts/i }).first().click();
    await page.locator('button').filter({ hasText: /^TRUE$/ }).first().click();
    await page.locator('button').filter({ hasText: /^FALSE$/ }).nth(1).click();
    await page.locator('button').filter({ hasText: /^NOT GIVEN$/ }).nth(2).click();
    await page.getByRole('button', { name: 'Fifty percent' }).click();
    await page.getByRole('button', { name: 'Central distribution of water to city sectors' }).click();
    await page.locator('input[placeholder*="Nhập từ"]').fill('chorobates');
    await page.getByRole('button', { name: /Nộp Bài Thi IELTS Reading/i }).click();

    await expect(page.getByRole('heading', { name: 'Kết quả của passage này' })).toBeVisible();
    await expect(page.getByText(/Đúng 3 \/ 6 câu/)).toBeVisible();
    await expect(page.getByText(/không được quy đổi thành band IELTS/i)).toBeVisible();
    await expect(page.locator('button.border-red-500')).toHaveCount(3);
    await expect(page.getByText(/Band [0-9]/i)).toHaveCount(0);
  });

  test('writing provides word-count and self-review guidance without AI evaluation', async ({ page }) => {
    await page.goto('/app/ielts/writing', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('IELTS Writing practice')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/chưa chấm band hoặc phân tích ngữ pháp tự động/i)).toBeVisible();

    const textarea = page.getByLabel('Bản nháp của bạn');
    const shortEssay = 'Public transport can reduce traffic and pollution. Governments should improve routes, reliability, and affordability so more residents can leave private cars at home.';
    await textarea.fill(shortEssay);
    await expect(page.getByText(/Bạn còn thiếu .* từ so với yêu cầu tối thiểu/i)).toBeVisible();

    const paragraph = ' Communities also need safe stations, clear schedules, and services that connect homes with schools and workplaces. Reliable transport gives people a practical alternative to driving, while fair ticket prices make that alternative available to families with different incomes.';
    await textarea.fill(shortEssay + paragraph.repeat(8));
    for (const checkbox of await page.getByRole('checkbox').all()) await checkbox.check();

    await expect(page.getByText(/Bản nháp đã đủ độ dài và bạn đã hoàn tất checklist/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Chấm Điểm|AI/i })).toHaveCount(0);
    await expect(page.getByText(/Overall|Task Response/i)).toHaveCount(0);
  });
});
