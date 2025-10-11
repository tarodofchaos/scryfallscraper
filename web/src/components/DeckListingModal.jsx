import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const DeckListingModal = ({ deck, isOpen, onClose, onListingCreated }) => {
  const { t } = useTranslation();
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!price || parseFloat(price) <= 0) {
      setError(t('deckListing.error.invalidPrice'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const listingData = {
        deckId: deck.id,
        deckName: deck.name,
        deckSource: deck.source,
        deckUrl: deck.url,
        deckCards: deck.cards,
        totalCards: deck.totalCards,
        price: parseFloat(price),
        description: description.trim() || null,
        sellerEmail: deck.owner
      };

      const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API}/api/deck-listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create listing');
      }

      const result = await response.json();
      onListingCreated(result.listing);
      onClose();
      
      // Reset form
      setPrice('');
      setDescription('');
      setError('');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setPrice('');
    setDescription('');
    setError('');
  };

  if (!isOpen || !deck) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-mtg-black border border-white/20 rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-mtg-white">
            {t('deckListing.title')}
          </h3>
          <button
            onClick={handleClose}
            className="text-mtg-white/70 hover:text-mtg-white"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Deck Info */}
          <div className="bg-white/5 border border-white/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-mtg-white mb-2">{t('deckListing.deckInfo')}</h4>
            <div className="text-sm text-mtg-white/70">
              <div><strong>{t('deckListing.deckName')}:</strong> {deck.name}</div>
              <div><strong>{t('deckListing.source')}:</strong> {deck.source}</div>
              <div><strong>{t('deckListing.totalCards')}:</strong> {deck.totalCards}</div>
              {deck.url && (
                <div><strong>{t('deckListing.sourceUrl')}:</strong> 
                  <a href={deck.url} target="_blank" rel="noopener noreferrer" className="text-mtg-blue hover:text-mtg-blue/80 ml-1">
                    {deck.url}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-mtg-white mb-2">
              {t('deckListing.price')} (€) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-mtg-white placeholder-mtg-white/50"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-mtg-white mb-2">
              {t('deckListing.description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('deckListing.descriptionPlaceholder')}
              rows={3}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-mtg-white placeholder-mtg-white/50 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !price}
              className="flex-1 btn-primary"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-mtg-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {t('deckListing.creating')}
                </>
              ) : (
                <>
                  <span className="mr-2">💰</span>
                  {t('deckListing.createListing')}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

DeckListingModal.propTypes = {
  deck: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onListingCreated: PropTypes.func.isRequired
};

export default DeckListingModal;
