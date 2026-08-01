import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:5173/app/languages', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'audit_proof/07_language_selection_fixed.png', fullPage: false });
  console.log('Saved: audit_proof/07_language_selection_fixed.png');
  
  await browser.close();
}

main().catch(console.error);
