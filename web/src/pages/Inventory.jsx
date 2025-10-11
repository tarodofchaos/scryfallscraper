import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Inventory as Inv } from '../lib/api.js';
import InventoryTable from '../components/InventoryTable.jsx';
import DeckImport from '../components/DeckImport.jsx';
import DeckImportModal from '../components/DeckImportModal.jsx';
import DeckViewer from '../components/DeckViewer.jsx';
import DeckCard from '../components/DeckCard.jsx';
import DeckListingModal from '../components/DeckListingModal.jsx';

export default function Inventory({ userEmail }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [decks, setDecks] = useState([]);
  const [showDeckImport, setShowDeckImport] = useState(false);
  const [showDeckViewer, setShowDeckViewer] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [showDeckListing, setShowDeckListing] = useState(false);
  const [deckToSell, setDeckToSell] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await Inv.list(userEmail);
      console.log('Inventory loaded for', userEmail, res.items);
      setItems(res.items);
    } finally {
      setLoading(false);
    }
  }

  async function loadDecks() {
    if (!userEmail) return;
    
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API}/api/decks?owner=${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        setDecks(data.decks || []);
      }
    } catch (error) {
      console.error('Failed to load decks:', error);
    }
  }

  async function handleImportComplete() {
    await load();
  }

  async function handleItemDeleted(deletedId) {
    setItems(items.filter(item => item.id !== deletedId));
  }

  async function handleBulkDelete(deletedIds) {
    setItems(items.filter(item => !deletedIds.includes(item.id)));
  }

  async function handleDeckImported() {
    await loadDecks();
  }

  function handleViewDeck(deck) {
    setSelectedDeck(deck);
    setShowDeckViewer(true);
  }

  async function handleDeleteDeck(deckId) {
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API}/api/decks/${deckId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await loadDecks();
      }
    } catch (error) {
      console.error('Failed to delete deck:', error);
    }
  }

  function handleListDeckForSale(deck) {
    setDeckToSell(deck);
    setShowDeckListing(true);
  }

  function handleDeckListingCreated() {
    setShowDeckListing(false);
    setDeckToSell(null);
    // Optionally refresh listings or show success message
  }

  useEffect(()=>{ 
    if (userEmail) {
      load(); 
      loadDecks();
    }
  }, [userEmail]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-mtg-white mb-2">{t('inventory.title')}</h1>
          <p className="text-mtg-white/70">{t('inventory.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeckImport(true)}
            className="btn-primary flex items-center gap-2"
          >
            <span>📦</span>
            <span>{t('inventory.importDeck')}</span>
          </button>
          <DeckImport userEmail={userEmail} onImportComplete={handleImportComplete} />
          <button 
            onClick={load} 
            className="btn-secondary flex items-center gap-2"
          >
            <span>🔄</span>
            <span>{t('inventory.refresh')}</span>
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-mtg-blue/20 to-mtg-gold/20 flex items-center justify-center animate-pulse">
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-mtg-white/70 text-lg">{t('inventory.loading')}</p>
        </div>
      ) : (
        <>
          {/* Decks Section */}
          {decks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-mtg-white mb-4">
                {t('inventory.myDecks')} ({decks.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {decks.map((deck) => (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    onView={handleViewDeck}
                    onDelete={handleDeleteDeck}
                    onListForSale={handleListDeckForSale}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Individual Cards Section */}
          <div>
            <h2 className="text-2xl font-semibold text-mtg-white mb-4">
              {t('inventory.individualCards')} ({items.length})
            </h2>
            <InventoryTable 
              items={items} 
              userEmail={userEmail} 
              onItemDeleted={handleItemDeleted}
              onBulkDelete={handleBulkDelete}
            />
          </div>
        </>
      )}

      {/* Deck Import Modal */}
      <DeckImportModal
        isOpen={showDeckImport}
        onClose={() => setShowDeckImport(false)}
        onDeckImported={handleDeckImported}
        userEmail={userEmail}
      />

      {/* Deck Viewer Modal */}
      <DeckViewer
        deck={selectedDeck}
        isOpen={showDeckViewer}
        onClose={() => setShowDeckViewer(false)}
      />

      {/* Deck Listing Modal */}
      <DeckListingModal
        deck={deckToSell}
        isOpen={showDeckListing}
        onClose={() => setShowDeckListing(false)}
        onListingCreated={handleDeckListingCreated}
      />
    </div>
  );
}

Inventory.propTypes = {
  userEmail: PropTypes.string
};