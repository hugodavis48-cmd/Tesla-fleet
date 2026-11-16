import React, { useMemo, useState } from 'react';
import { ShipmentRouteTelemetry, RouteWaypoint } from '../lib/wonShipmentTracking';
import { Compass, MapPin, Navigation, ShieldCheck, Truck } from 'lucide-react';

interface ShipmentRouteMapProps {
  telemetry: ShipmentRouteTelemetry;
  verifiedLabel?: string;
}

// Equirectangular projection into a 800 x 360 SVG canvas
function projectLonLat(lon: number, lat: number): { x: number; y: number } {
  const x = ((lon + 180) / 360) * 800;
  const y = ((90 - lat) / 180) * 360;
  return { x, y };
}

function buildQuadraticCurve(
  a: { x: number; y: number },
  b: { x: number; y: number },
  lift = 36
): { d: string; cx: number; cy: number } {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const arcOffset = Math.min(lift, Math.max(10, dist * 0.18));
  const cx = mx;
  const cy = Math.max(16, my - arcOffset);
  return {
    d: `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`,
    cx,
    cy,
  };
}

function pointOnQuadratic(
  a: { x: number; y: number },
  c: { cx: number; cy: number },
  b: { x: number; y: number },
  t: number
) {
  const clamped = Math.max(0, Math.min(1, t));
  const inv = 1 - clamped;
  return {
    x: inv * inv * a.x + 2 * inv * clamped * c.cx + clamped * clamped * b.x,
    y: inv * inv * a.y + 2 * inv * clamped * c.cy + clamped * clamped * b.y,
  };
}

// Simplified stylized world continent outlines in 800x360 equirectangular coordinates
const CONTINENT_PATHS = [
  // North America
  'M 65 55 L 155 48 L 210 68 L 240 96 L 215 128 L 188 148 L 168 164 L 144 148 L 122 126 L 88 92 Z',
  // South America
  'M 218 175 L 265 186 L 288 220 L 270 268 L 245 316 L 228 310 L 218 248 L 208 205 Z',
  // Europe
  'M 365 58 L 435 50 L 462 72 L 448 102 L 415 110 L 382 104 L 368 82 Z',
  // Africa
  'M 372 118 L 442 118 L 478 158 L 472 218 L 438 268 L 412 252 L 395 198 L 366 164 Z',
  // Asia
  'M 455 52 L 645 48 L 712 88 L 692 142 L 625 162 L 560 154 L 515 138 L 472 114 Z',
  // Southeast Asia / Japan islands
  'M 695 104 L 714 100 L 718 118 L 698 124 Z M 618 166 L 654 168 L 664 186 L 626 184 Z',
  // Australia
  'M 648 220 L 718 222 L 732 256 L 705 282 L 656 272 L 642 246 Z',
];

