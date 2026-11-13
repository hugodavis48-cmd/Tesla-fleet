import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Wrench,
  Palette,
  Car,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  BatteryCharging,
  Gauge,
  Award,
  Activity,
  Flame,
} from 'lucide-react';

interface HeroProps {
  onNavigate: (tab: string) => void;
  onOpenDeposit: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, onOpenDeposit }) => {
  const { tslaQuote, featureToggles, siteSettings } = useApp();
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-zinc-800/80">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[700px] h-[350px] bg-red-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-4 w-[70vw] max-w-[400px] h-[300px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top telemetry pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-red-500/30 text-[11px] sm:text-xs font-semibold text-zinc-300 shadow-lg shadow-red-950/20 max-w-full">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-white font-mono uppercase truncate">{siteSettings.heroBadge || t('hero.badge', 'APEX TESLA ECOSYSTEM 2026')}</span>
          </div>

          {featureToggles.teslaStocksEnabled && (
            <button
              onClick={() => onNavigate('stocks')}
              className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500/60 text-[11px] sm:text-xs font-semibold text-emerald-300 transition hover:scale-105 shadow-lg shadow-emerald-950/20 max-w-full cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
              <span className="font-mono font-bold text-white">NASDAQ: TSLA</span>
              <span className="font-mono text-emerald-400 font-bold">${tslaQuote.price.toFixed(2)}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${tslaQuote.change24h >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                {tslaQuote.change24h >= 0 ? '+' : ''}{tslaQuote.change24h.toFixed(2)}%
              </span>
              <span className="text-[10px] text-zinc-400 hidden xs:inline">Spot &amp; Fast ROI $500+ &rarr;</span>
            </button>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-[11px] sm:text-xs font-semibold text-yellow-300 max-w-full">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin shrink-0" style={{ animationDuration: '6s' }} />
            <span className="truncate">Spin &amp; Win ${siteSettings.maxScratchPrizeUsd.toLocaleString()} Scratch Jackpots Open</span>
          </div>
        </div>


        {/* Hero Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-7xl tracking-tight text-white uppercase leading-[1.08] break-words">
            {siteSettings.heroHeadline || t('hero.title', 'THE ULTIMATE TESLA VEHICLE HUB')}
          </h1>

          <p className="text-zinc-400 text-sm sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            {siteSettings.heroSubtitle || t('hero.subtitle', 'Certified maintenance & diagnostics, bespoke vinyl color wraps, high-downforce custom accessories, exotic fleet rentals, and decentralized vehicle yield pools with seamless crypto funding.')}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-3">
            {featureToggles.teslaStocksEnabled && (
              <button
                onClick={() => onNavigate('stocks')}
                className="w-full sm:w-auto px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 text-white font-heading font-bold text-xs sm:text-sm shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition hover:scale-[1.02] cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-emerald-200 shrink-0" />
                <span>{t('hero.exploreStocks', 'Trade TSLA • Fast ROI & Spot')}</span>
                <Flame className="w-4 h-4 text-amber-300 shrink-0" />
              </button>
            )}

            <button
              onClick={() => onNavigate('vehicles')}
              className="w-full sm:w-auto px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 text-white font-heading font-bold text-xs sm:text-sm shadow-xl shadow-red-950/60 flex items-center justify-center gap-2 transition hover:scale-[1.02] cursor-pointer"
            >
              <Car className="w-4 h-4 text-white shrink-0" />
              <span>{t('hero.buyTesla', 'Buy Tesla • All Models')}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>

            <button
              onClick={() => onNavigate('services')}
              className="flex-1 sm:flex-none px-4 py-3 sm:px-6 sm:py-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-white font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition hover:scale-[1.02] cursor-pointer"
            >
              <Wrench className="w-4 h-4 text-red-400 shrink-0" />
              <span>{t('hero.bookService', 'Book Service & Fixes')}</span>
            </button>

            <button
              onClick={() => onNavigate('wraps')}
              className="flex-1 sm:flex-none px-4 py-3 sm:px-6 sm:py-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-white font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition hover:scale-[1.02] cursor-pointer"
            >
              <Palette className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Custom Wrap Studio</span>
            </button>

            <button
              onClick={() => onNavigate('promotions')}
              className="w-full sm:w-auto px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-amber-600/20 hover:from-yellow-500/30 hover:to-amber-600/30 border border-yellow-500/40 text-yellow-300 font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>{t('hero.spinWin', 'Spin & Win Rewards')}</span>
            </button>
          </div>

        </div>

        {/* Hero Showcase Card with Futuristic Tesla Imagery (Stacked cleanly on <md, Overlay HUD on >=md) */}
        <div className="mt-10 sm:mt-12 relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/80">
          <div className="relative aspect-[16/10] sm:aspect-[2.1/1] lg:aspect-[2.3/1] w-full overflow-hidden">
            <img
              src="/promo-plaid.jpg"
              onError={(e) => {
                e.currentTarget.src = '/promo-cyberbeast.jpg';
              }}
              alt="Tesla Model S Plaid Stealth Custom"
              className="w-full h-full object-cover object-center filter brightness-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/35 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/75 via-transparent to-zinc-950/75" />

            {/* Floating HUD telemetry overlays (Tablet & Desktop >= md) */}
            <div className="hidden md:flex absolute top-5 left-5 lg:top-6 lg:left-6 flex-col gap-2">
              <div className="p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-red-500/30 text-white text-xs space-y-1">
                <div className="flex items-center gap-2 text-red-400 font-mono font-bold">
                  <Gauge className="w-4 h-4" />
                  <span>MODEL S PLAID TRI-MOTOR</span>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-1 text-[11px] font-mono tabular-nums">
                  <div>
                    <span className="text-zinc-500 block">0-60 MPH</span>
                    <span className="text-white font-bold">1.99s</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">TOP SPEED</span>
                    <span className="text-white font-bold">200 mph</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">PEAK PWR</span>
                    <span className="text-red-400 font-bold">1,020 HP</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex absolute top-5 right-5 lg:top-6 lg:right-6 flex-col gap-2">
              <div className="p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-cyan-500/30 text-white text-xs space-y-1">
                <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold">
                  <BatteryCharging className="w-4 h-4" />
                  <span>TELEMATICS & DIAGNOSTICS</span>
                </div>
                <div className="text-[11px] font-mono text-zinc-300">
                  <span className="text-emerald-400">● 99.4% HV Cell Balance</span>
                  <p className="text-zinc-400">Real-time CAN Bus Sync Active</p>
                </div>
              </div>
            </div>

            {/* Bottom bar inside hero card (Tablet & Desktop >= md) */}
            <div className="hidden md:flex absolute bottom-5 inset-x-5 lg:bottom-6 lg:inset-x-6 flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-950/90 backdrop-blur-md border border-zinc-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 shrink-0">
                  <Zap className="w-5 h-5 text-red-500" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-heading font-bold text-white text-sm truncate">
                    Satin Stealth Wrap &amp; 21" Forged Aero Spec
                  </h4>
                  <p className="text-xs text-zinc-400 truncate">
                    Custom ceramic heat shield &amp; self-healing film installed at Apex Fremont Bay
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onNavigate('wraps')}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Customize Colors
                </button>
                <button
                  onClick={() => onNavigate('rentals')}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition cursor-pointer"
                >
                  Rent Cyberbeast / Plaid
                </button>
              </div>
            </div>
          </div>

          {/* Mobile & Small Tablet Stacked Specs + Actions (< md) so nothing overlaps the car photo */}
          <div className="md:hidden p-4 space-y-3 bg-zinc-950 border-t border-zinc-800/80">
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-center font-mono text-[11px] tabular-nums">
              <div>
                <span className="text-zinc-500 block text-[9px]">0-60 MPH</span>
                <span className="text-white font-bold">1.99s</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px]">TOP SPEED</span>
                <span className="text-white font-bold">200 mph</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px]">PEAK PWR</span>
                <span className="text-red-400 font-bold">1,020 HP</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 shrink-0">
                <Zap className="w-4 h-4 text-red-500" />
              </div>
              <div className="min-w-0">
                <h4 className="font-heading font-bold text-white text-xs sm:text-sm">
                  Satin Stealth Wrap &amp; 21" Forged Aero Spec
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Ceramic heat shield &amp; self-healing film at Apex Fremont Bay
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('wraps')}
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition text-center cursor-pointer"
              >
                Customize Colors
              </button>
              <button
                onClick={() => onNavigate('rentals')}
                className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition text-center cursor-pointer"
              >
                Rent Plaid / Cyber
              </button>
            </div>
          </div>
        </div>

        {/* 4 Pillars Grid (Maintenance, Wraps, Rentals, Investment) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1 */}
          <div
            onClick={() => onNavigate('services')}
            className="group cursor-pointer p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-red-500/50 transition duration-200 space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/30 text-red-400 flex items-center justify-center group-hover:scale-110 transition">
              <Wrench className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-heading font-bold text-base text-white group-hover:text-red-400 transition">
              Certified Maintenance & Fixes
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              HV battery health audits, drive unit flushes, suspension alignments & on-demand Mobile Ranger dispatch.
            </p>
            <div className="text-xs font-bold text-red-400 flex items-center gap-1 group-hover:translate-x-1 transition">
              <span>Book Technician</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 2 */}
          <div
            onClick={() => onNavigate('wraps')}
            className="group cursor-pointer p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 transition duration-200 space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition">
              <Palette className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="font-heading font-bold text-base text-white group-hover:text-cyan-400 transition">
              Bespoke Wraps & Carbon Aero
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              3M 2080 satin & metallic wraps, paint protection film (PPF), forged dry carbon spoilers, and yoke retrofits.
            </p>
            <div className="text-xs font-bold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition">
              <span>Launch Wrap Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 3 */}
          <div
            onClick={() => onNavigate('rentals')}
            className="group cursor-pointer p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition duration-200 space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
              <Car className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-heading font-bold text-base text-white group-hover:text-amber-400 transition">
              Exotic Tesla Fleet Rentals
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Drive the 845 HP Cybertruck Cyberbeast, Roadster Founders Edition, or Model S Plaid with unlimited Supercharging.
            </p>
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition">
              <span>View Fleet & Rates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 4 */}
          <div
            onClick={() => onNavigate('investment')}
            className="group cursor-pointer p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition duration-200 space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-heading font-bold text-base text-white group-hover:text-emerald-400 transition">
              Decentralized Fleet Staking
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Earn 14.8% to 22.6% APY backed by autonomous Robotaxi fare splits and private Megawatt Supercharger energy revenue.
            </p>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition">
              <span>Explore Yield Pools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Quick Stats Trust Banner */}
        <div className="mt-8 p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <span className="font-heading font-black text-2xl sm:text-3xl text-white">99.8%</span>
            <span className="text-xs text-zinc-400 block mt-0.5">Service Precision</span>
          </div>
          <div>
            <span className="font-heading font-black text-2xl sm:text-3xl text-red-500">1,450+</span>
            <span className="text-xs text-zinc-400 block mt-0.5">Custom Wraps Completed</span>
          </div>
          <div>
            <span className="font-heading font-black text-2xl sm:text-3xl text-emerald-400">$4.8M+</span>
            <span className="text-xs text-zinc-400 block mt-0.5">Staking Dividends Paid</span>
          </div>
          <div>
            <span className="font-heading font-black text-2xl sm:text-3xl text-yellow-400">100%</span>
            <span className="text-xs text-zinc-400 block mt-0.5">Crypto Payment Support</span>
          </div>
        </div>
      </div>
    </section>
  );
};
