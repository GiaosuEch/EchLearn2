import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:5173/app/friends', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'audit_proof/10_friends_page.png', fullPage: false });
  console.log('Screenshot saved to audit_proof/10_friends_page.png');
  await browser.close();
})();
