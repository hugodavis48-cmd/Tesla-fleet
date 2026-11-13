import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WonPrizeItem } from '../types';
import {
  Trophy,
  Globe,
  Truck,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Plus,
  Package,
  MapPin,
  Lock,
  Maximize2,
} from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';

interface UserWonPrizesTabProps {
  onOpenDeposit: () => void;
}

const COUNTRY_OPTIONS = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'United Arab Emirates',
  'Australia',
  'Japan',
  'France',
  'Netherlands',
  'Switzerland',
  'Singapore',
  'Nigeria',
  'South Africa',
  'Other International Destination',
];

const DELIVERY_METHODS = [
  { id: 'enclosed_carrier', label: 'Enclosed Climate-Controlled Carrier (US / EU)' },
  { id: 'air_freight_intl', label: 'Priority International Air Freight (7-12 Days)' },
  { id: 'ocean_roro_intl', label: 'Insured Ocean RoRo / Containerized Vessel' },
  { id: 'delivery_hub_pickup', label: 'Apex Regional Delivery Center Pickup' },
];

export const UserWonPrizesTab: React.FC<UserWonPrizesTabProps> = ({ onOpenDeposit }) => {
  const {
    currentUser,
    wonPrizes,
    balances,
    lockedWinBalanceUsd,
    minDepositToActivateWinsUsd,
    submitWonPrizeShippingAndPayFees,
    formatCurrency,
    selectedCurrencyCode,
    showToast,
  } = useApp();

  // Filter prizes belonging to current user (fallback cleanly for demo Alex Vance)
  const myPrizes = wonPrizes.filter((p) => {
    if (!currentUser) return false;
    return (
      p.userId === currentUser.id ||
      p.userEmail?.toLowerCase() === currentUser.email?.toLowerCase() ||
      (currentUser.id === 'usr-alex-001' && p.userId === 'usr-apex-001')
    );
  });

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [formsByPrize, setFormsByPrize] = useState<
    Record<string, NonNullable<WonPrizeItem['shippingAddress']>>
  >({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const getForm = (prize: WonPrizeItem): NonNullable<WonPrizeItem['shippingAddress']> => {
    if (formsByPrize[prize.id]) return formsByPrize[prize.id];
    if (prize.shippingAddress) return prize.shippingAddress;
    return {
      fullName: currentUser?.name || '',
      country: 'United States',
      street: '',
      apartmentOrSuite: '',
      city: '',
      state: '',
      zipCode: '',
      phone: currentUser?.phone || '',
      deliveryMethod: prize.prizeType === 'vehicle' ? 'ocean_roro_intl' : 'air_freight_intl',
      deliveryNotes: '',
    };
  };

  const updateFormField = (
    prize: WonPrizeItem,
    field: keyof NonNullable<WonPrizeItem['shippingAddress']>,
    value: string
  ) => {
    const current = getForm(prize);
    setFormsByPrize((prev) => ({
      ...prev,
      [prize.id]: { ...current, [field]: value },
    }));
  };

  const handlePayAndShip = async (prize: WonPrizeItem, method: 'wallet_usd' | 'deposit') => {
    const form = getForm(prize);
    if (!form.fullName.trim() || !form.country.trim() || !form.street.trim() || !form.city.trim() || !form.zipCode.trim() || !form.phone.trim()) {
      showToast('Please complete all required international shipping & contact fields first.', 'error');
      return;
    }

    if (method === 'deposit') {
      showToast('Complete your crypto deposit first, then return here to settle shipping & documentation fees.', 'info');
      onOpenDeposit();
      return;
    }

    setSubmittingId(prize.id);
    try {
      await submitWonPrizeShippingAndPayFees(prize.id, form, 'wallet_usd');
    } finally {
      setSubmittingId(null);
    }
  };

  const totalDeposited = currentUser?.totalDepositedUsd || 0;
  const depositUnlockPct = Math.min(100, Math.round((totalDeposited / minDepositToActivateWinsUsd) * 100));

  const renderStatusSteps = (status: WonPrizeItem['shippingStatus']) => {
    const steps: { id: WonPrizeItem['shippingStatus']; label: string }[] = [
      { id: 'awaiting_details', label: 'Awaiting Shipping' },
      { id: 'fees_paid_processing', label: 'Fees Paid' },
      { id: 'documentation_ready', label: 'Docs Cleared' },
      { id: 'shipped', label: 'In Transit' },
      { id: 'delivered', label: 'Delivered' },
    ];
    const activeIdx = Math.max(0, steps.findIndex((s) => s.id === status));
    return (
      <div className="grid grid-cols-5 gap-1.5 pt-2">
        {steps.map((s, idx) => {
          const done = idx <= activeIdx;
          return (
            <div key={s.id} className="text-center space-y-1">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  done ? 'bg-emerald-500' : 'bg-zinc-800'
                }`}
              />
              <span
                className={`block text-[9px] font-mono leading-tight ${
                  done ? 'text-emerald-400 font-bold' : 'text-zinc-500'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-heading font-black text-xl sm:text-2xl text-white">
              Won Tesla Vehicles &amp; Hardware Prizes
            </h3>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Manage international &amp; domestic delivery for Tesla vehicles or products won via Spin-the-Wheel and Scratch Cards. Submit your destination details and pay required processing, export documentation, and carrier freight fees directly from your Vault Balance or via Crypto Deposit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-right">
            <span className="text-[10px] font-mono text-zinc-500 block uppercase">Spendable Vault</span>
            <span className="font-heading font-black text-lg text-emerald-400 tabular-nums">
              {formatCurrency(balances.usd, { includeCode: true })}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenDeposit}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-950/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Deposit Funds</span>
          </button>
        </div>
      </div>

      {/* $250 Minimum Deposit Win-Activation Notice */}
      {(lockedWinBalanceUsd > 0 || totalDeposited < minDepositToActivateWinsUsd) && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/35 via-zinc-950 to-zinc-950 border border-amber-500/35 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <h4 className="font-heading font-bold text-sm text-amber-300">
                Free-Spin Cash Win Activation Rule (${minDepositToActivateWinsUsd} USD Minimum Deposit)
              </h4>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Cash winnings from promotional Free Spins cannot be withdrawn or used for hardware/fee purchases until your account has completed at least{' '}
              <strong className="text-white">{formatCurrency(minDepositToActivateWinsUsd, { includeCode: true })}</strong>{' '}
              ({selectedCurrencyCode !== 'USD' ? `$${minDepositToActivateWinsUsd} USD` : 'USD base'}) in cumulative deposits.
              {lockedWinBalanceUsd > 0 && (
                <>
                  {' '}
                  Currently locked spin winnings:{' '}
                  <strong className="text-amber-400">{formatCurrency(lockedWinBalanceUsd, { includeCode: true })}</strong>.
                </>
              )}
            </p>
            <div className="space-y-1 max-w-md">
              <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                <span>Activation Progress</span>
                <span className="text-amber-300 font-bold tabular-nums">
                  ${totalDeposited.toFixed(0)} / ${minDepositToActivateWinsUsd} USD ({depositUnlockPct}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${depositUnlockPct}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenDeposit}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0 cursor-pointer"
          >
            Deposit ${Math.max(0, minDepositToActivateWinsUsd - totalDeposited).toFixed(0)}+ to Unlock
          </button>
        </div>
      )}

      {/* Prizes List */}
      {myPrizes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3">
          <Package className="w-12 h-12 text-zinc-600 mx-auto" />
          <h4 className="font-heading font-bold text-lg text-white">No Vehicle or Product Prizes Yet</h4>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Win a Cybertruck Cyberbeast, Model S Plaid, or Apex Hardware Upgrade on the Spin-and-Win Wheel or Scratch Cards—your won items will appear right here for international shipping management.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {myPrizes.map((prize) => {
            const form = getForm(prize);
            const totalFees = Number(
              ((prize.processingFeeUsd || 0) + (prize.shippingDocFeeUsd || 0) + (prize.shippingFreightFeeUsd || 0)).toFixed(2)
            );
            const hasEnoughBalance = balances.usd >= totalFees;

            return (
              <div
                key={prize.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Left Summary Column */}
                  <div className="lg:col-span-5 bg-zinc-900/50 border-b lg:border-b-0 lg:border-r border-zinc-800 p-6 flex flex-col justify-between space-y-5">
                    <div className="space-y-4">
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black border border-zinc-800 group">
                        <img
                          src={prize.image}
                          alt={prize.title}
                          onClick={() => setLightboxIndex(myPrizes.findIndex((item) => item.id === prize.id))}
                          className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
                          <span className="px-2.5 py-1 rounded-full bg-amber-500 text-black text-[10px] font-mono font-black uppercase">
                            {prize.prizeType === 'vehicle' ? 'Tesla Vehicle Jackpot' : 'Hardware Prize'}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3 pointer-events-none">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                              prize.feesPaid
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-red-600/25 text-red-300 border-red-500/40'
                            }`}
                          >
                            {prize.feesPaid ? 'FEES SETTLED' : 'FEES DUE'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLightboxIndex(myPrizes.findIndex((item) => item.id === prize.id))}
                          className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/75 hover:bg-red-600 border border-zinc-700 hover:border-red-500 text-white backdrop-blur-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition cursor-pointer"
                          title="Inspect prize photo"
                          aria-label={`Inspect ${prize.title} photo`}
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                          <span>Won via {prize.source}</span>
                          <span>{prize.wonAt}</span>
                        </div>
                        <h4 className="font-heading font-black text-xl text-white mt-1">{prize.title}</h4>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">
                          {prize.vinAssigned ? `Allocated VIN: ${prize.vinAssigned}` : `SKU: ${prize.modelOrSku || prize.id}`}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                        <span className="text-xs text-zinc-400">Estimated Prize Value</span>
                        <span className="font-heading font-black text-lg text-emerald-400 tabular-nums">
                          {formatCurrency(prize.estimatedValueUsd, { includeCode: true })}
                        </span>
                      </div>

                      {/* Itemized Processing & Shipping Documentation Cost Invoice */}
                      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-zinc-300 font-bold border-b border-zinc-800 pb-2 mb-1">
                          <FileText className="w-3.5 h-3.5 text-red-400" />
                          <span>Required Processing &amp; Export Invoice</span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>Title / Prize Processing Fee:</span>
                          <span className="text-white tabular-nums">{formatCurrency(prize.processingFeeUsd)}</span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>Shipping Documentation &amp; Customs:</span>
                          <span className="text-white tabular-nums">{formatCurrency(prize.shippingDocFeeUsd)}</span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>International Carrier Freight:</span>
                          <span className="text-white tabular-nums">{formatCurrency(prize.shippingFreightFeeUsd)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-zinc-800 pt-2 text-sm font-bold">
                          <span className="text-zinc-200">Total Required Fees:</span>
                          <div className="text-right">
                            <span className="text-red-400 font-black tabular-nums block">
                              {formatCurrency(totalFees, { includeCode: true })}
                            </span>
                            {selectedCurrencyCode !== 'USD' && (
                              <span className="text-[10px] text-zinc-500">(${totalFees.toFixed(2)} USD base)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {renderStatusSteps(prize.shippingStatus)}
                  </div>

                  {/* Right Shipping Form or Paid Tracking Column */}
                  <div className="lg:col-span-7 p-6 flex flex-col justify-between space-y-5">
                    {prize.feesPaid ? (
                      <div className="space-y-5">
                        <div className="p-5 rounded-2xl bg-emerald-950/25 border border-emerald-500/35 flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h5 className="font-heading font-bold text-base text-white">
                              Processing &amp; Shipping Documentation Paid ({prize.paidAt})
                            </h5>
                            <p className="text-xs text-zinc-300 leading-relaxed">
                              Your destination shipping dossier has been verified by Apex Logistics Desk. Tracking updates are live below.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 block uppercase">Tracking Number</span>
                            <span className="text-emerald-400 font-bold">{prize.trackingNumber || 'Allocating...'}</span>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 block uppercase">Assigned Carrier</span>
                            <span className="text-white font-bold">{prize.carrierName || 'Apex Global Freight'}</span>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 sm:col-span-2">
                            <span className="text-[10px] text-zinc-500 block uppercase">Destination Address</span>
                            <span className="text-zinc-200">
                              {prize.shippingAddress?.fullName} • {prize.shippingAddress?.street}
                              {prize.shippingAddress?.apartmentOrSuite ? `, ${prize.shippingAddress.apartmentOrSuite}` : ''},{' '}
                              {prize.shippingAddress?.city}, {prize.shippingAddress?.state} {prize.shippingAddress?.zipCode} —{' '}
                              <strong className="text-cyan-400">{prize.shippingAddress?.country}</strong>
                            </span>
                          </div>
                        </div>

                        {prize.notes && (
                          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Logistics Desk Notes</span>
                            {prize.notes}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-cyan-400" />
                            <h5 className="font-heading font-bold text-base text-white">
                              Complete Destination Shipping Details
                            </h5>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 uppercase">Worldwide Delivery Supported</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">Full Legal Name (For Title &amp; Customs)*</label>
                            <input
                              type="text"
                              value={form.fullName}
                              onChange={(e) => updateFormField(prize, 'fullName', e.target.value)}
                              placeholder="Alex Vance"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:border-red-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">Destination Country*</label>
                            <select
                              value={form.country}
                              onChange={(e) => updateFormField(prize, 'country', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:border-red-500 outline-none"
                            >
                              {COUNTRY_OPTIONS.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-[11px] text-zinc-400 block mb-1">Street Address / Port Delivery Street*</label>
                            <input
                              type="text"
                              value={form.street}
                              onChange={(e) => updateFormField(prize, 'street', e.target.value)}
                              placeholder="Street number, road name, district"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:border-red-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">City*</label>
                            <input
                              type="text"
                              value={form.city}
                              onChange={(e) => updateFormField(prize, 'city', e.target.value)}
                              placeholder="City / Metro"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:border-red-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">State / Province / Region</label>
                            <input
                              type="text"
                              value={form.state}
                              onChange={(e) => updateFormField(prize, 'state', e.target.value)}
                              placeholder="State / Province"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:border-red-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">Postal / ZIP Code*</label>
                            <input
                              type="text"
                              value={form.zipCode}
                              onChange={(e) => updateFormField(prize, 'zipCode', e.target.value)}
                              placeholder="ZIP / Postal"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:border-red-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">Contact Phone (Carrier SMS)*</label>
                            <input
                              type="text"
                              value={form.phone}
                              onChange={(e) => updateFormField(prize, 'phone', e.target.value)}
                              placeholder="+1 555-000-0000"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:border-red-500 outline-none"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-[11px] text-zinc-400 block mb-1">Freight &amp; Customs Delivery Method</label>
                            <select
                              value={form.deliveryMethod}
                              onChange={(e) => updateFormField(prize, 'deliveryMethod', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:border-red-500 outline-none"
                            >
                              {DELIVERY_METHODS.map((dm) => (
                                <option key={dm.id} value={dm.id}>
                                  {dm.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-[11px] text-zinc-400 block mb-1">Customs / Gate Access Notes (Optional)</label>
                            <input
                              type="text"
                              value={form.deliveryNotes || ''}
                              onChange={(e) => updateFormField(prize, 'deliveryNotes', e.target.value)}
                              placeholder="Preferred clearance port, receiver ID details, delivery window..."
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:border-red-500 outline-none"
                            />
                          </div>
                        </div>

                        {!hasEnoughBalance && (
                          <div className="p-3 rounded-xl bg-amber-950/35 border border-amber-500/40 flex items-center gap-2 text-xs text-amber-200">
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>
                              Spendable Vault Balance is short by{' '}
                              <strong>{formatCurrency(totalFees - balances.usd, { includeCode: true })}</strong>. Make a crypto deposit to cover documentation &amp; shipping fees.
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                          <button
                            type="button"
                            disabled={submittingId === prize.id || !hasEnoughBalance}
                            onClick={() => handlePayAndShip(prize, 'wallet_usd')}
                            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 disabled:opacity-45 disabled:cursor-not-allowed text-white font-heading font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition cursor-pointer"
                          >
                            <Wallet className="w-4 h-4" />
                            <span>
                              {submittingId === prize.id
                                ? 'Processing Shipment...'
                                : `Pay ${formatCurrency(totalFees)} Fees from Wallet & Ship`}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePayAndShip(prize, 'deposit')}
                            className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                          >
                            <Truck className="w-4 h-4 text-red-400" />
                            <span>Deposit to Cover Fees</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>All shipments include marine/transit insurance &amp; notarized title export packet.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Prize Lightbox */}
      <ImageLightbox
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        initialIndex={lightboxIndex ?? 0}
        images={myPrizes.map((p) => ({
          url: p.image,
          title: p.title,
          subtitle: `Won via ${p.source} • Estimated Value ${formatCurrency(p.estimatedValueUsd, { includeCode: true })}`,
          badge: p.prizeType === 'vehicle' ? 'Vehicle Prize' : 'Hardware Prize',
        }))}
      />
    </div>
  );
};
