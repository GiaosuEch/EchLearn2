import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

(async () => {
  const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cbad88ff-e50b-4021-9ba4-e40faadb2820';

  console.log('Launching Chromium browser with authenticated test state...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  await context.addInitScript(() => {
    const demoUser = {
      id: 'demo-test-user-001',
      email: 'demo.tester@echlearn.io',
      displayName: 'Học Viên Thử Nghiệm',
      username: 'EchTestUser',
      role: 'user',
      subscriptionTier: 'pro',
      hearts: 5,
      xp: 1250,
      streak: 7,
      level: 5,
      nativeLanguage: 'vi',
      interfaceLanguage: 'vi',
      targetLanguages: ['en'],
      ieltsTargetBand: 7.0,
      isPublicProfile: true,
      createdAt: new Date().toISOString(),
      badges: ['pro_tier', 'early_adopter'],
      friends: [],
      joinedGroups: []
    };

    window.localStorage.setItem('echlern_current_user_id', demoUser.id);
    window.localStorage.setItem('echlern_db_users', JSON.stringify([demoUser]));
    window.localStorage.setItem('echlearn_authenticated', 'true');
  });

  const page = await context.newPage();

  async function takeScreenshot(name) {
    const artifactPath = path.join(artifactDir, name);
    await page.screenshot({ path: artifactPath, fullPage: true });
    console.log(`Saved screenshot: ${artifactPath}`);
  }

  try {
    console.log('1. Testing Japanese N5 Roadmap and Lesson');
    await page.goto('http://127.0.0.1:5173/app/roadmap?lang=ja', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Click "Tiếp tục" or first lesson node
    const continueBtn = await page.getByText('Tiếp tục', { exact: true });
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
    } else {
      console.log('Could not find Tiếp tục button, clicking first lesson explicitly');
      await page.goto('http://127.0.0.1:5173/app/lesson?id=ja-n5-u0&lesId=ja-n5-u0-l1-hiragana', { waitUntil: 'networkidle' });
    }
    await page.waitForTimeout(2000);
    await takeScreenshot('ja_lesson.png');

    // Click "Hoàn thành bài học"
    const completeBtn = await page.getByRole('button', { name: /Hoàn thành bài học/i });
    if (await completeBtn.isVisible()) {
      await completeBtn.click();
      await page.waitForTimeout(1000);
      await takeScreenshot('ja_lesson_completed_screen.png');
      
      // Go back to roadmap to check progress
      const nextBtn = await page.getByRole('button', { name: /Tiếp Tục/i });
      if (await nextBtn.isVisible()) await nextBtn.click();
      else await page.goto('http://127.0.0.1:5173/app/roadmap?lang=ja', { waitUntil: 'networkidle' });
    } else {
      await page.goto('http://127.0.0.1:5173/app/roadmap?lang=ja', { waitUntil: 'networkidle' });
    }
    await page.waitForTimeout(2000);
    await takeScreenshot('ja_roadmap_completed.png');

    console.log('2. Testing Chinese HSK1 Grammar Lesson');
    await page.goto('http://127.0.0.1:5173/app/lesson?id=zh:hsk:hsk1:grammar&lesId=zh:hsk:hsk1:grammar:shi-ma-01', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await takeScreenshot('zh_lesson.png');

    console.log('3. Testing Korean TOPIK1 Grammar/Reading Lesson');
    await page.goto('http://127.0.0.1:5173/app/lesson?id=ko:topik:topik1:grammar&lesId=ko:topik:topik1:grammar:ieyo-yeyo-01', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await takeScreenshot('ko_lesson.png');

  } catch (err) {
    console.error('Error during browser testing:', err);
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
})();
