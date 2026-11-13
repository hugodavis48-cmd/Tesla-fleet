import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WonPrizeItem } from '../types';
import { Trophy, Globe, Plus, Truck, CheckCircle2, FileText } from 'lucide-react';

export const AdminWonPrizesManager: React.FC = () => {
  const { wonPrizes, updateWonPrizeItem, createWonPrizeItem, allUsers } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTracking, setEditTracking] = useState('');
  const [editCarrier, setEditCarrier] = useState('');
  const [editStatus, setEditStatus] = useState<WonPrizeItem['shippingStatus']>('awaiting_details');
  const [editProcessingFee, setEditProcessingFee] = useState('450');
  const [editDocFee, setEditDocFee] = useState('320');
  const [editFreightFee, setEditFreightFee] = useState('1150');

  const [showGrantForm, setShowGrantForm] = useState(false);
  const [grantForm, setGrantForm] = useState({
    userId: allUsers[0]?.id || 'usr-alex-001',
    prizeType: 'vehicle' as 'vehicle' | 'product',
    title: '2026 Tesla Cybertruck Cyberbeast',
    estimatedValueUsd: 99990,
    processingFeeUsd: 450,
    shippingDocFeeUsd: 350,
    shippingFreightFeeUsd: 1200,
    source: 'Wheel Spin' as 'Wheel Spin' | 'Scratch & Win',
  });

  const handleOpenEdit = (prize: WonPrizeItem) => {
    setEditingId(prize.id);
    setEditTracking(prize.trackingNumber || '');
    setEditCarrier(prize.carrierName || 'Apex Global Enclosed & Air/RoRo Freight');
    setEditStatus(prize.shippingStatus);
    setEditProcessingFee(String(prize.processingFeeUsd || 0));
    setEditDocFee(String(prize.shippingDocFeeUsd || 0));
    setEditFreightFee(String(prize.shippingFreightFeeUsd || 0));
  };

  const handleSaveEdit = (id: string) => {
    const p = Number(editProcessingFee) || 0;
    const d = Number(editDocFee) || 0;
    const f = Number(editFreightFee) || 0;
    updateWonPrizeItem(id, {
      trackingNumber: editTracking,
      carrierName: editCarrier,
      shippingStatus: editStatus,
      processingFeeUsd: p,
      shippingDocFeeUsd: d,
      shippingFreightFeeUsd: f,
      totalFeesUsd: Number((p + d + f).toFixed(2)),
    });
    setEditingId(null);
  };

  const handleGrantPrize = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = allUsers.find((u) => u.id === grantForm.userId) || allUsers[0];
    const totalFees = Number(
      (grantForm.processingFeeUsd + grantForm.shippingDocFeeUsd + grantForm.shippingFreightFeeUsd).toFixed(2)
    );
    createWonPrizeItem({
      userId: targetUser?.id || 'usr-alex-001',
      userName: targetUser?.name || 'Alex Vance',
      userEmail: targetUser?.email || 'alex.vance@apex-tesla.io',
      prizeType: grantForm.prizeType,
      title: grantForm.title,
      modelOrSku: grantForm.prizeType === 'vehicle' ? 'TSLA-PRIZE-2026' : 'APEX-HW-2026',
      image: '/promo-cyberbeast.jpg',
      estimatedValueUsd: grantForm.estimatedValueUsd,
      source: grantForm.source,
      vinAssigned:
        grantForm.prizeType === 'vehicle'
          ? `7G2CEHED${Math.floor(100000 + Math.random() * 899999)}`
          : undefined,
      processingFeeUsd: grantForm.processingFeeUsd,
      shippingDocFeeUsd: grantForm.shippingDocFeeUsd,
      shippingFreightFeeUsd: grantForm.shippingFreightFeeUsd,
      totalFeesUsd: totalFees,
      feesPaid: false,
      shippingStatus: 'awaiting_details',
    });
    setShowGrantForm(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-xs">
      <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-heading font-bold text-lg text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Won Vehicles &amp; Hardware International Shipping Desk
          </h4>
          <p className="text-zinc-400 text-xs mt-0.5">
            Adjust processing, export documentation, and freight invoices, dispatch tracking numbers, or award a Tesla vehicle/product prize to a member.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowGrantForm((v) => !v)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showGrantForm ? 'Close Form' : 'Award Won Prize to User'}</span>
        </button>
      </div>

      {showGrantForm && (
        <form onSubmit={handleGrantPrize} className="p-5 rounded-3xl bg-zinc-950 border border-amber-500/30 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Member Account</label>
            <select
              value={grantForm.userId}
              onChange={(e) => setGrantForm({ ...grantForm, userId: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Prize Category</label>
            <select
              value={grantForm.prizeType}
              onChange={(e) => setGrantForm({ ...grantForm, prizeType: e.target.value as 'vehicle' | 'product' })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
            >
              <option value="vehicle">Tesla Vehicle</option>
              <option value="product">Hardware / Accessory Product</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Prize Title</label>
            <input
              type="text"
              required
              value={grantForm.title}
              onChange={(e) => setGrantForm({ ...grantForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Estimated Value (USD)</label>
            <input
              type="number"
              value={grantForm.estimatedValueUsd}
              onChange={(e) => setGrantForm({ ...grantForm, estimatedValueUsd: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Processing + Doc Fees (USD)</label>
            <input
              type="number"
              value={grantForm.processingFeeUsd + grantForm.shippingDocFeeUsd}
              onChange={(e) =>
                setGrantForm({
                  ...grantForm,
                  processingFeeUsd: Math.round(Number(e.target.value) * 0.55),
                  shippingDocFeeUsd: Math.round(Number(e.target.value) * 0.45),
                })
              }
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Intl Carrier Freight Fee (USD)</label>
            <input
              type="number"
              value={grantForm.shippingFreightFeeUsd}
              onChange={(e) => setGrantForm({ ...grantForm, shippingFreightFeeUsd: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono"
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer">
              Confirm &amp; Dispatch Prize to User Dashboard
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {wonPrizes.map((prize) => {
          const isEditing = editingId === prize.id;
          const totalFees = (prize.processingFeeUsd || 0) + (prize.shippingDocFeeUsd || 0) + (prize.shippingFreightFeeUsd || 0);
          return (
            <div key={prize.id} className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={prize.image}
                    alt={prize.title}
                    className="w-20 h-14 rounded-xl object-cover border border-zinc-800 shrink-0"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading font-bold text-base text-white">{prize.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          prize.feesPaid
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                            : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        }`}
                      >
                        {prize.feesPaid ? 'FEES PAID' : 'FEES UNPAID'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-zinc-300 uppercase">
                        {prize.shippingStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-zinc-400 font-mono text-[11px] mt-0.5">
                      Winner: <strong className="text-white">{prize.userName}</strong> ({prize.userEmail}) • Value: ${prize.estimatedValueUsd.toLocaleString()}
                    </p>
                    {prize.shippingAddress && (
                      <p className="text-cyan-400 text-[11px] mt-1 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Destination: {prize.shippingAddress.city}, {prize.shippingAddress.country} ({prize.shippingAddress.deliveryMethod})
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <div className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-right">
                    <span className="text-[10px] text-zinc-500 block">Required Fees</span>
                    <span className="font-bold text-white tabular-nums">${totalFees.toLocaleString()} USD</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateWonPrizeItem(prize.id, { feesPaid: !prize.feesPaid })}
                    className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold cursor-pointer"
                  >
                    {prize.feesPaid ? 'Mark Unpaid' : 'Mark Paid'}
                  </button>
                  <button
                    type="button"
                    onClick={() => (isEditing ? setEditingId(null) : handleOpenEdit(prize))}
                    className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer flex items-center gap-1"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Close' : 'Manage Logistics'}</span>
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Shipping Pipeline Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as WonPrizeItem['shippingStatus'])}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                    >
                      <option value="awaiting_details">Awaiting Shipping Details</option>
                      <option value="fees_paid_processing">Fees Paid &amp; Processing</option>
                      <option value="documentation_ready">Export Documentation Ready</option>
                      <option value="shipped">Shipped / In Transit</option>
                      <option value="delivered">Delivered to Winner</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Tracking Number</label>
                    <input
                      type="text"
                      value={editTracking}
                      onChange={(e) => setEditTracking(e.target.value)}
                      placeholder="APX-INTL-889241"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Assigned Carrier</label>
                    <input
                      type="text"
                      value={editCarrier}
                      onChange={(e) => setEditCarrier(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Processing Fee (USD)</label>
                    <input
                      type="number"
                      value={editProcessingFee}
                      onChange={(e) => setEditProcessingFee(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Documentation Fee (USD)</label>
                    <input
                      type="number"
                      value={editDocFee}
                      onChange={(e) => setEditDocFee(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Carrier Freight Fee (USD)</label>
                    <input
                      type="number"
                      value={editFreightFee}
                      onChange={(e) => setEditFreightFee(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(prize.id)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Save Logistics &amp; Fee Invoice
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
