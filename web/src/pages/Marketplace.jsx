import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Listings } from '../lib/api.js';
import MyListingsTable from '../components/MyListingsTable.jsx';

export default function Marketplace({ userEmail }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  async function loadAll() {
    const res = await Listings.list();
    setRows(res.listings);
  }

  async function loadMy() {
    if (userEmail) {
      const res = await Listings.my(userEmail);
      setMyListings(res.listings);
    }
  }

  async function load() {
    await loadAll();
    await loadMy();
  }

  async function handleListingDeleted(deletedId) {
    setMyListings(myListings.filter(listing => listing.id !== deletedId));
  }

  useEffect(()=>{ load(); }, [userEmail]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-mtg-white mb-4">
          {t('marketplace.title')}
        </h1>
        <p className="text-mtg-white/70 text-lg">
          {t('marketplace.subtitle')}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'all' 
                ? 'bg-mtg-blue text-white shadow-lg' 
                : 'text-mtg-white/70 hover:text-mtg-white hover:bg-white/10'
            }`}
          >
            All Listings ({rows.length})
          </button>
          {userEmail && (
            <button
              onClick={() => setActiveTab('my')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'my' 
                  ? 'bg-mtg-blue text-white shadow-lg' 
                  : 'text-mtg-white/70 hover:text-mtg-white hover:bg-white/10'
              }`}
            >
              My Listings ({myListings.length})
            </button>
          )}
        </div>
      </div>

      {activeTab === 'my' && userEmail ? (
        <MyListingsTable 
          listings={myListings} 
          userEmail={userEmail} 
          onListingDeleted={handleListingDeleted}
        />
      ) : activeTab === 'all' && rows.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-mtg-blue/20 to-mtg-gold/20 flex items-center justify-center">
            <span className="text-6xl">🏪</span>
          </div>
          <h3 className="text-2xl font-bold text-mtg-white mb-2">{t('marketplace.empty.title')}</h3>
          <p className="text-mtg-white/70 mb-6">{t('marketplace.empty.subtitle')}</p>
          <button 
            onClick={() => window.location.href = '#inventory'}
            className="btn-primary"
          >
            {t('marketplace.empty.action')}
          </button>
        </div>
      ) : activeTab === 'all' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-mtg-white">
              {t('marketplace.available')}
            </h2>
            <div className="text-sm text-mtg-white/70">
              {t('marketplace.listingsCount', { count: rows.length })}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rows.map(r => (
              <div key={r.id} className="card group">
                {/* Card Image */}
                {r.printing.imageNormal && (
                  <div className="relative overflow-hidden rounded-xl mb-4 aspect-[488/680] bg-gradient-to-br from-mtg-blue/10 to-mtg-gold/10">
                    <img 
                      src={r.printing.imageNormal} 
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" 
                      alt={r.printing.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-8 h-8 rounded-full bg-mtg-gold/20 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-mtg-gold text-sm">💰</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Card Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-mtg-black dark:text-mtg-white group-hover:text-mtg-blue transition-colors duration-300">
                      {r.printing.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-mtg-blue/10 text-mtg-blue uppercase">
                        {r.printing.set}
                      </span>
                      <span className="text-xs text-mtg-black/60 dark:text-mtg-white/60">
                        #{r.printing.collectorNum}
                      </span>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-mtg-green">
                        €{Number(r.priceEur).toFixed(2)}
                      </div>
                      <div className="text-xs text-mtg-black/60 dark:text-mtg-white/60">
                        {t('card.available')}: {r.qtyAvailable}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-mtg-black/80 dark:text-mtg-white/80">
                        {t('card.by')} {r.seller.display || r.seller.email}
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Button */}
                  <button className="btn-primary w-full group-hover:shadow-lg transition-all duration-300">
                    <span className="flex items-center justify-center gap-2">
                      <span>{t('card.contactSeller')}</span>
                      <span className="text-lg">💬</span>
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}