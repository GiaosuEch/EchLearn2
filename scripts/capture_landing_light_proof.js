import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://127.0.0.1:5173';
const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cede7677-f2cb-404c-af90-08cd137e333f';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  const page = await context.newPage();
  
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4500);

  // Take screenshot of landing page and save to 00_landing_light_fixed.png
  const filePath = path.join(process.cwd(), 'audit_proof', '00_landing_light_fixed.png');
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`Saved: ${filePath}`);
  fs.copyFileSync(filePath, path.join(artifactDir, '00_landing_light_fixed.png'));

  await browser.close();
  console.log('✅ Landing page light theme screenshot captured cleanly.');
})();
