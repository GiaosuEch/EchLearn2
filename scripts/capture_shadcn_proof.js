import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://127.0.0.1:5173';
const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cede7677-f2cb-404c-af90-08cd137e333f';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // Inject authenticated user and initialized state into localStorage
  await context.addInitScript(() => {
    const mockUser = {
      id: 'usr_audit_dev_01',
      email: 'audit_dev@echlearn.io',
      displayName: 'Audit User',
      tier: 'GO',
      dailyXP: 120,
      streakDays: 14,
      level: 5,
    };
    window.localStorage.setItem('echlern_current_user_id', mockUser.id);
    window.localStorage.setItem('echlern_db_users', JSON.stringify([mockUser]));
    window.localStorage.setItem('echlern-auth-storage', JSON.stringify({
      state: { user: mockUser, initialized: true, isGuest: false },
      version: 0
    }));
    window.localStorage.setItem('echlern-app-storage', JSON.stringify({
      state: { theme: 'light', interfaceLanguage: 'vi' },
      version: 0
    }));
  });

  const page = await context.newPage();

  // 1. Dashboard with Shadcn Card, Button, Badge
  await page.goto(`${BASE}/app/dashboard`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(3000);
  const fileDash = path.join(process.cwd(), 'audit_proof', '01_dashboard_shadcn.png');
  await page.screenshot({ path: fileDash, fullPage: false });
  console.log(`Saved Dashboard Shadcn: ${fileDash}`);
  fs.copyFileSync(fileDash, path.join(artifactDir, '01_dashboard_shadcn.png'));

  // 2. Practice Hub with Shadcn Tabs & Card
  await page.goto(`${BASE}/app/practice`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(3000);
  const filePractice = path.join(process.cwd(), 'audit_proof', '02_practice_shadcn.png');
  await page.screenshot({ path: filePractice, fullPage: false });
  console.log(`Saved Practice Hub Shadcn: ${filePractice}`);
  fs.copyFileSync(filePractice, path.join(artifactDir, '02_practice_shadcn.png'));

  await browser.close();
  console.log('✅ Shadcn UI component screenshots captured successfully.');
})();
