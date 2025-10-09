const buckets = new Map();
export function makeLimiter({ key = 'scryfall', capacity = 8, refillPerSec = 8 } = {}) {
  if (!buckets.has(key)) buckets.set(key, { tokens: capacity, last: Date.now() });
  return async () => {
    while (true) {
      const now = Date.now();
      const b = buckets.get(key);
      const delta = (now - b.last) / 1000;
      b.tokens = Math.min(capacity, b.tokens + delta * refillPerSec);
      b.last = now;
      if (b.tokens >= 1) { b.tokens -= 1; return; }
      await new Promise(r => setTimeout(r, 80));
    }
  };
}