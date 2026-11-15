import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Wrench,
  Palette,
  Car,
  TrendingUp,
  Sparkles,
  Zap,
  ArrowRight,
  BatteryCharging,
  Gauge,
  Activity,
  Flame,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from 'lucide-react';

interface HeroProps {
  onNavigate: (tab: string) => void;
  onOpenDeposit: () => void;
}

interface CounterMetric {
  id: string;
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  liveStep?: number;
  liveEveryTicks?: number;
  label: string;
  sublabel: string;
  accentClass: string;
  barClass: string;
}

const HERO_COUNTER_METRICS: CounterMetric[] = [
  {
    id: 'service-precision',
    target: 99.8,
    decimals: 1,
    suffix: '%',
    label: 'Service Precision',
    sublabel: 'Diagnostics & bay QA pass rate',
    accentClass: 'text-white',
    barClass: 'bg-zinc-200',
  },
  {
    id: 'custom-wraps',
    target: 1450,
    decimals: 0,
    suffix: '+',
    liveStep: 1,
    liveEveryTicks: 1,
    label: 'Custom Wraps Completed',
    sublabel: '3M cast vinyl & PPF installs',
    accentClass: 'text-red-500',
    barClass: 'bg-red-500',
  },
  {
    id: 'staking-dividends',
    target: 4.8,
    decimals: 2,
    prefix: '$',
    suffix: 'M+',
    liveStep: 0.01,
    liveEveryTicks: 2,
    label: 'Staking Dividends Paid',
    sublabel: 'Settled across fleet pools',
    accentClass: 'text-emerald-400',
    barClass: 'bg-emerald-400',
  },
  {
    id: 'crypto-support',
    target: 100,
    decimals: 0,
    suffix: '%',
    label: 'Crypto Payment Support',
    sublabel: 'BTC · USDT · XRP · BNB rails',
    accentClass: 'text-amber-400',
    barClass: 'bg-amber-400',
  },
  {
    id: 'diagnostic-scans',
    target: 24800,
    decimals: 0,
    suffix: '+',
    liveStep: 3,
    liveEveryTicks: 1,
    label: 'Diagnostic Scans Logged',
    sublabel: 'Real-time HV battery & CAN bus',
    accentClass: 'text-cyan-400',
    barClass: 'bg-cyan-400',
  },
  {
    id: 'active-fleet',
    target: 312,
    decimals: 0,
    suffix: '+',
    liveStep: 1,
    liveEveryTicks: 3,
    label: 'Active Fleet Vehicles',
    sublabel: 'Cyberbeast, Plaid & Robotaxi units',
    accentClass: 'text-white',
    barClass: 'bg-zinc-300',
  },
  {
    id: 'fleet-apy',
    target: 18.5,
    decimals: 1,
    suffix: '%',
    label: 'Avg. Fleet Staking APY',
    sublabel: 'Automated daily yield payouts',
    accentClass: 'text-emerald-400',
    barClass: 'bg-emerald-400',
  },
  {
    id: 'energy-settled',
    target: 19420,
    decimals: 0,
    suffix: '+',
    liveStep: 4,
    liveEveryTicks: 1,
    label: 'Supercharge MWh Settled',
    sublabel: 'Verified station energy telemetry',
    accentClass: 'text-red-400',
    barClass: 'bg-red-500',
  },
];

const formatMetricNumber = (value: number, decimals = 0) => {
  if (decimals > 0) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return Math.round(value).toLocaleString();
};

