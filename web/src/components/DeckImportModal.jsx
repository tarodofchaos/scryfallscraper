import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const DeckImportModal = ({ isOpen, onClose, onDeckImported, userEmail }) => {
  const { t } = useTranslation();
  const [importText, setImportText] = useState('');
  const [importSource, setImportSource] = useState('manabox');
  const [deckName, setDeckName] = useState('');
  const [deckUrl, setDeckUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  const supportedSources = [
    { id: 'manabox', name: 'ManaBox', icon: '📱', description: 'ManaBox deck list' },
    { id: 'archidekt', name: 'Archidekt', icon: '🏛️', description: 'Archidekt deck list' },
    { id: 'mtggoldfish', name: 'MTGGoldfish', icon: '🐟', description: 'MTGGoldfish deck list' },
    { id: 'moxfield', name: 'Moxfield', icon: '🌊', description: 'Moxfield deck list' },
    { id: 'tappedout', name: 'TappedOut', icon: '💧', description: 'TappedOut deck list' }
  ];

  const parseDeckList = (text, source) => {
    const lines = text.split('\n').filter(line => line.trim());
    const cards = [];
    
    console.log('Parsing deck list:', { source, lines: lines.length });
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines, comments, and headers
      if (!trimmedLine || 
          trimmedLine.startsWith('#') || 
          trimmedLine.startsWith('//') ||
          trimmedLine.startsWith('Sideboard') ||
          trimmedLine.startsWith('Commander') ||
          trimmedLine.startsWith('Deck') ||
          trimmedLine.toLowerCase().includes('sideboard') ||
          trimmedLine.toLowerCase().includes('commander')) {
        continue;
      }
      
      // Try multiple parsing patterns
      let match = null;
      
      // Pattern 1: "1x Lightning Bolt" (most common)
      if (!match) {
        match = trimmedLine.match(/^(\d+)x\s+(.+)$/);
      }
      
      // Pattern 2: "1 Lightning Bolt" (standard format)
      if (!match) {
        match = trimmedLine.match(/^(\d+)\s+(.+)$/);
      }
      
      // Pattern 3: "Lightning Bolt x1" (reverse format)
      if (!match) {
        match = trimmedLine.match(/^(.+)\s+x(\d+)$/);
        if (match) {
          // Swap the groups for reverse format
          match = [match[0], match[2], match[1]];
        }
      }
      
      // Pattern 4: Just card name (assume quantity 1)
      if (!match && /^[A-Za-z\s,'-]+$/.test(trimmedLine) && !trimmedLine.includes('(') && !trimmedLine.includes('[')) {
        match = ['', '1', trimmedLine];
      }
      
      if (match) {
        const quantity = parseInt(match[1] || match[2]);
        const cardName = (match[2] || match[3] || match[1]).trim();
        
        // Clean up card name (remove set codes in parentheses)
        const cleanName = cardName.replace(/\s*\([^)]*\)\s*$/, '').trim();
        
        if (quantity > 0 && cleanName) {
          cards.push({ quantity, name: cleanName });
          console.log('Parsed card:', { quantity, name: cleanName, original: trimmedLine });
        }
      } else {
        console.log('Failed to parse line:', trimmedLine);
      }
    }
    
    console.log('Total cards parsed:', cards.length);
    return cards;
  };

  const handlePreview = async () => {
    if (!importText.trim()) {
      setError(t('deckImport.error.noText'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Starting preview with text:', importText.substring(0, 200) + '...');
      const cards = parseDeckList(importText, importSource);
      
      console.log('Parsed cards:', cards);
      
      if (cards.length === 0) {
        setError(t('deckImport.error.noCards') + ' - Please check your deck list format.');
        return;
      }

      // Validate cards with Scryfall API
      const validatedCards = [];
      const invalidCards = [];

      for (const card of cards) {
        try {
          const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(card.name)}&exact=${encodeURIComponent(card.name)}`);
          const data = await response.json();
          
          if (data.data && data.data.length > 0) {
            const scryfallCard = data.data[0];
            validatedCards.push({
              ...card,
              scryfallId: scryfallCard.id,
              imageUrl: scryfallCard.image_uris?.normal || scryfallCard.card_faces?.[0]?.image_uris?.normal,
              set: scryfallCard.set_name,
              manaCost: scryfallCard.mana_cost,
              type: scryfallCard.type_line
            });
          } else {
            invalidCards.push(card.name);
          }
        } catch (err) {
          invalidCards.push(card.name);
        }
      }

      if (invalidCards.length > 0) {
        setError(t('deckImport.error.invalidCards', { cards: invalidCards.join(', ') }));
      }

      setPreview({
        cards: validatedCards,
        totalCards: cards.length,
        validCards: validatedCards.length,
        invalidCards: invalidCards.length
      });

    } catch (err) {
      setError(t('deckImport.error.previewFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!preview || !deckName.trim()) {
      setError(t('deckImport.error.noName'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const deckData = {
        name: deckName.trim(),
        source: importSource,
        url: deckUrl.trim() || null,
        cards: preview.cards,
        totalCards: preview.totalCards,
        validCards: preview.validCards,
        invalidCards: preview.invalidCards,
        createdAt: new Date().toISOString(),
        owner: userEmail
      };

      // Save deck to backend
      const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API}/api/decks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deckData),
      });

      if (!response.ok) {
        throw new Error('Failed to save deck');
      }

      const savedDeck = await response.json();
      onDeckImported(savedDeck);
      onClose();
      
      // Reset form
      setImportText('');
      setDeckName('');
      setDeckUrl('');
      setPreview(null);
      setError('');

    } catch (err) {
      setError(t('deckImport.error.importFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setImportText('');
    setDeckName('');
    setDeckUrl('');
    setPreview(null);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-mtg-black border border-white/20 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-mtg-white">
            {t('deckImport.title')}
          </h2>
          <button
            onClick={handleClose}
            className="text-mtg-white/70 hover:text-mtg-white transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Source Selection */}
          <div>
            <label className="block text-sm font-medium text-mtg-white mb-3">
              {t('deckImport.source')}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {supportedSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => setImportSource(source.id)}
                  className={`p-3 rounded-lg border transition-colors ${
                    importSource === source.id
                      ? 'border-mtg-gold bg-mtg-gold/10 text-mtg-gold'
                      : 'border-white/20 hover:border-white/40 text-mtg-white'
                  }`}
                >
                  <div className="text-2xl mb-1">{source.icon}</div>
                  <div className="text-sm font-medium">{source.name}</div>
                  <div className="text-xs text-mtg-white/70">{source.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Deck Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-mtg-white mb-2">
                {t('deckImport.deckName')} *
              </label>
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder={t('deckImport.deckNamePlaceholder')}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-mtg-white placeholder-mtg-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-mtg-white mb-2">
                {t('deckImport.sourceUrl')}
              </label>
              <input
                type="url"
                value={deckUrl}
                onChange={(e) => setDeckUrl(e.target.value)}
                placeholder={t('deckImport.sourceUrlPlaceholder')}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-mtg-white placeholder-mtg-white/50"
              />
            </div>
          </div>

          {/* Deck List Input */}
          <div>
            <label className="block text-sm font-medium text-mtg-white mb-2">
              {t('deckImport.deckList')} *
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={t('deckImport.deckListPlaceholder')}
              rows={8}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-mtg-white placeholder-mtg-white/50 resize-none"
            />
            <div className="mt-2 flex justify-between items-center">
              <div className="text-xs text-mtg-white/70">
                <strong>Supported formats:</strong><br/>
                • 1x Lightning Bolt<br/>
                • 1 Lightning Bolt<br/>
                • Lightning Bolt x1<br/>
                • Lightning Bolt (just card name)
              </div>
              <button
                type="button"
                onClick={() => setImportText(`1x Lightning Bolt
4x Counterspell
2x Brainstorm
1x Sol Ring
1x Command Tower
4x Island
4x Mountain`)}
                className="text-xs text-mtg-blue hover:text-mtg-blue/80"
              >
                📝 Load Sample
              </button>
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="bg-white/5 border border-white/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-mtg-white mb-3">
                {t('deckImport.preview')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-mtg-gold">{preview.totalCards}</div>
                  <div className="text-sm text-mtg-white/70">{t('deckImport.totalCards')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{preview.validCards}</div>
                  <div className="text-sm text-mtg-white/70">{t('deckImport.validCards')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{preview.invalidCards}</div>
                  <div className="text-sm text-mtg-white/70">{t('deckImport.invalidCards')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-mtg-blue">{preview.cards.length}</div>
                  <div className="text-sm text-mtg-white/70">{t('deckImport.importedCards')}</div>
                </div>
              </div>
              
              <div className="max-h-40 overflow-y-auto">
                <div className="space-y-2">
                  {preview.cards.slice(0, 10).map((card, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-white/5 rounded">
                      <div className="w-8 h-8 bg-mtg-gold/20 rounded flex items-center justify-center text-sm font-bold text-mtg-gold">
                        {card.quantity}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-mtg-white">{card.name}</div>
                        <div className="text-xs text-mtg-white/70">{card.set}</div>
                      </div>
                    </div>
                  ))}
                  {preview.cards.length > 10 && (
                    <div className="text-center text-sm text-mtg-white/70 py-2">
                      {t('deckImport.andMore', { count: preview.cards.length - 10 })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                console.log('Test parsing...');
                const cards = parseDeckList(importText, importSource);
                console.log('Test result:', cards);
                alert(`Parsed ${cards.length} cards. Check console for details.`);
              }}
              disabled={!importText.trim()}
              className="btn-secondary text-sm"
            >
              🧪 Test Parse
            </button>
            <button
              onClick={handlePreview}
              disabled={loading || !importText.trim()}
              className="flex-1 btn-secondary"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-mtg-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {t('deckImport.previewing')}
                </>
              ) : (
                <>
                  <span className="mr-2">👁️</span>
                  {t('deckImport.previewCards')}
                </>
              )}
            </button>
            
            {preview && (
              <button
                onClick={handleImport}
                disabled={loading || !deckName.trim()}
                className="flex-1 btn-primary"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-mtg-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t('deckImport.importing')}
                  </>
                ) : (
                  <>
                    <span className="mr-2">📦</span>
                    {t('deckImport.importDeck')}
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleClose}
              className="btn-secondary"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

DeckImportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDeckImported: PropTypes.func.isRequired,
  userEmail: PropTypes.string
};

export default DeckImportModal;
