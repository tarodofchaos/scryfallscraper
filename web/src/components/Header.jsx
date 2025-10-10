import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const Header = ({ setUser, setView, view }) => {
  const { t } = useTranslation();
  const [localUser, setLocalUser] = useState(null);
  const inventoryBtnRef = useRef();

  useEffect(() => {
    fetch('http://localhost:4000/api/me', {
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.ok) {
          setLocalUser(data.user);
          setUser && setUser(data.user);
        } else {
          setLocalUser(null);
          setUser && setUser(null);
        }
      });
  }, [setUser]);

  function handleGoogleLogin() {
    window.location.href = 'http://localhost:4000/auth/google';
  }

  function handleLogout() {
    window.location.href = 'http://localhost:4000/logout';
  }

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full mtg-gradient flex items-center justify-center animate-float">
                <span className="text-2xl font-bold text-white">⚡</span>
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
              { key: 'Marketplace', translation: 'nav.marketplace' }
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
                >
                  {t('auth.logout')}
                </button>
              </>
            ) : (
              <button 
                className="btn-primary text-sm" 
                onClick={handleGoogleLogin}
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
            { key: 'Marketplace', translation: 'nav.marketplace' }
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

export default Header;