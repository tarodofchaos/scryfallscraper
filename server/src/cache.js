import { LRUCache } from 'lru-cache';
export const cache = new LRUCache({ max: 5000, ttl: 1000 * 60 * 60 });
export async function withCache(key, fn, { ttl } = {}) {
  const hit = cache.get(key);
  if (hit) return hit;
  const val = await fn();
  cache.set(key, val, { ttl });
  return val;
}