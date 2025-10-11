import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Inventory, Cards } from '../lib/api.js';
import PropTypes from 'prop-types';

export default function VirtualBinder({ userEmail }) {
  const { t } = useTranslation();
  const [myCards, setMyCards] = useState([]);
  const [theirCards, setTheirCards] = useState([]);
  const [collection, setCollection] = useState([]);
  const [loadingCollection, setLoadingCollection] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [refreshingPrices, setRefreshingPrices] = useState(false);
  const [priceHistory, setPriceHistory] = useState({});
  const [showTradeAnalysis, setShowTradeAnalysis] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('text');
  const [exportUrl, setExportUrl] = useState('');

  // Calculate trade values
  const myTotalValue = myCards.reduce((sum, card) => {
    const price = parseFloat(card.price) || 0;
    return sum + price;
  }, 0);
  const theirTotalValue = theirCards.reduce((sum, card) => {
    const price = parseFloat(card.price) || 0;
    return sum + price;
  }, 0);

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

  // Search for cards
  const searchCards = async (query) => {
    if (!query.trim()) return;
    
    setLoadingSearch(true);
    try {
      const response = await Cards.search(query);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Error searching cards:', error);
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Add card to their side
  const addCardToTheirSide = async (card) => {
    try {
      // Get current price for the card
      const priceResponse = await Cards.prices(card.id);
      const currentPrice = priceResponse.prices?.eur || 0;
      
      const tradeCard = {
        id: card.id,
        name: card.name,
        set: card.set,
        condition: 'NM', // Default condition
        language: 'EN', // Default language
        quantity: 1, // Default quantity
        image: card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal,
        price: currentPrice,
        originalCard: card
      };
      
      setTheirCards(prev => [...prev, tradeCard]);
    } catch (error) {
      console.error('Error adding card to their side:', error);
    }
  };

  // Remove card from their side
  const removeCardFromTheirSide = (cardId) => {
    setTheirCards(prev => prev.filter(card => card.id !== cardId));
  };

  // Refresh prices for all cards
  const refreshAllPrices = async () => {
    setRefreshingPrices(true);
    try {
      // Refresh my cards prices
      const updatedMyCards = await Promise.all(
        myCards.map(async (card) => {
          try {
            const priceResponse = await Cards.prices(card.originalItem?.printing?.id || card.originalCard?.id || card.id);
            const newPrice = priceResponse.prices?.eur || 0;
            
            // Store price history
            setPriceHistory(prev => ({
              ...prev,
              [card.id]: {
                ...prev[card.id],
                previous: prev[card.id]?.current || card.price,
                current: newPrice,
                updated: new Date().toISOString()
              }
            }));
            
            return { ...card, price: newPrice };
          } catch (error) {
            console.error(`Error refreshing price for ${card.name}:`, error);
            return card; // Keep original price if refresh fails
          }
        })
      );
      setMyCards(updatedMyCards);

      // Refresh their cards prices
      const updatedTheirCards = await Promise.all(
        theirCards.map(async (card) => {
          try {
            const priceResponse = await Cards.prices(card.originalCard?.id || card.id);
            const newPrice = priceResponse.prices?.eur || 0;
            
            // Store price history
            setPriceHistory(prev => ({
              ...prev,
              [card.id]: {
                ...prev[card.id],
                previous: prev[card.id]?.current || card.price,
                current: newPrice,
                updated: new Date().toISOString()
              }
            }));
            
            return { ...card, price: newPrice };
          } catch (error) {
            console.error(`Error refreshing price for ${card.name}:`, error);
            return card; // Keep original price if refresh fails
          }
        })
      );
      setTheirCards(updatedTheirCards);
    } catch (error) {
      console.error('Error refreshing prices:', error);
    } finally {
      setRefreshingPrices(false);
    }
  };

  // Get price change indicator
  const getPriceChange = (cardId) => {
    const history = priceHistory[cardId];
    if (!history || !history.previous) return null;
    
    const change = history.current - history.previous;
    const percentChange = (change / history.previous) * 100;
    
    return {
      change,
      percentChange,
      isPositive: change > 0,
      isNegative: change < 0
    };
  };

  // Advanced trade calculations
  const getTradeAnalysis = () => {
    const myValue = myTotalValue;
    const theirValue = theirTotalValue;
    const difference = myValue - theirValue;
    const percentDifference = theirValue > 0 ? (difference / theirValue) * 100 : 0;
    
    // Trade fairness analysis
    const isFair = Math.abs(percentDifference) <= 10; // Within 10% is considered fair
    const isFavorableToMe = difference > 0;
    const isFavorableToThem = difference < 0;
    
    // Get trade recommendations
    const getTradeRecommendation = () => {
      if (myCards.length === 0 && theirCards.length === 0) {
        return { type: 'empty', message: t('virtualBinder.analysis.empty') };
      }
      if (myCards.length === 0) {
        return { type: 'warning', message: t('virtualBinder.analysis.noMyCards') };
      }
      if (theirCards.length === 0) {
        return { type: 'warning', message: t('virtualBinder.analysis.noTheirCards') };
      }
      if (isFair) {
        return { type: 'success', message: t('virtualBinder.analysis.fair') };
      }
      if (isFavorableToMe) {
        return { 
          type: 'info', 
          message: t('virtualBinder.analysis.favorableToMe', { percent: Math.abs(percentDifference).toFixed(1) })
        };
      }
      if (isFavorableToThem) {
        return { 
          type: 'warning', 
          message: t('virtualBinder.analysis.favorableToThem', { percent: Math.abs(percentDifference).toFixed(1) })
        };
      }
      return { type: 'neutral', message: t('virtualBinder.analysis.neutral') };
    };

    // Get condition analysis
    const getConditionAnalysis = () => {
      const myConditions = myCards.map(card => card.condition);
      const theirConditions = theirCards.map(card => card.condition);
      
      const conditionValues = { 'NM': 1.0, 'LP': 0.8, 'MP': 0.6, 'HP': 0.4, 'DMG': 0.2 };
      
      const myAvgCondition = myConditions.length > 0 
        ? myConditions.reduce((sum, cond) => sum + (conditionValues[cond] || 1), 0) / myConditions.length 
        : 0;
      
      const theirAvgCondition = theirConditions.length > 0 
        ? theirConditions.reduce((sum, cond) => sum + (conditionValues[cond] || 1), 0) / theirConditions.length 
        : 0;

      return {
        myAvgCondition,
        theirAvgCondition,
        conditionDifference: myAvgCondition - theirAvgCondition,
        myConditionCounts: myConditions.reduce((acc, cond) => ({ ...acc, [cond]: (acc[cond] || 0) + 1 }), {}),
        theirConditionCounts: theirConditions.reduce((acc, cond) => ({ ...acc, [cond]: (acc[cond] || 0) + 1 }), {})
      };
    };

    return {
      myValue,
      theirValue,
      difference,
      percentDifference,
      isFair,
      isFavorableToMe,
      isFavorableToThem,
      recommendation: getTradeRecommendation(),
      conditionAnalysis: getConditionAnalysis(),
      totalCards: myCards.length + theirCards.length,
      myCardCount: myCards.length,
      theirCardCount: theirCards.length
    };
  };

  const tradeAnalysis = getTradeAnalysis();

  // Export functionality
  const generateTradeText = () => {
    const myCardsList = myCards.map(card => 
      `• ${card.name} (${card.set}) - ${card.condition} - €${(parseFloat(card.price) || 0).toFixed(2)}`
    ).join('\n');
    
    const theirCardsList = theirCards.map(card => 
      `• ${card.name} (${card.set}) - ${card.condition} - €${(parseFloat(card.price) || 0).toFixed(2)}`
    ).join('\n');

    return `${t('virtualBinder.export.title')}

${t('virtualBinder.export.myCards')} (€${tradeAnalysis.myValue.toFixed(2)}):
${myCardsList}

${t('virtualBinder.export.theirCards')} (€${tradeAnalysis.theirValue.toFixed(2)}):
${theirCardsList}

${t('virtualBinder.export.summary')}:
${t('virtualBinder.export.myTotal')}: €${tradeAnalysis.myValue.toFixed(2)}
${t('virtualBinder.export.theirTotal')}: €${tradeAnalysis.theirValue.toFixed(2)}
${t('virtualBinder.export.difference')}: ${tradeAnalysis.difference > 0 ? '+' : ''}€${tradeAnalysis.difference.toFixed(2)} (${tradeAnalysis.percentDifference > 0 ? '+' : ''}${tradeAnalysis.percentDifference.toFixed(1)}%)

${t('virtualBinder.export.generated')}: ${new Date().toLocaleString()}`;
  };

  const generateTradeJSON = () => {
    return {
      trade: {
        myCards: myCards.map(card => ({
          name: card.name,
          set: card.set,
          condition: card.condition,
          language: card.language,
          quantity: card.quantity,
          price: parseFloat(card.price) || 0,
          imageUrl: card.imageUrl
        })),
        theirCards: theirCards.map(card => ({
          name: card.name,
          set: card.set,
          condition: card.condition,
          language: card.language,
          quantity: card.quantity,
          price: parseFloat(card.price) || 0,
          imageUrl: card.imageUrl
        })),
        analysis: {
          myValue: tradeAnalysis.myValue,
          theirValue: tradeAnalysis.theirValue,
          difference: tradeAnalysis.difference,
          percentDifference: tradeAnalysis.percentDifference,
          isFair: tradeAnalysis.isFair,
          recommendation: tradeAnalysis.recommendation,
          conditionAnalysis: tradeAnalysis.conditionAnalysis
        },
        generated: new Date().toISOString()
      }
    };
  };

  const handleExport = () => {
    if (exportFormat === 'text') {
      const text = generateTradeText();
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trade-proposal-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'json') {
      const json = generateTradeJSON();
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trade-proposal-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'url') {
      const tradeData = generateTradeJSON();
      const encodedData = encodeURIComponent(JSON.stringify(tradeData));
      const url = `${window.location.origin}${window.location.pathname}?trade=${encodedData}`;
      setExportUrl(url);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-mtg-white">
            {t('virtualBinder.tradeSummary')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={refreshAllPrices}
              disabled={refreshingPrices || (myCards.length === 0 && theirCards.length === 0)}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              {refreshingPrices ? (
                <>
                  <div className="w-4 h-4 border-2 border-mtg-white border-t-transparent rounded-full animate-spin"></div>
                  {t('virtualBinder.refreshing')}
                </>
              ) : (
                <>
                  <span>🔄</span>
                  {t('virtualBinder.refreshPrices')}
                </>
              )}
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <span>📤</span>
              {t('virtualBinder.exportTrade')}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-2xl font-bold text-mtg-white">
              €{(tradeAnalysis.myValue || 0).toFixed(2)}
            </div>
            <div className="text-sm text-mtg-white/70">
              {t('virtualBinder.myValue')} ({tradeAnalysis.myCardCount} {t('virtualBinder.cards')})
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${tradeAnalysis.difference > 0 ? 'text-mtg-gold' : tradeAnalysis.difference < 0 ? 'text-red-400' : 'text-mtg-white'}`}>
              {tradeAnalysis.difference > 0 ? '+' : ''}€{(tradeAnalysis.difference || 0).toFixed(2)}
            </div>
            <div className="text-sm text-mtg-white/70">
              {t('virtualBinder.difference')} ({tradeAnalysis.percentDifference > 0 ? '+' : ''}{tradeAnalysis.percentDifference.toFixed(1)}%)
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-mtg-white">
              €{(tradeAnalysis.theirValue || 0).toFixed(2)}
            </div>
            <div className="text-sm text-mtg-white/70">
              {t('virtualBinder.theirValue')} ({tradeAnalysis.theirCardCount} {t('virtualBinder.cards')})
            </div>
          </div>
        </div>
        
        {/* Trade Analysis */}
        {tradeAnalysis.totalCards > 0 && (
          <div className="mt-4 p-3 rounded-lg border border-white/20 bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-mtg-white">
                {t('virtualBinder.tradeAnalysis')}
              </span>
              <button
                onClick={() => setShowTradeAnalysis(!showTradeAnalysis)}
                className="text-xs text-mtg-white/70 hover:text-mtg-white transition-colors"
              >
                {showTradeAnalysis ? t('common.hide') : t('common.show')} {t('virtualBinder.details')}
              </button>
            </div>
            
            {/* Trade Recommendation */}
            <div className={`flex items-center gap-2 p-2 rounded-lg ${
              tradeAnalysis.recommendation.type === 'success' ? 'bg-green-500/20 text-green-300' :
              tradeAnalysis.recommendation.type === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
              tradeAnalysis.recommendation.type === 'info' ? 'bg-blue-500/20 text-blue-300' :
              'bg-mtg-white/10 text-mtg-white'
            }`}>
              <span className="text-sm">
                {tradeAnalysis.recommendation.type === 'success' ? '✅' :
                 tradeAnalysis.recommendation.type === 'warning' ? '⚠️' :
                 tradeAnalysis.recommendation.type === 'info' ? 'ℹ️' : '📊'}
              </span>
              <span className="text-sm">{tradeAnalysis.recommendation.message}</span>
            </div>
            
            {/* Detailed Analysis */}
            {showTradeAnalysis && (
              <div className="mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-mtg-white/70">{t('virtualBinder.analysis.myAvgCondition')}</div>
                    <div className="text-mtg-white">
                      {tradeAnalysis.conditionAnalysis.myAvgCondition.toFixed(1)}/1.0
                    </div>
                  </div>
                  <div>
                    <div className="text-mtg-white/70">{t('virtualBinder.analysis.theirAvgCondition')}</div>
                    <div className="text-mtg-white">
                      {tradeAnalysis.conditionAnalysis.theirAvgCondition.toFixed(1)}/1.0
                    </div>
                  </div>
                </div>
                
                {tradeAnalysis.isFair && (
                  <div className="text-xs text-green-300 bg-green-500/10 p-2 rounded">
                    ✅ {t('virtualBinder.analysis.fairTrade')}
                  </div>
                )}
                
                {Math.abs(tradeAnalysis.percentDifference) > 10 && (
                  <div className="text-xs text-yellow-300 bg-yellow-500/10 p-2 rounded">
                    ⚠️ {t('virtualBinder.analysis.largeDifference')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
                      <div className="font-bold text-mtg-gold">€{(parseFloat(card.price) || 0).toFixed(2)}</div>
                      {(() => {
                        const priceChange = getPriceChange(card.id);
                        if (priceChange) {
                          return (
                            <div className={`text-xs ${priceChange.isPositive ? 'text-green-400' : priceChange.isNegative ? 'text-red-400' : 'text-mtg-white/70'}`}>
                              {priceChange.isPositive ? '+' : ''}€{priceChange.change.toFixed(2)} ({priceChange.percentChange.toFixed(1)}%)
                            </div>
                          );
                        }
                        return null;
                      })()}
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
            <button 
              className="btn-secondary text-sm"
              onClick={() => setShowSearchModal(true)}
            >
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
                  <div key={card.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      {card.image ? (
                        <img 
                          src={card.image} 
                          alt={card.name}
                          className="w-8 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-8 h-10 bg-gradient-to-br from-mtg-blue/20 to-mtg-gold/20 rounded flex items-center justify-center">
                          <span className="text-xs">🎴</span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-mtg-white">{card.name}</div>
                        <div className="text-sm text-mtg-white/70">
                          {card.set} • {card.condition} • {card.language} • Qty: {card.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-mtg-gold">€{(parseFloat(card.price) || 0).toFixed(2)}</div>
                      {(() => {
                        const priceChange = getPriceChange(card.id);
                        if (priceChange) {
                          return (
                            <div className={`text-xs ${priceChange.isPositive ? 'text-green-400' : priceChange.isNegative ? 'text-red-400' : 'text-mtg-white/70'}`}>
                              {priceChange.isPositive ? '+' : ''}€{priceChange.change.toFixed(2)} ({priceChange.percentChange.toFixed(1)}%)
                            </div>
                          );
                        }
                        return null;
                      })()}
                      <button 
                        className="text-red-400 hover:text-red-300 text-sm"
                        onClick={() => removeCardFromTheirSide(card.id)}
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

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl border border-white/20 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-mtg-black">
                  {t('virtualBinder.searchForCards')}
                </h3>
                <button
                  onClick={() => {
                    setShowSearchModal(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="w-8 h-8 rounded-full bg-mtg-black/10 flex items-center justify-center hover:bg-mtg-black/20 transition-colors text-mtg-black"
                >
                  ✕
                </button>
              </div>
              
              {/* Search Input */}
              <div className="mt-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-mtg-black/50">
                    🔍
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        searchCards(searchQuery);
                      }
                    }}
                    placeholder={t('virtualBinder.searchPlaceholder')}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtg-blue focus:border-mtg-blue bg-white text-gray-900"
                  />
                </div>
                <button
                  onClick={() => searchCards(searchQuery)}
                  disabled={!searchQuery.trim() || loadingSearch}
                  className="mt-3 btn-primary w-full"
                >
                  {loadingSearch ? t('virtualBinder.searching') : t('virtualBinder.search')}
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {loadingSearch ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-mtg-blue/20 to-mtg-gold/20 flex items-center justify-center animate-pulse">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <p className="text-mtg-black/70">{t('virtualBinder.searching')}</p>
                </div>
              ) : searchResults.length === 0 && searchQuery ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-mtg-blue/20 to-mtg-gold/20 flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <p className="text-mtg-black/70">{t('virtualBinder.noSearchResults')}</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((card) => (
                    <div key={card.id} className="bg-white/50 rounded-lg p-4 border border-white/20 hover:bg-white/70 transition-colors">
                      <div className="flex items-start gap-3">
                        {card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal ? (
                          <img 
                            src={card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal} 
                            alt={card.name}
                            className="w-12 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-gradient-to-br from-mtg-blue/20 to-mtg-gold/20 rounded flex items-center justify-center">
                            <span className="text-xs">🎴</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-mtg-black truncate">{card.name}</h4>
                          <p className="text-sm text-mtg-black/60">{card.set_name} ({card.set})</p>
                          <p className="text-xs text-mtg-black/50">
                            {card.rarity} • {card.type_line}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => addCardToTheirSide(card)}
                        className="w-full mt-3 btn-primary text-sm"
                        disabled={theirCards.some(tc => tc.id === card.id)}
                      >
                        {(() => {
                          const isAlreadyAdded = theirCards.some(tc => tc.id === card.id);
                          return isAlreadyAdded ? t('virtualBinder.alreadyAdded') : t('virtualBinder.addToTheirSide');
                        })()}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-mtg-blue/20 to-mtg-gold/20 flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <p className="text-mtg-black/70">{t('virtualBinder.searchPrompt')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-mtg-black border border-white/20 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-mtg-white">
                {t('virtualBinder.export.title')}
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-mtg-white/70 hover:text-mtg-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-mtg-white mb-2">
                  {t('virtualBinder.export.format')}
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-mtg-white"
                >
                  <option value="text">{t('virtualBinder.export.textFormat')}</option>
                  <option value="json">{t('virtualBinder.export.jsonFormat')}</option>
                  <option value="url">{t('virtualBinder.export.urlFormat')}</option>
                </select>
              </div>
              
              {exportFormat === 'url' && exportUrl && (
                <div>
                  <label className="block text-sm font-medium text-mtg-white mb-2">
                    {t('virtualBinder.export.shareUrl')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={exportUrl}
                      readOnly
                      className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-mtg-white text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(exportUrl)}
                      className="px-3 py-2 bg-mtg-blue text-white rounded-lg hover:bg-mtg-blue/80 transition-colors"
                    >
                      {t('common.copy')}
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="flex-1 btn-primary"
                >
                  {t('virtualBinder.export.download')}
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="btn-secondary"
                >
                  {t('common.cancel')}
                </button>
              </div>
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
