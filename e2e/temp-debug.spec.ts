import { test, expect } from '@playwright/test';

const privilegedLearner = async (page: import('@playwright/test').Page, lang: string) => {
  await page.addInitScript((l) => {
    localStorage.setItem('echlern_current_user_id', 'language_pack_audit');
    localStorage.setItem('echlern_db_users', JSON.stringify([{ id: 'language_pack_audit', email: 'audit@example.test', role: 'admin', targetLanguage: l, nativeLanguage: 'vi' }]));
    localStorage.setItem('echlearn_local_entitlements_v1', JSON.stringify([{ userId: 'language_pack_audit', plan: 'pro', source: 'purchased', activatedBy: 'admin', activatedAt: new Date().toISOString(), expiresAt: null }]));
  }, lang);
};

test('Log console and capture', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err));

  await privilegedLearner(page, 'ja');
  await page.goto('http://localhost:5173/app/roadmap?lang=ja');
  await page.waitForTimeout(3000); // Wait explicitly to let it load

  await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cbad88ff-e50b-4021-9ba4-e40faadb2820\\debug.png', fullPage: true });

  const bodyHtml = await page.innerHTML('body');
  console.log('BODY HTML LENGTH:', bodyHtml.length);
  
  // See if "JLPT N5" is there
  console.log('CONTAINS JLPT N5?', bodyHtml.includes('JLPT N5'));
});
