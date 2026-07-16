import type { AICapabilityReport } from './aiCapabilityDetector.ts';
import {
  evaluateModelArtifactReadiness,
} from './modelArtifactManager.ts';
import type {
  ModelArtifact,
  ModelArtifactId,
  ModelArtifactVersion,
} from './modelArtifactManifest.ts';
import type {
  LocalModelTier,
  ModelReadinessState,
} from './aiReadiness.ts';
import {
  createLocalRuntimeError,
  type LocalRuntimeError,
  type LocalRuntimeUnavailableReason,
} from './localRuntimeErrors.ts';

export type LocalRuntimeStatus =
  | 'idle'
  | 'unavailable'
  | 'needs-model'
  | 'loading'
  | 'ready'
  | 'generating'
  | 'failed'
  | 'disposed';

export interface LocalRuntimeSession {
  sessionId: string;
  modelArtifactId: ModelArtifactId;
  modelArtifactVersion: ModelArtifactVersion;
  modelTier: LocalModelTier;
  runtimeId: string;
  runtimeVersion: string;
}

export type LocalRuntimeLoadState =
  | { status: 'idle' }
  | {
      status: 'unavailable';
      reason: LocalRuntimeUnavailableReason;
    }
  | {
      status: 'needs-model';
      reason: 'model-not-installed';
      modelArtifactId: ModelArtifactId;
      modelArtifactVersion: ModelArtifactVersion;
    }
  | {
      status: 'loading';
      modelArtifactId: ModelArtifactId;
      modelArtifactVersion: ModelArtifactVersion;
      modelTier: LocalModelTier;
      runtimeId: string;
      runtimeVersion: string;
    }
  | {
      status: 'ready';
      session: LocalRuntimeSession;
    }
  | {
      status: 'generating';
      session: LocalRuntimeSession;
      requestId: string;
    }
  | {
      status: 'failed';
      error: LocalRuntimeError;
    }
  | { status: 'disposed' };

export type LocalRuntimeReadyEvidence = Extract<ModelReadinessState, { status: 'ready' }>;

export type LocalRuntimeTransitionEvent =
  | {
      type: 'load-started';
      readiness: LocalRuntimeReadyEvidence;
      artifact: ModelArtifact;
    }
  | {
      type: 'load-succeeded';
      session: LocalRuntimeSession;
    }
  | {
      type: 'generation-started';
      requestId: string;
    }
  | { type: 'generation-finished' }
  | { type: 'fail'; error: LocalRuntimeError }
  | { type: 'dispose' };

function invalidTransition(
  current: LocalRuntimeStatus,
  event: LocalRuntimeTransitionEvent['type'],
): LocalRuntimeLoadState {
  return {
    status: 'failed',
    error: createLocalRuntimeError(
      'invalid-state-transition',
      `Cannot apply ${event} while runtime is ${current}.`,
    ),
  };
}

function sessionMatchesArtifact(
  session: LocalRuntimeSession,
  artifact: ModelArtifact,
): boolean {
  return (
    session.sessionId.trim().length > 0
    && session.modelArtifactId === artifact.id
    && session.modelArtifactVersion === artifact.version
    && session.modelTier === artifact.tier
    && session.runtimeId === artifact.runtime.runtimeId
    && session.runtimeVersion === artifact.runtime.runtimeVersion
  );
}

function sessionMatchesLoading(
  session: LocalRuntimeSession,
  loading: Extract<LocalRuntimeLoadState, { status: 'loading' }>,
): boolean {
  return (
    session.sessionId.trim().length > 0
    && session.modelArtifactId === loading.modelArtifactId
    && session.modelArtifactVersion === loading.modelArtifactVersion
    && session.modelTier === loading.modelTier
    && session.runtimeId === loading.runtimeId
    && session.runtimeVersion === loading.runtimeVersion
  );
}

export function resolveLocalRuntimeStartState(
  capabilityReport: AICapabilityReport,
  artifact?: ModelArtifact,
  session?: LocalRuntimeSession,
): LocalRuntimeLoadState {
  const readiness = evaluateModelArtifactReadiness(capabilityReport, artifact);

  if (readiness.status === 'not-installed') {
    if (!artifact) {
      return { status: 'unavailable', reason: 'model-not-approved' };
    }

    return {
      status: 'needs-model',
      reason: 'model-not-installed',
      modelArtifactId: artifact.id,
      modelArtifactVersion: artifact.version,
    };
  }

  if (readiness.status === 'unavailable') {
    return {
      status: 'unavailable',
      reason: readiness.reason,
    };
  }

  if (!artifact || !session) {
    return {
      status: 'unavailable',
      reason: 'runtime-not-implemented',
    };
  }

  if (!sessionMatchesArtifact(session, artifact)) {
    return {
      status: 'failed',
      error: createLocalRuntimeError('invalid-runtime-session'),
    };
  }

  return {
    status: 'ready',
    session,
  };
}

export function transitionLocalRuntimeState(
  current: LocalRuntimeLoadState,
  event: LocalRuntimeTransitionEvent,
): LocalRuntimeLoadState {
  if (event.type === 'dispose') {
    return { status: 'disposed' };
  }

  if (current.status === 'disposed') {
    return invalidTransition(current.status, event.type);
  }

  if (event.type === 'fail') {
    return { status: 'failed', error: event.error };
  }

  switch (event.type) {
    case 'load-started':
      if (
        !['idle', 'unavailable', 'needs-model', 'failed'].includes(current.status)
        || event.readiness.modelId !== String(event.artifact.id)
        || event.readiness.tier !== event.artifact.tier
      ) {
        return invalidTransition(current.status, event.type);
      }

      return {
        status: 'loading',
        modelArtifactId: event.artifact.id,
        modelArtifactVersion: event.artifact.version,
        modelTier: event.artifact.tier,
        runtimeId: event.artifact.runtime.runtimeId,
        runtimeVersion: event.artifact.runtime.runtimeVersion,
      };

    case 'load-succeeded':
      if (
        current.status !== 'loading'
        || !sessionMatchesLoading(event.session, current)
      ) {
        return current.status === 'loading'
          ? {
              status: 'failed',
              error: createLocalRuntimeError('invalid-runtime-session'),
            }
          : invalidTransition(current.status, event.type);
      }

      return { status: 'ready', session: event.session };

    case 'generation-started':
      if (current.status !== 'ready' || !event.requestId.trim()) {
        return invalidTransition(current.status, event.type);
      }

      return {
        status: 'generating',
        session: current.session,
        requestId: event.requestId,
      };

    case 'generation-finished':
      if (current.status !== 'generating') {
        return invalidTransition(current.status, event.type);
      }

      return { status: 'ready', session: current.session };

    default:
      return invalidTransition(current.status, 'generation-finished');
  }
}
