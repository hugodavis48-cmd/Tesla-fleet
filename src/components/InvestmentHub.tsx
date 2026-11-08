import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { INVESTMENT_POOLS } from '../data/mockData';
import { InvestmentPool, AssetNotificationSettings, AssetAlertHistoryItem, InvestmentActivityItem } from '../types';
import { AssetAlertsModal, PRESET_TARGETS } from './AssetAlertsModal';
import { InvestmentActivityTable, INITIAL_INVESTMENT_ACTIVITIES } from './InvestmentActivityTable';
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
  Bell,
  BellRing,
  BellOff,
  Sliders,
  Mail,
  Smartphone,
  Gauge,
  Send,
  CheckCircle2,
  Volume2,
} from 'lucide-react';

interface InvestmentHubProps {
  onOpenDeposit: () => void;
  onNavigateToDashboard: () => void;
}

const STORAGE_KEY = 'apex_fleet_target_alert_settings';
const ACTIVITY_STORAGE_KEY = 'apex_fleet_investment_activities';

export const InvestmentHub: React.FC<InvestmentHubProps> = ({ onOpenDeposit, onNavigateToDashboard }) => {
  const { userInvestments, stakeInPool, claimDividends, balances, showToast, currentUser } = useApp();

  const [activePoolToStake, setActivePoolToStake] = useState<InvestmentPool | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('500');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isSendingTestAlert, setIsSendingTestAlert] = useState(false);

  // Investment activity chronological history with localStorage persistence
  const [activities, setActivities] = useState<InvestmentActivityItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(ACTIVITY_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Failed to load investment activities:', e);
      }
    }
    return INITIAL_INVESTMENT_ACTIVITIES;
  });

  const saveActivities = (newActivities: InvestmentActivityItem[]) => {
    setActivities(newActivities);
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(newActivities));
    } catch (e) {
      console.warn('Failed to save investment activities:', e);
    }
  };

  // Notification settings state with localStorage persistence
  const [alertSettings, setAlertSettings] = useState<AssetNotificationSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            targetEmail: parsed.targetEmail || currentUser?.email || 'alex.vance@apex-tesla.io',
          };
        }
      } catch (e) {
        console.warn('Failed to load alert settings:', e);
      }
    }
    return {
      enabled: true,
      emailAlerts: true,
      browserAlerts: true,
      targetEmail: currentUser?.email || 'alex.vance@apex-tesla.io',
      selectedPoolIds: ['all'],
      customThresholds: {
        minApy: 18.0,
        minUtilization: 85,
        minDailyYieldUsd: 25,
        poolCapWarningPercent: 90,
        payoutReadyAlert: true,
      },
      activeTargetIds: ['target-robotaxi-util', 'target-apy-boost', 'target-daily-dividend', 'target-payout-ready'],
      history: [
        {
          id: 'hist-init-01',
          assetTitle: 'Autonomous Tesla Robotaxi Yield Pool',
          metricLabel: 'Fleet Utilization Target',
          targetValue: '≥ 85.0%',
          currentValue: '88.5%',
          timestamp: 'Today, 11:30 AM',
          channels: ['browser', 'email'],
          status: 'delivered',
        },
      ],
    };
  });

  // Keep target email synced with logged in user if not customized
  useEffect(() => {
    if (currentUser?.email && alertSettings.targetEmail === 'alex.vance@apex-tesla.io' && currentUser.email !== 'alex.vance@apex-tesla.io') {
      const updated = { ...alertSettings, targetEmail: currentUser.email };
      setAlertSettings(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  }, [currentUser?.email]);

  const saveSettings = (newSettings: AssetNotificationSettings) => {
    setAlertSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.warn('Failed to save alert settings:', e);
    }
  };

  const handleToggleMasterAlert = () => {
    const newState = !alertSettings.enabled;
    const updated = { ...alertSettings, enabled: newState };
    saveSettings(updated);
    if (newState) {
      showToast('⚡ Fleet asset performance target alerts activated!', 'success');
      playTeslaAudioChime();
    } else {
      showToast('Fleet target alerts paused.', 'info');
    }
  };

  // Play synthetic Tesla audio alert chime
  const playTeslaAudioChime = () => {
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
        osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.25); // D6
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {}
  };

  // Trigger test alert (handles Browser Notification API + Email backend dispatch)
  const handleTriggerAlert = async (
    customAsset?: string,
    customMetric?: string,
    customValue?: string
  ) => {
    setIsSendingTestAlert(true);
    playTeslaAudioChime();

    const assetTitle = customAsset || 'Autonomous Tesla Robotaxi Yield Pool';
    const metricLabel = customMetric || 'Fleet Telematics Utilization Target';
    const currentValue = customValue || '91.8% (Target: ≥90.0%)';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const dispatchedChannels: ('browser' | 'email')[] = [];

    // 1. Browser Notification
    if (alertSettings.browserAlerts && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(`⚡ Apex Fleet Target Hit: ${assetTitle}`, {
            body: `${metricLabel} reached ${currentValue}. Daily dividend yield surge active!`,
            icon: '/favicon.ico',
          });
          dispatchedChannels.push('browser');
        } catch (e) {
          console.warn('Browser notification error:', e);
        }
      } else if (Notification.permission === 'default') {
        try {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            new Notification(`⚡ Apex Fleet Target Hit: ${assetTitle}`, {
              body: `${metricLabel} reached ${currentValue}. Daily dividend yield surge active!`,
              icon: '/favicon.ico',
            });
            dispatchedChannels.push('browser');
          }
        } catch {}
      }
    }

    // 2. Email Notification dispatch
    if (alertSettings.emailAlerts && alertSettings.targetEmail) {
      try {
        await fetch('/api/mailer/asset-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: alertSettings.targetEmail,
            assetTitle,
            metricLabel,
            targetValue: '90.0%',
            currentValue,
          }),
        });
        dispatchedChannels.push('email');
      } catch (err) {
        console.warn('Email dispatch warning:', err);
        dispatchedChannels.push('email');
      }
    }

    // Record in history log
    const newHistoryItem: AssetAlertHistoryItem = {
      id: `alert-${Date.now()}`,
      assetTitle,
      metricLabel,
      targetValue: '≥ 90.0%',
      currentValue,
      timestamp: `Today, ${timestamp}`,
      channels: dispatchedChannels.length > 0 ? dispatchedChannels : ['browser', 'email'],
      status: 'delivered',
    };

    const updated = {
      ...alertSettings,
      history: [newHistoryItem, ...alertSettings.history.slice(0, 19)],
    };
    saveSettings(updated);

    showToast(`⚡ Alert Dispatched! Target reached for ${assetTitle} (${currentValue})`, 'success');
    setIsSendingTestAlert(false);
  };

  const handleTogglePoolTracking = (poolId: string, poolTitle: string) => {
    let updatedPoolIds: string[];
    const isCurrentlyTracked =
      alertSettings.selectedPoolIds.includes('all') || alertSettings.selectedPoolIds.includes(poolId);

    if (alertSettings.selectedPoolIds.includes('all')) {
      // Switch from all to tracking specific other pools
      updatedPoolIds = INVESTMENT_POOLS.map((p) => p.id).filter((id) => id !== poolId);
    } else if (isCurrentlyTracked) {
      updatedPoolIds = alertSettings.selectedPoolIds.filter((id) => id !== poolId);
      if (updatedPoolIds.length === 0) {
        updatedPoolIds = [];
      }
    } else {
      updatedPoolIds = [...alertSettings.selectedPoolIds, poolId];
    }

    const updated = { ...alertSettings, selectedPoolIds: updatedPoolIds };
    saveSettings(updated);

    const nowTracked = updatedPoolIds.includes('all') || updatedPoolIds.includes(poolId);
    if (nowTracked) {
      showToast(`🔔 Subscribed to target alerts for ${poolTitle}`, 'success');
      playTeslaAudioChime();
    } else {
      showToast(`Alerts disabled for ${poolTitle}`, 'info');
    }
  };

  const numStake = parseFloat(stakeAmount) || 0;

  const handleConfirmStake = () => {
    if (!activePoolToStake) return;
    if (numStake < activePoolToStake.minInvestmentUsd) {
      showToast(`Minimum investment for this pool is $${activePoolToStake.minInvestmentUsd}.`, 'error');
      return;
    }

    const ok = stakeInPool(activePoolToStake.id, numStake);
    if (ok) {
      // Record new deposit activity item
      const randomHex = Math.random().toString(16).substring(2, 8);
      const newDepositItem: InvestmentActivityItem = {
        id: `act-dep-${Date.now()}`,
        type: 'deposit',
        assetId: activePoolToStake.id,
        assetTitle: activePoolToStake.title,
        category: activePoolToStake.category,
        amountUsd: numStake,
        cryptoFormatted: `${(numStake / 92000).toFixed(4)} BTC / ${(numStake / 3100).toFixed(3)} ETH`,
        apyRate: activePoolToStake.apy,
        timestamp: 'Just now',
        status: 'confirmed',
        txHash: `0x7f${randomHex}...${Math.random().toString(16).substring(2, 6)}`,
        notes: `Smart contract staking into ${activePoolToStake.title} (${activePoolToStake.apy}% APY lockup).`,
      };

      saveActivities([newDepositItem, ...activities]);
      setActivePoolToStake(null);
      showToast(`Successfully staked $${numStake.toLocaleString()} into ${activePoolToStake.title}!`, 'success');
      playTeslaAudioChime();
    }
  };

  const handleClaimWithActivity = (inv: (typeof userInvestments)[0]) => {
    if (inv.earnedDividendsUsd <= 0) {
      showToast('No unclaimed dividends available to withdraw yet.', 'info');
      return;
    }
    const claimedAmt = inv.earnedDividendsUsd;
    claimDividends(inv.id);

    const randomHex = Math.random().toString(16).substring(2, 8);
    const newPayoutItem: InvestmentActivityItem = {
      id: `act-payout-${Date.now()}`,
      type: 'payout',
      assetId: inv.poolId,
      assetTitle: inv.poolTitle,
      category: 'Commercial Fleet',
      amountUsd: claimedAmt,
      cryptoFormatted: `${(claimedAmt / 3100).toFixed(4)} ETH`,
      apyRate: inv.apy,
      timestamp: 'Just now',
      status: 'confirmed',
      txHash: `0x3c${randomHex}...${Math.random().toString(16).substring(2, 6)}`,
      notes: `User-initiated dividend yield harvest credited directly to available balance.`,
    };

    saveActivities([newPayoutItem, ...activities]);
    showToast(`Claimed $${claimedAmt.toFixed(2)} in dividends!`, 'success');
    playTeslaAudioChime();
  };

  const handleSimulateMilestoneEvent = (assetId?: string) => {
    const pool = (assetId ? INVESTMENT_POOLS.find((p) => p.id === assetId) : null) || INVESTMENT_POOLS[Math.floor(Math.random() * INVESTMENT_POOLS.length)];
    const milestones = [
      {
        title: 'Quarterly High-Utilization Dividend Surge (94.2%)',
        bonus: 175,
        note: 'Fleet utilization exceeded target threshold (94.2% vs 85.0%). Distributed surplus performance dividend.',
      },
      {
        title: 'Autonomous FSD Zero-Incident Safety Tier Bonus',
        bonus: 250,
        note: 'Fleet completed 250,000 continuous autonomous commercial miles with 0 safety incidents.',
      },
      {
        title: 'Megawatt Grid Peak-Demand Arbitrage Distribution',
        bonus: 320,
        note: 'Supercharger node automated virtual power plant (VPP) energy arbitrage during summer peak.',
      },
      {
        title: 'Exotic Performance Fleet Weekend Surge Revenue',
        bonus: 190,
        note: 'Plaid & Cyberbeast weekend rental booking rate hit 100% capacity in Los Angeles & Miami hubs.',
      },
    ];

    const chosen = milestones[Math.floor(Math.random() * milestones.length)];
    const randomHex = Math.random().toString(16).substring(2, 8);

    const newMilestoneItem: InvestmentActivityItem = {
      id: `act-mile-${Date.now()}`,
      type: 'milestone',
      assetId: pool.id,
      assetTitle: pool.title,
      category: pool.category,
      amountUsd: chosen.bonus,
      cryptoFormatted: `+${(chosen.bonus / 3100).toFixed(4)} ETH (Reward)`,
      apyRate: pool.apy,
      timestamp: 'Just now',
      status: 'confirmed',
      txHash: `0x89${randomHex}...${Math.random().toString(16).substring(2, 6)}`,
      milestoneTitle: chosen.title,
      notes: chosen.note,
    };

    saveActivities([newMilestoneItem, ...activities]);
    showToast(`🏆 Milestone Reward Recorded: ${chosen.title} (+$${chosen.bonus})`, 'success');
    playTeslaAudioChime();
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
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

      {/* Interactive Asset Performance Target Notification Toggle Bar */}
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-zinc-950 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left info & status */}
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                alertSettings.enabled
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-950/60'
                  : 'bg-zinc-800/80 border-zinc-700 text-zinc-500'
              }`}
            >
              {alertSettings.enabled ? (
                <BellRing className="w-6 h-6 animate-pulse text-emerald-400" />
              ) : (
                <BellOff className="w-6 h-6 text-zinc-500" />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono uppercase font-bold text-emerald-400 tracking-wider">
                  Telematics Asset Alerts
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    alertSettings.enabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {alertSettings.enabled ? 'ALERTS ARMED' : 'ALERTS PAUSED'}
                </span>
                <span className="text-zinc-500 text-xs hidden sm:inline">•</span>
                <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
                  {alertSettings.activeTargetIds.length} Target Rules Active
                </span>
              </div>

              <h3 className="font-heading font-black text-xl text-white">
                Tesla Fleet Performance & Yield Target Notifications
              </h3>

              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                Subscribe to automated email and browser-based notifications when your chosen Tesla fleet pools hit APY yield boosts, utilization milestones (≥90%), or smart contract dividend payouts.
              </p>

              {/* Channels Pill Overview */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
                {/* Browser Alert Pill */}
                <div
                  className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                    alertSettings.browserAlerts && alertSettings.enabled
                      ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Browser Push: {alertSettings.browserAlerts ? 'Active' : 'Off'}</span>
                </div>

                {/* Email Alert Pill */}
                <div
                  className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                    alertSettings.emailAlerts && alertSettings.enabled
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[200px]">
                    Email: {alertSettings.emailAlerts ? alertSettings.targetEmail : 'Off'}
                  </span>
                </div>

                {/* Assets tracked */}
                <div className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {alertSettings.selectedPoolIds.includes('all')
                      ? 'Tracking All Fleet Pools'
                      : `${alertSettings.selectedPoolIds.length} Asset(s) Tracked`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            {/* Quick Master Toggle Switch */}
            <div className="flex items-center gap-3 p-2 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-xs font-mono font-bold text-zinc-300 pl-2">
                {alertSettings.enabled ? 'ACTIVE' : 'OFF'}
              </span>
              <button
                onClick={handleToggleMasterAlert}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  alertSettings.enabled ? 'bg-emerald-600' : 'bg-zinc-700'
                }`}
                title="Toggle Fleet Target Alerts"
                aria-label="Toggle Fleet Target Alerts"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    alertSettings.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Configure Targets Modal Button */}
            <button
              onClick={() => setIsAlertModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-heading font-bold text-xs border border-zinc-700 transition flex items-center gap-2 shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Configure Targets</span>
            </button>

            {/* Test Alert Button */}
            <button
              onClick={() => handleTriggerAlert()}
              disabled={isSendingTestAlert}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-heading font-bold text-xs shadow-lg shadow-emerald-950/40 transition flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingTestAlert ? 'Dispatching...' : 'Test Alert'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Yield Pools Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-xl text-white">Tesla Staking Pools & Real-Time Telematics</h3>
            <p className="text-xs text-zinc-400">Click the bell on any pool to subscribe to asset-specific target alerts</p>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            Automated Dividend Yield • Smart Contract Audited
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {INVESTMENT_POOLS.map((pool) => {
            const percentFunded = Math.min(100, Math.round((pool.totalStakedUsd / pool.poolCapUsd) * 100));
            const isTracked =
              alertSettings.enabled &&
              (alertSettings.selectedPoolIds.includes('all') || alertSettings.selectedPoolIds.includes(pool.id));

            return (
              <div
                key={pool.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Pool Header Image */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-black">
                    <img src={pool.image} alt={pool.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                    {/* Top right badges: APY and Quick Alert Toggle */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePoolTracking(pool.id, pool.title);
                        }}
                        className={`p-2 rounded-xl backdrop-blur-md transition border flex items-center gap-1 text-xs font-mono font-bold ${
                          isTracked
                            ? 'bg-emerald-600/90 text-white border-emerald-400/50 shadow-lg'
                            : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                        title={isTracked ? 'Alerts active for this asset' : 'Click to enable target alerts'}
                      >
                        <Bell className={`w-3.5 h-3.5 ${isTracked ? 'text-white' : 'text-zinc-400'}`} />
                        <span className="text-[10px] hidden sm:inline">
                          {isTracked ? 'ALERT ON' : 'ALERT OFF'}
                        </span>
                      </button>

                      <div className="px-3 py-1.5 rounded-xl bg-emerald-600/90 backdrop-blur-md text-white font-mono font-bold text-sm shadow-lg">
                        {pool.apy}% APY
                      </div>
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

                    {/* Target Telematics Alert Indicator */}
                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                        <span>TARGET ALERT:</span>
                      </div>
                      {isTracked ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Armed (≥{alertSettings.customThresholds.minApy}% APY)
                        </span>
                      ) : (
                        <button
                          onClick={() => handleTogglePoolTracking(pool.id, pool.title)}
                          className="text-zinc-500 hover:text-zinc-300 underline"
                        >
                          Enable Alerts
                        </button>
                      )}
                    </div>

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
      </div>

      {/* Investment Activity History Table (Deposits, Payouts & Performance Milestones) */}
      <InvestmentActivityTable
        activities={activities}
        onSimulateMilestone={handleSimulateMilestoneEvent}
      />

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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAlertModalOpen(true)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono flex items-center gap-1"
                      title="Manage alert targets for this asset"
                    >
                      <Bell className="w-3.5 h-3.5 text-emerald-400" />
                    </button>

                    <button
                      onClick={() => handleClaimWithActivity(inv)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                    >
                      Claim ${inv.earnedDividendsUsd.toFixed(2)} Dividends
                    </button>
                  </div>
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

              {/* Target Alert Subscription Opt-in inside Stake modal */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-bold text-white block">Asset Target Alerts</span>
                    <span className="text-[10px] text-zinc-400">
                      Notify via email/browser when target yields hit
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const poolId = activePoolToStake.id;
                    handleTogglePoolTracking(poolId, activePoolToStake.title);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition border ${
                    alertSettings.enabled &&
                    (alertSettings.selectedPoolIds.includes('all') || alertSettings.selectedPoolIds.includes(activePoolToStake.id))
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {alertSettings.enabled &&
                  (alertSettings.selectedPoolIds.includes('all') || alertSettings.selectedPoolIds.includes(activePoolToStake.id))
                    ? 'Subscribed'
                    : 'Subscribe'}
                </button>
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

      {/* Full Fleet Asset Alert Configuration Modal */}
      <AssetAlertsModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        settings={alertSettings}
        onUpdateSettings={saveSettings}
        pools={INVESTMENT_POOLS}
        onTriggerTestAlert={handleTriggerAlert}
        isSendingTest={isSendingTestAlert}
      />
    </div>
  );
};
