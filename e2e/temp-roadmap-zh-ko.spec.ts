import { test, expect } from '@playwright/test';

test('Verify Chinese Roadmap and Lesson', async ({ page }) => {
  await page.goto('http://localhost:5173/app/roadmap?lang=zh');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cbad88ff-e50b-4021-9ba4-e40faadb2820\\zh_roadmap_initial.png', fullPage: true });

  // Click on grammar lesson (e.g., "HSK1 Grammar: shi...ma")
  await page.getByRole('link', { name: 'Học bài tiếp theo' }).first().click();
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cbad88ff-e50b-4021-9ba4-e40faadb2820\\zh_lesson_grammar.png', fullPage: true });

  // Answer questions if necessary or click tiếp tục
  let nextButton = page.getByRole('button', { name: 'Tiếp tục' });
  let btnCount = await nextButton.count();
  while (btnCount > 0) {
    await nextButton.first().click();
    await page.waitForTimeout(500);
    nextButton = page.getByRole('button', { name: 'Tiếp tục' });
    btnCount = await nextButton.count();
  }

  // Chụp một bước
  await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cbad88ff-e50b-4021-9ba4-e40faadb2820\\zh_lesson_grammar_questions.png', fullPage: true });

});

test('Verify Korean Roadmap and Lesson', async ({ page }) => {
  await page.goto('http://localhost:5173/app/roadmap?lang=ko');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cbad88ff-e50b-4021-9ba4-e40faadb2820\\ko_roadmap_initial.png', fullPage: true });

  // Click on reading lesson
  await page.getByRole('link', { name: 'Học bài tiếp theo' }).first().click();
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cbad88ff-e50b-4021-9ba4-e40faadb2820\\ko_lesson_reading.png', fullPage: true });

  // Answer questions if necessary or click tiếp tục
  let nextButton = page.getByRole('button', { name: 'Tiếp tục' });
  let btnCount = await nextButton.count();
  while (btnCount > 0) {
    await nextButton.first().click();
    await page.waitForTimeout(500);
    nextButton = page.getByRole('button', { name: 'Tiếp tục' });
    btnCount = await nextButton.count();
  }

  // Chụp một bước
  await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cbad88ff-e50b-4021-9ba4-e40faadb2820\\ko_lesson_reading_questions.png', fullPage: true });

});
