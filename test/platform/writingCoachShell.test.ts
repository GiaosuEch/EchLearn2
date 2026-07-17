import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

function read(relativePath: string): string {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

describe('Writing Coach shell integration', () => {
  it('registers the generic /app/ai-writing route and page', () => {
    const app = read('src/App.tsx');
    const exports = read('src/pages/index.ts');
    const legacyPage = read('src/pages/app/ielts/AIWritingCoachPage.tsx');

    assert.match(exports, /WritingCoachPage/);
    assert.match(legacyPage, /export \{ default \} from '\.\.\/WritingCoachPage';/);
    assert.match(app, /WritingCoachPage/);
    assert.match(app, /<Route path="ai-writing" element={<WritingCoachPage \/>} \/>/);
    assert.doesNotMatch(app, /path="ai-writing" element={<AIWritingFeedbackPage \/>/);
  });

  it('uses generic AIService feedback flow and consent-aware learner memory storage', () => {
    const source = [
      read('src/components/ai/WritingCoachShell.tsx'),
      read('src/platform/ai/writingCoachViewModel.ts'),
    ].join('\n');

    assert.match(source, /AIService/);
    assert.match(source, /\.execute\s*\(/);
    assert.match(source, /type:\s*'feedback'/);
    assert.match(source, /readLearnerMemoryRecord\s*\(/);
    assert.match(source, /createLearnerMemoryAIContext\s*\(/);
    assert.match(source, /state\.status === 'success'\s*&&\s*state\.isAiGenerated === true/);
    assert.match(source, /state\.feedback/);
  });

  it('provides generic writing inputs without exam-specific fields', () => {
    const source = read('src/components/ai/WritingCoachShell.tsx');

    assert.match(source, /Target language/);
    assert.match(source, /Native language/);
    assert.match(source, /Writing text/);
    assert.match(source, /Writing goal/);
    assert.match(source, /Difficulty/);
    assert.match(source, /Topic \(optional\)/);
  });

  it('keeps unavailable-safe AI Tutor and Practice Generator routes intact', () => {
    const app = read('src/App.tsx');
    const existing = [
      read('src/platform/ai/aiTutorViewModel.ts'),
      read('src/platform/ai/practiceGeneratorViewModel.ts'),
    ].join('\n');

    assert.match(app, /<Route path="ai-tutor" element={<AITutorPage \/>} \/>/);
    assert.match(app, /<Route path="practice-generator" element={<PracticeGeneratorPage \/>} \/>/);
    assert.match(existing, /runtime-not-implemented/);
    assert.match(existing, /model-not-installed/);
  });

  it('contains no fake feedback, scores, external inference, or exam-specific terms', () => {
    const source = [
      read('src/components/ai/WritingCoachShell.tsx'),
      read('src/pages/app/WritingCoachPage.tsx'),
      read('src/platform/ai/writingCoachViewModel.ts'),
    ].join('\n');

    assert.doesNotMatch(source, /Math\.random|Date\.now|setTimeout|fake loading|fake typing|fake streaming|canned|sample feedback/i);
    assert.doesNotMatch(source, /WebLLM|Transformers|Ollama|api[-_ ]?key|model URL|model download|cloud sync|https?:\/\/|fetch\s*\(/i);
    assert.doesNotMatch(source, /\bIELTS\b|\bTOEIC\b|\bTOEFL\b|\bCEFR\b|band score|Writing Task [12]|Speaking Part [123]/i);
  });
});
