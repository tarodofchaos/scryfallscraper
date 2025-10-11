import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

export default function SearchBar({ value, onChange, onSubmit, placeholder }) {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const inputRef = useRef();
  const timeoutRef = useRef();

  async function handleInput(val) {
    onChange(val);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (val.length >= 2) {
      setLoadingSuggestions(true);
      
      // Debounce the API call
      timeoutRef.current = setTimeout(async () => {
        try {
          const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
          const res = await fetch(`${API}/api/card-names?q=${encodeURIComponent(val)}`);
          const names = await res.json();
          setSuggestions(names);
          setShowDropdown(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setLoadingSuggestions(false);
        }
      }, 300); // 300ms debounce
    } else {
      setSuggestions([]);
      setShowDropdown(false);
      setLoadingSuggestions(false);
    }
  }

  function handleSelect(name) {
    onChange(name);
    setShowDropdown(false);
    inputRef.current.focus();
  }

  function handleBlur() {
    setTimeout(() => setShowDropdown(false), 100);
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-mtg-white mb-2">
          {t('search.title')}
        </h1>
        <p className="text-mtg-white/70">
          {t('search.subtitle')}
        </p>
      </div>
      
      <form onSubmit={e=>{e.preventDefault(); onSubmit();}} className="flex gap-3 relative max-w-2xl mx-auto">
        <div className="flex-1 relative">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-mtg-white/50">
              🔍
            </div>
            <input
              ref={inputRef}
              value={value}
              onChange={e=>handleInput(e.target.value)}
              onBlur={handleBlur}
              onFocus={()=>{if(suggestions.length) setShowDropdown(true);}}
              className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-mtg-white placeholder-mtg-white/50 pl-12 pr-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-mtg-blue focus:border-transparent transition-all duration-300"
              placeholder={placeholder}
              autoComplete="off"
              aria-label="Search for Magic: The Gathering cards"
              aria-expanded={showDropdown}
              aria-haspopup="listbox"
              role="combobox"
            />
          </div>
          
          {showDropdown && (
            <ul 
              className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-10 max-h-64 overflow-auto"
              role="listbox"
              aria-label="Search suggestions"
            >
              {loadingSuggestions ? (
                <li className="p-3 text-center text-mtg-black/60">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-mtg-blue border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('search.suggestions.loading')}</span>
                  </div>
                </li>
              ) : suggestions.length > 0 ? (
                suggestions.map(name => (
                  <li 
                    key={name} 
                    className="p-3 cursor-pointer text-mtg-black hover:bg-mtg-blue/10 hover:text-mtg-blue transition-colors duration-200 border-b border-white/10 last:border-b-0" 
                    onMouseDown={()=>handleSelect(name)}
                  >
                    {name}
                  </li>
                ))
              ) : value.length >= 2 && (
                <li className="p-3 text-center text-mtg-black/60">
                  {t('search.suggestions.noResults')}
                </li>
              )}
            </ul>
          )}
        </div>
        <button className="btn-primary px-8 py-4 text-lg font-semibold">
          {t('search.button')}
        </button>
      </form>
    </div>
  );
}

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  placeholder: PropTypes.string
};