import { makeLimiter } from './rateLimiter.js';
import { logger } from './logger.js';
const SCRYFALL = 'https://api.scryfall.com';
const gate = makeLimiter({ key: 'scryfall', capacity: 8, refillPerSec: 8 });

async function safeFetch(url) {
  await gate();
  const res = await fetch(url, { headers: { 'User-Agent': 'mtg-app/1.0 (+local)' } });
  if (!res.ok) {
    const body = await res.text();
    logger.warn({ url, status: res.status, body }, 'Scryfall error');
    throw new Error(`Scryfall request failed: ${res.status}`);
  }
  return res.json();
}

export const scryfall = {
  search: (q, { page = 1 } = {}) => safeFetch(`${SCRYFALL}/cards/search?q=${encodeURIComponent(q)}&page=${page}`),
  named: ({ exact, fuzzy }) => {
    const params = exact ? `exact=${encodeURIComponent(exact)}` : `fuzzy=${encodeURIComponent(fuzzy)}`;
    return safeFetch(`${SCRYFALL}/cards/named?${params}`);
  },
  byId: (id) => safeFetch(`${SCRYFALL}/cards/${id}`),
  prints: (id) => safeFetch(`${SCRYFALL}/cards/${id}/prints`),
};