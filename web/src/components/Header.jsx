import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const Header = ({ setUser, setView, view }) => {
  const { t } = useTranslation();
  const [localUser, setLocalUser] = useState(null);
  const [currentManaSymbol, setCurrentManaSymbol] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isMorphing, setIsMorphing] = useState(false);
  const inventoryBtnRef = useRef();

  // Mana symbols in WUBRG + Colorless order with local SVG assets
  const manaSymbols = [
    { symbol: 'W', name: 'White', svg: '/src/assets/mana-symbols/W.svg' },
    { symbol: 'U', name: 'Blue', svg: '/src/assets/mana-symbols/U.svg' },
    { symbol: 'B', name: 'Black', svg: '/src/assets/mana-symbols/B.svg' },
    { symbol: 'R', name: 'Red', svg: '/src/assets/mana-symbols/R.svg' },
    { symbol: 'G', name: 'Green', svg: '/src/assets/mana-symbols/G.svg' },
    { symbol: 'C', name: 'Colorless', svg: '/src/assets/mana-symbols/C.svg' }
  ];

  // Helper function to get mana symbol gradient
  const getManaGradient = (symbolIndex) => {
    const gradients = [
      'linear-gradient(135deg, #f8f9fa, #e9ecef)', // White
      'linear-gradient(135deg, #0d6efd, #0b5ed7)', // Blue
      'linear-gradient(135deg, #212529, #495057)', // Black
      'linear-gradient(135deg, #dc3545, #b02a37)', // Red
      'linear-gradient(135deg, #198754, #146c43)', // Green
      'linear-gradient(135deg, #6c757d, #495057)'  // Colorless (Gray)
    ];
    return gradients[symbolIndex] || gradients[5]; // Default to colorless
  };

  // Cycle through mana symbols with morphing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsMorphing(true);
      
      // Start morphing animation
      setTimeout(() => {
        setCurrentManaSymbol(prev => (prev + 1) % manaSymbols.length);
      }, 300); // Half of the morphing duration
      
      // End morphing animation
      setTimeout(() => {
        setIsMorphing(false);
      }, 600); // Full morphing duration
    }, 3000); // Change every 3 seconds (longer to see the morphing)

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    fetch(`${API}/api/me`, {
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.ok) {
          setLocalUser(data.user);
          setUser?.(data.user);
        } else {
          setLocalUser(null);
          setUser?.(null);
        }
      });
  }, [setUser]);

  function handleGoogleLogin() {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    window.location.href = `${API}/auth/google`;
  }

  function handleLogout() {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    window.location.href = `${API}/logout`;
  }

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center animate-float transition-all duration-500 hover:scale-110 ${
                  isMorphing ? 'animate-mana-morph animate-mana-glow' : ''
                }`}
                style={{
                  background: getManaGradient(currentManaSymbol),
                  transform: `rotate(${currentManaSymbol * 60}deg)`, // 60 degrees per color (360/6)
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}
              >
                {imageError ? (
                  <span className="text-2xl font-bold text-white drop-shadow-lg">
                    {manaSymbols[currentManaSymbol].symbol}
                  </span>
                ) : (
                  <img 
                    src={manaSymbols[currentManaSymbol].svg}
                    alt={manaSymbols[currentManaSymbol].name}
                    className="w-8 h-8 drop-shadow-lg transition-all duration-300"
                    onError={() => setImageError(true)}
                  />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-mtg-blue via-mtg-gold to-mtg-red bg-clip-text text-transparent">
                  {t('app.title')}
                </h1>
                <p className="text-sm text-mtg-white/70">{t('app.tagline')}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { key: 'Search', translation: 'nav.search' },
              { key: 'Inventory', translation: 'nav.inventory' },
              { key: 'Marketplace', translation: 'nav.marketplace' },
              { key: 'VirtualBinder', translation: 'nav.virtualBinder' }
            ].map(({ key, translation }) => (
              <button
                key={key}
                ref={key === 'Inventory' ? inventoryBtnRef : null}
                onClick={() => setView(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  view === key 
                    ? 'bg-gradient-to-r from-mtg-blue to-blue-600 text-white shadow-lg' 
                    : 'text-mtg-white/80 hover:text-mtg-white hover:bg-white/10'
                }`}
                id={key === 'Inventory' ? 'inventory-btn' : undefined}
                aria-label={`Navigate to ${key} page`}
                aria-current={view === key ? 'page' : undefined}
              >
                {t(translation)}
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {localUser ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-mtg-blue to-mtg-gold flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {(localUser.display || localUser.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-mtg-white">
                    {localUser.display || localUser.email}
                  </span>
                </div>
                <button 
                  className="btn-danger text-sm" 
                  onClick={handleLogout}
                  aria-label="Logout from your account"
                >
                  {t('auth.logout')}
                </button>
              </>
            ) : (
              <button 
                className="btn-primary text-sm" 
                onClick={handleGoogleLogin}
                aria-label="Login with Google account"
              >
                {t('auth.login')}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-4 flex gap-2">
          {[
            { key: 'Search', translation: 'nav.search' },
            { key: 'Inventory', translation: 'nav.inventory' },
            { key: 'Marketplace', translation: 'nav.marketplace' },
            { key: 'VirtualBinder', translation: 'nav.virtualBinder' }
          ].map(({ key, translation }) => (
            <button
              key={key}
              ref={key === 'Inventory' ? inventoryBtnRef : null}
              onClick={() => setView(key)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                view === key 
                  ? 'bg-gradient-to-r from-mtg-blue to-blue-600 text-white shadow-lg' 
                  : 'text-mtg-white/80 hover:text-mtg-white hover:bg-white/10'
              }`}
              id={key === 'Inventory' ? 'inventory-btn' : undefined}
            >
              {t(translation)}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

Header.propTypes = {
  setUser: PropTypes.func.isRequired,
  setView: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired
};

export default Header;