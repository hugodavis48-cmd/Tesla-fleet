import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Plus, Tag, Sparkles } from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeposit: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onOpenDeposit }) => {
  const {
    currentUser,
    cart,
    removeFromCart,
    addToCart,
    checkoutCart,
    balances,
    lockedWinBalanceUsd,
    minDepositToActivateWinsUsd,
    openWinActivationPopup,
    activeCoupon,
    applyCoupon,
    removeCoupon,
    formatCurrency,
  } = useApp();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotalUsd = cart.reduce((acc, item) => acc + item.product.priceUsd * item.quantity, 0);

  // Calculate coupon discount
  let discountUsd = 0;
  if (activeCoupon && (activeCoupon.validFor === 'all' || activeCoupon.validFor === 'products')) {
    if (activeCoupon.discountType === 'percentage') {
      discountUsd = (subtotalUsd * activeCoupon.discountValue) / 100;
      if (activeCoupon.maxDiscountUsd && discountUsd > activeCoupon.maxDiscountUsd) {
        discountUsd = activeCoupon.maxDiscountUsd;
      }
    } else if (activeCoupon.discountType === 'fixed_usd') {
      discountUsd = Math.min(subtotalUsd, activeCoupon.discountValue);
    }
  }

  const finalTotalUsd = Math.max(0, subtotalUsd - discountUsd);
  const hasSufficientBalance = balances.usd >= finalTotalUsd;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError(null);
    const result = applyCoupon(couponInput.trim(), 'products');
    if (!result.success) {
      setCouponError(result.message);
    } else {
      setCouponInput('');
    }
  };

  const handleCheckout = () => {
    if (!hasSufficientBalance && lockedWinBalanceUsd > 0 && (currentUser?.totalDepositedUsd || 0) < minDepositToActivateWinsUsd) {
      openWinActivationPopup({
        actionLabel: 'Store Checkout',
        prizeAmountUsd: lockedWinBalanceUsd,
      });
      return;
    }
    if (checkoutCart()) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100">
        <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-red-500" />
            <h3 className="font-heading font-bold text-lg text-white">Tesla Parts & Accessories Cart</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[50vh] overflow-y-auto space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto" />
              <p className="text-zinc-400 text-sm">Your order cart is currently empty.</p>
              <p className="text-xs text-zinc-500">Explore our custom body wraps, yoke steering retrofits, and carbon aero kits!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-white truncate">{item.product.name}</h4>
                  <p className="text-xs text-zinc-400">{formatCurrency(item.product.priceUsd)} each</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono text-zinc-300">Qty: {item.quantity}</span>
                    <button
                      onClick={() => addToCart(item.product)}
                      className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-heading font-bold text-sm text-red-400 tabular-nums">
                    {formatCurrency(item.product.priceUsd * item.quantity)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 bg-zinc-900/90 border-t border-zinc-800 space-y-4">
            {/* Promo Code Entry Box */}
            <div className="space-y-1.5">
              {activeCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-red-400" />
                    <div>
                      <span className="font-mono font-bold text-red-300">{activeCoupon.code}</span>
                      <span className="text-zinc-400 ml-2">({activeCoupon.title})</span>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
                    title="Remove coupon"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError(null);
                      }}
                      placeholder="Enter promo coupon (e.g. CYBER20)"
                      className="w-full pl-8 pr-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 uppercase font-mono focus:outline-none focus:border-red-500"
                    />
                    <Tag className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-400 pl-1">{couponError}</p>}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center text-zinc-400">
                <span>Subtotal:</span>
                <span className="font-mono text-zinc-200 tabular-nums">{formatCurrency(subtotalUsd, { includeCode: true })}</span>
              </div>
              {discountUsd > 0 && (
                <div className="flex justify-between items-center text-emerald-400 font-semibold">
                  <span>Coupon Discount ({activeCoupon?.code}):</span>
                  <span className="font-mono tabular-nums">- {formatCurrency(discountUsd, { includeCode: true })}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-zinc-400">
                <span>Nationwide Shipping:</span>
                <span className="text-emerald-400 font-semibold">FREE ({formatCurrency(0)})</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-zinc-800">
                <span className="text-zinc-200">Total Due:</span>
                <span className="font-heading font-black text-xl text-white tabular-nums">
                  {formatCurrency(finalTotalUsd, { includeCode: true })}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-400">Spendable Vault Balance:</span>
              <span className={`font-semibold tabular-nums ${hasSufficientBalance ? 'text-emerald-400' : 'text-amber-400'}`}>
                {formatCurrency(balances.usd, { includeCode: true })}
              </span>
            </div>

            {!hasSufficientBalance ? (
              <div className="space-y-2">
                {lockedWinBalanceUsd > 0 && (currentUser?.totalDepositedUsd || 0) < minDepositToActivateWinsUsd && (
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-heading font-bold text-xs shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>Pay with Vault &amp; Promotional Winnings</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    onClose();
                    onOpenDeposit();
                  }}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>Deposit Funds via Crypto (USDT, BTC, XRP, BNB)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-zinc-500 text-center">Short by ${(finalTotalUsd - balances.usd).toFixed(2)} USD</p>
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-heading font-bold text-sm shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Instant Checkout from Vault Balance</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Includes 2-Year Apex Warranty & Tesla Certified Fitment Guarantee</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
