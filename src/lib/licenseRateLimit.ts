/**
 * ============================================================================
 * ECHLEARN — LICENSE REDEMPTION RATE LIMITER & BRUTE-FORCE SHIELD
 * ============================================================================
 * Implements client-side exponential backoff and cooldown to block automated
 * keygen spraying, dictionary attacks, and rapid credential cracking.
 * ============================================================================
 */

export interface RateLimitStatus {
  readonly allowed: boolean;
  readonly remainingAttempts: number;
  readonly lockRemainingSeconds: number;
  readonly penaltyMultiplier: number;
}

const STORAGE_KEY = 'echlearn_lic_ratelimit_v1';
const MAX_CONSECUTIVE_FAILURES = 5;
const BASE_COOLDOWN_SECONDS = 30;

interface StoredRateLimitState {
  failureCount: number;
  lockedUntil: number; // timestamp in ms
}

let inMemoryFallback: StoredRateLimitState = { failureCount: 0, lockedUntil: 0 };

function getStoredState(): StoredRateLimitState {
  try {
    if (typeof globalThis.sessionStorage !== 'undefined') {
      const raw = globalThis.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return { failureCount: 0, lockedUntil: 0 };
      const parsed = JSON.parse(raw) as StoredRateLimitState;
      return {
        failureCount: typeof parsed.failureCount === 'number' ? parsed.failureCount : 0,
        lockedUntil: typeof parsed.lockedUntil === 'number' ? parsed.lockedUntil : 0,
      };
    }
  } catch {
    // SessionStorage restricted
  }
  return inMemoryFallback;
}

function saveState(state: StoredRateLimitState): void {
  inMemoryFallback = { ...state };
  try {
    if (typeof globalThis.sessionStorage !== 'undefined') {
      globalThis.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // SessionStorage restricted
  }
}

/**
 * Checks if a redemption attempt is currently allowed.
 */
export function checkRedemptionRateLimit(): RateLimitStatus {
  const state = getStoredState();
  const now = Date.now();

  if (state.lockedUntil > now) {
    const remainingSeconds = Math.ceil((state.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockRemainingSeconds: remainingSeconds,
      penaltyMultiplier: Math.min(Math.floor(state.failureCount / MAX_CONSECUTIVE_FAILURES), 5),
    };
  }

  const remaining = Math.max(0, MAX_CONSECUTIVE_FAILURES - (state.failureCount % MAX_CONSECUTIVE_FAILURES));

  return {
    allowed: true,
    remainingAttempts: remaining === 0 ? MAX_CONSECUTIVE_FAILURES : remaining,
    lockRemainingSeconds: 0,
    penaltyMultiplier: 1,
  };
}

/**
 * Records a failed redemption attempt and triggers backoff lock if quota exceeded.
 */
export function recordRedemptionFailure(): RateLimitStatus {
  const state = getStoredState();
  const now = Date.now();

  state.failureCount += 1;

  if (state.failureCount % MAX_CONSECUTIVE_FAILURES === 0) {
    const multiplier = Math.min(Math.floor(state.failureCount / MAX_CONSECUTIVE_FAILURES), 5);
    const lockDurationMs = BASE_COOLDOWN_SECONDS * multiplier * 1000;
    state.lockedUntil = now + lockDurationMs;
    saveState(state);

    return {
      allowed: false,
      remainingAttempts: 0,
      lockRemainingSeconds: BASE_COOLDOWN_SECONDS * multiplier,
      penaltyMultiplier: multiplier,
    };
  }

  saveState(state);

  return {
    allowed: true,
    remainingAttempts: MAX_CONSECUTIVE_FAILURES - (state.failureCount % MAX_CONSECUTIVE_FAILURES),
    lockRemainingSeconds: 0,
    penaltyMultiplier: 1,
  };
}

/**
 * Resets rate limit counters on a successful cryptographic activation.
 */
export function resetRedemptionRateLimit(): void {
  inMemoryFallback = { failureCount: 0, lockedUntil: 0 };
  try {
    if (typeof globalThis.sessionStorage !== 'undefined') {
      globalThis.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore
  }
}
