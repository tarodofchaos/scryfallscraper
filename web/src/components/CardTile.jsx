import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cards, Inventory } from '../lib/api.js';
import PriceBadge from './PriceBadge.jsx';
import OptimizedImage from './OptimizedImage.jsx';

function CardTile({ card, userEmail, onAddToInventory }) {
  const { t } = useTranslation();
  const [prices, setPrices] = useState(null);
  const [binderAnimation, setBinderAnimation] = useState(false);
  const img = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal;
  const [binderStyle, setBinderStyle] = useState({});

  useEffect(()=>{ (async()=>{
    try { const p = await Cards.prices(card.id); setPrices(p.prices); } catch {}
  })(); }, [card.id]);

  function handleAddToInventory() {
    onAddToInventory(card);
  }

  function handleCardAdded() {
    // Find inventory button position for binder animation
    const btn = document.getElementById('inventory-btn');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setBinderStyle({
        '--binder-x': `${rect.left + rect.width / 2}px`,
        '--binder-y': `${rect.top + rect.height / 2}px`
      });
    }
    setBinderAnimation(true);
    setTimeout(() => setBinderAnimation(false), 1500);
  }

  return (
    <div className="card relative group overflow-hidden">
      {/* Card Image with Hover Effect */}
      {img && (
        <div className="relative overflow-hidden rounded-xl mb-4 aspect-[488/680] bg-gradient-to-br from-mtg-blue/10 to-mtg-gold/10">
          <OptimizedImage 
            src={img} 
            alt={card.name} 
            className="w-full h-full transition-transform duration-500 group-hover:scale-105"
            fallback="🎴"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white text-sm">⚡</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Card Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-mtg-black dark:text-mtg-white group-hover:text-mtg-blue transition-colors duration-300">
              {card.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-mtg-blue/10 text-mtg-blue uppercase">
                {card.set_name}
              </span>
              <span className="text-xs text-mtg-black/60 dark:text-mtg-white/60">
                #{card.collector_number}
              </span>
            </div>
          </div>
        </div>
        
        {/* Price Badge */}
        <div className="mt-3">
          <PriceBadge prices={prices} />
        </div>
        
        {/* Add to Inventory Button */}
        {userEmail && (
          <button 
            onClick={handleAddToInventory} 
            className="btn-primary w-full mt-4 group-hover:shadow-lg transition-all duration-300"
          >
            <span className="flex items-center justify-center gap-2">
              <span>{t('card.addToInventory')}</span>
              <span className="text-lg">📦</span>
            </span>
          </button>
        )}
      </div>
      
      {/* Card to Binder Animation */}
      {binderAnimation && img && (
        <div className="absolute left-1/2 top-1/2 pointer-events-none animate-card-to-binder" style={binderStyle}>
          <div className="relative">
            <img
              src={img}
              alt="card to binder"
              className="w-20 h-28 rounded-lg shadow-2xl border-2 border-mtg-gold"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-mtg-gold flex items-center justify-center">
              <span className="text-xs font-bold text-mtg-black">📚</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default CardTile;