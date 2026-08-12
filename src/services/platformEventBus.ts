/**
 * Platform Event Bus
 *
 * Type-safe event system with built-in PII scrubbing.
 * Rule: Platform Events omit learner content, raw audio, prompts, tokens,
 * secrets, and cross-user identifiers.
 */

export type PlatformEventType =
  | 'auth:sign-in'
  | 'auth:sign-up'
  | 'auth:sign-out'
  | 'auth:error'
  | 'capability:changed'
  | 'navigation:route-change'
  | 'error:boundary-caught'
  | 'error:unhandled'
  | 'network:request-failed'
  | 'network:retry'
  | 'network:circuit-open'
  | 'network:circuit-close'
  | 'validation:structured-output-rejected'
  | 'validation:input-rejected'
  | 'consent:granted'
  | 'consent:revoked'
  | 'entitlement:checked'
  | 'entitlement:upgrade-shown'
  | 'learning:session-start'
  | 'learning:session-end'
  | 'performance:slow-render';

export interface PlatformEvent {
  type: PlatformEventType;
  timestamp: number;
  sessionId: string;
  payload: Record<string, string | number | boolean | null>;
}

const PII_KEY_PATTERNS = [
  /email/i,
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
  /audio/i,
  /prompt/i,
  /content/i,
  /transcript/i,
  /message/i,
  /name/i,
  /phone/i,
  /address/i,
] as const;

const PII_VALUE_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  /eyJ[A-Za-z0-9_-]+\.eyJ/,
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
] as const;

function scrubPII(
  payload: Record<string, unknown>,
): Record<string, string | number | boolean | null> {
  const clean: Record<string, string | number | boolean | null> = {};
  for (const [key, raw] of Object.entries(payload)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;

    const isPIIKey = PII_KEY_PATTERNS.some((p) => p.test(key));
    if (isPIIKey) {
      clean[key] = '[redacted]';
      continue;
    }

    const value =
      typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean'
        ? raw
        : raw == null
          ? null
          : String(raw);

    if (typeof value === 'string') {
      const isPIIValue = PII_VALUE_PATTERNS.some((p) => p.test(value));
      clean[key] = isPIIValue ? '[redacted]' : value;
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

let sessionId = '';
function getSessionId(): string {
  if (!sessionId) {
    sessionId = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
  return sessionId;
}

type EventHandler = (event: PlatformEvent) => void;
const handlers = new Set<EventHandler>();
const recentEvents: PlatformEvent[] = [];
const MAX_RECENT = 100;

export const platformEventBus = {
  emit(type: PlatformEventType, payload: Record<string, unknown> = {}) {
    const event: PlatformEvent = {
      type,
      timestamp: Date.now(),
      sessionId: getSessionId(),
      payload: scrubPII(payload),
    };

    recentEvents.push(event);
    if (recentEvents.length > MAX_RECENT) {
      recentEvents.shift();
    }

    for (const handler of handlers) {
      try {
        handler(event);
      } catch {
        // handler errors must not break the event bus
      }
    }

    if (import.meta.env.DEV) {
      console.debug(`[Platform Event] ${type}`, event.payload);
    }
  },

  subscribe(handler: EventHandler): () => void {
    handlers.add(handler);
    return () => { handlers.delete(handler); };
  },

  getRecent(limit = 20): readonly PlatformEvent[] {
    return recentEvents.slice(-limit);
  },

  getSessionId,
};
