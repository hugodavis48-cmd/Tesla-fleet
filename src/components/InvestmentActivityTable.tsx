import React, { useState, useMemo } from 'react';
import {
  History,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Copy,
  Coins,
  DollarSign,
  Calendar,
  Download,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Zap,
} from 'lucide-react';
import { InvestmentActivityItem, InvestmentActivityType } from '../types';

interface InvestmentActivityTableProps {
  activities: InvestmentActivityItem[];
  onSimulateMilestone: () => void;
  onRefresh?: () => void;
}

export const INITIAL_INVESTMENT_ACTIVITIES: InvestmentActivityItem[] = [
  {
    id: 'act-001',
    type: 'milestone',
    assetId: 'pool-robotaxi',
    assetTitle: 'Autonomous Tesla Robotaxi Yield Pool',
    category: 'Autonomous Robotaxi Fleet',
    amountUsd: 75.0,
    cryptoFormatted: '+75.00 USDT',
    apyRate: 18.4,
    timestamp: '2026-11-08 13:45',
    status: 'confirmed',
    txHash: '0x71e9a24bb1890cf2e84ad17b28a9e',
    milestoneTitle: 'Fleet Utilization Target Reached (≥90%)',
    notes: 'Telematics verified 92.4% autonomous ride-hailing load across Austin & Miami hubs.',
  },
  {
    id: 'act-002',
    type: 'payout',
    assetId: 'pool-robotaxi',
    assetTitle: 'Autonomous Tesla Robotaxi Yield Pool',
    category: 'Autonomous Robotaxi Fleet',
    amountUsd: 38.5,
    cryptoFormatted: '+38.50 USDT',
    apyRate: 18.4,
    timestamp: '2026-11-08 10:15',
    status: 'settled',
    txHash: '0x48bc9281a0e34f19b26ce901aa48c',
    notes: 'Automated daily fare revenue split from active 24-vehicle commercial fleet.',
  },
  {
    id: 'act-003',
    type: 'deposit',
    assetId: 'pool-robotaxi',
    assetTitle: 'Autonomous Tesla Robotaxi Yield Pool',
    category: 'Autonomous Robotaxi Fleet',
    amountUsd: 2000.0,
    cryptoFormatted: '2,000.00 USDT',
    apyRate: 18.4,
    timestamp: '2026-11-07 22:00',
    status: 'confirmed',
    txHash: '0x91d382ef4190ba33c5e8812bf701d',
    notes: 'Staking principal allocation locked for 30 days with daily smart contract distribution.',
  },
  {
    id: 'act-004',
    type: 'payout',
    assetId: 'pool-supercharger',
    assetTitle: 'Apex Megawatt Supercharger Node Staking',
    category: 'Supercharger Mega-Node',
    amountUsd: 24.3,
    cryptoFormatted: '+24.30 USDT',
    apyRate: 14.8,
    timestamp: '2026-11-07 12:00',
    status: 'settled',
    txHash: '0x33aa71bf290ce8812bb33f901cc4e',
    notes: 'Fixed kilowatt-hour dispensing yield payout from Megawatt commercial nodes.',
  },
  {
    id: 'act-005',
    type: 'milestone',
    assetId: 'pool-plaid-fleet',
    assetTitle: 'Luxury Performance Rental Fleet Share',
    category: 'Plaid Track Rental Fleet',
    amountUsd: 125.0,
    cryptoFormatted: '+125.00 USDT',
    apyRate: 22.6,
    timestamp: '2026-11-06 18:30',
    status: 'confirmed',
    txHash: '0x55ee8811cf290ba33ce99120aa45b',
    milestoneTitle: 'Plaid Track Club 30-Day Staker Retention Bonus',
    notes: 'Unlocked Founders Club tier yield bonus for maintaining high-performance liquidity.',
  },
  {
    id: 'act-006',
    type: 'compound',
    assetId: 'pool-supercharger',
    assetTitle: 'Apex Megawatt Supercharger Node Staking',
    category: 'Supercharger Mega-Node',
    amountUsd: 31.2,
    cryptoFormatted: '+31.20 USD',
    apyRate: 14.8,
    timestamp: '2026-11-06 09:15',
    status: 'compounded',
    txHash: '0x22ff44cc901ba33e88aa1192bb77a',
    notes: 'Auto-compound protocol reinvested daily payout into Megawatt Node principal.',
  },
  {
    id: 'act-007',
    type: 'deposit',
    assetId: 'pool-supercharger',
    assetTitle: 'Apex Megawatt Supercharger Node Staking',
    category: 'Supercharger Mega-Node',
    amountUsd: 1500.0,
    cryptoFormatted: '1,500.00 USD',
    apyRate: 14.8,
    timestamp: '2026-11-05 14:00',
    status: 'confirmed',
    txHash: '0x11bb99ee33aa88cc77ff221199a4c',
    notes: 'Node staking subscription with automated 14-day cycle renewal.',
  },
  {
    id: 'act-008',
    type: 'deposit',
    assetId: 'pool-plaid-fleet',
    assetTitle: 'Luxury Performance Rental Fleet Share',
    category: 'Plaid Track Rental Fleet',
    amountUsd: 4000.0,
    cryptoFormatted: '4,000.00 USDT',
    apyRate: 22.6,
    timestamp: '2026-11-04 16:20',
    status: 'confirmed',
    txHash: '0x88cc33aa99ee11ff55dd77cc44aa1',
    notes: 'Staking allocation into Cybertruck Cyberbeast & Roadster Founders track pool.',
  },
  {
    id: 'act-009',
    type: 'milestone',
    assetId: 'pool-robotaxi',
    assetTitle: 'Autonomous Tesla Robotaxi Yield Pool',
    category: 'Autonomous Robotaxi Fleet',
    amountUsd: 50.0,
    cryptoFormatted: '+50.00 USDT',
    apyRate: 18.4,
    timestamp: '2026-11-04 11:00',
    status: 'confirmed',
    txHash: '0x99aa22dd44ee88cc11bb77ff33aa9',
    milestoneTitle: 'Early Pool Allocation Staking Milestone',
    notes: 'Welcome incentive granted for participating in Genesis Robotaxi liquidity round.',
  },
];

