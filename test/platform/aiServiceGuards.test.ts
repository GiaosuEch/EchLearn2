import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  AI_SERVICE_REQUEST_TYPES,
  type AIServiceRequest,
} from '../../src/platform/ai/aiServiceTypes.ts';
import {
  validateAIServiceRequest,
  validateAIServiceResponse,
} from '../../src/platform/ai/aiServiceGuards.ts';

function validRequest(type: AIServiceRequest['type'] = 'explain'): AIServiceRequest {
  return {
    requestId: 'request-test',
    type,
    input: 'Explain this language pattern.',
    context: {
      targetLanguage: 'en',
      skillArea: 'grammar',
    },
  };
}

describe('AI service request guards', () => {
  it('exposes only generic platform request types', () => {
    assert.deepEqual(AI_SERVICE_REQUEST_TYPES, [
      'conversation',
      'explain',
      'feedback',
      'generate-practice',
      'summarize',
      'classify',
      'assess',
      'plan-study',
      'recommend-next-practice',
    ]);
  });

  it('rejects an unknown request type', () => {
    const request = {
      ...validRequest(),
      type: 'unknown-request',
    };

    const result = validateAIServiceRequest(request);

    assert.equal(result.valid, false);
    if (!result.valid) assert.ok(result.errors.includes('invalid-request-type'));
  });

  it('requires non-empty input for input-driven requests', () => {
    const request = {
      ...validRequest('feedback'),
      input: '   ',
    };

    const result = validateAIServiceRequest(request);

    assert.equal(result.valid, false);
    if (!result.valid) assert.ok(result.errors.includes('input-required'));
  });

  it('allows planning requests to rely on valid learning context', () => {
    const request = {
      requestId: 'plan-request',
      type: 'plan-study',
      context: {
        targetLanguage: 'vi',
        skillArea: 'conversation',
      },
    };

    assert.deepEqual(validateAIServiceRequest(request), {
      valid: true,
      value: request,
    });
  });

  it('rejects invalid language or skill context when present', () => {
    const request = {
      ...validRequest(),
      context: {
        sourceLanguage: '../secret',
        targetLanguage: '',
        skillArea: 'writing score',
      },
    };

    const result = validateAIServiceRequest(request);

    assert.equal(result.valid, false);
    if (!result.valid) {
      assert.ok(result.errors.includes('language-context-invalid'));
      assert.ok(result.errors.includes('skill-context-invalid'));
    }
  });

  it('accepts bounded generic practice-generation context', () => {
    const request = {
      requestId: 'practice-request',
      type: 'generate-practice',
      context: {
        targetLanguage: 'fr',
        skillArea: 'grammar',
        difficulty: 'intermediate',
        topic: 'Travel planning',
        exerciseType: 'short-answer',
      },
    };

    assert.deepEqual(validateAIServiceRequest(request), {
      valid: true,
      value: request,
    });
  });

  it('rejects malformed or oversized practice-generation context', () => {
    const request = {
      requestId: 'practice-request',
      type: 'generate-practice',
      context: {
        targetLanguage: 'fr',
        skillArea: 'grammar',
        difficulty: 'intermediate level!',
        topic: 'x'.repeat(121),
        exerciseType: '../unsafe',
      },
    };

    const result = validateAIServiceRequest(request);

    assert.equal(result.valid, false);
    if (!result.valid) assert.ok(result.errors.includes('context-invalid'));
  });
});

describe('AI service response guards', () => {
  it('rejects output on an unavailable response', () => {
    const response = {
      status: 'unavailable',
      requestType: 'explain',
      output: { text: 'Fabricated answer' },
      evidence: [],
      limitations: { codes: ['runtime-not-implemented'] },
      provenance: {
        serviceId: 'platform-ai-service',
        serviceVersion: '1.0.0',
      },
      safety: {
        status: 'not-evaluated',
        reasons: ['runtime-unavailable'],
      },
      unavailableReason: 'runtime-not-implemented',
      isAiGenerated: false,
    };

    const result = validateAIServiceResponse(response);

    assert.equal(result.valid, false);
    if (!result.valid) assert.ok(result.errors.includes('output-not-allowed'));
  });

  it('rejects an AI-generated claim without complete runtime and model provenance', () => {
    const response = {
      status: 'success',
      requestType: 'explain',
      output: { text: 'Generated output' },
      evidence: [],
      limitations: { codes: [] },
      provenance: {
        serviceId: 'platform-ai-service',
        serviceVersion: '1.0.0',
      },
      safety: {
        status: 'not-evaluated',
        reasons: [],
      },
      isAiGenerated: true,
    };

    const result = validateAIServiceResponse(response);

    assert.equal(result.valid, false);
    if (!result.valid) assert.ok(result.errors.includes('ai-provenance-required'));
  });

  it('accepts an unavailable response with no output and an honest generation flag', () => {
    const response = {
      status: 'unavailable',
      requestType: 'explain',
      evidence: [],
      limitations: { codes: ['runtime-not-implemented'] },
      provenance: {
        serviceId: 'platform-ai-service',
        serviceVersion: '1.0.0',
      },
      safety: {
        status: 'not-evaluated',
        reasons: ['runtime-unavailable'],
      },
      unavailableReason: 'runtime-not-implemented',
      isAiGenerated: false,
    };

    assert.deepEqual(validateAIServiceResponse(response), {
      valid: true,
      value: response,
    });
  });
});
