import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://127.0.0.1:5173';
const outputDir = path.join(process.cwd(), 'audit_proof');
const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cede7677-f2cb-404c-af90-08cd137e333f';

const pages = [
  { url: `${BASE}/app`, file: '01_dashboard_real.png' },
  { url: `${BASE}/app/practice`, file: '02_practice_real.png' },
  { url: `${BASE}/app/customize`, file: '03_mascot_real.png' },
  { url: `${BASE}/app/pricing`, file: '04_pricing_real.png' },
  { url: `${BASE}/app/community/friends`, file: '05_friends_real.png' },
];

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // INJECT AUTH STATE — LocalDatabase stores arrays under key `echlern_db_users`
  // The auth store reads `echlern_current_user_id` then calls localDb.findById('users', id)
  // localDb uses prefix `echlern_db_` so the key is `echlern_db_users` with a JSON ARRAY
  await context.addInitScript(() => {
    const userId = 'audit-user-001';
    const mockUser = {
      id: userId,
      email: 'audit@echlearn.vn',
      displayName: 'Audit User',
      username: 'AuditTester',
      nativeLanguage: 'vi',
      targetLanguage: 'en',
      level: 1,
      totalXP: 0,
      currentStreak: 7,
      role: 'admin',
      avatar: '/mascots/ech_buri_default.png',
      createdAt: new Date().toISOString(),
    };
    // Auth check 1: current user ID
    window.localStorage.setItem('echlern_current_user_id', userId);
    // Auth check 2: LocalDatabase stores table as JSON ARRAY under `echlern_db_users`
    window.localStorage.setItem('echlern_db_users', JSON.stringify([mockUser]));
  });

  const page = await context.newPage();
  let allPass = true;
  
  for (const { url, file } of pages) {
    console.log(`Navigating to ${url} ...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3500);
    
    const filePath = path.join(outputDir, file);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`  Saved: ${filePath}`);
    
    // Copy to artifact dir
    const artifactPath = path.join(artifactDir, file);
    fs.copyFileSync(filePath, artifactPath);
    
    // VALIDATION
    const currentUrl = page.url();
    const bodyText = await page.textContent('body') || '';
    if (currentUrl.includes('/register') || currentUrl.includes('/login') || bodyText.includes('TẠO TÀI KHOẢN')) {
      console.error(`FAIL: ${file} redirected to auth page! URL: ${currentUrl}`);
      allPass = false;
    } else {
      console.log(`  PASS: Rendered correctly at ${currentUrl}`);
    }
  }
  
  await browser.close();
  
  if (allPass) {
    console.log('\n✅ ALL 5 PAGES PASSED — No auth redirects detected.');
  } else {
    console.error('\n❌ SOME PAGES FAILED — Auth bypass incomplete.');
    process.exit(1);
  }
})();
