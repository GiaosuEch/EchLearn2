import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import {
  createIdleSpeakingCoachViewModel,
  createSubmittingSpeakingCoachViewModel,
  executeSpeakingCoachRequest,
  mapSpeakingCoachResponse,
} from '../../src/platform/ai/speakingCoachViewModel.ts';
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
    skillFocus: 'speaking',
    difficultyPreference: 'intermediate',
    recentPracticeSummary: 'Practised a short conversation transcript.',
    weakSkills: ['word choice'],
    preferredExerciseTypes: ['guided-conversation'],
    updatedAt: '2026-07-17T00:00:00.000Z',
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
      message: 'Enter valid speaking context.',
    },
    isAiGenerated: false,
  };
}

function successResponse(): AIServiceResponse {
  return {
    ...baseResponse,
    status: 'success',
    output: { text: 'Verified generated speaking feedback.' },
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

describe('Speaking Coach view model', () => {
  it('represents idle and submitting without generated feedback', () => {
    const idle = createIdleSpeakingCoachViewModel();
    const submitting = createSubmittingSpeakingCoachViewModel();

    assert.equal(idle.status, 'idle');
    assert.equal(submitting.status, 'submitting');
    assert.equal(idle.isAiGenerated, false);
    assert.equal(submitting.isAiGenerated, false);
    assert.equal('feedback' in idle, false);
    assert.equal('feedback' in submitting, false);
  });

  it('maps a non-implemented runtime to unavailable without feedback', () => {
    const view = mapSpeakingCoachResponse(unavailableResponse());

    assert.equal(view.status, 'unavailable');
    assert.equal(view.isAiGenerated, false);
    assert.equal('feedback' in view, false);
  });

  it('maps a missing model to needs-model without feedback', () => {
    const view = mapSpeakingCoachResponse(needsModelResponse());

    assert.equal(view.status, 'needs-model');
    assert.equal(view.isAiGenerated, false);
    assert.equal('feedback' in view, false);
  });

  it('maps failed responses without generated feedback', () => {
    const view = mapSpeakingCoachResponse(failedResponse());

    assert.equal(view.status, 'failed');
    assert.match(view.description, /valid speaking context/i);
    assert.equal(view.isAiGenerated, false);
    assert.equal('feedback' in view, false);
  });

  it('exposes feedback only for a validated AI-generated success', () => {
    const view = mapSpeakingCoachResponse(successResponse());

    assert.equal(view.status, 'success');
    assert.equal(view.feedback, 'Verified generated speaking feedback.');
    assert.equal(view.isAiGenerated, true);
  });

  it('rejects malformed, mismatched, or non-generated success responses', () => {
    const responses = [
      { ...successResponse(), output: { text: '   ' } },
      { ...successResponse(), requestType: 'conversation' },
      { ...successResponse(), isAiGenerated: false },
      {
        ...successResponse(),
        provenance: {
          serviceId: 'platform-ai-service',
          serviceVersion: '1.0.0',
        },
      },
    ];

    for (const response of responses) {
      const view = mapSpeakingCoachResponse(response);
      assert.equal(view.status, 'failed');
      assert.equal(view.isAiGenerated, false);
      assert.equal('feedback' in view, false);
    }
  });

  it('calls generic AIService.execute with a feedback request and speaking context', async () => {
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

    const view = await executeSpeakingCoachRequest(service, {
      transcript: '  I described my daily routine.  ',
      targetLanguage: 'fr',
      nativeLanguage: 'vi',
      speakingGoal: 'conversation-practice',
      difficulty: 'intermediate',
      topic: 'Daily routines',
      requestId: 'speaking-request-1',
    });

    assert.equal(requests.length, 1);
    assert.deepEqual(requests[0], {
      requestId: 'speaking-request-1',
      type: 'feedback',
      input: 'I described my daily routine.',
      context: {
        sourceLanguage: 'vi',
        targetLanguage: 'fr',
        skillArea: 'speaking',
        difficulty: 'intermediate',
        topic: 'Daily routines',
        exerciseType: 'conversation-practice',
      },
    });
    assert.equal(view.status, 'unavailable');
  });

  it('uses the speaking goal as safe request input when no transcript is provided', async () => {
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

    const view = await executeSpeakingCoachRequest(service, {
      speakingGoal: 'Build confidence in everyday conversation',
      transcript: '   ',
    });

    assert.equal(requests[0].input, 'Build confidence in everyday conversation');
    assert.equal(view.status, 'needs-model');
    assert.equal('feedback' in view, false);
  });

  it('returns failed without calling the service when both transcript and goal are empty', async () => {
    let calls = 0;
    const service: AIService = {
      serviceId: 'recording-service',
      serviceVersion: '1.0.0',
      async execute() {
        calls += 1;
        return unavailableResponse();
      },
      async dispose() {},
    };

    const view = await executeSpeakingCoachRequest(service, {
      speakingGoal: '   ',
      transcript: '   ',
    });

    assert.equal(calls, 0);
    assert.equal(view.status, 'failed');
    assert.equal(view.isAiGenerated, false);
    assert.equal('feedback' in view, false);
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

    await executeSpeakingCoachRequest(service, {
      speakingGoal: 'conversation-practice',
      transcript: 'Review this transcript.',
      learnerMemory: learnerMemoryRecord,
    });

    assert.deepEqual(requests[0].context?.learnerMemory, {
      targetLanguage: 'fr',
      nativeLanguage: 'vi',
      skillFocus: 'speaking',
      difficultyPreference: 'intermediate',
      recentPracticeSummary: 'Practised a short conversation transcript.',
      weakSkills: ['word choice'],
      preferredExerciseTypes: ['guided-conversation'],
    });
  });

  it('omits learner memory for disabled, deleted, empty, or malformed records', async () => {
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

    const records: LearnerMemoryRecord[] = [
      { ...learnerMemoryRecord, consent: false },
      { consent: false, snapshot: null },
      {
        consent: true,
        snapshot: {
          weakSkills: [],
          preferredExerciseTypes: [],
          updatedAt: '2026-07-17T00:00:00.000Z',
          source: 'learner-memory-shell',
        },
      },
      { consent: true, snapshot: { targetLanguage: 42 } as never },
    ];

    for (const learnerMemory of records) {
      await executeSpeakingCoachRequest(service, {
        speakingGoal: 'conversation-practice',
        transcript: 'Review this transcript.',
        learnerMemory,
      });
    }

    assert.equal(requests.length, records.length);
    for (const request of requests) {
      assert.equal(request.context?.learnerMemory, undefined);
      assert.equal(request.context?.skillArea, 'speaking');
    }
  });

  it('contains no simulated output, scoring, speech runtime, or exam-specific core terms', () => {
    const source = readFileSync(
      new URL('../../src/platform/ai/speakingCoachViewModel.ts', import.meta.url),
      'utf8',
    );

    assert.doesNotMatch(source, /Math\.random|Date\.now|setTimeout|fake typing|fake streaming|canned|sample feedback/i);
    assert.doesNotMatch(source, /WebLLM|Transformers|Ollama|speech recognition|mediaRecorder|getUserMedia|api[-_ ]?key|model URL|cloud sync|fetch\s*\(/i);
    assert.doesNotMatch(source, /\bIELTS\b|\bTOEIC\b|\bTOEFL\b|\bCEFR\b|band score|Speaking Part [123]|pronunciation score|fluency score/i);
  });
});
