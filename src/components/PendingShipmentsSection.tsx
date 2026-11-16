import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { WonPrizeItem } from '../types';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Wallet,
  Search,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Trophy,
  Plus,
  ArrowUpRight,
  Mail,
  Bell,
} from 'lucide-react';
import { ShipmentProgressBar } from './ShipmentProgressBar';
import { isWonPrizeAdminVerified } from '../lib/wonShipmentTracking';

interface PendingShipmentsSectionProps {
  onOpenDeposit: () => void;
  onOpenTracking?: (trackingNumber?: string) => void;
  onManageAllWonPrizes?: () => void;
}

interface AdminDraftState {
  trackingNumber: string;
  carrierName: string;
  shippingStatus: WonPrizeItem['shippingStatus'];
  paymentVerified: boolean;
  notes: string;
}

interface DispatchReceipt {
  prizeId: string;
  statusLabel: string;
  trackingNumber?: string;
  notificationTitle?: string;
  emailRecipient?: string;
  emailStatus?: string;
  timestamp: string;
}

const COUNTRY_OPTIONS = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'United Arab Emirates',
  'Australia',
  'Japan',
  'France',
  'Netherlands',
  'Switzerland',
  'Singapore',
  'Nigeria',
  'South Africa',
  'Other International Destination',
];

const DELIVERY_METHODS = [
  { id: 'enclosed_carrier', label: 'Enclosed Climate-Controlled Carrier (US / EU)' },
  { id: 'air_freight_intl', label: 'Priority International Air Freight (7-12 Days)' },
  { id: 'ocean_roro_intl', label: 'Insured Ocean RoRo / Containerized Vessel' },
  { id: 'delivery_hub_pickup', label: 'Apex Regional Delivery Center Pickup' },
];

const SHIPMENT_STATUS_OPTIONS: { value: WonPrizeItem['shippingStatus']; label: string }[] = [
  { value: 'awaiting_details', label: 'Awaiting Shipping Details' },
  { value: 'fees_paid_processing', label: 'Fees Paid & Processing' },
  { value: 'approved', label: 'Approved' },
  { value: 'documentation_ready', label: 'Export Documentation Ready' },
  { value: 'shipped', label: 'Shipped / In Transit' },
  { value: 'delivered', label: 'Delivered' },
];

