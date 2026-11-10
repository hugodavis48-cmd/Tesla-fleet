import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RENTAL_FLEET } from '../data/mockData';
import { RentalVehicle } from '../types';
import { Car, Zap, Gauge, BatteryCharging, Calendar, CheckCircle2, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

interface RentalFleetProps {
  onOpenDeposit: () => void;
  onNavigateToDashboard: () => void;
}

export const RentalFleet: React.FC<RentalFleetProps> = ({ onOpenDeposit, onNavigateToDashboard }) => {
  const { rentVehicle, balances } = useApp();
  const [selectedRental, setSelectedRental] = useState<RentalVehicle | null>(null);
  const [rentalDays, setRentalDays] = useState<number>(3);
  const [startDate, setStartDate] = useState<string>('2026-11-09');

  const handleOpenBooking = (vehicle: RentalVehicle) => {
    setSelectedRental(vehicle);
  };

  const handleConfirmReservation = () => {
    if (!selectedRental) return;
    const success = rentVehicle(selectedRental, rentalDays, startDate);
    if (success) {
      setSelectedRental(null);
      onNavigateToDashboard();
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-600/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <Car className="w-3.5 h-3.5" />
          <span>Apex Luxury & Exotic Tesla Fleet</span>
        </div>
        <h2 className="font-heading font-black text-3xl sm:text-5xl text-white">
          EXPERIENCE HIGH-PERFORMANCE TESLAS
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base">
          Rent the 845 HP Cybertruck Cyberbeast, Roadster Founders Edition, or 1,020 HP Model S Plaid. Every rental includes unlimited Supercharging and Full Self-Driving (Supervised).
        </p>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RENTAL_FLEET.map((vehicle) => (
          <div
            key={vehicle.id}
            className="group rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 hover:border-red-500/50 shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Vehicle Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <img
                  src={vehicle.image}
                  alt={vehicle.model}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

                {/* Rate Tag */}
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-zinc-700 text-right">
                  <span className="font-heading font-black text-lg text-white">
                    ${vehicle.dailyRateUsd}
                  </span>
                  <span className="text-[10px] text-zinc-400 block -mt-1">/ day</span>
                </div>

                <div className="absolute bottom-3 left-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600/80 text-white text-[10px] font-bold uppercase tracking-wider">
                    {vehicle.year} {vehicle.model}
                  </span>
                  <h3 className="font-heading font-bold text-lg text-white mt-1">
                    {vehicle.trim}
                  </h3>
                </div>
              </div>

              {/* Specs Bar */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">0-60 MPH</span>
                    <span className="text-xs font-bold text-white">{vehicle.zeroToSixty}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">RANGE</span>
                    <span className="text-xs font-bold text-cyan-400">{vehicle.rangeMiles} mi</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">POWER</span>
                    <span className="text-xs font-bold text-red-400">{vehicle.horsepower} HP</span>
                  </div>
                </div>

                {/* Features Checklist */}
                <div className="space-y-1.5 text-xs text-zinc-400">
                  {vehicle.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Booking & Social Share */}
            <div className="p-5 pt-0 space-y-2">
              <button
                onClick={() => handleOpenBooking(vehicle)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-heading font-bold text-xs shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Reserve {vehicle.model}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1 pt-1 font-mono">
                <span>Share Fleet Model:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const url = encodeURIComponent(window.location.href);
                      const text = encodeURIComponent(`Rent this ${vehicle.model} (${vehicle.trim}) on Apex Tesla Hub!`);
                      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
                    }}
                    title="Share on X"
                    className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 cursor-pointer font-bold"
                  >
                    𝕏
                  </button>
                  <button
                    onClick={() => {
                      const url = encodeURIComponent(window.location.href);
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                    }}
                    title="Share on Facebook"
                    className="px-1 py-0.5 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 cursor-pointer font-bold"
                  >
                    FB
                  </button>
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(`Check out this Tesla rental on Apex Hub: ${vehicle.model} (${vehicle.trim}) for $${vehicle.dailyRateUsd}/day! ${window.location.href}`);
                      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                    }}
                    title="Share on WhatsApp"
                    className="px-1.5 py-0.5 rounded bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 cursor-pointer font-bold text-[10px]"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(`Rent this ${vehicle.model} on Apex Tesla Hub: ${window.location.href}`);
                      window.open(`https://threads.net/intent/post?text=${text}`, '_blank');
                    }}
                    title="Share on Threads"
                    className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer font-bold"
                  >
                    Threads
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reservation Modal */}
      {selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-red-400 font-bold tracking-wider">
                  Tesla Reservation
                </span>
                <h3 className="font-heading font-bold text-xl text-white">
                  {selectedRental.model} {selectedRental.trim}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRental(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Dates & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Pick-up Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Rental Duration</label>
                  <select
                    value={rentalDays}
                    onChange={(e) => setRentalDays(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value={1}>1 Day (24 Hours)</option>
                    <option value={2}>2 Days (Weekend Express)</option>
                    <option value={3}>3 Days</option>
                    <option value={7}>7 Days (Full Week Special)</option>
                    <option value={14}>14 Days (Extended Plaid)</option>
                  </select>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Daily Rate:</span>
                  <span className="text-white">${selectedRental.dailyRateUsd} / day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Days:</span>
                  <span className="text-white">{rentalDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Supercharging & Insurance:</span>
                  <span className="text-emerald-400 font-semibold">Included (Complimentary)</span>
                </div>
                <div className="border-t border-zinc-800 pt-2 flex justify-between items-center text-sm">
                  <span className="font-heading font-bold text-white">Total Reservation Cost:</span>
                  <span className="font-heading font-black text-xl text-red-400">
                    ${(selectedRental.dailyRateUsd * rentalDays).toLocaleString()} USD
                  </span>
                </div>
              </div>

              {/* Balance status */}
              <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-black/60 border border-zinc-800">
                <span className="text-zinc-400">Available Vault Balance:</span>
                <span className="font-bold text-white">${balances.usd.toFixed(2)} USD</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {balances.usd < selectedRental.dailyRateUsd * rentalDays ? (
                  <button
                    onClick={() => {
                      setSelectedRental(null);
                      onOpenDeposit();
                    }}
                    className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-heading font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <span>Deposit Crypto (USDT, BTC, XRP, BNB) to Reserve</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleConfirmReservation}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-heading font-bold text-xs shadow-xl shadow-red-950/50 flex items-center justify-center gap-2"
                  >
                    <span>Instant Confirm & Add to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
