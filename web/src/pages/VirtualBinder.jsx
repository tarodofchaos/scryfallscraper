import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Inventory, Cards } from '../lib/api.js';
import PropTypes from 'prop-types';

export default function VirtualBinder({ userEmail }) {
  const { t } = useTranslation();
  const [myCards, setMyCards] = useState([]);
  const [theirCards] = useState([]);
  const [collection, setCollection] = useState([]);
  const [loadingCollection, setLoadingCollection] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  // Calculate trade values
  const myTotalValue = myCards.reduce((sum, card) => sum + (card.price || 0), 0);
  const theirTotalValue = theirCards.reduce((sum, card) => sum + (card.price || 0), 0);
  const tradeDifference = myTotalValue - theirTotalValue;

  // Load user's collection
  const loadCollection = async () => {
    if (!userEmail) return;
    
    setLoadingCollection(true);
    try {
      const response = await Inventory.list(userEmail);
      setCollection(response.items || []);
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoadingCollection(false);
    }
  };

  // Add card to trade binder
  const addCardToTrade = async (collectionItem) => {
    try {
      // Get current price for the card
      const priceResponse = await Cards.prices(collectionItem.printing.id);
      const currentPrice = priceResponse.prices?.eur || 0;
      
      const tradeCard = {
        id: collectionItem.id,
        name: collectionItem.printing.name,
        set: collectionItem.printing.set,
        condition: collectionItem.condition,
        language: collectionItem.language,
        quantity: collectionItem.quantity,
        image: collectionItem.printing.imageNormal,
        price: currentPrice,
        originalItem: collectionItem
      };
      
      setMyCards(prev => [...prev, tradeCard]);
    } catch (error) {
      console.error('Error adding card to trade:', error);
    }
  };

  // Remove card from trade binder
  const removeCardFromTrade = (cardId) => {
    setMyCards(prev => prev.filter(card => card.id !== cardId));
  };

  // Load collection when component mounts
  useEffect(() => {
    loadCollection();
  }, [userEmail]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-mtg-white mb-2">
          {t('virtualBinder.title')}
        </h1>
        <p className="text-mtg-white/70">
          {t('virtualBinder.subtitle')}
        </p>
      </div>

      {/* Trade Summary */}
      <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-2xl font-bold text-mtg-white">
              €{myTotalValue.toFixed(2)}
            </div>
            <div className="text-sm text-mtg-white/70">
              {t('virtualBinder.myValue')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-mtg-white">
              €{theirTotalValue.toFixed(2)}
            </div>
            <div className="text-sm text-mtg-white/70">
              {t('virtualBinder.theirValue')}
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${tradeDifference > 0 ? 'text-mtg-gold' : tradeDifference < 0 ? 'text-red-400' : 'text-mtg-white'}`}>
              {tradeDifference > 0 ? '+' : ''}€{tradeDifference.toFixed(2)}
            </div>
            <div className="text-sm text-mtg-white/70">
              {t('virtualBinder.difference')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Cards Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-mtg-white">
              {t('virtualBinder.myCards')}
            </h2>
            <button 
              className="btn-primary text-sm"
              onClick={() => setShowCollectionModal(true)}
            >
              {t('virtualBinder.addFromCollection')}
            </button>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 min-h-96">
            {myCards.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-mtg-blue/20 to-mtg-gold/20 flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-mtg-white/70">
                  {t('virtualBinder.noMyCards')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {myCards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      {(() => {
                        if (card.image) {
                          return (
                            <img 
                              src={card.image} 
                              alt={card.name}
                              className="w-8 h-10 object-cover rounded"
                            />
                          );
                        }
                        return (
                          <div className="w-8 h-10 bg-gradient-to-br from-mtg-blue/20 to-mtg-gold/20 rounded flex items-center justify-center">
                            <span className="text-xs">🎴</span>
                          </div>
                        );
                      })()}
                      <div>
                        <div className="font-medium text-mtg-white">{card.name}</div>
                        <div className="text-sm text-mtg-white/70">
                          {card.set} • {card.condition} • {card.language} • Qty: {card.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-mtg-gold">€{card.price?.toFixed(2) || '0.00'}</div>
                      <button 
                        className="text-red-400 hover:text-red-300 text-sm"
                        onClick={() => removeCardFromTrade(card.id)}
                      >
                        {t('common.remove')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Their Cards Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-mtg-white">
              {t('virtualBinder.theirCards')}
            </h2>
            <button className="btn-secondary text-sm">
              {t('virtualBinder.searchCards')}
            </button>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 min-h-96">
            {theirCards.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-mtg-blue/20 to-mtg-gold/20 flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
                <p className="text-mtg-white/70">
                  {t('virtualBinder.noTheirCards')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {theirCards.map((card) => (
                  <div key={card.id || card.name} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-10 bg-gradient-to-br from-mtg-blue/20 to-mtg-gold/20 rounded"></div>
                      <div>
                        <div className="font-medium text-mtg-white">{card.name}</div>
                        <div className="text-sm text-mtg-white/70">{card.set}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-mtg-gold">€{card.price?.toFixed(2) || '0.00'}</div>
                      <button className="text-red-400 hover:text-red-300 text-sm">
                        {t('common.remove')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center gap-4">
        <button className="btn-secondary">
          {t('virtualBinder.exportTrade')}
        </button>
        <button className="btn-primary">
          {t('virtualBinder.shareTrade')}
        </button>
      </div>

      {/* Collection Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl border border-white/20 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-mtg-black">
                  {t('virtualBinder.selectFromCollection')}
                </h3>
                <button
                  onClick={() => setShowCollectionModal(false)}
                  className="w-8 h-8 rounded-full bg-mtg-black/10 flex items-center justify-center hover:bg-mtg-black/20 transition-colors text-mtg-black"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {(() => {
                if (loadingCollection) {
                  return (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-mtg-blue/20 to-mtg-gold/20 flex items-center justify-center animate-pulse">
                        <span className="text-2xl">📦</span>
                      </div>
                      <p className="text-mtg-black/70">{t('virtualBinder.loadingCollection')}</p>
                    </div>
                  );
                }
                
                if (collection.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-mtg-blue/20 to-mtg-gold/20 flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                      <p className="text-mtg-black/70">{t('virtualBinder.emptyCollection')}</p>
                    </div>
                  );
                }
                
                return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collection.map((item) => (
                    <div key={item.id} className="bg-white/50 rounded-lg p-4 border border-white/20 hover:bg-white/70 transition-colors">
                      <div className="flex items-start gap-3">
                        {item.printing.imageNormal ? (
                          <img 
                            src={item.printing.imageNormal} 
                            alt={item.printing.name}
                            className="w-12 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-gradient-to-br from-mtg-blue/20 to-mtg-gold/20 rounded flex items-center justify-center">
                            <span className="text-xs">🎴</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-mtg-black truncate">{item.printing.name}</h4>
                          <p className="text-sm text-mtg-black/60">{item.printing.set}</p>
                          <p className="text-xs text-mtg-black/50">
                            {item.condition} • {item.language} • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => addCardToTrade(item)}
                        className="w-full mt-3 btn-primary text-sm"
                        disabled={myCards.some(card => card.id === item.id)}
                      >
                        {(() => {
                          const isAlreadyAdded = myCards.some(card => card.id === item.id);
                          return isAlreadyAdded ? t('virtualBinder.alreadyAdded') : t('virtualBinder.addToTrade');
                        })()}
                      </button>
                    </div>
                  ))}
                </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

VirtualBinder.propTypes = {
  userEmail: PropTypes.string
};
