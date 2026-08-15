import { test, expect } from '@playwright/test';

const privilegedLearner = async (page: import('@playwright/test').Page, lang: string) => {
  await page.addInitScript((l) => {
    localStorage.setItem('echlern_current_user_id', 'language_pack_audit');
    localStorage.setItem('echlern_db_users', JSON.stringify([{ id: 'language_pack_audit', email: 'audit@example.test', role: 'admin', targetLanguage: l, nativeLanguage: 'vi' }]));
    localStorage.setItem('echlearn_local_entitlements_v1', JSON.stringify([{ userId: 'language_pack_audit', plan: 'pro', source: 'purchased', activatedBy: 'admin', activatedAt: new Date().toISOString(), expiresAt: null }]));
  }, lang);
};

test('Verify Japanese Roadmap and Lesson', async ({ page }) => {
  await privilegedLearner(page, 'ja');
  await page.goto('http://localhost:5173/app/roadmap?lang=ja');
  await page.waitForLoadState('networkidle');
  
  await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cbad88ff-e50b-4021-9ba4-e40faadb2820\\ja_roadmap_initial.png', fullPage: true });
  await expect(page.locator('h1')).toContainText('N5');

  await page.getByTestId('next-lesson-button').click();
  await page.waitForLoadState('networkidle');
  
  await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cbad88ff-e50b-4021-9ba4-e40faadb2820\\ja_lesson_kana.png', fullPage: true });
  const isSurvivalJa = await page.url().includes('survival');
  if (isSurvivalJa) {
    await expect(page.getByRole('button', { name: 'Sang phần hiểu ý' })).toBeVisible();
  } else {
    await expect(page.getByRole('button', { name: 'Tiếp tục' }).first()).toBeVisible();

    let nextButton = page.getByRole('button', { name: 'Tiếp tục' });
    let btnCount = await nextButton.count();
    while (btnCount > 0) {
      if (await nextButton.first().isDisabled()) break;
      await nextButton.first().click();
      await page.waitForTimeout(500);
      nextButton = page.getByRole('button', { name: 'Tiếp tục' });
      btnCount = await nextButton.count();
    }

    await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cbad88ff-e50b-4021-9ba4-e40faadb2820\\ja_lesson_kana_questions.png', fullPage: true });
  }
});

test('Verify Chinese Roadmap and Lesson', async ({ page }) => {
  await privilegedLearner(page, 'zh');
  await page.goto('http://localhost:5173/app/roadmap?lang=zh');
  await page.waitForLoadState('networkidle');

  await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cbad88ff-e50b-4021-9ba4-e40faadb2820\\zh_roadmap_initial.png', fullPage: true });
  await expect(page.locator('h1')).toContainText('HSK 1');

  await page.getByTestId('next-lesson-button').click();
  await page.waitForLoadState('networkidle');

  await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cbad88ff-e50b-4021-9ba4-e40faadb2820\\zh_lesson_grammar.png', fullPage: true });
  
  const isSurvivalZh = await page.url().includes('survival');
  if (isSurvivalZh) {
    await expect(page.getByRole('button', { name: 'Sang phần hiểu ý' })).toBeVisible();
  } else {
    let nextButton = page.getByRole('button', { name: 'Tiếp tục' });
    let btnCount = await nextButton.count();
    while (btnCount > 0) {
      if (await nextButton.first().isDisabled()) break;
      await nextButton.first().click();
      await page.waitForTimeout(500);
      nextButton = page.getByRole('button', { name: 'Tiếp tục' });
      btnCount = await nextButton.count();
    }

    await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cbad88ff-e50b-4021-9ba4-e40faadb2820\\zh_lesson_grammar_questions.png', fullPage: true });
  }
});

test('Verify Korean Roadmap and Lesson', async ({ page }) => {
  await privilegedLearner(page, 'ko');
  await page.goto('http://localhost:5173/app/roadmap?lang=ko');
  await page.waitForLoadState('networkidle');

  await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cbad88ff-e50b-4021-9ba4-e40faadb2820\\ko_roadmap_initial.png', fullPage: true });
  await expect(page.locator('h1')).toContainText('TOPIK I');

  await page.getByTestId('next-lesson-button').click();
  await page.waitForLoadState('networkidle');

  await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cbad88ff-e50b-4021-9ba4-e40faadb2820\\ko_lesson_reading.png', fullPage: true });

  const isSurvivalKo = await page.url().includes('survival');
  if (isSurvivalKo) {
    await expect(page.getByRole('button', { name: 'Sang phần hiểu ý' })).toBeVisible();
  } else {
    let nextButton = page.getByRole('button', { name: 'Tiếp tục' });
    let btnCount = await nextButton.count();
    while (btnCount > 0) {
      if (await nextButton.first().isDisabled()) break;
      await nextButton.first().click();
      await page.waitForTimeout(500);
      nextButton = page.getByRole('button', { name: 'Tiếp tục' });
      btnCount = await nextButton.count();
    }

    await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cbad88ff-e50b-4021-9ba4-e40faadb2820\\ko_lesson_reading_questions.png', fullPage: true });
  }
});
