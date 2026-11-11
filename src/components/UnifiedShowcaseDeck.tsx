import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Zap,
  Car,
  Palette,
  Wrench,
  TrendingUp,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  Flame,
  Star,
  CheckCircle2,
} from 'lucide-react';

interface UnifiedShowcaseDeckProps {
  onNavigate: (tab: string) => void;
  onOpenDeposit: () => void;
  onOpenCart?: () => void;
}

export const UnifiedShowcaseDeck: React.FC<UnifiedShowcaseDeckProps> = ({
  onNavigate,
  onOpenDeposit,
  onOpenCart,
}) => {
  const {
    tslaQuote,
    featuredStockPlans,
    teslaCarListings,
    rentalFleetList,
    productsList,
    addToCart,
    showToast,
  } = useApp();

  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const categories = [
    { id: 'stocks', label: 'Tesla Stocks & Fast ROI', icon: TrendingUp, tab: 'stocks', highlight: 'Min $500' },
    { id: 'vehicles', label: 'Tesla Vehicle Inventory', icon: Car, tab: 'vehicles', highlight: 'Enclosed Delivery' },
    { id: 'wraps', label: 'Custom Wrap Studio', icon: Palette, tab: 'wraps', highlight: '5-Yr Warranty' },
    { id: 'services', label: 'Service & Ranger Bays', icon: Wrench, tab: 'services', highlight: 'Diagnostic Scan' },
    { id: 'rentals', label: 'Performance Fleet Rentals', icon: Zap, tab: 'rentals', highlight: 'Cyberbeast & Plaid' },
    { id: 'products', label: 'Accessories & Upgrades', icon: ShoppingBag, tab: 'shop', highlight: 'Tesla Certified' },
  ];

  // Auto-slide every 7 seconds unless paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % categories.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused, categories.length]);

  return (
    <section
      id="showcase-deck"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 select-none"
    >
      {/* Header and Slide Navigation Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Interactive Catalog Slides Deck</span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
            APEX SHOWCASE & SERVICES
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-xl">
            Slide between live Tesla stock investments, vehicle direct delivery, custom wraps, service bays, and performance rentals.
          </p>
        </div>

        {/* Slide Indicator & Prev/Next Arrows */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {categories.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'w-6 bg-red-500' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
                aria-label={`Jump to slide ${c.label}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + categories.length) % categories.length)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % categories.length)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Navigation (Instant Click to Slide) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          const isActive = currentSlide === idx;
          return (
            <button
              key={cat.id}
              onClick={() => setCurrentSlide(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 shrink-0 border ${
                isActive
                  ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/40 font-bold'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? 'bg-black/30 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {cat.highlight}
              </span>
            </button>
          );
        })}
      </div>

      {/* SLIDE DECK DISPLAY CONTAINER */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950 p-6 sm:p-8 min-h-[480px]">
        {/* ============================================================ */}
        {/* SLIDE 0: TESLA LIVE STOCKS & FAST ROI                        */}
        {/* ============================================================ */}
        {currentSlide === 0 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-400 font-bold uppercase tracking-wider">Featured Stock Opportunities</span>
                  <span className="text-xs text-emerald-400 font-mono font-bold">TSLA ${tslaQuote.price.toFixed(2)} (+{tslaQuote.changePercent}%)</span>
                </div>
                <h3 className="font-heading font-black text-2xl text-white">Tesla Live Stock Telemetry & Fast ROI Plans</h3>
              </div>
              <button
                onClick={() => onNavigate('stocks')}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white flex items-center gap-1.5 transition"
              >
                <span>Open Full TSLA Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featuredStockPlans.slice(0, 3).map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 space-y-4 flex flex-col justify-between hover:border-red-500/50 transition group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 font-bold uppercase">
                        {plan.badge}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">{plan.ticker}</span>
                    </div>
                    <h4 className="font-heading font-bold text-base text-white group-hover:text-red-400 transition">
                      {plan.title}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-2">{plan.description}</p>
                  </div>

                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Target APY:</span>
                      <span className="text-emerald-400 font-bold text-base">{plan.apy}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Cycle Duration:</span>
                      <span className="text-white">{plan.durationDays} Days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Min Investment:</span>
                      <span className="text-yellow-400 font-bold">${plan.minInvestmentUsd.toLocaleString()} USD</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('stocks')}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
                  >
                    <span>Invest Now (Min $500)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SLIDE 1: TESLA VEHICLE INVENTORY DIRECT DELIVERY             */}
        {/* ============================================================ */}
        {currentSlide === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Direct Tesla Sales</span>
                <h3 className="font-heading font-black text-2xl text-white">Nationwide Enclosed Vehicle Delivery</h3>
              </div>
              <button
                onClick={() => onNavigate('vehicles')}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white flex items-center gap-1.5 transition"
              >
                <span>View All Cars</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {teslaCarListings.slice(0, 3).map((car) => (
                <div
                  key={car.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/70 overflow-hidden flex flex-col justify-between hover:border-cyan-500/50 transition group"
                >
                  <div className="relative h-44 w-full bg-zinc-950 overflow-hidden">
                    <img
                      src={car.image}
                      alt={car.trim}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur border border-white/10 text-[10px] font-bold text-white uppercase">
                      {car.model}
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-base text-white">{car.trim}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{car.rangeMiles} mi range • 0-60 in {car.zeroToSixty}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-800 pt-2 text-xs">
                      <span className="font-mono font-black text-lg text-white">
                        ${car.salePriceUsd.toLocaleString()}
                      </span>
                      <span className="text-cyan-400 font-semibold">{car.deliveryEstimate}</span>
                    </div>

                    <button
                      onClick={() => onNavigate('vehicles')}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs uppercase tracking-wider transition"
                    >
                      Purchase / Reserve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SLIDE 2: CUSTOM WRAP STUDIO & STYLING                        */}
        {/* ============================================================ */}
        {currentSlide === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-yellow-400 font-bold uppercase tracking-wider">Aesthetic Customization</span>
                <h3 className="font-heading font-black text-2xl text-white">Bespoke Vinyl Wraps & PPF Armor</h3>
              </div>
              <button
                onClick={() => onNavigate('wraps')}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white flex items-center gap-1.5 transition"
              >
                <span>Open Custom Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  title: '3M Satin Stealth Black',
                  price: '$3,800',
                  desc: 'Aerospace-grade cast vinyl with hydrophobic ceramic finish and 5-year anti-fade warranty.',
                  img: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
                  badge: 'Most Popular',
                },
                {
                  title: 'Liquid Titanium Chrome',
                  price: '$4,200',
                  desc: 'High-reflectivity metallic gloss cast wrap designed for Cybertruck stainless panels and Model S.',
                  img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
                  badge: 'Cyber Armor',
                },
                {
                  title: 'Electric Miami Cyan & PPF',
                  price: '$4,600',
                  desc: 'Vibrant custom racing livery complete with self-healing front fascia paint protection film.',
                  img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
                  badge: 'Self-Healing',
                },
              ].map((wrap, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/70 overflow-hidden flex flex-col justify-between hover:border-yellow-500/50 transition group"
                >
                  <div className="relative h-44 w-full bg-zinc-950 overflow-hidden">
                    <img
                      src={wrap.img}
                      alt={wrap.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur border border-white/10 text-[10px] font-bold text-yellow-300 uppercase">
                      {wrap.badge}
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-base text-white">{wrap.title}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{wrap.desc}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-800 pt-2 text-xs">
                      <span className="font-mono font-bold text-lg text-white">{wrap.price}</span>
                      <span className="text-yellow-400 font-semibold">Includes Ceramic Coat</span>
                    </div>

                    <button
                      onClick={() => onNavigate('wraps')}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs uppercase tracking-wider transition"
                    >
                      Configure Color
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SLIDE 3: SERVICE SCHEDULER & MECHANICAL BAYS                 */}
        {/* ============================================================ */}
        {currentSlide === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-red-400 font-bold uppercase tracking-wider">Master Maintenance</span>
                <h3 className="font-heading font-black text-2xl text-white">Apex Technology Bays & Mobile Ranger</h3>
              </div>
              <button
                onClick={() => onNavigate('services')}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white flex items-center gap-1.5 transition"
              >
                <span>Book Service Bay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  title: 'HV Battery Health & Cell Profiling',
                  price: '$350',
                  desc: '40-point high voltage telemetry scan, cooling manifold flush, and module degradation diagnostics.',
                  icon: Zap,
                },
                {
                  title: 'Drive Unit & Inverter Calibration',
                  price: '$580',
                  desc: 'Dual and tri-motor pyrofuse inspection, stator bearing alignment, and inverter firmware flash.',
                  icon: Wrench,
                },
                {
                  title: 'Mobile Ranger On-Demand Dispatch',
                  price: '$200',
                  desc: 'Apex certified technician deployed directly to your home or office with high-voltage tools.',
                  icon: Car,
                },
              ].map((svc, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 space-y-4 flex flex-col justify-between hover:border-red-500/50 transition group"
                >
                  <div className="space-y-2">
                    <div className="p-3 w-fit rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                      <svc.icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-heading font-bold text-base text-white group-hover:text-red-400 transition">
                      {svc.title}
                    </h4>
                    <p className="text-xs text-zinc-400">{svc.desc}</p>
                  </div>

                  <div className="border-t border-zinc-850 pt-2 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-base text-white">{svc.price}</span>
                    <span className="text-emerald-400 font-semibold">Bay Allocation Ready</span>
                  </div>

                  <button
                    onClick={() => onNavigate('services')}
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition"
                  >
                    Schedule Slot
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SLIDE 4: PERFORMANCE FLEET RENTALS                           */}
        {/* ============================================================ */}
        {currentSlide === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">High-Velocity Fleet</span>
                <h3 className="font-heading font-black text-2xl text-white">Daily & Weekly Performance Rentals</h3>
              </div>
              <button
                onClick={() => onNavigate('rentals')}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white flex items-center gap-1.5 transition"
              >
                <span>View Full Fleet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {rentalFleetList.slice(0, 3).map((car) => (
                <div
                  key={car.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/70 overflow-hidden flex flex-col justify-between hover:border-emerald-500/50 transition group"
                >
                  <div className="relative h-44 w-full bg-zinc-950 overflow-hidden">
                    <img
                      src={car.image}
                      alt={car.trim}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur border border-white/10 text-[10px] font-bold text-emerald-400 uppercase">
                      {car.horsepower} HP • {car.zeroToSixty} 0-60
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-base text-white">{car.model} {car.trim}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{car.location}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-800 pt-2 text-xs">
                      <div>
                        <span className="font-mono font-black text-lg text-white">${car.dailyRateUsd}</span>
                        <span className="text-zinc-400 text-[10px]"> / day</span>
                      </div>
                      <span className="text-emerald-400 font-semibold">Unlimited Supercharging</span>
                    </div>

                    <button
                      onClick={() => onNavigate('rentals')}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs uppercase tracking-wider transition"
                    >
                      Book Rental
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SLIDE 5: ACCESSORIES & STORE                                 */}
        {/* ============================================================ */}
        {currentSlide === 5 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">Certified Hardware</span>
                <h3 className="font-heading font-black text-2xl text-white">Tesla Carbon Aero & Cabin Upgrades</h3>
              </div>
              <button
                onClick={() => onNavigate('shop')}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white flex items-center gap-1.5 transition"
              >
                <span>Open Parts Store</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  id: 'prod-yoke',
                  name: 'Forged Carbon Yoke Steering Wheel',
                  price: 890,
                  desc: 'Direct plug-and-play retrofit with heating element and perforated Nappa leather grips.',
                  img: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
                },
                {
                  id: 'prod-spoiler',
                  name: 'Track Edition Carbon Fiber Spoiler',
                  price: 650,
                  desc: 'Pre-preg autoclave carbon providing 140 lbs downforce at 100 mph. 3M VHB mounting.',
                  img: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
                },
                {
                  id: 'prod-wall',
                  name: 'Apex Megawatt High-Output Wall Charger',
                  price: 520,
                  desc: '48A level 2 charging station with 24-foot cable and Wi-Fi telematics sync.',
                  img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/70 overflow-hidden flex flex-col justify-between hover:border-purple-500/50 transition group"
                >
                  <div className="relative h-44 w-full bg-zinc-950 overflow-hidden">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-base text-white">{item.name}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-800 pt-2 text-xs">
                      <span className="font-mono font-bold text-lg text-white">${item.price}</span>
                      <span className="text-purple-400 font-semibold">In Stock Fremont Hub</span>
                    </div>

                    <button
                      onClick={() => {
                        addToCart({
                          id: item.id,
                          name: item.name,
                          category: 'Aero & Carbon',
                          priceUsd: item.price,
                          image: item.img,
                          description: item.desc,
                          inStock: true,
                        });
                        showToast(`Added ${item.name} to cart!`, 'success');
                        if (onOpenCart) onOpenCart();
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs uppercase tracking-wider transition"
                    >
                      Add To Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
