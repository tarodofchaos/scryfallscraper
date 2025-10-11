import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Cards, Inventory } from '../lib/api.js';

const CONDITIONS = [
  { value: 'NM', label: 'Near Mint', color: 'bg-green-500 text-white' },
  { value: 'LP', label: 'Lightly Played', color: 'bg-blue-500 text-white' },
  { value: 'MP', label: 'Moderately Played', color: 'bg-yellow-500 text-white' },
  { value: 'HP', label: 'Heavily Played', color: 'bg-orange-500 text-white' },
  { value: 'DMG', label: 'Damaged', color: 'bg-red-500 text-white' }
];

const LANGUAGES = [
  { value: 'EN', label: '🇺🇸 English' },
  { value: 'ES', label: '🇪🇸 Spanish' },
  { value: 'FR', label: '🇫🇷 French' },
  { value: 'DE', label: '🇩🇪 German' },
  { value: 'IT', label: '🇮🇹 Italian' },
  { value: 'PT', label: '🇵🇹 Portuguese' },
  { value: 'RU', label: '🇷🇺 Russian' },
  { value: 'JA', label: '🇯🇵 Japanese' },
  { value: 'KO', label: '🇰🇷 Korean' },
  { value: 'ZH', label: '🇨🇳 Chinese' }
];

