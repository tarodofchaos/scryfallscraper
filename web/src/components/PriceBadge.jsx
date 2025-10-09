import React from 'react';
export default function PriceBadge({ prices }) {
  if (!prices) return null;
  const { eur, eur_foil } = prices;
  return (
    <div className="text-sm opacity-90">
      {eur && <span className="mr-2">€{Number(eur).toFixed(2)}</span>}
      {eur_foil && <span className="mr-2">Foil €{Number(eur_foil).toFixed(2)}</span>}
      <span className="opacity-60">source: Scryfall</span>
    </div>
  );
}