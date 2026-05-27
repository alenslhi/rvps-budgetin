const tracker = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  limit: number;       // Max requests
  windowMs: number;    // Time window in milliseconds
}

/**
 * Basic in-memory rate limiter for Next.js Node/Edge runtime.
 * Returns true if the request is rate-limited, false otherwise.
 */
export function isRateLimited(key: string, options: RateLimitOptions): { limited: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const entry = tracker.get(key);

  // Clean up expired entries periodically to prevent memory leaks
  if (tracker.size > 10000) {
    for (const [k, v] of tracker.entries()) {
      if (now > v.resetTime) {
        tracker.delete(k);
      }
    }
  }

  if (!entry) {
    tracker.set(key, { count: 1, resetTime: now + options.windowMs });
    return {
      limited: false,
      remaining: options.limit - 1,
      reset: Math.ceil((now + options.windowMs - now) / 1000),
    };
  }

  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + options.windowMs;
    return {
      limited: false,
      remaining: options.limit - 1,
      reset: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  entry.count++;
  const remaining = Math.max(0, options.limit - entry.count);
  const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);

  return {
    limited: entry.count > options.limit,
    remaining,
    reset: resetSeconds,
  };
}
