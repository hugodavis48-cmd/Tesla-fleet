import React from 'react';
import { useApp } from '../context/AppContext';
import { Lock, ShieldAlert, ArrowRight, X, Trophy, CheckCircle2 } from 'lucide-react';

interface WinActivationPolicyModalProps {
  onOpenDeposit: () => void;
}

export const WinActivationPolicyModal: React.FC<WinActivationPolicyModalProps> = ({
  onOpenDeposit,
}) => {
  const {
    currentUser,
    winActivationPopup,
    closeWinActivationPopup,
    lockedWinBalanceUsd,
    minDepositToActivateWinsUsd,
    formatCurrency,
  } = useApp();

  if (!winActivationPopup.isOpen) return null;

  const totalDeposited = currentUser?.totalDepositedUsd || 0;
  const remainingUsd = Math.max(0, minDepositToActivateWinsUsd - totalDeposited);
  const progressPct = Math.min(100, Math.round((totalDeposited / minDepositToActivateWinsUsd) * 100));

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="win-activation-policy-title"
        className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-amber-500/45 shadow-2xl shadow-amber-950/30 overflow-hidden text-zinc-100"
      >
        {/* Top Accent Strip */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950/70 via-zinc-900 to-zinc-950 border-b border-amber-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 id="win-activation-policy-title" className="font-heading font-black text-base sm:text-lg text-white">
                🔒 ${minDepositToActivateWinsUsd} Min Deposit Win-Activation Policy
              </h3>
              {winActivationPopup.actionLabel && (
                <p className="text-[11px] font-mono text-amber-300">
                  Triggered during: {winActivationPopup.actionLabel}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={closeWinActivationPopup}
            aria-label="Close policy notice"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Reward Highlight if triggered on a win */}
          {(winActivationPopup.prizeLabel || (winActivationPopup.prizeAmountUsd || 0) > 0) && (
            <div className="p-3.5 rounded-2xl bg-amber-950/25 border border-amber-500/35 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase text-amber-300 block">
                    Pending Promotional Reward
                  </span>
                  <p className="font-bold text-sm text-white truncate">
                    {winActivationPopup.prizeLabel || 'Locked Promotional Winnings'}
                  </p>
                </div>
              </div>
              {(winActivationPopup.prizeAmountUsd || 0) > 0 && (
                <span className="font-heading font-black text-base text-amber-300 tabular-nums shrink-0">
                  {formatCurrency(winActivationPopup.prizeAmountUsd || 0, { includeCode: true })}
                </span>
              )}
            </div>
          )}

          {/* Policy Description */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Money winnings ($$) from free spins &amp; promotional rewards require at least{' '}
              <strong className="text-amber-300">${minDepositToActivateWinsUsd}</strong> cumulative verified deposits before withdrawal or checkout use. Won Tesla vehicles are managed under{' '}
              <strong className="text-white">Dashboard → Won Prizes</strong>.
            </p>
          </div>

          {/* Deposit Progress */}
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">Cumulative Verified Deposits</span>
              <span className="text-amber-300 font-bold tabular-nums">
                ${totalDeposited.toLocaleString()} / ${minDepositToActivateWinsUsd} USD ({progressPct}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>
                Locked Win Vault:{' '}
                <strong className="text-white font-mono">
                  {formatCurrency(lockedWinBalanceUsd, { includeCode: true })}
                </strong>
              </span>
              <span>
                Remaining to Unlock:{' '}
                <strong className="text-amber-300 font-mono">${remainingUsd.toFixed(2)} USD</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Once verified deposits reach ${minDepositToActivateWinsUsd}, all locked cash winnings unlock automatically.</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                closeWinActivationPopup();
                onOpenDeposit();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/30 transition cursor-pointer"
            >
              <span>Deposit ${remainingUsd > 0 ? Math.ceil(remainingUsd) : minDepositToActivateWinsUsd}+ to Unlock</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={closeWinActivationPopup}
              className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
