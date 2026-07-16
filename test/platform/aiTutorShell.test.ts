import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

function read(relativePath: string): string {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

describe('AI Tutor shell integration', () => {
  it('registers the /app/ai-tutor route', () => {
    const app = read('src/App.tsx');

    assert.match(app, /AITutorPage/);
    assert.match(app, /<Route path="ai-tutor" element={<AITutorPage \/>} \/>/);
  });

  it('links sidebar and dashboard AI Tutor entry points to the tutor route', () => {
    const layout = read('src/components/layout/AppLayout.tsx');
    const dashboard = read('src/pages/app/DashboardPage.tsx');
    const tutorCard = dashboard.slice(
      dashboard.indexOf('{/* AI Tutor */}'),
      dashboard.indexOf('{/* AI Tutor */}') + 900,
    );

    assert.match(layout, /key: 'ai_tutor', path: '\/app\/ai-tutor'/);
    assert.match(tutorCard, /to="\/app\/ai-tutor"/);
    assert.match(tutorCard, />AI Tutor</);
    assert.doesNotMatch(tutorCard, /\/app\/ai-speaking/);
  });

  it('uses the generic AI service flow and renders output only in success state', () => {
    const source = [
      read('src/components/ai/AITutorShell.tsx'),
      read('src/platform/ai/aiTutorViewModel.ts'),
    ].join('\n');

    assert.match(source, /AIService/);
    assert.match(source, /\.execute\s*\(/);
    assert.match(source, /state\.status === 'success'/);
    assert.match(source, /state\.output/);
    assert.match(source, /Local AI Tutor is not ready yet/);
    assert.match(source, /No approved local model is installed/);
  });

  it('contains no fake tutor behavior, exam leakage, or banned claims', () => {
    const source = [
      read('src/components/ai/AITutorShell.tsx'),
      read('src/pages/app/AITutorPage.tsx'),
      read('src/platform/ai/aiTutorViewModel.ts'),
      read('src/services/aiTutor.ts'),
    ].join('\n');

    assert.doesNotMatch(source, /Math\.random|setTimeout|tutorResponses|fake typing|fake streaming|canned/i);
    assert.doesNotMatch(source, /unlimited AI|ChatGPT-like|official IELTS|guaranteed band|stronger than ELSA/i);
    assert.doesNotMatch(source, /\bIELTS\b|Task Response|Speaking Part [123]|Writing Task [12]/i);
    assert.doesNotMatch(source, /https?:\/\/|fetch\s*\(/i);
  });
});