import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import {
  createIdleWritingCoachViewModel,
  createSubmittingWritingCoachViewModel,
  executeWritingCoachRequest,
  mapWritingCoachResponse,
} from '../../src/platform/ai/writingCoachViewModel.ts';
import type {
  AIService,
  AIServiceRequest,
  AIServiceResponse,
} from '../../src/platform/ai/aiServiceTypes.ts';
import type { LearnerMemoryRecord } from '../../src/platform/learning/learnerMemoryTypes.ts';

const learnerMemoryRecord: LearnerMemoryRecord = {
  consent: true,
  snapshot: {
    targetLanguage: 'fr',
    nativeLanguage: 'vi',
    skillFocus: 'writing',
    difficultyPreference: 'intermediate',
    recentPracticeSummary: 'Practised a short descriptive paragraph.',
    weakSkills: ['sentence structure'],
    preferredExerciseTypes: ['guided-response'],
    updatedAt: '2026-07-16T00:00:00.000Z',
    source: 'learner-memory-shell',
  },
};

const baseResponse = {
  requestType: 'feedback' as const,
  evidence: [],
  limitations: { codes: [] },
  provenance: {
    serviceId: 'platform-ai-service',
    serviceVersion: '1.0.0',
  },
  safety: {
    status: 'not-evaluated' as const,
    reasons: [],
  },
};

function unavailableResponse(): AIServiceResponse {
  return {
    ...baseResponse,
    status: 'unavailable',
    unavailableReason: 'runtime-not-implemented',
    isAiGenerated: false,
  };
}

function needsModelResponse(): AIServiceResponse {
  return {
    ...baseResponse,
    status: 'needs-model',
    unavailableReason: 'model-not-installed',
    isAiGenerated: false,
  };
}

function failedResponse(): AIServiceResponse {
  return {
    ...baseResponse,
    status: 'failed',
    requestType: 'unknown',
    error: {
      reason: 'invalid-request',
      message: 'Enter valid writing text.',
    },
    isAiGenerated: false,
  };
}

function successResponse(): AIServiceResponse {
  return {
    ...baseResponse,
    status: 'success',
    output: { text: 'Verified generated writing feedback.' },
    provenance: {
      ...baseResponse.provenance,
      modelArtifactId: 'approved-language-model',
      modelArtifactVersion: '1.0.0',
      runtimeId: 'approved-runtime',
      runtimeVersion: '1.0.0',
    },
    isAiGenerated: true,
  };
}