const AnimatedCounterValue: React.FC<{
  metric: CounterMetric;
  active: boolean;
  liveAdded: number;
}> = ({ metric, active, liveAdded }) => {
  const shouldReduceMotion = useReducedMotion();
  const [introValue, setIntroValue] = useState<number>(0);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    if (!active) return;

    if (shouldReduceMotion) {
      setIntroValue(metric.target);
      setIntroComplete(true);
      return;
    }

    let rafId = 0;
    const duration = 1200;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setIntroValue(metric.target * eased);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setIntroValue(metric.target);
        setIntroComplete(true);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active, metric.target, shouldReduceMotion]);

  const currentNumber = introComplete ? metric.target + liveAdded : introValue;
  const formatted = formatMetricNumber(currentNumber, metric.decimals);
  const rollKey = introComplete ? `live-${formatted}` : 'intro';

  return (
    <div className="relative h-10 sm:h-11 overflow-hidden flex items-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={rollKey}
          initial={
            introComplete && !shouldReduceMotion
              ? { y: 18, opacity: 0 }
              : false
          }
          animate={{ y: 0, opacity: 1 }}
          exit={
            introComplete && !shouldReduceMotion
              ? { y: -18, opacity: 0 }
              : { opacity: 0 }
          }
          transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          className={`inline-block font-heading font-black text-3xl sm:text-4xl tracking-tight tabular-nums leading-none ${metric.accentClass}`}
        >
          {metric.prefix || ''}
          {formatted}
          {metric.suffix || ''}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const { tslaQuote, featureToggles, siteSettings } = useApp();
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const statsContainerRef = useRef<HTMLDivElement | null>(null);
  const [countersStarted, setCountersStarted] = useState(false);

  // Slider & live-rolling counter state
  const [cardsPerSlide, setCardsPerSlide] = useState(4);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [isSliderHovered, setIsSliderHovered] = useState(false);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const [liveTickCount, setLiveTickCount] = useState(0);

  useEffect(() => {
    const updateCardsPerSlide = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth < 640) setCardsPerSlide(1);
      else if (window.innerWidth < 1024) setCardsPerSlide(2);
      else setCardsPerSlide(4);
    };
    updateCardsPerSlide();
    window.addEventListener('resize', updateCardsPerSlide);
    return () => window.removeEventListener('resize', updateCardsPerSlide);
  }, []);

  const totalSlides = Math.max(1, Math.ceil(HERO_COUNTER_METRICS.length / cardsPerSlide));
  const safeSlide = Math.min(currentSlide, totalSlides - 1);

  useEffect(() => {
    if (currentSlide >= totalSlides) {
      setCurrentSlide(0);
    }
  }, [currentSlide, totalSlides]);

  const goNextSlide = useCallback(() => {
    setSlideDirection(1);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goPrevSlide = useCallback(() => {
    setSlideDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback(
    (index: number) => {
      setSlideDirection(index >= safeSlide ? 1 : -1);
      setCurrentSlide(index);
    },
    [safeSlide]
  );

  // Start initial count-up when visible
  useEffect(() => {
    const node = statsContainerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setCountersStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setCountersStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Auto-increment cumulative live counters continuously
  useEffect(() => {
    if (!countersStarted || isAutoPaused) return;
    const timer = window.setInterval(() => {
      setLiveTickCount((prev) => prev + 1);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [countersStarted, isAutoPaused]);

  // Auto-advance KPI slider
  useEffect(() => {
    if (!countersStarted || isAutoPaused || isSliderHovered || totalSlides <= 1) return;
    const timer = window.setInterval(() => {
      goNextSlide();
    }, 5200);
    return () => window.clearInterval(timer);
  }, [countersStarted, isAutoPaused, isSliderHovered, totalSlides, goNextSlide]);

  const visibleMetrics = useMemo(() => {
    const start = safeSlide * cardsPerSlide;
    return HERO_COUNTER_METRICS.slice(start, start + cardsPerSlide);
  }, [safeSlide, cardsPerSlide]);

  const getLiveAddedForMetric = useCallback(
    (metric: CounterMetric) => {
      if (!metric.liveStep) return 0;
      const cadence = metric.liveEveryTicks ?? 1;
      const steps = Math.floor(liveTickCount / cadence);
      return Number((steps * metric.liveStep).toFixed(metric.decimals ?? 0));
    },
    [liveTickCount]
  );

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

        {/* Modern Sliding & Live Rolling KPI Counter Strip */}
        <div
          ref={statsContainerRef}
          onMouseEnter={() => setIsSliderHovered(true)}
          onMouseLeave={() => setIsSliderHovered(false)}
          className="mt-8 rounded-2xl bg-zinc-950 border border-zinc-800/90 overflow-hidden shadow-xl shadow-black/40"
        >
          {/* Top auto-advance progress bar */}
          <div className="h-[2px] w-full bg-zinc-900 overflow-hidden">
            {!shouldReduceMotion && countersStarted && !isAutoPaused && !isSliderHovered && totalSlides > 1 ? (
              <motion.div
                key={`hero-kpi-progress-${safeSlide}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 5.2, ease: 'linear' }}
                className="h-full w-full origin-left bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400"
              />
            ) : (
              <div className="h-full w-full bg-zinc-800" />
            )}
          </div>

          {/* Slider control header */}
          <div className="px-5 py-3 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 bg-zinc-950/90">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-zinc-400">
                Hub Performance Metrics
              </span>
              <span className="h-3 w-px bg-zinc-800 hidden sm:inline-block" />
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{isAutoPaused ? 'Paused' : 'Live Rolling Count'}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-zinc-500 tabular-nums mr-1">
                {String(safeSlide + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={() => setIsAutoPaused((prev) => !prev)}
                className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 hover:text-white transition cursor-pointer shrink-0"
                aria-label={isAutoPaused ? 'Resume live metrics & slider' : 'Pause live metrics & slider'}
                title={isAutoPaused ? 'Resume live metrics & slider' : 'Pause live metrics & slider'}
              >
                {isAutoPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={goPrevSlide}
                className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:border-red-500/50 hover:bg-zinc-900 text-zinc-300 hover:text-white transition cursor-pointer shrink-0"
                aria-label="Previous metrics slide"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={goNextSlide}
                className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:border-red-500/50 hover:bg-zinc-900 text-zinc-300 hover:text-white transition cursor-pointer shrink-0"
                aria-label="Next metrics slide"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Animated Slide Viewport */}
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`kpi-slide-${safeSlide}-${cardsPerSlide}`}
                initial={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: slideDirection > 0 ? 44 : -44 }
                }
                animate={{ opacity: 1, x: 0 }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: slideDirection > 0 ? -44 : 44 }
                }
                transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                drag={shouldReduceMotion || totalSlides <= 1 ? false : 'x'}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                onDragEnd={(_event, info) => {
                  if (info.offset.x < -50) goNextSlide();
                  else if (info.offset.x > 50) goPrevSlide();
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800/80"
              >
                {visibleMetrics.map((metric, idx) => {
                  const globalIdx = safeSlide * cardsPerSlide + idx;
                  const liveAdded = getLiveAddedForMetric(metric);
                  const hasLiveIncrement = Boolean(metric.liveStep);

                  return (
                    <div
                      key={metric.id}
                      className="p-6 flex flex-col justify-between gap-3 text-left transition-colors hover:bg-zinc-900/50"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 tabular-nums">
                        <span>{String(globalIdx + 1).padStart(2, '0')}</span>
                        <span className={hasLiveIncrement && liveAdded > 0 ? 'text-emerald-400' : 'text-zinc-500'}>
                          {hasLiveIncrement
                            ? liveAdded > 0
                              ? `+${formatMetricNumber(liveAdded, metric.decimals)} live`
                              : 'Live Sync'
                            : 'Verified'}
                        </span>
                      </div>

                      <div>
                        <AnimatedCounterValue
                          metric={metric}
                          active={countersStarted}
                          liveAdded={liveAdded}
                        />
                        <span className="text-sm font-heading font-semibold text-zinc-100 block mt-1.5">
                          {metric.label}
                        </span>
                        <span className="text-xs text-zinc-500 block mt-0.5">
                          {metric.sublabel}
                        </span>
                      </div>

                      <div className="h-0.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${metric.barClass} transition-transform duration-700 ease-out origin-left`}
                          style={{
                            transform: countersStarted ? 'scaleX(1)' : 'scaleX(0)',
                            transitionDelay: `${idx * 80}ms`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide Pagination Bar */}
          {totalSlides > 1 && (
            <div className="px-5 py-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-4 bg-zinc-950/70">
              <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                Auto-updating telemetry across {HERO_COUNTER_METRICS.length} verified metrics
              </span>
              <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
                {Array.from({ length: totalSlides }).map((_, dotIdx) => {
                  const isActiveDot = dotIdx === safeSlide;
                  return (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => goToSlide(dotIdx)}
                      aria-label={`Show metrics slide ${dotIdx + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                        isActiveDot
                          ? 'w-7 bg-red-500'
                          : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