export const ShipmentRouteMap: React.FC<ShipmentRouteMapProps> = ({
  telemetry,
  verifiedLabel = 'Verified Dispatch Telemetry',
}) => {
  const [selectedWaypoint, setSelectedWaypoint] = useState<RouteWaypoint['id'] | null>(null);
  const [zoomMode, setZoomMode] = useState<'corridor' | 'global'>('corridor');

  const geometry = useMemo(() => {
    const pts = telemetry.waypoints.map((w) => ({
      waypoint: w,
      ...projectLonLat(w.lon, w.lat),
    }));

    const [p0, p1, p2] = pts;
    const leg1 = buildQuadraticCurve(p0, p1, 28);
    const leg2 = buildQuadraticCurve(p1, p2, 34);

    // Carrier position on the two-leg quadratic curve
    const t = telemetry.progressFraction;
    const carrierPos =
      t <= 0.5
        ? pointOnQuadratic(p0, leg1, p1, t * 2)
        : pointOnQuadratic(p1, leg2, p2, (t - 0.5) * 2);

    // Compute tight corridor viewBox centered on the 3 waypoints
    const xs = pts.map((p) => p.x).concat(carrierPos.x);
    const ys = pts.map((p) => p.y).concat(carrierPos.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const padX = Math.max(95, (maxX - minX) * 0.45);
    const padY = Math.max(60, (maxY - minY) * 0.55);
    let vx = Math.max(0, minX - padX);
    let vy = Math.max(0, minY - padY);
    let vw = Math.min(800 - vx, maxX - minX + padX * 2);
    let vh = Math.min(360 - vy, maxY - minY + padY * 2);

    // Maintain roughly 800:360 aspect ratio so map never distorts
    const targetRatio = 800 / 360;
    if (vw / vh < targetRatio) {
      const nextW = Math.min(800, vh * targetRatio);
      vx = Math.max(0, Math.min(800 - nextW, vx - (nextW - vw) / 2));
      vw = nextW;
    } else {
      const nextH = Math.min(360, vw / targetRatio);
      vy = Math.max(0, Math.min(360 - nextH, vy - (nextH - vh) / 2));
      vh = nextH;
    }

    const corridorViewBox = `${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`;
    const activeWaypoint =
      telemetry.waypoints.find((w) => w.id === selectedWaypoint) ||
      telemetry.waypoints[t >= 1 ? 2 : t >= 0.5 ? 1 : 0];

    return { pts, leg1, leg2, carrierPos, corridorViewBox, activeWaypoint };
  }, [telemetry, selectedWaypoint]);

  const viewBox = zoomMode === 'corridor' ? geometry.corridorViewBox : '0 0 800 360';

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
      {/* Top Toolbar */}
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-heading font-bold text-white">Verified Route Map</span>
          <span className="text-zinc-600" aria-hidden="true">·</span>
          <span className="text-emerald-400 font-medium">{verifiedLabel}</span>
          <span className="text-zinc-600" aria-hidden="true">·</span>
          <span className="font-mono text-zinc-300 tabular-nums">
            {telemetry.distanceKm.toLocaleString()} km corridor
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-950 border border-zinc-800">
          <button
            type="button"
            onClick={() => setZoomMode('corridor')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap cursor-pointer transition ${
              zoomMode === 'corridor'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Route Corridor
          </button>
          <button
            type="button"
            onClick={() => setZoomMode('global')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap cursor-pointer transition ${
              zoomMode === 'global'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Global View
          </button>
        </div>
      </div>

      {/* SVG Route Map Canvas */}
      <div className="relative bg-[#070b12]">
        <svg
          viewBox={viewBox}
          role="img"
          aria-label={`Shipment route map for ${telemetry.vehicleTitle} (${telemetry.trackingNumber})`}
          className="w-full h-60 sm:h-72 block select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="routeGridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#182234"
                strokeWidth="0.6"
              />
            </pattern>
            <linearGradient id="completedRouteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Subtle coordinate grid */}
          <rect x="0" y="0" width="800" height="360" fill="url(#routeGridPattern)" />

          {/* Continental land silhouettes */}
          <g fill="#121a28" stroke="#223049" strokeWidth="0.9">
            {CONTINENT_PATHS.map((d, idx) => (
              <path key={idx} d={d} />
            ))}
          </g>

          {/* Base full dashed route */}
          <path
            d={geometry.leg1.d}
            fill="none"
            stroke="#334155"
            strokeWidth="2.2"
            strokeDasharray="5 5"
          />
          <path
            d={geometry.leg2.d}
            fill="none"
            stroke="#334155"
            strokeWidth="2.2"
            strokeDasharray="5 5"
          />

          {/* Completed route segments based on shipment progress */}
          {telemetry.progressFraction > 0 && (
            <path
              d={geometry.leg1.d}
              fill="none"
              stroke="url(#completedRouteGrad)"
              strokeWidth="2.8"
              pathLength={100}
              strokeDasharray={`${Math.min(100, telemetry.progressFraction * 200)} 100`}
            />
          )}
          {telemetry.progressFraction > 0.5 && (
            <path
              d={geometry.leg2.d}
              fill="none"
              stroke="url(#completedRouteGrad)"
              strokeWidth="2.8"
              pathLength={100}
              strokeDasharray={`${Math.min(100, (telemetry.progressFraction - 0.5) * 200)} 100`}
            />
          )}

          {/* Waypoint nodes */}
          {geometry.pts.map(({ waypoint, x, y }, idx) => {
            const isSelected = selectedWaypoint === waypoint.id;
            const nodeFill = waypoint.reached ? '#10b981' : '#0f172a';
            const nodeStroke = waypoint.reached ? '#34d399' : '#64748b';
            return (
              <g
                key={waypoint.id}
                onClick={() => setSelectedWaypoint(waypoint.id)}
                className="cursor-pointer"
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 8.5 : 6.5}
                  fill={nodeFill}
                  stroke={nodeStroke}
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y - 12}
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="9.5"
                  fontWeight="600"
                  style={{ fontFamily: 'monospace' }}
                >
                  {idx + 1}. {waypoint.cityLabel.split(',')[0]}
                </text>
              </g>
            );
          })}

          {/* Live Carrier Position Marker */}
          <g transform={`translate(${geometry.carrierPos.x}, ${geometry.carrierPos.y})`}>
            <circle r="13" fill="#06b6d4" fillOpacity="0.18" stroke="#22d3ee" strokeWidth="1.2" />
            <circle r="6" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.8" />
          </g>
        </svg>

        {/* Bottom-left live coordinates & active leg summary */}
        <div className="px-4 py-2.5 border-t border-zinc-800/90 bg-zinc-950/95 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-2 text-zinc-300">
            <Truck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-white">{telemetry.stageLabel}</span>
            <span className="text-zinc-600" aria-hidden="true">·</span>
            <span className="font-mono text-zinc-400 tabular-nums">
              {telemetry.currentLat.toFixed(2)}°, {telemetry.currentLon.toFixed(2)}°
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-zinc-400 tabular-nums">
            <span>ETA: <strong className="text-emerald-400">{telemetry.etaLabel}</strong></span>
            <span>Route Progress: <strong className="text-white">{telemetry.progressPercent}%</strong></span>
          </div>
        </div>
      </div>

      {/* Waypoint Breakdown Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800 border-t border-zinc-800 bg-zinc-900/30">
        {telemetry.waypoints.map((wp) => {
          const active = geometry.activeWaypoint.id === wp.id;
          return (
            <button
              key={wp.id}
              type="button"
              onClick={() => setSelectedWaypoint(wp.id)}
              className={`p-3.5 text-left transition cursor-pointer ${
                active ? 'bg-zinc-900/80' : 'hover:bg-zinc-900/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                  {wp.id === 'origin' ? (
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  ) : wp.id === 'hub' ? (
                    <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                  )}
                  <span>{wp.title}</span>
                </span>
                <span
                  className={`text-[10px] font-mono font-semibold ${
                    wp.reached ? 'text-emerald-400' : 'text-zinc-500'
                  }`}
                >
                  {wp.reached ? 'Reached' : 'Upcoming'}
                </span>
              </div>
              <div className="text-xs font-semibold text-white mt-1 truncate">{wp.cityLabel}</div>
              <div className="text-[11px] text-zinc-400 mt-0.5 truncate">{wp.detail}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
