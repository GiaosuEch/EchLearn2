/**
 * Platform Result Pattern
 *
 * Type-safe discriminated union for operation outcomes.
 * Every platform service returns PlatformResult<T> instead of
 * ad-hoc { data?, error? } shapes, so callers cannot ignore failures.
 */

export type PlatformResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: PlatformError };

export interface PlatformError {
  code: ErrorCode;
  message: string;
  cause?: unknown;
  retryable: boolean;
}

export type ErrorCode =
  | 'network'
  | 'auth'
  | 'validation'
  | 'not-found'
  | 'permission'
  | 'conflict'
  | 'rate-limit'
  | 'capability-unavailable'
  | 'consent-required'
  | 'entitlement'
  | 'timeout'
  | 'parse'
  | 'internal';

export function ok<T>(value: T): PlatformResult<T> {
  return { ok: true, value };
}

export function fail<T = never>(
  code: ErrorCode,
  message: string,
  opts?: { cause?: unknown; retryable?: boolean },
): PlatformResult<T> {
  return {
    ok: false,
    error: {
      code,
      message,
      cause: opts?.cause,
      retryable: opts?.retryable ?? isRetryableByDefault(code),
    },
  };
}

export function fromCatch<T = never>(
  err: unknown,
  fallbackCode: ErrorCode = 'internal',
): PlatformResult<T> {
  const message =
    err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown error';
  const code = classifyError(err) ?? fallbackCode;
  return fail(code, message, { cause: err });
}

export function unwrapOr<T>(result: PlatformResult<T>, fallback: T): T {
  return result.ok ? result.value : fallback;
}

export function mapResult<T, U>(
  result: PlatformResult<T>,
  fn: (value: T) => U,
): PlatformResult<U> {
  if (result.ok) return ok(fn(result.value));
  return result;
}

function isRetryableByDefault(code: ErrorCode): boolean {
  return code === 'network' || code === 'timeout' || code === 'rate-limit';
}

function classifyError(err: unknown): ErrorCode | null {
  if (!(err instanceof Error)) return null;
  const msg = err.message.toLowerCase();
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('econnrefused'))
    return 'network';
  if (msg.includes('timeout') || msg.includes('aborted')) return 'timeout';
  if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('unauthenticated'))
    return 'auth';
  if (msg.includes('403') || msg.includes('forbidden')) return 'permission';
  if (msg.includes('404') || msg.includes('not found')) return 'not-found';
  if (msg.includes('409') || msg.includes('conflict')) return 'conflict';
  if (msg.includes('429') || msg.includes('rate limit') || msg.includes('too many'))
    return 'rate-limit';
  return null;
}
