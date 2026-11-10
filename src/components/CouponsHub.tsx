import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Coupon } from '../types';
import {
  Tag,
  Percent,
  Gift,
  Copy,
  Check,
  Sparkles,
  Truck,
  Car,
  Wrench,
  Search,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface CouponsHubProps {
  onNavigateToShop?: () => void;
  onNavigateToVehicles?: () => void;
  onNavigateToPromotions?: () => void;
  onNavigateToServices?: () => void;
  onOpenCart?: () => void;
}

export const CouponsHub: React.FC<CouponsHubProps> = ({
  onNavigateToShop,
  onNavigateToVehicles,
  onNavigateToPromotions,
  onNavigateToServices,
  onOpenCart,
}) => {
  const { coupons, claimCoupon, applyCoupon, activeCoupon } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [testCodeInput, setTestCodeInput] = useState('');

  const categories = [
    { id: 'all', label: 'All Deals', icon: Tag },
    { id: 'products', label: 'Wraps & Accessories', icon: Sparkles },
    { id: 'vehicles', label: 'Tesla Vehicle Orders', icon: Car },
    { id: 'spins', label: 'Free Wheel Spins', icon: Gift },
    { id: 'services', label: 'Service & Fixes', icon: Wrench },
  ];

  const filteredCoupons = coupons
    .filter((c) => {
      if (activeCategory !== 'all') {
        if (activeCategory === 'products' && c.validFor !== 'products' && c.validFor !== 'all') return false;
        if (activeCategory === 'vehicles' && c.validFor !== 'vehicles' && c.validFor !== 'all') return false;
        if (activeCategory === 'spins' && c.validFor !== 'spins' && c.validFor !== 'all') return false;
        if (activeCategory === 'services' && c.validFor !== 'services' && c.validFor !== 'all') return false;
      }
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0));

  const handleCopy = (code: string) => {
    claimCoupon(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleApplyCouponDirectly = (coupon: Coupon) => {
    const res = applyCoupon(coupon.code, coupon.validFor === 'all' ? undefined : (coupon.validFor as any));
    if (res.success) {
      if (coupon.validFor === 'spins' && onNavigateToPromotions) {
        onNavigateToPromotions();
      } else if (coupon.validFor === 'products' && onOpenCart) {
        onOpenCart();
      } else if (coupon.validFor === 'vehicles' && onNavigateToVehicles) {
        onNavigateToVehicles();
      }
    }
  };

  const handleManualTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testCodeInput.trim()) return;
    applyCoupon(testCodeInput.trim());
    setTestCodeInput('');
  };

  return (
    <div className="py-8 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-950/80 via-zinc-900 to-zinc-950 border border-red-500/30 p-6 sm:p-10 shadow-2xl space-y-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-semibold uppercase tracking-wider">
              <Percent className="w-3.5 h-3.5" />
              <span>Verified Apex Tesla Promotions & Vouchers</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-white">
              DISCOUNT CODES & FREE REWARDS
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Unlock instant percentage savings, free promotional wheel spins, $1,000 vehicle discounts, and complimentary enclosed nationwide delivery. Click any code to copy or apply directly to your active order.
            </p>
          </div>

          {/* Quick Active Coupon Pill if one is applied */}
          {activeCoupon && (
            <div className="inline-flex items-center gap-2 p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Active Code: <strong className="font-mono text-white">{activeCoupon.code}</strong> (
                {activeCoupon.discountType === 'percentage'
                  ? `${activeCoupon.discountValue}% OFF`
                  : activeCoupon.discountType === 'fixed_usd'
                  ? `$${activeCoupon.discountValue} OFF`
                  : 'Free Shipping'}
                ) applied to your session!
              </span>
            </div>
          )}
        </div>

        {/* Category Filter Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                    active
                      ? 'bg-red-600 text-white shadow-lg shadow-red-950/40'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search code or perk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => {
            const isCopied = copiedCode === coupon.code;
            const isApplied = activeCoupon?.id === coupon.id;

            return (
              <div
                key={coupon.id}
                className={`relative rounded-3xl p-6 bg-zinc-950/90 border transition-all duration-300 flex flex-col justify-between space-y-5 hover:shadow-2xl hover:shadow-red-950/20 ${
                  isApplied
                    ? 'border-emerald-500 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Top Badge & Valid For */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30">
                    {coupon.badge || 'PROMO CODE'}
                  </span>

                  <span className="text-[11px] font-medium text-zinc-400 capitalize">
                    Valid for: <strong className="text-zinc-200">{coupon.validFor}</strong>
                  </span>
                </div>

                {/* Main Discount Display */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-heading font-black text-white">
                      {coupon.discountType === 'percentage' && `${coupon.discountValue}% OFF`}
                      {coupon.discountType === 'fixed_usd' && `$${coupon.discountValue} OFF`}
                      {coupon.discountType === 'free_spins' && `${coupon.discountValue} FREE SPINS`}
                      {coupon.discountType === 'free_shipping' && `FREE SHIPPING`}
                    </span>
                  </div>

                  <h4 className="font-heading font-bold text-base text-zinc-100">{coupon.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{coupon.description}</p>
                </div>

                {/* Interactive Coupon Code Snippet Box */}
                <div className="p-3 rounded-2xl bg-zinc-900 border border-dashed border-zinc-700 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-mono text-zinc-500 block">Promo Code</span>
                    <span className="font-mono font-black text-base text-yellow-400 tracking-wider">
                      {coupon.code}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(coupon.code)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-bold text-white flex items-center gap-1.5 transition"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>COPY</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Additional Details & Limitations */}
                <div className="space-y-1.5 text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
                  {coupon.minSpendUsd && (
                    <div className="flex justify-between">
                      <span>Minimum Purchase:</span>
                      <span className="text-zinc-300 font-mono">${coupon.minSpendUsd.toLocaleString()} USD</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Times Redeemed:</span>
                    <span className="text-zinc-300 font-mono">{coupon.timesUsed.toLocaleString()} times</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valid Through:</span>
                    <span className="text-zinc-300 font-mono">{coupon.expiresAt}</span>
                  </div>
                </div>

                {/* Action CTA Button */}
                <button
                  onClick={() => handleApplyCouponDirectly(coupon)}
                  className={`w-full py-2.5 px-4 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 transition shadow-md ${
                    isApplied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white shadow-red-950/40'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Code Active on Session</span>
                    </>
                  ) : coupon.discountType === 'free_spins' ? (
                    <>
                      <Gift className="w-4 h-4" />
                      <span>Claim 5 Free Spins</span>
                    </>
                  ) : (
                    <>
                      <span>Apply Code Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Enter Custom Promo Code Tester Box */}
        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-heading font-bold text-base text-white flex items-center justify-center md:justify-start gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Have a Custom VIP / Influencer Code?</span>
            </h4>
            <p className="text-xs text-zinc-400">
              Enter private referral vouchers, event discount codes, or promotional gift coupons here.
            </p>
          </div>

          <form onSubmit={handleManualTestSubmit} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="e.g. CYBER20, FREESPINS5"
              value={testCodeInput}
              onChange={(e) => setTestCodeInput(e.target.value)}
              className="px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 uppercase font-mono font-bold focus:outline-none focus:border-red-500 w-full sm:w-56"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shrink-0 shadow-md transition"
            >
              Redeem
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
