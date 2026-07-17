import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

function read(relativePath: string): string {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

describe('Speaking Coach shell integration', () => {
  it('registers the generic /app/ai-speaking route and page', () => {
    const app = read('src/App.tsx');
    const exports = read('src/pages/index.ts');
    const legacyPage = read('src/pages/app/ielts/AISpeakingCoachPage.tsx');

    assert.match(exports, /SpeakingCoachPage/);
    assert.match(legacyPage, /export \{ default \} from '\.\.\/SpeakingCoachPage';/);
    assert.match(app, /SpeakingCoachPage/);
    assert.match(app, /<Route path="ai-speaking" element={<SpeakingCoachPage \/>} \/>/);
    assert.doesNotMatch(app, /path="ai-speaking" element={<AISpeakingCoachPage \/>/);
  });

  it('uses generic AIService feedback flow and consent-aware learner memory storage', () => {
    const source = [
      read('src/components/ai/SpeakingCoachShell.tsx'),
      read('src/platform/ai/speakingCoachViewModel.ts'),
    ].join('\n');

    assert.match(source, /AIService/);
    assert.match(source, /\.execute\s*\(/);
    assert.match(source, /type:\s*'feedback'/);
    assert.match(source, /readLearnerMemoryRecord\s*\(/);
    assert.match(source, /createLearnerMemoryAIContext\s*\(/);
    assert.match(source, /state\.status === 'success'\s*&&\s*state\.isAiGenerated === true/);
    assert.match(source, /state\.feedback/);
  });

  it('provides generic speaking inputs without audio recording controls', () => {
    const source = read('src/components/ai/SpeakingCoachShell.tsx');

    assert.match(source, /Target language/);
    assert.match(source, /Native language/);
    assert.match(source, /Speaking goal/);
    assert.match(source, /Difficulty/);
    assert.match(source, /Topic \(optional\)/);
    assert.match(source, /Transcript \(optional\)/);
    assert.doesNotMatch(source, /MediaRecorder|getUserMedia|recording button|audio blob/i);
  });

  it('keeps existing unavailable-safe AI shells intact', () => {
    const app = read('src/App.tsx');
    const existing = [
      read('src/platform/ai/aiTutorViewModel.ts'),
      read('src/platform/ai/practiceGeneratorViewModel.ts'),
      read('src/platform/ai/writingCoachViewModel.ts'),
    ].join('\n');

    assert.match(app, /<Route path="ai-tutor" element={<AITutorPage \/>} \/>/);
    assert.match(app, /<Route path="practice-generator" element={<PracticeGeneratorPage \/>} \/>/);
    assert.match(app, /<Route path="ai-writing" element={<WritingCoachPage \/>} \/>/);
    assert.match(existing, /runtime-not-implemented/);
    assert.match(existing, /model-not-installed/);
  });

  it('contains no fake feedback, scores, external inference, or exam-specific terms', () => {
    const source = [
      read('src/components/ai/SpeakingCoachShell.tsx'),
      read('src/pages/app/SpeakingCoachPage.tsx'),
      read('src/platform/ai/speakingCoachViewModel.ts'),
    ].join('\n');

    assert.doesNotMatch(source, /Math\.random|Date\.now|setTimeout|fake loading|fake typing|fake streaming|canned|sample feedback/i);
    assert.doesNotMatch(source, /WebLLM|Transformers|Ollama|api[-_ ]?key|model URL|model download|cloud sync|https?:\/\/|fetch\s*\(/i);
    assert.doesNotMatch(source, /speech recognition|MediaRecorder|getUserMedia/i);
    assert.doesNotMatch(source, /\bIELTS\b|\bTOEIC\b|\bTOEFL\b|\bCEFR\b|band score|Speaking Part [123]|pronunciation score|fluency score/i);
  });
});
