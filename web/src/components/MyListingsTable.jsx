import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Listings } from '../lib/api.js';

export default function MyListingsTable({ listings, userEmail, onListingDeleted }) {
  const { t } = useTranslation();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState({});

  const handleDeleteListing = async (listing) => {
    setDeleting(true);
    try {
      await Listings.delete(listing.id);
      if (onListingDeleted) {
        onListingDeleted(listing.id);
      } else {
        window.location.reload();
      }
    } catch (error) {
      alert('Error deleting listing: ' + error.message);
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    try {
      const selectedListings = listings.filter(listing => selectedForDelete[listing.id]);
      for (const listing of selectedListings) {
        await Listings.delete(listing.id);
      }
      if (onListingDeleted) {
        selectedListings.forEach(listing => onListingDeleted(listing.id));
      } else {
        window.location.reload();
      }
      setSelectedForDelete({});
      setBulkDeleteConfirm(false);
    } catch (error) {
      alert('Error deleting listings: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {!listings?.length ? (
        <div className="text-center py-16">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-mtg-blue/20 to-mtg-gold/20 flex items-center justify-center">
            <span className="text-6xl">📋</span>
          </div>
          <h3 className="text-2xl font-bold text-mtg-white mb-2">No Active Listings</h3>
          <p className="text-mtg-white/70 mb-6">You haven't listed any cards for sale yet.</p>
          <button 
            onClick={() => window.location.href = '#inventory'}
            className="btn-primary"
          >
            Go to Inventory
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-mtg-white">
              My Listings
            </h2>
            <div className="text-sm text-mtg-white/70">
              {listings.length} active listing{listings.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-mtg-white/70 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={Object.keys(selectedForDelete).length === listings.length && listings.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            const allSelected = {};
                            listings.forEach(listing => allSelected[listing.id] = true);
                            setSelectedForDelete(allSelected);
                          } else {
                            setSelectedForDelete({});
                          }
                        }}
                        className="w-4 h-4 text-mtg-blue bg-white/10 border-white/20 rounded focus:ring-mtg-blue focus:ring-2"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-mtg-white/70 uppercase tracking-wider">{t('inventory.table.card')}</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-mtg-white/70 uppercase tracking-wider">{t('inventory.table.set')}</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-mtg-white/70 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-mtg-white/70 uppercase tracking-wider">{t('inventory.table.qty')}</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-mtg-white/70 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-mtg-white/70 uppercase tracking-wider">{t('inventory.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {listings.map(listing => (
                    <tr key={listing.id} className="hover:bg-white/5 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={!!selectedForDelete[listing.id]}
                          onChange={(e) => {
                            setSelectedForDelete({
                              ...selectedForDelete,
                              [listing.id]: e.target.checked
                            });
                          }}
                          className="w-4 h-4 text-mtg-blue bg-white/10 border-white/20 rounded focus:ring-mtg-blue focus:ring-2"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {listing.printing.imageNormal && (
                            <div className="relative w-16 h-20 bg-gradient-to-br from-mtg-blue/10 to-mtg-gold/10 rounded-lg overflow-hidden">
                              <img
                                src={listing.printing.imageNormal}
                                alt=""
                                className="w-full h-full object-contain rounded-lg"
                              />
                              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-mtg-gold flex items-center justify-center">
                                <span className="text-xs font-bold text-mtg-black">💰</span>
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-mtg-white text-lg">{listing.printing.name}</div>
                            <div className="text-sm text-mtg-white/60">#{listing.printing.collectorNum}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-mtg-blue/20 text-mtg-blue uppercase">
                          {listing.printing.set}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-2xl font-bold text-mtg-green">
                          €{Number(listing.priceEur).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-mtg-green/20 text-mtg-green">
                          {listing.qtyAvailable}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="btn bg-red-600/20 text-red-400 hover:bg-red-600/30 text-sm px-4 py-2 border border-red-500/30"
                          onClick={() => setDeleteConfirm(listing)}
                          disabled={deleting}
                        >
                          🗑️ {t('listings.delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bulk Delete Section */}
          {Object.values(selectedForDelete).some(v => v) && (
            <div className="bg-gradient-to-r from-red-600/10 to-red-500/10 backdrop-blur-sm rounded-2xl border border-red-500/20 p-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                  <span className="text-red-400 text-lg">🗑️</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-mtg-white">{t('listings.bulkDelete')}</h3>
                  <p className="text-sm text-mtg-white/70">
                    {t('listings.bulkDelete.selected', { count: Object.values(selectedForDelete).filter(v => v).length })}
                  </p>
                </div>
              </div>
              
              <button
                className="btn bg-red-600 hover:bg-red-700 text-white w-full"
                disabled={deleting}
                onClick={() => setBulkDeleteConfirm(true)}
              >
                {t('listings.bulkDelete.confirm')}
              </button>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    {deleteConfirm.printing.imageNormal && (
                      <img
                        src={deleteConfirm.printing.imageNormal}
                        alt=""
                        className="w-16 h-20 object-cover rounded-lg shadow-lg"
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-xl text-mtg-black mb-1">{deleteConfirm.printing.name}</h3>
                      <p className="text-sm text-mtg-black/60 uppercase">{deleteConfirm.printing.set} • #{deleteConfirm.printing.collectorNum}</p>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-red-600 text-lg">⚠️</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-800">{t('listings.deleteConfirm.title')}</h4>
                        <p className="text-sm text-red-600">
                          {t('listings.deleteConfirm.message')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      className="btn bg-red-600 hover:bg-red-700 text-white flex-1"
                      disabled={deleting}
                      onClick={() => handleDeleteListing(deleteConfirm)}
                    >
                      {deleting ? t('listings.deleteConfirm.deleting') : `🗑️ ${t('listings.deleteConfirm.delete')}`}
                    </button>
                    <button
                      className="btn bg-mtg-black/10 text-mtg-black hover:bg-mtg-black/20 flex-1"
                      onClick={() => setDeleteConfirm(null)}
                      disabled={deleting}
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Delete Confirmation Modal */}
          {bulkDeleteConfirm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 text-2xl">🗑️</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-mtg-black mb-1">{t('listings.bulkDelete')}</h3>
                      <p className="text-sm text-mtg-black/60">
                        {t('listings.bulkDelete.selected', { count: Object.values(selectedForDelete).filter(v => v).length })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-red-600 text-lg">⚠️</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-800">{t('listings.bulkDelete.confirm')}</h4>
                        <p className="text-sm text-red-600">
                          {t('listings.bulkDelete.confirmMessage', { count: Object.values(selectedForDelete).filter(v => v).length })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      className="btn bg-red-600 hover:bg-red-700 text-white flex-1"
                      disabled={deleting}
                      onClick={handleBulkDelete}
                    >
                      {deleting ? t('listings.deleteConfirm.deleting') : `🗑️ ${t('listings.bulkDelete.confirm')}`}
                    </button>
                    <button
                      className="btn bg-mtg-black/10 text-mtg-black hover:bg-mtg-black/20 flex-1"
                      onClick={() => setBulkDeleteConfirm(false)}
                      disabled={deleting}
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
