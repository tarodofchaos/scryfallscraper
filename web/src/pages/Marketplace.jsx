import React, { useEffect, useState } from 'react';
import { Listings } from '../lib/api.js';

export default function Marketplace() {
  const [rows, setRows] = useState([]);

  async function load() {
    const res = await Listings.list();
    setRows(res.listings);
  }

  useEffect(()=>{ load(); }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Marketplace</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {rows.map(r => (
          <div key={r.id} className="card">
            {r.printing.imageNormal && <img src={r.printing.imageNormal} className="w-full rounded-xl mb-3" />}
            <div className="font-semibold">{r.printing.name}</div>
            <div className="text-xs opacity-70 uppercase">{r.printing.set} • #{r.printing.collectorNum}</div>
            <div className="mt-2 text-lg font-semibold">€{Number(r.priceEur).toFixed(2)}</div>
            <div className="text-xs opacity-70">Seller: {r.seller.display || r.seller.email}</div>
            <button className="btn mt-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 w-full">Contact Seller</button>
          </div>
        ))}
      </div>
    </div>
  );
}