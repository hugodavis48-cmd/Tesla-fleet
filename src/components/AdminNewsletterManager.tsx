import React, { useMemo, useState } from 'react';
import {
  Mail,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Download,
  CheckCircle2,
  XCircle,
  Send,
  Database,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NewsletterSubscriber } from '../types';

interface AdminNewsletterManagerProps {
  onSelectForBulkSend?: () => void;
}

const CATEGORIES: NewsletterSubscriber['interestCategory'][] = [
  'All Updates',
  'Service & Wraps',
  'Fleet & Yield',
  'Vehicle Drops & Promos',
];

export const AdminNewsletterManager: React.FC<AdminNewsletterManagerProps> = ({
  onSelectForBulkSend,
}) => {
  const {
    newsletterSubscribers,
    allUsers,
    subscribeToNewsletter,
    updateNewsletterSubscriber,
    deleteNewsletterSubscriber,
    refreshNewsletterSubscribers,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Quick Add Subscriber form
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] =
    useState<NewsletterSubscriber['interestCategory']>('All Updates');
  const [isAdding, setIsAdding] = useState(false);

  // Two-step delete confirm state (no window.confirm)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const activeSubscribers = useMemo(
    () => newsletterSubscribers.filter((s) => s.status === 'active'),
    [newsletterSubscribers]
  );

  const combinedUniqueCount = useMemo(() => {
    const set = new Set<string>();
    allUsers.forEach((u) => set.add(u.email.toLowerCase()));
    activeSubscribers.forEach((s) => set.add(s.email.toLowerCase()));
    return set.size;
  }, [allUsers, activeSubscribers]);

  const filteredSubscribers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return newsletterSubscribers.filter((sub) => {
      if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && sub.interestCategory !== categoryFilter) return false;
      if (!q) return true;
      return (
        sub.email.toLowerCase().includes(q) ||
        (sub.name || '').toLowerCase().includes(q) ||
        sub.interestCategory.toLowerCase().includes(q)
      );
    });
  }, [newsletterSubscribers, searchQuery, statusFilter, categoryFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshNewsletterSubscribers();
    setIsRefreshing(false);
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      showToast('Please enter a valid subscriber email address.', 'error');
      return;
    }
    setIsAdding(true);
    const res = await subscribeToNewsletter({
      email: clean,
      name: newName.trim(),
      interestCategory: newCategory,
      source: 'admin_manual',
    });
    setIsAdding(false);
    if (res.success) {
      setNewEmail('');
      setNewName('');
    }
  };

  const handleExportCsv = () => {
    if (filteredSubscribers.length === 0) {
      showToast('No subscriber rows to export.', 'error');
      return;
    }
    const header = 'Email,Name,InterestCategory,Status,Source,SubscribedAt';
    const rows = filteredSubscribers.map((s) =>
      [
        `"${s.email.replace(/"/g, '""')}"`,
        `"${(s.name || '').replace(/"/g, '""')}"`,
        `"${s.interestCategory}"`,
        `"${s.status}"`,
        `"${s.source}"`,
        `"${s.subscribedAt}"`,
      ].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apex-newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredSubscribers.length} subscriber record(s) to CSV.`, 'success');
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6 shadow-xl">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h4 className="font-heading font-bold text-base sm:text-lg text-white">
              Firestore Newsletter Mailing List Manager
            </h4>
          </div>
          <p className="text-xs text-zinc-400">
            Manage subscribers collected via NewsletterSignup (<code className="text-zinc-300">/newsletter_subscribers</code>), segment interest feeds, and target bulk updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-medium text-white flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Firestore</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-medium text-zinc-200 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          {onSelectForBulkSend && (
            <button
              type="button"
              onClick={onSelectForBulkSend}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Compose Bulk Update</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
          <span className="text-zinc-500 block">Active Newsletter</span>
          <span className="text-xl font-heading font-bold text-emerald-400 tabular-nums">
            {activeSubscribers.length}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
          <span className="text-zinc-500 block">Registered Users</span>
          <span className="text-xl font-heading font-bold text-white tabular-nums">
            {allUsers.length}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
          <span className="text-zinc-500 block">Combined Unique Reach</span>
          <span className="text-xl font-heading font-bold text-cyan-400 tabular-nums">
            {combinedUniqueCount}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
          <span className="text-zinc-500 block">Unsubscribed</span>
          <span className="text-xl font-heading font-bold text-zinc-400 tabular-nums">
            {newsletterSubscribers.length - activeSubscribers.length}
          </span>
        </div>
      </div>

      {/* Quick Add Subscriber Bar */}
      <form
        onSubmit={handleAddSubscriber}
        className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-end text-xs"
      >
        <div className="md:col-span-4">
          <label className="text-zinc-400 block mb-1">Add Subscriber Email</label>
          <input
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="subscriber@apex-tesla.io"
            className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-zinc-400 block mb-1">Full Name (Optional)</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Owner Name"
            className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-zinc-400 block mb-1">Dispatch Category</label>
          <select
            value={newCategory}
            onChange={(e) =>
              setNewCategory(e.target.value as NewsletterSubscriber['interestCategory'])
            }
            className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isAdding}
            className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Saving...' : 'Add Email'}</span>
          </button>
        </div>
      </form>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subscribers by email, name, or feed..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-zinc-600"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            {(['all', 'active', 'unsubscribed'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-zinc-200 focus:outline-none"
          >
            <option value="All">All Feed Segments</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subscribers Data Table */}
      {filteredSubscribers.length === 0 ? (
        <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-2">
          <Mail className="w-7 h-7 text-zinc-500 mx-auto" />
          <p className="text-sm font-semibold text-white">
            {newsletterSubscribers.length === 0
              ? 'No newsletter subscribers recorded yet'
              : 'No subscribers match your current filters'}
          </p>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Visitors can subscribe through the NewsletterSignup section on the site, or you can add subscribers directly above. Registered website accounts ({allUsers.length}) can also receive bulk updates from the Campaign Dispatcher below.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[11px]">
              <tr>
                <th className="p-3 font-medium">Subscriber Email</th>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Interest Segment</th>
                <th className="p-3 font-medium">Source &amp; Date</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              {filteredSubscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="p-3 font-mono text-white">{sub.email}</td>
                  <td className="p-3 text-zinc-300">{sub.name || '—'}</td>
                  <td className="p-3">
                    <select
                      value={sub.interestCategory}
                      onChange={(e) =>
                        updateNewsletterSubscriber(sub.id, {
                          interestCategory: e.target
                            .value as NewsletterSubscriber['interestCategory'],
                        })
                      }
                      aria-label={`Interest segment for ${sub.email}`}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-200 focus:outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-zinc-400 font-mono text-[11px] tabular-nums">
                    {sub.source} · {sub.subscribedAt}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() =>
                        updateNewsletterSubscriber(sub.id, {
                          status: sub.status === 'active' ? 'unsubscribed' : 'active',
                        })
                      }
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                        sub.status === 'active'
                          ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/35 hover:bg-emerald-950/80'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      {sub.status === 'active' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      <span>{sub.status === 'active' ? 'Active' : 'Unsubscribed'}</span>
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    {pendingDeleteId === sub.id ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            void deleteNewsletterSubscriber(sub.id);
                            setPendingDeleteId(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(null)}
                          className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(sub.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 transition cursor-pointer"
                        title="Remove subscriber"
                        aria-label={`Remove ${sub.email}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
