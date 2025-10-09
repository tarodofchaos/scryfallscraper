import React, { useState } from 'react';
import SearchBar from '../components/SearchBar.jsx';
import CardGrid from '../components/CardGrid.jsx';
import { Cards } from '../lib/api.js';

export default function Search({ userEmail }) {
  const [q, setQ] = useState('lightning bolt set:m11');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try { setResults(await Cards.search(q)); } finally { setLoading(false); }
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <SearchBar value={q} onChange={setQ} onSubmit={run} />
  {loading ? <p className="mt-4 opacity-70">Searching…</p> : <div className="mt-4"><CardGrid results={results} userEmail={userEmail} /></div>}
    </div>
  );
}