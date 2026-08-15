import { expect, test } from '@playwright/test';

const privilegedLearner = async (page: import('@playwright/test').Page) => {
  await page.addInitScript(() => {
    localStorage.setItem('echlern_current_user_id', 'language_pack_audit');
    localStorage.setItem('echlern_db_users', JSON.stringify([{ id: 'language_pack_audit', email: 'audit@example.test', role: 'admin', targetLanguage: 'ja', nativeLanguage: 'vi' }]));
    localStorage.setItem('echlearn_local_entitlements_v1', JSON.stringify([{ userId: 'language_pack_audit', plan: 'pro', source: 'purchased', activatedBy: 'admin', activatedAt: new Date().toISOString(), expiresAt: null }]));
  });
};

test.describe('multilingual lesson-route recovery', () => {
  for (const testCase of [
    { path: '/app/japanese/grammar?lesson=reading-1', dashboard: '/app/japanese' },
    { path: '/app/japanese/reading?lesson=grammar-1', dashboard: '/app/japanese' },
    { path: '/app/japanese/vocabulary?lesson=grammar-1', dashboard: '/app/japanese' },
    { path: '/app/chinese/reading?lesson=zh:hsk:hsk1:grammar:shi-ma-01', dashboard: '/app/chinese' },
    { path: '/app/korean/grammar?lesson=ko:topik:topik1:reading:introduction-01', dashboard: '/app/korean' },
    { path: '/app/korean/vocabulary?lesson=ko:topik:topik1:reading:introduction-01', dashboard: '/app/korean' },
  ]) {
    test(`shows a keyboard-recoverable invalid state for ${testCase.path}`, async ({ page }) => {
      await privilegedLearner(page);
      await page.goto(testCase.path);

      await expect(page.getByRole('heading', { name: 'Bài học không hợp lệ' })).toBeVisible();
      const recovery = page.getByRole('link', { name: 'Quay về lộ trình' });
      await recovery.focus();
      await expect(recovery).toBeFocused();
      await recovery.press('Enter');
      await expect(page).toHaveURL(new RegExp(`${testCase.dashboard}$`));
    });
  }
});
