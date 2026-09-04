/**
 * Persona walkthrough: 10 age cohorts, IQ-80 cognitive profile.
 * Runs the real app headlessly per persona, captures screenshots,
 * console errors, and cognitive-load metrics (choice counts, text density,
 * tap-target sizes). Read-only from the app's perspective.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.PERSONA_BASE || 'http://127.0.0.1:5176';
const OUT = path.resolve('persona_qa');
fs.mkdirSync(OUT, { recursive: true });

const AUTH_INIT = () => {
  localStorage.setItem('echlern_current_user_id', 'test_owner');
  localStorage.setItem('echlern_db_users', JSON.stringify([{
    id: 'test_owner', email: 'persona@test.local', role: 'admin',
    targetLanguage: 'en', nativeLanguage: 'vi',
  }]));
  localStorage.setItem('echlearn_local_entitlements_v1', JSON.stringify([{
    userId: 'test_owner', plan: 'pro', source: 'purchased', activatedBy: 'admin',
    activatedAt: new Date().toISOString(), expiresAt: null,
  }]));
};

const PERSONAS = [
  { id: 'p05', age: 5,  label: '5 tuổi mầm non',      viewport: { width: 834, height: 1112 },  mobile: true,  needsAudio: true },
  { id: 'p08', age: 8,  label: '8 tuổi tiểu học',     viewport: { width: 834, height: 1112 },  mobile: true },
  { id: 'p12', age: 12, label: '12 tuổi THCS',        viewport: { width: 1366, height: 768 } },
  { id: 'p15', age: 15, label: '15 tuổi THPT',        viewport: { width: 1366, height: 768 } },
  { id: 'p18', age: 18, label: '18 sinh viên',        viewport: { width: 1366, height: 768 } },
  { id: 'p25', age: 25, label: '25 đi làm',           viewport: { width: 390, height: 844 },   mobile: true },
  { id: 'p35', age: 35, label: '35 cha mẹ bận rộn',   viewport: { width: 390, height: 844 },   mobile: true },
  { id: 'p45', age: 45, label: '45 trung niên',       viewport: { width: 1440, height: 900 } },
  { id: 'p60', age: 60, label: '60 sắp hưu',          viewport: { width: 1440, height: 900 },  senior: true },
  { id: 'p72', age: 72, label: '72 cao tuổi',         viewport: { width: 1440, height: 900 },  senior: true },
];

const FLOWS = [
  { name: 'dashboard', url: '/app' },
  { name: 'vocab', url: '/app/vocabulary?lang=en' },
  { name: 'flashcards', url: '/app/flashcards-3d?lang=en' },
  { name: 'speedquiz', url: '/app/speed-quiz?lang=en' },
];

async function measure(page) {
  return page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button, a[role="button"], [role="button"]')];
    const visible = buttons.filter(b => {
      const r = b.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    const sizes = visible.map(b => {
      const r = b.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), text: (b.textContent || '').trim().slice(0, 40) };
    });
    const small = sizes.filter(s => s.h < 40 || s.w < 40);
    const textBlocks = [...document.querySelectorAll('main p, main li, main span, main div')]
      .filter(el => el.children.length === 0 && (el.textContent || '').trim().length > 0);
    const longest = textBlocks.map(el => (el.textContent || '').trim()).sort((a, b) => b.length - a.length)[0] || '';
    const audioControls = document.querySelectorAll('button[aria-label*="audio" i], button[aria-label*="phát" i], button[aria-label*="nghe" i], button[aria-label*="speaker" i], svg.lucide-volume-2, svg.lucide-play').length;
    const images = document.querySelectorAll('img').length;
    const headings = [...document.querySelectorAll('h1,h2,h3')].map(h => h.textContent.trim()).filter(Boolean);
    const englishJargon = [...textBlocks.map(el => el.textContent)]
      .filter(t => /\b(Streak|XP|Leaderboard|Checkpoint|Daily Focus|Mastery)\b/.test(t)).length;
    return {
      visibleButtons: visible.length,
      smallTargets: small,
      longestTextLen: longest.length,
      longestText: longest.slice(0, 160),
      audioControls,
      images,
      headings: headings.slice(0, 8),
      englishJargonCount: englishJargon,
    };
  });
}

const report = [];
const browser = await chromium.launch();
for (const persona of PERSONAS) {
  const context = await browser.newContext({
    viewport: persona.viewport,
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 200)); });
  page.on('pageerror', err => consoleErrors.push(String(err).slice(0, 200)));
  await page.addInitScript(AUTH_INIT);

  const personaReport = { ...persona, pages: [], consoleErrors };
  for (const flow of FLOWS) {
    try {
      await page.goto(BASE + flow.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(3500);
      const url = page.url();
      const redirected = !url.includes(flow.url.split('?')[0]);
      const metrics = redirected
        ? { redirectedTo: url }
        : await measure(page);
      const shot = path.join(OUT, `${persona.id}_${flow.name}.png`);
      await page.screenshot({ path: shot, fullPage: false }).catch(() => {});
      personaReport.pages.push({ flow: flow.name, ...metrics });
    } catch (err) {
      personaReport.pages.push({ flow: flow.name, error: String(err).slice(0, 200) });
    }
  }
  report.push(personaReport);
  await context.close();
}
await browser.close();
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
console.log('PERSONA QA COMPLETE:', report.length, 'personas x', FLOWS.length, 'flows ->', OUT);