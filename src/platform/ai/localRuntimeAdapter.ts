import type { AICapabilityReport } from './aiCapabilityDetector.ts';
import type { ModelArtifact } from './modelArtifactManifest.ts';
import {
  createLocalRuntimeError,
  type LocalRuntimeError,
  type LocalRuntimeUnavailableReason,
} from './localRuntimeErrors.ts';
import {
  resolveLocalRuntimeStartState,
  type LocalRuntimeLoadState,
} from './localRuntimeState.ts';

export const LOCAL_RUNTIME_REQUEST_TYPES = [
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

export type LocalRuntimeRequestType = typeof LOCAL_RUNTIME_REQUEST_TYPES[number];

export interface LocalRuntimeGenerationOptions {
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: readonly string[];
}

export interface LocalRuntimeRequest {
  requestId: string;
  type: LocalRuntimeRequestType;
  input: string;
  context?: readonly {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  options?: LocalRuntimeGenerationOptions;
}

export interface LocalRuntimeProvenance {
  adapterId: string;
  adapterVersion: string;
  modelArtifactId?: string;
  modelArtifactVersion?: string;
  runtimeId?: string;
  runtimeVersion?: string;
}

export type LocalRuntimeResponse =
  | {
      status: 'success';
      output: string;
      provenance: LocalRuntimeProvenance;
      limitations: readonly string[];
      isAiGenerated: true;
    }
  | {
      status: 'unavailable';
      error: LocalRuntimeError;
      provenance: LocalRuntimeProvenance;
      limitations: readonly LocalRuntimeUnavailableReason[];
      isAiGenerated: false;
    }
  | {
      status: 'failed';
      error: LocalRuntimeError;
      provenance: LocalRuntimeProvenance;
      limitations: readonly LocalRuntimeUnavailableReason[];
      isAiGenerated: false;
    };

export interface LocalRuntimeStartContext {
  capabilityReport: AICapabilityReport;
  artifact?: ModelArtifact;
}

export interface LocalAIRuntimeAdapter {
  readonly adapterId: string;
  readonly adapterVersion: string;
  getState(): LocalRuntimeLoadState;
  start(context: LocalRuntimeStartContext): Promise<LocalRuntimeLoadState>;
  generate(request: LocalRuntimeRequest): Promise<LocalRuntimeResponse>;
  dispose(): Promise<LocalRuntimeLoadState>;
}

function provenanceForArtifact(artifact: ModelArtifact | undefined): LocalRuntimeProvenance {
  return {
    adapterId: 'unavailable-local-runtime',
    adapterVersion: '0.0.0',
    modelArtifactId: artifact ? String(artifact.id) : undefined,
    modelArtifactVersion: artifact ? String(artifact.version) : undefined,
  };
}

function reasonForState(state: LocalRuntimeLoadState): LocalRuntimeUnavailableReason {
  switch (state.status) {
    case 'unavailable':
      return state.reason;
    case 'needs-model':
      return state.reason;
    case 'failed':
      return state.error.reason;
    case 'disposed':
      return 'runtime-disposed';
    default:
      return 'runtime-not-implemented';
  }
}

function unavailableResponse(
  state: LocalRuntimeLoadState,
  artifact: ModelArtifact | undefined,
): LocalRuntimeResponse {
  const reason = reasonForState(state);

  return {
    status: 'unavailable',
    error: createLocalRuntimeError(reason),
    provenance: provenanceForArtifact(artifact),
    limitations: [reason],
    isAiGenerated: false,
  };
}

export function createUnavailableLocalRuntimeAdapter(): LocalAIRuntimeAdapter {
  let state: LocalRuntimeLoadState = { status: 'idle' };
  let activeArtifact: ModelArtifact | undefined;

  return {
    adapterId: 'unavailable-local-runtime',
    adapterVersion: '0.0.0',

    getState(): LocalRuntimeLoadState {
      return state;
    },

    start(context: LocalRuntimeStartContext): Promise<LocalRuntimeLoadState> {
      if (state.status === 'disposed') {
        return Promise.resolve(state);
      }

      activeArtifact = context.artifact;
      state = resolveLocalRuntimeStartState(context.capabilityReport, activeArtifact);
      return Promise.resolve(state);
    },

    generate(request: LocalRuntimeRequest): Promise<LocalRuntimeResponse> {
      void request;
      return Promise.resolve(unavailableResponse(state, activeArtifact));
    },

    dispose(): Promise<LocalRuntimeLoadState> {
      state = { status: 'disposed' };
      return Promise.resolve(state);
    },
  };
}
