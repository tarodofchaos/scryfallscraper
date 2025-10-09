import React, { useState, useMemo } from 'react';
import Header from './components/Header.jsx';
import Search from './pages/Search.jsx';
import Inventory from './pages/Inventory.jsx';
import Marketplace from './pages/Marketplace.jsx';

export default function App() {
  const [view, setView] = useState('Search');
  const [user, setUser] = useState(null);
  const Current = useMemo(()=> ({Search, Inventory, Marketplace}[view]), [view]);

  return (
    <div>
      <Header view={view} setView={setView} setUser={setUser} />
      <Current userEmail={user?.email || null} />
      <footer className="max-w-6xl mx-auto p-8 text-xs opacity-70">
        Prices shown come from Scryfall; EUR values typically reflect Cardmarket. Not affiliated with Wizards/Hasbro/Scryfall/MKM.
      </footer>
    </div>
  );
}