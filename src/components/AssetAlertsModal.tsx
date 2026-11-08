import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  Mail,
  Smartphone,
  Sliders,
  Send,
  Activity,
  Gauge,
  TrendingUp,
  Check,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Volume2,
  Zap,
  Coins,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { InvestmentPool, AssetNotificationSettings, AssetAlertHistoryItem } from '../types';

interface AssetAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AssetNotificationSettings;
  onUpdateSettings: (settings: AssetNotificationSettings) => void;
  pools: InvestmentPool[];
  onTriggerTestAlert: (assetName?: string, metric?: string, value?: string) => Promise<void>;
  isSendingTest: boolean;
}

export const PRESET_TARGETS = [
  {
    id: 'target-robotaxi-util',
    poolId: 'pool-robotaxi',
    poolTitle: 'Autonomous Tesla Robotaxi Yield Pool',
    metric: 'fleet_utilization' as const,
    label: 'Robotaxi Fleet Utilization Surges ≥ 90%',
    description: 'Alert when commercial autonomous ride-hailing demand drives fleet utilization above 90%',
    targetValue: 90,
    unit: '%' as const,
    currentValue: 88.5,
  },
  {
    id: 'target-apy-boost',
    poolId: 'all',
    poolTitle: 'All Tracked Fleet Assets',
    metric: 'apy_threshold' as const,
    label: 'Any Pool APY Yield Exceeds 20.0%',
    description: 'Immediate notification when seasonal demand surges boost any fleet pool dividend rate past 20% APY',
    targetValue: 20.0,
    unit: '%' as const,
    currentValue: 18.4,
  },
  {
    id: 'target-daily-dividend',
    poolId: 'all',
    poolTitle: 'Portfolio Daily Earnings',
    metric: 'daily_dividend' as const,
    label: 'Daily Estimated Dividends Hit ≥ $25.00/day',
    description: 'Receive alert when your active staked principal generates at least $25.00 in daily payouts',
    targetValue: 25.0,
    unit: '$' as const,
    currentValue: 16.4,
  },
  {
    id: 'target-supercharger-cap',
    poolId: 'pool-supercharger',
    poolTitle: 'Apex Megawatt Supercharger Node Staking',
    metric: 'pool_capacity' as const,
    label: 'Supercharger Node Pool Reaches 90% Staked Cap',
    description: 'Warning before the $5.0M Megawatt Supercharger node funding cap closes to new depositors',
    targetValue: 90,
    unit: '%' as const,
    currentValue: 48.2,
  },
  {
    id: 'target-payout-ready',
    poolId: 'all',
    poolTitle: 'Smart Contract Telematics Dividend Claim',
    metric: 'payout_ready' as const,
    label: 'Automated Daily Dividend Claim Ready',
    description: 'Push notification as soon as automated smart contract dividend earnings settle into your vault',
    targetValue: 1,
    unit: 'hours' as const,
    currentValue: 0,
  },
];

