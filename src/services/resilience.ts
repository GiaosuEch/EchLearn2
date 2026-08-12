/**
 * Resilience Utilities
 *
 * Exponential backoff retry, circuit breaker, and timeout wrappers.
 * Applied to Supabase calls, AI inference, and external network requests.
 */

import { fail, fromCatch, type PlatformResult } from '../types/result';
import { platformEventBus } from './platformEventBus';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  label?: string;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 500,
    maxDelayMs = 10_000,
    shouldRetry = () => true,
    label = 'operation',
  } = opts;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt >= maxAttempts || !shouldRetry(err, attempt)) {
        throw err;
      }

      const jitter = Math.random() * 0.3 + 0.85;
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1) * jitter, maxDelayMs);

      platformEventBus.emit('network:retry', {
        label,
        attempt,
        maxAttempts,
        delayMs: Math.round(delay),
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export async function withRetrySafe<T>(
  fn: () => Promise<PlatformResult<T>>,
  opts: RetryOptions = {},
): Promise<PlatformResult<T>> {
  try {
    return await withRetry(fn, opts);
  } catch (err) {
    return fromCatch(err);
  }
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  windowMs?: number;
  cooldownMs?: number;
  label?: string;
}

interface CircuitState {
  failures: number[];
  openedAt: number | null;
}

const circuits = new Map<string, CircuitState>();

function getCircuit(label: string): CircuitState {
  let state = circuits.get(label);
  if (!state) {
    state = { failures: [], openedAt: null };
    circuits.set(label, state);
  }
  return state;
}

export async function withCircuitBreaker<T>(
  fn: () => Promise<T>,
  opts: CircuitBreakerOptions = {},
): Promise<T> {
  const {
    failureThreshold = 5,
    windowMs = 60_000,
    cooldownMs = 30_000,
    label = 'default',
  } = opts;

  const state = getCircuit(label);
  const now = Date.now();

  if (state.openedAt !== null) {
    if (now - state.openedAt < cooldownMs) {
      throw new Error(`Circuit breaker open for "${label}". Retry after cooldown.`);
    }
    state.openedAt = null;
    state.failures = [];
    platformEventBus.emit('network:circuit-close', { label });
  }

  try {
    const result = await fn();
    state.failures = state.failures.filter((t) => now - t < windowMs);
    return result;
  } catch (err) {
    state.failures.push(now);
    state.failures = state.failures.filter((t) => now - t < windowMs);

    if (state.failures.length >= failureThreshold) {
      state.openedAt = now;
      platformEventBus.emit('network:circuit-open', {
        label,
        failures: state.failures.length,
        cooldownMs,
      });
    }

    throw err;
  }
}

export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  label = 'operation',
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await Promise.race([
      fn(),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error(`Timeout after ${timeoutMs}ms for "${label}"`));
        });
      }),
    ]);
    return result;
  } finally {
    clearTimeout(timer);
  }
}

export async function withTimeoutSafe<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  label = 'operation',
): Promise<PlatformResult<T>> {
  try {
    const value = await withTimeout(fn, timeoutMs, label);
    return { ok: true, value };
  } catch (err) {
    return fail('timeout', `${label} timed out after ${timeoutMs}ms`, { cause: err });
  }
}

export function resetCircuit(label: string) {
  circuits.delete(label);
}

export function getCircuitState(label: string): 'closed' | 'open' {
  const state = circuits.get(label);
  if (!state || state.openedAt === null) return 'closed';
  return 'open';
}
