const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

const store = new Map<string, { count: number; resetAt: number }>();

function cleanup() {
  const now = Date.now();
  Array.from(store.entries()).forEach(([key, value]) => {
    if (value.resetAt < now) store.delete(key);
  });
}

export function checkRateLimit(identifier: string): { success: boolean; remaining: number } {
  const now = Date.now();
  if (store.size > 1000) cleanup();

  const entry = store.get(identifier);
  if (!entry) {
    store.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { success: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (entry.resetAt < now) {
    entry.count = 1;
    entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
    return { success: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  entry.count++;
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count);
  return {
    success: entry.count <= RATE_LIMIT_MAX_REQUESTS,
    remaining,
  };
}
