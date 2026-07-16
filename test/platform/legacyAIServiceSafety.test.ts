import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { getAITutorResponse } from '../../src/services/aiTutor.ts';
import { getStudyPlan } from '../../src/services/writingFeedback.ts';

function read(relativePath: string): string {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

describe('legacy AI service safety integration', () => {
  it('returns an explicit unavailable AIService response without fabricated output', async () => {
    const response = await getAITutorResponse('Explain this grammar point.');

    assert.equal(response.status, 'unavailable');
    assert.equal(response.isAiGenerated, false);
    assert.equal('output' in response, false);
    assert.ok(
      response.unavailableReason === 'model-not-approved'
      || response.unavailableReason === 'runtime-not-implemented'
      || response.unavailableReason === 'browser-unsupported',
    );
  });

  it('removes canned/random tutor simulation and delegates through the safe boundary', () => {
    const source = read('src/services/aiTutor.ts');

    assert.match(source, /AIService/);
    assert.match(source, /createUnavailableAIService/);
    assert.doesNotMatch(source, /Math\.random|tutorResponses|setTimeout|mock|canned/i);
    assert.doesNotMatch(source, /Present Perfect|abundant|essay structure/i);
  });

  it('labels the legacy deterministic study plan without a simulated AI delay', async () => {
    const plan = await getStudyPlan(7, 6, 8);
    const source = read('src/services/writingFeedback.ts');

    assert.equal(plan.method, 'deterministic-rule');
    assert.equal(plan.isAiGenerated, false);
    assert.doesNotMatch(source, /setTimeout/);
  });

  it('keeps speech and writing assessment services free of random scoring', () => {
    const source = [
      read('src/services/speechAnalysis.ts'),
      read('src/services/writingFeedback.ts'),
    ].join('\n');

    assert.doesNotMatch(source, /Math\.random|isAiGenerated\s*:\s*true/i);
    assert.match(source, /status:\s*['"]unavailable['"]/i);
  });

  it('removes hardcoded feedback and scores from legacy coach pages', () => {
    const source = [
      read('src/pages/app/ielts/AIWritingCoachPage.tsx'),
      read('src/pages/app/ielts/AISpeakingCoachPage.tsx'),
    ].join('\n');

    assert.doesNotMatch(source, /setTimeout|overall:\s*6\.5|pronunciation:\s*82|band 7\+/i);
    assert.doesNotMatch(source, /Examiner AI Feedback|I will provide detailed band scores/i);
    assert.match(source, /unavailable/i);
  });

  it('labels legacy placement feedback as an uncalibrated local estimate', () => {
    const source = [
      read('src/components/mascot/MascotIELTSFeedback.tsx'),
      read('src/pages/app/ielts/IELTSPlacementPage.tsx'),
      read('src/i18n/locales/en.ts'),
    ].join('\n');

    assert.doesNotMatch(source, /Examiner AI Feedback|definitely ready for the real exam|Our AI tools/i);
    assert.match(source, /uncalibrated beta estimate/i);
    assert.match(source, /local heuristic/i);
  });

  it('keeps exam-track concepts outside platform AI core', () => {
    const source = [
      read('src/platform/ai/aiService.ts'),
      read('src/platform/ai/aiServiceTypes.ts'),
      read('src/platform/evaluation/modelBenchmarkPlan.ts'),
      read('src/platform/evaluation/modelCandidateScoring.ts'),
    ].join('\n');

    assert.doesNotMatch(source, /IELTS|Task Response|Speaking Part|Writing Task/i);
  });
});
