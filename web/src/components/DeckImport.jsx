import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cards, Inventory } from '../lib/api.js';
import PropTypes from 'prop-types';

export default function DeckImport({ userEmail, onImportComplete }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importSource, setImportSource] = useState('manabox');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState('text');
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, currentCard: '' });

  const supportedSources = [
    { id: 'manabox', name: 'ManaBox', icon: '📱', description: 'Mobile app format' },
    { id: 'archidekt', name: 'Archidekt', icon: '🏛️', description: 'Commander deck builder' },
    { id: 'mtggoldfish', name: 'MTGGoldfish', icon: '🐟', description: 'Tournament results' },
    { id: 'tappedout', name: 'TappedOut', icon: '💧', description: 'Deck sharing site' },
    { id: 'mtgtop8', name: 'MTGTop8', icon: '🏆', description: 'Tournament decks' },
    { id: 'moxfield', name: 'Moxfield', icon: '💎', description: 'Modern deck builder' },
    { id: 'generic', name: 'Generic List', icon: '📝', description: 'Any text format' }
  ];

  function parseDeckList(text, source) {
    const lines = text.split('\n').filter(line => line.trim());
    const cards = [];
    
    for (const line of lines) {
      // Skip empty lines and comments
      if (!line.trim() || line.startsWith('//') || line.startsWith('#') || line.startsWith('Sideboard')) {
        continue;
      }
      
      // Different parsing based on source
      let match;
      switch (source) {
        case 'manabox':
          // ManaBox format: "1 Lightning Bolt (M11)" or "1 Lightning Bolt"
          match = line.match(/^(\d+)\s+(.+?)(?:\s+\(([^)]+)\))?$/);
          break;
        case 'archidekt':
          // Archidekt format: "1 Lightning Bolt [M11]" or "1 Lightning Bolt"
          match = line.match(/^(\d+)\s+(.+?)(?:\s+\[([^\]]+)\])?$/);
          break;
        case 'mtggoldfish':
          // MTGGoldfish format: "1 Lightning Bolt (M11)" or "1 Lightning Bolt"
          match = line.match(/^(\d+)\s+(.+?)(?:\s+\(([^)]+)\))?$/);
          break;
        case 'tappedout':
          // TappedOut format: "1 Lightning Bolt (M11)" or "1 Lightning Bolt"
          match = line.match(/^(\d+)\s+(.+?)(?:\s+\(([^)]+)\))?$/);
          break;
        case 'mtgtop8':
          // MTGTop8 format: "1 Lightning Bolt (M11)" or "1 Lightning Bolt"
          match = line.match(/^(\d+)\s+(.+?)(?:\s+\(([^)]+)\))?$/);
          break;
        case 'moxfield':
          // Moxfield format: "1 Lightning Bolt (M11)" or "1 Lightning Bolt"
          match = line.match(/^(\d+)\s+(.+?)(?:\s+\(([^)]+)\))?$/);
          break;
        case 'generic':
        default:
          // Generic format: "1 Lightning Bolt" or "1 Lightning Bolt (M11)" or "1x Lightning Bolt"
          match = line.match(/^(\d+)(?:x)?\s+(.+?)(?:\s+\(([^)]+)\))?$/);
          break;
      }
      
      if (match) {
        const [, quantity, name, set] = match;
        const card = {
          name: name.trim(),
          quantity: parseInt(quantity),
          set: set ? set.trim() : null,
          condition: 'NM', // Default condition
          language: 'EN' // Default language
        };
        cards.push(card);
      }
    }
    
    return cards;
  }

  async function fetchDeckFromUrl(url) {
    try {
      // For now, we'll just show a message that URL fetching is not implemented
      // In a real implementation, you would need to create backend endpoints
      // to fetch deck lists from different platforms
      setError(t('deckImport.errors.urlNotSupported'));
      return null;
    } catch (err) {
      setError(t('deckImport.errors.urlFetchError'));
      return null;
    }
  }

  async function handlePreview() {
    console.log('handlePreview called', { 
      importText: importText.substring(0, 100), 
      importSource, 
      inputMode,
      hasText: !!importText.trim()
    });
    
    if (!importText.trim()) {
      console.log('No text provided, setting error');
      setError(t('deckImport.errors.emptyText'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      let deckText = importText;
      
      // If URL mode, try to fetch the deck list
      if (inputMode === 'url') {
        const fetchedDeck = await fetchDeckFromUrl(importText);
        if (!fetchedDeck) return;
        deckText = fetchedDeck;
      }
      
      console.log('Parsing deck list with source:', importSource);
      const cards = parseDeckList(deckText, importSource);
      console.log('Parsed cards:', cards);
      
      if (cards.length === 0) {
        console.log('No cards found after parsing');
        setError(t('deckImport.errors.noCardsFound'));
        return;
      }

      // Validate each card against Scryfall API
      console.log('Validating cards against Scryfall API...');
      const validatedCards = [];
      const invalidCards = [];
      
      for (const card of cards) {
        try {
          console.log(`Validating card: ${card.name}`);
          const searchResult = await Cards.search(card.name);
          
          if (searchResult.data && searchResult.data.length > 0) {
            // Find exact match (case-insensitive)
            const exactMatch = searchResult.data.find(c => 
              c.name.toLowerCase() === card.name.toLowerCase()
            );
            
            if (exactMatch) {
              console.log(`✅ Valid card: ${card.name} -> ${exactMatch.name}`);
              validatedCards.push({
                ...card,
                validated: true,
                scryfallData: exactMatch
              });
            } else {
              console.log(`❌ No exact match for: ${card.name}`);
              invalidCards.push(card.name);
            }
          } else {
            console.log(`❌ Card not found: ${card.name}`);
            invalidCards.push(card.name);
          }
        } catch (err) {
          console.error(`Error validating ${card.name}:`, err);
          invalidCards.push(card.name);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`Validation complete: ${validatedCards.length} valid, ${invalidCards.length} invalid`);
      
      if (validatedCards.length === 0) {
        setError(`No valid cards found. All cards failed validation:\n${invalidCards.join('\n')}`);
        return;
      }
      
      if (invalidCards.length > 0) {
        setError(`⚠️ Some cards could not be validated:\n${invalidCards.join('\n')}\n\nOnly valid cards will be imported.`);
      }

      console.log('Setting preview with', validatedCards.length, 'validated cards');
      setPreview(validatedCards);
      
    } catch (err) {
      console.error('Preview error:', err);
      setError(t('deckImport.errors.parseError'));
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    console.log('handleImport called', { preview, userEmail });
    
    if (!preview) {
      console.log('Missing preview data');
      setError('No cards to import. Please preview your deck first.');
      return;
    }
    
    if (!userEmail) {
      console.log('Missing userEmail');
      setError('You must be logged in to import cards. Please log in and try again.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Check if user is logged in
      console.log('Checking if user is logged in...');
      const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const meResponse = await fetch(`${API}/api/me`, {
        credentials: 'include'
      });
      const meData = await meResponse.json();
      console.log('User status:', meData);
      
      if (!meData.ok) {
        setError('You must be logged in to import cards. Please log in and try again.');
        setLoading(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      console.log('Starting import for', preview.length, 'cards');
      setImportProgress({ current: 0, total: preview.length, currentCard: '' });

      // Process cards in batches to avoid rate limiting
      const BATCH_SIZE = 5;
      const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay between batches
      const DELAY_BETWEEN_CARDS = 200; // 200ms delay between individual cards

      for (let i = 0; i < preview.length; i += BATCH_SIZE) {
        const batch = preview.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(preview.length / BATCH_SIZE)}:`, batch.map(c => c.name));

        for (const card of batch) {
          setImportProgress({ current: i + batch.indexOf(card) + 1, total: preview.length, currentCard: card.name });
          
          try {
            console.log('Importing validated card:', card.name);
            
            // Use the validated Scryfall data
            const scryfallData = card.scryfallData;
            const printing = {
              id: scryfallData.id,
              oracleId: scryfallData.oracle_id,
              name: scryfallData.name,
              set: scryfallData.set,
              collectorNum: String(scryfallData.collector_number),
              rarity: scryfallData.rarity,
              foil: false,
              imageNormal: scryfallData.image_uris?.normal || scryfallData.card_faces?.[0]?.image_uris?.normal
            };

            console.log('Adding card to inventory:', printing);
            
            const inventoryPayload = {
              ownerEmail: userEmail,
              printing,
              condition: card.condition,
              language: card.language,
              quantity: card.quantity
            };
            
            console.log('Inventory payload:', inventoryPayload);
            
            const result = await Inventory.add(inventoryPayload);
            console.log('Inventory add result:', result);
            
            console.log('Successfully added card:', card.name);
            successCount++;
            
          } catch (err) {
            console.error('Error importing card:', card.name, err);
            errorCount++;
          }

        // Add delay between individual cards
        if (batch.indexOf(card) < batch.length - 1) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CARDS));
        }
      }

      // Add delay between batches (except for the last batch)
      if (i + BATCH_SIZE < preview.length) {
        console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

      console.log('Import completed:', { successCount, errorCount });

      // Show results
      if (errorCount > 0) {
        setError(`Import completed with ${errorCount} errors. ${successCount} cards imported successfully.`);
      } else {
        setError('');
        setPreview(null);
        setImportText('');
        setIsOpen(false);
        
        if (onImportComplete) {
          onImportComplete();
        }
      }
      
    } catch (err) {
      console.error('Import error:', err);
      setError(t('deckImport.errors.importError') + ': ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setIsOpen(false);
    setImportText('');
    setPreview(null);
    setError('');
  }

  return (
    <>
      {/* Import Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center gap-2"
      >
        <span>📥</span>
        <span>{t('deckImport.button')}</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-mtg-black/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl border border-white/20 max-h-[95vh] overflow-hidden flex flex-col">
            <div className="p-6 flex-1 overflow-y-auto min-h-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-mtg-white">
                  {t('deckImport.title')}
                </h2>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-mtg-white"
                >
                  ✕
                </button>
              </div>

              {/* Source Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-mtg-white mb-3">
                  {t('deckImport.sourceLabel')}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {supportedSources.map(source => (
                    <button
                      key={source.id}
                      onClick={() => setImportSource(source.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        importSource === source.id
                          ? 'border-mtg-blue bg-mtg-blue/20 text-mtg-white'
                          : 'border-white/20 hover:border-mtg-blue/50 text-mtg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{source.icon}</div>
                        <div>
                          <div className="font-medium">{source.name}</div>
                          <div className="text-xs opacity-70">{source.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Mode Toggle */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setInputMode('text')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      inputMode === 'text'
                        ? 'bg-mtg-blue text-white'
                        : 'bg-white/10 text-mtg-white hover:bg-white/20'
                    }`}
                  >
                    📝 {t('deckImport.inputMode.text')}
                  </button>
                  <button
                    onClick={() => setInputMode('url')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      inputMode === 'url'
                        ? 'bg-mtg-blue text-white'
                        : 'bg-white/10 text-mtg-white hover:bg-white/20'
                    }`}
                  >
                    🔗 {t('deckImport.inputMode.url')}
                  </button>
                </div>
              </div>

              {/* Import Text Area */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-mtg-white mb-2">
                  {inputMode === 'text' ? t('deckImport.textLabel') : t('deckImport.urlLabel')}
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full h-40 rounded-xl border border-white/20 bg-white/10 text-mtg-white placeholder-mtg-white/50 p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-mtg-blue focus:border-transparent transition-all duration-300"
                  placeholder={inputMode === 'text' ? t('deckImport.placeholder') : t('deckImport.urlPlaceholder')}
                />
                {inputMode === 'url' && (
                  <p className="text-xs text-mtg-white/60 mt-2">
                    {t('deckImport.urlNote')}
                  </p>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}


              {/* Preview */}
              {preview && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-mtg-white mb-3">
                    {t('deckImport.preview.title')} ({preview.length} {t('deckImport.preview.cards')})
                  </h3>
                  <div className="max-h-40 overflow-y-auto border border-white/20 rounded-lg bg-white/5">
                    {preview.map((card, index) => (
                      <div key={`${card.name}-${index}`} className="p-3 border-b border-white/10 last:border-b-0 flex items-center justify-between">
                        <div>
                          <span className="font-medium text-mtg-white">{card.quantity}x {card.name}</span>
                          {card.set && (
                            <span className="text-sm text-mtg-white/60 ml-2">({card.set})</span>
                          )}
                        </div>
                        <div className="text-sm text-mtg-white/60">
                          {card.condition} • {card.language}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
            
            {/* Actions - Fixed at bottom */}
            <div className="p-6 border-t border-white/10 bg-mtg-black/50">
              {/* Progress indicator */}
              {loading && importProgress.total > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-mtg-white/70 mb-2">
                    <span>Importing cards...</span>
                    <span>{importProgress.current}/{importProgress.total}</span>
                  </div>
                  <div className="w-full bg-mtg-black/30 rounded-full h-2">
                    <div 
                      className="bg-mtg-gold h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                    ></div>
                  </div>
                  {importProgress.currentCard && (
                    <div className="text-xs text-mtg-white/50 mt-1 truncate">
                      Current: {importProgress.currentCard}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handlePreview}
                  disabled={!importText.trim() || loading}
                  className="btn-secondary flex-1"
                >
                  {t('deckImport.preview.button')}
                </button>
                {preview && (
                  <button
                    onClick={() => {
                      console.log('Import button clicked!');
                      handleImport();
                    }}
                    disabled={loading}
                    className="btn-primary flex-1"
                  >
                    {loading ? t('deckImport.importing') : t('deckImport.import.button')}
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="btn bg-white/10 text-mtg-white hover:bg-white/20"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

DeckImport.propTypes = {
  userEmail: PropTypes.string.isRequired,
  onImportComplete: PropTypes.func
};
