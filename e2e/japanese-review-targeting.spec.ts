import { expect, test, type Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });
test.setTimeout(60_000);

async function seedN5Access(page: Page, options: Readonly<{ vocabularyCards: number; grammarPercent?: number; dueReviewItemId?: string }> = { vocabularyCards: 0 }) {
  await page.addInitScript(({ vocabularyCards, grammarPercent, dueReviewItemId }) => {
    const items = Object.fromEntries(Array.from({ length: vocabularyCards }, (_, index) => {
      const id = `ja_v_${index + 1}`;
      return [id, { id, n: 1, ef: 2.5, interval: 1, nextReviewDate: Date.now() + 86_400_000, history: [5] }];
    }));
    if (dueReviewItemId) items[dueReviewItemId] = { id: dueReviewItemId, n: 1, ef: 2.5, interval: 1, nextReviewDate: Date.now() - 1, history: [5] };
    const progress = {
      'ja:jlpt:n5:kana-1': { id: 'ja:jlpt:n5:kana-1', attempts: 1, lastScore: 8, bestScore: 8, total: 10, percent: 80, completed: true },
      ...(grammarPercent === undefined ? {} : { 'ja:jlpt:n5:grammar-1': { id: 'ja:jlpt:n5:grammar-1', attempts: 1, lastScore: grammarPercent, bestScore: grammarPercent, total: 100, percent: grammarPercent, completed: grammarPercent >= 80 } }),
    };
    localStorage.setItem('echlearn_srs_mastery', JSON.stringify({ state: { items, lessonProgress: progress }, version: 0 }));
  }, options);
}

test('review links open the exact N5 vocabulary card and grammar question', async ({ page }) => {
  await seedN5Access(page, { vocabularyCards: 15 });
  await page.goto('/app/japanese/vocabulary?level=N5&lesson=vocab-1&review=ja%3Ajlpt%3An5%3Avocab-1%3Av011', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('11/30', { exact: true })).toBeVisible();

  await page.goto('/app/japanese/grammar?level=N5&lesson=grammar-1&review=ja%3Ajlpt%3An5%3Agrammar-1%3Aq2', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Câu 2 / 3', { exact: true })).toBeVisible();
});

test('the N5 dashboard review action preserves the due grammar item', async ({ page }) => {
  await seedN5Access(page, { vocabularyCards: 15, dueReviewItemId: 'ja:jlpt:n5:grammar-1:q2' });
  await page.goto('/app/japanese', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Ôn ngay' }).click();
  await expect(page).toHaveURL(/\/app\/japanese\/grammar\?level=N5&lesson=grammar-1&review=ja%3Ajlpt%3An5%3Agrammar-1%3Aq2/);
  await expect(page.getByText('Câu 2 / 3', { exact: true })).toBeVisible();
});

test('a reading review moves keyboard focus to the exact question', async ({ page }) => {
  await seedN5Access(page, { vocabularyCards: 30, grammarPercent: 100 });
  await page.goto('/app/japanese/reading?level=N5&lesson=reading-1&review=ja%3Ajlpt%3An5%3Areading-1%3Aq2', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#review-question-reading-1-q2')).toBeFocused();
});