export const PendingShipmentsSection: React.FC<PendingShipmentsSectionProps> = ({
  onOpenDeposit,
  onOpenTracking,
  onManageAllWonPrizes,
}) => {
  const {
    currentUser,
    wonPrizes,
    vehicleOrders,
    activeDepositBalanceUsd,
    freeWinBalanceUsd,
    submitWonPrizeShippingAndPayFees,
    approveWonPrizeShipment,
    saveWonPrizeAdminUpdate,
    formatCurrency,
    showToast,
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  const [sectionTab, setSectionTab] = useState<'user' | 'admin'>(isAdmin ? 'admin' : 'user');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'approved'>('all');
  const [adminFilter, setAdminFilter] = useState<'all' | 'needs_verification' | 'approved'>('all');
  const [adminQuery, setAdminQuery] = useState('');
  const [adminDrafts, setAdminDrafts] = useState<Record<string, AdminDraftState>>({});
  const [adminBusyId, setAdminBusyId] = useState<string | null>(null);
  const [dispatchReceipts, setDispatchReceipts] = useState<Record<string, DispatchReceipt>>({});

  const [expandedPrizeId, setExpandedPrizeId] = useState<string | null>(null);
  const [trackingSearch, setTrackingSearch] = useState('');
  const [isLookingUpTrack, setIsLookingUpTrack] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [formsByPrize, setFormsByPrize] = useState<
    Record<string, NonNullable<WonPrizeItem['shippingAddress']>>
  >({});

  const isPrizeApproved = (p: WonPrizeItem) => isWonPrizeAdminVerified(p);

  const myPrizes = useMemo(() => {
    if (!currentUser) return [];
    const owned = wonPrizes.filter(
      (p) =>
        p.userId === currentUser.id ||
        p.userEmail?.toLowerCase() === currentUser.email?.toLowerCase() ||
        (currentUser.id === 'usr-alex-001' && p.userId === 'usr-apex-001')
    );
    return [...owned].sort((a, b) => {
      const rank = (item: WonPrizeItem) => {
        const approved = isPrizeApproved(item);
        if (!item.feesPaid) return 0;
        if (!approved) return 1;
        if (item.shippingStatus !== 'delivered') return 2;
        return 3;
      };
      return rank(a) - rank(b);
    });
  }, [wonPrizes, currentUser]);

  const pendingActionCount = myPrizes.filter((p) => !isPrizeApproved(p)).length;
  const approvedCount = myPrizes.filter((p) => isPrizeApproved(p)).length;

  const visiblePrizes = useMemo(() => {
    if (filterMode === 'pending') return myPrizes.filter((p) => !isPrizeApproved(p));
    if (filterMode === 'approved') return myPrizes.filter((p) => isPrizeApproved(p));
    return myPrizes;
  }, [myPrizes, filterMode]);

  const adminFilteredPrizes = useMemo(() => {
    const q = adminQuery.trim().toLowerCase();
    return [...wonPrizes]
      .filter((p) => {
        if (adminFilter === 'needs_verification' && isPrizeApproved(p)) return false;
        if (adminFilter === 'approved' && !isPrizeApproved(p)) return false;
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          (p.userName || '').toLowerCase().includes(q) ||
          (p.userEmail || '').toLowerCase().includes(q) ||
          (p.vinAssigned || '').toLowerCase().includes(q) ||
          (p.trackingNumber || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const score = (x: WonPrizeItem) => (x.feesPaid && !isPrizeApproved(x) ? 0 : !isPrizeApproved(x) ? 1 : 2);
        return score(a) - score(b);
      });
  }, [wonPrizes, adminFilter, adminQuery]);

  const getAdminDraft = (prize: WonPrizeItem): AdminDraftState => {
    if (adminDrafts[prize.id]) return adminDrafts[prize.id];
    return {
      trackingNumber: prize.trackingNumber || '',
      carrierName: prize.carrierName || 'Apex Bonded Enclosed EV Carrier',
      shippingStatus: prize.shippingStatus || 'awaiting_details',
      paymentVerified: Boolean(prize.paymentVerifiedByAdmin),
      notes: prize.notes || '',
    };
  };

  const updateAdminDraft = (prize: WonPrizeItem, patch: Partial<AdminDraftState>) => {
    const current = getAdminDraft(prize);
    setAdminDrafts((prev) => ({
      ...prev,
      [prize.id]: { ...current, ...patch },
    }));
  };

  const handleAdminApproveAndNotify = async (prize: WonPrizeItem) => {
    const draft = getAdminDraft(prize);
    const manualTrack = draft.trackingNumber.trim();
    setAdminBusyId(prize.id);
    try {
      const targetStatus: 'approved' | 'documentation_ready' | 'shipped' | 'delivered' =
        draft.shippingStatus === 'documentation_ready' ||
        draft.shippingStatus === 'shipped' ||
        draft.shippingStatus === 'delivered'
          ? draft.shippingStatus
          : 'approved';

      const res = await approveWonPrizeShipment(prize.id, {
        trackingNumber: manualTrack || undefined,
        carrierName: draft.carrierName.trim() || 'Apex Bonded Enclosed EV Carrier',
        shippingStatus: targetStatus,
        notes: draft.notes.trim() || undefined,
        confirmPaymentVerified: true,
      });

      if (res.success && res.prize) {
        updateAdminDraft(prize, {
          trackingNumber: res.prize.trackingNumber || manualTrack,
          carrierName: res.prize.carrierName || draft.carrierName,
          shippingStatus: res.prize.shippingStatus,
          paymentVerified: Boolean(res.prize.paymentVerifiedByAdmin),
          notes: res.prize.notes || draft.notes,
        });
        setDispatchReceipts((prev) => ({
          ...prev,
          [prize.id]: {
            prizeId: prize.id,
            statusLabel:
              SHIPMENT_STATUS_OPTIONS.find((s) => s.value === res.prize?.shippingStatus)?.label ||
              res.prize?.shippingStatus ||
              'Approved',
            trackingNumber: res.prize?.trackingNumber,
            notificationTitle: res.notification?.title,
            emailRecipient: res.emailDispatch?.recipient || res.prize?.userEmail,
            emailStatus: res.emailDispatch?.status || 'simulated',
            timestamp: new Date().toLocaleTimeString(),
          },
        }));
      }
    } finally {
      setAdminBusyId(null);
    }
  };

  const handleAdminSaveUpdate = async (prize: WonPrizeItem) => {
    const draft = getAdminDraft(prize);
    const manualTrack = draft.trackingNumber.trim();
    const approvedBySelected =
      draft.shippingStatus === 'approved' ||
      draft.shippingStatus === 'documentation_ready' ||
      draft.shippingStatus === 'shipped' ||
      draft.shippingStatus === 'delivered';

    setAdminBusyId(prize.id);
    try {
      const res = await saveWonPrizeAdminUpdate(prize.id, {
        trackingNumber: manualTrack || undefined,
        carrierName: draft.carrierName.trim() || 'Apex Bonded Enclosed EV Carrier',
        shippingStatus: draft.shippingStatus,
        paymentVerifiedByAdmin: draft.paymentVerified,
        adminApprovedForShipment: approvedBySelected || draft.paymentVerified,
        feesPaid: draft.paymentVerified ? true : prize.feesPaid,
        notes: draft.notes.trim() || undefined,
      });

      if (res.success && res.prize) {
        updateAdminDraft(prize, {
          trackingNumber: res.prize.trackingNumber || '',
          carrierName: res.prize.carrierName || draft.carrierName,
          shippingStatus: res.prize.shippingStatus,
          paymentVerified: Boolean(res.prize.paymentVerifiedByAdmin),
          notes: res.prize.notes || '',
        });
        setDispatchReceipts((prev) => ({
          ...prev,
          [prize.id]: {
            prizeId: prize.id,
            statusLabel:
              SHIPMENT_STATUS_OPTIONS.find((s) => s.value === res.prize?.shippingStatus)?.label ||
              res.prize?.shippingStatus ||
              'Updated',
            trackingNumber: res.prize?.trackingNumber,
            notificationTitle: res.notification?.title,
            emailRecipient: res.emailDispatch?.recipient || res.prize?.userEmail,
            emailStatus: res.emailDispatch?.status || (res.notification ? 'simulated' : undefined),
            timestamp: new Date().toLocaleTimeString(),
          },
        }));
      }
    } finally {
      setAdminBusyId(null);
    }
  };

  const getForm = (prize: WonPrizeItem): NonNullable<WonPrizeItem['shippingAddress']> => {
    if (formsByPrize[prize.id]) return formsByPrize[prize.id];
    if (prize.shippingAddress) return prize.shippingAddress;
    return {
      fullName: currentUser?.name || '',
      country: 'United States',
      street: '',
      apartmentOrSuite: '',
      city: '',
      state: '',
      zipCode: '',
      phone: currentUser?.phone || '',
      deliveryMethod: prize.prizeType === 'vehicle' ? 'ocean_roro_intl' : 'air_freight_intl',
      deliveryNotes: '',
    };
  };

  const updateFormField = (
    prize: WonPrizeItem,
    field: keyof NonNullable<WonPrizeItem['shippingAddress']>,
    value: string
  ) => {
    const current = getForm(prize);
    setFormsByPrize((prev) => ({
      ...prev,
      [prize.id]: { ...current, [field]: value },
    }));
  };

  const handleConfirmAndPay = async (prize: WonPrizeItem) => {
    const form = getForm(prize);
    if (
      !form.fullName.trim() ||
      !form.country.trim() ||
      !form.street.trim() ||
      !form.city.trim() ||
      !form.zipCode.trim() ||
      !form.phone.trim()
    ) {
      showToast(
        'Complete full legal name, country, street, city, ZIP, and phone to confirm shipping address.',
        'error'
      );
      setExpandedPrizeId(prize.id);
      return;
    }

    const totalFees = Number(
      ((prize.processingFeeUsd || 0) + (prize.shippingDocFeeUsd || 0) + (prize.shippingFreightFeeUsd || 0)).toFixed(2)
    );
    if (activeDepositBalanceUsd < totalFees) {
      showToast(
        `Verified deposit balance ($${activeDepositBalanceUsd.toFixed(2)}) is short by $${(totalFees - activeDepositBalanceUsd).toFixed(2)} for required shipping fees. Make a deposit to continue.`,
        'error'
      );
      onOpenDeposit();
      return;
    }

    setSubmittingId(prize.id);
    try {
      const result = await submitWonPrizeShippingAndPayFees(prize.id, form, 'deposit');
      if (result.success) {
        setExpandedPrizeId(null);
      }
    } finally {
      setSubmittingId(null);
    }
  };

  const handleTrackLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = trackingSearch.trim();
    if (!q) {
      onOpenTracking?.();
      return;
    }

    const lower = q.toLowerCase();
    const localApproved = wonPrizes.find(
      (p) =>
        isPrizeApproved(p) &&
        p.trackingNumber?.toLowerCase() === lower &&
        (isAdmin ||
          p.userId === currentUser?.id ||
          p.userEmail?.toLowerCase() === currentUser?.email?.toLowerCase() ||
          (currentUser?.id === 'usr-alex-001' && p.userId === 'usr-apex-001'))
    );
    if (localApproved?.trackingNumber) {
      onOpenTracking?.(localApproved.trackingNumber);
      return;
    }

    const localOrder = vehicleOrders.find(
      (o) => o.trackingNumber.toLowerCase() === lower || o.id.toLowerCase() === lower
    );
    if (localOrder) {
      onOpenTracking?.(localOrder.trackingNumber);
      return;
    }

    setIsLookingUpTrack(true);
    try {
      const tok = typeof window !== 'undefined' ? localStorage.getItem('apex_session_token') : null;
      const res = await fetch(`/api/tracking/${encodeURIComponent(q)}`, {
        headers: tok ? { Authorization: `Bearer ${tok}` } : {},
      });
      if (res.ok) {
        onOpenTracking?.(q);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(
          err.error || 'No admin-approved shipment found for that tracking number yet.',
          'error'
        );
      }
    } catch {
      showToast('Unable to verify tracking number right now.', 'error');
    } finally {
      setIsLookingUpTrack(false);
    }
  };

  const handleCopyTracking = (id: string, trackingNumber: string) => {
    navigator.clipboard?.writeText(trackingNumber).catch(() => {});
    setCopiedId(id);
    showToast(`Copied tracking number ${trackingNumber}`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusMeta = (prize: WonPrizeItem) => {
    const approved = isPrizeApproved(prize);
    if (!prize.feesPaid || !prize.addressConfirmed) {
      return {
        label: 'Action Required: Confirm Address & Pay Fees',
        tone: 'text-amber-300 border-amber-500/40 bg-amber-500/10',
      };
    }
    if (!approved) {
      return {
        label: 'Pending Admin Payment Verification',
        tone: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10',
      };
    }
    if (prize.shippingStatus === 'delivered') {
      return {
        label: 'Delivered to Destination',
        tone: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
      };
    }
    if (prize.shippingStatus === 'shipped') {
      return {
        label: 'Shipped — Tracking Active',
        tone: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
      };
    }
    return {
      label: 'Approved — Ready to Track',
      tone: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
    };
  };

  return (
    <section
      aria-label="Pending Shipments"
      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6 space-y-5"
    >
      {/* Top Header + Inline Tracking Lookup */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-600/15 border border-red-500/30 text-red-400">
              <Truck className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-xl text-white">Pending Shipments</h3>
            {pendingActionCount > 0 && (
              <span className="px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-semibold tabular-nums">
                {pendingActionCount} Pending
              </span>
            )}
            {approvedCount > 0 && (
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-semibold tabular-nums">
                {approvedCount} Approved
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400">
            Confirm destination shipping addresses and deposit-funded processing fees for won vehicles. Tracking unlocks once Admin verifies payment and sets status to Approved.
          </p>
        </div>

        <form onSubmit={handleTrackLookup} className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={trackingSearch}
              onChange={(e) => setTrackingSearch(e.target.value)}
              placeholder="Track by assigned # (APX-EXP-...)"
              aria-label="Track won vehicle by assigned tracking number"
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 font-mono focus:border-cyan-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLookingUpTrack}
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold shrink-0 whitespace-nowrap cursor-pointer transition"
          >
            {isLookingUpTrack ? 'Checking...' : 'Track #'}
          </button>
        </form>
      </div>

      {/* Mode Switcher when logged in as Admin */}
      {isAdmin && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSectionTab('admin')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition ${
                sectionTab === 'admin'
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Control Panel ({wonPrizes.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSectionTab('user')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition ${
                sectionTab === 'user'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              My Member Shipments ({myPrizes.length})
            </button>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            Status updates automatically trigger Dashboard &amp; Email notifications
          </span>
        </div>
      )}

      {/* ADMIN CONTROL PANEL */}
      {isAdmin && sectionTab === 'admin' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: `All Records (${wonPrizes.length})` },
                {
                  id: 'needs_verification',
                  label: `Needs Verification (${wonPrizes.filter((p) => !isPrizeApproved(p)).length})`,
                },
                {
                  id: 'approved',
                  label: `Approved (${wonPrizes.filter((p) => isPrizeApproved(p)).length})`,
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAdminFilter(item.id as typeof adminFilter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition ${
                    adminFilter === item.id
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-white border border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={adminQuery}
                onChange={(e) => setAdminQuery(e.target.value)}
                placeholder="Filter by user, vehicle, VIN, track #"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          {adminFilteredPrizes.length === 0 ? (
            <div className="p-8 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center text-xs text-zinc-400">
              No won-vehicle shipment records match your current filter.
            </div>
          ) : (
            <div className="space-y-3">
              {adminFilteredPrizes.map((prize) => {
                const draft = getAdminDraft(prize);
                const approved = isPrizeApproved(prize);
                const totalFees = Number(
                  ((prize.processingFeeUsd || 0) + (prize.shippingDocFeeUsd || 0) + (prize.shippingFreightFeeUsd || 0)).toFixed(2)
                );
                const isBusy = adminBusyId === prize.id;
                const receipt = dispatchReceipts[prize.id];

                return (
                  <div
                    key={prize.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/35 p-4 space-y-3.5"
                  >
                    {/* Header line */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-heading font-bold text-sm text-white">{prize.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded border text-[10px] font-mono font-semibold uppercase ${
                              approved
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                : prize.feesPaid
                                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                                : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                            }`}
                          >
                            {(prize.shippingStatus || 'awaiting_details').replace(/_/g, ' ')}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded border text-[10px] font-mono ${
                              prize.paymentVerifiedByAdmin
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : prize.feesPaid
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                            }`}
                          >
                            {prize.paymentVerifiedByAdmin
                              ? 'Payment Verified'
                              : prize.feesPaid
                              ? 'Fees Submitted — Unverified'
                              : 'Fees Unpaid'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-zinc-400">
                          <span>
                            Winner: <strong className="text-zinc-200">{prize.userName}</strong> ({prize.userEmail})
                          </span>
                          <span>VIN: {prize.vinAssigned || 'Assigned on Dispatch'}</span>
                          <span>
                            Fees:{' '}
                            <strong className="text-zinc-200 tabular-nums">
                              ${totalFees.toLocaleString()} USD
                            </strong>
                          </span>
                          {prize.shippingAddress?.city && (
                            <span>
                              Dest: {prize.shippingAddress.city}, {prize.shippingAddress.country}
                            </span>
                          )}
                        </div>
                      </div>

                      {prize.trackingNumber && approved && (
                        <span className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-xs font-bold shrink-0">
                          {prize.trackingNumber}
                        </span>
                      )}
                    </div>

                    {/* Controls grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">
                          Manual Tracking Number
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={draft.trackingNumber}
                            onChange={(e) =>
                              updateAdminDraft(prize, { trackingNumber: e.target.value })
                            }
                            placeholder="Enter tracking # (e.g. APX-EXP-...)"
                            aria-label={`Manual tracking number for ${prize.title}`}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-xs focus:border-cyan-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateAdminDraft(prize, {
                                trackingNumber: `APX-EXP-${Date.now().toString(36).toUpperCase()}`,
                              })
                            }
                            className="px-2.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-[10px] font-bold shrink-0 whitespace-nowrap cursor-pointer"
                            title="Generate tracking number"
                          >
                            Gen #
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">Carrier Name</label>
                        <input
                          type="text"
                          value={draft.carrierName}
                          onChange={(e) => updateAdminDraft(prize, { carrierName: e.target.value })}
                          placeholder="Apex Bonded Enclosed EV Carrier"
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:border-cyan-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">
                          Shipment Status
                        </label>
                        <select
                          value={draft.shippingStatus}
                          onChange={(e) =>
                            updateAdminDraft(prize, {
                              shippingStatus: e.target.value as WonPrizeItem['shippingStatus'],
                            })
                          }
                          aria-label={`Shipment status for ${prize.title}`}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:border-cyan-500 outline-none"
                        >
                          {SHIPMENT_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">
                          Dispatch Note (Email &amp; Dashboard)
                        </label>
                        <input
                          type="text"
                          value={draft.notes}
                          onChange={(e) => updateAdminDraft(prize, { notes: e.target.value })}
                          placeholder="Optional delivery or clearance note"
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:border-cyan-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Verification Toggle + Submit Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <label className="inline-flex items-center gap-2 text-xs text-zinc-200 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={draft.paymentVerified}
                          onChange={(e) =>
                            updateAdminDraft(prize, { paymentVerified: e.target.checked })
                          }
                          className="rounded border-zinc-700 bg-zinc-950 text-emerald-500"
                        />
                        <span>Payment Received &amp; Verified (${totalFees.toLocaleString()} USD)</span>
                      </label>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void handleAdminSaveUpdate(prize)}
                          className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 border border-zinc-700 text-white text-xs font-semibold whitespace-nowrap cursor-pointer transition"
                        >
                          {isBusy ? 'Saving...' : 'Save Status & Notify'}
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void handleAdminApproveAndNotify(prize)}
                          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{isBusy ? 'Processing...' : 'Set Approved & Notify'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Server Trigger Receipt */}
                    {receipt && (
                      <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/35 text-[11px] text-emerald-200 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-1 font-semibold">
                            <Bell className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Dashboard notification sent ({receipt.statusLabel})</span>
                          </span>
                          {receipt.emailRecipient && (
                            <span className="inline-flex items-center gap-1 font-mono">
                              <Mail className="w-3.5 h-3.5 text-cyan-400" />
                              <span>
                                Email {receipt.emailStatus || 'dispatched'} to {receipt.emailRecipient}
                              </span>
                            </span>
                          )}
                          {receipt.trackingNumber && (
                            <span className="font-mono text-white">Track: {receipt.trackingNumber}</span>
                          )}
                        </div>
                        <span className="font-mono text-zinc-400">{receipt.timestamp}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MEMBER PENDING SHIPMENTS VIEW */}
      {(!isAdmin || sectionTab === 'user') && (
        <>
          {/* Filter & Balance Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: `All (${myPrizes.length})` },
                { id: 'pending', label: `Pending & Verification (${pendingActionCount})` },
                { id: 'approved', label: `Approved & Trackable (${approvedCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id as typeof filterMode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    filterMode === tab.id
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-white border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-zinc-400 font-mono">
                Verified Deposit:{' '}
                <strong className="text-emerald-400 tabular-nums">
                  {formatCurrency(activeDepositBalanceUsd, { includeCode: true })}
                </strong>
              </span>
              <button
                type="button"
                onClick={onOpenDeposit}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-red-400" />
                <span>Deposit</span>
              </button>
              {onManageAllWonPrizes && myPrizes.length > 0 && (
                <button
                  type="button"
                  onClick={onManageAllWonPrizes}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Full Prize Dossier</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {visiblePrizes.length === 0 ? (
            <div className="p-8 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-center space-y-2">
              <Trophy className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-white">
                {myPrizes.length === 0
                  ? 'No Won Vehicle Shipments Pending'
                  : 'No Shipments in This Filter'}
              </p>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                {myPrizes.length === 0
                  ? 'Any Tesla vehicle won via Spin & Win or Scratch Cards will appear here with shipping address confirmation, fee settlement, and live tracking.'
                  : 'Switch the filter above to inspect your other won vehicle records.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visiblePrizes.map((prize) => {
                const approved = isPrizeApproved(prize);
                const totalFees = Number(
                  ((prize.processingFeeUsd || 0) + (prize.shippingDocFeeUsd || 0) + (prize.shippingFreightFeeUsd || 0)).toFixed(2)
                );
                const hasEnoughDeposit = activeDepositBalanceUsd >= totalFees;
                const form = getForm(prize);
                const isFormExpanded =
                  expandedPrizeId === prize.id ||
                  (!prize.feesPaid && expandedPrizeId === null && myPrizes.length === 1);
                const statusMeta = getStatusMeta(prize);

                return (
                  <div
                    key={prize.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5 space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={prize.image || '/promo-plaid.jpg'}
                          alt={prize.title}
                          className="w-20 h-14 rounded-lg object-cover border border-zinc-800 shrink-0 bg-black"
                        />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-heading font-bold text-base text-white">
                              {prize.title}
                            </h4>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded border text-[11px] font-semibold ${statusMeta.tone}`}
                            >
                              {statusMeta.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-zinc-400">
                            <span>{prize.vinAssigned ? `VIN: ${prize.vinAssigned}` : `SKU: ${prize.modelOrSku}`}</span>
                            <span>Won via {prize.source} ({prize.wonAt})</span>
                            <span>
                              Est. Value:{' '}
                              <strong className="text-zinc-200 tabular-nums">
                                {formatCurrency(Number(prize.estimatedValueUsd || 0))}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-right">
                          <span className="text-[10px] font-mono text-zinc-500 block uppercase">Required Fees</span>
                          <span className="text-sm font-mono font-bold text-white tabular-nums">
                            {formatCurrency(totalFees, { includeCode: true })}
                          </span>
                        </div>

                        {approved && prize.trackingNumber ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleCopyTracking(prize.id, prize.trackingNumber!)}
                              className="px-3 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-700 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                              title="Copy tracking number"
                            >
                              <span>{prize.trackingNumber}</span>
                              {copiedId === prize.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenTracking?.(prize.trackingNumber)}
                              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Track Shipment</span>
                            </button>
                          </>
                        ) : !prize.feesPaid ? (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedPrizeId(isFormExpanded ? '__none__' : prize.id)
                            }
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Confirm Address &amp; Pay Fees</span>
                            {isFormExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        ) : (
                          <div className="px-3.5 py-2 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Awaiting Admin Approval</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Visual Shipment Status Progress Bar (Processing -> Verified -> Shipped -> Delivered) */}
                    <ShipmentProgressBar
                      prize={prize}
                      onOpenTrackingMap={(trackNum) => onOpenTracking?.(trackNum)}
                    />

                    {/* 4-Step Verification Progress Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 text-xs">
                      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/90 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">1. Vehicle Allocation</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <p className="font-semibold text-zinc-200 truncate">{prize.modelOrSku || prize.title}</p>
                        <p className="text-[11px] font-mono text-zinc-400 truncate">
                          {prize.vinAssigned || 'Assigned on Dispatch'}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/90 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">2. Shipping Address</span>
                          {prize.addressConfirmed && prize.shippingAddress ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </div>
                        {prize.shippingAddress?.street ? (
                          <>
                            <p className="font-semibold text-zinc-200 truncate">
                              {prize.shippingAddress.city}, {prize.shippingAddress.country}
                            </p>
                            <p className="text-[11px] text-zinc-400 truncate">
                              {prize.shippingAddress.street}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-amber-300">Address Confirmation Required</p>
                            <p className="text-[11px] text-zinc-400">Fill destination street, city &amp; phone</p>
                          </>
                        )}
                      </div>

                      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/90 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">3. Processing &amp; Freight</span>
                          {prize.feesPaid ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Wallet className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </div>
                        {prize.feesPaid ? (
                          <>
                            <p className="font-semibold text-emerald-300 tabular-nums">
                              Paid {formatCurrency(totalFees)} (Deposit)
                            </p>
                            <p className="text-[11px] font-mono text-zinc-400">
                              Submitted {prize.paidAt ? String(prize.paidAt).slice(0, 10) : 'Today'}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-amber-300 tabular-nums">
                              {formatCurrency(totalFees)} Due (Deposit-Only)
                            </p>
                            <p className="text-[11px] text-zinc-400">
                              Proc ${prize.processingFeeUsd} + Doc ${prize.shippingDocFeeUsd} + Freight ${prize.shippingFreightFeeUsd}
                            </p>
                          </>
                        )}
                      </div>

                      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/90 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">4. Admin Verification</span>
                          {approved ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          )}
                        </div>
                        {approved ? (
                          <>
                            <p className="font-semibold text-emerald-300">Approved</p>
                            <p className="text-[11px] font-mono text-zinc-300 truncate">
                              {prize.trackingNumber || 'Tracking Active'}
                            </p>
                          </>
                        ) : prize.feesPaid ? (
                          <>
                            <p className="font-semibold text-cyan-300">Pending Payment Check</p>
                            <p className="text-[11px] text-zinc-400">
                              Tracking # unlocks on Admin approval
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-zinc-400">Locked Until Fees Paid</p>
                            <p className="text-[11px] text-zinc-500">
                              Complete Steps 2 &amp; 3 first
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Inline Address Confirmation & Fee Settlement Drawer */}
                    {!prize.feesPaid && isFormExpanded && (
                      <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                          <div>
                            <h5 className="font-heading font-bold text-sm text-white">
                              Confirm Shipping Address &amp; Settle Required Fees
                            </h5>
                            <p className="text-[11px] text-zinc-400">
                              Breakdown: ${prize.processingFeeUsd} Processing + ${prize.shippingDocFeeUsd} Export Docs + ${prize.shippingFreightFeeUsd} Freight ={' '}
                              <strong className="text-white tabular-nums">${totalFees.toLocaleString()} USD</strong>
                            </p>
                          </div>
                          <span className="text-[11px] font-mono text-zinc-400">
                            Verified Deposit Available:{' '}
                            <strong className={hasEnoughDeposit ? 'text-emerald-400' : 'text-amber-400'}>
                              {formatCurrency(activeDepositBalanceUsd, { includeCode: true })}
                            </strong>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">Full Legal Name (Title &amp; Customs)*</label>
                            <input
                              type="text"
                              value={form.fullName}
                              onChange={(e) => updateFormField(prize, 'fullName', e.target.value)}
                              placeholder="Full Legal Name"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-red-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">Destination Country*</label>
                            <select
                              value={form.country}
                              onChange={(e) => updateFormField(prize, 'country', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-red-500 outline-none"
                            >
                              {COUNTRY_OPTIONS.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">Contact Phone (Carrier SMS)*</label>
                            <input
                              type="text"
                              value={form.phone}
                              onChange={(e) => updateFormField(prize, 'phone', e.target.value)}
                              placeholder="+1 555-000-0000"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-red-500 outline-none"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[11px] text-zinc-400 block mb-1">Street Address*</label>
                            <input
                              type="text"
                              value={form.street}
                              onChange={(e) => updateFormField(prize, 'street', e.target.value)}
                              placeholder="Street number, road name, district"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-red-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">City*</label>
                            <input
                              type="text"
                              value={form.city}
                              onChange={(e) => updateFormField(prize, 'city', e.target.value)}
                              placeholder="City"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-red-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">State / Province</label>
                            <input
                              type="text"
                              value={form.state}
                              onChange={(e) => updateFormField(prize, 'state', e.target.value)}
                              placeholder="State / Province"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-red-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">Postal / ZIP Code*</label>
                            <input
                              type="text"
                              value={form.zipCode}
                              onChange={(e) => updateFormField(prize, 'zipCode', e.target.value)}
                              placeholder="ZIP / Postal"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-red-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">Delivery Method</label>
                            <select
                              value={form.deliveryMethod}
                              onChange={(e) => updateFormField(prize, 'deliveryMethod', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-red-500 outline-none"
                            >
                              {DELIVERY_METHODS.map((dm) => (
                                <option key={dm.id} value={dm.id}>
                                  {dm.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {!hasEnoughDeposit && (
                          <div className="p-3 rounded-lg bg-amber-950/35 border border-amber-500/40 flex items-start gap-2 text-xs text-amber-200">
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>
                              Verified deposit balance is short by{' '}
                              <strong className="tabular-nums">
                                {formatCurrency(Math.max(0, totalFees - activeDepositBalanceUsd), { includeCode: true })}
                              </strong>
                              . Free promotional winnings ({formatCurrency(freeWinBalanceUsd, { includeCode: true })}) cannot settle vehicle shipping or documentation fees.
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                          <button
                            type="button"
                            onClick={onOpenDeposit}
                            className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs cursor-pointer"
                          >
                            Deposit Funds
                          </button>
                          <button
                            type="button"
                            disabled={submittingId === prize.id || !hasEnoughDeposit}
                            onClick={() => void handleConfirmAndPay(prize)}
                            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-45 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>
                              {submittingId === prize.id
                                ? 'Submitting for Verification...'
                                : `Confirm Address & Pay ${formatCurrency(totalFees)}`}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
};
