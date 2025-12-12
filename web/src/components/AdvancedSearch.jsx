import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Cards } from '../lib/api.js';

export default function AdvancedSearch({ onSearch, onQueryChange }) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    text: '',
    set: '',
    type: '',
    subtype: '',
    colors: [],
    commanderIdentity: [],
    manaCost: '',
    rarity: '',
    language: ''
  });
  const [setSuggestions, setSetSuggestions] = useState([]);
  const [showSetDropdown, setShowSetDropdown] = useState(false);
  const [loadingSets, setLoadingSets] = useState(false);
  const setInputRef = React.useRef(null);
  const timeoutRef = React.useRef(null);

  const colors = [
    { value: 'W', label: 'White', color: 'bg-white' },
    { value: 'U', label: 'Blue', color: 'bg-blue-500' },
    { value: 'B', label: 'Black', color: 'bg-black' },
    { value: 'R', label: 'Red', color: 'bg-red-500' },
    { value: 'G', label: 'Green', color: 'bg-green-500' },
    { value: 'C', label: 'Colorless', color: 'bg-gray-400' }
  ];

  const rarities = [
    { value: 'common', label: 'Common' },
    { value: 'uncommon', label: 'Uncommon' },
    { value: 'rare', label: 'Rare' },
    { value: 'mythic', label: 'Mythic' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'ru', label: 'Russian' },
    { value: 'zhs', label: 'Simplified Chinese' },
    { value: 'zht', label: 'Traditional Chinese' }
  ];

  // Build Scryfall query from filters
  const buildQuery = () => {
    const parts = [];

    if (filters.text) {
      parts.push(`o:"${filters.text}"`);
    }

    if (filters.set) {
      parts.push(`set:${filters.set.toLowerCase()}`);
    }

    if (filters.type) {
      parts.push(`t:${filters.type}`);
    }

    if (filters.subtype) {
      parts.push(`t:${filters.subtype}`);
    }

    if (filters.colors.length > 0) {
      // For multiple colors, join them (e.g., c:wu for white and blue)
      parts.push(`c:${filters.colors.join('').toLowerCase()}`);
    }

    if (filters.commanderIdentity.length > 0) {
      parts.push(`id:${filters.commanderIdentity.join('').toLowerCase()}`);
    }

    if (filters.manaCost) {
      parts.push(`cmc:${filters.manaCost}`);
    }

    if (filters.rarity) {
      parts.push(`r:${filters.rarity}`);
    }

    if (filters.language) {
      parts.push(`lang:${filters.language}`);
    }

    return parts.join(' ');
  };

  // Update query when filters change
  useEffect(() => {
    const query = buildQuery();
    onQueryChange(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Handle set search
  const handleSetInput = async (value) => {
    setFilters(prev => ({ ...prev, set: value }));
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.length >= 2) {
      setLoadingSets(true);
      timeoutRef.current = setTimeout(async () => {
        try {
          const results = await Cards.searchSets(value);
          setSetSuggestions(results.data || []);
          setShowSetDropdown(true);
        } catch (error) {
          console.error('Error fetching sets:', error);
          setSetSuggestions([]);
        } finally {
          setLoadingSets(false);
        }
      }, 300);
    } else {
      setSetSuggestions([]);
      setShowSetDropdown(false);
    }
  };

  const handleSetSelect = (setCode) => {
    setFilters(prev => ({ ...prev, set: setCode }));
    setShowSetDropdown(false);
    if (setInputRef.current) {
      setInputRef.current.blur();
    }
  };

  const toggleColor = (color) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const toggleCommanderIdentity = (color) => {
    setFilters(prev => ({
      ...prev,
      commanderIdentity: prev.commanderIdentity.includes(color)
        ? prev.commanderIdentity.filter(c => c !== color)
        : [...prev.commanderIdentity, color]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = buildQuery();
    if (query.trim()) {
      onSearch();
    }
  };

  const handleReset = () => {
    setFilters({
      text: '',
      set: '',
      type: '',
      subtype: '',
      colors: [],
      commanderIdentity: [],
      manaCost: '',
      rarity: '',
      language: ''
    });
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-mtg-white mb-4">
          {t('advancedSearch.filters')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Text in Card */}
          <div>
            <label className="block text-sm font-medium text-mtg-white/80 mb-2">
              {t('advancedSearch.textInCard')}
            </label>
            <input
              type="text"
              value={filters.text}
              onChange={(e) => setFilters(prev => ({ ...prev, text: e.target.value }))}
              placeholder={t('advancedSearch.textInCardPlaceholder')}
              className="w-full rounded-lg bg-white/10 border border-white/20 text-mtg-white placeholder-mtg-white/50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mtg-blue"
            />
          </div>

          {/* Set */}
          <div className="relative">
            <label className="block text-sm font-medium text-mtg-white/80 mb-2">
              {t('advancedSearch.set')}
            </label>
            <input
              ref={setInputRef}
              type="text"
              value={filters.set}
              onChange={(e) => handleSetInput(e.target.value)}
              onFocus={() => setShowSetDropdown(setSuggestions.length > 0)}
              onBlur={() => setTimeout(() => setShowSetDropdown(false), 200)}
              placeholder={t('advancedSearch.setPlaceholder')}
              className="w-full rounded-lg bg-white/10 border border-white/20 text-mtg-white placeholder-mtg-white/50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mtg-blue"
            />
            {showSetDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white/95 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl max-h-64 overflow-auto">
                {loadingSets ? (
                  <div className="p-3 text-center text-mtg-black/60">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-mtg-blue border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('common.loading')}</span>
                    </div>
                  </div>
                ) : setSuggestions.length > 0 ? (
                  setSuggestions.map(set => (
                    <div
                      key={set.code}
                      className="p-3 cursor-pointer text-mtg-black hover:bg-mtg-blue/10 hover:text-mtg-blue transition-colors border-b border-white/10 last:border-b-0"
                      onMouseDown={() => handleSetSelect(set.code)}
                    >
                      <div className="font-medium">{set.name}</div>
                      <div className="text-sm text-mtg-black/60">{set.code.toUpperCase()}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-mtg-black/60">
                    {t('search.suggestions.noResults')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-mtg-white/80 mb-2">
              {t('advancedSearch.type')}
            </label>
            <input
              type="text"
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              placeholder={t('advancedSearch.typePlaceholder')}
              className="w-full rounded-lg bg-white/10 border border-white/20 text-mtg-white placeholder-mtg-white/50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mtg-blue"
            />
          </div>

          {/* Subtype */}
          <div>
            <label className="block text-sm font-medium text-mtg-white/80 mb-2">
              {t('advancedSearch.subtype')}
            </label>
            <input
              type="text"
              value={filters.subtype}
              onChange={(e) => setFilters(prev => ({ ...prev, subtype: e.target.value }))}
              placeholder={t('advancedSearch.subtypePlaceholder')}
              className="w-full rounded-lg bg-white/10 border border-white/20 text-mtg-white placeholder-mtg-white/50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mtg-blue"
            />
          </div>

          {/* Mana Cost */}
          <div>
            <label className="block text-sm font-medium text-mtg-white/80 mb-2">
              {t('advancedSearch.manaCost')}
            </label>
            <input
              type="number"
              min="0"
              value={filters.manaCost}
              onChange={(e) => setFilters(prev => ({ ...prev, manaCost: e.target.value }))}
              placeholder={t('advancedSearch.manaCostPlaceholder')}
              className="w-full rounded-lg bg-white/10 border border-white/20 text-mtg-white placeholder-mtg-white/50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mtg-blue"
            />
          </div>

          {/* Rarity */}
          <div>
            <label className="block text-sm font-medium text-mtg-white/80 mb-2">
              {t('advancedSearch.rarity')}
            </label>
            <select
              value={filters.rarity}
              onChange={(e) => setFilters(prev => ({ ...prev, rarity: e.target.value }))}
              className="w-full rounded-lg bg-white/10 border border-white/20 text-mtg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mtg-blue"
            >
              <option value="">{t('advancedSearch.rarityPlaceholder')}</option>
              {rarities.map(rarity => (
                <option key={rarity.value} value={rarity.value} className="bg-gray-800">
                  {rarity.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-mtg-white/80 mb-2">
              {t('advancedSearch.language')}
            </label>
            <select
              value={filters.language}
              onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
              className="w-full rounded-lg bg-white/10 border border-white/20 text-mtg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mtg-blue"
            >
              <option value="">{t('advancedSearch.languagePlaceholder')}</option>
              {languages.map(lang => (
                <option key={lang.value} value={lang.value} className="bg-gray-800">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Colors */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-mtg-white/80 mb-2">
            {t('advancedSearch.colors')}
          </label>
          <div className="flex flex-wrap gap-2">
            {colors.map(color => (
              <button
                key={color.value}
                type="button"
                onClick={() => toggleColor(color.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filters.colors.includes(color.value)
                    ? 'bg-mtg-blue text-white shadow-lg'
                    : 'bg-white/10 text-mtg-white/80 hover:bg-white/20'
                }`}
              >
                {color.label}
              </button>
            ))}
          </div>
        </div>

        {/* Commander Color Identity */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-mtg-white/80 mb-2">
            {t('advancedSearch.commanderIdentity')}
          </label>
          <div className="flex flex-wrap gap-2">
            {colors.map(color => (
              <button
                key={color.value}
                type="button"
                onClick={() => toggleCommanderIdentity(color.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filters.commanderIdentity.includes(color.value)
                    ? 'bg-mtg-gold text-white shadow-lg'
                    : 'bg-white/10 text-mtg-white/80 hover:bg-white/20'
                }`}
              >
                {color.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            className="btn-primary flex-1"
          >
            {t('search.button')}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 rounded-lg bg-white/10 text-mtg-white hover:bg-white/20 transition-colors"
          >
            {t('advancedSearch.reset')}
          </button>
        </div>
      </div>
    </form>
  );
}

AdvancedSearch.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onQueryChange: PropTypes.func.isRequired
};

