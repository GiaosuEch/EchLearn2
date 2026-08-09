import { expect, test } from '@playwright/test';

async function textContrastAgainstNearestSolidBackground(element: import('@playwright/test').Locator) {
  return element.evaluate((node) => {
    const channels = (value: string) => value.match(/\d+(?:\.\d+)?/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
    const luminance = (rgb: number[]) => rgb.map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    const foreground = luminance(channels(getComputedStyle(node).color));
    let backgroundElement: Element | null = node;
    while (backgroundElement && getComputedStyle(backgroundElement).backgroundColor === 'rgba(0, 0, 0, 0)') backgroundElement = backgroundElement.parentElement;
    const background = luminance(channels(getComputedStyle(backgroundElement ?? document.body).backgroundColor));
    return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
  });
}

async function seedAuthenticatedLearner(page: import('@playwright/test').Page, userId = 'ech_buri_experience_user') {
  await page.addInitScript((seededUserId) => {
    const userId = seededUserId;
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
      soundEffects: true,
      speechSpeed: 'normal',
      fontSize: 'medium',
      dailyXpGoal: 50,
      ieltsTargetBand: 7,
      publicProfile: true,
    }]));
  }, userId);
}

test.describe.configure({ mode: 'serial' });

test.describe('Signature Ech Buri experience', () => {
  test.setTimeout(90_000);
  test('landing renders Ech Buri in a welcoming pose', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 20_000 });

    const mascot = page.locator('[role="img"][aria-label*="Ech Buri"]').first();
    await expect(mascot).toBeVisible();
    await expect(mascot).toHaveAttribute('data-mascot-state', 'welcome');
  });

  test('landing makes the eight-minute first win the primary public action', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: /Mỗi ngày 8 phút.*tiếng Anh tiến một bước/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Bắt đầu 8 phút đầu tiên/i }).first()).toHaveAttribute('href', '/first-win');
    await expect(page.getByRole('list', { name: 'Lộ trình ngày đầu tiên' })).toBeVisible();
    await expect(page.getByText('Nhận bước tiếp theo cho ngày mai')).toBeVisible();
  });

  test('first-win CTA opens a goal selector before registration', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('link', { name: /Bắt đầu 8 phút đầu tiên/i }).first().click();

    await expect(page).toHaveURL(/\/first-win$/);
    await expect(page.getByRole('heading', { name: /Mục tiêu 8 phút đầu tiên/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Tiếp tục tạo tài khoản/i })).toBeVisible();
  });

  test('landing keeps the welcome mascot responsive without horizontal overflow', async ({ page }) => {
    for (const viewport of [
      { width: 320, height: 720 },
      { width: 768, height: 900 },
      { width: 1024, height: 900 },
      { width: 1440, height: 960 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#main-content')).toBeVisible({ timeout: 20_000 });

      const mascot = page.locator('[role="img"][aria-label*="Ech Buri"]').first();
      await expect(mascot).toBeVisible();
      await expect(mascot).toHaveAttribute('data-mascot-state', 'welcome');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  });

  test('dashboard greets an authenticated learner with Ech Buri', async ({ page }) => {
    await seedAuthenticatedLearner(page);
    await page.goto('/app/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#app-main')).toBeVisible({ timeout: 20_000 });

    const mascot = page.locator('[role="img"][aria-label*="Ech Buri"]').first();
    await expect(mascot).toBeVisible();
    await expect(mascot).toHaveAttribute('data-mascot-state', /thinking|listening|streak|cheering/);
  });

  test('dashboard gives an authenticated learner one daily focus action', async ({ page }) => {
    await seedAuthenticatedLearner(page);
    await page.goto('/app/dashboard', { waitUntil: 'domcontentloaded' });

    const focus = page.getByLabel('Việc học quan trọng hôm nay');
    await expect(focus).toBeVisible({ timeout: 20_000 });
    await expect(focus.getByRole('link')).toHaveCount(1);
    await expect(focus.getByText(/0 \/ \d+/)).toBeVisible();
    await expect(focus.locator('[role="img"][aria-label*="Ech Buri"]')).toBeVisible();
  });

  test('dashboard sends learners to the real study-groups route', async ({ page }) => {
    await seedAuthenticatedLearner(page);
    await page.goto('/app/dashboard', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('a[href="/app/study-groups"]')).toHaveCount(0);
    await expect(page.locator('a[href="/app/groups"]')).toBeVisible({ timeout: 20_000 });
  });

  test('pricing records a paid-plan consultation request instead of claiming a checkout', async ({ page }) => {
    await seedAuthenticatedLearner(page);
    await page.goto('/app/pricing', { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: /Nhận tư vấn gói PLUS/i }).click();
    await expect(page.getByRole('button', { name: /Đã gửi yêu cầu tư vấn/i })).toBeDisabled();
    await expect(page.getByText(/Đang kết nối tới cổng thanh toán/i)).toHaveCount(0);
  });

  test('an authenticated learner receives a three-question first-win lesson', async ({ page }) => {
    await seedAuthenticatedLearner(page);
    await page.goto('/app/first-win?goal=habit', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('#app-main')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('heading', { name: /Một bước nhỏ, nhưng là bước của bạn/i })).toBeVisible();
    const titleContrast = await page.getByRole('heading', { name: /Một bước nhỏ, nhưng là bước của bạn/i }).evaluate((element) => {
      const channels = (value: string) => value.match(/\d+(?:\.\d+)?/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
      const luminance = (rgb: number[]) => rgb.map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
      const foreground = luminance(channels(getComputedStyle(element).color));
      let backgroundElement: Element | null = element;
      while (backgroundElement && getComputedStyle(backgroundElement).backgroundColor === 'rgba(0, 0, 0, 0)') backgroundElement = backgroundElement.parentElement;
      const background = luminance(channels(getComputedStyle(backgroundElement ?? document.body).backgroundColor));
      return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
    });
    expect(titleContrast).toBeGreaterThanOrEqual(4.5);
    await expect(page.getByText(/Chọn nghĩa đúng/i)).toHaveCount(3);
    await expect(page.locator('[role="img"][aria-label*="Ech Buri"]').first()).toHaveAttribute('data-mascot-state', 'welcome');

    const questions = page.locator('fieldset');
    for (let index = 0; index < 3; index += 1) {
      await questions.nth(index).locator('input[type="radio"]').first().check();
    }
    await expect(page.getByRole('button', { name: /Hoàn thành 8 phút đầu tiên/i })).toBeEnabled();
    await page.getByRole('button', { name: /Hoàn thành 8 phút đầu tiên/i }).click();
    await expect(page.getByRole('heading', { name: /Bạn đã có chiến thắng đầu tiên/i })).toBeVisible();
    await expect(page.getByText(/Đã lưu tiến độ/i)).toBeVisible();
    await expect(page.locator('[role="img"][aria-label*="Ech Buri"]').first()).toHaveAttribute('data-mascot-state', 'cheering');
    await expect(page.getByRole('link', { name: /Xem bước học tiếp theo/i })).toHaveAttribute('href', '/app/dashboard');
  });

  test('registration uses a celebratory Ech Buri encouragement', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('form').first()).toBeVisible({ timeout: 20_000 });

    const mascot = page.locator('[role="img"][aria-label*="Ech Buri"]').first();
    await expect(mascot).toBeVisible();
    await expect(mascot).toHaveAttribute('data-mascot-state', 'success');
  });

  test('forgot-password keeps legacy dark surfaces readable', async ({ page }) => {
    await page.goto('/forgot-password', { waitUntil: 'domcontentloaded' });

    const title = page.locator('h1');
    await expect(title).toBeVisible({ timeout: 20_000 });
    expect(await textContrastAgainstNearestSolidBackground(title)).toBeGreaterThanOrEqual(4.5);

    const emailInput = page.locator('#reset-email');
    await expect(emailInput).toBeVisible();
    expect(await emailInput.evaluate((input) => getComputedStyle(input.parentElement!).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('legacy app cards and headings stay readable on the warm application surface', async ({ page }) => {
    await seedAuthenticatedLearner(page, 'ech_buri_music_contrast_user');
    await page.goto('/app/music', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#app-main')).toBeVisible({ timeout: 20_000 });

    const songHeading = page.locator('section > h2').first();
    await expect(songHeading).toBeVisible();
    expect(await textContrastAgainstNearestSolidBackground(songHeading)).toBeGreaterThanOrEqual(4.5);

    const mediaCard = page.locator('a[href*="open.spotify.com"]').first();
    await expect(mediaCard).toBeVisible();
    expect(await textContrastAgainstNearestSolidBackground(mediaCard.locator('h3'))).toBeGreaterThanOrEqual(4.5);
    expect(await textContrastAgainstNearestSolidBackground(mediaCard.locator('.text-dark-400'))).toBeGreaterThanOrEqual(4.5);
  });

  test('first-win keeps the full lesson in a keyboard-accessible scroll panel on desktop', async ({ page }) => {
    await seedAuthenticatedLearner(page, 'ech_buri_first_win_scroll_user');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/app/first-win?goal=habit', { waitUntil: 'domcontentloaded' });

    const lessonPanel = page.locator('.first-win-scroll-panel');
    await expect(lessonPanel).toBeVisible({ timeout: 20_000 });
    await expect(lessonPanel).toHaveAttribute('tabindex', '0');
    expect(await lessonPanel.evaluate((panel) => getComputedStyle(panel).overflowY)).toBe('auto');
    expect(await lessonPanel.evaluate((panel) => panel.scrollHeight > panel.clientHeight)).toBe(true);
    await lessonPanel.evaluate((panel) => { panel.scrollTop = panel.scrollHeight; });
    expect(await lessonPanel.evaluate((panel) => panel.scrollTop > 0)).toBe(true);
  });

  test('streak page uses recorded progress instead of a fake repair offer', async ({ page }) => {
    await seedAuthenticatedLearner(page);
    await page.goto('/app/calendar', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#app-main')).toBeVisible({ timeout: 20_000 });

    await expect(page.getByRole('heading', { name: 'Chuỗi học' })).toBeVisible();
    await expect(page.getByText(/bán quyền sửa chuỗi/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Repair/i })).toHaveCount(0);
    const mascot = page.locator('[role="img"][aria-label*="Ech Buri"]').first();
    await expect(mascot).toBeVisible();
    await expect(mascot).toHaveAttribute('data-mascot-state', /welcome|thinking|streak/);
    await expect(page.getByRole('link', { name: /Bắt đầu nhiệm vụ hôm nay/i })).toHaveAttribute('href', '/app/dashboard');
  });

  test('audio lesson waits in an attentive listening pose', async ({ page }) => {
    await seedAuthenticatedLearner(page);
    await page.goto('/app/lesson?lang=en', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#app-main')).toBeVisible({ timeout: 20_000 });

    const mascot = page.locator('[role="img"][aria-label*="Ech Buri"]').first();
    await expect(mascot).toBeVisible();
    await expect(mascot).toHaveAttribute('data-mascot-state', 'listening');
  });
});
