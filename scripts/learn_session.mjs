/**
 * Real learning-session runner. Plays the actual learning UI as a learner:
 * SpeedQuiz (reveal + self-assess), Vocabulary multiple-choice (answer + feedback),
 * and 3D flashcards (flip). Records a full transcript for pedagogy/content audit.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.LEARN_BASE || 'http://127.0.0.1:5173';
const ROUND = process.env.LEARN_ROUND || '1';
const OUT_DIR = path.resolve('learn_sessions');
fs.mkdirSync(OUT_DIR, { recursive: true });

const AUTH_INIT = () => {
  localStorage.setItem('echlern_current_user_id', 'test_owner');
  localStorage.setItem('echlern_db_users', JSON.stringify([{
    id: 'test_owner', email: 'learner@test.local', role: 'admin',
    targetLanguage: 'en', nativeLanguage: 'vi',
  }]));
  localStorage.setItem('echlearn_local_entitlements_v1', JSON.stringify([{
    userId: 'test_owner', plan: 'pro', source: 'purchased', activatedBy: 'admin',
    activatedAt: new Date().toISOString(), expiresAt: null,
  }]));
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function playSpeedQuiz(page, lang, transcript) {
  const entries = [];
  try {
    await page.goto(`${BASE}/app/speed-quiz?lang=${lang}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3500);
    const start = page.locator('button', { hasText: /Chấp Nhận Thử Thách/i }).first();
    await start.click({ timeout: 15000 });
    await sleep(800);
    for (let i = 0; i < 8; i++) {
      const reveal = page.locator('button', { hasText: /TÔI ĐÃ NHỚ RA NGHĨA/i }).first();
      if (!(await reveal.count())) break;
      const word = (await page.locator('h3').first().textContent() || '').trim();
      await reveal.click({ timeout: 15000 });
      await sleep(600);
      const answer = ((await page.locator('h4').first().textContent()) || '').trim();
      const example = ((await page.locator('p.italic').first().textContent()) || '').trim();
      const grade = i % 3 === 2 ? 'TÔI ĐÃ NGHĨ SAI' : 'CHÍNH XÁC NHƯ TÔI NGHĨ';
      const gradeBtn = page.locator('button', { hasText: grade }).first();
      if (await gradeBtn.count()) {
        entries.push({ word, answer, example, selfGrade: grade === 'CHÍNH XÁC NHƯ TÔI NGHĨ' ? 'correct' : 'wrong' });
        await gradeBtn.click({ timeout: 15000 });
        await sleep(500);
      } else break;
    }
  } catch (e) {
    entries.push({ error: String(e).slice(0, 200) });
  }
  transcript.push({ game: 'speed-quiz', lang, entries });
}

async function playVocabQuiz(page, lang, transcript) {
  const entries = [];
  try {
    await page.goto(`${BASE}/app/vocabulary?lang=${lang}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3500);
    const quizTab = page.locator('button', { hasText: 'Câu đố' }).first();
    if (await quizTab.count()) {
      await quizTab.click({ timeout: 15000 });
      await sleep(800);
    }
    for (let i = 0; i < 8; i++) {
      const options = page.locator('main button.w-full');
      const count = await options.count();
      if (!count) break;
      const optTexts = [];
      for (let j = 0; j < count; j++) optTexts.push(((await options.nth(j).textContent()) || '').trim());
      const prompt = ((await page.locator('main h2, main h3').first().textContent()) || '').trim();
      await options.first().click({ timeout: 15000 });
      await sleep(700);
      const feedback = ((await page.locator('main').textContent()) || '');
      const correctShown = /chính xác|đúng/i.test(feedback);
      const explanationShown = /ví dụ|giải thích|nghĩa là/i.test(feedback);
      entries.push({ prompt, options: optTexts, pickedFirst: true, correctShown, explanationShown });
      const next = page.locator('button', { hasText: /Câu tiếp theo|Tiếp/i }).first();
      if (await next.count()) { await next.click({ timeout: 15000 }); await sleep(500); }
      else break;
    }
  } catch (e) {
    entries.push({ error: String(e).slice(0, 200) });
  }
  transcript.push({ game: 'vocab-trac-nghiem', lang, entries });
}

async function playFlashcards(page, lang, transcript) {
  const entries = [];
  try {
    await page.goto(`${BASE}/app/flashcards-3d?lang=${lang}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3500);
    for (let i = 0; i < 5; i++) {
      const card = page.locator('[class*="preserve-3d"]').first();
      const clickable = (await card.count()) ? card : page.locator('main').first();
      const front = ((await page.locator('main h2, main h3').first().textContent()) || '').trim();
      await clickable.click({ timeout: 15000 });
      await sleep(700);
      const back = ((await page.locator('[style*="rotateY(180deg)"]').first().textContent()) || '').trim();
      entries.push({ front, back, flipped: front !== back });
      const next = page.locator('button', { hasText: /Quên|Siêu|Nhớ|tiếp|next/i }).first();
      if (await next.count()) { await next.click({ timeout: 15000 }); await sleep(600); } else break;
    }
  } catch (e) {
    entries.push({ error: String(e).slice(0, 200) });
  }
  transcript.push({ game: 'flashcards-3d', lang, entries });
}

const LANGS = (process.env.LEARN_LANGS || 'en,zh,fr,ja').split(',');
const transcript = [];
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const page = await context.newPage();
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 160)); });
page.on('pageerror', (e) => consoleErrors.push(String(e).slice(0, 160)));
await page.addInitScript(AUTH_INIT);

for (const lang of LANGS) {
  await playSpeedQuiz(page, lang, transcript);
  await playVocabQuiz(page, lang, transcript);
  await playFlashcards(page, lang, transcript);
}

await browser.close();
const report = { round: ROUND, base: BASE, langs: LANGS, transcript, consoleErrors };
fs.writeFileSync(path.join(OUT_DIR, `round${ROUND}.json`), JSON.stringify(report, null, 1));
console.log(`LEARN ROUND ${ROUND} DONE: ${transcript.length} sessions, ${consoleErrors.length} console errors`);