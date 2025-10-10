import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './components/Header.jsx';
import Search from './pages/Search.jsx';
import Inventory from './pages/Inventory.jsx';
import Marketplace from './pages/Marketplace.jsx';

export default function App() {
  const { t } = useTranslation();
  const [view, setView] = useState('Search');
  const [user, setUser] = useState(null);
  const Current = useMemo(()=> ({Search, Inventory, Marketplace}[view]), [view]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header view={view} setView={setView} setUser={setUser} />
      <main className="flex-1">
        <Current userEmail={user?.email || null} />
      </main>
      <footer className="bg-white/5 backdrop-blur-sm border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto p-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full mtg-gradient flex items-center justify-center">
                <span className="text-white font-bold">⚡</span>
              </div>
              <span className="text-lg font-bold text-mtg-white">{t('app.title')}</span>
            </div>
            <p className="text-mtg-white/60 text-sm max-w-2xl mx-auto">
              {t('footer.disclaimer')}
            </p>
            <div className="mt-4 text-xs text-mtg-white/50">
              {t('footer.copyright')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}