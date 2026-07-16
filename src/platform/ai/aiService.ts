import type { AICapabilityReport } from './aiCapabilityDetector.ts';
import {
  isAIServiceRequestType,
  validateAIServiceRequest,
} from './aiServiceGuards.ts';
import {
  type AIService,
  type AIServiceProvenance,
  type AIServiceRequest,
  type AIServiceRequestType,
  type AIServiceResponse,
  type AIServiceResponseRequestType,
  type AIServiceUnavailableReason,
} from './aiServiceTypes.ts';
import {
  createUnavailableLocalRuntimeAdapter,
  type LocalAIRuntimeAdapter,
  type LocalRuntimeResponse,
} from './localRuntimeAdapter.ts';
import type { LocalRuntimeLoadState } from './localRuntimeState.ts';
import type { ModelArtifact } from './modelArtifactManifest.ts';

const SERVICE_ID = 'platform-ai-service';
const SERVICE_VERSION = '1.0.0';

export interface PlatformAIServiceDependencies {
  capabilityReport: AICapabilityReport;
  artifact?: ModelArtifact;
  runtimeAdapter?: LocalAIRuntimeAdapter;
}

function baseProvenance(): AIServiceProvenance {
  return {
    serviceId: SERVICE_ID,
    serviceVersion: SERVICE_VERSION,
  };
}

function unavailableResponse(
  requestType: AIServiceRequestType,
  reason: AIServiceUnavailableReason,
): AIServiceResponse {
  const common = {
    requestType,
    evidence: [],
    limitations: { codes: [reason] },
    provenance: baseProvenance(),
    safety: {
      status: 'not-evaluated' as const,
      reasons: [reason],
    },
    isAiGenerated: false as const,
  };

  if (reason === 'model-not-installed') {
    return {
      ...common,
      status: 'needs-model',
      unavailableReason: 'model-not-installed',
    };
  }

  return {
    ...common,
    status: 'unavailable',
    unavailableReason: reason,
  };
}

function requestTypeForFailure(value: unknown): AIServiceResponseRequestType {
  return isAIServiceRequestType(value) ? value : 'unknown';
}

function failedResponse(
  requestType: AIServiceResponseRequestType,
  reason: AIServiceUnavailableReason,
  message: string,
): AIServiceResponse {
  return {
    status: 'failed',
    requestType,
    error: { reason, message },
    evidence: [],
    limitations: { codes: [reason] },
    provenance: baseProvenance(),
    safety: {
      status: 'not-evaluated',
      reasons: [reason],
    },
    isAiGenerated: false,
  };
}

function responseForRuntimeState(
  requestType: AIServiceRequestType,
  state: LocalRuntimeLoadState,
): AIServiceResponse | undefined {
  switch (state.status) {
    case 'ready':
      return undefined;

    case 'needs-model':
      return unavailableResponse(requestType, 'model-not-installed');

    case 'unavailable':
      return unavailableResponse(requestType, state.reason);

    case 'failed':
      return failedResponse(
        requestType,
        state.error.reason,
        state.error.message,
      );

    case 'disposed':
      return failedResponse(
        requestType,
        'service-disposed',
        'The platform AI service runtime has been disposed.',
      );

    case 'idle':
    case 'loading':
    case 'generating':
      return unavailableResponse(requestType, 'runtime-not-ready');
  }
}

function nonEmpty(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function mapRuntimeResponse(
  requestType: AIServiceRequestType,
  response: LocalRuntimeResponse,
): AIServiceResponse {
  if (response.status === 'unavailable') {
    return unavailableResponse(requestType, response.error.reason);
  }

  if (response.status === 'failed') {
    return failedResponse(
      requestType,
      response.error.reason,
      response.error.message,
    );
  }

  const provenance = response.provenance;
  if (
    response.isAiGenerated !== true
    || !nonEmpty(response.output)
    || !nonEmpty(provenance.modelArtifactId)
    || !nonEmpty(provenance.modelArtifactVersion)
    || !nonEmpty(provenance.runtimeId)
    || !nonEmpty(provenance.runtimeVersion)
  ) {
    return failedResponse(
      requestType,
      'runtime-response-invalid',
      'The local runtime response did not include valid generation provenance.',
    );
  }

  return {
    status: 'success',
    requestType,
    output: { text: response.output },
    evidence: [],
    limitations: { codes: response.limitations },
    provenance: {
      ...baseProvenance(),
      modelArtifactId: provenance.modelArtifactId,
      modelArtifactVersion: provenance.modelArtifactVersion,
      runtimeId: provenance.runtimeId,
      runtimeVersion: provenance.runtimeVersion,
    },
    safety: {
      status: 'not-evaluated',
      reasons: ['safety-evaluation-not-implemented'],
    },
    isAiGenerated: true,
  };
}

export function createPlatformAIService(
  dependencies: PlatformAIServiceDependencies,
): AIService {
  const runtimeAdapter = dependencies.runtimeAdapter
    ?? createUnavailableLocalRuntimeAdapter();
  let disposed = false;

  return {
    serviceId: SERVICE_ID,
    serviceVersion: SERVICE_VERSION,

    async execute(request: AIServiceRequest): Promise<AIServiceResponse> {
      const validation = validateAIServiceRequest(request);
      if (!validation.valid) {
        return failedResponse(
          requestTypeForFailure(request.type),
          'invalid-request',
          `Invalid AI service request: ${validation.errors.join(', ')}.`,
        );
      }

      if (disposed) {
        return failedResponse(
          request.type,
          'service-disposed',
          'The platform AI service has been disposed.',
        );
      }

      let runtimeState = runtimeAdapter.getState();
      if (runtimeState.status === 'idle') {
        runtimeState = await runtimeAdapter.start({
          capabilityReport: dependencies.capabilityReport,
          artifact: dependencies.artifact,
        });
      }

      const blocked = responseForRuntimeState(request.type, runtimeState);
      if (blocked) return blocked;

      const runtimeResponse = await runtimeAdapter.generate({
        requestId: request.requestId,
        type: request.type,
        input: request.input ?? '',
        options: request.options,
      });

      return mapRuntimeResponse(request.type, runtimeResponse);
    },

    async dispose(): Promise<void> {
      if (disposed) return;
      disposed = true;
      await runtimeAdapter.dispose();
    },
  };
}

export function createUnavailableAIService(
  dependencies: Omit<PlatformAIServiceDependencies, 'runtimeAdapter'>,
): AIService {
  return createPlatformAIService(dependencies);
}