export default function AddCardModal({ card, userEmail, isOpen, onClose, onCardAdded }) {
  const { t } = useTranslation();
  const [selectedCondition, setSelectedCondition] = useState('NM');
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [quantity, setQuantity] = useState(1);
  const [selectedPrinting, setSelectedPrinting] = useState(null);
  const [printings, setPrintings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [setFilterQuery, setSetFilterQuery] = useState('');
  const [showSetDropdown, setShowSetDropdown] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);

  // Load card printings when modal opens
  useEffect(() => {
    if (isOpen && card) {
      loadPrintings();
      setSelectedPrinting(card); // Default to the searched card
      setSetFilterQuery(''); // Clear set filter
    }
  }, [isOpen, card]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (showSetDropdown && !event.target.closest('.set-dropdown-container')) {
        setShowSetDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSetDropdown]);

  async function loadPrintings() {
    try {
      setLoading(true);
      const response = await Cards.prints(card.id);
      setPrintings(response.data || []);
    } catch (error) {
      console.error('Error loading printings:', error);
      setPrintings([card]); // Fallback to original card
    } finally {
      setLoading(false);
    }
  }

  // Get filtered sets based on search query
  function getFilteredSets() {
    if (!printings.length) return [];
    
    const filteredPrintings = printings.filter(printing => 
      printing.set_name.toLowerCase().includes(setFilterQuery.toLowerCase()) ||
      printing.set.toLowerCase().includes(setFilterQuery.toLowerCase())
    );
    
    // Convert to set objects
    const cardSets = filteredPrintings.map(p => p.set);
    const uniqueSets = [...new Set(cardSets)];
    return uniqueSets.map(setCode => {
      const printing = filteredPrintings.find(p => p.set === setCode);
      return {
        id: setCode,
        code: setCode,
        name: printing?.set_name || setCode,
        released_at: printing?.released_at || ''
      };
    });
  }

  function handleSetSelect(set) {
    setSelectedSet(set);
    setSetFilterQuery(set.name);
    setShowSetDropdown(false);
    
    // Find printings from this set
    const setPrintings = printings.filter(p => p.set === set.code);
    if (setPrintings.length > 0) {
      setSelectedPrinting(setPrintings[0]);
    }
  }

  function handlePrintingSelect(printing) {
    setSelectedPrinting(printing);
  }

  async function handleAddToInventory() {
    if (!selectedPrinting) return;

    try {
      setLoading(true);
      
      const printing = {
        id: selectedPrinting.id,
        oracleId: selectedPrinting.oracle_id,
        name: selectedPrinting.name,
        set: selectedPrinting.set,
        collectorNum: String(selectedPrinting.collector_number),
        rarity: selectedPrinting.rarity,
        foil: selectedPrinting.foil || false,
        imageNormal: selectedPrinting.image_uris?.normal || selectedPrinting.card_faces?.[0]?.image_uris?.normal
      };

      await Inventory.add({
        ownerEmail: userEmail,
        printing,
        condition: selectedCondition,
        language: selectedLanguage,
        quantity: quantity
      });

      onCardAdded();
      onClose();
    } catch (error) {
      console.error('Error adding card to inventory:', error);
      alert('Error adding card to inventory');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !card) return null;

  const currentImage = selectedPrinting?.image_uris?.normal || selectedPrinting?.card_faces?.[0]?.image_uris?.normal || card.image_uris?.normal;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20">
        <div className="flex h-full">
          {/* Left side - Card image and basic info */}
          <div className="w-1/3 bg-gradient-to-br from-mtg-blue/10 to-mtg-gold/10 p-6 flex flex-col items-center">
            <div className="w-full max-w-xs mb-4">
              {currentImage && (
                <div className="relative overflow-hidden rounded-xl aspect-[488/680] bg-gradient-to-br from-mtg-blue/10 to-mtg-gold/10">
                  <img 
                    src={currentImage} 
                    alt={selectedPrinting?.name || card.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
            
            <div className="text-center">
              <h3 className="font-bold text-lg text-mtg-black mb-2">
                {selectedPrinting?.name || card.name}
              </h3>
              <div className="flex items-center gap-2 justify-center">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-mtg-blue/10 text-mtg-blue uppercase">
                  {selectedPrinting?.set_name || card.set_name}
                </span>
                <span className="text-xs text-mtg-black/60">
                  #{selectedPrinting?.collector_number || card.collector_number}
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-mtg-black">{t('addCard.title')}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-mtg-black/10 hover:bg-mtg-black/20 flex items-center justify-center transition-colors"
              >
                <span className="text-mtg-black">×</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Condition Selection */}
              <div>
                <label className="block text-sm font-semibold text-mtg-black mb-3">
                  {t('addCard.condition')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CONDITIONS.map(condition => (
                    <button
                      key={condition.value}
                      onClick={() => setSelectedCondition(condition.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedCondition === condition.value
                          ? `border-mtg-blue bg-mtg-blue text-white shadow-lg`
                          : 'border-gray-300 bg-white text-gray-700 hover:border-mtg-blue/50 hover:bg-mtg-blue/5'
                      }`}
                    >
                      <div className="font-medium">{condition.label}</div>
                      <div className="text-xs opacity-80">{condition.value}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-sm font-semibold text-mtg-black mb-3">
                  {t('addCard.language')}
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtg-blue focus:border-mtg-blue bg-white text-gray-900"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-mtg-black mb-3">
                  {t('addCard.quantity')}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-700 font-bold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 p-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtg-blue focus:border-mtg-blue bg-white text-gray-900"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-700 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Set Selection */}
              <div>
                <label className="block text-sm font-semibold text-mtg-black mb-3">
                  {t('addCard.set')}
                </label>
                <div className="relative set-dropdown-container">
                  <button
                    type="button"
                    onClick={() => setShowSetDropdown(!showSetDropdown)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtg-blue focus:border-mtg-blue bg-white text-gray-900 text-left flex items-center justify-between"
                  >
                    <span className={selectedSet ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedSet ? selectedSet.name : t('addCard.setPlaceholder')}
                    </span>
                    <span className="text-gray-400">▼</span>
                  </button>
                  
                  {/* Set dropdown */}
                  {showSetDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {/* Filter input */}
                      <div className="p-2 border-b border-gray-200">
                        <input
                          type="text"
                          value={setFilterQuery}
                          onChange={(e) => setSetFilterQuery(e.target.value)}
                          placeholder="Filter sets..."
                          className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-mtg-blue focus:border-mtg-blue"
                        />
                      </div>
                      
                      {/* Set options */}
                      {getFilteredSets().map(set => (
                        <button
                          key={set.id}
                          onClick={() => handleSetSelect(set)}
                          className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-gray-900"
                        >
                          <div className="font-medium text-gray-900">{set.name}</div>
                          <div className="text-sm text-gray-600">{set.code} • {set.released_at}</div>
                        </button>
                      ))}
                      
                      {getFilteredSets().length === 0 && (
                        <div className="p-3 text-center text-gray-500 text-sm">
                          No sets found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Printing Selection */}
              {printings.length > 1 && (
                <div>
                  <label className="block text-sm font-semibold text-mtg-black mb-3">
                    {t('addCard.printing')}
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg bg-white">
                    {printings.map(printing => (
                      <button
                        key={printing.id}
                        onClick={() => handlePrintingSelect(printing)}
                        className={`w-full p-3 text-left border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                          selectedPrinting?.id === printing.id ? 'bg-mtg-blue/10' : ''
                        } text-gray-900`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{printing.set_name}</div>
                            <div className="text-sm text-gray-600">
                              {printing.collector_number} • {printing.rarity} • {printing.foil ? 'Foil' : 'Non-foil'}
                            </div>
                          </div>
                          {printing.image_uris?.small && (
                            <img 
                              src={printing.image_uris.small} 
                              alt="" 
                              className="w-8 h-11 object-contain rounded"
                            />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddToInventory}
                  disabled={loading || !selectedPrinting}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t('addCard.adding')}
                    </>
                  ) : (
                    <>
                      <span>📦</span>
                      {t('addCard.addToCollection')}
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="btn bg-mtg-black/10 text-mtg-black hover:bg-mtg-black/20 px-6"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
