import type { AIUnavailableReason } from './aiCapabilityDetector.ts';

export type LocalRuntimeUnavailableReason =
  | AIUnavailableReason
  | 'runtime-not-implemented'
  | 'runtime-not-ready'
  | 'runtime-disposed'
  | 'invalid-runtime-session'
  | 'invalid-state-transition'
  | 'generation-failed';

export interface LocalRuntimeError {
  reason: LocalRuntimeUnavailableReason;
  message: string;
  recoverable: boolean;
}

const defaultMessages: Record<LocalRuntimeUnavailableReason, string> = {
  'browser-unsupported': 'This browser cannot provide the required local runtime capabilities.',
  'webgpu-unavailable': 'WebGPU is unavailable for this local runtime.',
  'wasm-unavailable': 'WASM is unavailable for this local runtime fallback.',
  'insufficient-capability': 'This device does not meet the model runtime requirements.',
  'capability-unknown': 'The device capability report is incomplete.',
  'storage-unavailable': 'Local model storage is unavailable.',
  'model-not-installed': 'The approved model artifact is not installed.',
  'model-not-approved': 'No approved model artifact is available.',
  'model-corrupted': 'The installed model artifact failed integrity verification.',
  'model-update-required': 'The installed model artifact requires an approved update.',
  'runtime-not-installed': 'The local runtime implementation is not installed.',
  'runtime-not-implemented': 'A real local runtime implementation is not available yet.',
  'runtime-not-ready': 'The local runtime is not ready to generate output.',
  'runtime-disposed': 'The local runtime session has been disposed.',
  'invalid-runtime-session': 'The runtime session does not match the approved artifact.',
  'invalid-state-transition': 'The local runtime state transition is not allowed.',
  'generation-failed': 'The local runtime failed to generate output.',
};

const recoverableReasons = new Set<LocalRuntimeUnavailableReason>([
  'browser-unsupported',
  'webgpu-unavailable',
  'wasm-unavailable',
  'insufficient-capability',
  'capability-unknown',
  'storage-unavailable',
  'model-not-installed',
  'model-not-approved',
  'model-corrupted',
  'model-update-required',
  'runtime-not-installed',
  'runtime-not-implemented',
  'runtime-not-ready',
  'invalid-runtime-session',
  'generation-failed',
]);

export function createLocalRuntimeError(
  reason: LocalRuntimeUnavailableReason,
  message = defaultMessages[reason],
): LocalRuntimeError {
  return {
    reason,
    message,
    recoverable: recoverableReasons.has(reason),
  };
}
