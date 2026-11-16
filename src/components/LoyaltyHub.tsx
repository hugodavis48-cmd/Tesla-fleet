import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  Crown,
  ArrowUpRight,
  ShoppingBag,
  Users,
  Wallet,
  Search,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Layers,
  Car,
  Zap,
} from 'lucide-react';
import { DailyStreakCard } from './DailyStreakCard';

export type LoyaltyTierId = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface LoyaltyTierConfig {
  id: LoyaltyTierId;
  name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  minDepositUsd: number;
  maxDepositUsd: number | null;
  multiplier: number;
  multiplierLabel: string;
  cashbackRatePct: number;
  stakingBonusPct: number;
  referralBonusPct: number;
  feeDiscountPct: number;
  perks: string[];
  accentText: string;
  accentBg: string;
  accentBorder: string;
  barColor: string;
}

export const LOYALTY_TIERS: LoyaltyTierConfig[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    minDepositUsd: 0,
    maxDepositUsd: 499,
    multiplier: 1.0,
    multiplierLabel: '1.0x',
    cashbackRatePct: 1.0,
    stakingBonusPct: 0,
    referralBonusPct: 0,
    feeDiscountPct: 0,
    perks: [
      'Base 1.0x reward multiplier on all platform activity & points',
      '1.0% storefront cashback credit on Tesla parts & hardware',
      '$25 Bronze referral credit per verified friend deposit ($25–$200 across tiers)',
    ],
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/30',
    barColor: 'bg-amber-500',
  },
  {
    id: 'silver',
    name: 'Silver',
    minDepositUsd: 500,
    maxDepositUsd: 4999,
    multiplier: 1.25,
    multiplierLabel: '1.25x',
    cashbackRatePct: 2.0,
    stakingBonusPct: 1.5,
    referralBonusPct: 25,
    feeDiscountPct: 15,
    perks: [
      '1.25x Loyalty Multiplier across deposits, purchases & referral points',
      '+1.5% APY boost on active Robotaxi & Supercharger staking pools',
      '$75 Silver Ambassador referral payout + 15% service fee discount',
    ],
    accentText: 'text-zinc-200',
    accentBg: 'bg-zinc-400/10',
    accentBorder: 'border-zinc-400/40',
    barColor: 'bg-zinc-300',
  },
  {
    id: 'gold',
    name: 'Gold',
    minDepositUsd: 5000,
    maxDepositUsd: 24999,
    multiplier: 1.5,
    multiplierLabel: '1.5x',
    cashbackRatePct: 3.5,
    stakingBonusPct: 3.0,
    referralBonusPct: 50,
    feeDiscountPct: 30,
    perks: [
      '1.5x Loyalty Multiplier on all store purchases, fleet yield & referrals',
      '+3.0% APY boost on Tesla Fleet & Featured Stock ROI vaults',
      '$125 Gold Plaid referral payout + 30% off vinyl wraps & retrofits',
    ],
    accentText: 'text-yellow-300',
    accentBg: 'bg-yellow-500/10',
    accentBorder: 'border-yellow-500/40',
    barColor: 'bg-yellow-400',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    minDepositUsd: 25000,
    maxDepositUsd: null,
    multiplier: 2.0,
    multiplierLabel: '2.0x',
    cashbackRatePct: 5.0,
    stakingBonusPct: 6.0,
    referralBonusPct: 100,
    feeDiscountPct: 50,
    perks: [
      '2.0x Maximum Loyalty Multiplier across every ecosystem action',
      '+6.0% APY Founders Vault boost + 5.0% hardware cashback rebate',
      '$200 Max Platinum referral payout & 50% fee waiver on enclosed dispatch',
    ],
    accentText: 'text-cyan-300',
    accentBg: 'bg-cyan-500/10',
    accentBorder: 'border-cyan-400/40',
    barColor: 'bg-cyan-400',
  },
];

export interface LoyaltyDepositSummary {
  cumulativeDepositUsd: number;
  activeTier: LoyaltyTierConfig;
  nextTier: LoyaltyTierConfig | null;
  progressToNextPct: number;
  depositRemainingToNextUsd: number;
}

