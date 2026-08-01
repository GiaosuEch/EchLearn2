import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://127.0.0.1:5173';
const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cede7677-f2cb-404c-af90-08cd137e333f';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  await context.addInitScript(() => {
    const userId = 'audit-user-001';
    const mockUser = {
      id: userId, email: 'audit@echlearn.vn', displayName: 'Audit User',
      username: 'AuditTester', nativeLanguage: 'vi', targetLanguage: 'en',
      level: 1, totalXP: 0, currentStreak: 7, role: 'admin',
      avatar: '/mascots/ech_buri_default.png', createdAt: new Date().toISOString(),
    };
    window.localStorage.setItem('echlern_current_user_id', userId);
    window.localStorage.setItem('echlern_db_users', JSON.stringify([mockUser]));
  });

  const page = await context.newPage();
  
  // Navigate to Dashboard
  await page.goto(`${BASE}/app`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3500);

  // Save screenshot 01_dashboard_designer.png
  const filePath = path.join(process.cwd(), 'audit_proof', '01_dashboard_designer.png');
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`Saved: ${filePath}`);
  fs.copyFileSync(filePath, path.join(artifactDir, '01_dashboard_designer.png'));

  await browser.close();
  console.log('✅ Designer UI Dashboard screenshot captured successfully.');
})();
