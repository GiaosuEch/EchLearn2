import { expect, test } from '@playwright/test';

const appRoutes = [
  '/app', '/app/dashboard', '/app/ai-onboarding', '/app/first-win?goal=habit', '/app/mastery-mission',
  '/app/languages', '/app/roadmap', '/app/practice', '/app/lesson?id=en_mod_1&lesId=en_les_1',
  '/app/listening', '/app/listening/videos', '/app/speaking', '/app/reading', '/app/reading/news',
  '/app/writing', '/app/writing/master', '/app/vocabulary', '/app/grammar', '/app/music', '/app/podcasts',
  '/app/reference-charts', '/app/ielts', '/app/ielts/placement', '/app/ielts/listening', '/app/ielts/reading',
  '/app/ielts/writing', '/app/ielts/speaking', '/app/ielts/vocabulary', '/app/mock-tests', '/app/quizzes',
  '/app/speed-quiz', '/app/flashcards-3d', '/app/weekly-report', '/app/missions', '/app/calendar',
  '/app/leaderboard', '/app/achievements', '/app/community', '/app/groups', '/app/voice-rooms', '/app/chat',
  '/app/community/friends', '/app/community/discord', '/app/profile', '/app/edit-profile', '/app/notifications',
  '/app/settings', '/app/customize', '/app/pricing',
];

async function seedLearner(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const userId = 'route_audit_learner';
    localStorage.setItem('echlern-app-storage', JSON.stringify({
      state: {
        currentLanguage: 'en', interfaceLanguage: 'vi', nativeLanguage: 'vi', theme: 'light', sidebarOpen: true,
        soundEffects: true, speechSpeed: 'normal', fontSize: 'medium', dailyXpGoal: 50, ieltsTargetBand: 7,
        privacyMode: false, accentPaletteId: 'default', mascotSkinId: 'default', uiSurface: 'solid', mascotAnimation: true, seasonalEffects: false,
      },
      version: 2,
    }));
    localStorage.setItem('echlern_current_user_id', userId);
    localStorage.setItem('echlern_db_users', JSON.stringify([{
      id: userId,
      email: 'audit@example.com',
      displayName: 'Visual audit',
      username: 'visual-audit',
      role: 'user',
      subscriptionTier: 'pro',
      targetLanguages: ['en'],
      nativeLanguage: 'vi',
    }]));
    localStorage.setItem('echlern_db_user_settings', JSON.stringify([{
      id: userId,
      userId,
      interfaceLanguage: 'vi',
      nativeLanguage: 'vi',
      targetLanguage: 'en',
      theme: 'light',
      soundEffects: true,
      speechSpeed: 'normal',
      fontSize: 'medium',
      dailyXpGoal: 50,
      ieltsTargetBand: 7,
      publicProfile: true,
    }]));
  });
}

test.describe('App route visual audit', () => {
  test.setTimeout(120_000);

  test.beforeEach(({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        // Fail the test if there's any console.error
        throw new Error(`Console error detected: ${msg.text()}`);
      }
    });
    page.on('pageerror', (err) => {
      // Fail the test if there's an unhandled exception
      throw new Error(`Unhandled exception detected: ${err.message}`);
    });
  });

  for (const path of appRoutes) {
    test(`${path} renders readable content without horizontal overflow`, async ({ page }) => {
      await seedLearner(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.dataset.theme = 'light';
      });

      const appMain = page.locator('#app-main');
      await expect(appMain).toBeVisible({ timeout: 20_000 });
      expect(await appMain.evaluate((main) => main.innerText.trim().length > 0)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

      const unreadableLegacyText = await page.locator('#app-main [class*="text-white"], #app-main [class*="text-dark-300"], #app-main [class*="text-dark-400"], #app-main [class*="text-dark-500"]').evaluateAll((nodes) => {
        const parseRgb = (value: string) => {
          const rgb = value.match(/rgba?\(([^)]+)\)/i)?.[1]?.match(/-?\d+(?:\.\d+)?/g)?.slice(0, 3).map(Number);
          if (rgb) return rgb;

          const hex = value.match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
          if (hex) {
            const expanded = hex.length === 3 ? hex.split('').map((channel) => channel + channel).join('') : hex;
            return [0, 2, 4].map((offset) => Number.parseInt(expanded.slice(offset, offset + 2), 16));
          }

          const srgb = value.match(/color\(srgb\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/i);
          if (srgb) return srgb.slice(1, 4).map((channel) => Number(channel) * 255);

          const oklch = value.match(/oklch\(([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/i);
          if (oklch) {
            const [, rawL, rawC, rawHue] = oklch;
            const lightness = Number(rawL);
            const chroma = Number(rawC);
            const hue = Number(rawHue) * Math.PI / 180;
            const a = chroma * Math.cos(hue);
            const b = chroma * Math.sin(hue);
            const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
            const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
            const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
            const linear = [
              4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
              -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
              -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
            ];
            return linear.map((channel) => 255 * (channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055));
          }

          const oklab = value.match(/oklab\(([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/i);
          if (oklab) {
            const [, rawL, rawA, rawB] = oklab;
            const lightness = Number(rawL);
            const a = Number(rawA);
            const b = Number(rawB);
            const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
            const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
            const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
            const linear = [
              4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
              -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
              -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
            ];
            return linear.map((channel) => 255 * (channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055));
          }

          return [0, 0, 0];
        };
        const luminance = (rgb: number[]) => rgb.map((channel) => {
          const normalized = channel / 255;
          return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
        }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
        const ratio = (foreground: number[], background: number[]) => {
          const a = luminance(foreground);
          const b = luminance(background);
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        };
        const isTransparentBackground = (value: string) => {
          if (/^rgba?\(0, 0, 0(?:, 0| \/ 0)?\)$/i.test(value)) return true;
          const alpha = value.match(/(?:,|\/)\s*([\d.]+)\)?$/)?.[1];
          return alpha !== undefined && Number(alpha) <= 0.5;
        };

        return nodes.flatMap((node) => {
          const element = node as HTMLElement;
          const style = getComputedStyle(element);
          const text = (element.innerText || element.textContent || '').trim();
          if (!text || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) < 0.5) return [];
          let surface: Element | null = element;
          while (surface && isTransparentBackground(getComputedStyle(surface).backgroundColor)) surface = surface.parentElement;
          const backgroundColor = getComputedStyle(surface ?? document.body).backgroundColor;
          const contrast = ratio(parseRgb(style.color), parseRgb(backgroundColor));
          return contrast < 2.8 ? [{ text: text.slice(0, 80), className: element.className, color: style.color, backgroundColor, contrast }] : [];
        });
      });

      expect(unreadableLegacyText).toEqual([]);
    });
  }
});