describe('Writing Coach view model', () => {
  it('represents idle and submitting without generated feedback', () => {
    const idle = createIdleWritingCoachViewModel();
    const submitting = createSubmittingWritingCoachViewModel();

    assert.equal(idle.status, 'idle');
    assert.equal(submitting.status, 'submitting');
    assert.equal(idle.isAiGenerated, false);
    assert.equal(submitting.isAiGenerated, false);
    assert.equal('feedback' in idle, false);
    assert.equal('feedback' in submitting, false);
  });

  it('maps a non-implemented runtime to unavailable without feedback', () => {
    const view = mapWritingCoachResponse(unavailableResponse());

    assert.equal(view.status, 'unavailable');
    assert.equal(view.isAiGenerated, false);
    assert.equal('feedback' in view, false);
  });

  it('maps a missing model to needs-model without feedback', () => {
    const view = mapWritingCoachResponse(needsModelResponse());

    assert.equal(view.status, 'needs-model');
    assert.equal(view.isAiGenerated, false);
    assert.equal('feedback' in view, false);
  });

  it('maps failed responses without generated feedback', () => {
    const view = mapWritingCoachResponse(failedResponse());

    assert.equal(view.status, 'failed');
    assert.match(view.description, /valid writing text/i);
    assert.equal(view.isAiGenerated, false);
    assert.equal('feedback' in view, false);
  });

  it('exposes feedback only for a validated AI-generated success', () => {
    const view = mapWritingCoachResponse(successResponse());

    assert.equal(view.status, 'success');
    assert.equal(view.feedback, 'Verified generated writing feedback.');
    assert.equal(view.isAiGenerated, true);
  });

  it('rejects malformed or non-generated success responses', () => {
    const malformed = {
      ...successResponse(),
      output: { text: '   ' },
      isAiGenerated: false,
    };

    const view = mapWritingCoachResponse(malformed);

    assert.equal(view.status, 'failed');
    assert.equal(view.isAiGenerated, false);
    assert.equal('feedback' in view, false);
  });

  it('calls generic AIService.execute with a feedback request and writing context', async () => {
    const requests: AIServiceRequest[] = [];
    const service: AIService = {
      serviceId: 'recording-service',
      serviceVersion: '1.0.0',
      async execute(request) {
        requests.push(request);
        return unavailableResponse();
      },
      async dispose() {},
    };

    const view = await executeWritingCoachRequest(service, {
      text: '  A short paragraph for review.  ',
      targetLanguage: 'fr',
      nativeLanguage: 'vi',
      writingGoal: 'clarity',
      difficulty: 'intermediate',
      topic: 'Daily routines',
      requestId: 'writing-request-1',
    });

    assert.equal(requests.length, 1);
    assert.deepEqual(requests[0], {
      requestId: 'writing-request-1',
      type: 'feedback',
      input: 'A short paragraph for review.',
      context: {
        sourceLanguage: 'vi',
        targetLanguage: 'fr',
        skillArea: 'writing',
        difficulty: 'intermediate',
        topic: 'Daily routines',
        exerciseType: 'clarity',
      },
    });
    assert.equal(view.status, 'unavailable');
  });

  it('includes generic learner memory only when consent is enabled and memory is valid', async () => {
    const requests: AIServiceRequest[] = [];
    const service: AIService = {
      serviceId: 'recording-service',
      serviceVersion: '1.0.0',
      async execute(request) {
        requests.push(request);
        return unavailableResponse();
      },
      async dispose() {},
    };

    await executeWritingCoachRequest(service, {
      text: 'Review this paragraph.',
      learnerMemory: learnerMemoryRecord,
    });

    assert.deepEqual(requests[0].context?.learnerMemory, {
      targetLanguage: 'fr',
      nativeLanguage: 'vi',
      skillFocus: 'writing',
      difficultyPreference: 'intermediate',
      recentPracticeSummary: 'Practised a short descriptive paragraph.',
      weakSkills: ['sentence structure'],
      preferredExerciseTypes: ['guided-response'],
    });
  });

  it('omits learner memory for disabled, deleted, empty, or malformed records', async () => {
    const requests: AIServiceRequest[] = [];
    const service: AIService = {
      serviceId: 'recording-service',
      serviceVersion: '1.0.0',
      async execute(request) {
        requests.push(request);
        return needsModelResponse();
      },
      async dispose() {},
    };

    const records: LearnerMemoryRecord[] = [
      { ...learnerMemoryRecord, consent: false },
      { consent: false, snapshot: null },
      {
        consent: true,
        snapshot: {
          weakSkills: [],
          preferredExerciseTypes: [],
          updatedAt: '2026-07-16T00:00:00.000Z',
          source: 'learner-memory-shell',
        },
      },
      { consent: true, snapshot: { targetLanguage: 42 } as never },
    ];

    for (const learnerMemory of records) {
      await executeWritingCoachRequest(service, {
        text: 'Review this paragraph.',
        learnerMemory,
      });
    }

    assert.equal(requests.length, records.length);
    for (const request of requests) {
      assert.equal(request.context?.learnerMemory, undefined);
      assert.equal(request.context?.skillArea, 'writing');
    }
  });

  it('contains no simulated output, scoring, model integration, or exam-specific core terms', () => {
    const source = readFileSync(
      new URL('../../src/platform/ai/writingCoachViewModel.ts', import.meta.url),
      'utf8',
    );

    assert.doesNotMatch(source, /Math\.random|Date\.now|setTimeout|fake typing|fake streaming|canned|sample feedback/i);
    assert.doesNotMatch(source, /WebLLM|Transformers|Ollama|api[-_ ]?key|model URL|cloud sync|fetch\s*\(/i);
    assert.doesNotMatch(source, /\bIELTS\b|\bTOEIC\b|\bTOEFL\b|\bCEFR\b|band score|Writing Task [12]|Speaking Part [123]/i);
  });
});
