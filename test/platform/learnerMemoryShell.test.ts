import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

function read(relativePath: string): string {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

describe('Learner Memory shell integration', () => {
  it('registers the /app/learner-memory route', () => {
    const app = read('src/App.tsx');

    assert.match(app, /LearnerMemoryPage/);
    assert.match(app, /<Route path="learner-memory" element={<LearnerMemoryPage \/>} \/>/);
  });

  it('adds a minimal Practice Hub entry without a sidebar item', () => {
    const hub = read('src/pages/app/PracticeHubPage.tsx');
    const layout = read('src/components/layout/AppLayout.tsx');
    const marker = hub.indexOf('{/* Learner Memory */}');
    const card = hub.slice(marker, marker + 1000);

    assert.notEqual(marker, -1);
    assert.match(card, /to="\/app\/learner-memory"/);
    assert.match(card, />Learner Memory</);
    assert.doesNotMatch(layout, /\/app\/learner-memory|learner_memory/);
  });

  it('shows honest consent-gated copy and all four controls', () => {
    const source = read('src/components/learning/LearnerMemoryShell.tsx');

    assert.match(source, /Learner memory is local and consent-gated\./);
    assert.match(source, /No AI personalization is generated until an approved local model is ready\./);
    assert.match(source, />Enable local learner memory</);
    assert.match(source, />Disable learner memory</);
    assert.match(source, />Delete learner memory</);
    assert.match(source, />Export learner memory</);
  });

  it('renders no fake insights, recommendations, or scores', () => {
    const source = read('src/components/learning/LearnerMemoryShell.tsx');

    assert.doesNotMatch(source, /Math\.random|recommendation:|insight:|score:|\bband\b/i);
  });

  it('contains no IELTS/exam-specific terms in the learner memory core', () => {
    const source = [
      read('src/platform/learning/learnerMemoryTypes.ts'),
      read('src/platform/learning/learnerMemoryStore.ts'),
      read('src/platform/learning/learnerMemoryViewModel.ts'),
    ].join('\n');

    assert.doesNotMatch(source, /\bIELTS\b|band score|Speaking Part [123]|Writing Task [12]|TOEIC|TOEFL/i);
  });

  it('contains no banned marketing copy', () => {
    const source = [
      read('src/components/learning/LearnerMemoryShell.tsx'),
      read('src/pages/app/LearnerMemoryPage.tsx'),
    ].join('\n');

    assert.doesNotMatch(source, /unlimited AI|ChatGPT-like|official IELTS score|guaranteed band|stronger than ELSA/i);
  });
});
