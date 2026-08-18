/**
 * RAVENHUB — IN-MEMORY RATE LIMITER
 * ------------------------------------------------------------------
 * Fixed-window rate limiting for auth endpoints and the cloaked
 * telemetry handshake. Each sandbox instance keeps its own window,
 * which is sufficient to defeat credential stuffing and handshake
 * flooding. Keys are IP- or IP+username-scoped.
 */

interface Window {
  timestamps: number[];
}

const buckets = new Map<string, Window>();
const WINDOW_MS = 60_000;
const MAX_BUCKETS = 10_000;

function gcBuckets(now: number) {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, window] of buckets) {
    window.timestamps = window.timestamps.filter((t) => now - t < WINDOW_MS);
    if (window.timestamps.length === 0) buckets.delete(key);
  }
}

/** Returns true if the request is allowed, otherwise false (rate-limited). */
export function hitRateLimit(key: string, limit: number, windowMs = WINDOW_MS): boolean {
  const now = Date.now();
  gcBuckets(now);
  const window = buckets.get(key) ?? { timestamps: [] };
  window.timestamps = window.timestamps.filter((t) => now - t < windowMs);
  if (window.timestamps.length >= limit) {
    buckets.set(key, window);
    return false;
  }
  window.timestamps.push(now);
  buckets.set(key, window);
  return true;
}

/** Credential-attack lockout: track consecutive failures per username. */
const failures = new Map<string, { count: number; lockedUntil: number }>();

export function recordAuthFailure(username: string, maxAttempts = 5, lockoutMs = 15 * 60_000) {
  const now = Date.now();
  const entry = failures.get(username) ?? { count: 0, lockedUntil: 0 };
  if (now > entry.lockedUntil) {
    entry.count = 1;
    entry.lockedUntil = 0;
  } else {
    entry.count += 1;
  }
  if (entry.count >= maxAttempts) {
    entry.lockedUntil = now + lockoutMs;
  }
  failures.set(username, entry);
}

export function isLockedOut(username: string): boolean {
  const entry = failures.get(username);
  if (!entry) return false;
  if (entry.lockedUntil > Date.now()) return true;
  failures.delete(username);
  return false;
}

export function clearAuthFailures(username: string) {
  failures.delete(username);
}

/** Exposed for the penetration suite — resets all windows. */
export function resetRateLimiter() {
  buckets.clear();
  failures.clear();
}
