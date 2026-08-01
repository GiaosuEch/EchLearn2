import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ADMIN_USER = {
  id: 'admin_001',
  email: 'khounguyennguyen2012@gmail.com',
  displayName: 'GiaosuEch',
  username: 'GiaosuEch',
  role: 'admin',
  subscriptionTier: 'pro',
  targetLanguages: ['en'],
  level: 1,
  xp: 1544,
  streak: 42,
  hearts: 99,
  createdAt: new Date().toISOString(),
};

test('Capture IELTS & Practice Hub AFTER redesign state', async ({ page }) => {
  const auditDir = path.join(process.cwd(), 'audit_proof');
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
  }

  // Inject Admin session
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

  // 1. Capture Practice Center Redesign
  await page.goto('/app/practice');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(auditDir, '06_practice_center_redesign.png'), fullPage: true });

  // 2. Capture IELTS Suite Redesign
  await page.goto('/app/ielts');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(auditDir, '07_ielts_suite_redesign.png'), fullPage: true });
});