export function getLoyaltyTierSummary(cumulativeDepositUsd: number): LoyaltyDepositSummary {
  const safeDeposit = Math.max(0, Number(cumulativeDepositUsd) || 0);
  let activeTier = LOYALTY_TIERS[0];
  for (const tier of LOYALTY_TIERS) {
    if (safeDeposit >= tier.minDepositUsd) {
      activeTier = tier;
    }
  }
  const idx = LOYALTY_TIERS.findIndex((t) => t.id === activeTier.id);
  const nextTier = idx < LOYALTY_TIERS.length - 1 ? LOYALTY_TIERS[idx + 1] : null;
  const progressToNextPct = nextTier
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((safeDeposit - activeTier.minDepositUsd) /
              Math.max(1, nextTier.minDepositUsd - activeTier.minDepositUsd)) *
              100
          )
        )
      )
    : 100;
  const depositRemainingToNextUsd = nextTier
    ? Math.max(0, Number((nextTier.minDepositUsd - safeDeposit).toFixed(2)))
    : 0;

  return {
    cumulativeDepositUsd: safeDeposit,
    activeTier,
    nextTier,
    progressToNextPct,
    depositRemainingToNextUsd,
  };
}

type ActivityCategory = 'deposit' | 'purchase' | 'referral';

interface LoyaltyActivityEntry {
  id: string;
  category: ActivityCategory;
  title: string;
  subtitle: string;
  timestamp: string;
  amountUsd: number;
  basePoints: number;
  multiplierApplied: number;
  totalPoints: number;
  status: string;
}

interface LoyaltyHubProps {
  onOpenDeposit: () => void;
  onNavigateTab: (tab: 'garage' | 'referrals' | 'investments' | 'stocks' | 'wallet') => void;
  onNavigateToServices: () => void;
}

