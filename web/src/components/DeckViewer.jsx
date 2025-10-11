import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const DeckViewer = ({ deck, isOpen, onClose }) => {
  const { t } = useTranslation();
  const [selectedCard, setSelectedCard] = useState(null);

  if (!isOpen || !deck) return null;

  // Parse cards if it's a JSON string
  const cards = Array.isArray(deck.cards) ? deck.cards : 
                typeof deck.cards === 'string' ? JSON.parse(deck.cards) : [];

  const getCardTypeColor = (type) => {
    if (type.includes('Creature')) return 'text-green-400';
    if (type.includes('Instant') || type.includes('Sorcery')) return 'text-red-400';
    if (type.includes('Artifact')) return 'text-gray-400';
    if (type.includes('Enchantment')) return 'text-blue-400';
    if (type.includes('Planeswalker')) return 'text-purple-400';
    if (type.includes('Land')) return 'text-yellow-400';
    return 'text-mtg-white';
  };

  const getManaCostDisplay = (manaCost) => {
    if (!manaCost) return '';
    
    // Simple mana cost display - you could enhance this with actual mana symbols
    return manaCost.replace(/\{([^}]+)\}/g, '[$1]');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-mtg-black border border-white/20 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-mtg-white">{deck.name}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-mtg-white/70">
              <span>📦 {t('deckViewer.totalCards')}: {deck.totalCards}</span>
              <span>✅ {t('deckViewer.validCards')}: {deck.validCards}</span>
              {deck.invalidCards > 0 && (
                <span>❌ {t('deckViewer.invalidCards')}: {deck.invalidCards}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-mtg-white/70 hover:text-mtg-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Deck Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 border border-white/20 rounded-lg p-4">
            <div className="text-sm text-mtg-white/70 mb-1">{t('deckViewer.source')}</div>
            <div className="text-mtg-white font-medium capitalize">{deck.source}</div>
          </div>
          
          {deck.url && (
            <div className="bg-white/5 border border-white/20 rounded-lg p-4">
              <div className="text-sm text-mtg-white/70 mb-1">{t('deckViewer.sourceUrl')}</div>
              <a
                href={deck.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mtg-blue hover:text-mtg-blue/80 transition-colors text-sm break-all"
              >
                {deck.url}
              </a>
            </div>
          )}
          
          <div className="bg-white/5 border border-white/20 rounded-lg p-4">
            <div className="text-sm text-mtg-white/70 mb-1">{t('deckViewer.created')}</div>
            <div className="text-mtg-white text-sm">
              {new Date(deck.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Cards List */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-mtg-white">
            {t('deckViewer.cardsList')} ({cards.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {cards.map((card, index) => (
              <div
                key={index}
                onClick={() => setSelectedCard(card)}
                className="bg-white/5 border border-white/20 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-mtg-gold/20 rounded flex items-center justify-center text-sm font-bold text-mtg-gold flex-shrink-0">
                    {card.quantity}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-mtg-white truncate">
                      {card.name}
                    </div>
                    <div className="text-xs text-mtg-white/70 mb-1">
                      {card.set}
                    </div>
                    {card.manaCost && (
                      <div className="text-xs text-mtg-white/60 mb-1">
                        {getManaCostDisplay(card.manaCost)}
                      </div>
                    )}
                    <div className={`text-xs ${getCardTypeColor(card.type)}`}>
                      {card.type}
                    </div>
                  </div>
                  {card.imageUrl && (
                    <div className="w-12 h-16 bg-white/10 rounded flex-shrink-0">
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card Detail Modal */}
        {selectedCard && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60">
            <div className="bg-mtg-black border border-white/20 rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-mtg-white">
                  {selectedCard.name}
                </h3>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="text-mtg-white/70 hover:text-mtg-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {selectedCard.imageUrl && (
                  <div className="w-full h-64 bg-white/10 rounded-lg overflow-hidden">
                    <img
                      src={selectedCard.imageUrl}
                      alt={selectedCard.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-mtg-white/70">{t('deckViewer.quantity')}:</span>
                    <span className="text-mtg-gold font-bold">{selectedCard.quantity}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-mtg-white/70">{t('deckViewer.set')}:</span>
                    <span className="text-mtg-white">{selectedCard.set}</span>
                  </div>
                  
                  {selectedCard.manaCost && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-mtg-white/70">{t('deckViewer.manaCost')}:</span>
                      <span className="text-mtg-white">{getManaCostDisplay(selectedCard.manaCost)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-mtg-white/70">{t('deckViewer.type')}:</span>
                    <span className={`text-sm ${getCardTypeColor(selectedCard.type)}`}>
                      {selectedCard.type}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedCard(null)}
                  className="w-full btn-primary"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

DeckViewer.propTypes = {
  deck: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default DeckViewer;
