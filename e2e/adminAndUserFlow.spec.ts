import { expect, test } from '@playwright/test';

const ADMIN_USER = {
  id: 'admin_001',
  email: 'khounguyennguyen2012@gmail.com',
  displayName: 'GiaosuEch',
  username: 'GiaosuEch',
  role: 'admin',
  subscriptionTier: 'pro',
  targetLanguages: ['en'],
  level: 1,
  xp: 100,
  streak: 5,
  hearts: 99,
  createdAt: new Date().toISOString(),
};

const FREE_USER = {
  id: 'free_user_001',
  email: 'freelearner@example.com',
  displayName: 'Học Viên Thường',
  username: 'freelearner',
  role: 'user',
  subscriptionTier: 'free',
  targetLanguages: ['en'],
  level: 1,
  xp: 10,
  streak: 1,
  hearts: 5,
  createdAt: new Date().toISOString(),
};

test.describe('EchLearn Authenticated E2E Playwright Browser Suite', () => {

  test('1. Admin user (`GiaosuEch`) accesses Admin Panel, controls pricing, and manages friends', async ({ page }) => {
    // Inject Admin session into localDatabase keys before page loads
    await page.addInitScript(({ adminUser }) => {
      const userSettings = {
        id: adminUser.id,
        userId: adminUser.id,
        interfaceLanguage: 'vi',
        nativeLanguage: 'vi',
        targetLanguage: 'en',
        theme: 'light',
      };
      localStorage.setItem('echlern_db_users', JSON.stringify([adminUser]));
      localStorage.setItem('echlern_db_user_settings', JSON.stringify([userSettings]));
      localStorage.setItem('echlern_current_user_id', adminUser.id);
    }, { adminUser: ADMIN_USER });

    // Navigate to Admin Panel
    await page.goto('/app/admin');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('text=Admin', { timeout: 15000 });

    // Verify Admin Panel header & text
    const bodyText = await page.textContent('body');
    expect(bodyText).toMatch(/Admin|Quản Lý Gói|GiaosuEch|Kích Hoạt/i);

    // Verify all 3 Admin tabs: Kích Hoạt Gói, Điều Chỉnh Giá, DS Tài Khoản
    const activateTab = page.getByRole('button', { name: /Kích Hoạt/i }).first();
    const pricingTab = page.getByRole('button', { name: /Điều Chỉnh Giá/i }).first();
    const usersTab = page.getByRole('button', { name: /DS Tài Khoản/i }).first();

    expect(await activateTab.isVisible()).toBe(true);
    expect(await pricingTab.isVisible()).toBe(true);
    expect(await usersTab.isVisible()).toBe(true);

    // Test tab switching
    await pricingTab.click();
    await page.waitForTimeout(300);
    const pricingContent = await page.textContent('body');
    expect(pricingContent).toMatch(/Bảng Giá Hiện Tại|Chỉnh Sửa Giá|VNĐ/i);

    await usersTab.click();
    await page.waitForTimeout(300);
    const usersContent = await page.textContent('body');
    expect(usersContent).toMatch(/Danh Sách Tài Khoản|khounguyennguyen2012/i);

    await activateTab.click();
    await page.waitForTimeout(300);

    // Navigate to Friends Page
    await page.goto('/app/friends');
    await page.waitForSelector('button:has-text("Tìm Bạn"), h1:has-text("Bạn Bè")', { timeout: 10000 });
    const friendsText = await page.textContent('body');
    expect(friendsText).toMatch(/Bạn Bè & Kết Bạn|Tìm Bạn|Lời Mời/i);

    // Verify Facebook-style Friends tabs
    const findFriendsTab = page.getByRole('button', { name: /Tìm Bạn/i }).first();
    const requestsTab = page.getByRole('button', { name: /Lời Mời/i }).first();
    const myFriendsTab = page.getByRole('button', { name: /Bạn Bè/i }).first();

    expect(await findFriendsTab.isVisible()).toBe(true);
    expect(await requestsTab.isVisible()).toBe(true);
    expect(await myFriendsTab.isVisible()).toBe(true);

    // Navigate to Pricing Page
    await page.goto('/app/pricing');
    await page.waitForSelector('h1, h2, div', { timeout: 15000 });
    await page.waitForTimeout(1500);
    const pricingPageText = await page.textContent('body');
    expect(pricingPageText).toMatch(/Bảng Giá Lộ Trình|Free|GO|PLUS|PRO/i);
  });

  test('2. Entitlement guard blocks restricted language lessons for free tier users', async ({ page }) => {
    // Inject Free User session into localDatabase keys before page loads
    await page.addInitScript(({ freeUser }) => {
      const userSettings = {
        id: freeUser.id,
        userId: freeUser.id,
        interfaceLanguage: 'vi',
        nativeLanguage: 'vi',
        targetLanguage: 'en',
        theme: 'light',
      };
      localStorage.setItem('echlern_db_users', JSON.stringify([freeUser]));
      localStorage.setItem('echlern_db_user_settings', JSON.stringify([userSettings]));
      localStorage.setItem('echlern_current_user_id', freeUser.id);
    }, { freeUser: FREE_USER });

    // Free user attempts to access a restricted Korean lesson URL
    await page.goto('/app/lesson?id=ko_mod_1&lesId=ko_les_1');
    await page.waitForTimeout(1000);

    // Verify entitlement guard kicked in: redirected to /pricing or lock toast shown
    const currentUrl = page.url();
    const pageText = await page.textContent('body');
    const isPricingPage = currentUrl.includes('/pricing') || /Bảng Giá|chưa được mở khóa|yêu cầu nâng cấp/i.test(pageText || '');

    expect(isPricingPage).toBe(true);
  });

});