export const AssetAlertsModal: React.FC<AssetAlertsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  pools,
  onTriggerTestAlert,
  isSendingTest,
}) => {
  const [localSettings, setLocalSettings] = useState<AssetNotificationSettings>(settings);
  const [activeTab, setActiveTab] = useState<'channels' | 'targets' | 'history'>('channels');
  const [browserPermission, setBrowserPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setBrowserPermission(result);
        if (result === 'granted') {
          const updated = { ...localSettings, browserAlerts: true };
          setLocalSettings(updated);
          onUpdateSettings(updated);
        }
      } catch (err) {
        console.warn('Failed to request notification permission:', err);
      }
    }
  };

  const handleToggleMaster = () => {
    const updated = { ...localSettings, enabled: !localSettings.enabled };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const handleToggleChannel = (channel: 'email' | 'browser') => {
    let updated: AssetNotificationSettings;
    if (channel === 'email') {
      updated = { ...localSettings, emailAlerts: !localSettings.emailAlerts };
    } else {
      if (!localSettings.browserAlerts && browserPermission === 'default') {
        handleRequestBrowserPermission();
      }
      updated = { ...localSettings, browserAlerts: !localSettings.browserAlerts };
    }
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const handleToggleTarget = (targetId: string) => {
    const current = new Set(localSettings.activeTargetIds);
    if (current.has(targetId)) {
      current.delete(targetId);
    } else {
      current.add(targetId);
    }
    const updated = { ...localSettings, activeTargetIds: Array.from(current) };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const handleTogglePoolSelection = (poolId: string) => {
    let updatedPools: string[];
    if (poolId === 'all') {
      updatedPools = ['all'];
    } else {
      const filtered = localSettings.selectedPoolIds.filter((id) => id !== 'all');
      if (filtered.includes(poolId)) {
        updatedPools = filtered.filter((id) => id !== poolId);
        if (updatedPools.length === 0) updatedPools = ['all'];
      } else {
        updatedPools = [...filtered, poolId];
      }
    }
    const updated = { ...localSettings, selectedPoolIds: updatedPools };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const handleSendTest = async () => {
    setTestSuccessMessage(null);
    await onTriggerTestAlert(
      'Autonomous Tesla Robotaxi Yield Pool',
      'Fleet Utilization Rate',
      '92.4% (Target: ≥90.0%)'
    );
    setTestSuccessMessage('⚡ Alert triggered! Dispatched to your enabled channels.');
    setTimeout(() => setTestSuccessMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
                  Telematics Intelligence
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    localSettings.enabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {localSettings.enabled ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <h3 className="font-heading font-black text-lg sm:text-xl text-white">
                FLEET TARGET & YIELD NOTIFICATIONS
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Master Toggle */}
            <button
              onClick={handleToggleMaster}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 border ${
                localSettings.enabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40 shadow-lg shadow-emerald-950/50'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              {localSettings.enabled ? (
                <>
                  <Bell className="w-3.5 h-3.5 text-emerald-200" />
                  <span>ALERTS ON</span>
                </>
              ) : (
                <>
                  <BellOff className="w-3.5 h-3.5 text-zinc-400" />
                  <span>ALERTS OFF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/60 px-5 sm:px-6">
          <button
            onClick={() => setActiveTab('channels')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'channels'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Alert Channels & Assets</span>
          </button>
          <button
            onClick={() => setActiveTab('targets')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'targets'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Performance Targets</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-mono border border-emerald-800">
              {localSettings.activeTargetIds.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Trigger Log ({localSettings.history.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {testSuccessMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{testSuccessMessage}</span>
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="space-y-6">
              {/* Notification Channels Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1. Select Notification Channels</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Browser Push Alerts Card */}
                  <div
                    className={`p-4 rounded-2xl border transition ${
                      localSettings.browserAlerts
                        ? 'bg-zinc-900/90 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                        : 'bg-zinc-900/40 border-zinc-800 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-heading font-bold text-sm text-white block">
                            Browser Push Alerts
                          </span>
                          <span className="text-[11px] text-zinc-400 block">
                            Instant desktop & mobile popups
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleChannel('browser')}
                        className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                          localSettings.browserAlerts ? 'bg-emerald-600' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            localSettings.browserAlerts ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500 font-mono">SYSTEM PERMISSION:</span>
                      {browserPermission === 'granted' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Granted
                        </span>
                      ) : browserPermission === 'denied' ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-mono font-bold">
                          Blocked in Browser
                        </span>
                      ) : (
                        <button
                          onClick={handleRequestBrowserPermission}
                          className="px-2 py-0.5 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-700 font-mono font-bold underline"
                        >
                          Click to Allow
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Email Notifications Card */}
                  <div
                    className={`p-4 rounded-2xl border transition ${
                      localSettings.emailAlerts
                        ? 'bg-zinc-900/90 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                        : 'bg-zinc-900/40 border-zinc-800 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-heading font-bold text-sm text-white block">
                            Email Alert Dispatch
                          </span>
                          <span className="text-[11px] text-zinc-400 block">
                            Telematics milestone digests
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleChannel('email')}
                        className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                          localSettings.emailAlerts ? 'bg-emerald-600' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            localSettings.emailAlerts ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-800">
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          value={localSettings.targetEmail}
                          onChange={(e) => {
                            const updated = { ...localSettings, targetEmail: e.target.value };
                            setLocalSettings(updated);
                            onUpdateSettings(updated);
                          }}
                          placeholder="your-email@tesla-fleet.io"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chosen Tesla Fleet Assets to Monitor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>2. Chosen Tesla Fleet Assets</span>
                  </h4>
                  <span className="text-[11px] text-zinc-500">
                    {localSettings.selectedPoolIds.includes('all')
                      ? 'Tracking all active fleet pools'
                      : `${localSettings.selectedPoolIds.length} custom asset(s) selected`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option: All Assets */}
                  <div
                    onClick={() => handleTogglePoolSelection('all')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      localSettings.selectedPoolIds.includes('all')
                        ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        ⚡
                      </div>
                      <div>
                        <span className="font-heading font-bold text-xs block">All Fleet Assets & Pools</span>
                        <span className="text-[10px] text-zinc-400 block font-mono">
                          Robotaxis, Superchargers & Plaid rentals
                        </span>
                      </div>
                    </div>
                    {localSettings.selectedPoolIds.includes('all') && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>

                  {/* Individual Pools */}
                  {pools.map((pool) => {
                    const isSelected =
                      localSettings.selectedPoolIds.includes('all') ||
                      localSettings.selectedPoolIds.includes(pool.id);

                    return (
                      <div
                        key={pool.id}
                        onClick={() => handleTogglePoolSelection(pool.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                          isSelected && !localSettings.selectedPoolIds.includes('all')
                            ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md'
                            : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <img
                            src={pool.image}
                            alt={pool.title}
                            className="w-7 h-7 rounded-lg object-cover border border-zinc-700 shrink-0"
                          />
                          <div className="truncate">
                            <span className="font-heading font-bold text-xs block truncate text-white">
                              {pool.title}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono block">
                              {pool.apy}% APY • {pool.category}
                            </span>
                          </div>
                        </div>

                        {isSelected && !localSettings.selectedPoolIds.includes('all') && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instant Verification Trigger */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-white block">Test Alert Delivery</span>
                    <span className="text-zinc-400">
                      Dispatches a sample telematics performance milestone to your enabled channels now
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSendTest}
                  disabled={isSendingTest}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-heading font-bold text-xs shadow-md transition flex items-center justify-center gap-2 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingTest ? 'Sending...' : 'Fire Test Alert'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'targets' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Specific Performance Target Triggers</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Toggle which automated milestones will notify your phone or inbox
                  </p>
                </div>
                <button
                  onClick={() => {
                    const allIds = PRESET_TARGETS.map((t) => t.id);
                    const updated = { ...localSettings, activeTargetIds: allIds };
                    setLocalSettings(updated);
                    onUpdateSettings(updated);
                  }}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono underline"
                >
                  Enable All Targets
                </button>
              </div>

              {/* Target items list */}
              <div className="space-y-3">
                {PRESET_TARGETS.map((target) => {
                  const isActive = localSettings.activeTargetIds.includes(target.id);

                  return (
                    <div
                      key={target.id}
                      className={`p-4 rounded-2xl border transition ${
                        isActive
                          ? 'bg-zinc-900/90 border-emerald-500/40 shadow-sm'
                          : 'bg-zinc-900/30 border-zinc-800/80 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-bold text-sm text-white">
                              {target.label}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-mono">
                              Target: {target.unit === '$' ? `$${target.targetValue}` : `${target.targetValue}${target.unit}`}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {target.description}
                          </p>
                          <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-500 font-mono">
                            <span>Asset: <strong className="text-zinc-300">{target.poolTitle}</strong></span>
                            <span>•</span>
                            <span>Current Metric: <strong className="text-emerald-400">{target.unit === '$' ? `$${target.currentValue}` : `${target.currentValue}${target.unit}`}</strong></span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleTarget(target.id)}
                          className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                            isActive ? 'bg-emerald-600' : 'bg-zinc-700'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Threshold Sliders */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                <h5 className="font-heading font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Custom Threshold Fine-Tuning</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* APY Threshold */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Minimum APY Alert:</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        ≥ {localSettings.customThresholds.minApy}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={28}
                      step={0.5}
                      value={localSettings.customThresholds.minApy}
                      onChange={(e) => {
                        const updated = {
                          ...localSettings,
                          customThresholds: {
                            ...localSettings.customThresholds,
                            minApy: parseFloat(e.target.value),
                          },
                        };
                        setLocalSettings(updated);
                        onUpdateSettings(updated);
                      }}
                      className="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Fleet Utilization Threshold */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Fleet Utilization Alert:</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        ≥ {localSettings.customThresholds.minUtilization}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={70}
                      max={98}
                      step={1}
                      value={localSettings.customThresholds.minUtilization}
                      onChange={(e) => {
                        const updated = {
                          ...localSettings,
                          customThresholds: {
                            ...localSettings.customThresholds,
                            minUtilization: parseInt(e.target.value, 10),
                          },
                        };
                        setLocalSettings(updated);
                        onUpdateSettings(updated);
                      }}
                      className="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                    Recent Target Dispatches
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Audit log of fleet telematics targets hit and notifications sent
                  </p>
                </div>
                {localSettings.history.length > 0 && (
                  <button
                    onClick={() => {
                      const updated = { ...localSettings, history: [] };
                      setLocalSettings(updated);
                      onUpdateSettings(updated);
                    }}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 font-mono underline"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {localSettings.history.length === 0 ? (
                <div className="text-center py-10 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                  <Activity className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-zinc-400 text-xs">No alerts have been dispatched yet.</p>
                  <p className="text-[11px] text-zinc-500">
                    Click "Fire Test Alert" in Channels to test immediate delivery!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {localSettings.history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-white">
                            {item.assetTitle}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono border border-emerald-800">
                            {item.metricLabel}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          Value: <strong className="text-emerald-400">{item.currentValue}</strong> (Target: {item.targetValue})
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <div className="flex items-center justify-end gap-1.5 text-[10px] text-zinc-400 font-mono">
                          {item.channels.includes('browser') && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                              Browser
                            </span>
                          )}
                          {item.channels.includes('email') && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                              Email
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono block">
                          {item.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Preferences automatically saved to your Apex session</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendTest}
              disabled={isSendingTest}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold font-mono transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Simulate Trigger</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold text-xs shadow-md shadow-emerald-950/40 transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
