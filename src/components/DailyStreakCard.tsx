import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Flame,
  CalendarCheck,
  Award,
  Sparkles,
  CheckCircle2,
  Coins,
  Zap,
  Gift,
  PauseCircle,
  Trophy,
} from 'lucide-react';

interface DailyStreakCardProps {
  compact?: boolean;
  onOpenAuth?: () => void;
}

export const DailyStreakCard: React.FC<DailyStreakCardProps> = ({ compact = false, onOpenAuth }) => {
  const {
    currentUser,
    dailyStreakConfig,
    userStreakState,
    claimDailyStreakCheckIn,
    showToast,
  } = useApp();

  const [isClaiming, setIsClaiming] = useState(false);

  const dailyRates = dailyStreakConfig.dailyRates || [];
  const milestones = dailyStreakConfig.milestoneBonuses || [];
  const sortedMilestones = [...milestones].sort((a, b) => a.daysRequired - b.daysRequired);
  const nextMilestone =
    sortedMilestones.find((m) => m.daysRequired > userStreakState.currentStreak) ||
    sortedMilestones[sortedMilestones.length - 1] ||
    null;

  const activeCycleDay =
    userStreakState.currentStreak > 0
      ? ((userStreakState.currentStreak - 1) % Math.max(1, dailyRates.length || 7)) + 1
      : 0;
  const upcomingDay = userStreakState.checkedInToday
    ? activeCycleDay || 1
    : (userStreakState.currentStreak % Math.max(1, dailyRates.length || 7)) + 1;

  const upcomingRate =
    dailyRates.find((r) => r.day === upcomingDay) ||
    dailyRates[dailyRates.length - 1] || { day: 1, label: 'Day 1', bonusPoints: 25, bonusCents: 10 };

  const milestoneProgressPct = nextMilestone
    ? Math.min(100, Math.round((userStreakState.currentStreak / Math.max(1, nextMilestone.daysRequired)) * 100))
    : 100;

  const handleCheckIn = async () => {
    if (!currentUser) {
      if (onOpenAuth) {
        onOpenAuth();
      } else {
        window.dispatchEvent(new CustomEvent('apex:require-auth', { detail: 'claim your daily visit streak bonus' }));
      }
      showToast('Sign in to claim your Daily Streak engagement points.', 'info');
      return;
    }
    if (!dailyStreakConfig.enabled) {
      showToast('Daily Streak Tracker is temporarily paused by administrator.', 'info');
      return;
    }
    if (userStreakState.checkedInToday) {
      showToast('Today’s UTC Daily Streak check-in is already claimed! Return tomorrow UTC.', 'info');
      return;
    }
    setIsClaiming(true);
    try {
      await claimDailyStreakCheckIn();
    } finally {
      setIsClaiming(false);
    }
  };

  if (compact) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-zinc-950 via-amber-950/20 to-zinc-950 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-heading font-bold text-sm sm:text-base text-white">
                Daily Visit Streak Tracker
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold tabular-nums">
                {userStreakState.currentStreak} Day{userStreakState.currentStreak === 1 ? '' : 's'} Active
              </span>
              {!dailyStreakConfig.enabled && (
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px] uppercase">
                  Paused
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 tabular-nums">
              Total Streak Points:{' '}
              <strong className="text-amber-300 font-mono">{userStreakState.totalStreakPoints.toLocaleString()} pts</strong>
              {' · '}Longest: <strong className="text-white font-mono">{userStreakState.longestStreak}d</strong>
              {nextMilestone
                ? ` · Next Milestone (${nextMilestone.daysRequired}d): +${nextMilestone.bonusPoints} pts`
                : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">
              {userStreakState.checkedInToday ? 'Claimed Today (UTC)' : `Day ${upcomingDay} Reward`}
            </span>
            <span className="font-mono font-bold text-xs text-emerald-400 tabular-nums">
              +{upcomingRate.bonusPoints} pts &amp; +{upcomingRate.bonusCents}¢
            </span>
          </div>
          <button
            type="button"
            onClick={handleCheckIn}
            disabled={isClaiming || !dailyStreakConfig.enabled || userStreakState.checkedInToday}
            className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:cursor-not-allowed ${
              userStreakState.checkedInToday
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                : 'bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white shadow-lg shadow-amber-950/40 disabled:opacity-50'
            }`}
          >
            {userStreakState.checkedInToday ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Checked In Today</span>
              </>
            ) : (
              <>
                <CalendarCheck className="w-4 h-4" />
                <span>{isClaiming ? 'Claiming...' : `Claim Day ${upcomingDay} Bonus`}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-zinc-950 border border-amber-500/35 p-6 space-y-6 shadow-2xl">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Consecutive UTC Portal Check-In Rewards</span>
          </div>
          <h3 className="font-heading font-black text-xl sm:text-2xl text-white">
            Daily Streak Tracker &amp; Engagement Multipliers
          </h3>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Visit and check in on consecutive UTC days to unlock escalating engagement points, USD bonus cents, and milestone Free Spin credits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {!dailyStreakConfig.enabled ? (
            <div className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-400 text-xs font-bold flex items-center gap-2">
              <PauseCircle className="w-4 h-4 text-amber-400" />
              <span>Streak Program Paused</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={isClaiming || userStreakState.checkedInToday}
              className={`px-5 py-3 rounded-2xl font-heading font-black text-xs flex items-center gap-2 transition cursor-pointer disabled:cursor-not-allowed ${
                userStreakState.checkedInToday
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white shadow-xl shadow-red-950/50 disabled:opacity-50'
              }`}
            >
              {userStreakState.checkedInToday ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Today&apos;s UTC Check-In Claimed</span>
                </>
              ) : (
                <>
                  <CalendarCheck className="w-4 h-4" />
                  <span>
                    {isClaiming
                      ? 'Verifying UTC Streak...'
                      : `Check In Now (+${upcomingRate.bonusPoints} pts · +${upcomingRate.bonusCents}¢)`}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">Current Streak</span>
          <div className="font-heading font-black text-2xl text-amber-400 tabular-nums flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-amber-500 shrink-0" />
            <span>{userStreakState.currentStreak} Days</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
            Grace window: {dailyStreakConfig.graceWindowHours}h
          </span>
        </div>

        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">Longest Streak</span>
          <div className="font-heading font-black text-2xl text-white tabular-nums">
            {userStreakState.longestStreak} Days
          </div>
          <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
            {userStreakState.totalCheckIns} total UTC check-ins
          </span>
        </div>

        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">Streak Points Earned</span>
          <div className="font-heading font-black text-2xl text-cyan-400 tabular-nums">
            {userStreakState.totalStreakPoints.toLocaleString()} pts
          </div>
          <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
            Max multiplier: {dailyStreakConfig.maxStreakMultiplier.toFixed(1)}×
          </span>
        </div>

        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">Streak Cash Cents</span>
          <div className="font-heading font-black text-2xl text-emerald-400 tabular-nums">
            +{userStreakState.totalStreakCents.toFixed(1)}¢
          </div>
          <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
            ≈ ${(userStreakState.totalStreakCents / 100).toFixed(2)} USD promo credit
          </span>
        </div>
      </div>

      {/* 7-Day Daily Streak Rate Ladder */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-heading font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Consecutive Day Bonus Ladder</span>
          </span>
          <span className="font-mono text-[11px] text-zinc-400">
            Resets after {dailyStreakConfig.resetAfterHours}h inactivity
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {dailyRates.map((rate) => {
            const completed = activeCycleDay >= rate.day && userStreakState.currentStreak > 0;
            const isNext = !userStreakState.checkedInToday && upcomingDay === rate.day;
            return (
              <div
                key={rate.day}
                className={`rounded-2xl p-3 border text-center space-y-1 transition ${
                  isNext
                    ? 'bg-amber-500/15 border-amber-400 ring-1 ring-amber-400/40'
                    : completed
                    ? 'bg-emerald-950/30 border-emerald-500/45'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                  {rate.label || `Day ${rate.day}`}
                </span>
                <div className="font-heading font-black text-sm text-white tabular-nums">
                  +{rate.bonusPoints} pts
                </div>
                <div className="font-mono text-[11px] font-bold text-emerald-400 tabular-nums">
                  +{rate.bonusCents}¢
                </div>
                <span
                  className={`inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    isNext
                      ? 'bg-amber-400 text-black font-bold'
                      : completed
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {isNext ? 'Today' : completed ? 'Done' : `Day ${rate.day}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Bonuses & Progress */}
      {sortedMilestones.length > 0 && (
        <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-heading font-bold text-white flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Streak Milestone Chests</span>
            </span>
            {nextMilestone && (
              <span className="font-mono text-amber-300 tabular-nums">
                {userStreakState.currentStreak}/{nextMilestone.daysRequired} days to {nextMilestone.label}
              </span>
            )}
          </div>

          <div className="w-full h-2.5 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${milestoneProgressPct}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {sortedMilestones.map((ms) => {
              const unlocked =
                (userStreakState.claimedMilestones || []).includes(ms.daysRequired) ||
                userStreakState.longestStreak >= ms.daysRequired;
              return (
                <div
                  key={ms.daysRequired}
                  className={`rounded-xl p-3 border text-xs flex items-center justify-between gap-2 ${
                    unlocked
                      ? 'bg-emerald-950/25 border-emerald-500/40'
                      : 'bg-zinc-950/70 border-zinc-800'
                  }`}
                >
                  <div>
                    <span className="font-bold text-white block">{ms.label}</span>
                    <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
                      {ms.daysRequired}-Day Target
                    </span>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <span className="text-cyan-300 font-bold block">+{ms.bonusPoints} pts</span>
                    <span className="text-emerald-400 text-[11px] block">
                      +{ms.bonusCents}¢
                      {ms.bonusFreeSpins ? ` · +${ms.bonusFreeSpins} Free Spin` : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
