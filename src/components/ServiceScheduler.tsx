import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wrench,
  Truck,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Bot,
  AlertCircle,
  Car,
} from 'lucide-react';

interface ServiceSchedulerProps {
  onOpenDeposit: () => void;
  onOpenAiDiagnostics: (query?: string) => void;
  onNavigateToDashboard: () => void;
}

export const ServiceScheduler: React.FC<ServiceSchedulerProps> = ({
  onOpenDeposit,
  onOpenAiDiagnostics,
  onNavigateToDashboard,
}) => {
  const { vehicles, bookService, balances, showToast } = useApp();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || 'custom-model');
  const [customModel, setCustomModel] = useState<string>('Tesla Model S Plaid');
  const [selectedService, setSelectedService] = useState<{
    name: 'Maintenance Inspection' | 'High-Voltage Battery Diagnostics' | 'Drive Unit / Inverter Fix' | 'Full Body Vinyl Wrap' | 'Ceramic Paint Protection Film' | 'Custom Accessories & Aero' | 'Tire & Brake Service';
    price: number;
    description: string;
    duration: string;
  }>({
    name: 'High-Voltage Battery Diagnostics',
    price: 180,
    description: 'CAN bus deep packet analysis, individual cell impedance scan, degradation curve audit, and thermal pump cycling test.',
    duration: '1.5 Hours',
  });

  const [serviceMode, setServiceMode] = useState<'Apex Center Bay' | 'Mobile Ranger Dispatch'>('Apex Center Bay');
  const [scheduledDate, setScheduledDate] = useState<string>('2026-11-08');
  const [timeSlot, setTimeSlot] = useState<string>('10:00 AM');
  const [customerLocation, setCustomerLocation] = useState<string>('Apex Technology Center - Bay 3, Fremont, CA');
  const [technicianNotes, setTechnicianNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceOptions = [
    {
      name: 'High-Voltage Battery Diagnostics' as const,
      price: 180,
      description: 'CAN bus deep packet analysis, individual cell balance audit, degradation curve measurement, and thermal loop pressure testing.',
      duration: '1.5 Hours',
    },
    {
      name: 'Full Body Vinyl Wrap' as const,
      price: 2450,
      description: 'Aerospace-grade 3.2mil cast vinyl (3M 2080 / Avery) with edge tucking, trim disassembly, and ceramic topcoat protection.',
      duration: '2 Days',
    },
    {
      name: 'Ceramic Paint Protection Film' as const,
      price: 1850,
      description: '8mil self-healing TPU polyurethane shield applied to high-impact frontal or full body zones with hydrophobic ceramic sealing.',
      duration: '1 Day',
    },
    {
      name: 'Drive Unit / Inverter Fix' as const,
      price: 680,
      description: 'Silicon-carbide inverter telemetry diagnostics, pyrofuse status, oil filter replacement, and spline shaft lubrication.',
      duration: '3.5 Hours',
    },
    {
      name: 'Custom Accessories & Aero' as const,
      price: 650,
      description: 'Yoke steering wheel installation, dry carbon fiber track spoiler mount, forged rim balancing, and ambient lighting kit.',
      duration: '2 Hours',
    },
    {
      name: 'Tire & Brake Service' as const,
      price: 380,
      description: 'Acoustic foam tire balancing, regenerative braking caliper sliding pin lubrication, and DOT 5.1 high-temp brake fluid flush.',
      duration: '1 Hour',
    },
    {
      name: 'Maintenance Inspection' as const,
      price: 195,
      description: 'Comprehensive 48-point bumper-to-bumper Tesla check: HEPA cabin filtration, coolant health, suspension links, and firmware test.',
      duration: '1 Hour',
    },
  ];

  const handleBooking = () => {
    setIsSubmitting(true);

    const vehicleObj = vehicles.find((v) => v.id === selectedVehicleId);
    const vehicleName = vehicleObj ? `${vehicleObj.model} (${vehicleObj.trim})` : customModel;

    setTimeout(() => {
      bookService({
        vehicleId: vehicleObj?.id || `veh-${Date.now()}`,
        vehicleName,
        serviceType: selectedService.name,
        serviceMode,
        scheduledDate,
        timeSlot,
        location: serviceMode === 'Apex Center Bay' ? customerLocation : 'Client Specified Address (Mobile Ranger)',
        technicianNotes: technicianNotes || 'Standard service intake requested with telemetry scan.',
        totalCostUsd: selectedService.price,
        paidWith: 'Apex Dashboard Vault',
      });

      setIsSubmitting(false);
      onNavigateToDashboard();
    }, 1000);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Title & Diagnostic AI Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Wrench className="w-3.5 h-3.5" />
            <span>Tesla Certified Maintenance & Repair Scheduling</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white">
            SCHEDULE SERVICE & FIXES
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mt-1">
            Book certified master technicians at our specialized Apex Bays or request high-torque Mobile Ranger dispatch directly to your driveway.
          </p>
        </div>

        {/* Gemini AI Diagnostic button */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-zinc-950 border border-cyan-500/30 flex items-center justify-between gap-4 max-w-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-white text-xs">Unsure what fix your Tesla needs?</h4>
              <p className="text-[11px] text-zinc-400">Ask Gemini AI to analyze error codes or unusual noises</p>
            </div>
          </div>
          <button
            onClick={() => onOpenAiDiagnostics('Can you analyze my Tesla battery and suspension error codes?')}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shrink-0 transition"
          >
            Scan with AI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Setup */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Vehicle */}
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono font-bold text-red-400 tracking-wider">
                Step 01 / Select Vehicle
              </span>
              <span className="text-xs text-zinc-400">From your garage or model selector</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vehicles.map((v) => {
                const isSelected = selectedVehicleId === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`cursor-pointer p-4 rounded-2xl border transition flex items-center gap-3 ${
                      isSelected
                        ? 'bg-red-950/30 border-red-500 text-white shadow-lg shadow-red-950/20'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <img src={v.image} alt={v.model} className="w-14 h-14 object-cover rounded-xl shrink-0" />
                    <div className="min-w-0">
                      <h4 className="font-heading font-bold text-sm text-white truncate">{v.model}</h4>
                      <p className="text-xs text-zinc-400 truncate">{v.trim}</p>
                      <span className="text-[10px] font-mono text-zinc-500">VIN: {v.vin.substring(0, 10)}...</span>
                    </div>
                  </div>
                );
              })}

              <div
                onClick={() => setSelectedVehicleId('custom-model')}
                className={`cursor-pointer p-4 rounded-2xl border transition flex items-center gap-3 ${
                  selectedVehicleId === 'custom-model'
                    ? 'bg-red-950/30 border-red-500 text-white shadow-lg shadow-red-950/20'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                  <Car className="w-6 h-6 text-zinc-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-white block">Other / New Tesla Model</span>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="e.g. Cybertruck Cyberbeast"
                    className="w-full bg-black/60 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Choose Service & Fix Category */}
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono font-bold text-red-400 tracking-wider">
                Step 02 / Select Required Fix or Upgrade
              </span>
              <span className="text-xs text-zinc-400">All services backed by Apex 2-Year Warranty</span>
            </div>

            <div className="space-y-2.5">
              {serviceOptions.map((svc) => {
                const isSelected = selectedService.name === svc.name;
                return (
                  <div
                    key={svc.name}
                    onClick={() => setSelectedService(svc)}
                    className={`cursor-pointer p-4 rounded-2xl border transition flex items-start justify-between gap-4 ${
                      isSelected
                        ? 'bg-gradient-to-r from-red-950/40 to-zinc-900 border-red-500 shadow-md'
                        : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-sm text-white">{svc.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                          {svc.duration}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">{svc.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-heading font-bold text-base text-red-400">
                        ${svc.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">USD or Crypto</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Service Mode & Date/Time */}
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
            <span className="text-xs uppercase font-mono font-bold text-red-400 tracking-wider">
              Step 03 / Location & Dispatch Preference
            </span>

            {/* Mode selection buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setServiceMode('Apex Center Bay')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition ${
                  serviceMode === 'Apex Center Bay'
                    ? 'bg-red-950/40 border-red-500 text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Building2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-heading font-bold text-sm text-white">Apex Technology Center</h5>
                  <p className="text-xs text-zinc-400 mt-0.5">High-voltage hydraulic lifts, dust-free wrap cleanrooms, and lounge with Superchargers.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setServiceMode('Mobile Ranger Dispatch')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition ${
                  serviceMode === 'Mobile Ranger Dispatch'
                    ? 'bg-red-950/40 border-red-500 text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Truck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-heading font-bold text-white text-sm">Mobile Ranger Van</h5>
                  <p className="text-xs text-zinc-400 mt-0.5">Custom equipped service van dispatches directly to your home or office driveway.</p>
                </div>
              </button>
            </div>

            {/* Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Appointment Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Preferred Time Window</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="09:00 AM">09:00 AM - 11:00 AM</option>
                    <option value="11:30 AM">11:30 AM - 01:30 PM</option>
                    <option value="02:00 PM">02:00 PM - 04:00 PM</option>
                    <option value="04:30 PM">04:30 PM - 06:30 PM</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Specific instructions */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Special Technician Notes / Symptoms</label>
              <textarea
                value={technicianNotes}
                onChange={(e) => setTechnicianNotes(e.target.value)}
                placeholder="Mention any error codes, strange noises, steering pull, or custom wrap preferences..."
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5 sticky top-24">
            <h3 className="font-heading font-bold text-lg text-white border-b border-zinc-800 pb-3">
              Service Intake Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Selected Vehicle</span>
                <span className="text-white font-semibold">
                  {vehicles.find((v) => v.id === selectedVehicleId)?.model || customModel}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Service Package</span>
                <span className="text-white font-semibold">{selectedService.name}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Mode</span>
                <span className="text-white font-semibold">{serviceMode}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Date & Slot</span>
                <span className="text-white font-semibold">{scheduledDate} @ {timeSlot}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Estimated Duration</span>
                <span className="text-white font-semibold">{selectedService.duration}</span>
              </div>
            </div>

            {/* Price Total */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Total Fixed Quote:</span>
                <span className="font-heading font-black text-2xl text-red-400">
                  ${selectedService.price.toLocaleString()} USD
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-zinc-500">
                <span>Crypto Equivalent:</span>
                <span>≈ {selectedService.price} USDT / {(selectedService.price / 91400).toFixed(4)} BTC</span>
              </div>
            </div>

            {/* Wallet Balance check */}
            <div className="p-3 rounded-xl bg-black/60 border border-zinc-800 text-xs flex items-center justify-between">
              <div>
                <span className="text-zinc-400 block text-[10px]">Your Vault Balance</span>
                <span className="font-mono font-bold text-emerald-400">${balances.usd.toFixed(2)}</span>
              </div>
              {balances.usd < selectedService.price && (
                <button
                  type="button"
                  onClick={onOpenDeposit}
                  className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px]"
                >
                  + Deposit Crypto
                </button>
              )}
            </div>

            {/* Booking Confirmation CTA */}
            <button
              onClick={handleBooking}
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-heading font-bold text-sm shadow-xl shadow-red-950/60 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Confirming Service Dispatch...</span>
              ) : (
                <>
                  <span>Confirm Appointment & Track Live</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Real-time GPS ranger tracking & technician camera feed enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
