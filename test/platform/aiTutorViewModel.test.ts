import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import {
  createIdleAITutorViewModel,
  createSubmittingAITutorViewModel,
  executeAITutorRequest,
  mapAITutorResponse,
} from '../../src/platform/ai/aiTutorViewModel.ts';
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
    skillFocus: 'vocabulary',
    difficultyPreference: 'intermediate',
    recentPracticeSummary: 'Reviewed common travel words.',
    weakSkills: ['word recall'],
    preferredExerciseTypes: ['short-answer'],
    updatedAt: '2026-07-16T00:00:00.000Z',
    source: 'learner-memory-shell',
  },
};

const baseResponse = {
  requestType: 'conversation' as const,
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

function unavailableResponse(reason: 'runtime-not-implemented' | 'model-not-approved'): AIServiceResponse {
  return {
    ...baseResponse,
    status: 'unavailable',
    unavailableReason: reason,
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
      message: 'Enter a valid learning question.',
    },
    isAiGenerated: false,
  };
}

function successResponse(): AIServiceResponse {
  return {
    ...baseResponse,
    status: 'success',
    output: { text: 'A verified generated explanation.' },
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

describe('AI Tutor view model', () => {
  it('represents idle and submitting states without generated output', () => {
    const idle = createIdleAITutorViewModel();
    const submitting = createSubmittingAITutorViewModel();

    assert.equal(idle.status, 'idle');
    assert.equal(submitting.status, 'submitting');
    assert.equal(idle.isAiGenerated, false);
    assert.equal(submitting.isAiGenerated, false);
    assert.equal('output' in idle, false);
    assert.equal('output' in submitting, false);
  });

  it('maps a non-implemented runtime to an honest unavailable state', () => {
    const view = mapAITutorResponse(unavailableResponse('runtime-not-implemented'));

    assert.equal(view.status, 'unavailable');
    assert.equal(view.heading, 'Local AI Tutor is not ready yet.');
    assert.equal(view.isAiGenerated, false);
    assert.equal('output' in view, false);
  });

  it('maps a missing model to needs-model without fabricated output', () => {
    const view = mapAITutorResponse(needsModelResponse());

    assert.equal(view.status, 'needs-model');
    assert.equal(view.heading, 'No approved local model is installed.');
    assert.match(view.description, /continue learning without AI assistance/i);
    assert.equal(view.isAiGenerated, false);
    assert.equal('output' in view, false);
  });

  it('maps an invalid request to a clear failed state', () => {
    const view = mapAITutorResponse(failedResponse());

    assert.equal(view.status, 'failed');
    assert.match(view.heading, /could not be completed/i);
    assert.match(view.description, /valid learning question/i);
    assert.equal(view.isAiGenerated, false);
    assert.equal('output' in view, false);
  });

  it('exposes output only for a real success response', () => {
    const view = mapAITutorResponse(successResponse());

    assert.equal(view.status, 'success');
    assert.equal(view.output, 'A verified generated explanation.');
    assert.equal(view.isAiGenerated, true);
  });

  it('executes a generic conversation request with optional learning context', async () => {
    const requests: AIServiceRequest[] = [];
    const service: AIService = {
      serviceId: 'recording-service',
      serviceVersion: '1.0.0',
      async execute(request) {
        requests.push(request);
        return unavailableResponse('runtime-not-implemented');
      },
      async dispose() {},
    };

    const view = await executeAITutorRequest(service, {
      prompt: 'Explain this word.',
      targetLanguage: 'fr',
      skillArea: 'vocabulary',
    });

    assert.equal(requests.length, 1);
    assert.equal(requests[0].type, 'conversation');
    assert.equal(requests[0].input, 'Explain this word.');
    assert.deepEqual(requests[0].context, {
      targetLanguage: 'fr',
      skillArea: 'vocabulary',
    });
    assert.equal(view.status, 'unavailable');
  });

  it('does not crash when optional language and skill context are missing', async () => {
    let request: AIServiceRequest | undefined;
    const service: AIService = {
      serviceId: 'recording-service',
      serviceVersion: '1.0.0',
      async execute(value) {
        request = value;
        return needsModelResponse();
      },
      async dispose() {},
    };

    const view = await executeAITutorRequest(service, { prompt: 'Help me study.' });

    assert.equal(request?.context, undefined);
    assert.equal(view.status, 'needs-model');
  });


  it('includes learner memory only when consent is enabled and the snapshot is valid', async () => {
    const requests: AIServiceRequest[] = [];
    const service: AIService = {
      serviceId: 'recording-service',
      serviceVersion: '1.0.0',
      async execute(request) {
        requests.push(request);
        return unavailableResponse('runtime-not-implemented');
      },
      async dispose() {},
    };

    const view = await executeAITutorRequest(service, {
      prompt: 'Help me study.',
      learnerMemory: learnerMemoryRecord,
    });

    assert.deepEqual(requests[0].context?.learnerMemory, {
      targetLanguage: 'fr',
      nativeLanguage: 'vi',
      skillFocus: 'vocabulary',
      difficultyPreference: 'intermediate',
      recentPracticeSummary: 'Reviewed common travel words.',
      weakSkills: ['word recall'],
      preferredExerciseTypes: ['short-answer'],
    });
    assert.equal(view.status, 'unavailable');
    assert.equal('output' in view, false);
  });

  it('omits learner memory when consent is disabled or memory is malformed', async () => {
    const contexts: Array<AIServiceRequest['context']> = [];
    const service: AIService = {
      serviceId: 'recording-service',
      serviceVersion: '1.0.0',
      async execute(request) {
        contexts.push(request.context);
        return needsModelResponse();
      },
      async dispose() {},
    };

    await executeAITutorRequest(service, {
      prompt: 'Help me study.',
      learnerMemory: { ...learnerMemoryRecord, consent: false },
    });
    await executeAITutorRequest(service, {
      prompt: 'Help me study.',
      learnerMemory: {
        consent: true,
        snapshot: { targetLanguage: 42 } as never,
      },
    });

    assert.equal(contexts[0], undefined);
    assert.equal(contexts[1], undefined);
  });

  it('keeps the platform tutor view model free of exam and banned marketing claims', () => {
    const source = readFileSync(
      new URL('../../src/platform/ai/aiTutorViewModel.ts', import.meta.url),
      'utf8',
    );

    assert.doesNotMatch(source, /\bIELTS\b|official IELTS|guaranteed band/i);
    assert.doesNotMatch(source, /unlimited AI|ChatGPT-like|stronger than ELSA/i);
  });
});