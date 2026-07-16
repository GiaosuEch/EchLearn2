import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import {
  createIdlePracticeGeneratorViewModel,
  createSubmittingPracticeGeneratorViewModel,
  executePracticeGeneratorRequest,
  mapPracticeGeneratorResponse,
} from '../../src/platform/ai/practiceGeneratorViewModel.ts';
import type {
  AIService,
  AIServiceRequest,
  AIServiceResponse,
} from '../../src/platform/ai/aiServiceTypes.ts';

const baseResponse = {
  requestType: 'generate-practice' as const,
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
      message: 'Choose a valid language and skill area.',
    },
    isAiGenerated: false,
  };
}

function successResponse(): AIServiceResponse {
  return {
    ...baseResponse,
    status: 'success',
    output: { text: 'Verified generated practice instructions.' },
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

describe('Practice Generator view model', () => {
  it('represents idle and submitting without generated output', () => {
    const idle = createIdlePracticeGeneratorViewModel();
    const submitting = createSubmittingPracticeGeneratorViewModel();

    assert.equal(idle.status, 'idle');
    assert.equal(submitting.status, 'submitting');
    assert.equal(idle.isAiGenerated, false);
    assert.equal(submitting.isAiGenerated, false);
    assert.equal('output' in idle, false);
    assert.equal('output' in submitting, false);
  });

  it('maps a non-implemented runtime to honest unavailable state', () => {
    const view = mapPracticeGeneratorResponse(unavailableResponse());

    assert.equal(view.status, 'unavailable');
    assert.equal(view.heading, 'Practice generation is not ready yet.');
    assert.match(view.description, /existing lessons and practice activities/i);
    assert.equal(view.isAiGenerated, false);
    assert.equal('output' in view, false);
  });

  it('maps a missing model to needs-model without output', () => {
    const view = mapPracticeGeneratorResponse(needsModelResponse());

    assert.equal(view.status, 'needs-model');
    assert.equal(view.heading, 'No approved local model is installed.');
    assert.match(view.description, /existing lessons and practice activities/i);
    assert.equal(view.isAiGenerated, false);
    assert.equal('output' in view, false);
  });

  it('maps an invalid request to a clear failed state', () => {
    const view = mapPracticeGeneratorResponse(failedResponse());

    assert.equal(view.status, 'failed');
    assert.match(view.description, /valid language and skill area/i);
    assert.equal(view.isAiGenerated, false);
    assert.equal('output' in view, false);
  });

  it('exposes output only for a validated AI-generated success', () => {
    const view = mapPracticeGeneratorResponse(successResponse());

    assert.equal(view.status, 'success');
    assert.equal(view.output, 'Verified generated practice instructions.');
    assert.equal(view.isAiGenerated, true);
  });

  it('rejects malformed success instead of exposing output', () => {
    const malformed = {
      ...successResponse(),
      output: { text: '   ' },
      isAiGenerated: false,
    };

    const view = mapPracticeGeneratorResponse(malformed);

    assert.equal(view.status, 'failed');
    assert.equal(view.isAiGenerated, false);
    assert.equal('output' in view, false);
  });

  it('calls AIService with generate-practice and complete optional context', async () => {
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

    const view = await executePracticeGeneratorRequest(service, {
      language: 'fr',
      skillArea: 'grammar',
      difficulty: 'intermediate',
      topic: 'Travel planning',
      exerciseType: 'short-answer',
    });

    assert.equal(requests.length, 1);
    assert.equal(requests[0].type, 'generate-practice');
    assert.deepEqual(requests[0].context, {
      targetLanguage: 'fr',
      skillArea: 'grammar',
      difficulty: 'intermediate',
      topic: 'Travel planning',
      exerciseType: 'short-answer',
    });
    assert.equal(view.status, 'unavailable');
  });

  it('does not crash when all optional context is missing', async () => {
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

    const view = await executePracticeGeneratorRequest(service, {});

    assert.equal(request?.context, undefined);
    assert.equal(view.status, 'needs-model');
  });

  it('keeps platform practice generation free of exam and banned claims', () => {
    const source = readFileSync(
      new URL('../../src/platform/ai/practiceGeneratorViewModel.ts', import.meta.url),
      'utf8',
    );

    assert.doesNotMatch(source, /\bIELTS\b|official IELTS|guaranteed band/i);
    assert.doesNotMatch(source, /unlimited AI|ChatGPT-like|stronger than ELSA/i);
    assert.doesNotMatch(source, /Math\.random|setTimeout|fake typing|fake streaming|canned/i);
  });
});
