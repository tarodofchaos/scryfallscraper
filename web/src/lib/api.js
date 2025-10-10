const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...opts
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const Cards = {
  search: (q) => api(`/cards/search?q=${encodeURIComponent(q)}`),
  prices: (id) => api(`/cards/${id}/prices`),
  byId: (id) => api(`/cards/${id}`),
  prints: (id) => api(`/cards/${id}/prints`),
  searchSets: (q) => api(`/cards/sets/search?q=${encodeURIComponent(q)}`),
};

export const Inventory = {
  list: (email) => api(`/inventory?email=${encodeURIComponent(email)}`),
  add: (payload) => api('/inventory', { method: 'POST', body: JSON.stringify(payload) }),
  delete: (id) => api(`/inventory/${id}`, { method: 'DELETE' }),
};

export const Listings = {
  list: () => api('/listings'),
  my: (email) => api(`/listings/my?email=${encodeURIComponent(email)}`),
  create: (payload) => api('/listings', { method: 'POST', body: JSON.stringify(payload) }),
  delete: (id) => api(`/listings/${id}`, { method: 'DELETE' }),
};