import { expect, test, type Page } from '@playwright/test';

async function seedLearner(page: Page) {
  await page.addInitScript(() => {
    const userId = 'learning_experience_user';
    localStorage.setItem('echlern_current_user_id', userId);
    localStorage.setItem('echlern_db_users', JSON.stringify([{
      id: userId,
      email: 'learner@example.com',
      displayName: 'Minh',
      username: 'minh',
      role: 'user',
      subscriptionTier: 'pro',
      targetLanguages: ['en'],
      nativeLanguage: 'vi',
    }]));
    localStorage.setItem('echlern_db_user_settings', JSON.stringify([{
      id: userId,
      userId,
      interfaceLanguage: 'vi',
      nativeLanguage: 'vi',
      targetLanguage: 'en',
      theme: 'light',
      dailyXpGoal: 50,
    }]));
    localStorage.setItem('echlearn_local_entitlements_v1', JSON.stringify([{
      userId,
      plan: 'pro',
      source: 'purchased',
      activatedBy: userId,
      activatedAt: new Date().toISOString(),
      expiresAt: null,
    }]));
  });
}

function collectRuntimeProblems(page: Page) {
  const problems: string[] = [];
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') problems.push(`${message.type()}: ${message.text()}`);
  });
  return problems;
}

test.describe.configure({ mode: 'serial' });

test.describe('Guided learning experience', () => {
  test.beforeEach(async ({ page }) => {
    await seedLearner(page);
  });

  test('English Survival is discoverable from dashboard, practice, and roadmap', async ({ page }) => {
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('link', { name: 'Bắt đầu bài sinh tồn' })).toHaveAttribute('href', '/app/english-survival');

    await page.goto('/app/practice', { waitUntil: 'domcontentloaded' });
    const practiceCard = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'English Survival: Gọi món' }) });
    await expect(practiceCard.getByRole('link', { name: 'Bắt đầu' })).toHaveAttribute('href', '/app/english-survival');

    await page.goto('/app/roadmap', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /English Survival/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Bắt đầu bài' })).toHaveAttribute('href', '/app/english-survival');
  });

  test('English Survival separates production and retrieval and ends with a next step', async ({ page }) => {
    const problems = collectRuntimeProblems(page);
    await page.goto('/app/english-survival', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Gọi một món mình chọn/i })).toBeVisible();

    await page.getByRole('button', { name: /Tiếp tục/i }).click();
    await page.getByLabel(/Tôi muốn gọi mì rau củ/i).check();
    await page.getByRole('button', { name: /Tiếp tục/i }).click();

    await page.getByLabel('Câu của bạn').fill('Can I have mushroom soup, please?');
    await page.getByRole('button', { name: 'Kiểm tra câu' }).click();
    await expect(page.getByText(/câu cá nhân hóa này phù hợp/i)).toBeVisible();
    await page.getByRole('button', { name: /Tiếp tục/i }).click();

    await page.getByLabel('Bạn sẽ nói gì?').fill('I would like mushroom soup, please.');
    await page.getByRole('button', { name: /Kiểm tra phần cần nhớ/i }).click();
    await expect(page.getByText(/Câu gọi món tốt/i)).toBeVisible();
    await page.getByLabel('Bạn sẽ nói gì?').fill('Could you make my soup less spicy, please?');
    await page.getByRole('button', { name: /Kiểm tra phần cần nhớ/i }).click();
    await page.getByRole('button', { name: /Tiếp tục/i }).click();

    for (const checkbox of await page.getByRole('checkbox').all()) await checkbox.check();
    await page.getByRole('button', { name: /Xem tổng kết/i }).click();
    await expect(page.getByRole('heading', { name: /đã hoàn thành bài gọi món/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Xem bài tiếp theo/i })).toHaveAttribute('href', '/app/roadmap');
    expect(problems).toEqual([]);
  });

  test('core learning routes fit required viewports without horizontal overflow', async ({ page }) => {
    const problems = collectRuntimeProblems(page);
    for (const viewport of [
      { width: 360, height: 800 },
      { width: 768, height: 900 },
      { width: 1024, height: 900 },
      { width: 1440, height: 1000 },
    ]) {
      await page.setViewportSize(viewport);
      for (const route of ['/app/english-survival', '/app/practice', '/app/roadmap', '/app/ielts', '/app/mock-tests', '/app/podcasts']) {
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('#app-main')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${route} at ${viewport.width}px`).toBe(true);
      }
    }
    expect(problems).toEqual([]);
  });

  test('IELTS and unavailable full mock states state their limits clearly', async ({ page }) => {
    await page.goto('/app/ielts', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/chưa cung cấp band score/i)).toBeVisible();
    await page.getByRole('link', { name: /Xem nội dung đang có/i }).click();
    await expect(page).toHaveURL(/\/app\/mock-tests$/);
    await expect(page.getByRole('heading', { name: /Full mock test chưa sẵn sàng/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Mở bài luyện/i })).toHaveCount(4);
  });
});