export const LoyaltyHub: React.FC<LoyaltyHubProps> = ({
  onOpenDeposit,
  onNavigateTab,
  onNavigateToServices,
}) => {
  const {
    currentUser,
    transactions,
    vehicleOrders,
    serviceBookings,
    bookedRentals,
    formatCurrency,
  } = useApp();

  const [activityFilter, setActivityFilter] = useState<'all' | ActivityCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    cumulativeDepositUsd,
    depositCount,
    totalPurchasesUsd,
    purchaseCount,
    totalReferralsCount,
    totalReferralEarningsUsd,
    activeTier,
    nextTier,
    progressToNextPct,
    depositRemainingToNextUsd,
    effectiveMultipliedPoints,
    estimatedMonthlyRewardsUsd,
    activityLedger,
  } = useMemo(() => {
    const entries: Omit<LoyaltyActivityEntry, 'multiplierApplied' | 'totalPoints'>[] = [];
    const seenIds = new Set<string>();

    // 1. Cumulative Verified Deposit Volume (tier qualifier)
    let depTxSum = 0;
    let depCount = 0;
    const depositTxs = transactions.filter((t) => t.type === 'deposit');
    depositTxs.forEach((tx) => {
      const amt = Math.max(0, Number(tx.usdEquivalent) || 0);
      depTxSum += amt;
      depCount += 1;
      seenIds.add(tx.id);
      entries.push({
        id: tx.id,
        category: 'deposit',
        title: tx.description || `Wallet Deposit (${tx.currency})`,
        subtitle: `Qualifying Deposit • Ref ${tx.txHash}`,
        timestamp: tx.timestamp || 'Recent',
        amountUsd: amt,
        basePoints: Math.round(amt * 1),
        status: tx.status === 'completed' ? 'Verified' : tx.status,
      });
    });

    const profileDepositUsd = Math.max(0, Number(currentUser?.totalDepositedUsd || 0));
    const cumulativeDepUsd = Math.max(profileDepositUsd, depTxSum);

    if (profileDepositUsd > depTxSum) {
      const diff = profileDepositUsd - depTxSum;
      if (depCount === 0) depCount = 1;
      entries.push({
        id: 'dep-verified-baseline',
        category: 'deposit',
        title: 'Cumulative Verified Deposit Volume',
        subtitle: 'On-chain vault settlement • Tier Qualification',
        timestamp: currentUser?.memberSince || 'Account Ledger',
        amountUsd: diff,
        basePoints: Math.round(diff * 1),
        status: 'Verified',
      });
    }

    // 2. Purchases (Vehicle Orders, Service Bookings, Rentals, Store / Scratch Cards)
    let purchUsd = 0;
    let purchCount = 0;

    const userOrders = vehicleOrders.filter(
      (o) => !currentUser || o.userId === currentUser.id || o.userEmail?.toLowerCase() === currentUser.email.toLowerCase()
    );
    userOrders.forEach((order) => {
      const amt = Math.max(0, Number(order.totalUsd) || 0);
      purchUsd += amt;
      purchCount += 1;
      entries.push({
        id: `veh-${order.id}`,
        category: 'purchase',
        title: `Vehicle Purchase: ${order.vehicleName}`,
        subtitle: `VIN ${order.vinAssigned} • Cashback Eligible`,
        timestamp: order.orderedAt ? order.orderedAt.replace('T', ' ').substring(0, 16) : 'Order Logged',
        amountUsd: amt,
        basePoints: Math.round(amt * 2),
        status: order.status.replace(/_/g, ' '),
      });
    });

    serviceBookings.forEach((sb) => {
      const amt = Math.max(0, Number(sb.totalCostUsd) || 0);
      if (amt <= 0) return;
      purchUsd += amt;
      purchCount += 1;
      entries.push({
        id: `srv-${sb.id}`,
        category: 'purchase',
        title: `Service Bay: ${sb.serviceType}`,
        subtitle: `${sb.vehicleName} • Service Fee Discount Eligible`,
        timestamp: sb.createdAt || sb.scheduledDate || 'Booked',
        amountUsd: amt,
        basePoints: Math.round(amt * 2),
        status: sb.status,
      });
    });

    bookedRentals.forEach((r, idx) => {
      const amt = Math.max(0, Number(r.totalUsd) || 0);
      if (amt <= 0) return;
      purchUsd += amt;
      purchCount += 1;
      entries.push({
        id: `rent-${r.rentalId || idx}`,
        category: 'purchase',
        title: `Rental Dispatch: ${r.vehicle.model} ${r.vehicle.trim}`,
        subtitle: `${r.days} day(s) • Cashback Eligible`,
        timestamp: r.startDate || 'Reserved',
        amountUsd: amt,
        basePoints: Math.round(amt * 2),
        status: 'Reserved',
      });
    });

    const purchaseTxs = transactions.filter(
      (t) =>
        (t.type === 'service_payment' || t.type === 'rental_payment' || t.type === 'scratch_card_purchase') &&
        !seenIds.has(t.id)
    );
    purchaseTxs.forEach((tx) => {
      const descLower = (tx.description || '').toLowerCase();
      const isStoreOrScratch =
        tx.type === 'scratch_card_purchase' ||
        descLower.includes('store') ||
        descLower.includes('cart') ||
        descLower.includes('hardware') ||
        descLower.includes('accessories');
      const hasBookingMatch =
        serviceBookings.some((sb) => descLower.includes(sb.serviceType.toLowerCase())) ||
        userOrders.some((o) => descLower.includes(o.vehicleName.toLowerCase()));

      if (!isStoreOrScratch && hasBookingMatch) return;

      const amt = Math.max(0, Number(tx.usdEquivalent) || 0);
      if (amt <= 0) return;
      purchUsd += amt;
      purchCount += 1;
      entries.push({
        id: `txp-${tx.id}`,
        category: 'purchase',
        title: tx.description || 'Platform Purchase',
        subtitle: `${tx.type === 'scratch_card_purchase' ? 'Scratch Card' : 'Checkout Payment'} • Reward Multiplied`,
        timestamp: tx.timestamp || 'Completed',
        amountUsd: amt,
        basePoints: Math.round(amt * 2),
        status: tx.status === 'completed' ? 'Settled' : tx.status,
      });
    });

    // 3. Referrals
    const referredUsersList = currentUser?.referredUsers || [];
    const referralTxs = transactions.filter((t) => t.type === 'referral_credit');
    let refEarnings = Number(currentUser?.referralEarningsUsd || 0);
    let refCount = Number(currentUser?.referralCount || 0);

    if (referredUsersList.length > 0) {
      referredUsersList.forEach((ref) => {
        const earned = Number(ref.earnedCreditUsd || 0);
        entries.push({
          id: `ref-${ref.id}`,
          category: 'referral',
          title: `Referral Bonus: ${ref.name}`,
          subtitle: `${ref.status === 'deposit_completed' ? 'Verified Deposit Referral' : 'Account Sign-Up'} • Ambassador Reward`,
          timestamp: ref.date || 'Verified',
          amountUsd: earned,
          basePoints: 250 + Math.round(earned * 2),
          status: ref.status === 'deposit_completed' ? 'Qualified' : 'Pending Deposit',
        });
      });
      if (refCount < referredUsersList.length) refCount = referredUsersList.length;
    } else if (referralTxs.length > 0) {
      referralTxs.forEach((tx) => {
        const amt = Math.max(0, Number(tx.usdEquivalent) || 0);
        entries.push({
          id: `reftx-${tx.id}`,
          category: 'referral',
          title: tx.description || 'Ambassador Referral Credit',
          subtitle: 'Ambassador tier credit',
          timestamp: tx.timestamp || 'Credited',
          amountUsd: amt,
          basePoints: 250 + Math.round(amt * 2),
          status: 'Credited',
        });
      });
      if (refCount === 0) refCount = referralTxs.length;
      if (refEarnings === 0) refEarnings = referralTxs.reduce((s, t) => s + (t.usdEquivalent || 0), 0);
    } else if (refCount > 0 || refEarnings > 0) {
      entries.push({
        id: 'ref-summary-record',
        category: 'referral',
        title: `Verified Partner Referrals (${refCount} Invited)`,
        subtitle: 'Ambassador tier credit',
        timestamp: currentUser?.memberSince || 'Account Summary',
        amountUsd: refEarnings,
        basePoints: refCount * 250 + Math.round(refEarnings * 2),
        status: 'Credited',
      });
    }

    // Tier calculated strictly from cumulative deposit volume
    const depositSummary = getLoyaltyTierSummary(cumulativeDepUsd);
    const resolvedTier = depositSummary.activeTier;

    const enrichedLedger: LoyaltyActivityEntry[] = entries
      .map((e) => ({
        ...e,
        multiplierApplied: resolvedTier.multiplier,
        totalPoints: Math.round(e.basePoints * resolvedTier.multiplier),
      }))
      .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));

    const multipliedTotal = enrichedLedger.reduce((sum, item) => sum + item.totalPoints, 0);
    const estRewardUsd = Number(
      ((purchUsd * (resolvedTier.cashbackRatePct / 100)) + refEarnings * (resolvedTier.referralBonusPct / 100)).toFixed(2)
    );

    return {
      cumulativeDepositUsd: depositSummary.cumulativeDepositUsd,
      depositCount: depCount,
      totalPurchasesUsd: purchUsd,
      purchaseCount: purchCount,
      totalReferralsCount: refCount,
      totalReferralEarningsUsd: refEarnings,
      activeTier: resolvedTier,
      nextTier: depositSummary.nextTier,
      progressToNextPct: depositSummary.progressToNextPct,
      depositRemainingToNextUsd: depositSummary.depositRemainingToNextUsd,
      effectiveMultipliedPoints: multipliedTotal,
      estimatedMonthlyRewardsUsd: estRewardUsd,
      activityLedger: enrichedLedger,
    };
  }, [currentUser, transactions, vehicleOrders, serviceBookings, bookedRentals]);

  const filteredActivity = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return activityLedger.filter((entry) => {
      const matchesCat = activityFilter === 'all' || entry.category === activityFilter;
      const matchesQuery =
        !q ||
        entry.title.toLowerCase().includes(q) ||
        entry.subtitle.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [activityLedger, activityFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Daily Visit Streak Progress Strip */}
      <DailyStreakCard compact />

      {/* Section 1: Active Tier Status & Deposit-Volume Multiplier Progression */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-7 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
              <Crown className={`w-4 h-4 ${activeTier.accentText}`} />
              <span>Deposit-Based Loyalty Rank &amp; Multipliers</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-3">
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
                {activeTier.name} Tier
              </h3>
              <span
                className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold tabular-nums ${activeTier.accentBg} ${activeTier.accentBorder} ${activeTier.accentText}`}
              >
                {activeTier.multiplierLabel} Reward Multiplier
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Your loyalty rank and reward multipliers scale automatically based on your cumulative verified deposit volume: Bronze ($0+), Silver ($500+), Gold ($5,000+), and Platinum ($25,000+).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenDeposit}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Deposit to Upgrade Tier</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToServices}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-zinc-400" />
              <span>Shop &amp; Services</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('referrals')}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <span>Refer Friends</span>
            </button>
          </div>
        </div>

        {/* Tier Progression Bar (Cumulative Deposit Volume) */}
        <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-zinc-400">
                Cumulative Deposit Volume:{' '}
                <strong className="text-white font-mono tabular-nums">
                  {formatCurrency(cumulativeDepositUsd, { includeCode: true })}
                </strong>
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">
                Multiplied Reward Power:{' '}
                <strong className={`${activeTier.accentText} font-mono tabular-nums`}>
                  {effectiveMultipliedPoints.toLocaleString()} pts ({activeTier.multiplierLabel})
                </strong>
              </span>
            </div>

            {nextTier ? (
              <span className="text-zinc-300 font-mono tabular-nums">
                {formatCurrency(depositRemainingToNextUsd)} more deposited to unlock {nextTier.name} ({nextTier.multiplierLabel})
              </span>
            ) : (
              <span className="text-cyan-300 font-mono font-bold">
                Maximum Platinum Tier Unlocked (2.0x Multiplier)
              </span>
            )}
          </div>

          <div className="w-full h-2.5 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${activeTier.barColor}`}
              style={{ width: `${progressToNextPct}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <span className="text-zinc-400">Active Multiplier</span>
              <span className={`font-mono font-bold tabular-nums ${activeTier.accentText}`}>{activeTier.multiplierLabel}</span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <span className="text-zinc-400">Store Cashback</span>
              <span className="font-mono font-bold text-emerald-400 tabular-nums">{activeTier.cashbackRatePct.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <span className="text-zinc-400">Staking Yield Boost</span>
              <span className="font-mono font-bold text-white tabular-nums">+{activeTier.stakingBonusPct.toFixed(1)}% APY</span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <span className="text-zinc-400">Service Fee Waiver</span>
              <span className="font-mono font-bold text-white tabular-nums">{activeTier.feeDiscountPct}% OFF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Tracked User Activity KPI Strip (Deposits / Purchases / Referrals) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Cumulative Deposits (Tier Basis)</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-heading font-black text-2xl text-white tabular-nums">
            {formatCurrency(cumulativeDepositUsd, { includeCode: true })}
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
            <span>{depositCount} verified deposit(s)</span>
            <span className="font-mono text-emerald-400 tabular-nums">
              {activeTier.name} ({activeTier.multiplierLabel})
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Purchases &amp; Fleet Orders</span>
            <ShoppingBag className="w-4 h-4 text-red-400" />
          </div>
          <div className="font-heading font-black text-2xl text-white tabular-nums">
            {formatCurrency(totalPurchasesUsd, { includeCode: true })}
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
            <span>{purchaseCount} qualifying order(s)</span>
            <span className="font-mono text-red-400 tabular-nums">
              {activeTier.cashbackRatePct.toFixed(1)}% Cashback
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Partner Referrals</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-heading font-black text-2xl text-white tabular-nums">
            {totalReferralsCount} Invited • {formatCurrency(totalReferralEarningsUsd)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
            <span>Est. tier rebate: {formatCurrency(estimatedMonthlyRewardsUsd)}</span>
            <span className="font-mono text-cyan-400 tabular-nums">
              +{activeTier.referralBonusPct}% Ref Bonus
            </span>
          </div>
        </div>
      </div>

      {/* Section 3: Loyalty Tiers & Multipliers Matrix */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-400" />
              <span>Deposit Tiers &amp; Reward Multipliers</span>
            </h4>
            <p className="text-xs text-zinc-400">
              Tier upgrades unlock automatically once your cumulative deposit volume meets each threshold.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400 tabular-nums">
            Active Rank: <strong className={activeTier.accentText}>{activeTier.name.toUpperCase()} ({activeTier.multiplierLabel})</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {LOYALTY_TIERS.map((tier) => {
            const isCurrent = tier.id === activeTier.id;
            const isUnlocked = cumulativeDepositUsd >= tier.minDepositUsd;
            return (
              <div
                key={tier.id}
                className={`rounded-2xl p-5 border flex flex-col justify-between gap-4 transition ${
                  isCurrent
                    ? `${tier.accentBg} ${tier.accentBorder}`
                    : 'bg-zinc-900/50 border-zinc-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-heading font-black text-lg ${isCurrent ? 'text-white' : tier.accentText}`}>
                      {tier.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold tabular-nums ${
                        isCurrent
                          ? 'bg-white text-black'
                          : 'bg-zinc-800 text-zinc-200'
                      }`}
                    >
                      {tier.multiplierLabel}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-zinc-400 tabular-nums">
                    {tier.maxDepositUsd !== null
                      ? `$${tier.minDepositUsd.toLocaleString()} – $${tier.maxDepositUsd.toLocaleString()} deposited`
                      : `$${tier.minDepositUsd.toLocaleString()}+ deposited`}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] py-2 border-y border-zinc-800/80">
                    <div>
                      <span className="text-zinc-500 block">Cashback</span>
                      <span className="font-mono font-bold text-emerald-400 tabular-nums">{tier.cashbackRatePct}%</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">APY Boost</span>
                      <span className="font-mono font-bold text-white tabular-nums">+{tier.stakingBonusPct}%</span>
                    </div>
                  </div>

                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-1.5">
                        <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${tier.accentText}`} />
                        <span className="leading-snug">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] font-mono">
                  {isCurrent ? (
                    <span className={`font-bold flex items-center gap-1 ${tier.accentText}`}>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Current Active Tier
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-emerald-400">Threshold Cleared</span>
                  ) : (
                    <span className="text-zinc-500 tabular-nums">
                      Need {formatCurrency(tier.minDepositUsd - cumulativeDepositUsd)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4: Filterable Qualifying Activity Ledger */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h4 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" />
              <span>Tracked Loyalty Activity &amp; Multiplier Ledger</span>
            </h4>
            <p className="text-xs text-zinc-400">
              All qualifying deposits, purchases, and referrals with your {activeTier.multiplierLabel} {activeTier.name} multiplier applied.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activity..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'deposit', label: 'Deposits' },
                  { id: 'purchase', label: 'Purchases' },
                  { id: 'referral', label: 'Referrals' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivityFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    activityFilter === tab.id
                      ? 'bg-red-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredActivity.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-zinc-600 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-200">
                No loyalty events match your current filter
              </p>
              <p className="text-xs text-zinc-400">
                Make a deposit, purchase Tesla hardware/services, or invite friends to earn weighted loyalty rewards.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setActivityFilter('all');
                  setSearchQuery('');
                }}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={onOpenDeposit}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                Make a Deposit
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] font-mono uppercase text-zinc-400">
                  <th className="py-2.5 px-3">Activity</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Volume</th>
                  <th className="py-2.5 px-3 text-right">Base Pts</th>
                  <th className="py-2.5 px-3 text-right">Multiplied ({activeTier.multiplierLabel})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {filteredActivity.slice(0, 20).map((item) => {
                  const Icon =
                    item.category === 'deposit'
                      ? Wallet
                      : item.category === 'purchase'
                      ? item.title.toLowerCase().includes('vehicle')
                        ? Car
                        : ShoppingBag
                      : Users;
                  return (
                    <tr key={item.id} className="hover:bg-zinc-900/40 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate max-w-[260px] sm:max-w-xs">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-zinc-400 truncate max-w-[260px] sm:max-w-xs">
                              {item.subtitle}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 capitalize text-zinc-300">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                        {item.timestamp}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-zinc-200 tabular-nums whitespace-nowrap">
                        {formatCurrency(item.amountUsd)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-zinc-400 tabular-nums whitespace-nowrap">
                        +{item.basePoints.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 tabular-nums whitespace-nowrap">
                        +{item.totalPoints.toLocaleString()} pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Quick Reference Footer */}
        <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Bronze: $0+ (1.0x)
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-zinc-300" />
              Silver: $500+ (1.25x)
            </span>
            <span className="flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-yellow-300" />
              Gold: $5,000+ (1.5x)
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              Platinum: $25,000+ (2.0x)
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('investments')}
            className="text-zinc-300 hover:text-white font-semibold underline cursor-pointer"
          >
            View Staking &amp; ROI Multipliers
          </button>
        </div>
      </div>
    </div>
  );
};
