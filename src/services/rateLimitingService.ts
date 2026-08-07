/**
 * Rate Limiting & Anti-Spam Service for EchLearn Platform
 * Prevents API abuse, spam flooding, and automated bot attacks.
 */

interface RateLimitConfig {
  maxRequests: number; // Max requests allowed within windowMs
  windowMs: number;    // Time window in milliseconds
}

const ACTION_CONFIGS: Record<string, RateLimitConfig> = {
  community_post: { maxRequests: 5, windowMs: 10 * 60 * 1000 },      // 5 posts per 10 mins
  community_comment: { maxRequests: 15, windowMs: 5 * 60 * 1000 },   // 15 comments per 5 mins
  direct_message: { maxRequests: 30, windowMs: 60 * 1000 },           // 30 messages per 1 min
  call_offer: { maxRequests: 5, windowMs: 60 * 1000 },               // 5 calls per 1 min
  ai_evaluation: { maxRequests: 10, windowMs: 60 * 1000 },           // 10 AI evals per 1 min
  friend_request: { maxRequests: 10, windowMs: 5 * 60 * 1000 },      // 10 friend requests per 5 mins
};

const timestampsMap = new Map<string, number[]>();

export const rateLimiter = {
  /**
   * Checks if an action is allowed for a user.
   * Returns { allowed: true } or { allowed: false, retryAfterSec: number }
   */
  checkRateLimit(action: keyof typeof ACTION_CONFIGS | string, userId = 'default_user'): { allowed: boolean; retryAfterSec?: number } {
    const config = ACTION_CONFIGS[action] || { maxRequests: 20, windowMs: 60 * 1000 };
    const key = `${action}:${userId}`;
    const now = Date.now();
    const cutoff = now - config.windowMs;

    const timestamps = (timestampsMap.get(key) || []).filter((ts) => ts > cutoff);

    if (timestamps.length >= config.maxRequests) {
      const oldestInWindow = timestamps[0];
      const retryAfterMs = oldestInWindow + config.windowMs - now;
      const retryAfterSec = Math.ceil(retryAfterMs / 1000);
      return { allowed: false, retryAfterSec };
    }

    timestamps.push(now);
    timestampsMap.set(key, timestamps);
    return { allowed: true };
  },

  /**
   * Resets rate limits for testing or admin overrides
   */
  resetLimit(action: string, userId = 'default_user') {
    timestampsMap.delete(`${action}:${userId}`);
  },
};
