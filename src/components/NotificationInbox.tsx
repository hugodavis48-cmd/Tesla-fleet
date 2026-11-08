import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminNotificationMessage } from '../types';
import {
  Bell,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Info,
  DollarSign,
  TrendingUp,
  Shield,
  Trash2,
  Check,
  Sparkles,
  ExternalLink,
  X,
  Filter,
} from 'lucide-react';

interface NotificationInboxProps {
  onNavigateTab?: (tab: string) => void;
  onOpenDeposit?: () => void;
}

export const NotificationInbox: React.FC<NotificationInboxProps> = ({
  onNavigateTab,
  onOpenDeposit,
}) => {
  const {
    adminNotifications,
    markNotificationAsRead,
    dismissNotification,
    deleteNotification,
    currentUser,
    showToast,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'payouts' | 'announcements'>('all');

  const userId = currentUser?.id || 'usr-apex-001';
  const userEmail = currentUser?.email || 'alex.vance@apex-tesla.io';

  // Filter notifications meant for this user (broadcast or targeted to user id/email)
  const userNotifications = adminNotifications.filter((n) => {
    if (n.targetType === 'all') return true;
    if (n.targetUserId && n.targetUserId === userId) return true;
    if (n.targetUserEmail && n.targetUserEmail.toLowerCase() === userEmail.toLowerCase()) return true;
    return false;
  });

  const unreadCount = userNotifications.filter((n) => !n.readBy.includes(userId)).length;

  const filteredNotifications = userNotifications.filter((n) => {
    const isUnread = !n.readBy.includes(userId);
    if (activeFilter === 'unread') return isUnread;
    if (activeFilter === 'payouts') return n.type === 'payout';
    if (activeFilter === 'announcements') return n.type === 'announcement' || n.type === 'alert';
    return true;
  });

  const handleActionClick = (actionUrl?: string) => {
    if (!actionUrl) return;
    if (actionUrl === 'deposit' && onOpenDeposit) {
      onOpenDeposit();
    } else if (onNavigateTab) {
      onNavigateTab(actionUrl);
    }
  };

  const handleMarkAllRead = () => {
    userNotifications.forEach((n) => {
      if (!n.readBy.includes(userId)) {
        markNotificationAsRead(n.id);
      }
    });
    showToast('All notifications marked as read.', 'success');
  };

  const getTypeIcon = (type: AdminNotificationMessage['type']) => {
    switch (type) {
      case 'payout':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'investment':
        return <TrendingUp className="w-4 h-4 text-cyan-400" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'bonus':
        return <Sparkles className="w-4 h-4 text-yellow-400" />;
      case 'system':
        return <Shield className="w-4 h-4 text-purple-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative p-3 rounded-2xl bg-gradient-to-br from-red-600/20 to-rose-600/10 border border-red-500/30 text-red-400">
            <BellRing className="w-6 h-6 text-red-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-zinc-950 animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl text-white">Owner Notifications & Alerts</h3>
            <p className="text-xs text-zinc-400">
              Customized administrative messages, dividend payout receipts, and fleet operational bulletins
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            activeFilter === 'all'
              ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-white bg-zinc-900/50'
          }`}
        >
          All Messages ({userNotifications.length})
        </button>
        <button
          onClick={() => setActiveFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeFilter === 'unread'
              ? 'bg-red-600/20 text-red-400 border border-red-500/30'
              : 'text-zinc-400 hover:text-white bg-zinc-900/50'
          }`}
        >
          <span>Unread ({unreadCount})</span>
        </button>
        <button
          onClick={() => setActiveFilter('payouts')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            activeFilter === 'payouts'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-white bg-zinc-900/50'
          }`}
        >
          Dividends & Payouts
        </button>
        <button
          onClick={() => setActiveFilter('announcements')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            activeFilter === 'announcements'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-zinc-400 hover:text-white bg-zinc-900/50'
          }`}
        >
          Announcements & Alerts
        </button>
      </div>

      {/* Message List */}
      {filteredNotifications.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3">
          <Bell className="w-10 h-10 text-zinc-600 mx-auto" />
          <h4 className="font-heading font-bold text-white text-base">Inbox Up to Date</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            You don't have any notifications matching this filter. Administrative broadcasts and payout slips will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const isUnread = !notif.readBy.includes(userId);
            const isPersonal = notif.targetType === 'individual';

            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (isUnread) markNotificationAsRead(notif.id);
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start justify-between gap-4 ${
                  isUnread
                    ? 'bg-zinc-950 border-red-500/40 shadow-lg shadow-red-950/20 ring-1 ring-red-500/20'
                    : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 border ${
                      isUnread
                        ? 'bg-red-600/10 border-red-500/30 text-red-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {getTypeIcon(notif.type)}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {isUnread && (
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-mono font-bold text-[9px] uppercase tracking-wider">
                          NEW
                        </span>
                      )}
                      {isPersonal && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 font-mono text-[9px] uppercase">
                          DIRECT MESSAGE
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 font-mono text-[10px] uppercase">
                        {notif.type}
                      </span>
                      {notif.priority === 'urgent' && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600/20 text-rose-400 border border-rose-500/30 font-mono text-[9px] font-bold">
                          URGENT
                        </span>
                      )}
                      <span className="text-[11px] text-zinc-500 font-mono ml-auto">
                        {notif.createdAt}
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-sm text-white">{notif.title}</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">{notif.message}</p>

                    {notif.actionUrl && (
                      <div className="pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(notif.actionUrl);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold"
                        >
                          <span>{notif.actionLabel || 'View Details'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {isUnread && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationAsRead(notif.id);
                      }}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                    </button>
                  )}
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 transition"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
