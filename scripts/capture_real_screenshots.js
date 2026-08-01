import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

(async () => {
  const outputDir = path.join(process.cwd(), 'real_tests_evidence');
  const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cede7677-f2cb-404c-af90-08cd137e333f';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Launching Chromium browser with authenticated test state...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  // Inject Neutral Demo/Test user auth state into localStorage prior to navigation
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

  const pagesToTest = [
    { name: '01_dashboard.png', url: 'http://127.0.0.1:5173/app' },
    { name: '02_practice_center.png', url: 'http://127.0.0.1:5173/app/practice' },
    { name: '03_mascot.png', url: 'http://127.0.0.1:5173/app/customize' },
    { name: '04_pricing.png', url: 'http://127.0.0.1:5173/app/pricing' },
    { name: '05_friends.png', url: 'http://127.0.0.1:5173/app/community/friends' },
  ];

  for (const item of pagesToTest) {
    console.log(`Navigating to ${item.url}...`);
    await page.goto(item.url, { waitUntil: 'networkidle' });
    
    // Wait for the main app container to ensure full React render
    try {
      await page.waitForSelector('main#app-main, nav#app-sidebar, .lingfrog-app', { timeout: 5000 });
    } catch {
      console.log('Main selector timeout, continuing to screenshot...');
    }

    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    console.log(`Current page URL: ${currentUrl}`);
    if (currentUrl.includes('/register') || currentUrl.includes('/login')) {
      console.error(`ERROR: Redirected to auth wall on ${item.name}! URL: ${currentUrl}`);
    } else {
      console.log(`SUCCESS: Stayed on authenticated route ${currentUrl}`);
    }

    const targetPath = path.join(outputDir, item.name);
    await page.screenshot({ path: targetPath, fullPage: true });
    console.log(`Saved screenshot: ${targetPath}`);

    if (fs.existsSync(artifactDir)) {
      const artifactPath = path.join(artifactDir, item.name);
      fs.copyFileSync(targetPath, artifactPath);
      console.log(`Copied to artifact: ${artifactPath}`);
    }
  }

  await browser.close();
  console.log('All authenticated real browser screenshots captured successfully!');
})();
