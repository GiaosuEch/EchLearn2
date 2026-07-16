import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';
import path from 'node:path';

import { analyzeSpeech } from '../../src/services/speechAnalysis.ts';
import { analyzeWriting } from '../../src/services/writingFeedback.ts';

const root = process.cwd();
const unavailableOutcome = {
  status: 'unavailable',
  mode: 'local-model',
  reason: 'APPROVED_LOCAL_MODEL_UNAVAILABLE',
  isAiGenerated: false,
};

describe('legacy assessment safety', () => {
  it('returns an explicit unavailable state instead of fabricated speech scores', async () => {
    const result = await analyzeSpeech(new Blob(['audio']), 'Read this sentence.');

    assert.deepEqual(result, unavailableOutcome);
    assert.equal('output' in result, false);
  });

  it('returns an explicit unavailable state instead of fabricated writing scores', async () => {
    const result = await analyzeWriting('A learner response.', 'essay');

    assert.deepEqual(result, unavailableOutcome);
    assert.equal('output' in result, false);
  });

  it('keeps dangerous legacy assessment surfaces free of random or hardcoded bands', async () => {
    const relativePaths = [
      'src/pages/app/ielts/IELTSSpeakingPage.tsx',
      'src/pages/app/ielts/IELTSWritingPage.tsx',
      'src/services/speechAnalysis.ts',
      'src/services/writingFeedback.ts',
    ];

    for (const relativePath of relativePaths) {
      const source = await readFile(path.join(root, relativePath), 'utf8');
      assert.doesNotMatch(source, /Math\.random\s*\(/, relativePath);
      assert.doesNotMatch(
        source,
        /\b(?:bandScore|overallBand|getIELTSSpeakingBand)\b/,
        relativePath,
      );
    }
  });

  it('shows an honest unavailable state on legacy assessment pages', async () => {
    for (const relativePath of [
      'src/pages/app/ielts/IELTSSpeakingPage.tsx',
      'src/pages/app/ielts/IELTSWritingPage.tsx',
    ]) {
      const source = await readFile(path.join(root, relativePath), 'utf8');
      assert.match(source, /Automated assessment is unavailable/, relativePath);
      assert.doesNotMatch(source, /MascotIELTSFeedback/, relativePath);
    }
  });

  it('requires explicit, reasoned non-assessment exceptions', async () => {
    const ledgerText = await readFile(
      path.join(root, 'quality/randomAssessmentExceptions.json'),
      'utf8',
    );
    const ledger = JSON.parse(ledgerText) as {
      version: number;
      exceptions: Array<{ id: string; scope: string; reason: string }>;
    };

    assert.equal(ledger.version, 1);
    assert.ok(ledger.exceptions.length > 0);
    assert.equal(new Set(ledger.exceptions.map((entry) => entry.id)).size, ledger.exceptions.length);
    for (const entry of ledger.exceptions) {
      assert.ok(
        entry.scope === 'cosmetic' ||
          entry.scope === 'content-variation' ||
          entry.scope === 'operational-identifier',
      );
      assert.ok(entry.reason.trim().length >= 20);
    }
  });
});
