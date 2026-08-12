/**
 * Capability State Machine
 *
 * Tracks the readiness of platform capabilities with explicit states.
 * Rule: if a capability is unavailable, return an explicit state — never simulate success.
 */

export type CapabilityStatus =
  | 'checking'
  | 'ready'
  | 'degraded'
  | 'unavailable'
  | 'requires-consent'
  | 'requires-download'
  | 'error';

export interface CapabilityState {
  status: CapabilityStatus;
  reason?: string;
  checkedAt: number;
  meta?: Record<string, unknown>;
}

export type CapabilityName =
  | 'supabase-auth'
  | 'supabase-db'
  | 'local-ai'
  | 'speech-synthesis'
  | 'speech-recognition'
  | 'audio-playback'
  | 'offline-storage'
  | 'notifications';

type CapabilityListener = (name: CapabilityName, state: CapabilityState) => void;

const capabilities = new Map<CapabilityName, CapabilityState>();
const listeners = new Set<CapabilityListener>();

function makeState(
  status: CapabilityStatus,
  reason?: string,
  meta?: Record<string, unknown>,
): CapabilityState {
  return { status, reason, checkedAt: Date.now(), meta };
}

function notify(name: CapabilityName, state: CapabilityState) {
  for (const listener of listeners) {
    try {
      listener(name, state);
    } catch {
      // listener errors must not break the state machine
    }
  }
}

export const capabilityState = {
  get(name: CapabilityName): CapabilityState {
    return capabilities.get(name) ?? makeState('checking');
  },

  isReady(name: CapabilityName): boolean {
    const s = capabilities.get(name);
    return s?.status === 'ready';
  },

  isUsable(name: CapabilityName): boolean {
    const s = capabilities.get(name);
    return s?.status === 'ready' || s?.status === 'degraded';
  },

  set(name: CapabilityName, status: CapabilityStatus, reason?: string, meta?: Record<string, unknown>) {
    const state = makeState(status, reason, meta);
    capabilities.set(name, state);
    notify(name, state);
  },

  markReady(name: CapabilityName, meta?: Record<string, unknown>) {
    this.set(name, 'ready', undefined, meta);
  },

  markUnavailable(name: CapabilityName, reason: string) {
    this.set(name, 'unavailable', reason);
  },

  markDegraded(name: CapabilityName, reason: string) {
    this.set(name, 'degraded', reason);
  },

  markError(name: CapabilityName, reason: string) {
    this.set(name, 'error', reason);
  },

  subscribe(listener: CapabilityListener): () => void {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },

  getAll(): ReadonlyMap<CapabilityName, CapabilityState> {
    return capabilities;
  },

  getSummary(): Record<CapabilityName, CapabilityStatus> {
    const result = {} as Record<CapabilityName, CapabilityStatus>;
    for (const [name, state] of capabilities) {
      result[name] = state.status;
    }
    return result;
  },
};
