import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://127.0.0.1:5173';
const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cede7677-f2cb-404c-af90-08cd137e333f';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  const page = await context.newPage();
  
  // Inject an existing user with email btdona7wn9vc2x4q@outlook.com into local database
  await page.goto(`${BASE}/register`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const existingUsers = [
      {
        id: 'user-registered-001',
        email: 'btdona7wn9vc2x4q@outlook.com',
        displayName: 'Existing Owner',
        username: 'existing_owner',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('echlern_db_users', JSON.stringify(existingUsers));
  });

  // Reload page so localDb loads the existing user
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Attempt to register again using the ALREADY REGISTERED email address
  const inputs = page.locator('form input');
  await inputs.nth(0).fill('Test Duplicate');
  await inputs.nth(1).fill('duplicate_user');
  await inputs.nth(2).fill('btdona7wn9vc2x4q@outlook.com'); // Registered email!
  await inputs.nth(3).fill('12345678');
  await inputs.nth(4).fill('12345678');

  // Click Submit Step 1
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  // Capture screenshot of the blocked registration screen showing error banner
  const filePath = path.join(process.cwd(), 'audit_proof', '06_register_email_blocked.png');
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`Saved: ${filePath}`);
  fs.copyFileSync(filePath, path.join(artifactDir, '06_register_email_blocked.png'));

  await browser.close();
  console.log('✅ Single email registration block screenshot captured cleanly.');
})();
