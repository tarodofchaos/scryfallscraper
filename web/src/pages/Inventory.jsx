import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Inventory as Inv } from '../lib/api.js';
import InventoryTable from '../components/InventoryTable.jsx';
import DeckImport from '../components/DeckImport.jsx';

export default function Inventory({ userEmail }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);

  async function load() {
    const res = await Inv.list(userEmail);
    console.log('Inventory loaded for', userEmail, res.items);
    setItems(res.items);
  }

  async function handleAdd() {
    await load();
  }

  async function handleImportComplete() {
    await load();
  }

  async function handleItemDeleted(deletedId) {
    setItems(items.filter(item => item.id !== deletedId));
  }

  useEffect(()=>{ if (userEmail) load(); }, [userEmail]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-mtg-white mb-2">{t('inventory.title')}</h1>
          <p className="text-mtg-white/70">{t('inventory.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
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
      
      <InventoryTable items={items} userEmail={userEmail} onItemDeleted={handleItemDeleted} />
    </div>
  );
}