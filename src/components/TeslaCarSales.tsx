import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TeslaCarListing, ShippingAddress, Coupon } from '../types';
import {
  Car,
  Truck,
  ShieldCheck,
  Zap,
  Gauge,
  BatteryCharging,
  Compass,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Search,
  SlidersHorizontal,
  X,
  Info,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Check,
  AlertCircle,
  ShoppingBag,
  Tag,
  Star,
  Globe,
  Maximize2,
} from 'lucide-react';
import { ReviewComponent } from './ReviewComponent';
import { ImageLightbox } from './ImageLightbox';

interface TeslaCarSalesProps {
  onOpenDeposit: () => void;
  onNavigateToDashboard?: () => void;
  onOpenAuth?: () => void;
  isHomeTeaser?: boolean;
  onViewAll?: () => void;
}

export const TeslaCarSales: React.FC<TeslaCarSalesProps> = ({
  onOpenDeposit,
  onNavigateToDashboard,
  onOpenAuth,
  isHomeTeaser = false,
  onViewAll,
}) => {
  const {
    teslaCarListings,
    nationwideShippingSettings,
    vehicleRefundPolicy,
    placeVehicleOrder,
    balances,
    currentUser,
    addToCart,
    showToast,
    coupons,
    reviews,
    currencies,
    selectedCurrencyCode,
    setSelectedCurrencyCode,
    formatCurrency,
  } = useApp();

  const [selectedModelFilter, setSelectedModelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'range' | 'accel'>('featured');

  // Selected car for details modal
  const [viewingCar, setViewingCar] = useState<TeslaCarListing | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Selected car for checkout / ordering modal
  const [orderingCar, setOrderingCar] = useState<TeslaCarListing | null>(null);
  const [appliedVehicleCoupon, setAppliedVehicleCoupon] = useState<Coupon | null>(null);
  const [vehicleCouponInput, setVehicleCouponInput] = useState('');
  const [vehicleCouponError, setVehicleCouponError] = useState<string | null>(null);

  // Order submission form state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: currentUser?.name || '',
    street: '45500 Fremont Blvd',
    apartmentOrSuite: 'Executive Suite 400',
    city: 'Fremont',
    state: 'CA',
    zipCode: '94538',
    phone: currentUser?.phone || '',
    deliveryMethod: 'enclosed_carrier',
    deliveryNotes: 'Gated private estate, call 1 hour prior to arrival.',
  });

  const [refundPolicyAccepted, setRefundPolicyAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'vault_balance' | 'crypto_instant' | 'bank_wire'>('vault_balance');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccessDetails, setOrderSuccessDetails] = useState<{
    orderId: string;
    trackingNumber?: string;
    vin?: string;
  } | null>(null);

  // Policy terms detail modal
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Model filter options
  const modelTabs = [
    { id: 'all', label: 'All Models' },
    { id: 'Cybertruck', label: 'Cybertruck' },
    { id: 'Model S', label: 'Model S' },
    { id: 'Model 3', label: 'Model 3' },
    { id: 'Model X', label: 'Model X' },
    { id: 'Model Y', label: 'Model Y' },
    { id: 'Roadster', label: 'Roadster' },
  ];

  // Check if current user is eligible for free shipping
  const userTier = currentUser?.tier || 'Standard';
  const isFreeShippingEligible = nationwideShippingSettings.freeShippingEligibleTiers.includes(userTier);

  // Filter & sort cars
  const filteredCars = useMemo(() => {
    return teslaCarListings
      .filter((car) => {
        if (selectedModelFilter !== 'all' && car.model !== selectedModelFilter) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          car.model.toLowerCase().includes(q) ||
          car.trim.toLowerCase().includes(q) ||
          car.color.toLowerCase().includes(q) ||
          car.driveTrain.toLowerCase().includes(q) ||
          car.description.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'featured') return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        if (sortBy === 'price_asc') return a.salePriceUsd - b.salePriceUsd;
        if (sortBy === 'price_desc') return b.salePriceUsd - a.salePriceUsd;
        if (sortBy === 'range') return b.rangeMiles - a.rangeMiles;
        if (sortBy === 'accel') {
          const accelA = parseFloat(a.zeroToSixty);
          const accelB = parseFloat(b.zeroToSixty);
          return accelA - accelB;
        }
        return 0;
      });
  }, [teslaCarListings, selectedModelFilter, searchQuery, sortBy]);

  const displayedCars = isHomeTeaser ? filteredCars.slice(0, 6) : filteredCars;

  const promptAuth = (action: string) => {
    showToast(`Please sign in or register to ${action}.`, 'error');
    if (onOpenAuth) {
      onOpenAuth();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('apex:require-auth'));
    }
  };

  const handleStartOrder = (car: TeslaCarListing) => {
    if (!currentUser) {
      promptAuth('place a Tesla vehicle order');
      return;
    }
    setOrderingCar(car);
    setOrderSuccessDetails(null);
    setRefundPolicyAccepted(false);
    setAppliedVehicleCoupon(null);
    setVehicleCouponInput('');
    setVehicleCouponError(null);
  };

  const handleApplyVehicleCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      promptAuth('apply promo coupons');
      return;
    }
    if (!vehicleCouponInput.trim()) return;
    setVehicleCouponError(null);
    const code = vehicleCouponInput.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === code && c.isActive);
    if (!found) {
      setVehicleCouponError('Invalid or expired coupon code.');
      return;
    }
    if (found.validFor !== 'all' && found.validFor !== 'vehicles') {
      setVehicleCouponError(`Coupon ${found.code} is valid for ${found.validFor}, not vehicle orders.`);
      return;
    }
    setAppliedVehicleCoupon(found);
    setVehicleCouponInput('');
    showToast(`Applied coupon ${found.code}: ${found.title}`, 'success');
  };

  const handleConfirmOrder = async () => {
    if (!currentUser) {
      promptAuth('confirm a vehicle order');
      return;
    }
    if (!orderingCar) return;

    if (!shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      showToast('Please complete all required shipping address fields.', 'error');
      return;
    }

    if (!refundPolicyAccepted) {
      showToast('Please accept the 7-Day 100% Money-Back Guarantee policy to continue.', 'error');
      return;
    }

    let shippingFee = isFreeShippingEligible ? 0 : (orderingCar.nationwideShippingFeeUsd || nationwideShippingSettings.flatFeeUsd);
    let discountUsd = 0;
    if (appliedVehicleCoupon) {
      if (appliedVehicleCoupon.discountType === 'free_shipping') {
        shippingFee = 0;
      } else if (appliedVehicleCoupon.discountType === 'fixed_usd') {
        discountUsd = appliedVehicleCoupon.discountValue;
      } else if (appliedVehicleCoupon.discountType === 'percentage') {
        discountUsd = (orderingCar.salePriceUsd * appliedVehicleCoupon.discountValue) / 100;
        if (appliedVehicleCoupon.maxDiscountUsd && discountUsd > appliedVehicleCoupon.maxDiscountUsd) {
          discountUsd = appliedVehicleCoupon.maxDiscountUsd;
        }
      }
    }
    const totalDue = Math.max(0, orderingCar.salePriceUsd + shippingFee - discountUsd);

    if (paymentMethod === 'vault_balance' && balances.usd < totalDue) {
      showToast(`Insufficient vault balance ($${balances.usd.toFixed(2)} USD). Please deposit or select crypto payment.`, 'error');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const res = await placeVehicleOrder(orderingCar, shippingAddress, paymentMethod, appliedVehicleCoupon);
      if (res.success && res.orderId) {
        setOrderSuccessDetails({
          orderId: res.orderId,
          trackingNumber: `APX-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
          vin: orderingCar.vin || `5YJ${orderingCar.model[0]}E${Date.now().toString().slice(-8)}`,
        });
      }
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleAddToCartAsMerch = (car: TeslaCarListing) => {
    if (!currentUser) {
      promptAuth('add a Tesla vehicle to your cart');
      return;
    }
    // Add vehicle deposit / reservation token to cart
    addToCart({
      id: car.id,
      name: `Tesla ${car.model} ${car.trim} (Vehicle Reservation)`,
      priceUsd: car.salePriceUsd,
      category: 'Vehicle Sales',
      image: car.image,
      description: `${car.year} Tesla ${car.model} in ${car.color}. Includes Nationwide Enclosed Delivery and 7-Day Money-Back Guarantee.`,
      inStock: car.inStock,
    });
    showToast(`Added ${car.model} ${car.trim} to your cart!`, 'success');
  };

  return (
    <div className={`text-slate-100 ${isHomeTeaser ? 'py-12' : 'py-8'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-semibold tracking-wider uppercase">
              <Car className="w-3.5 h-3.5" />
              <span>Official Tesla Vehicle Sales & Direct Delivery</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white">
              NEW & PERFORMANCE TESLA INVENTORY
            </h2>
            <p className="text-zinc-400 text-sm max-w-2xl">
              Factory original Tesla specifications with guaranteed MSRP pricing. Complete with enclosed nationwide carrier delivery to your door and our ironclad 7-Day / 1,000-Mile 100% Money-Back Guarantee.
            </p>
          </div>

          {/* Quick Pillars */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
              <Truck className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-zinc-300 font-semibold block">Nationwide Shipping</span>
                <span className="text-[11px] text-zinc-400">
                  {isFreeShippingEligible ? 'Free for Plaid Members' : `${formatCurrency(nationwideShippingSettings.flatFeeUsd)} Enclosed Flat-Rate`}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowPolicyModal(true)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-zinc-900/80 border border-emerald-500/30 hover:border-emerald-500 text-xs transition group"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition" />
              <div className="text-left">
                <span className="text-emerald-400 font-semibold block flex items-center gap-1">
                  <span>7-Day Return Guarantee</span>
                  <Info className="w-3 h-3 text-zinc-400" />
                </span>
                <span className="text-[11px] text-zinc-400">100% Money-Back Policy</span>
              </div>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Model Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {modelTabs.map((tab) => {
                const active = selectedModelFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedModelFilter(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      active
                        ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                        : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search & Sort Controls */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search trim, color, HP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
                >
                  <option value="featured" className="bg-zinc-900">Featured</option>
                  <option value="price_asc" className="bg-zinc-900">Price: Low to High</option>
                  <option value="price_desc" className="bg-zinc-900">Price: High to Low</option>
                  <option value="range" className="bg-zinc-900">Longest Range</option>
                  <option value="accel" className="bg-zinc-900">Fastest 0-60</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300">
                <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <select
                  aria-label="Vehicle Price Currency"
                  value={selectedCurrencyCode}
                  onChange={(e) => setSelectedCurrencyCode(e.target.value)}
                  className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none cursor-pointer"
                >
                  {currencies
                    .filter((c) => c.isActive)
                    .map((c) => (
                      <option key={c.code} value={c.code} className="bg-zinc-900 text-white">
                        {c.code}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicles Grid */}
        {displayedCars.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/40 rounded-3xl border border-zinc-800 space-y-3">
            <Car className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Tesla Models Match Your Search</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Try adjusting your model filter or clearing the search query to explore our complete 2026 Tesla catalog.
            </p>
            <button
              onClick={() => {
                setSelectedModelFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCars.map((car) => {
              const shippingRate = isFreeShippingEligible ? 0 : (car.nationwideShippingFeeUsd || nationwideShippingSettings.flatFeeUsd);
              return (
                <div
                  key={car.id}
                  className="group relative bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-red-950/20"
                >
                  {/* Image Container with Badges */}
                  <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden">
                    <img
                      src={car.image}
                      alt={`Tesla ${car.model} ${car.trim}`}
                      onClick={() => setLightboxIndex(displayedCars.findIndex((c) => c.id === car.id))}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/30 pointer-events-none" />

                    {/* Model & Year Tag */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-900/90 backdrop-blur-md border border-zinc-700 text-[11px] font-heading font-black text-white tracking-wide">
                        {car.year} {car.model}
                      </span>
                      {car.isFeatured && (
                        <span className="px-2 py-0.5 rounded-md bg-red-600 text-[10px] font-bold text-white tracking-wide uppercase flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Stock Status Badge + Expand Button */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setLightboxIndex(displayedCars.findIndex((c) => c.id === car.id))}
                        className="p-1.5 rounded-lg bg-black/75 hover:bg-red-600 border border-zinc-700 hover:border-red-500 text-white backdrop-blur-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition cursor-pointer"
                        title="Inspect vehicle photo in Lightbox"
                        aria-label={`Inspect ${car.model} photo`}
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 flex items-center gap-1 pointer-events-none">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>In Stock ({car.stockCount})</span>
                      </span>
                    </div>

                    {/* Delivery Estimate Snippet */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-zinc-300 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 pointer-events-none">
                      <span className="flex items-center gap-1.5 text-zinc-300 truncate">
                        <Truck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{car.deliveryEstimate}</span>
                      </span>
                      <span className="font-semibold text-white shrink-0 ml-2 tabular-nums">
                        {shippingRate === 0 ? 'Free Shipping' : `+${formatCurrency(shippingRate)}`}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-heading font-bold text-lg text-white group-hover:text-red-400 transition">
                            Tesla {car.model}
                          </h3>
                          <p className="text-xs text-zinc-400 font-medium truncate">{car.trim}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
                            MSRP ({selectedCurrencyCode})
                          </span>
                          <span className="text-xl font-heading font-black text-white tabular-nums">
                            {formatCurrency(car.salePriceUsd)}
                          </span>
                        </div>
                      </div>

                      {/* Specs Matrix */}
                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-800/80">
                        <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-xl p-2 text-center">
                          <Gauge className="w-3.5 h-3.5 text-red-400 mx-auto mb-1" />
                          <span className="text-[10px] text-zinc-400 block">0-60 mph</span>
                          <span className="text-xs font-bold text-white font-mono">{car.zeroToSixty}</span>
                        </div>

                        <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-xl p-2 text-center">
                          <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
                          <span className="text-[10px] text-zinc-400 block">EPA Range</span>
                          <span className="text-xs font-bold text-white font-mono">{car.rangeMiles} mi</span>
                        </div>

                        <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-xl p-2 text-center">
                          <Zap className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
                          <span className="text-[10px] text-zinc-400 block">Power</span>
                          <span className="text-xs font-bold text-white font-mono">{car.horsepower} HP</span>
                        </div>

                        <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-xl p-2 text-center">
                          <Compass className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
                          <span className="text-[10px] text-zinc-400 block">Top Speed</span>
                          <span className="text-xs font-bold text-white font-mono">{car.topSpeedMph} mph</span>
                        </div>
                      </div>

                      {/* Exterior Color & Rating / DriveTrain note */}
                      {(() => {
                        const carReviews = reviews.filter((r) => r.targetId === car.id);
                        const avgRating =
                          carReviews.length > 0
                            ? (carReviews.reduce((acc, r) => acc + r.rating, 0) / carReviews.length).toFixed(1)
                            : '4.9';
                        return (
                          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 gap-2">
                            <span className="truncate">Exterior: <strong className="text-zinc-200">{car.color}</strong></span>
                            <button
                              type="button"
                              onClick={() => setViewingCar(car)}
                              className="shrink-0 flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                            >
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{avgRating}</span>
                              <span className="text-zinc-500">({carReviews.length || 1})</span>
                            </button>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-zinc-800/80 flex items-center gap-2">
                      <button
                        onClick={() => setViewingCar(car)}
                        className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition"
                      >
                        Quick Specs
                      </button>

                      <button
                        onClick={() => handleAddToCartAsMerch(car)}
                        title="Add Vehicle to Cart"
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleStartOrder(car)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-heading font-bold text-xs shadow-lg shadow-red-950/50 flex items-center justify-center gap-1.5 transition group"
                      >
                        <span>Order Now</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Button on Home Teaser */}
        {isHomeTeaser && (
          <div className="text-center pt-4">
            <button
              onClick={onViewAll}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-sm transition"
            >
              <span>Explore Complete 2026 Tesla Showroom ({teslaCarListings.length} Vehicles)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Full Verified Vehicle Owner Reviews Section */}
        {!isHomeTeaser && (
          <ReviewComponent
            targetType="vehicle"
            selectableTargets={teslaCarListings.map((c) => ({
              id: c.id,
              name: `${c.year} Tesla ${c.model} ${c.trim}`,
            }))}
            onOpenAuth={onOpenAuth}
          />
        )}
      </div>

      {/* QUICK SPECS & POLICY DETAIL MODAL */}
      {viewingCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-red-400 font-bold tracking-widest uppercase">
                  Apex Tesla Catalog • Official Spec Sheet
                </span>
                <h3 className="text-lg font-heading font-black text-white">
                  {viewingCar.year} Tesla {viewingCar.model} {viewingCar.trim}
                </h3>
              </div>
              <button
                onClick={() => setViewingCar(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-zinc-900 group">
                <img
                  src={viewingCar.image}
                  alt={viewingCar.model}
                  onClick={() => setLightboxIndex(Math.max(0, displayedCars.findIndex((c) => c.id === viewingCar.id)))}
                  className="w-full h-full object-cover cursor-zoom-in"
                />
                <button
                  type="button"
                  onClick={() => setLightboxIndex(Math.max(0, displayedCars.findIndex((c) => c.id === viewingCar.id)))}
                  className="absolute top-3 right-3 px-2.5 py-1.5 rounded-xl bg-black/75 hover:bg-red-600 border border-zinc-700 text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Lightbox</span>
                </button>
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-mono text-zinc-300 pointer-events-none">
                  VIN: {viewingCar.vin || 'Allocated Upon Order Confirmation'}
                </div>
              </div>

              {/* Price & Guarantee Callout */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-zinc-400 block">Total Vehicle Price (Guaranteed MSRP)</span>
                  <span className="text-2xl font-heading font-black text-white tabular-nums">
                    {formatCurrency(viewingCar.salePriceUsd, { includeCode: true })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3.5 py-2 rounded-xl">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Includes 7-Day / 1,000-Mile 100% Refund Protection</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Vehicle Overview</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">{viewingCar.description}</p>
              </div>

              {/* Technical Specifications Matrix */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Engineering & Performance Specs</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">Acceleration 0-60</span>
                    <span className="font-bold text-white font-mono">{viewingCar.zeroToSixty}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">Top Track Speed</span>
                    <span className="font-bold text-white font-mono">{viewingCar.topSpeedMph} mph</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">EPA Estimated Range</span>
                    <span className="font-bold text-white font-mono">{viewingCar.rangeMiles} Miles</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">Peak Output</span>
                    <span className="font-bold text-white font-mono">{viewingCar.horsepower} HP</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">Powertrain</span>
                    <span className="font-bold text-white">{viewingCar.driveTrain}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">Seating Layout</span>
                    <span className="font-bold text-white">{viewingCar.specs.seating}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">Supercharging</span>
                    <span className="font-bold text-white">{viewingCar.specs.superchargingMaxKw}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">Wheel Setup</span>
                    <span className="font-bold text-white">{viewingCar.specs.wheels}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">Autopilot Status</span>
                    <span className="font-bold text-cyan-400">{viewingCar.autopilotType}</span>
                  </div>
                </div>
              </div>

              {/* Delivery & Warranty Terms */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Nationwide Shipping Turnaround:</span>
                  <span className="font-semibold text-white">{viewingCar.deliveryEstimate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Tesla Factory Warranty:</span>
                  <span className="font-semibold text-white">{viewingCar.warrantyDetails}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Enclosed Carrier Partners:</span>
                  <span className="font-semibold text-zinc-300">Reliable Carriers, Apex Logistics</span>
                </div>
              </div>

              {/* Verified Reviews inside Spec Modal */}
              <ReviewComponent
                targetType="vehicle"
                targetId={viewingCar.id}
                targetName={`${viewingCar.year} Tesla ${viewingCar.model} ${viewingCar.trim}`}
                onOpenAuth={onOpenAuth}
                compact
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setViewingCar(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
              >
                Close Spec Sheet
              </button>

              <button
                onClick={() => {
                  const car = viewingCar;
                  setViewingCar(null);
                  handleStartOrder(car);
                }}
                className="flex-1 max-w-xs py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-heading font-bold text-xs shadow-lg shadow-red-950/40 flex items-center justify-center gap-2"
              >
                <span>Proceed to Order & Delivery</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NATIONWIDE SHIPPING & ORDER CHECKOUT MODAL */}
      {orderingCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-white">
                    Nationwide Delivery & Vehicle Order
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Tesla {orderingCar.model} {orderingCar.trim} • Enclosed Carrier Direct to Driveway
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOrderingCar(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {orderSuccessDetails ? (
                /* ORDER CONFIRMED SUCCESS VIEW */
                <div className="py-8 text-center space-y-6 animate-in zoom-in-95">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-950/50">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-heading font-black text-white">
                      Vehicle Order & Nationwide Dispatch Confirmed!
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto">
                      Congratulations! Your Tesla {orderingCar.model} has been scheduled for priority enclosed carrier transportation. Our logistics dispatch team has notified the regional carrier.
                    </p>
                  </div>

                  {/* Cryptographic Order Card */}
                  <div className="max-w-md mx-auto p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-left font-mono text-xs space-y-2.5">
                    <div className="flex justify-between items-center text-zinc-400 pb-2 border-b border-zinc-800">
                      <span>Order Confirmation:</span>
                      <strong className="text-white">{orderSuccessDetails.orderId}</strong>
                    </div>
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>Assigned VIN:</span>
                      <strong className="text-cyan-400">{orderSuccessDetails.vin}</strong>
                    </div>
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>Carrier Tracking #:</span>
                      <strong className="text-emerald-400">{orderSuccessDetails.trackingNumber}</strong>
                    </div>
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>Destination:</span>
                      <span className="text-zinc-200 text-right truncate">{shippingAddress.city}, {shippingAddress.state}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-400 pt-2 border-t border-zinc-800">
                      <span>Protection:</span>
                      <span className="text-emerald-400 font-sans font-bold">7-Day / 1,000-Mi 100% Money-Back</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setOrderingCar(null);
                        if (onNavigateToDashboard) onNavigateToDashboard();
                      }}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs"
                    >
                      View Order in Dashboard
                    </button>

                    <button
                      onClick={() => setOrderingCar(null)}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/40"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              ) : (
                /* ORDER FORM */
                <div className="space-y-6">
                  {/* Vehicle Summary Snippet */}
                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-4">
                    <img
                      src={orderingCar.image}
                      alt={orderingCar.model}
                      className="w-20 h-14 object-cover rounded-xl border border-zinc-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-black text-sm text-white truncate">
                        {orderingCar.year} Tesla {orderingCar.model} {orderingCar.trim}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate">
                        Color: {orderingCar.color} • Interior: {orderingCar.interiorColor}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-zinc-500 uppercase block">Vehicle Price</span>
                      <span className="text-base font-heading font-black text-white tabular-nums">
                        {formatCurrency(orderingCar.salePriceUsd)}
                      </span>
                    </div>
                  </div>

                  {/* Step 1: Delivery Shipping Address */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-red-500" />
                        <span>1. Nationwide Delivery Address (Driveway Drop-off)</span>
                      </h4>
                      <span className="text-[11px] text-zinc-500">All 50 US States Covered</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Full Legal Name (as on Title)</label>
                        <input
                          type="text"
                          value={shippingAddress.fullName}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                          placeholder="Alex Vance"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Phone Number for Carrier Dispatch</label>
                        <input
                          type="text"
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-zinc-400 mb-1">Delivery Street Address</label>
                        <input
                          type="text"
                          value={shippingAddress.street}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                          placeholder="45500 Fremont Blvd"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Apartment, Suite, or Unit (Optional)</label>
                        <input
                          type="text"
                          value={shippingAddress.apartmentOrSuite || ''}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, apartmentOrSuite: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                          placeholder="Suite 400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">City</label>
                        <input
                          type="text"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                          placeholder="Fremont"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">State / Province</label>
                        <input
                          type="text"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                          placeholder="CA"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">ZIP / Postal Code</label>
                        <input
                          type="text"
                          value={shippingAddress.zipCode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                          placeholder="94538"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-zinc-400 mb-1">Carrier Delivery Notes</label>
                        <input
                          type="text"
                          value={shippingAddress.deliveryNotes || ''}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, deliveryNotes: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                          placeholder="Wide driveway available, security gate access code, etc."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Shipping Method & Rate */}
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-cyan-400" />
                        <span>Enclosed Carrier Transport Rate</span>
                      </span>
                      <span className="text-xs font-semibold text-emerald-400">
                        {isFreeShippingEligible ? 'FREE (Plaid Member Perk)' : `$${nationwideShippingSettings.flatFeeUsd.toLocaleString()} Flat Rate`}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400">
                      Transported exclusively in climate-controlled enclosed carriers by Reliable Carriers & Apex Dedicated Logistics to ensure zero road debris or paint chips.
                    </p>
                  </div>

                  {/* Step 3: Payment Method Selection */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      2. Payment Method
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('vault_balance')}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                          paymentMethod === 'vault_balance'
                            ? 'bg-red-600/10 border-red-500 text-white'
                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-white">Vault Balance</span>
                          {paymentMethod === 'vault_balance' && <Check className="w-3.5 h-3.5 text-red-500" />}
                        </div>
                        <span className="text-[11px] text-zinc-400">Available: ${balances.usd.toFixed(2)} USD</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('crypto_instant')}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                          paymentMethod === 'crypto_instant'
                            ? 'bg-red-600/10 border-red-500 text-white'
                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-white">Crypto Escrow</span>
                          {paymentMethod === 'crypto_instant' && <Check className="w-3.5 h-3.5 text-red-500" />}
                        </div>
                        <span className="text-[11px] text-zinc-400">USDT, BTC, XRP, BNB</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bank_wire')}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                          paymentMethod === 'bank_wire'
                            ? 'bg-red-600/10 border-red-500 text-white'
                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-white">Bank Wire / Fedwire</span>
                          {paymentMethod === 'bank_wire' && <Check className="w-3.5 h-3.5 text-red-500" />}
                        </div>
                        <span className="text-[11px] text-zinc-400">Institutional Escrow</span>
                      </button>
                    </div>
                  </div>

                  {/* Step 4: 7-Day Money Back Guarantee Refund Policy Acceptance */}
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="refundAgreement"
                        checked={refundPolicyAccepted}
                        onChange={(e) => setRefundPolicyAccepted(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-zinc-700 text-red-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-emerald-500"
                      />
                      <label htmlFor="refundAgreement" className="text-xs text-zinc-300 leading-relaxed cursor-pointer">
                        <strong className="text-emerald-400 block mb-0.5">
                          I accept the 7-Day / 1,000-Mile 100% Money-Back Guarantee Refund Terms
                        </strong>
                        I understand that upon delivery, I have {vehicleRefundPolicy.trialDays} days or up to {vehicleRefundPolicy.maxMileage.toLocaleString()} miles to road-test my Tesla. If I am not completely satisfied for any reason, Apex Tesla Hub will provide a 100% full refund and arrange complimentary enclosed carrier return pickup.
                      </label>
                    </div>
                  </div>

                  {/* Step 5: Vehicle Promo Code or Voucher */}
                  <div className="space-y-1.5">
                    {appliedVehicleCoupon ? (
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-red-400" />
                          <div>
                            <span className="font-mono font-bold text-red-300">{appliedVehicleCoupon.code}</span>
                            <span className="text-zinc-400 ml-2">({appliedVehicleCoupon.title})</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAppliedVehicleCoupon(null)}
                          className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyVehicleCoupon} className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={vehicleCouponInput}
                            onChange={(e) => {
                              setVehicleCouponInput(e.target.value.toUpperCase());
                              setVehicleCouponError(null);
                            }}
                            placeholder="Promo coupon code (e.g. TESLAPLAID, APEXSHIP)"
                            className="w-full pl-8 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 uppercase font-mono focus:outline-none focus:border-red-500"
                          />
                          <Tag className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition"
                        >
                          Apply Code
                        </button>
                      </form>
                    )}
                    {vehicleCouponError && <p className="text-[11px] text-rose-400 pl-1">{vehicleCouponError}</p>}
                  </div>

                  {/* Financial Settlement Breakdown */}
                  {(() => {
                    let shippingFee = isFreeShippingEligible ? 0 : (orderingCar.nationwideShippingFeeUsd || nationwideShippingSettings.flatFeeUsd);
                    let discountUsd = 0;
                    if (appliedVehicleCoupon) {
                      if (appliedVehicleCoupon.discountType === 'free_shipping') {
                        shippingFee = 0;
                      } else if (appliedVehicleCoupon.discountType === 'fixed_usd') {
                        discountUsd = appliedVehicleCoupon.discountValue;
                      } else if (appliedVehicleCoupon.discountType === 'percentage') {
                        discountUsd = (orderingCar.salePriceUsd * appliedVehicleCoupon.discountValue) / 100;
                        if (appliedVehicleCoupon.maxDiscountUsd && discountUsd > appliedVehicleCoupon.maxDiscountUsd) {
                          discountUsd = appliedVehicleCoupon.maxDiscountUsd;
                        }
                      }
                    }
                    const totalDue = Math.max(0, orderingCar.salePriceUsd + shippingFee - discountUsd);
                    const hasSufficient = balances.usd >= totalDue;

                    return (
                      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                        <div className="flex justify-between text-xs text-zinc-400">
                          <span>Tesla {orderingCar.model} {orderingCar.trim}:</span>
                          <span className="text-white font-mono tabular-nums">{formatCurrency(orderingCar.salePriceUsd, { includeCode: true })}</span>
                        </div>
                        <div className="flex justify-between text-xs text-zinc-400">
                          <span>Nationwide Enclosed Transport:</span>
                          <span className={shippingFee === 0 ? 'text-emerald-400 font-bold' : 'text-white font-mono tabular-nums'}>
                            {shippingFee === 0 ? 'Free Member Delivery' : formatCurrency(shippingFee, { includeCode: true })}
                          </span>
                        </div>
                        {discountUsd > 0 && (
                          <div className="flex justify-between text-xs text-emerald-400 font-semibold">
                            <span>Coupon Discount ({appliedVehicleCoupon?.code}):</span>
                            <span className="font-mono tabular-nums">- {formatCurrency(discountUsd, { includeCode: true })}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs text-zinc-400">
                          <span>Title, Documentation & Temp Registration:</span>
                          <span className="text-emerald-400 font-semibold font-mono">Included ({formatCurrency(0)})</span>
                        </div>

                        <hr className="border-zinc-800 my-2" />

                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-white">Total Delivery Settlement:</span>
                          <span className="text-xl font-heading font-black text-red-400 tabular-nums">
                            {formatCurrency(totalDue, { includeCode: true })}
                          </span>
                        </div>

                        {paymentMethod === 'vault_balance' && !hasSufficient && (
                          <div className="pt-2 text-xs text-amber-400 flex items-center justify-between">
                            <span className="flex items-center gap-1 tabular-nums">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              Short by {formatCurrency(totalDue - balances.usd, { includeCode: true })}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setOrderingCar(null);
                                onOpenDeposit();
                              }}
                              className="underline text-white font-semibold hover:text-amber-300"
                            >
                              Deposit Funds Now
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!orderSuccessDetails && (
              <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setOrderingCar(null)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={isSubmittingOrder || !refundPolicyAccepted}
                  className="flex-1 max-w-sm py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 text-white font-heading font-bold text-xs shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isSubmittingOrder ? (
                    <span>Allocating VIN & Carrier...</span>
                  ) : (
                    <>
                      <span>Confirm Order & Dispatch Carrier</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7-DAY REFUND POLICY TERMS MODAL */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-heading font-bold text-lg text-white">7-Day Money-Back Guarantee</h3>
              </div>
              <button onClick={() => setShowPolicyModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed max-h-[60vh] overflow-y-auto">
              <p>{vehicleRefundPolicy.termsSummary}</p>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Evaluation Window:</span>
                  <strong className="text-white">{vehicleRefundPolicy.trialDays} Calendar Days</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Mileage Limit:</span>
                  <strong className="text-white">{vehicleRefundPolicy.maxMileage.toLocaleString()} Miles</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Refund Guarantee:</span>
                  <strong className="text-emerald-400">{vehicleRefundPolicy.moneyBackGuaranteePercent}% Full Refund</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Return Logistics:</span>
                  <strong className="text-cyan-400">Complimentary Enclosed Pickup</strong>
                </div>
              </div>

              <p className="text-[11px] text-zinc-500">
                Vehicle must be in identical condition without unrecorded collision damage or unauthorized mechanical modifications. Refunds are credited back to your original source of payment within 24 hours of vehicle receipt.
              </p>
            </div>

            <button
              onClick={() => setShowPolicyModal(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Vehicle Showroom Lightbox */}
      <ImageLightbox
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        initialIndex={lightboxIndex ?? 0}
        images={displayedCars.map((c) => ({
          url: c.image,
          title: `${c.year} Tesla ${c.model} ${c.trim}`,
          subtitle: `${formatCurrency(c.salePriceUsd, { includeCode: true })} • ${c.rangeMiles} mi range • 0-60 mph in ${c.zeroToSixty}`,
          badge: c.color,
        }))}
      />
    </div>
  );
};
