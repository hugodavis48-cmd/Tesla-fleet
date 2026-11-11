import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FeaturedStockPlan } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  DollarSign,
  ShieldCheck,
  Clock,
  ArrowRight,
  Flame,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Coins,
  ChevronRight,
  BarChart3,
  Percent,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
} from 'lucide-react';

interface TeslaStockHubProps {
  onOpenDeposit: () => void;
  onNavigateToDashboard?: () => void;
}

export const TeslaStockHub: React.FC<TeslaStockHubProps> = ({ onOpenDeposit, onNavigateToDashboard }) => {
  const {
    tslaQuote,
    featuredStockPlans,
    userSpotHolding,
    buySpotStock,
    sellSpotStock,
    investInFeaturedStock,
    balances,
    showToast,
    featureToggles,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'featured' | 'spot'>('featured');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>('1D');
  const [spotAmountUsd, setSpotAmountUsd] = useState<string>('500');
  const [selectedPlanForInvest, setSelectedPlanForInvest] = useState<FeaturedStockPlan | null>(null);
  const [planAmountUsd, setPlanAmountUsd] = useState<string>('500');
  const [isSellModalOpen, setIsSellModalOpen] = useState<boolean>(false);
  const [sharesToSell, setSharesToSell] = useState<string>('1');

  const currentPrice = tslaQuote.price;
  const isPositive = tslaQuote.changeUsd >= 0;
  const numSpot = parseFloat(spotAmountUsd) || 0;
  const estimatedShares = numSpot > 0 ? (numSpot / currentPrice).toFixed(4) : '0.0000';

  const handleSpotBuySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numSpot < 500) {
      showToast('Minimum Tesla stock investment is strictly $500.00 USD and above.', 'error');
      return;
    }
    if (balances.usd < numSpot) {
      showToast(`Insufficient vault balance ($${balances.usd.toFixed(2)}). Please deposit funds to buy TSLA stock.`, 'error');
      onOpenDeposit();
      return;
    }
    buySpotStock(numSpot);
  };

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numSell = parseFloat(sharesToSell) || 0;
    if (numSell <= 0 || numSell > userSpotHolding.shares) {
      showToast(`Invalid shares amount. You currently hold ${userSpotHolding.shares.toFixed(4)} shares.`, 'error');
      return;
    }
    if (sellSpotStock(numSell)) {
      setIsSellModalOpen(false);
    }
  };

  const handleFeaturedInvestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForInvest) return;
    const numPlan = parseFloat(planAmountUsd) || 0;
    const minRequired = Math.max(500, selectedPlanForInvest.minInvestmentUsd);
    if (numPlan < minRequired) {
      showToast(`Minimum investment for ${selectedPlanForInvest.title} is $${minRequired.toLocaleString()} USD ($500+ required).`, 'error');
      return;
    }
    if (balances.usd < numPlan) {
      showToast(`Insufficient vault balance ($${balances.usd.toFixed(2)}). Please deposit funds to stake.`, 'error');
      onOpenDeposit();
      return;
    }
    if (investInFeaturedStock(selectedPlanForInvest.id, numPlan)) {
      setSelectedPlanForInvest(null);
    }
  };

  // Generate SVG coordinates for mini price chart
  const historyData = tslaQuote.history || [];
  const prices = historyData.map((h) => h.price);
  const minP = Math.min(...prices, tslaQuote.low24h);
  const maxP = Math.max(...prices, tslaQuote.high24h);
  const rangeP = maxP - minP || 1;

  const pointsSvg = historyData
    .map((h, i) => {
      const x = (i / Math.max(1, historyData.length - 1)) * 600;
      const y = 140 - ((h.price - minP) / rangeP) * 110;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-zinc-800 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Official Live Telemetry</span>
            </span>
            <span className="text-xs text-zinc-400 font-mono">NASDAQ: TSLA</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Market Connected" />
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight flex items-center gap-3">
            <span>TESLA LIVE STOCKS</span>
            <span className="text-red-500 font-light">&</span>
            <span className="text-zinc-300">ROI PROTOCOL</span>
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl">
            Direct spot buying and accelerated high-yield institutional contracts. Minimum investment strictly $500 and above with automated daily distributions.
          </p>
        </div>

        {/* Live Stock Metric Bar */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 p-4 sm:p-5 rounded-2xl flex flex-wrap items-center gap-6 shadow-xl">
          <div>
            <span className="text-[11px] text-zinc-400 uppercase font-semibold block">TSLA Live Quote</span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono font-black text-2xl sm:text-3xl text-white">
                ${currentPrice.toFixed(2)}
              </span>
              <span
                className={`flex items-center text-xs font-mono font-bold ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {isPositive ? `+${tslaQuote.changeUsd}` : tslaQuote.changeUsd} ({isPositive ? `+${tslaQuote.changePercent}` : tslaQuote.changePercent}%)
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-10 w-px bg-zinc-800" />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
            <div>
              <span className="text-zinc-400 text-[10px] block">Day High:</span>
              <span className="font-mono text-zinc-200">${tslaQuote.high24h.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-zinc-400 text-[10px] block">Day Low:</span>
              <span className="font-mono text-zinc-200">${tslaQuote.low24h.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-zinc-400 text-[10px] block">24h Vol:</span>
              <span className="font-mono text-zinc-200">{tslaQuote.volume}</span>
            </div>
            <div>
              <span className="text-zinc-400 text-[10px] block">Market Cap:</span>
              <span className="font-mono text-zinc-200">{tslaQuote.marketCap}</span>
            </div>
            <div>
              <span className="text-zinc-400 text-[10px] block">P/E Ratio:</span>
              <span className="font-mono text-zinc-200">{tslaQuote.peRatio}x</span>
            </div>
            <div>
              <span className="text-zinc-400 text-[10px] block">52W Range:</span>
              <span className="font-mono text-zinc-200">${tslaQuote.week52Low} - ${tslaQuote.week52High}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Stock Candlestick / Area Chart */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-red-500">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-white">NASDAQ: TSLA Telemetry Graph</h3>
              <p className="text-xs text-zinc-400">Live order matching & institutional volume indicators</p>
            </div>
          </div>

          <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-semibold">
            {(['1D', '1W', '1M', '1Y', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1 rounded-lg transition ${
                  selectedTimeframe === tf
                    ? 'bg-red-600 text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative w-full h-44 sm:h-52 bg-zinc-900/40 rounded-2xl border border-zinc-850 p-2 overflow-hidden">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="tslaGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e82127" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#e82127" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1="35" x2="600" y2="35" stroke="#27272a" strokeDasharray="3 3" />
            <line x1="0" y1="75" x2="600" y2="75" stroke="#27272a" strokeDasharray="3 3" />
            <line x1="0" y1="115" x2="600" y2="115" stroke="#27272a" strokeDasharray="3 3" />

            {/* Area fill */}
            <polygon
              points={`0,150 ${pointsSvg} 600,150`}
              fill="url(#tslaGlow)"
            />

            {/* Primary trend line */}
            <polyline
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsSvg}
            />
          </svg>

          {/* Current quote floating badge */}
          <div className="absolute top-4 right-4 bg-zinc-950/90 border border-red-500/40 px-3 py-1.5 rounded-xl text-right backdrop-blur">
            <span className="text-[10px] text-zinc-400 uppercase block">Last Trade</span>
            <span className="font-mono font-bold text-sm text-white">${currentPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* User's Current Spot Holdings & Fast-ROI Summary Card */}
      <div className="bg-gradient-to-r from-red-950/30 via-zinc-900 to-zinc-950 border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <span className="text-xs text-red-400 font-bold uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span>Your Tesla Stock Portfolio</span>
          </span>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
            {userSpotHolding.shares > 0
              ? `${userSpotHolding.shares.toFixed(3)} TSLA Shares Owned`
              : 'No Spot TSLA Holdings Yet'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300">
            Equity Value: <strong className="text-emerald-400 font-mono text-base">${userSpotHolding.currentEquityUsd.toLocaleString()} USD</strong> • Total Invested: <span className="font-mono">${userSpotHolding.totalInvestedUsd.toLocaleString()} USD</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-center">
            <span className="text-[10px] text-zinc-400 block uppercase">Unrealized P&L</span>
            <span className={`font-mono font-bold text-sm ${userSpotHolding.pnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {userSpotHolding.pnlUsd >= 0 ? `+$${userSpotHolding.pnlUsd.toFixed(2)}` : `-$${Math.abs(userSpotHolding.pnlUsd).toFixed(2)}`} ({userSpotHolding.pnlPercent}%)
            </span>
          </div>

          {userSpotHolding.shares > 0 && (
            <button
              onClick={() => {
                setSharesToSell(userSpotHolding.shares.toString());
                setIsSellModalOpen(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>Liquidate / Sell Shares</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('spot')}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-red-900/30 flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Spot Buy (Min $500)</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('featured')}
          className={`pb-2 px-4 text-sm font-heading font-black tracking-wide uppercase transition border-b-2 flex items-center gap-2 ${
            activeTab === 'featured'
              ? 'border-red-500 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Flame className="w-4 h-4 text-red-500" />
          <span>Featured Stocks Buy For Faster ROI</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-600/30 text-red-300 font-mono">
            High APY
          </span>
        </button>

        <button
          onClick={() => setActiveTab('spot')}
          className={`pb-2 px-4 text-sm font-heading font-black tracking-wide uppercase transition border-b-2 flex items-center gap-2 ${
            activeTab === 'spot'
              ? 'border-red-500 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Spot Buy Investment ($TSLA Direct)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-600/30 text-cyan-300 font-mono">
            Min $500
          </span>
        </button>
      </div>

      {/* TAB 1: FEATURED STOCKS BUY FOR FASTER ROI */}
      {activeTab === 'featured' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-850">
            <div>
              <h3 className="font-heading font-black text-xl text-white">Accelerated Institutional Tesla Contracts</h3>
              <p className="text-xs text-zinc-400">Short-cycle high-velocity yield plans with daily compounding and automated 60-second cron payouts.</p>
            </div>
            <div className="text-xs font-mono text-zinc-300 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
              Min Investment: <strong className="text-yellow-400">$500.00 USD Above</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredStockPlans.filter((p) => p.isActive).map((plan) => (
              <div
                key={plan.id}
                className="rounded-3xl border border-zinc-800 hover:border-red-500/60 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-zinc-950 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-red-950/20 group relative overflow-hidden"
              >
                {/* Badge header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider">
                    {plan.badge}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-zinc-400">{plan.ticker}</span>
                </div>

                <div className="space-y-3 mb-6">
                  <h4 className="font-heading font-black text-lg text-white group-hover:text-red-400 transition">
                    {plan.title}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                    {plan.description}
                  </p>

                  {/* APY & Duration Metrics */}
                  <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800/80 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-zinc-400">Target APY:</span>
                      <span className="font-heading font-black text-2xl text-emerald-400">
                        {plan.apy}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs border-t border-zinc-850 pt-2">
                      <span className="text-zinc-400">Lock Cycle:</span>
                      <span className="font-mono font-bold text-white flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{plan.durationDays} Days</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Min Investment:</span>
                      <span className="font-mono font-bold text-yellow-400">
                        ${plan.minInvestmentUsd.toLocaleString()} USD
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Risk Profile:</span>
                      <span className="text-red-400 font-semibold">{plan.riskLevel}</span>
                    </div>
                  </div>
                </div>

                {/* Investment CTA */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlanForInvest(plan);
                    setPlanAmountUsd(plan.minInvestmentUsd.toString());
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 transition group-hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Invest For Fast ROI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SPOT BUY INVESTMENT ($TSLA DIRECT) */}
      {activeTab === 'spot' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Spot Purchase Calculator */}
          <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-zinc-850 pb-4">
              <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-xl text-white">Tesla ($TSLA) Spot Market Buy</h3>
                <p className="text-xs text-zinc-400">Direct equity ownership at live market quote • Instant execution</p>
              </div>
            </div>

            <form onSubmit={handleSpotBuySubmit} className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-zinc-300 uppercase tracking-wider">
                    Investment Amount (USD)
                  </label>
                  <span className="text-zinc-400">
                    Vault Balance: <strong className="text-emerald-400 font-mono">${balances.usd.toFixed(2)}</strong>
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                  <input
                    type="number"
                    min="500"
                    step="50"
                    value={spotAmountUsd}
                    onChange={(e) => setSpotAmountUsd(e.target.value)}
                    placeholder="Minimum 500"
                    className="w-full pl-8 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono font-bold text-lg focus:outline-none focus:border-red-500 transition"
                    required
                  />
                </div>

                <p className="text-[11px] text-yellow-400 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Strict Requirement: Minimum spot investment is $500.00 USD and above.</span>
                </p>
              </div>

              {/* Quick Presets ($500 minimum, $1000, $2500, $5000, $10000) */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-zinc-400 block font-semibold uppercase">Quick Investment Presets</span>
                <div className="grid grid-cols-5 gap-2">
                  {[500, 1000, 2500, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSpotAmountUsd(amt.toString())}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border transition ${
                        numSpot === amt
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      ${amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculated Shares Preview Box */}
              <div className="bg-zinc-900/70 rounded-2xl p-4 border border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Current Live Price:</span>
                  <span className="font-mono text-white">${currentPrice.toFixed(2)} USD / Share</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Estimated TSLA Shares:</span>
                  <span className="font-mono text-cyan-400 font-bold text-sm">~{estimatedShares} TSLA</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Platform Execution Fee:</span>
                  <span className="font-mono text-emerald-400 font-bold">0.00% Zero Fee</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={numSpot < 500}
                className={`w-full py-3.5 rounded-xl font-heading font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xl ${
                  numSpot >= 500
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white shadow-red-900/40'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Execute Spot Buy (${numSpot.toLocaleString()} USD)</span>
              </button>
            </form>
          </div>

          {/* Right Column: Live Order Execution Feed */}
          <div className="lg:col-span-5 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
                  Live Market Executions
                </h4>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">Real-time Stream</span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              {[
                { type: 'BUY', shares: '18.420', price: 328.50, time: '16:04:12', user: '0x9E21...F3eA' },
                { type: 'BUY', shares: '45.000', price: 328.45, time: '16:03:55', user: '0x3fe9...84ad' },
                { type: 'FAST_ROI', shares: '62.500', price: 328.40, time: '16:02:41', user: '0x99e2...34c7' },
                { type: 'BUY', shares: '8.250', price: 328.35, time: '16:01:29', user: '0x712a...1e90' },
                { type: 'BUY', shares: '120.000', price: 328.45, time: '15:59:10', user: '0x882b...3919' },
                { type: 'FAST_ROI', shares: '30.000', price: 328.40, time: '15:58:34', user: '0x3cb1...8291' },
              ].map((trade, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        trade.type === 'FAST_ROI'
                          ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {trade.type}
                    </span>
                    <span className="text-white font-bold">{trade.shares} TSLA</span>
                  </div>

                  <div className="text-right">
                    <span className="text-zinc-200 block">${trade.price.toFixed(2)}</span>
                    <span className="text-[10px] text-zinc-400 block">{trade.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INVEST IN FEATURED FAST-ROI PLAN */}
      {selectedPlanForInvest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-red-500/40 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-xl text-white">{selectedPlanForInvest.title}</h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    {selectedPlanForInvest.ticker} • {selectedPlanForInvest.apy}% APY • {selectedPlanForInvest.durationDays} Days
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlanForInvest(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFeaturedInvestSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-zinc-300 uppercase tracking-wider">
                    Investment Amount (USD)
                  </label>
                  <span className="text-zinc-400">
                    Min Required: <strong className="text-yellow-400">${Math.max(500, selectedPlanForInvest.minInvestmentUsd).toLocaleString()}</strong>
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                  <input
                    type="number"
                    min={Math.max(500, selectedPlanForInvest.minInvestmentUsd)}
                    value={planAmountUsd}
                    onChange={(e) => setPlanAmountUsd(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:border-red-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Fast ROI Projected Returns */}
              {(() => {
                const amt = parseFloat(planAmountUsd) || 0;
                const dailyRate = (amt * (selectedPlanForInvest.apy / 100)) / 365;
                const totalRoi = dailyRate * selectedPlanForInvest.durationDays;
                return (
                  <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Daily Automated ROI:</span>
                      <span className="text-emerald-400 font-bold">+${dailyRate.toFixed(2)} USD / Day</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Total Expected Accrued ROI:</span>
                      <span className="text-emerald-400 font-bold">+${totalRoi.toFixed(2)} USD</span>
                    </div>
                    <div className="flex items-center justify-between text-white font-bold border-t border-zinc-800 pt-2">
                      <span>Total Payout at Maturity ({selectedPlanForInvest.durationDays}d):</span>
                      <span className="text-cyan-400 text-sm">${(amt + totalRoi).toFixed(2)} USD</span>
                    </div>
                  </div>
                );
              })()}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-heading font-black text-xs uppercase tracking-wider transition shadow-lg shadow-red-900/30 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Investment & Start Fast ROI</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SELL / LIQUIDATE SPOT SHARES */}
      {isSellModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-heading font-black text-lg text-white">Liquidate TSLA Spot Shares</h3>
              <button onClick={() => setIsSellModalOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSellSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-400">Shares to Liquidate:</span>
                  <span className="text-zinc-400">Owned: <strong className="text-white font-mono">{userSpotHolding.shares.toFixed(4)}</strong></span>
                </div>
                <input
                  type="number"
                  step="0.0001"
                  max={userSpotHolding.shares}
                  min="0.0001"
                  value={sharesToSell}
                  onChange={(e) => setSharesToSell(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono font-bold"
                  required
                />
              </div>

              {(() => {
                const s = parseFloat(sharesToSell) || 0;
                const proceeds = s * currentPrice;
                return (
                  <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 text-xs flex items-center justify-between">
                    <span className="text-zinc-400">Vault USD Proceeds:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">+${proceeds.toFixed(2)} USD</span>
                  </div>
                );
              })()}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs uppercase tracking-wider transition"
              >
                Confirm Sale & Credit Vault
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
