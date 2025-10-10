import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SearchBar from '../components/SearchBar.jsx';
import CardGrid from '../components/CardGrid.jsx';
import AddCardModal from '../components/AddCardModal.jsx';
import { Cards } from '../lib/api.js';

export default function Search({ userEmail }) {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalCard, setModalCard] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const iconicCards = [
    'Lightning Bolt',
    'Black Lotus',
    'Ancestral Recall',
    'Time Walk',
    'Mox Pearl',
    'Mox Sapphire',
    'Mox Jet',
    'Mox Ruby',
    'Mox Emerald',
    'Sol Ring',
    'Counterspell',
    'Brainstorm',
    'Force of Will',
    'Jace, the Mind Sculptor',
    'Tarmogoyf'
  ];

  // Dynamic typing effect for placeholder
  useEffect(() => {
    if (q.length > 0) return; // Don't animate if user is typing
    
    const currentCard = iconicCards[placeholderIndex];
    const interval = setInterval(() => {
      setPlaceholder(prev => {
        if (prev.length < currentCard.length) {
          return currentCard.substring(0, prev.length + 1);
        } else {
          // Start erasing after a pause
          setTimeout(() => {
            setPlaceholder(prev => {
              if (prev.length > 0) {
                return prev.substring(0, prev.length - 1);
              } else {
                // Move to next card
                setPlaceholderIndex(prev => (prev + 1) % iconicCards.length);
                return '';
              }
            });
          }, 2000);
          return prev;
        }
      });
    }, 100);

    return () => clearInterval(interval);
  }, [placeholderIndex, q]);

  async function run() {
    setLoading(true);
    try { setResults(await Cards.search(q)); } finally { setLoading(false); }
  }

  function handleAddToInventory(card) {
    setModalCard(card);
    setShowAddModal(true);
  }

  function handleCardAdded() {
    setShowAddModal(false);
    setModalCard(null);
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <SearchBar value={q} onChange={setQ} onSubmit={run} placeholder={placeholder} />
      
      {loading ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-mtg-blue/20 to-mtg-gold/20 flex items-center justify-center animate-pulse">
            <span className="text-2xl">🔍</span>
          </div>
          <p className="text-mtg-white/70 text-lg">{t('search.loading')}</p>
        </div>
      ) : (
        <div className="mt-8">
          <CardGrid results={results} userEmail={userEmail} onAddToInventory={handleAddToInventory} />
        </div>
      )}

      {/* Add Card Modal */}
      <AddCardModal
        card={modalCard}
        userEmail={userEmail}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCardAdded={handleCardAdded}
      />
    </div>
  );
}