import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  Sparkles,
  ShieldCheck,
  User,
  ChevronLeft,
  ChevronRight,
  Tag,
  Truck,
  TrendingUp,
  Copy,
  Check,
} from 'lucide-react';

interface LiveWinningTickerProps {
  onNavigateToCoupons?: () => void;
  onNavigateToTracking?: () => void;
  onNavigateToInvestment?: () => void;
}

export const LiveWinningTicker: React.FC<LiveWinningTickerProps> = ({
  onNavigateToCoupons,
  onNavigateToTracking,
  onNavigateToInvestment,
}) => {
  const { recentWinners, coupons, claimCoupon } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activePromoCoupon = coupons.find((c) => c.isActive && c.code === 'CYBER20') || coupons[0];

  const slides = [
    { id: 'winners', type: 'winners' },
    { id: 'coupons', type: 'coupons' },
    { id: 'shipping', type: 'shipping' },
    { id: 'yield', type: 'yield' },
  ];

  // Auto-advance slider every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
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
      className="bg-gradient-to-r from-red-950 via-zinc-950 to-zinc-900 border-b border-red-500/30 text-xs py-2 px-3 sm:px-6 relative z-30 select-none overflow-hidden transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left Slider Arrow Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="p-1 rounded-md bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            aria-label="Previous notification"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="p-1 rounded-md bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            aria-label="Next notification"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Central Dynamic Sliding Display Area */}
        <div className="flex-1 min-w-0 flex items-center justify-center overflow-hidden">
          {/* SLIDE 0: PROVABLY FAIR WINNERS */}
          {currentSlide === 0 && (
            <div className="flex items-center gap-2.5 truncate animate-in fade-in slide-in-from-right-4 duration-300">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase shrink-0">
                <Trophy className="w-3 h-3 text-yellow-400 inline" />
                <span>Live Winners</span>
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
                  <span className="text-zinc-400 hidden sm:inline">just claimed</span>
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
            </div>
          )}

          {/* SLIDE 1: ACTIVE FLASH COUPON */}
          {currentSlide === 1 && (
            <div className="flex items-center gap-2.5 truncate animate-in fade-in slide-in-from-right-4 duration-300">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-[10px] font-bold uppercase shrink-0">
                <Tag className="w-3 h-3 text-yellow-400 inline" />
                <span>Flash Coupon</span>
              </span>

              <span className="text-zinc-200 truncate">
                Use code <strong className="text-yellow-400 font-mono font-bold">{activePromoCoupon?.code || 'CYBER20'}</strong> for 20% off all wraps & carbon accessories!
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

          {/* SLIDE 2: NATIONWIDE ENCLOSED LOGISTICS */}
          {currentSlide === 2 && (
            <div className="flex items-center gap-2.5 truncate animate-in fade-in slide-in-from-right-4 duration-300">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase shrink-0">
                <Truck className="w-3 h-3 text-cyan-400 inline" />
                <span>Nationwide Shipping</span>
              </span>

              <span className="text-zinc-300 truncate">
                Climate-controlled enclosed carriers to all 50 US States • Free for Plaid Members • 7-Day Money-Back Guarantee
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

          {/* SLIDE 3: FLEET YIELD SURGE */}
          {currentSlide === 3 && (
            <div className="flex items-center gap-2.5 truncate animate-in fade-in slide-in-from-right-4 duration-300">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase shrink-0">
                <TrendingUp className="w-3 h-3 text-emerald-400 inline" />
                <span>Yield Surge</span>
              </span>

              <span className="text-zinc-300 truncate">
                Megawatt Supercharger Node Staking Pool active: <strong className="text-emerald-400">22.0% APY</strong> with automated 60-second Cron distributions
              </span>

              {onNavigateToInvestment && (
                <button
                  onClick={onNavigateToInvestment}
                  className="shrink-0 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:text-white text-[10px] font-bold hidden sm:block transition"
                >
                  Stake Now
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

          {onNavigateToCoupons && (
            <button
              onClick={onNavigateToCoupons}
              className="hidden lg:flex items-center gap-1 text-[11px] text-zinc-400 hover:text-yellow-400 transition ml-1"
            >
              <Tag className="w-3 h-3" />
              <span>All Coupons</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
