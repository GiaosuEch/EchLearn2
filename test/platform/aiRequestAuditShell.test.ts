import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

describe('AI request audit shell', () => {
  it('registers the /app/ai/audit route and page export', () => {
    const app = read('../../src/App.tsx');
    const pages = read('../../src/pages/index.ts');
    const page = read('../../src/pages/app/AIRequestAuditPage.tsx');

    assert.match(app, /AIRequestAuditPage/);
    assert.match(app, /<Route path="ai\/audit" element={<AIRequestAuditPage \/>} \/>/);
    assert.match(pages, /AIRequestAuditPage.*\.\/app\/AIRequestAuditPage/);
    assert.match(page, /<AIRequestAuditShell\s*\/>/);
  });

  it('adds a small audit-log link from the AI Coach Hub', () => {
    const hub = read('../../src/components/ai/AICoachHubShell.tsx');

    assert.match(hub, /to="\/app\/ai\/audit"/);
    assert.match(hub, /Request audit log/i);
  });

  it('renders metadata controls only and contains no fake or exam-specific claims', () => {
    const sources = [
      read('../../src/platform/ai/aiRequestAuditTypes.ts'),
      read('../../src/platform/ai/aiRequestAuditStore.ts'),
      read('../../src/platform/ai/aiRequestAuditViewModel.ts'),
      read('../../src/components/ai/AIRequestAuditShell.tsx'),
      read('../../src/pages/app/AIRequestAuditPage.tsx'),
    ].join('\n');

    assert.doesNotMatch(sources, /AIService|\.execute\(|Math\.random|Date\.now|setTimeout/);
    assert.doesNotMatch(sources, /unlimited AI|ChatGPT-like|official .* score|guaranteed band|stronger than ELSA/i);
    assert.doesNotMatch(sources, /IELTS|TOEIC|TOEFL|band score|Speaking Part|Writing Task/i);
    assert.doesNotMatch(sources, /personalized recommendation|generated insight|fake score/i);
    assert.match(sources, /metadata only/i);
    assert.match(sources, /Clear history/);
    assert.match(sources, /Export metadata/);
  });
});
