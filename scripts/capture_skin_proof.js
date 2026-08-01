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
  
  // Navigate to customize page
  await page.goto(`${BASE}/app/customize`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);
  
  // Click on "ANIME NỔI TIẾNG" category filter to show anime skins
  const animeBtn = page.locator('button', { hasText: 'ANIME NỔI TIẾNG' });
  if (await animeBtn.isVisible()) {
    await animeBtn.click();
    await page.waitForTimeout(1500);
  }
  
  // Scroll the skin grid into full view
  const skinGrid = page.locator('.grid.grid-cols-2');
  if (await skinGrid.isVisible()) {
    await skinGrid.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
  }

  // Take full-page screenshot showing the anime skins
  const filePath = path.join(process.cwd(), 'audit_proof', '03_mascot_anime_skins.png');
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`Saved: ${filePath}`);
  fs.copyFileSync(filePath, path.join(artifactDir, '03_mascot_anime_skins.png'));
  
  // Also scroll down to capture the grid cards
  await page.evaluate(() => {
    const grid = document.querySelector('.grid.grid-cols-2');
    if (grid) grid.scrollTop = 0;
  });
  await page.waitForTimeout(500);
  
  // Take a cropped screenshot focusing on the first 4 skin cards
  const filePath2 = path.join(process.cwd(), 'audit_proof', '03_mascot_grid_closeup.png');
  await page.screenshot({ path: filePath2, fullPage: true });
  console.log(`Saved: ${filePath2}`);
  fs.copyFileSync(filePath2, path.join(artifactDir, '03_mascot_grid_closeup.png'));
  
  await browser.close();
  console.log('✅ Anime skin screenshots captured.');
})();
