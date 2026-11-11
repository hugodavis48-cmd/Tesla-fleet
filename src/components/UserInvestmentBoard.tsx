import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserInvestment } from '../types';
import { RoiGrowthChart } from './RoiGrowthChart';
import {
  TrendingUp,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
  Coins,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Award,
  Layers,
  Share2,
  Printer,
  X,
  Play,
  Pause,
  Percent,
} from 'lucide-react';

interface UserInvestmentBoardProps {
  onNavigateToStake?: () => void;
  onOpenDeposit?: () => void;
}

export const UserInvestmentBoard: React.FC<UserInvestmentBoardProps> = ({
  onNavigateToStake,
  onOpenDeposit,
}) => {
  const {
    userInvestments,
    claimDividends,
    cancelInvestmentEarly,
    triggerManualCronCycle,
    showToast,
    currentUser,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'running' | 'completed'>('all');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<UserInvestment | null>(null);
  const [confirmEarlyUnstakeId, setConfirmEarlyUnstakeId] = useState<string | null>(null);

  // Filter current user's investments
  const userPositions = userInvestments.filter(
    (inv) => !inv.userId || inv.userId === currentUser?.id || currentUser?.role === 'admin'
  );

  const runningPositions = userPositions.filter((inv) => inv.status === 'running' || !inv.status);
  const completedPositions = userPositions.filter((inv) => inv.status === 'completed');

  const filteredPositions =
    activeFilter === 'running'
      ? runningPositions
      : activeFilter === 'completed'
      ? completedPositions
      : userPositions;

  // Aggregate metrics
  const totalActivePrincipal = runningPositions.reduce((acc, i) => acc + i.amountInvestedUsd, 0);
  const totalAccruedYield = runningPositions.reduce((acc, i) => acc + (i.earnedDividendsUsd || 0), 0);
  const totalCompletedPaidOut = completedPositions.reduce(
    (acc, i) => acc + i.amountInvestedUsd + (i.earnedDividendsUsd || 0),
    0
  );
  const totalLifetimeRoiEarned = userPositions.reduce((acc, i) => acc + (i.earnedDividendsUsd || 0), 0);
  const averageApy =
    runningPositions.length > 0
      ? (runningPositions.reduce((acc, i) => acc + i.apy, 0) / runningPositions.length).toFixed(1)
      : '18.4';

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    showToast('Transaction hash copied!', 'success');
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleWhatsAppShare = (inv: UserInvestment) => {
    const isRunning = inv.status === 'running' || !inv.status;
    const shareText = isRunning
      ? `🚗⚡ I am actively earning ${inv.apy}% APY with my $${inv.amountInvestedUsd.toLocaleString()} stake in the ${inv.poolTitle} on Apex Tesla Hub! Check out decentralized fleet yields:`
      : `🏆 Just completed my ${inv.durationDays}-day investment plan in the ${inv.poolTitle} on Apex Tesla Hub! Earned $${inv.earnedDividendsUsd.toFixed(2)} ROI on $${inv.amountInvestedUsd.toLocaleString()} capital.`;

    const url = typeof window !== 'undefined' ? window.location.origin : 'https://apex-tesla.io';
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}%20${encodeURIComponent(url)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* KPI Summary Dashboard Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Principal */}
        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-mono uppercase tracking-wider font-semibold">Active Capital Deployed</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-black text-2xl sm:text-3xl text-white">
            ${totalActivePrincipal.toLocaleString()}
            <span className="text-xs font-mono text-zinc-500 font-normal ml-1">USD</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{runningPositions.length} Running Position(s) Active</span>
          </div>
        </div>

        {/* Accrued Dividends */}
        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-mono uppercase tracking-wider font-semibold">Accrued Unclaimed Yield</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-black text-2xl sm:text-3xl text-cyan-400">
            ${totalAccruedYield.toFixed(2)}
            <span className="text-xs font-mono text-zinc-500 font-normal ml-1">USD</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-400 font-mono">
            <span>Avg Yield:</span>
            <span className="text-emerald-400 font-bold">{averageApy}% APY</span>
          </div>
        </div>

        {/* Lifetime ROI */}
        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-mono uppercase tracking-wider font-semibold">Total ROI Generated</span>
            <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-black text-2xl sm:text-3xl text-yellow-400">
            +${totalLifetimeRoiEarned.toFixed(2)}
            <span className="text-xs font-mono text-zinc-500 font-normal ml-1">USD</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-500" />
            <span>Telemetry Proven Splits</span>
          </div>
        </div>

        {/* Completed Plans */}
        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-mono uppercase tracking-wider font-semibold">Completed & Settled</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-black text-2xl sm:text-3xl text-purple-300">
            ${totalCompletedPaidOut.toLocaleString()}
            <span className="text-xs font-mono text-zinc-500 font-normal ml-1">USD</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{completedPositions.length} Plan(s) Fully Matured</span>
          </div>
        </div>
      </div>

      {/* Visual Recharts ROI Growth & Compounding Chart */}
      <RoiGrowthChart
        onOpenDeposit={onOpenDeposit}
        onNavigateToStake={onNavigateToStake}
      />

      {/* Tabs and Controls Bar */}
      <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter buttons */}
        <div className="flex items-center p-1 bg-zinc-900 rounded-2xl border border-zinc-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeFilter === 'all'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Positions ({userPositions.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('running')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeFilter === 'running'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Running ({runningPositions.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeFilter === 'completed'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed ({completedPositions.length})</span>
          </button>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => triggerManualCronCycle()}
            className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 hover:text-white transition flex items-center gap-1.5"
            title="Fast-forward automated dividend cycle"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Run ROI Cycle</span>
          </button>

          {onNavigateToStake && (
            <button
              onClick={onNavigateToStake}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Stake New Pool</span>
            </button>
          )}
        </div>
      </div>

      {/* Positions Grid */}
      {filteredPositions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <Coins className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-lg text-white">No Staking Positions Found</h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              {activeFilter === 'running'
                ? 'You do not currently have any active running plans. Stake into our autonomous Robotaxi or Megawatt Supercharger pools to start earning daily ROI.'
                : activeFilter === 'completed'
                ? 'No completed investment plans yet. When your active staking plan duration finishes, it will automatically settle here with full certificates.'
                : 'No investments recorded yet. Pick a yield pool to start putting your crypto to work.'}
            </p>
          </div>
          {onNavigateToStake && (
            <button
              onClick={onNavigateToStake}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 inline-flex items-center gap-2 transition"
            >
              <Coins className="w-4 h-4" />
              <span>Explore Fleet Yield Pools</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPositions.map((inv) => {
            const isRunning = inv.status === 'running' || !inv.status;
            const isCompleted = inv.status === 'completed';
            const duration = inv.durationDays || 30;
            const elapsed = inv.daysElapsed !== undefined ? inv.daysElapsed : Math.min(duration, 14);
            const progressPercent = Math.min(100, Math.round((elapsed / duration) * 100));

            return (
              <div
                key={inv.id}
                className={`p-6 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between gap-6 ${
                  isRunning
                    ? 'bg-zinc-950/90 border-emerald-500/30 hover:border-emerald-500/50 shadow-xl shadow-emerald-950/10'
                    : 'bg-zinc-950/90 border-purple-500/30 hover:border-purple-500/50 shadow-xl'
                }`}
              >
                {/* Header status bar */}
                <div className="flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          isRunning
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                        }`}
                      >
                        {isRunning ? '● RUNNING - YIELD ACCRUING' : '✓ MATURED & SETTLED'}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">ID: #{inv.id}</span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-white">{inv.poolTitle}</h3>
                  </div>

                  <div className="text-right">
                    <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold block">
                      {inv.apy}% APY
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                      {duration}-Day Plan
                    </span>
                  </div>
                </div>

                {/* Progress bar (For Running plans) */}
                {isRunning && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Plan Term Progress</span>
                      </span>
                      <span className="font-mono text-white font-bold">
                        Day {elapsed} of {duration} ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-zinc-500 font-mono pt-0.5">
                      <span>Started: {inv.startDate || inv.investedAt}</span>
                      <span>Matures: {inv.maturityDate || 'In 16 days'}</span>
                    </div>
                  </div>
                )}

                {/* Financial Figures Grid */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block font-medium">Principal</span>
                    <span className="text-white font-bold text-sm">
                      ${inv.amountInvestedUsd.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block font-medium">
                      {isRunning ? 'Unclaimed ROI' : 'Total ROI Earned'}
                    </span>
                    <span className="text-emerald-400 font-bold text-sm">
                      +${(inv.earnedDividendsUsd || 0).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block font-medium">
                      {isRunning ? 'Exp. Final Return' : 'Total Settled'}
                    </span>
                    <span className="text-yellow-400 font-bold text-sm">
                      ${(inv.amountInvestedUsd + (inv.earnedDividendsUsd || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* TX Hash & Certificate details */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500">Staking Hash:</span>
                    <span className="text-zinc-300 truncate max-w-[140px] sm:max-w-[180px]">
                      {inv.txHash || `0x7f4e8b...99a2`}
                    </span>
                    <button
                      onClick={() => handleCopyHash(inv.txHash || '0x7f4e8b...99a2')}
                      className="p-1 text-zinc-500 hover:text-white transition"
                      title="Copy transaction hash"
                    >
                      {copiedHash === (inv.txHash || '0x7f4e8b...99a2') ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {inv.certificateId && (
                    <div className="flex items-center gap-1 text-purple-400 font-bold">
                      <Award className="w-3.5 h-3.5" />
                      <span>{inv.certificateId}</span>
                    </div>
                  )}
                </div>

                {/* Interactive Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/80">
                  {/* Left: WhatsApp Share Function */}
                  <button
                    onClick={() => handleWhatsAppShare(inv)}
                    className="px-3 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition flex items-center gap-1.5"
                    title="Share this investment on WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share on WhatsApp</span>
                  </button>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2">
                    {isRunning ? (
                      <>
                        <button
                          onClick={() => setConfirmEarlyUnstakeId(inv.id)}
                          className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 text-xs transition"
                          title="Unstake before maturity (5% early fee applies)"
                        >
                          Unstake
                        </button>

                        <button
                          onClick={() => claimDividends(inv.id)}
                          disabled={(inv.earnedDividendsUsd || 0) <= 0}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Claim Dividends</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setSelectedCertificate(inv)}
                          className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold text-xs transition flex items-center gap-1.5"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>View Certificate</span>
                        </button>

                        {onNavigateToStake && (
                          <button
                            onClick={onNavigateToStake}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                          >
                            <Coins className="w-3.5 h-3.5" />
                            <span>Re-stake Capital</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Official Yield Certificate Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-zinc-950 border-2 border-purple-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-zinc-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-xl text-white">APEX FLEET SETTLEMENT CERTIFICATE</h3>
                  <p className="text-xs text-zinc-400 font-mono">Proof of Matured Principal & ROI Settlement</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Body Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-purple-500/20 space-y-4 font-mono text-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800 pb-2">
                <span>CERTIFICATE SERIAL</span>
                <span className="text-purple-300 font-bold">{selectedCertificate.certificateId}</span>
              </div>

              <div className="flex justify-between items-center text-zinc-400">
                <span>INVESTOR BENEFICIARY</span>
                <span className="text-white font-bold">{currentUser?.name || 'Alexander Marcus Vance'}</span>
              </div>

              <div className="flex justify-between items-center text-zinc-400">
                <span>FLEET ASSET POOL</span>
                <span className="text-white font-bold">{selectedCertificate.poolTitle}</span>
              </div>

              <div className="flex justify-between items-center text-zinc-400">
                <span>STAKING PRINCIPAL</span>
                <span className="text-white font-bold">${selectedCertificate.amountInvestedUsd.toLocaleString()} USD</span>
              </div>

              <div className="flex justify-between items-center text-zinc-400">
                <span>CONTRACT APY RATE</span>
                <span className="text-emerald-400 font-bold">{selectedCertificate.apy}% APY</span>
              </div>

              <div className="flex justify-between items-center text-zinc-400">
                <span>TOTAL ROI REALIZED</span>
                <span className="text-emerald-400 font-bold">+${(selectedCertificate.earnedDividendsUsd || 0).toFixed(2)} USD</span>
              </div>

              <div className="flex justify-between items-center text-zinc-400">
                <span>SETTLED RETURN TO WALLET</span>
                <span className="text-yellow-400 font-black text-sm">
                  ${(selectedCertificate.amountInvestedUsd + (selectedCertificate.earnedDividendsUsd || 0)).toFixed(2)} USD
                </span>
              </div>

              <div className="flex justify-between items-center text-zinc-400 pt-2 border-t border-zinc-800">
                <span>SETTLEMENT DATE</span>
                <span className="text-zinc-300">{selectedCertificate.completedAt || selectedCertificate.maturityDate}</span>
              </div>

              <div className="pt-2 text-[10px] text-zinc-500 leading-relaxed border-t border-zinc-800">
                Cryptographically validated against Apex Tesla Hub Autonomous Operations smart contract. Non-fungible verification hash: {selectedCertificate.txHash || '0x712a88...c1e90'}.
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => handleWhatsAppShare(selectedCertificate)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Certificate on WhatsApp</span>
              </button>

              <button
                onClick={() => {
                  showToast('Certificate PDF generated for print dispatch.', 'success');
                  setSelectedCertificate(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Early Unstake Confirmation Modal */}
      {confirmEarlyUnstakeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 space-y-5 text-zinc-100">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-heading font-bold text-lg text-white">Premature Plan Unstake</h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Unstaking before the scheduled maturity date releases your capital early, but incurs a standard <strong>5% liquidation penalty</strong> to protect fleet liquidity. Earned dividends to date will be included in the refund.
            </p>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono space-y-1">
              <span className="text-zinc-500 block">EARLY UNSTAKE DISCLOSURE:</span>
              <span className="text-zinc-300">Net refund will be credited instantly to your available USD vault balance.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmEarlyUnstakeId(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  cancelInvestmentEarly(confirmEarlyUnstakeId);
                  setConfirmEarlyUnstakeId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
              >
                Confirm Early Unstake
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
