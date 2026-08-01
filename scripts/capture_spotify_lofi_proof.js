import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Click open lofi widget button
  const lofiButton = page.locator('button:has-text("Nhạc Chill")');
  if (await lofiButton.count() > 0) {
    await lofiButton.first().click();
    await page.waitForTimeout(1000);
  }
  
  await page.screenshot({ path: 'audit_proof/08_spotify_lofi_player.png', fullPage: false });
  console.log('Saved: audit_proof/08_spotify_lofi_player.png');
  
  await browser.close();
}

main().catch(console.error);
