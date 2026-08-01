import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:5173/app/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Click on Spotify Lofi trigger or open player modal/widget if present
  const lofiBtn = page.locator('button:has-text("Lofi"), button:has-text("Nhạc Lofi"), [aria-label*="Lofi"]');
  if (await lofiBtn.count() > 0) {
    await lofiBtn.first().click();
    await page.waitForTimeout(1500);
  }
  
  await page.screenshot({ path: 'audit_proof/09_lofi_playlist_fixed.png', fullPage: false });
  console.log('Screenshot saved to audit_proof/09_lofi_playlist_fixed.png');
  await browser.close();
})();
