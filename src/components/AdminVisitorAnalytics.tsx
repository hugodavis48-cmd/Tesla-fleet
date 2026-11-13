import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { VisitorActivityLog } from '../types';
import {
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  Trash2,
  Search,
  Clock,
  Shield,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface VisitorSummary {
  totalEvents: number;
  uniqueIps: number;
  uniqueVisitors: number;
  byCountry: Record<string, number>;
  byDevice: Record<string, number>;
  byBrowser: Record<string, number>;
  byTab: Record<string, number>;
}

export const AdminVisitorAnalytics: React.FC = () => {
  const { showToast } = useApp();
  const [logs, setLogs] = useState<VisitorActivityLog[]>([]);
  const [summary, setSummary] = useState<VisitorSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics/visitors');
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data.logs) ? data.logs : []);
        setSummary(data.summary || null);
      }
    } catch {
      showToast('Failed to load visitor analytics telemetry.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleClearLogs = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3500);
      return;
    }
    try {
      const res = await fetch('/api/analytics/visitors', { method: 'DELETE' });
      if (res.ok) {
        setLogs([]);
        setSummary({
          totalEvents: 0,
          uniqueIps: 0,
          uniqueVisitors: 0,
          byCountry: {},
          byDevice: {},
          byBrowser: {},
          byTab: {},
        });
        setConfirmClear(false);
        showToast('Visitor telemetry ledger cleared.', 'info');
      }
    } catch {
      showToast('Could not clear visitor logs.', 'error');
    }
  };

  const countryList = useMemo(() => {
    const set = new Set(logs.map((l) => l.country).filter(Boolean));
    return Array.from(set).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return logs.filter((l) => {
      if (countryFilter !== 'all' && l.country !== countryFilter) return false;
      if (deviceFilter !== 'all' && l.deviceType !== deviceFilter) return false;
      if (!q) return true;
      return (
        l.ip.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q) ||
        l.mobileModel.toLowerCase().includes(q) ||
        l.browser.toLowerCase().includes(q) ||
        l.os.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.pageTab.toLowerCase().includes(q) ||
        (l.userEmail || '').toLowerCase().includes(q) ||
        (l.userName || '').toLowerCase().includes(q)
      );
    });
  }, [logs, countryFilter, deviceFilter, searchQuery]);

  const totalMobile = (summary?.byDevice?.Mobile || 0) + (summary?.byDevice?.Tablet || 0);
  const mobilePct = summary?.totalEvents
    ? Math.round((totalMobile / summary.totalEvents) * 100)
    : 0;

  const topCountries = Object.entries(summary?.byCountry || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const topBrowsers = Object.entries(summary?.byBrowser || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" />
            <h3 className="font-heading font-black text-xl sm:text-2xl text-white">
              Live Visitor Analytics &amp; Device Telemetry
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Real-time audit stream of visitor IP addresses, geo-country, mobile hardware model, browser engine, OS, pages visited, and user actions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Refreshing...' : 'Refresh Telemetry'}</span>
          </button>

          <button
            type="button"
            onClick={handleClearLogs}
            className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
              confirmClear
                ? 'bg-red-600 border-red-500 text-white'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmClear ? 'Confirm Clear Logs?' : 'Clear Logs'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-red-400" /> Total Captured Actions
          </span>
          <div className="font-heading font-black text-2xl text-white tabular-nums">
            {(summary?.totalEvents ?? logs.length).toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-400" /> Unique Visitors
          </span>
          <div className="font-heading font-black text-2xl text-emerald-400 tabular-nums">
            {(summary?.uniqueVisitors ?? 0).toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-cyan-400" /> Distinct IP Addresses
          </span>
          <div className="font-heading font-black text-2xl text-cyan-400 tabular-nums">
            {(summary?.uniqueIps ?? 0).toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-amber-400" /> Mobile &amp; Tablet Share
          </span>
          <div className="font-heading font-black text-2xl text-amber-400 tabular-nums">
            {mobilePct}%
          </div>
        </div>
      </div>

      {/* Country & Browser Distribution Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase text-zinc-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" /> Top Visitor Countries
          </h4>
          <div className="space-y-2.5">
            {topCountries.length === 0 ? (
              <p className="text-xs text-zinc-500">No country data captured yet.</p>
            ) : (
              topCountries.map(([country, count]) => {
                const max = Math.max(1, topCountries[0]?.[1] || 1);
                const pct = Math.round((count / max) * 100);
                return (
                  <div key={country} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-200">{country}</span>
                      <span className="text-cyan-400 font-bold tabular-nums">{count} events</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase text-zinc-400 flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-red-400" /> Browser &amp; Client Engines
          </h4>
          <div className="space-y-2.5">
            {topBrowsers.length === 0 ? (
              <p className="text-xs text-zinc-500">No browser telemetry captured yet.</p>
            ) : (
              topBrowsers.map(([browser, count]) => {
                const max = Math.max(1, topBrowsers[0]?.[1] || 1);
                const pct = Math.round((count / max) * 100);
                return (
                  <div key={browser} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-200">{browser}</span>
                      <span className="text-red-400 font-bold tabular-nums">{count} events</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Filters & Live Telemetry Table */}
      <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by IP, device model, browser, action, or email..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-red-500 outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 outline-none"
            >
              <option value="all">All Countries</option>
              {countryList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 outline-none"
            >
              <option value="all">All Devices</option>
              <option value="Mobile">Mobile</option>
              <option value="Tablet">Tablet</option>
              <option value="Desktop">Desktop</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] font-mono uppercase text-zinc-500">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">IP &amp; Country</th>
                <th className="py-2.5 px-3">Device / Mobile Type</th>
                <th className="py-2.5 px-3">Browser &amp; OS</th>
                <th className="py-2.5 px-3">User / Guest</th>
                <th className="py-2.5 px-3">Page Tab</th>
                <th className="py-2.5 px-3">Action &amp; Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No visitor activity logs match your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/50 transition">
                    <td className="py-3 px-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono text-white font-semibold">{log.ip}</div>
                      <div className="text-[11px] text-cyan-400">{log.country}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                        {log.deviceType === 'Mobile' ? (
                          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                        ) : log.deviceType === 'Tablet' ? (
                          <Tablet className="w-3.5 h-3.5 text-indigo-400" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>{log.mobileModel}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{log.deviceType}</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-zinc-200">{log.browser}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{log.os}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {log.userEmail ? (
                        <div>
                          <div className="text-white font-semibold">{log.userName || 'Member'}</div>
                          <div className="text-[10px] text-emerald-400 font-mono">{log.userEmail}</div>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-500">Guest ({log.visitorId.slice(0, 12)})</span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300">
                        /{log.pageTab}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-white font-semibold">{log.action}</div>
                      {log.details && <div className="text-[11px] text-zinc-400 max-w-xs truncate">{log.details}</div>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
