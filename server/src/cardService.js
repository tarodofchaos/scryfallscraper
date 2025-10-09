import { withCache } from './cache.js';
import { scryfall } from './scryfallClient.js';

function extractImages(card) {
  if (card.image_uris) return card.image_uris;
  if (card.card_faces?.[0]?.image_uris) return card.card_faces[0].image_uris;
  return null;
}

function extractPrices(card) {
  const p = card.prices || {};
  return { eur: p.eur ?? null, eur_foil: p.eur_foil ?? null, usd: p.usd ?? null, usd_foil: p.usd_foil ?? null, tix: p.tix ?? null, provider: 'scryfall' };
}

export const cardService = {
  searchCards: (q, opts = {}) => withCache(`search:${q}:${opts.page || 1}`, () => scryfall.search(q, opts), { ttl: 1000 * 60 * 10 }),
  getCardById: (id) => withCache(`card:${id}`, () => scryfall.byId(id), { ttl: 1000 * 60 * 60 }),
  getPrints: (id) => withCache(`prints:${id}`, () => scryfall.prints(id), { ttl: 1000 * 60 * 60 }),
  getImages: async (id) => extractImages(await scryfall.byId(id)),
  getPrices: async (id) => extractPrices(await scryfall.byId(id)),
  getByName: ({ exact, fuzzy }) => withCache(exact ? `name:exact:${exact}` : `name:fuzzy:${fuzzy}`, () => scryfall.named({ exact, fuzzy }), { ttl: 1000 * 60 * 60 }),
};