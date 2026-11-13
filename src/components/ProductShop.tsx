import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PRODUCTS_CATALOG } from '../data/mockData';
import { ProductItem } from '../types';
import { ReviewComponent } from './ReviewComponent';
import { ShoppingBag, Star, CheckCircle2, ArrowRight, Share2, MessageSquare, X, Maximize2 } from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';

interface ProductShopProps {
  onOpenCart: () => void;
  onOpenDeposit: () => void;
  onOpenAuth?: () => void;
}

export const ProductShop: React.FC<ProductShopProps> = ({ onOpenCart, onOpenAuth }) => {
  const { addToCart, showToast, reviews, productsList, currentUser, formatCurrency, selectedCurrencyCode } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [reviewingProduct, setReviewingProduct] = useState<ProductItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const catalog = productsList.length > 0 ? productsList : PRODUCTS_CATALOG;

  const categories = [
    'All',
    'Vehicle Sales',
    'Wraps & Film',
    'Wheels & Performance',
    'Interior & Yoke',
    'Aero & Carbon',
    'Charging & Tech',
  ];

  const filteredProducts =
    selectedCategory === 'All'
      ? catalog
      : catalog.filter((p) => p.category === selectedCategory);

  const promptAuth = (action: string) => {
    showToast(`Please sign in or register to ${action}.`, 'error');
    if (onOpenAuth) {
      onOpenAuth();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('apex:require-auth'));
    }
  };

  const handleAddToCart = (product: ProductItem) => {
    if (!currentUser) {
      promptAuth('add products to your cart');
      return;
    }
    addToCart(product);
  };

  const handleInstantBuy = (product: ProductItem) => {
    if (!currentUser) {
      promptAuth('purchase Tesla hardware and accessories');
      return;
    }
    addToCart(product);
    onOpenCart();
  };

  return (
    <div id="shop" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Apex OEM & Performance Store</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-5xl text-white">
            TESLA HARDWARE & ACCESSORIES
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mt-1">
            Engineered specifically for Model S Plaid, 3, X, Y, and Cybertruck. Full warranty protection and certified fitment.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const productReviews = reviews.filter((r) => r.targetId === product.id);
          const dynamicRating =
            productReviews.length > 0
              ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
              : (product.rating || 4.9).toFixed(1);
          const dynamicCount = productReviews.length > 0 ? productReviews.length : (product.reviewsCount || 12);

          return (
            <div
              key={product.id}
              className="group rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl hover:border-red-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Product Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-black">
                  <img
                    src={product.image}
                    alt={product.name}
                    onClick={() => setLightboxIndex(filteredProducts.findIndex((item) => item.id === product.id))}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 cursor-zoom-in"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-zinc-700 pointer-events-none">
                    {product.category}
                  </div>
                  <button
                    type="button"
                    onClick={() => setReviewingProduct(product)}
                    className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/80 hover:bg-zinc-900 border border-zinc-700 backdrop-blur-md text-[11px] font-bold text-yellow-400 cursor-pointer transition"
                    title="View & write verified reviews"
                  >
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{dynamicRating}</span>
                    <span className="text-[10px] text-zinc-400 font-normal">({dynamicCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(filteredProducts.findIndex((item) => item.id === product.id))}
                    className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/75 hover:bg-red-600 border border-zinc-700 hover:border-red-500 text-white backdrop-blur-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition cursor-pointer"
                    title="Inspect photo in Lightbox"
                    aria-label={`Inspect ${product.name} photo`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-6 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading font-bold text-base text-white group-hover:text-red-400 transition">
                      {product.name}
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {product.description}
                  </p>

                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-300 font-mono">
                    <span className="text-zinc-500 block text-[9px] uppercase">Compatibility:</span>
                    <span className="truncate block font-semibold text-white">{product.compatibility}</span>
                  </div>
                </div>
              </div>

              {/* Price & Cart Actions */}
              <div className="p-6 pt-0 border-t border-zinc-900 mt-2 space-y-3">
                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">Price ({selectedCurrencyCode})</span>
                    <span className="font-heading font-black text-2xl text-white tabular-nums">
                      {formatCurrency(product.priceUsd)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setReviewingProduct(product)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Reviews</span>
                    </button>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>In Stock</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={() => handleInstantBuy(product)}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Buy Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Social Share Bar for Product */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-900/90 text-[10px] text-zinc-400">
                  <span className="font-mono">Share Spec:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const url = encodeURIComponent(window.location.href);
                        const text = encodeURIComponent(`Check out ${product.name} on Apex Tesla Hub!`);
                        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
                      }}
                      title="Share on X"
                      className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-[10px] font-bold cursor-pointer"
                    >
                      𝕏
                    </button>
                    <button
                      onClick={() => {
                        const url = encodeURIComponent(window.location.href);
                        const text = encodeURIComponent(`Check out ${product.name} on Apex Tesla Hub!`);
                        window.open(`https://pinterest.com/pin/create/button/?url=${url}&description=${text}`, '_blank');
                      }}
                      title="Pin to Pinterest"
                      className="px-1.5 py-0.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 text-[10px] font-bold cursor-pointer"
                    >
                      Pin
                    </button>
                    <button
                      onClick={() => {
                        const text = encodeURIComponent(`Check out ${product.name} on Apex Tesla Hub: ${window.location.href}`);
                        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                      }}
                      title="Share on WhatsApp"
                      className="px-1.5 py-0.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-[10px] font-bold cursor-pointer"
                    >
                      WA
                    </button>
                    <button
                      onClick={() => {
                        const url = encodeURIComponent(window.location.href);
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                      }}
                      title="Share on Facebook"
                      className="px-1.5 py-0.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-[10px] font-bold cursor-pointer"
                    >
                      FB
                    </button>
                    <button
                      onClick={() => {
                        const text = encodeURIComponent(`Check out ${product.name} on Apex Tesla Hub: ${window.location.href}`);
                        window.open(`https://threads.net/intent/post?text=${text}`, '_blank');
                      }}
                      title="Share on Threads"
                      className="px-1.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-[10px] font-bold cursor-pointer"
                    >
                      Threads
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/#shop - ${product.name}`);
                        showToast(`Link for "${product.name}" copied!`, 'success');
                      }}
                      title="Copy Link"
                      className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Store-Wide Verified Product Reviews Section */}
      <ReviewComponent
        targetType="product"
        selectableTargets={catalog.map((p) => ({ id: p.id, name: p.name }))}
        onOpenAuth={onOpenAuth}
      />

      {/* Per-Product Review Modal */}
      {reviewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                  Verified Product Ratings & Reviews
                </span>
                <h3 className="font-heading font-black text-base sm:text-lg text-white truncate">
                  {reviewingProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewingProduct(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto">
              <ReviewComponent
                targetType="product"
                targetId={reviewingProduct.id}
                targetName={reviewingProduct.name}
                onOpenAuth={onOpenAuth}
                compact
              />
            </div>
          </div>
        </div>
      )}
      {/* Product Gallery Lightbox */}
      <ImageLightbox
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        initialIndex={lightboxIndex ?? 0}
        images={filteredProducts.map((p) => ({
          url: p.image,
          title: p.name,
          subtitle: `${p.category} • ${formatCurrency(p.priceUsd)} • ${p.compatibility}`,
          badge: p.category,
        }))}
      />
    </div>
  );
};
