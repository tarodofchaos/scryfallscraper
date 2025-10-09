import React, { useEffect, useState } from 'react';
import { Inventory as Inv } from '../lib/api.js';
import InventoryTable from '../components/InventoryTable.jsx';
import ListingForm from '../components/ListingForm.jsx';

export default function Inventory({ userEmail }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  async function load() {
    const res = await Inv.list(userEmail);
    console.log('Inventory loaded for', userEmail, res.items);
    setItems(res.items);
  }

  async function handleAdd() {
    await load();
  }

  useEffect(()=>{ if (userEmail) load(); }, [userEmail]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Inventory</h2>
        <button onClick={load} className="btn bg-neutral-100 dark:bg-neutral-800">Refresh</button>
      </div>
      <InventoryTable items={items} />
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Select an item to list</h3>
        <div className="grid grid-cols-2 gap-2">
          {items.map(i=> (
            <button key={i.id} onClick={()=>setSelected(i)} className={`card text-left ${selected?.id===i.id?'ring-2 ring-blue-500':''}`}>
              <div className="font-medium">{i.printing.name}</div>
              <div className="text-xs opacity-70 uppercase">{i.printing.set} • #{i.printing.collectorNum}</div>
            </button>
          ))}
        </div>
  {selected && <ListingForm item={selected} sellerEmail={userEmail} onCreated={handleAdd} />}
      </div>
    </div>
  );
}