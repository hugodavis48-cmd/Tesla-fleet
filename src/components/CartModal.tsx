import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Plus, Minus } from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeposit: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onOpenDeposit }) => {
  const { cart, removeFromCart, addToCart, checkoutCart, balances } = useApp();

  if (!isOpen) return null;

  const totalUsd = cart.reduce((acc, item) => acc + item.product.priceUsd * item.quantity, 0);
  const hasSufficientBalance = balances.usd >= totalUsd;

  const handleCheckout = () => {
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

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
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
                  <p className="text-xs text-zinc-400">${item.product.priceUsd.toLocaleString()} each</p>
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
                  <span className="font-heading font-bold text-sm text-red-400">
                    ${(item.product.priceUsd * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 bg-zinc-900/90 border-t border-zinc-800 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Total Due (Free Shipping):</span>
              <span className="font-heading font-bold text-xl text-white">${totalUsd.toLocaleString()} USD</span>
            </div>

            <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-400">Available Wallet Balance:</span>
              <span className={`font-semibold ${hasSufficientBalance ? 'text-emerald-400' : 'text-amber-400'}`}>
                ${balances.usd.toFixed(2)} USD
              </span>
            </div>

            {!hasSufficientBalance ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenDeposit();
                  }}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <span>Deposit Funds via Crypto (USDT, BTC, XRP, BNB)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-zinc-500 text-center">Short by ${(totalUsd - balances.usd).toFixed(2)} USD</p>
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-heading font-bold text-sm shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition"
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
