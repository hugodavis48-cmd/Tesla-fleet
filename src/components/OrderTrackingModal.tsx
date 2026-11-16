import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { VehicleOrder, WonPrizeItem } from '../types';
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  X,
  MessageCircle,
  Copy,
  Check,
  Car,
  Package,
  Trophy,
} from 'lucide-react';
import { ShipmentRouteMap } from './ShipmentRouteMap';
import { ShipmentProgressBar } from './ShipmentProgressBar';
import {
  isWonPrizeAdminVerified,
  resolveVehicleOrderRouteTelemetry,
  resolveWonPrizeRouteTelemetry,
} from '../lib/wonShipmentTracking';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrackingQuery?: string;
  onOpenDeposit?: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialTrackingQuery = '',
}) => {
  const { vehicleOrders, wonPrizes, currentUser, showToast } = useApp();

  const approvedWonShipments = useMemo(() => {
    return wonPrizes.filter((p) => {
      if (!p.trackingNumber) return false;
      const isApproved = isWonPrizeAdminVerified(p);
      if (!isApproved) return false;
      if (!currentUser) return false;
      if (currentUser.role === 'admin') return true;
      return (
        p.userId === currentUser.id ||
        p.userEmail?.toLowerCase() === currentUser.email?.toLowerCase() ||
        (currentUser.id === 'usr-alex-001' && p.userId === 'usr-apex-001')
      );
    });
  }, [wonPrizes, currentUser]);

  const [searchQuery, setSearchQuery] = useState(initialTrackingQuery);
  const [selectedOrder, setSelectedOrder] = useState<VehicleOrder | null>(vehicleOrders[0] || null);
  const [selectedWonPrize, setSelectedWonPrize] = useState<WonPrizeItem | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const lookupTracking = async (rawQuery: string, notifyIfMissing: boolean) => {
    const q = rawQuery.trim().toLowerCase();
    if (!q) return;

    const foundPrize = approvedWonShipments.find(
      (p) =>
        (p.trackingNumber && p.trackingNumber.toLowerCase() === q) ||
        (p.trackingNumber && p.trackingNumber.toLowerCase().includes(q)) ||
        p.id.toLowerCase() === q ||
        (p.vinAssigned && p.vinAssigned.toLowerCase().includes(q))
    );
    if (foundPrize) {
      setSelectedWonPrize(foundPrize);
      setSelectedOrder(null);
      if (notifyIfMissing) showToast(`Found shipment tracking ${foundPrize.trackingNumber}!`, 'success');
      return;
    }

    const foundOrder = vehicleOrders.find(
      (o) =>
        o.trackingNumber.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.vinAssigned?.toLowerCase().includes(q)
    );
    if (foundOrder) {
      setSelectedOrder(foundOrder);
      setSelectedWonPrize(null);
      if (notifyIfMissing) showToast(`Found tracking for order ${foundOrder.id}!`, 'success');
      return;
    }

    setIsSearching(true);
    try {
      const tok = typeof window !== 'undefined' ? localStorage.getItem('apex_session_token') : null;
      const res = await fetch(`/api/tracking/${encodeURIComponent(rawQuery.trim())}`, {
        headers: tok ? { Authorization: `Bearer ${tok}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.prize) {
          setSelectedWonPrize(data.prize);
          setSelectedOrder(null);
          if (notifyIfMissing) showToast(`Loaded verified shipment ${data.prize.trackingNumber}!`, 'success');
          return;
        }
      }
      if (notifyIfMissing) {
        showToast(
          `No approved shipment found matching "${rawQuery}". Check tracking number or admin approval status.`,
          'error'
        );
      }
    } catch {
      if (notifyIfMissing) {
        showToast(`No shipment found matching "${rawQuery}".`, 'error');
      }
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (initialTrackingQuery.trim()) {
      setSearchQuery(initialTrackingQuery);
      void lookupTracking(initialTrackingQuery, false);
    } else if (approvedWonShipments.length > 0 && !selectedOrder && !selectedWonPrize) {
      setSelectedWonPrize(approvedWonShipments[0]);
      setSelectedOrder(null);
    } else if (vehicleOrders.length > 0 && !selectedOrder && !selectedWonPrize) {
      setSelectedOrder(vehicleOrders[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialTrackingQuery]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void lookupTracking(searchQuery, true);
  };

  const handleCopyTracking = (trackNum: string) => {
    navigator.clipboard?.writeText(trackNum).catch(() => {});
    setCopiedTracking(true);
    showToast(`Tracking number ${trackNum} copied!`, 'success');
    setTimeout(() => setCopiedTracking(false), 2500);
  };

  // Order Stepper stages
  const trackingStages = [
    { key: 'confirmed', label: 'Order Confirmed', desc: 'Payment Verified & Title Queued' },
    { key: 'carrier_assigned', label: 'Carrier Assigned', desc: 'Enclosed Transporter & VIN Allocated' },
    { key: 'in_transit', label: 'In Transit', desc: 'Highway Transporter Telemetry Active' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Regional Dispatch to Driveway' },
    { key: 'delivered', label: 'Delivered', desc: 'Handed Over & 7-Day Trial Active' },
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 0;
      case 'carrier_assigned':
        return 1;
      case 'in_transit':
        return 2;
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentStageIndex = selectedOrder ? getStageIndex(selectedOrder.status) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center">
              <Truck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-white">
                Nationwide &amp; Global Enclosed Delivery Tracking
              </h3>
              <p className="text-xs text-zinc-400">
                Real-time carrier telemetry for showroom vehicle orders and admin-approved won vehicles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Tracking Number (e.g. APX-EXP-..., APX-TRK-...) or Order ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md shadow-cyan-950/40 cursor-pointer"
            >
              {isSearching ? 'Locating...' : 'Track Shipment'}
            </button>
          </form>

          {/* Quick Shipment Selector (Vehicle Orders + Approved Won Vehicles) */}
          {(vehicleOrders.length > 0 || approvedWonShipments.length > 0) && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Active Vehicle Shipments ({vehicleOrders.length + approvedWonShipments.length})
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {approvedWonShipments.map((prize) => {
                  const isSelected = selectedWonPrize?.id === prize.id;
                  return (
                    <button
                      key={prize.id}
                      type="button"
                      onClick={() => {
                        setSelectedWonPrize(prize);
                        setSelectedOrder(null);
                        setSearchQuery(prize.trackingNumber || '');
                      }}
                      className={`px-3 py-2 rounded-xl text-left border transition shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 text-white'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>{prize.modelOrSku || prize.title}</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-normal">PRIZE</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                        {prize.trackingNumber}
                      </span>
                    </button>
                  );
                })}
                {vehicleOrders.map((ord) => {
                  const isSelected = selectedOrder?.id === ord.id;
                  return (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => {
                        setSelectedOrder(ord);
                        setSelectedWonPrize(null);
                        setSearchQuery(ord.trackingNumber);
                      }}
                      className={`px-3 py-2 rounded-xl text-left border transition shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500 text-white'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Car className="w-3.5 h-3.5 text-red-500" />
                        <span>{ord.model}</span>
                        <span className="text-[10px] font-mono text-cyan-400 font-normal">#{ord.id.slice(-6)}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                        {ord.trackingNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Won Vehicle Shipment View */}
          {selectedWonPrize ? (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                      Admin-Verified Won Vehicle Dispatch Manifest
                    </span>
                    <h4 className="text-xl font-heading font-black text-white">
                      {selectedWonPrize.title}
                    </h4>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      Allocated VIN: <strong className="text-zinc-200">{selectedWonPrize.vinAssigned || 'Assigned'}</strong>
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Assigned Tracking #</span>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-mono font-bold text-emerald-400">
                        {selectedWonPrize.trackingNumber}
                      </span>
                      {selectedWonPrize.trackingNumber && (
                        <button
                          type="button"
                          onClick={() => handleCopyTracking(selectedWonPrize.trackingNumber!)}
                          className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                          title="Copy tracking"
                        >
                          {copiedTracking ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <ShipmentProgressBar prize={selectedWonPrize} compact />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 text-[10px] uppercase block font-semibold">Transporter Carrier</span>
                    <strong className="text-white block mt-0.5">
                      {selectedWonPrize.carrierName || 'Apex Bonded Enclosed EV Carrier'}
                    </strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 text-[10px] uppercase block font-semibold">Admin Payment Verification</span>
                    <strong className="text-emerald-400 block mt-0.5">
                      Verified {selectedWonPrize.verifiedAt ? selectedWonPrize.verifiedAt.slice(0, 10) : selectedWonPrize.paidAt?.slice(0, 10) || 'Approved'}
                    </strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 text-[10px] uppercase block font-semibold">Shipment Coverage</span>
                    <strong className="text-cyan-400 block mt-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Insured &amp; Title Bonded</span>
                    </strong>
                  </div>
                </div>
              </div>

              {/* Map-based Visual Representation (Unlocked after Admin Tracking Verification) */}
              {isWonPrizeAdminVerified(selectedWonPrize) && selectedWonPrize.trackingNumber ? (
                <ShipmentRouteMap
                  telemetry={resolveWonPrizeRouteTelemetry(selectedWonPrize)}
                  verifiedLabel="Admin Tracking Verified"
                />
              ) : (
                <div className="p-5 rounded-xl border border-amber-500/35 bg-amber-950/20 text-xs text-amber-200 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>
                    Route map visualization is locked until Admin verifies required payment and approves the assigned tracking number.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <h5 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>Confirmed Destination Dropoff</span>
                  </h5>
                  {selectedWonPrize.shippingAddress ? (
                    <div className="space-y-1 text-zinc-300">
                      <div className="font-semibold text-white">{selectedWonPrize.shippingAddress.fullName}</div>
                      <div>{selectedWonPrize.shippingAddress.street}</div>
                      <div>
                        {selectedWonPrize.shippingAddress.city}, {selectedWonPrize.shippingAddress.state}{' '}
                        {selectedWonPrize.shippingAddress.zipCode} —{' '}
                        <strong className="text-cyan-400">{selectedWonPrize.shippingAddress.country}</strong>
                      </div>
                      <div className="text-zinc-400 font-mono text-[11px] pt-1">
                        Contact: {selectedWonPrize.shippingAddress.phone}
                      </div>
                    </div>
                  ) : (
                    <p className="text-zinc-400">Regional delivery hub coordination active.</p>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <h5 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-400" />
                    <span>Verified Fee Settlement Summary</span>
                  </h5>
                  <div className="space-y-2 font-mono text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Prize Reference:</span>
                      <strong className="text-white">{selectedWonPrize.id}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Win Source:</span>
                      <span>{selectedWonPrize.source} ({selectedWonPrize.wonAt})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Settlement Method:</span>
                      <span className="text-emerald-400">Verified Deposits</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-zinc-800 font-bold text-sm">
                      <span className="text-white font-sans">Total Fees Settled:</span>
                      <span className="text-emerald-400 tabular-nums">
                        ${Number(selectedWonPrize.totalFeesUsd || 0).toLocaleString()} USD
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Carrier Transit Checkpoints &amp; Approval Logs</span>
                  </h5>
                  <span className="text-[10px] text-emerald-400 font-mono">Admin Verified Telemetry</span>
                </div>

                {selectedWonPrize.checkpoints && selectedWonPrize.checkpoints.length > 0 ? (
                  <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-zinc-800">
                    {selectedWonPrize.checkpoints.map((chk) => (
                      <div key={chk.id} className="relative flex items-start gap-4 pl-8 text-xs">
                        <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 -translate-x-1/2" />
                        <div className="flex-1 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <strong className="text-white font-semibold">{chk.title}</strong>
                            <span className="text-[10px] font-mono text-zinc-500">{chk.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400">{chk.location}</p>
                          {chk.note && (
                            <p className="text-[11px] text-zinc-300 font-mono bg-zinc-900/60 p-1.5 rounded">
                              {chk.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-zinc-500 text-xs">
                    Shipment approved by Admin. Carrier dispatch telemetry active for #{selectedWonPrize.trackingNumber}.
                  </div>
                )}
              </div>
            </div>
          ) : selectedOrder ? (
            <div className="space-y-6">
              {/* Primary Status Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                      Climate Enclosed Transporter Manifest
                    </span>
                    <h4 className="text-xl font-heading font-black text-white">
                      {selectedOrder.vehicleName}
                    </h4>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      Assigned VIN: <strong className="text-zinc-200">{selectedOrder.vinAssigned}</strong>
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Carrier Tracking #</span>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-mono font-bold text-emerald-400">
                        {selectedOrder.trackingNumber}
                      </span>
                      <button
                        onClick={() => handleCopyTracking(selectedOrder.trackingNumber)}
                        className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                        title="Copy tracking"
                      >
                        {copiedTracking ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Visual Stepper Bar */}
                <div className="py-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 relative">
                    {trackingStages.map((stage, idx) => {
                      const isComplete = idx <= currentStageIndex;
                      const isCurrent = idx === currentStageIndex;

                      return (
                        <div key={stage.key} className="space-y-1.5 text-center">
                          <div
                            className={`w-9 h-9 mx-auto rounded-xl flex items-center justify-center transition-all ${
                              isComplete
                                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                                : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                            }`}
                          >
                            {isComplete ? (
                              <CheckCircle2 className="w-5 h-5 font-bold" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </div>
                          <span
                            className={`text-xs font-bold block ${
                              isCurrent
                                ? 'text-cyan-400'
                                : isComplete
                                ? 'text-white'
                                : 'text-zinc-600'
                            }`}
                          >
                            {stage.label}
                          </span>
                          <span className="text-[10px] text-zinc-500 block leading-tight hidden sm:block">
                            {stage.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Key Telemetry Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 text-[10px] uppercase block font-semibold">Transporter Carrier</span>
                    <strong className="text-white block mt-0.5">
                      {selectedOrder.carrierName || 'Reliable Carriers Inc.'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 text-[10px] uppercase block font-semibold">Estimated Delivery</span>
                    <strong className="text-emerald-400 block mt-0.5">
                      {selectedOrder.estimatedDelivery || '3 - 5 Business Days'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 text-[10px] uppercase block font-semibold">Protection Guarantee</span>
                    <strong className="text-cyan-400 block mt-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>7-Day / 1,000-Mile 100% Refund</span>
                    </strong>
                  </div>
                </div>
              </div>

              {/* Map-based Visual Representation for Active Order Tracking */}
              <ShipmentRouteMap
                telemetry={resolveVehicleOrderRouteTelemetry(selectedOrder)}
                verifiedLabel="Carrier Tracking Active"
              />

              {/* Destination & Order Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Destination Dropoff Address */}
                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <h5 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>Driveway Destination Dropoff</span>
                  </h5>

                  <div className="space-y-1 text-zinc-300">
                    <div className="font-semibold text-white">{selectedOrder.shippingAddress.fullName}</div>
                    <div>{selectedOrder.shippingAddress.street}</div>
                    {selectedOrder.shippingAddress.apartmentOrSuite && (
                      <div>{selectedOrder.shippingAddress.apartmentOrSuite}</div>
                    )}
                    <div>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                    </div>
                    <div className="text-zinc-400 font-mono text-[11px] pt-1">
                      Contact: {selectedOrder.shippingAddress.phone}
                    </div>
                    {selectedOrder.shippingAddress.deliveryNotes && (
                      <div className="text-[11px] text-amber-400 bg-amber-950/30 border border-amber-500/20 p-2 rounded-xl mt-2">
                        Note: {selectedOrder.shippingAddress.deliveryNotes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial & Settlement Summary */}
                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <h5 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-yellow-400" />
                    <span>Order &amp; Payment Settlement</span>
                  </h5>

                  <div className="space-y-2 font-mono text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Order Reference:</span>
                      <strong className="text-white">{selectedOrder.id}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Date Placed:</span>
                      <span>{selectedOrder.orderedAt.substring(0, 10)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Payment Gateway:</span>
                      <span className="capitalize">{selectedOrder.paymentMethod.replace('_', ' ')}</span>
                    </div>
                    {selectedOrder.appliedCouponCode && (
                      <div className="flex justify-between text-yellow-400">
                        <span>Coupon ({selectedOrder.appliedCouponCode}):</span>
                        <span>-${selectedOrder.discountAppliedUsd?.toLocaleString()} USD</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-zinc-800 font-bold text-sm">
                      <span className="text-white font-sans">Total Paid:</span>
                      <span className="text-red-400">${selectedOrder.totalUsd.toLocaleString()} USD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carrier Milestone Checkpoint Logs */}
              <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Carrier Transit Checkpoints &amp; Dispatch Logs</span>
                  </h5>
                  <span className="text-[10px] text-emerald-400 font-mono">GPS Signal Active</span>
                </div>

                {selectedOrder.checkpoints && selectedOrder.checkpoints.length > 0 ? (
                  <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-zinc-800">
                    {selectedOrder.checkpoints.map((chk) => (
                      <div key={chk.id} className="relative flex items-start gap-4 pl-8 text-xs">
                        <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-cyan-500 border-2 border-zinc-950 -translate-x-1/2" />
                        <div className="flex-1 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <strong className="text-white font-semibold">{chk.title}</strong>
                            <span className="text-[10px] font-mono text-zinc-500">{chk.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400">{chk.location}</p>
                          {chk.note && (
                            <p className="text-[11px] text-zinc-300 font-mono bg-zinc-900/60 p-1.5 rounded">
                              {chk.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-zinc-500 text-xs">
                    Initial enclosed carrier dispatch queued. First checkpoint telemetry arrives within 12 hours.
                  </div>
                )}
              </div>

              {/* Direct Concierge Support Link */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Need Live Dispatch Support?</span>
                    <span className="text-zinc-400 text-[11px]">Connect directly with our 24/7 Apex VIP Transporter Concierge.</span>
                  </div>
                </div>

                <a
                  href={`https://wa.me/18005552739?text=${encodeURIComponent(
                    `Hello Apex Logistics Concierge, I am inquiring regarding vehicle shipment #${selectedOrder.id} (Tracking: ${selectedOrder.trackingNumber}, VIN: ${selectedOrder.vinAssigned}).`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shrink-0 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Dispatch</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500 text-xs space-y-3">
              <Truck className="w-12 h-12 text-zinc-700 mx-auto" />
              <h4 className="text-base font-bold text-white">Enter a Tracking Number Above</h4>
              <p className="max-w-md mx-auto text-zinc-400">
                Enter your carrier tracking number from Pending Shipments or your vehicle order confirmation once Admin has verified payment and approved delivery.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
