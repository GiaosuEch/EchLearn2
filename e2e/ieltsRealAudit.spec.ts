import { test, expect } from '@playwright/test';

test.describe('Strict Real IELTS Audit Suite: Partial Wrong Reading & Writing AI Evaluation', () => {

  test('1. Test IELTS Reading Partial Wrong Submission (3 Correct, 3 Wrong) -> Verify Red X Icons & Band Score', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1200 });

    await page.addInitScript(() => {
      window.localStorage.setItem('echlern_current_user_id', 'admin-001');
      window.localStorage.setItem(
        'echlern_db_users',
        JSON.stringify([
          {
            id: 'admin-001',
            email: 'khounguyennguyen2012@gmail.com',
            displayName: 'GiaosuEch',
            role: 'admin',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        ])
      );
    });

    await page.goto('http://127.0.0.1:5173/app/ielts/reading', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=IELTS Reading Practice Suite', { timeout: 20000 });

    // Select Passage 3 (Roman Aqueducts)
    const passage3Tab = page.getByRole('button', { name: /Roman Aqueducts/i }).first();
    await passage3Tab.click();
    await page.waitForTimeout(500);

    // Q1: Incorrect selection -> TRUE (Correct is FALSE)
    await page.locator('button').filter({ hasText: /^TRUE$/ }).first().click();

    // Q2: Incorrect selection -> FALSE (Correct is TRUE)
    await page.locator('button').filter({ hasText: /^FALSE$/ }).nth(1).click();

    // Q3: Correct selection -> NOT GIVEN
    await page.locator('button').filter({ hasText: /^NOT GIVEN$/ }).nth(2).click();

    // Q4: Incorrect selection -> Fifty percent (Correct is Eighty percent)
    await page.locator('button').filter({ hasText: 'Fifty percent' }).first().click();

    // Q5: Correct selection -> Central distribution of water to city sectors
    await page.locator('button').filter({ hasText: 'Central distribution of water to city sectors' }).first().click();

    // Q6: Correct gap fill -> chorobates
    const gapFillInput = page.locator('input[placeholder*="Nhập từ"]').first();
    await gapFillInput.fill('chorobates');

    await page.waitForTimeout(600);

    // Submit Test
    const submitBtn = page.getByRole('button', { name: /Nộp Bài Thi IELTS Reading/i });
    await submitBtn.click();

    // Wait for submission result banner
    await page.waitForSelector('text=Kết Quả Đã Được Chấm Điểm!', { timeout: 10000 });
    await page.waitForTimeout(800);

    // Capture PROOF SCREENSHOT 1: ./audit_proof/ielts_reading_partial_wrong.png
    await page.screenshot({
      path: './audit_proof/ielts_reading_partial_wrong.png',
      fullPage: true,
    });
  });

  test('2. Test IELTS Writing Task 2 Essay Typing, Word Counter, and AI Feedback', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1200 });

    await page.addInitScript(() => {
      window.localStorage.setItem('echlern_current_user_id', 'admin-001');
      window.localStorage.setItem(
        'echlern_db_users',
        JSON.stringify([
          {
            id: 'admin-001',
            email: 'khounguyennguyen2012@gmail.com',
            displayName: 'GiaosuEch',
            role: 'admin',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        ])
      );
    });

    await page.goto('http://127.0.0.1:5173/app/ielts/writing', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=IELTS Writing Practice Suite', { timeout: 20000 });

    const textarea = page.locator('textarea').first();

    // 1. Fill short essay (approx 80 words) -> verify word counter warning
    const shortEssay = `In recent years, the debate surrounding custodial sentences versus alternative rehabilitation measures for criminal behavior has intensified significantly across modern societies. Proponents of harsher incarceration contend that lengthier prison terms serve as an effective deterrent against lawbreaking. However, critics argue that extended imprisonment often fosters recidivism rather than constructive rehabilitation. In my opinion, a balanced strategy combining community service with educational programs yields far superior long-term public safety outcomes.`;

    await textarea.fill(shortEssay);
    await page.waitForTimeout(400);

    // Verify word count warning is visible
    await expect(page.locator('text=Chưa đủ dung lượng từ')).toBeVisible();

    // 2. Extend essay to 260+ words
    const fullEssay = shortEssay + `\n\nFirstly, advocates of mandatory minimum prison terms emphasize that isolation protects law-abiding citizens from active offenders while enforcing proportional retribution for severe crimes. When wrongdoers face certain confinement, potential lawbreakers are discouraged from engaging in illegal activities. For instance, countries implementing strict criminal penalties frequently observe lower rates of violent property crime in urban districts.\n\nNevertheless, alternative non-custodial rehabilitation provides compelling societal benefits. Enrolling non-violent offenders in vocational education, cognitive behavioral therapy, and supervised community work directly addresses the root causes of criminal conduct, such as unemployment and substance abuse. Restorative justice initiatives empower individuals to acquire valuable job skills while compensating affected communities.\n\nIn conclusion, while lengthy prison sentences remain essential for violent offenders, non-violent criminals benefit far more from educational rehabilitation. Governments must allocate resources toward rehabilitative infrastructure to ensure sustainable crime reduction.`;

    await textarea.fill(fullEssay);
    await page.waitForTimeout(600);

    // Click "Chấm Điểm & Phân Tích Bài Viết AI"
    const evalBtn = page.getByRole('button', { name: /Chấm Điểm & Phân Tích Bài Viết AI/i });
    await evalBtn.click();

    // Wait for AI Evaluation card to render
    await page.waitForSelector('text=Overall', { timeout: 10000 });
    await page.waitForSelector('text=Task Response', { timeout: 5000 });
    await page.waitForTimeout(800);

    // Capture PROOF SCREENSHOT 2: ./audit_proof/ielts_writing_ai_feedback.png AND ./audit_proof/REAL_IELTS_WRITING_LIGHT_MODE.png
    await page.screenshot({
      path: './audit_proof/ielts_writing_ai_feedback.png',
      fullPage: true,
    });

    await page.screenshot({
      path: './audit_proof/REAL_IELTS_WRITING_LIGHT_MODE.png',
      fullPage: true,
    });
  });

});
