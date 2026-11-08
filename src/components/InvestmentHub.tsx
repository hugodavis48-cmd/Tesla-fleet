import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INVESTMENT_POOLS } from '../data/mockData';
import { InvestmentPool } from '../types';
import {
  TrendingUp,
  Zap,
  ShieldCheck,
  Coins,
  ArrowRight,
  Clock,
  DollarSign,
  Lock,
  Sparkles,
  Calculator,
} from 'lucide-react';

interface InvestmentHubProps {
  onOpenDeposit: () => void;
  onNavigateToDashboard: () => void;
}

export const InvestmentHub: React.FC<InvestmentHubProps> = ({ onOpenDeposit, onNavigateToDashboard }) => {
  const { userInvestments, stakeInPool, claimDividends, balances, showToast } = useApp();

  const [activePoolToStake, setActivePoolToStake] = useState<InvestmentPool | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('500');

  const numStake = parseFloat(stakeAmount) || 0;

  const handleConfirmStake = () => {
    if (!activePoolToStake) return;
    if (numStake < activePoolToStake.minInvestmentUsd) {
      showToast(`Minimum investment for this pool is $${activePoolToStake.minInvestmentUsd}.`, 'error');
      return;
    }

    const ok = stakeInPool(activePoolToStake.id, numStake);
    if (ok) {
      setActivePoolToStake(null);
      onNavigateToDashboard();
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Decentralized Tesla Fleet Yield & Asset Staking</span>
        </div>
        <h2 className="font-heading font-black text-3xl sm:text-5xl text-white">
          VEHICLE INVESTMENT MANAGEMENT
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base">
          Put your crypto to work. Stake capital into commercial autonomous Tesla Robotaxis, Megawatt Supercharger nodes, and exotic rental fleets. Earn 14.8% to 22.6% APY with daily dividend distribution.
        </p>
      </div>

      {/* Yield Pools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {INVESTMENT_POOLS.map((pool) => {
          const percentFunded = Math.min(100, Math.round((pool.totalStakedUsd / pool.poolCapUsd) * 100));
          return (
            <div
              key={pool.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl hover:border-emerald-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Pool Header Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-black">
                  <img src={pool.image} alt={pool.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                  {/* APY badge */}
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-emerald-600/90 backdrop-blur-md text-white font-mono font-bold text-sm shadow-lg">
                    {pool.apy}% APY
                  </div>

                  <div className="absolute bottom-3 left-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-900/80 border border-zinc-700 text-zinc-300 text-[10px] font-mono uppercase tracking-wider">
                      {pool.category}
                    </span>
                    <h3 className="font-heading font-bold text-lg text-white mt-1">
                      {pool.title}
                    </h3>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {pool.description}
                  </p>

                  {/* Pool Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 block font-mono">LOCK PERIOD</span>
                      <span className="text-white font-bold">{pool.lockPeriodDays} Days</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block font-mono">MIN STAKE</span>
                      <span className="text-emerald-400 font-bold">${pool.minInvestmentUsd} USD</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block font-mono">DAILY ESTIMATE</span>
                      <span className="text-yellow-400 font-bold font-mono">
                        ~${pool.dailyPayoutEstUsdPer1000.toFixed(2)} / $1k
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block font-mono">RISK PROFILE</span>
                      <span className="text-zinc-300 font-semibold">{pool.riskLevel}</span>
                    </div>
                  </div>

                  {/* Progress bar to Cap */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>Total Staked</span>
                      <span className="text-white font-mono">
                        ${(pool.totalStakedUsd / 1000000).toFixed(2)}M / ${(pool.poolCapUsd / 1000000).toFixed(2)}M ({percentFunded}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                        style={{ width: `${percentFunded}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stake CTA */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => {
                    setActivePoolToStake(pool);
                    setStakeAmount(pool.minInvestmentUsd.toString());
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition"
                >
                  <Coins className="w-4 h-4" />
                  <span>Stake Funds into Pool</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active User Investments Panel */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h3 className="font-heading font-bold text-xl text-white">Your Active Fleet Staking Portfolio</h3>
            <p className="text-xs text-zinc-400">Live telematics dividend yield tracking & automated smart contract payouts</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">Total Portfolio Value:</span>
            <span className="font-heading font-black text-xl text-emerald-400">
              ${userInvestments.reduce((sum, inv) => sum + inv.amountInvestedUsd, 0).toLocaleString()} USD
            </span>
          </div>
        </div>

        {userInvestments.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <TrendingUp className="w-12 h-12 text-zinc-600 mx-auto" />
            <p className="text-zinc-400 text-sm">You haven't staked in any vehicle yield pools yet.</p>
            <p className="text-xs text-zinc-500">Pick a pool above to start earning daily automated dividends!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userInvestments.map((inv) => (
              <div
                key={inv.id}
                className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between gap-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-white">{inv.poolTitle}</h4>
                    <span className="text-[11px] text-zinc-400 font-mono">Staked on {inv.investedAt}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                    {inv.apy}% APY
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-black/60 border border-zinc-800/80 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">PRINCIPAL</span>
                    <span className="text-white font-bold">${inv.amountInvestedUsd.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">UNCLAIMED</span>
                    <span className="text-emerald-400 font-bold">${inv.earnedDividendsUsd.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">NEXT PAYOUT</span>
                    <span className="text-yellow-400 font-bold">in {inv.nextPayoutHours}h</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Auto-compounding active</span>
                  </div>

                  <button
                    onClick={() => claimDividends(inv.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                  >
                    Claim ${inv.earnedDividendsUsd.toFixed(2)} Dividends
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Staking Action Modal */}
      {activePoolToStake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100">
            <div className="p-6 bg-gradient-to-r from-emerald-950/70 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
                  Stake In Vehicle Yield
                </span>
                <h3 className="font-heading font-bold text-lg text-white truncate max-w-[280px]">
                  {activePoolToStake.title}
                </h3>
              </div>
              <button
                onClick={() => setActivePoolToStake(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                  <span>Investment Amount (USD)</span>
                  <span>Min: ${activePoolToStake.minInvestmentUsd}</span>
                </div>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="number"
                    min={activePoolToStake.minInvestmentUsd}
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Calculator breakdown */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-300 font-semibold border-b border-zinc-800 pb-2">
                  <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Projected Yield Return (@ {activePoolToStake.apy}% APY)</span>
                </div>
                <div className="flex justify-between text-zinc-400 pt-1">
                  <span>Daily Payout:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    +${((numStake * (activePoolToStake.apy / 100)) / 365).toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Monthly Return:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    +${((numStake * (activePoolToStake.apy / 100)) / 12).toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Annual APY Yield:</span>
                  <span className="text-yellow-400 font-mono font-bold">
                    +${(numStake * (activePoolToStake.apy / 100)).toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Vault Balance status */}
              <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-black/60 border border-zinc-800">
                <span className="text-zinc-400">Available Vault Balance:</span>
                <span className="font-bold text-white">${balances.usd.toFixed(2)} USD</span>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                {balances.usd < numStake ? (
                  <button
                    onClick={() => {
                      setActivePoolToStake(null);
                      onOpenDeposit();
                    }}
                    className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <span>Deposit Crypto (USDT, BTC, XRP, BNB) to Fund</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleConfirmStake}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-heading font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
                  >
                    <span>Confirm Stake of ${numStake.toLocaleString()} USD</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
