import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchBar from '../components/SearchBar.jsx';
import CardGrid from '../components/CardGrid.jsx';
import { Cards } from '../lib/api.js';

export default function Search({ userEmail }) {
  const { t } = useTranslation();
  const [q, setQ] = useState('lightning bolt set:m11');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try { setResults(await Cards.search(q)); } finally { setLoading(false); }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <SearchBar value={q} onChange={setQ} onSubmit={run} />
      
      {loading ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-mtg-blue/20 to-mtg-gold/20 flex items-center justify-center animate-pulse">
            <span className="text-2xl">🔍</span>
          </div>
          <p className="text-mtg-white/70 text-lg">{t('search.loading')}</p>
        </div>
      ) : (
        <div className="mt-8">
          <CardGrid results={results} userEmail={userEmail} />
        </div>
      )}
    </div>
  );
}