export const InvestmentActivityTable: React.FC<InvestmentActivityTableProps> = ({
  activities,
  onSimulateMilestone,
  onRefresh,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Compute summary stats
  const totalStaked = useMemo(() => {
    return activities
      .filter((a) => a.type === 'deposit')
      .reduce((sum, a) => sum + a.amountUsd, 0);
  }, [activities]);

  const totalPayouts = useMemo(() => {
    return activities
      .filter((a) => a.type === 'payout' || a.type === 'compound')
      .reduce((sum, a) => sum + a.amountUsd, 0);
  }, [activities]);

  const totalMilestones = useMemo(() => {
    return activities
      .filter((a) => a.type === 'milestone')
      .reduce((sum, a) => sum + a.amountUsd, 0);
  }, [activities]);

  // Filter and sort items
  const filteredActivities = useMemo(() => {
    let result = [...activities];

    if (filterType !== 'all') {
      result = result.filter((a) => a.type === filterType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.assetTitle.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          (a.milestoneTitle && a.milestoneTitle.toLowerCase().includes(q)) ||
          a.txHash.toLowerCase().includes(q) ||
          (a.notes && a.notes.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [activities, filterType, searchQuery, sortOrder]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Type', 'Asset', 'Category', 'Amount USD', 'APY %', 'Timestamp', 'Status', 'TxHash', 'Milestone/Notes'];
    const rows = filteredActivities.map((a) => [
      a.id,
      a.type,
      `"${a.assetTitle}"`,
      `"${a.category}"`,
      a.amountUsd,
      a.apyRate || 'N/A',
      a.timestamp,
      a.status,
      a.txHash,
      `"${a.milestoneTitle || a.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apex_fleet_investment_activity_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTypeBadge = (type: InvestmentActivityType, milestoneTitle?: string) => {
    switch (type) {
      case 'deposit':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold uppercase">
            <ArrowDownLeft className="w-3 h-3 text-cyan-400" />
            <span>Staking Deposit</span>
          </span>
        );
      case 'payout':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <span>Dividend Payout</span>
          </span>
        );
      case 'milestone':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Milestone Reward</span>
          </span>
        );
      case 'compound':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-950/60 text-violet-300 border border-violet-500/30 text-[10px] font-mono font-bold uppercase">
            <RefreshCw className="w-3 h-3 text-violet-400" />
            <span>Auto-Compounded</span>
          </span>
        );
    }
  };

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6 lg:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Stat KPIs */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <History className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-black text-xl sm:text-2xl text-white">
                INVESTMENT ACTIVITY & YIELD LEDGER
              </h3>
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Chronological on-chain telemetry ledger of principal staking deposits, automated daily smart contract dividend payouts, and performance target reward milestones.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onSimulateMilestone}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-heading font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              title="Trigger a simulated performance milestone reward and dividend distribution event"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Milestone Event</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-heading font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Download CSV export"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 block uppercase">Total Staked Principal</span>
            <div className="font-heading font-black text-lg sm:text-2xl text-white">
              ${totalStaked.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-cyan-400 font-semibold block">Across 3 Fleet Pools</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 block uppercase">Cumulative Yield Paid</span>
            <div className="font-heading font-black text-lg sm:text-2xl text-emerald-400">
              +${totalPayouts.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-zinc-400 block">Daily Smart Contracts</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 block uppercase">Milestone Rewards Earned</span>
            <div className="font-heading font-black text-lg sm:text-2xl text-amber-400">
              +${totalMilestones.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-amber-300 font-semibold block">Performance Target Bonuses</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 block uppercase">Settlement Protocol</span>
            <div className="font-heading font-bold text-sm sm:text-base text-zinc-200 truncate pt-1">
              Automated 24H
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Verified Telematics
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Activity', count: activities.length },
            { id: 'deposit', label: 'Staking Deposits', count: activities.filter((a) => a.type === 'deposit').length },
            { id: 'payout', label: 'Dividend Payouts', count: activities.filter((a) => a.type === 'payout').length },
            { id: 'milestone', label: 'Milestone Rewards', count: activities.filter((a) => a.type === 'milestone').length },
            { id: 'compound', label: 'Compounded', count: activities.filter((a) => a.type === 'compound').length },
          ].map((tab) => {
            const active = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/50'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    active ? 'bg-black/40 text-emerald-200' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input & Sort Order */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search asset, milestone, hash..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-mono flex items-center gap-1 shrink-0 cursor-pointer"
            title="Toggle sort order"
          >
            <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View (≥1024px) */}
      <div className="hidden lg:block rounded-2xl border border-zinc-800/90 bg-zinc-900/40 overflow-hidden shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 text-zinc-400 font-mono uppercase text-[10px] border-b border-zinc-800">
              <tr>
                <th className="p-3.5 pl-4">Timestamp</th>
                <th className="p-3.5">Activity Type</th>
                <th className="p-3.5">Target Fleet Asset / Milestone</th>
                <th className="p-3.5">APY Yield</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-4 text-right">Transaction Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-zinc-500 font-sans">
                    No investment activity records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((item) => {
                  const isPositive = item.type === 'payout' || item.type === 'milestone' || item.type === 'compound';

                  return (
                    <tr key={item.id} className="hover:bg-zinc-900/60 transition group">
                      {/* Timestamp */}
                      <td className="p-3.5 pl-4 text-zinc-400 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          <span>{item.timestamp}</span>
                        </div>
                      </td>

                      {/* Activity Type Badge */}
                      <td className="p-3.5 whitespace-nowrap">
                        {renderTypeBadge(item.type, item.milestoneTitle)}
                      </td>

                      {/* Fleet Asset / Milestone Details */}
                      <td className="p-3.5 font-sans">
                        <div className="max-w-xs">
                          <span className="font-heading font-bold text-white block truncate text-xs">
                            {item.assetTitle}
                          </span>
                          {item.milestoneTitle ? (
                            <span className="text-[10px] text-amber-300 font-mono block truncate font-semibold">
                              ★ {item.milestoneTitle}
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-400 block truncate">
                              {item.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* APY Yield */}
                      <td className="p-3.5 whitespace-nowrap">
                        {item.apyRate ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                            {item.apyRate}% APY
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="p-3.5 whitespace-nowrap font-bold">
                        <span
                          className={`text-xs ${
                            isPositive
                              ? 'text-emerald-400'
                              : 'text-cyan-300'
                          }`}
                        >
                          {isPositive ? '+' : ''}${item.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                        </span>
                        {item.cryptoFormatted && (
                          <span className="text-[10px] text-zinc-500 block font-normal">
                            {item.cryptoFormatted}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-300 uppercase">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{item.status}</span>
                        </span>
                      </td>

                      {/* Transaction Hash */}
                      <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleCopyHash(item.txHash)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer text-[10px]"
                          title="Click to copy transaction hash"
                        >
                          <span>{item.txHash.substring(0, 8)}...{item.txHash.substring(item.txHash.length - 4)}</span>
                          {copiedHash === item.txHash ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile & Tablet Card Layout (<1024px) */}
      <div className="lg:hidden space-y-3 font-sans">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs rounded-2xl bg-zinc-900/30 border border-zinc-800">
            No investment activity records found.
          </div>
        ) : (
          filteredActivities.map((item) => {
            const isPositive = item.type === 'payout' || item.type === 'milestone' || item.type === 'compound';

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2.5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {renderTypeBadge(item.type, item.milestoneTitle)}
                    <span className="font-heading font-bold text-white text-xs block mt-1.5">
                      {item.assetTitle}
                    </span>
                    {item.milestoneTitle && (
                      <span className="text-[11px] text-amber-300 font-mono block font-semibold">
                        ★ {item.milestoneTitle}
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-heading font-black text-sm block ${
                        isPositive ? 'text-emerald-400' : 'text-cyan-300'
                      }`}
                    >
                      {isPositive ? '+' : ''}${item.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono block">
                      {item.cryptoFormatted || 'USD Vault'}
                    </span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {item.notes}
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] font-mono border-t border-zinc-800 pt-2 text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-500" />
                    <span>{item.timestamp}</span>
                  </span>

                  <button
                    onClick={() => handleCopyHash(item.txHash)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 hover:text-white"
                  >
                    <span>{item.txHash.substring(0, 6)}...</span>
                    {copiedHash === item.txHash ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-zinc-500" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
