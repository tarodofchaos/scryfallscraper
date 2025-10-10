import React from 'react';
import { useTranslation } from 'react-i18next';
import CardTile from './CardTile.jsx';

export default function CardGrid({ results, userEmail, onAddToInventory }) {
  const { t } = useTranslation();
  
  if (!results?.data?.length) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-mtg-blue/20 to-mtg-gold/20 flex items-center justify-center">
          <span className="text-4xl">🔍</span>
        </div>
        <p className="text-mtg-white/70 text-lg">{t('search.noResults')}</p>
        <p className="text-mtg-white/50 text-sm mt-2">{t('search.noResultsSubtitle')}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-mtg-white">
          {t('search.results')}
        </h2>
        <div className="text-sm text-mtg-white/70">
          {t('search.resultsCount', { count: results.data.length })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.data.map(c => (
          <CardTile key={c.id} card={c} userEmail={userEmail} onAddToInventory={onAddToInventory} />
        ))}
      </div>
    </div>
  );
}