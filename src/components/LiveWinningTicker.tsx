import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Tag,
  Truck,
  TrendingUp,
  DollarSign,
  Copy,
  Check,
  Zap,
  ArrowUpRight,
} from 'lucide-react';

interface LiveWinningTickerProps {
  onNavigateToCoupons?: () => void;
  onNavigateToTracking?: () => void;
  onNavigateToInvestment?: () => void;
  onNavigateToStocks?: () => void;
  onNavigateToPromotions?: () => void;
}

export const LiveWinningTicker: React.FC<LiveWinningTickerProps> = ({
  onNavigateToCoupons,
  onNavigateToTracking,
  onNavigateToInvestment,
  onNavigateToStocks,
  onNavigateToPromotions,
}) => {
  const { recentWinners, coupons, claimCoupon, tslaQuote, siteSettings } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activePromoCoupon = coupons.find((c) => c.isActive && c.code === 'CYBER20') || coupons[0];

  // Combined multiple display feeds
  const slides = [
    ...(siteSettings.announcementBanner?.trim() ? [{ id: 'announcement', type: 'announcement' }] : []),
    { id: 'stocks', type: 'stocks' },
    { id: 'roi_wins', type: 'roi_wins' },
    { id: 'winners', type: 'winners' },
    { id: 'settlements', type: 'settlements' },
    { id: 'coupons', type: 'coupons' },
    { id: 'shipping', type: 'shipping' },
  ];

  // Auto-advance slider every 4 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handleCopy = (code: string) => {
    claimCoupon(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-red-500/30 text-xs py-2 px-3 sm:px-6 relative z-30 select-none overflow-hidden transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left Slider Arrow Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="p-1 rounded-md bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            aria-label="Previous notification"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="p-1 rounded-md bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            aria-label="Next notification"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Central Dynamic Sliding Display Area (Combined Multiple Display) */}
        <div className="flex-1 min-w-0 flex items-center justify-center overflow-hidden">
          {slides[currentSlide % slides.length]?.id === 'announcement' && (
            <div className="flex items-center gap-2.5 truncate animate-in fade-in slide-in-from-right-4 duration-300">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase shrink-0">
                <Sparkles className="w-3 h-3 text-amber-400 inline" />
                <span>Flash Notice</span>
              </span>
              <span className="text-zinc-100 font-medium truncate">
                {siteSettings.announcementBanner}
              </span>
            </div>
          )}

          {/* FEED 0: LIVE TESLA STOCK TICKER & SPOT BUY ALERT */}
          {slides[currentSlide % slides.length]?.id === 'stocks' && (
            <div className="flex items-center gap-2.5 truncate animate-in fade-in slide-in-from-right-4 duration-300">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase shrink-0">
                <Zap className="w-3 h-3 text-cyan-400 inline" />
                <span>TSLA Stock Live</span>
              </span>

              <span className="text-zinc-200 truncate flex items-center gap-2">
                <strong>NASDAQ: TSLA</strong>
                <span className="font-mono font-bold text-white">${tslaQuote.price.toFixed(2)}</span>
                <span className="text-emerald-400 font-mono text-[11px] font-bold flex items-center">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>+{tslaQuote.changePercent}%</span>
                </span>
                <span className="text-zinc-400 hidden sm:inline">• Spot Buy & Fast ROI Active (Min $500)</span>
              </span>

              {onNavigateToStocks && (
                <button
                  onClick={onNavigateToStocks}
                  className="shrink-0 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:text-white text-[10px] font-bold hidden sm:block transition"
                >
                  Trade TSLA
                </button>
              )}
            </div>
          )}

          {/* FEED 1: COMBINED INVESTMENT ROI WINS & DAILY CRON PAYOUTS */}
          {slides[currentSlide % slides.length]?.id === 'roi_wins' && (
            <div className="flex items-center gap-2.5 truncate animate-in fade-in slide-in-from-right-4 duration-300">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase shrink-0">
                <TrendingUp className="w-3 h-3 text-emerald-400 inline" />
                <span>ROI Win Payout</span>
              </span>

              <span className="text-zinc-300 truncate">
                <strong className="text-white">Alex V.</strong> received{' '}
                <strong className="text-emerald-400 font-mono">+$71.03 USD</strong> daily dividend payout from{' '}
                <span className="text-cyan-300">Robotaxi Fleet Staking Pool (18.5% APY)</span>
              </span>

              {onNavigateToInvestment && (
                <button
                  onClick={onNavigateToInvestment}
                  className="shrink-0 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:text-white text-[10px] font-bold hidden sm:block transition"
                >
                  View Yields
                </button>
              )}
            </div>
          )}

          {/* FEED 2: LIVE PROVABLY FAIR WINNERS (SPINS & SCRATCH CARDS) */}
          {slides[currentSlide % slides.length]?.id === 'winners' && (
            <div className="flex items-center gap-2.5 truncate animate-in fade-in slide-in-from-right-4 duration-300">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase shrink-0">
                <Trophy className="w-3 h-3 text-yellow-400 inline" />
                <span>Promotion Winner</span>
              </span>

              {recentWinners.slice(0, 1).map((winner) => (
                <div key={winner.id} className="flex items-center gap-2 text-zinc-300 truncate">
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-red-500/40 bg-zinc-800 shrink-0">
                    <img
                      src={winner.avatar}
                      alt={winner.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <strong className="text-white font-medium truncate">{winner.username}</strong>
                  <span className="text-zinc-400 hidden sm:inline">won</span>
                  <span className="font-bold text-yellow-400 flex items-center gap-1 shrink-0">
                    <Sparkles className="w-3 h-3" />
                    <span>{winner.prize}</span>
                  </span>
                  <span className="text-emerald-400 text-[10px] font-mono hidden md:inline-flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{winner.verifiedHash}</span>
                  </span>
                </div>
              ))}

              {onNavigateToPromotions && (
                <button
                  onClick={onNavigateToPromotions}
                  className="shrink-0 px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-300 hover:text-white text-[10px] font-bold hidden sm:block transition"
                >
                  Spin Wheel
                </button>
              )}
            </div>
          )}

          {/* FEED 3: MATURITY PLAN AUTO-SETTLEMENTS */}
          {slides[currentSlide % slides.length]?.id === 'settlements' && (
            <div className="flex items-center gap-2.5 truncate animate-in fade-in slide-in-from-right-4 duration-300">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase shrink-0">
                <DollarSign className="w-3 h-3 text-purple-400 inline" />
                <span>Auto-Settlement</span>
              </span>

              <span className="text-zinc-300 truncate">
                Mega-Node Plan #inv-alex-plaid reached 100% maturity:{' '}
                <strong className="text-purple-300 font-mono">$8,241.64 USD</strong> capital & yield returned to user vault
              </span>

              {onNavigateToInvestment && (
                <button
                  onClick={onNavigateToInvestment}
                  className="shrink-0 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300 hover:text-white text-[10px] font-bold hidden sm:block transition"
                >
                  Compound APY
                </button>
              )}
            </div>
          )}

          {/* FEED 4: ACTIVE FLASH PROMO COUPONS */}
          {slides[currentSlide % slides.length]?.id === 'coupons' && (
            <div className="flex items-center gap-2.5 truncate animate-in fade-in slide-in-from-right-4 duration-300">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-[10px] font-bold uppercase shrink-0">
                <Tag className="w-3 h-3 text-yellow-400 inline" />
                <span>Flash Coupon</span>
              </span>

              <span className="text-zinc-200 truncate">
                Use code <strong className="text-yellow-400 font-mono font-bold">{activePromoCoupon?.code || 'CYBER20'}</strong> for 20% off all wraps, accessories & parts!
              </span>

              <button
                onClick={() => handleCopy(activePromoCoupon?.code || 'CYBER20')}
                className="shrink-0 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-mono font-bold flex items-center gap-1 transition"
              >
                {copiedCode === (activePromoCoupon?.code || 'CYBER20') ? (
                  <>
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                    <span>COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-2.5 h-2.5" />
                    <span>COPY</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* FEED 5: NATIONWIDE SHIPPING & DELIVERY DISPATCHES */}
          {slides[currentSlide % slides.length]?.id === 'shipping' && (
            <div className="flex items-center gap-2.5 truncate animate-in fade-in slide-in-from-right-4 duration-300">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase shrink-0">
                <Truck className="w-3 h-3 text-cyan-400 inline" />
                <span>Nationwide Shipping</span>
              </span>

              <span className="text-zinc-300 truncate">
                Enclosed Carrier: 2026 Model S Plaid dispatched to Austin, TX • 7-Day Money-Back Guarantee
              </span>

              {onNavigateToTracking && (
                <button
                  onClick={onNavigateToTracking}
                  className="shrink-0 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:text-white text-[10px] font-bold hidden sm:block transition"
                >
                  Track Order
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Slider Indicators & Deep Links */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  currentSlide === idx ? 'w-4 bg-red-500' : 'bg-zinc-700 hover:bg-zinc-500'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {onNavigateToStocks && (
            <button
              onClick={onNavigateToStocks}
              className="hidden lg:flex items-center gap-1 text-[11px] text-zinc-400 hover:text-cyan-400 transition ml-1"
            >
              <Zap className="w-3 h-3" />
              <span>TSLA Hub</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
