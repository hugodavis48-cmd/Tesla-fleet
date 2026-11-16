import React from 'react';
import { WonPrizeItem } from '../types';
import { getWonVehicleShipmentProgress } from '../lib/wonShipmentTracking';
import { CheckCircle2, Clock, Map as MapIcon, ShieldCheck, Truck } from 'lucide-react';

interface ShipmentProgressBarProps {
  prize: WonPrizeItem;
  onOpenTrackingMap?: (trackingNumber: string) => void;
  compact?: boolean;
}

export const ShipmentProgressBar: React.FC<ShipmentProgressBarProps> = ({
  prize,
  onOpenTrackingMap,
  compact = false,
}) => {
  const progress = getWonVehicleShipmentProgress(prize);
  const fillColor = progress.isAdminVerified ? 'bg-emerald-500' : 'bg-amber-500';

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3.5">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">Shipment Status</span>
            <span className="text-zinc-600" aria-hidden="true">·</span>
            <span
              className={`text-xs font-semibold ${
                progress.isAdminVerified ? 'text-emerald-400' : 'text-amber-300'
              }`}
            >
              {progress.statusTitle}
            </span>
          </div>
          {!compact && (
            <p className="text-[11px] text-zinc-400">{progress.statusSummary}</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-mono font-bold text-zinc-200 tabular-nums">
            {progress.progressPercent}% Complete
          </span>
          {progress.trackingUnlocked && prize.trackingNumber && onOpenTrackingMap && (
            <button
              type="button"
              onClick={() => onOpenTrackingMap(prize.trackingNumber!)}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>View Route Map</span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Progress Track */}
      <div
        role="progressbar"
        aria-label={`Shipment progress for ${prize.title}`}
        aria-valuenow={progress.progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="relative h-2 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${fillColor}`}
          style={{ width: `${progress.progressPercent}%` }}
        />
      </div>

      {/* 4 Stage Steps: Processing -> Verified -> Shipped -> Delivered */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
        {progress.milestones.map((step, idx) => {
          const isCompleted = step.completed;
          const isCurrent = step.current;

          let icon = <Clock className="w-3.5 h-3.5 text-zinc-500" />;
          if (isCompleted) {
            icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
          } else if (step.key === 'verified') {
            icon = <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />;
          } else if (step.key === 'shipped') {
            icon = <Truck className="w-3.5 h-3.5 text-zinc-500" />;
          }

          return (
            <div
              key={step.key}
              className={`p-2.5 rounded-lg border transition ${
                isCurrent
                  ? progress.isAdminVerified
                    ? 'border-emerald-500/45 bg-emerald-950/20'
                    : 'border-amber-500/45 bg-amber-950/20'
                  : isCompleted
                  ? 'border-zinc-800 bg-zinc-900/50'
                  : 'border-zinc-800/70 bg-zinc-950'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <span
                  className={`text-[11px] font-semibold ${
                    isCompleted || isCurrent ? 'text-white' : 'text-zinc-500'
                  }`}
                >
                  {idx + 1}. {step.label}
                </span>
                {icon}
              </div>
              <p
                className={`text-[10px] mt-1 truncate ${
                  isCompleted
                    ? 'text-emerald-300'
                    : isCurrent
                    ? 'text-amber-300'
                    : 'text-zinc-500'
                }`}
              >
                {step.sublabel}
              </p>
              {step.timestamp && (
                <span className="text-[10px] font-mono text-zinc-500 block mt-0.5 tabular-nums">
                  {step.timestamp}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
