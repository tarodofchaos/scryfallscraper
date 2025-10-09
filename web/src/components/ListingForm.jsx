import React, { useState } from 'react';
import { Listings } from '../lib/api.js';

export default function ListingForm({ item, sellerEmail, onCreated }) {
  const [price, setPrice] = useState('5.00');
  const [qty, setQty] = useState(1);

  async function submit(e) {
    e.preventDefault();
    const payload = { sellerEmail, printingId: item.printing.id, priceEur: Number(price), qtyAvailable: Number(qty) };
    const res = await Listings.create(payload);
    onCreated?.(res.listing);
  }

  return (
    <form onSubmit={submit} className="card mt-2">
      <h3 className="font-semibold mb-2">Create Listing</h3>
      <div className="flex gap-2">
        <input className="border rounded p-2" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price EUR"/>
        <input className="border rounded p-2 w-24" type="number" value={qty} onChange={e=>setQty(e.target.value)} placeholder="Qty"/>
        <button className="btn bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">List</button>
      </div>
    </form>
  );
}