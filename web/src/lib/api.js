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
};

export const Inventory = {
  list: (email) => api(`/inventory?email=${encodeURIComponent(email)}`),
  add: (payload) => api('/inventory', { method: 'POST', body: JSON.stringify(payload) }),
};

export const Listings = {
  list: () => api('/listings'),
  create: (payload) => api('/listings', { method: 'POST', body: JSON.stringify(payload) }),
};