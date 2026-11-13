import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ScratchCardTier } from '../types';
import { ScratchCardModal } from './ScratchCardModal';
import confetti from 'canvas-confetti';
import {
  Gift,
  Sparkles,
  Trophy,
  Award,
  ShieldCheck,
  Zap,
  ArrowRight,
  Flame,
  CheckCircle2,
  RefreshCw,
  Coins,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Car,
  TrendingUp,
  Pause,
  Play,
} from 'lucide-react';

interface PromotionsHubProps {
  onOpenDeposit: () => void;
}

export const PromotionsHub: React.FC<PromotionsHubProps> = ({ onOpenDeposit }) => {
  const {
    currentUser,
    availableSpins,
    executeSpin,
    recentWinners,
    purchaseScratchCard,
    balances,
    showToast,
    spinCostUsd,
    wheelRewards,
    scratchCardTiers,
    siteSettings,
    minDepositToActivateWinsUsd,
    openWinActivationPopup,
  } = useApp();

  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [lastWonPrize, setLastWonPrize] = useState<{
    prize: string;
    valueUsd: number;
    type?: string;
    vehicleModel?: string;
  } | null>(null);
  const [selectedScratchTier, setSelectedScratchTier] = useState<ScratchCardTier | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const scratchSliderRef = useRef<HTMLDivElement>(null);

  // Live Community Win Ledger slider & filter state
  const [winFilter, setWinFilter] = useState<'all' | 'staking' | 'stock' | 'vehicle' | 'spin_scratch'>('all');
  const [winSlideIndex, setWinSlideIndex] = useState(0);
  const [winAutoSlide, setWinAutoSlide] = useState(true);
  const winSliderRef = useRef<HTMLDivElement>(null);

  const filteredWinners = React.useMemo(() => {
    if (winFilter === 'all') return recentWinners;
    return recentWinners.filter((w) => {
      if (winFilter === 'staking') return w.type === 'Staking ROI' || w.category === 'staking';
      if (winFilter === 'stock') return w.type === 'TSLA Stock ROI' || w.category === 'stock';
      if (winFilter === 'vehicle') return w.category === 'vehicle' || w.prize.toLowerCase().includes('tesla') || w.prize.toLowerCase().includes('cybertruck');
      return w.category === 'spin_scratch' || w.type === 'Wheel Spin' || w.type === 'Scratch & Win';
    });
  }, [recentWinners, winFilter]);

  const scrollChildHorizontally = React.useCallback((container: HTMLElement | null, index: number) => {
    if (!container) return;
    const target = container.children[index] as HTMLElement | undefined;
    if (!target) return;
    const cRect = container.getBoundingClientRect();
    const elRect = target.getBoundingClientRect();
    container.scrollTo({
      left: Math.max(0, container.scrollLeft + (elRect.left - cRect.left)),
      behavior: 'smooth',
    });
  }, []);

  React.useEffect(() => {
    if (!winAutoSlide || filteredWinners.length <= 1) return;
    const t = setInterval(() => {
      setWinSlideIndex((prev) => {
        const next = (prev + 1) % filteredWinners.length;
        scrollChildHorizontally(winSliderRef.current, next);
        return next;
      });
    }, 4500);
    return () => clearInterval(t);
  }, [winAutoSlide, filteredWinners.length, scrollChildHorizontally]);

  // Dynamic wheel slices from admin-editable rewards
  const activeRewards = wheelRewards.filter((r) => r.isActive);
  const wheelSlices = activeRewards.length >= 4 ? activeRewards : [
    { id: '1', label: 'Cybertruck Pass', color: '#dc2626', textColor: 'white', valueUsd: 1500, type: 'pass', weight: 3, isActive: true },
    { id: '2', label: '1,000 USDT', color: '#16a34a', textColor: 'white', valueUsd: 1000, type: 'crypto', weight: 5, isActive: true },
    { id: '3', label: 'Full Body Wrap', color: '#0891b2', textColor: 'white', valueUsd: 3800, type: 'service', weight: 2, isActive: true },
    { id: '4', label: '500 Credits', color: '#eab308', textColor: 'black', valueUsd: 500, type: 'credits', weight: 12, isActive: true },
    { id: '5', label: '100 USDT', color: '#2563eb', textColor: 'white', valueUsd: 100, type: 'crypto', weight: 25, isActive: true },
    { id: '6', label: 'Supercharge 1k kWh', color: '#9333ea', textColor: 'white', valueUsd: 350, type: 'service', weight: 15, isActive: true },
    { id: '7', label: 'Gold Card ($1k)', color: '#d97706', textColor: 'white', valueUsd: 1000, type: 'pass', weight: 6, isActive: true },
    { id: '8', label: '50 Credits', color: '#475569', textColor: 'white', valueUsd: 50, type: 'credits', weight: 32, isActive: true },
  ];

  // Synthesized mechanical ticking sound for the wheel
  const playTickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch {
      // Audio fallback
    }
  };

  const handleSpinClick = () => {
    if (isSpinning) return;
    if (!currentUser) {
      window.dispatchEvent(new CustomEvent('apex:require-auth', { detail: 'spin the promotional wheel' }));
      showToast('Please sign in or register to spin the promotional wheel.', 'error');
      return;
    }
    if (balances.usd < spinCostUsd) {
      showToast(`Spin cost is $${spinCostUsd} USD per spin. Please deposit funds to spin.`, 'error');
      onOpenDeposit();
      return;
    }

    setIsSpinning(true);
    setLastWonPrize(null);

    // Pick outcome with configurable spin fee deducted from balance
    let result: {
      prize: string;
      valueUsd: number;
      type: string;
      sliceId?: string;
      sliceIndex?: number;
      vehicleModel?: string;
    };
    try {
      result = executeSpin();
    } catch (err: unknown) {
      const error = err as Error;
      setIsSpinning(false);
      showToast(error.message, 'error');
      return;
    }

    // Sound ticks during spin
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      playTickSound();
      tickCount++;
      if (tickCount > 24) clearInterval(tickInterval);
    }, 150);

    // Compute exact wheel rotation so pointer at top (0 deg) lands on selected slice
    const count = wheelSlices.length;
    const sliceAngle = 360 / count;
    const idx =
      typeof result.sliceIndex === 'number' && result.sliceIndex >= 0 && result.sliceIndex < count
        ? result.sliceIndex
        : Math.max(0, wheelSlices.findIndex((s) => s.id === result.sliceId));
    const centerDeg = idx * sliceAngle + sliceAngle / 2;
    const jitter = (Math.random() - 0.5) * (sliceAngle * 0.4);
    const targetMod = (360 - (centerDeg % 360) + jitter + 360) % 360;
    const currentMod = ((wheelRotation % 360) + 360) % 360;
    const deltaToTarget = (targetMod - currentMod + 360) % 360;
    const extraRounds = 360 * 6;
    const totalNewRotation = wheelRotation + extraRounds + deltaToTarget;
    setWheelRotation(totalNewRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setLastWonPrize(result);

      if (result.type === 'try_again') {
        showToast('Wheel landed on Try Again! Better luck on your next spin.', 'info');
        return;
      }

      confetti({
        particleCount: result.type === 'car' ? 160 : 100,
        spread: result.type === 'car' ? 95 : 70,
        origin: { y: 0.6 },
        colors: ['#e82127', '#00f3ff', '#f59e0b', '#ffffff'],
      });

      if (result.type === 'car') {
        showToast(
          `🚗 JACKPOT TESLA WIN! You won a ${result.vehicleModel || result.prize}! Added to your garage & delivery order confirmed.`,
          'success'
        );
      } else {
        showToast(`WINNER! You landed on: ${result.prize} (+$${result.valueUsd.toLocaleString()})!`, 'success');
        if (result.valueUsd > 0 && (currentUser?.totalDepositedUsd || 0) < minDepositToActivateWinsUsd) {
          openWinActivationPopup({
            actionLabel: 'Spin-the-Wheel Cash Win',
            prizeLabel: result.prize,
            prizeAmountUsd: result.valueUsd,
          });
        }
      }
    }, 4200);
  };

  const handleBuyScratchCard = (tier: ScratchCardTier) => {
    if (!currentUser) {
      window.dispatchEvent(new CustomEvent('apex:require-auth', { detail: 'purchase scratch cards' }));
      showToast('Please sign in or register to purchase and play Scratch & Win cards.', 'error');
      return;
    }
    if (purchaseScratchCard(tier)) {
      setSelectedScratchTier(tier);
    } else {
      onOpenDeposit();
    }
  };

  return (
    <div id="promotions" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Promotion Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" />
          <span>Provably Fair Platform Promotions & Giveaways</span>
        </div>
        <h2 className="font-heading font-black text-3xl sm:text-5xl text-white">
          {siteSettings.promoBannerTitle}
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base">
          {siteSettings.promoBannerSubtitle}
        </p>
      </div>

      {/* Section 1: The Interactive Spin Wheel */}
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-950 via-zinc-900/60 to-zinc-950 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left: Interactive Wheel Canvas/SVG representation */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* The Wheel Container */}
            <div className="relative w-[248px] h-[248px] sm:w-[360px] sm:h-[360px] lg:w-[420px] lg:h-[420px] max-w-full aspect-square flex items-center justify-center">
              {/* Outer Glowing Metallic Rim */}
              <div className="absolute inset-0 rounded-full border-8 border-zinc-800 shadow-[0_0_50px_rgba(232,33,39,0.3)] bg-zinc-950" />

              {/* Top Pointer Indicator */}
              <div className="absolute -top-3 z-30 flex flex-col items-center">
                <div className="w-6 h-8 bg-gradient-to-b from-yellow-300 via-amber-500 to-red-600 clip-triangle shadow-lg animate-bounce" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
              </div>

              {/* The Spinning Rotating Disc */}
              <div
                className="w-[94%] h-[94%] rounded-full overflow-hidden relative shadow-inner transition-transform"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transitionDuration: isSpinning ? '4.2s' : '0s',
                  transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.25, 1)',
                }}
              >
                {/* SVG Wheel Pie Wedges */}
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {wheelSlices.map((slice, i) => {
                    const angle = 360 / wheelSlices.length;
                    const startAngle = (i * angle * Math.PI) / 180;
                    const endAngle = ((i + 1) * angle * Math.PI) / 180;
                    const x1 = 50 + 50 * Math.cos(startAngle);
                    const y1 = 50 + 50 * Math.sin(startAngle);
                    const x2 = 50 + 50 * Math.cos(endAngle);
                    const y2 = 50 + 50 * Math.sin(endAngle);

                    return (
                      <g key={i}>
                        <path
                          d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                          fill={slice.color}
                          stroke="#18181b"
                          strokeWidth="0.8"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Text overlays around the wheel */}
                {wheelSlices.map((slice, i) => {
                  const angle = (360 / wheelSlices.length) * i + 360 / (wheelSlices.length * 2);
                  return (
                    <div
                      key={i}
                      className="absolute inset-0 flex items-center justify-end pr-4 pointer-events-none"
                      style={{
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: '50% 50%',
                      }}
                    >
                      <span
                        className="text-[9px] sm:text-[11px] font-heading font-black uppercase tracking-wider drop-shadow-md"
                        style={{ color: slice.textColor || '#ffffff' }}
                      >
                        {slice.label}
                      </span>

                    </div>
                  );
                })}
              </div>

              {/* Center Hub Emblem */}
              <div className="absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border-4 border-red-500 shadow-xl flex items-center justify-center cursor-pointer select-none">
                <div className="text-center">
                  <Zap className="w-6 h-6 text-red-500 fill-red-500 mx-auto" />
                  <span className="text-[9px] font-mono font-bold text-white block -mt-0.5">APEX</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Spin Controls & Information */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase font-mono font-bold text-yellow-400 tracking-wider">
                Daily Platform Wheel
              </span>
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
                SPIN TO WIN TESLA PERKS
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Features <strong className="text-amber-400">2 Grand Tesla Car Win slices</strong> (Model 3 &amp; Cybertruck), instant USDT credits, full body wraps, Supercharging passes &amp; a Try Again slice!
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-600/20 border border-red-500/40 text-red-300">
                  <Car className="w-3 h-3" />
                  2 Tesla Car Jackpots
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                  Try Again Slice Active
                </span>
              </div>
            </div>

            {/* Spin cost banner */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-zinc-400 block font-mono">EXECUTION COST</span>
                <span className="font-heading font-black text-2xl text-amber-400">
                  ${spinCostUsd.toFixed(2)} <span className="text-xs font-normal text-zinc-300">USD / Spin</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 font-mono font-bold block mb-1">
                  {currentUser ? 'READY TO SPIN' : 'SIGN IN REQUIRED'}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Deducted from Vault</span>
              </div>
            </div>

            {/* Last Won Prize Callout */}
            {lastWonPrize && (
              lastWonPrize.type === 'try_again' ? (
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-700 space-y-1 animate-in zoom-in-95">
                  <div className="flex items-center gap-2 text-zinc-300 text-xs font-bold uppercase tracking-wider">
                    <RefreshCw className="w-4 h-4 text-zinc-400" />
                    <span>WHEEL RESULT: TRY AGAIN</span>
                  </div>
                  <h4 className="font-heading font-black text-xl text-white">
                    {lastWonPrize.prize}
                  </h4>
                  <p className="text-zinc-400 text-xs">
                    No prize credited this round ($0.00 USD) — spin again to land on a Tesla car or USDT vault slice!
                  </p>
                </div>
              ) : lastWonPrize.type === 'car' ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-amber-950/60 border border-emerald-500/60 space-y-1.5 animate-in zoom-in-95">
                  <div className="flex items-center gap-2 text-yellow-300 text-xs font-bold uppercase tracking-wider">
                    <Car className="w-4 h-4 text-emerald-400" />
                    <span>TESLA VEHICLE JACKPOT WON!</span>
                  </div>
                  <h4 className="font-heading font-black text-xl text-white">
                    {lastWonPrize.vehicleModel || lastWonPrize.prize}
                  </h4>
                  <p className="text-emerald-300 text-xs font-semibold">
                    Added to your Digital Garage &amp; VIP Delivery Queue (Est. Value ${lastWonPrize.valueUsd.toLocaleString()})!
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/60 to-zinc-900 border border-red-500/50 space-y-1 animate-in zoom-in-95">
                  <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-wider">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span>JUST WON ON WHEEL</span>
                  </div>
                  <h4 className="font-heading font-black text-xl text-white">
                    {lastWonPrize.prize}
                  </h4>
                  <p className="text-emerald-400 text-xs font-semibold">
                    +${lastWonPrize.valueUsd.toLocaleString()} USD credited to your dashboard wallet!
                  </p>
                </div>
              )
            )}

            {/* Spin CTA Button */}
            <button
              onClick={handleSpinClick}
              disabled={isSpinning}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-heading font-black text-base shadow-2xl shadow-red-950/70 flex items-center justify-center gap-2 transition hover:scale-[1.01] disabled:opacity-60 cursor-pointer"
            >
              {isSpinning ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>WHEEL IS SPINNING...</span>
                </>
              ) : (
                <>
                  <Coins className="w-5 h-5 text-yellow-300" />
                  <span>SPIN WHEEL (${spinCostUsd} USD)</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cryptographic Randomness (SHA-256 Proven Outcome)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Purchasable Scratch & Win Cards */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Purchasable Foil Scratch Cards ($50 Min — ${siteSettings.maxScratchPrizeUsd.toLocaleString()} Max)</span>
            </div>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
              SCRATCH & WIN JACKPOTS
            </h3>
            <p className="text-xs text-zinc-400 max-w-xl">
              Instant gratification. Slide through tiers and scratch off the metallic foil with your mouse or finger to uncover cash vault jackpots, body wraps, and crypto rewards.
            </p>
          </div>

          {/* Slider Controls & Wallet Balance */}
          <div className="flex flex-col sm:items-end gap-2">
            <div className="text-right">
              <span className="text-xs text-zinc-400 block">Your Wallet Balance:</span>
              <span className="font-heading font-bold text-lg text-emerald-400">
                ${balances.usd.toFixed(2)} USD
              </span>
            </div>

            {/* Slider Navigation Arrows */}
            {scratchCardTiers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-400 mr-1">
                  <strong className="text-amber-400">{Math.min(activeSlideIndex + 1, scratchCardTiers.length)}</strong> of {scratchCardTiers.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const newIdx = Math.max(0, activeSlideIndex - 1);
                    setActiveSlideIndex(newIdx);
                    scrollChildHorizontally(scratchSliderRef.current, newIdx);
                  }}
                  disabled={activeSlideIndex === 0}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-amber-500 text-zinc-300 hover:text-white disabled:opacity-40 transition cursor-pointer"
                  title="Previous Scratch Card"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newIdx = Math.min(scratchCardTiers.length - 1, activeSlideIndex + 1);
                    setActiveSlideIndex(newIdx);
                    scrollChildHorizontally(scratchSliderRef.current, newIdx);
                  }}
                  disabled={activeSlideIndex >= scratchCardTiers.length - 1}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-amber-500 text-zinc-300 hover:text-white disabled:opacity-40 transition cursor-pointer"
                  title="Next Scratch Card"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modern Interactive Scratch Card Slider / Carousel */}
        {scratchCardTiers.length === 0 ? (
          <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-950 text-center text-xs text-zinc-500">
            No active scratch card tiers configured in Site Editor.
          </div>
        ) : (
          <div className="relative">
            <div
              ref={scratchSliderRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                const scrollLeft = el.scrollLeft;
                const itemWidth = el.scrollWidth / Math.max(1, scratchCardTiers.length);
                const idx = Math.round(scrollLeft / itemWidth);
                if (idx !== activeSlideIndex && idx >= 0 && idx < scratchCardTiers.length) {
                  setActiveSlideIndex(idx);
                }
              }}
              className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {scratchCardTiers.map((tier, idx) => {
                const isCurrent = idx === activeSlideIndex;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`w-[260px] sm:w-[320px] lg:w-[340px] max-w-[calc(100vw-3rem)] shrink-0 snap-start rounded-3xl border bg-zinc-950 p-5 sm:p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 group ${
                      isCurrent
                        ? 'border-amber-500/80 ring-2 ring-amber-500/20 scale-[1.01]'
                        : 'border-zinc-800 hover:border-zinc-700 opacity-90'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Header card badge */}
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${tier.gradient} text-white shadow-lg relative overflow-hidden`}>
                        <div className="flex justify-between items-start relative z-10">
                          <span className="text-[10px] uppercase font-mono font-bold tracking-wider opacity-90">
                            Apex Scratch Card
                          </span>
                          <Trophy className="w-4 h-4 text-yellow-300" />
                        </div>
                        <h4 className="font-heading font-black text-xl mt-1 relative z-10">{tier.name}</h4>
                        <div className="mt-2 text-right relative z-10">
                          <span className="text-[10px] block opacity-80 font-mono">MAX JACKPOT</span>
                          <span className="font-heading font-black text-2xl text-yellow-300">
                            ${tier.maxPrizeUsd.toLocaleString()}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-white/5 opacity-40 mix-blend-overlay pointer-events-none" />
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed min-h-[36px]">
                        {tier.description}
                      </p>

                      {/* Possible wins list */}
                      <div className="space-y-1.5 text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-3">
                        <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-1">
                          Top Prize Payouts:
                        </span>
                        {tier.possiblePrizes.slice(0, 3).map((p, i) => (
                          <div key={i} className="flex justify-between items-center py-0.5 gap-2">
                            <span className="flex items-center gap-1 truncate text-zinc-200">
                              {p.isTeslaCar && <Car className="w-3 h-3 text-emerald-400 shrink-0" />}
                              <span className="truncate">{p.label}</span>
                            </span>
                            {p.isTeslaCar ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold shrink-0">
                                TESLA WIN
                              </span>
                            ) : (
                              <span className="text-yellow-400 font-mono font-semibold shrink-0">+${p.amountUsd.toLocaleString()}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyScratchCard(tier);
                        }}
                        className="w-full py-3.5 rounded-2xl bg-zinc-900 group-hover:bg-gradient-to-r group-hover:from-yellow-500 group-hover:to-amber-600 border border-zinc-700 group-hover:border-transparent text-white group-hover:text-black font-heading font-bold text-xs flex items-center justify-center gap-2 transition duration-200 shadow-md cursor-pointer"
                      >
                        <Coins className="w-4 h-4" />
                        <span>Buy & Scratch for ${tier.priceUsd}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Slider Pagination Dots */}
            <div className="flex items-center justify-center gap-2 pt-4">
              {scratchCardTiers.map((tier, idx) => (
                <button
                  key={tier.id}
                  onClick={() => {
                    setActiveSlideIndex(idx);
                    scrollChildHorizontally(scratchSliderRef.current, idx);
                  }}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeSlideIndex === idx
                      ? 'w-8 bg-amber-400 shadow-sm shadow-amber-400/50'
                      : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                  }`}
                  title={`Go to ${tier.name}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Modern Interactive Live Community Win History & ROI Ledger Slider */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="font-heading font-bold text-xl text-white">
                Live Community Win History, Staking &amp; TSLA Stock ROI Ledger
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              High-frequency real-time drops across Spin-and-Win jackpots, Scratch cards, Fleet Staking ROI yields, and TSLA Stock dividends.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Drops Every 6s</span>
            </div>
            <button
              type="button"
              onClick={() => setWinAutoSlide((v) => !v)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-xs text-zinc-200 flex items-center gap-1.5 cursor-pointer"
            >
              {winAutoSlide ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{winAutoSlide ? 'Auto-Slide On' : 'Paused'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const next = Math.max(0, winSlideIndex - 1);
                setWinSlideIndex(next);
                scrollChildHorizontally(winSliderRef.current, next);
              }}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-yellow-500 text-zinc-200 cursor-pointer"
              aria-label="Previous win card"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                const next = Math.min(filteredWinners.length - 1, winSlideIndex + 1);
                setWinSlideIndex(next);
                scrollChildHorizontally(winSliderRef.current, next);
              }}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-yellow-500 text-zinc-200 cursor-pointer"
              aria-label="Next win card"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ledger Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(
            [
              { id: 'all', label: `All Drops (${recentWinners.length})` },
              { id: 'staking', label: 'Staking ROI' },
              { id: 'stock', label: 'TSLA Stock ROI' },
              { id: 'vehicle', label: 'Tesla Vehicle Jackpots' },
              { id: 'spin_scratch', label: 'Spin & Scratch' },
            ] as const
          ).map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => {
                setWinFilter(chip.id);
                setWinSlideIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 whitespace-nowrap border transition cursor-pointer ${
                winFilter === chip.id
                  ? 'bg-amber-500 border-amber-400 text-black'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Modern Horizontal Ledger Slider */}
        <div
          ref={winSliderRef}
          className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {filteredWinners.map((win, idx) => {
            const isRoi = win.type === 'Staking ROI' || win.type === 'TSLA Stock ROI';
            const isVehicle = win.category === 'vehicle' || win.prize.toLowerCase().includes('cybertruck') || win.prize.toLowerCase().includes('model');
            return (
              <div
                key={win.id}
                onClick={() => setWinSlideIndex(idx)}
                className={`w-[260px] sm:w-[320px] max-w-[calc(100vw-3rem)] shrink-0 snap-start p-4 rounded-2xl border transition flex flex-col justify-between gap-3 cursor-pointer ${
                  isRoi
                    ? 'bg-gradient-to-br from-emerald-950/35 to-zinc-900 border-emerald-500/35 hover:border-emerald-400/60'
                    : isVehicle
                    ? 'bg-gradient-to-br from-red-950/40 to-zinc-900 border-red-500/40 hover:border-red-400'
                    : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={win.avatar}
                    alt={win.username}
                    className="w-11 h-11 rounded-xl object-cover border border-red-500/30 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-xs text-white truncate">{win.username}</h4>
                      <span className="text-[10px] text-zinc-500 shrink-0">{win.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          win.type === 'Staking ROI'
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : win.type === 'TSLA Stock ROI'
                            ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                            : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        }`}
                      >
                        {win.type}
                      </span>
                      {win.roiPercent ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" />+{win.roiPercent}%
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-heading font-bold text-sm text-yellow-400 line-clamp-1">
                    {win.prize}
                  </p>
                  <div className="flex items-center justify-between mt-1.5 pt-2 border-t border-zinc-800/80 text-[11px] font-mono">
                    <span className="text-white font-bold">
                      +${win.valueUsd.toLocaleString()} USD
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {win.verifiedHash}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Slider Pagination Indicator */}
        <div className="flex items-center justify-center gap-1.5">
          {filteredWinners.slice(0, 10).map((w, idx) => (
            <button
              key={`wd-${w.id}`}
              type="button"
              onClick={() => {
                setWinSlideIndex(idx);
                scrollChildHorizontally(winSliderRef.current, idx);
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                winSlideIndex === idx ? 'w-6 bg-yellow-400' : 'w-1.5 bg-zinc-700'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Scratch Card Interactive Modal */}
      {selectedScratchTier && (
        <ScratchCardModal
          tier={selectedScratchTier}
          isOpen={!!selectedScratchTier}
          onClose={() => setSelectedScratchTier(null)}
        />
      )}
    </div>
  );
};
