import { detectAICapabilities } from '../platform/ai/aiCapabilityDetector.ts';
import { createUnavailableAIService } from '../platform/ai/aiService.ts';
import type {
  AIService,
  AIServiceResponse,
} from '../platform/ai/aiServiceTypes.ts';

export interface LegacyAITutor {
  getResponse(message: string): Promise<AIServiceResponse>;
}

export function createLegacyAITutor(aiService: AIService): LegacyAITutor {
  return {
    getResponse(message: string): Promise<AIServiceResponse> {
      return aiService.execute({
        requestId: 'legacy-tutor-' + Date.now(),
        type: 'conversation',
        input: message,
      });
    },
  };
}

const unavailableTutor = createLegacyAITutor(createUnavailableAIService({
  capabilityReport: detectAICapabilities(),
}));

/**
 * Backward-compatible legacy entry point. It now returns the generic AIService
 * outcome so unavailable states cannot be confused with generated tutor text.
 */
export function getAITutorResponse(message: string): Promise<AIServiceResponse> {
  return unavailableTutor.getResponse(message);
}
