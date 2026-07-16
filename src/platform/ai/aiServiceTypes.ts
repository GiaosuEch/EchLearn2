import type {
  LocalRuntimeGenerationOptions,
} from './localRuntimeAdapter.ts';
import type {
  LocalRuntimeUnavailableReason,
} from './localRuntimeErrors.ts';

export const AI_SERVICE_REQUEST_TYPES = [
  'conversation',
  'explain',
  'feedback',
  'generate-practice',
  'summarize',
  'classify',
  'assess',
  'plan-study',
  'recommend-next-practice',
] as const;

export type AIServiceRequestType = typeof AI_SERVICE_REQUEST_TYPES[number];
export type AIServiceResponseRequestType = AIServiceRequestType | 'unknown';

export type AIServiceStatus =
  | 'success'
  | 'unavailable'
  | 'needs-model'
  | 'failed';

export type AIServiceUnavailableReason =
  | LocalRuntimeUnavailableReason
  | 'invalid-request'
  | 'runtime-response-invalid'
  | 'service-disposed';

export interface AIServiceContext {
  sourceLanguage?: string;
  targetLanguage?: string;
  skillArea?: string;
  learnerLevel?: string;
}

export interface AIServiceRequest {
  requestId: string;
  type: AIServiceRequestType;
  input?: string;
  context?: AIServiceContext;
  options?: LocalRuntimeGenerationOptions;
}

export interface AIServiceOutput {
  text: string;
  structured?: unknown;
}

export interface AIServiceEvidence {
  kind: 'runtime' | 'model' | 'rule' | 'learner-context';
  source: string;
  detail?: string;
}

export interface AIServiceLimitations {
  codes: readonly string[];
}

export interface AIServiceSafety {
  status: 'not-evaluated' | 'passed' | 'blocked';
  reasons: readonly string[];
}

export interface AIServiceProvenance {
  serviceId: string;
  serviceVersion: string;
  modelArtifactId?: string;
  modelArtifactVersion?: string;
  runtimeId?: string;
  runtimeVersion?: string;
}

export interface AIServiceError {
  reason: AIServiceUnavailableReason;
  message: string;
}

interface AIServiceResponseBase {
  status: AIServiceStatus;
  requestType: AIServiceResponseRequestType;
  evidence: readonly AIServiceEvidence[];
  limitations: AIServiceLimitations;
  provenance: AIServiceProvenance;
  safety: AIServiceSafety;
  isAiGenerated: boolean;
}

export type AIServiceResponse =
  | AIServiceResponseBase & {
      status: 'success';
      output: AIServiceOutput;
      provenance: AIServiceProvenance & Required<Pick<
        AIServiceProvenance,
        | 'modelArtifactId'
        | 'modelArtifactVersion'
        | 'runtimeId'
        | 'runtimeVersion'
      >>;
      isAiGenerated: true;
    }
  | AIServiceResponseBase & {
      status: 'unavailable';
      unavailableReason: AIServiceUnavailableReason;
      isAiGenerated: false;
    }
  | AIServiceResponseBase & {
      status: 'needs-model';
      unavailableReason: 'model-not-installed';
      isAiGenerated: false;
    }
  | AIServiceResponseBase & {
      status: 'failed';
      error: AIServiceError;
      isAiGenerated: false;
    };

export interface AIService {
  readonly serviceId: string;
  readonly serviceVersion: string;
  execute(request: AIServiceRequest): Promise<AIServiceResponse>;
  dispose(): Promise<void>;
}
