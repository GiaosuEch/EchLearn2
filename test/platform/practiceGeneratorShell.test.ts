import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

function read(relativePath: string): string {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

describe('Practice Generator shell integration', () => {
  it('registers the /app/practice-generator route', () => {
    const app = read('src/App.tsx');

    assert.match(app, /PracticeGeneratorPage/);
    assert.match(app, /<Route path="practice-generator" element={<PracticeGeneratorPage \/>} \/>/);
  });

  it('adds a minimal Practice Hub entry without a sidebar item', () => {
    const hub = read('src/pages/app/PracticeHubPage.tsx');
    const layout = read('src/components/layout/AppLayout.tsx');
    const marker = hub.indexOf('{/* Practice Generator */}');
    const card = hub.slice(marker, marker + 1000);

    assert.notEqual(marker, -1);
    assert.match(card, /to="\/app\/practice-generator"/);
    assert.match(card, />Practice Generator</);
    assert.doesNotMatch(layout, /\/app\/practice-generator|practice_generator/);
  });

  it('uses generic AIService and renders only validated success output', () => {
    const source = [
      read('src/components/ai/PracticeGeneratorShell.tsx'),
      read('src/platform/ai/practiceGeneratorViewModel.ts'),
    ].join('\n');

    assert.match(source, /AIService/);
    assert.match(source, /\.execute\s*\(/);
    assert.match(source, /type:\s*'generate-practice'/);
    assert.match(source, /state\.status === 'success'\s*&&\s*state\.isAiGenerated === true/);
    assert.match(source, /state\.output/);
    assert.match(source, /Practice generation is not ready yet/);
    assert.match(source, /No approved local model is installed/);
  });

  it('contains no simulated practice, exam leakage, or banned claims', () => {
    const source = [
      read('src/components/ai/PracticeGeneratorShell.tsx'),
      read('src/pages/app/PracticeGeneratorPage.tsx'),
      read('src/platform/ai/practiceGeneratorViewModel.ts'),
    ].join('\n');

    assert.doesNotMatch(source, /Math\.random|setTimeout|fake loading|fake typing|fake streaming|canned|sample practice/i);
    assert.doesNotMatch(source, /unlimited AI|ChatGPT-like|official IELTS|guaranteed band|stronger than ELSA|AI-powered generator/i);
    assert.doesNotMatch(source, /\bIELTS\b|Task Response|Speaking Part [123]|Writing Task [12]/i);
    assert.doesNotMatch(source, /https?:\/\/|fetch\s*\(/i);
  });
});
