import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Listings, Inventory } from '../lib/api.js';

export default function InventoryTable({ items, userEmail, onItemDeleted }) {
  const { t } = useTranslation();
  const [modalRow, setModalRow] = useState(null);
  const [modalPrice, setModalPrice] = useState('');
  const [modalQty, setModalQty] = useState(1);
  const [batchPrice, setBatchPrice] = useState('');
  const [batchQty, setBatchQty] = useState(1);
  const [multiList, setMultiList] = useState({});
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState({});

  const handleDeleteItem = async (item) => {
    setDeleting(true);
    try {
      await Inventory.delete(item.id);
      if (onItemDeleted) {
        onItemDeleted(item.id);
      } else {
        window.location.reload();
      }
    } catch (error) {
      alert('Error deleting item: ' + error.message);
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    try {
      const selectedItems = items.filter(item => selectedForDelete[item.id]);
      for (const item of selectedItems) {
        await Inventory.delete(item.id);
      }
      if (onItemDeleted) {
        selectedItems.forEach(item => onItemDeleted(item.id));
      } else {
        window.location.reload();
      }
      setSelectedForDelete({});
      setBulkDeleteConfirm(false);
    } catch (error) {
      alert('Error deleting items: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {!items?.length ? (
        <div className="text-center py-16">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-mtg-blue/20 to-mtg-gold/20 flex items-center justify-center">
            <span className="text-6xl">📦</span>
          </div>
          <h3 className="text-2xl font-bold text-mtg-white mb-2">{t('inventory.empty.title')}</h3>
          <p className="text-mtg-white/70 mb-6">{t('inventory.empty.subtitle')}</p>
          <button 
            onClick={() => window.location.href = '#search'}
            className="btn-primary"
          >
            {t('inventory.empty.action')}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-mtg-white">
              {t('inventory.title')}
            </h2>
            <div className="text-sm text-mtg-white/70">
              {t('inventory.itemsCount', { count: items.length })}
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
                        checked={Object.keys(selectedForDelete).length === items.length && items.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            const allSelected = {};
                            items.forEach(item => allSelected[item.id] = true);
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-mtg-white/70 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-mtg-white/70 uppercase tracking-wider">{t('inventory.table.qty')}</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-mtg-white/70 uppercase tracking-wider">{t('inventory.table.cond')}</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-mtg-white/70 uppercase tracking-wider">{t('inventory.table.lang')}</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-mtg-white/70 uppercase tracking-wider">{t('inventory.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {items.map(row => (
                    <tr key={row.id} className="hover:bg-white/5 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={!!selectedForDelete[row.id]}
                          onChange={(e) => {
                            setSelectedForDelete({
                              ...selectedForDelete,
                              [row.id]: e.target.checked
                            });
                          }}
                          className="w-4 h-4 text-mtg-blue bg-white/10 border-white/20 rounded focus:ring-mtg-blue focus:ring-2"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {row.printing.imageNormal && (
                            <div className="relative w-16 h-20 bg-gradient-to-br from-mtg-blue/10 to-mtg-gold/10 rounded-lg overflow-hidden">
                              <img
                                src={row.printing.imageNormal}
                                alt=""
                                className="w-full h-full object-contain rounded-lg"
                              />
                              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-mtg-gold flex items-center justify-center">
                                <span className="text-xs font-bold text-mtg-black">⚡</span>
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-mtg-white text-lg">{row.printing.name}</div>
                            <div className="text-sm text-mtg-white/60">{row.printing.rarity}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-mtg-blue/20 text-mtg-blue uppercase">
                          {row.printing.set}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-mtg-white/80 font-mono">{row.printing.collectorNum}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-mtg-green/20 text-mtg-green">
                          {row.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-mtg-white/80 capitalize">{row.condition}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-mtg-white/80 uppercase">{row.language}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            className="btn-primary text-sm px-4 py-2"
                            onClick={() => {
                              setModalRow(row);
                              setModalPrice('');
                              setModalQty(row.quantity);
                            }}
                          >
{t('inventory.listForSale')}
                          </button>
                          <button
                            className="btn bg-red-600/20 text-red-400 hover:bg-red-600/30 text-sm px-4 py-2 border border-red-500/30"
                            onClick={() => setDeleteConfirm(row)}
                            disabled={deleting}
                          >
                            🗑️ {t('inventory.delete')}
                          </button>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!multiList[row.id]}
                              onChange={e =>
                                setMultiList({
                                  ...multiList,
                                  [row.id]: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-mtg-blue bg-white/10 border-white/20 rounded focus:ring-mtg-blue focus:ring-2"
                            />
                            <span className="text-xs text-mtg-white/70">{t('inventory.batch')}</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal */}
          {modalRow && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    {modalRow.printing.imageNormal && (
                      <img
                        src={modalRow.printing.imageNormal}
                        alt=""
                        className="w-16 h-20 object-cover rounded-lg shadow-lg"
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-xl text-mtg-black mb-1">{modalRow.printing.name}</h3>
                      <p className="text-sm text-mtg-black/60 uppercase">{modalRow.printing.set} • #{modalRow.printing.collectorNum}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-mtg-black mb-2">Price (EUR)</label>
                      <input
                        type="number"
                        value={modalPrice}
                        onChange={e => setModalPrice(e.target.value)}
                        className="w-full rounded-xl border border-mtg-blue/20 p-3 text-lg focus:outline-none focus:ring-2 focus:ring-mtg-blue focus:border-transparent transition-all duration-300"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-mtg-black mb-2">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        max={modalRow.quantity}
                        value={modalQty}
                        onChange={e => setModalQty(e.target.value)}
                        className="w-full rounded-xl border border-mtg-blue/20 p-3 text-lg focus:outline-none focus:ring-2 focus:ring-mtg-blue focus:border-transparent transition-all duration-300"
                      />
                      <p className="text-xs text-mtg-black/60 mt-1">Max: {modalRow.quantity} available</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      className="btn-primary flex-1"
                      disabled={loading || !modalPrice}
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await Listings.create({
                            sellerEmail: userEmail,
                            printingId: modalRow.printing.id,
                            priceEur: Number(modalPrice),
                            qtyAvailable: Number(modalQty),
                          });
                          setModalRow(null);
                          window.location.reload();
                        } catch (e) {
                          alert('Error creating listing: ' + e.message);
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
{loading ? t('inventory.modal.creating') : t('inventory.modal.create')}
                    </button>
                    <button
                      className="btn bg-mtg-black/10 text-mtg-black hover:bg-mtg-black/20 flex-1"
                      onClick={() => setModalRow(null)}
                    >
{t('inventory.modal.cancel')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Batch listing */}
          {Object.values(multiList).some(v => v) && (
            <div className="bg-gradient-to-r from-mtg-blue/10 to-mtg-gold/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-mtg-blue/20 flex items-center justify-center">
                  <span className="text-mtg-blue text-lg">⚡</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-mtg-white">Batch List Selected Cards</h3>
                  <p className="text-sm text-mtg-white/70">
                    {Object.values(multiList).filter(v => v).length} card{Object.values(multiList).filter(v => v).length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-mtg-white mb-2">Price (EUR)</label>
                  <input
                    type="number"
                    value={batchPrice}
                    onChange={e => setBatchPrice(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/10 text-mtg-white placeholder-mtg-white/50 p-3 focus:outline-none focus:ring-2 focus:ring-mtg-blue focus:border-transparent transition-all duration-300"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-mtg-white mb-2">Quantity per Card</label>
                  <input
                    type="number"
                    min={1}
                    value={batchQty}
                    onChange={e => setBatchQty(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/10 text-mtg-white placeholder-mtg-white/50 p-3 focus:outline-none focus:ring-2 focus:ring-mtg-blue focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
              
              <button
                className="btn-primary w-full"
                disabled={!batchPrice}
                onClick={async () => {
                  const selectedRows = items.filter(row => multiList[row.id]);
                  for (const row of selectedRows) {
                    await Listings.create({
                      sellerEmail: userEmail,
                      printingId: row.printing.id,
                      priceEur: Number(batchPrice),
                      qtyAvailable: Number(batchQty),
                    });
                  }
                  window.location.reload();
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>List All Selected Cards</span>
                  <span className="text-lg">🚀</span>
                </span>
              </button>
            </div>
          )}

          {/* Bulk Delete Section */}
          {Object.values(selectedForDelete).some(v => v) && (
            <div className="bg-gradient-to-r from-red-600/10 to-red-500/10 backdrop-blur-sm rounded-2xl border border-red-500/20 p-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                  <span className="text-red-400 text-lg">🗑️</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-mtg-white">{t('inventory.bulkDelete')}</h3>
                  <p className="text-sm text-mtg-white/70">
                    {t('inventory.bulkDelete.selected', { count: Object.values(selectedForDelete).filter(v => v).length })}
                  </p>
                </div>
              </div>
              
              <button
                className="btn bg-red-600 hover:bg-red-700 text-white w-full"
                disabled={deleting}
                onClick={() => setBulkDeleteConfirm(true)}
              >
                {t('inventory.bulkDelete.confirm')}
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
                        <h4 className="font-semibold text-red-800">{t('inventory.deleteConfirm.title')}</h4>
                        <p className="text-sm text-red-600">
                          {t('inventory.deleteConfirm.message')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      className="btn bg-red-600 hover:bg-red-700 text-white flex-1"
                      disabled={deleting}
                      onClick={() => handleDeleteItem(deleteConfirm)}
                    >
                      {deleting ? t('inventory.deleteConfirm.deleting') : `🗑️ ${t('inventory.deleteConfirm.delete')}`}
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
                      <h3 className="font-bold text-xl text-mtg-black mb-1">{t('inventory.bulkDelete')}</h3>
                      <p className="text-sm text-mtg-black/60">
                        {t('inventory.bulkDelete.selected', { count: Object.values(selectedForDelete).filter(v => v).length })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-red-600 text-lg">⚠️</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-800">{t('inventory.bulkDelete.confirm')}</h4>
                        <p className="text-sm text-red-600">
                          {t('inventory.bulkDelete.confirmMessage', { count: Object.values(selectedForDelete).filter(v => v).length })}
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
                      {deleting ? t('inventory.deleteConfirm.deleting') : `🗑️ ${t('inventory.bulkDelete.confirm')}`}
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
