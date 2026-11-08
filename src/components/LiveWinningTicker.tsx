import React from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Sparkles, ShieldCheck, User } from 'lucide-react';

export const LiveWinningTicker: React.FC = () => {
  const { recentWinners } = useApp();

  return (
    <div className="bg-gradient-to-r from-red-950/90 via-zinc-900 to-black border-b border-red-500/20 text-xs py-2 px-4 overflow-hidden relative z-30 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Ticker Header Badge */}
        <div className="flex items-center gap-2 shrink-0 font-semibold tracking-wider text-red-400 uppercase text-[11px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <Trophy className="w-3.5 h-3.5 text-yellow-400 inline" />
          <span>PROVABLY FAIR WINNERS:</span>
        </div>

        {/* Marquee Ticker with Verified Avatars & Rewards */}
        <div className="overflow-hidden flex-1 relative mx-2">
          <div className="flex gap-8 whitespace-nowrap animate-marquee">
            {recentWinners.slice(0, 10).map((winner, idx) => (
              <div key={`${winner.id}-${idx}`} className="inline-flex items-center gap-2.5 text-zinc-300">
                {/* Verified Avatar with Safe Fallback */}
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-red-500/40 bg-zinc-800 shrink-0 flex items-center justify-center">
                  <img
                    src={winner.avatar}
                    alt={winner.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback gracefully to placeholder icon if network blips
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <User className="w-3 h-3 text-zinc-400 absolute pointer-events-none" />
                </div>

                <span className="font-semibold text-white tracking-tight">{winner.username}</span>
                <span className="text-zinc-500 text-[11px]">won</span>
                <span className="font-bold text-yellow-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-400 shrink-0" />
                  <span>{winner.prize}</span>
                </span>

                <span className="text-zinc-400 text-[10px] bg-zinc-800/90 px-1.5 py-0.5 rounded border border-zinc-700/60 font-mono">
                  {winner.timestamp}
                </span>

                <span className="text-emerald-400 text-[10px] flex items-center gap-0.5 font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>{winner.verifiedHash}</span>
                </span>

                <span className="text-zinc-700 mx-2 font-bold">•</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Proof-of-Fair Jackpot Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-400 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-yellow-400 font-bold font-mono">$8,000.00</span>
          <span>Max Scratch Card Cap</span>
        </div>
      </div>
    </div>
  );
};
