import React from 'react';

export default function InventoryTable({ items }) {
  if (!items?.length) return <p className="opacity-70">Your inventory is empty.</p>;
  return (
    <div className="overflow-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Card</th>
            <th className="p-2">Set</th>
            <th className="p-2">#</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Cond</th>
            <th className="p-2">Lang</th>
          </tr>
        </thead>
        <tbody>
          {items.map(row => (
            <tr key={row.id} className="border-b">
              <td className="p-2 flex items-center gap-2">
                {row.printing.imageNormal && <img src={row.printing.imageNormal} alt="" className="w-10 h-14 object-cover rounded"/>}
                <div>
                  <div className="font-medium">{row.printing.name}</div>
                </div>
              </td>
              <td className="p-2 uppercase">{row.printing.set}</td>
              <td className="p-2">{row.printing.collectorNum}</td>
              <td className="p-2">{row.quantity}</td>
              <td className="p-2">{row.condition}</td>
              <td className="p-2">{row.language}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}