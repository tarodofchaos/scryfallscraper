import React from 'react';
import CardTile from './CardTile.jsx';

export default function CardGrid({ results, userEmail }) {
  if (!results?.data?.length) return <p className="opacity-70">No results yet.</p>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {results.data.map(c => <CardTile key={c.id} card={c} userEmail={userEmail} />)}
    </div>
  );
}