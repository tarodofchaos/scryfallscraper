import React, { useEffect, useState } from 'react';
import { Cards, Inventory } from '../lib/api.js';
import PriceBadge from './PriceBadge.jsx';

function CardTile({ card, userEmail }) {
  const [prices, setPrices] = useState(null);
  const [fly, setFly] = useState(false);
  const img = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal;
    const [flyStyle, setFlyStyle] = useState({});

  useEffect(()=>{ (async()=>{
    try { const p = await Cards.prices(card.id); setPrices(p.prices); } catch {}
  })(); }, [card.id]);

  async function addToInventory() {
    const printing = {
      id: card.id,
      oracleId: card.oracle_id,
      name: card.name,
      set: card.set,
      collectorNum: String(card.collector_number),
      rarity: card.rarity,
      foil: (card.foil ?? false),
      imageNormal: img
    };
    await Inventory.add({ ownerEmail: userEmail, printing, condition: 'NM', language: card.lang?.toUpperCase?.() || 'EN', quantity: 1 });
      // Find inventory button position
      const btn = document.getElementById('inventory-btn');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        setFlyStyle({
          '--fly-x': `${rect.left + rect.width / 2}px`,
          '--fly-y': `${rect.top + rect.height / 2}px`
        });
      }
    setFly(true);
    setTimeout(() => setFly(false), 1200);
  }

  return (
    <div className="card relative">
      {img && <img src={img} alt={card.name} className="w-full rounded-xl mb-3"/>}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{card.name}</div>
          <div className="text-xs opacity-70 uppercase">{card.set_name} • #{card.collector_number}</div>
        </div>
      </div>
      <div className="mt-2"><PriceBadge prices={prices} /></div>
      {userEmail && (
        <button onClick={addToInventory} className="btn mt-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 w-full">Add to Inventory</button>
      )}
        {fly && img && (
          <img
            src={img}
            alt="fly"
            className="absolute left-1/2 top-1/2 w-16 h-16 rounded-xl pointer-events-none animate-fly-to-inventory"
            style={{
              zIndex: 1000,
              transform: 'translate(-50%, -50%)',
              ...flyStyle
            }}
          />
        )}
    </div>
  );
}

export default CardTile;