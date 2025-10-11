import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const DeckCard = ({ deck, onView, onDelete, onListForSale }) => {
  const { t } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Parse cards if it's a JSON string
  const cards = Array.isArray(deck.cards) ? deck.cards : 
                typeof deck.cards === 'string' ? JSON.parse(deck.cards) : [];

  const getSourceIcon = (source) => {
    const icons = {
      manabox: '📱',
      archidekt: '🏛️',
      mtggoldfish: '🐟',
      moxfield: '🌊',
      tappedout: '💧'
    };
    return icons[source] || '📦';
  };

  const getSourceColor = (source) => {
    const colors = {
      manabox: 'text-blue-400',
      archidekt: 'text-purple-400',
      mtggoldfish: 'text-yellow-400',
      moxfield: 'text-cyan-400',
      tappedout: 'text-green-400'
    };
    return colors[source] || 'text-mtg-white';
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(deck.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 hover:bg-white/15 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-mtg-white mb-1">
            {deck.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-mtg-white/70">
            <span className={`flex items-center gap-1 ${getSourceColor(deck.source)}`}>
              {getSourceIcon(deck.source)}
              {deck.source.charAt(0).toUpperCase() + deck.source.slice(1)}
            </span>
            <span>•</span>
            <span>{deck.totalCards} {t('deckCard.cards')}</span>
            {deck.invalidCards > 0 && (
              <>
                <span>•</span>
                <span className="text-red-400">{deck.invalidCards} {t('deckCard.invalid')}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onView(deck)}
            className="p-2 bg-mtg-blue/20 text-mtg-blue rounded-lg hover:bg-mtg-blue/30 transition-colors"
            title={t('deckCard.viewDetails')}
          >
            👁️
          </button>
          {onListForSale && (
            <button
              onClick={() => onListForSale(deck)}
              className="p-2 bg-mtg-gold/20 text-mtg-gold rounded-lg hover:bg-mtg-gold/30 transition-colors"
              title={t('deckCard.listForSale')}
            >
              💰
            </button>
          )}
          <button
            onClick={handleDelete}
            className={`p-2 rounded-lg transition-colors ${
              showDeleteConfirm 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
            }`}
            title={showDeleteConfirm ? t('deckCard.confirmDelete') : t('deckCard.delete')}
          >
            {showDeleteConfirm ? '✓' : '🗑️'}
          </button>
        </div>
      </div>

      {/* Deck Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-mtg-gold">{deck.totalCards}</div>
          <div className="text-xs text-mtg-white/70">{t('deckCard.total')}</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-400">{deck.validCards}</div>
          <div className="text-xs text-mtg-white/70">{t('deckCard.valid')}</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-mtg-blue">{deck.cards.length}</div>
          <div className="text-xs text-mtg-white/70">{t('deckCard.imported')}</div>
        </div>
      </div>

      {/* Source URL */}
      {deck.url && (
        <div className="mb-3">
          <a
            href={deck.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-mtg-blue hover:text-mtg-blue/80 transition-colors break-all"
          >
            🔗 {deck.url}
          </a>
        </div>
      )}

      {/* Created Date */}
      <div className="text-xs text-mtg-white/50">
        {t('deckCard.created')}: {new Date(deck.createdAt).toLocaleDateString()}
      </div>

      {/* Sample Cards Preview */}
      {cards.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="text-xs text-mtg-white/70 mb-2">{t('deckCard.sampleCards')}</div>
          <div className="flex flex-wrap gap-1">
            {cards.slice(0, 5).map((card, index) => (
              <span
                key={index}
                className="text-xs bg-white/10 text-mtg-white px-2 py-1 rounded"
              >
                {card.quantity}x {card.name}
              </span>
            ))}
            {cards.length > 5 && (
              <span className="text-xs text-mtg-white/50">
                +{cards.length - 5} {t('deckCard.more')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

DeckCard.propTypes = {
  deck: PropTypes.object.isRequired,
  onView: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onListForSale: PropTypes.func
};

export default DeckCard;
