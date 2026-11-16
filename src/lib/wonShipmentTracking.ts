import { VehicleOrder, WonPrizeItem } from '../types';

export type WonShipmentStageKey = 'processing' | 'verified' | 'shipped' | 'delivered';

export interface WonShipmentMilestone {
  key: WonShipmentStageKey;
  label: string;
  sublabel: string;
  completed: boolean;
  current: boolean;
  timestamp?: string;
}

export interface WonShipmentProgress {
  stageKey: WonShipmentStageKey;
  stageIndex: number; // -1 if awaiting_details (0% before processing), 0..3 for stages
  progressPercent: number;
  statusTitle: string;
  statusSummary: string;
  isAdminVerified: boolean;
  trackingUnlocked: boolean;
  milestones: WonShipmentMilestone[];
}

export function isWonPrizeAdminVerified(prize: WonPrizeItem): boolean {
  return (
    Boolean(prize.adminApprovedForShipment) ||
    Boolean(prize.paymentVerifiedByAdmin && prize.shippingStatus !== 'awaiting_details' && prize.shippingStatus !== 'fees_paid_processing') ||
    prize.shippingStatus === 'approved' ||
    prize.shippingStatus === 'documentation_ready' ||
    prize.shippingStatus === 'shipped' ||
    prize.shippingStatus === 'delivered'
  );
}

export function getWonVehicleShipmentProgress(prize: WonPrizeItem): WonShipmentProgress {
  const isVerified = isWonPrizeAdminVerified(prize);
  const trackingUnlocked = isVerified && Boolean(prize.trackingNumber);
  const status = prize.shippingStatus || 'awaiting_details';

  let stageKey: WonShipmentStageKey = 'processing';
  let stageIndex = 0;
  let progressPercent = 10;
  let statusTitle = 'Awaiting Address & Fee Settlement';
  let statusSummary = 'Confirm your shipping address and processing fees to enter logistics processing.';

  if (status === 'delivered') {
    stageKey = 'delivered';
    stageIndex = 3;
    progressPercent = 100;
    statusTitle = 'Delivered';
    statusSummary = `Vehicle handed over at ${prize.shippingAddress?.city || 'destination'}.`;
  } else if (status === 'shipped') {
    stageKey = 'shipped';
    stageIndex = 2;
    progressPercent = 78;
    statusTitle = 'Shipped';
    statusSummary = `Dispatched via ${prize.carrierName || 'Apex Enclosed Carrier'} (${prize.trackingNumber || 'Tracking Active'}).`;
  } else if (isVerified || status === 'approved' || status === 'documentation_ready') {
    stageKey = 'verified';
    stageIndex = 1;
    progressPercent = status === 'documentation_ready' ? 58 : 50;
    statusTitle = status === 'documentation_ready' ? 'Verified · Export Docs Ready' : 'Verified · Approved for Dispatch';
    statusSummary = `Payment verified by Admin${prize.trackingNumber ? ` · Tracking #${prize.trackingNumber} active` : ''}.`;
  } else if (prize.feesPaid || status === 'fees_paid_processing') {
    stageKey = 'processing';
    stageIndex = 0;
    progressPercent = 25;
    statusTitle = 'Processing';
    statusSummary = 'Address and fee payment submitted. Pending Admin verification and tracking release.';
  }

  const paidDate = prize.paidAt ? String(prize.paidAt).slice(0, 10) : undefined;
  const verifiedDate = prize.verifiedAt ? String(prize.verifiedAt).slice(0, 10) : undefined;

  const milestones: WonShipmentMilestone[] = [
    {
      key: 'processing',
      label: 'Processing',
      sublabel: prize.feesPaid ? 'Fees & Address Logged' : 'Awaiting Details',
      completed: Boolean(prize.feesPaid) || isVerified || stageIndex > 0,
      current: stageIndex === 0,
      timestamp: paidDate,
    },
    {
      key: 'verified',
      label: 'Verified',
      sublabel: isVerified ? 'Admin Approved' : 'Payment Check Pending',
      completed: isVerified && stageIndex >= 1,
      current: stageIndex === 1,
      timestamp: verifiedDate,
    },
    {
      key: 'shipped',
      label: 'Shipped',
      sublabel: stageIndex >= 2 ? 'Carrier In Transit' : 'Awaiting Dispatch',
      completed: stageIndex >= 2,
      current: stageIndex === 2,
      timestamp:
        prize.checkpoints?.find((c) => c.status === 'shipped')?.timestamp?.slice(0, 10),
    },
    {
      key: 'delivered',
      label: 'Delivered',
      sublabel: stageIndex === 3 ? 'Completed Dropoff' : 'Final Handover',
      completed: stageIndex === 3,
      current: stageIndex === 3,
      timestamp:
        prize.checkpoints?.find((c) => c.status === 'delivered')?.timestamp?.slice(0, 10),
    },
  ];

  return {
    stageKey,
    stageIndex,
    progressPercent,
    statusTitle,
    statusSummary,
    isAdminVerified: isVerified,
    trackingUnlocked,
    milestones,
  };
}

export interface RouteWaypoint {
  id: 'origin' | 'hub' | 'destination';
  title: string;
  cityLabel: string;
  lat: number;
  lon: number;
  reached: boolean;
  detail: string;
}

export interface ShipmentRouteTelemetry {
  trackingNumber: string;
  vehicleTitle: string;
  carrierName: string;
  progressFraction: number; // 0..1 along route
  progressPercent: number;
  stageLabel: string;
  etaLabel: string;
  distanceKm: number;
  currentLat: number;
  currentLon: number;
  waypoints: [RouteWaypoint, RouteWaypoint, RouteWaypoint];
}

const COUNTRY_COORDS: Record<string, { lat: number; lon: number; hubCity: string; hubLat: number; hubLon: number }> = {
  'United States': { lat: 37.77, lon: -122.41, hubCity: 'Houston Logistics Hub, TX', hubLat: 29.76, hubLon: -95.36 },
  Canada: { lat: 43.65, lon: -79.38, hubCity: 'Detroit / Windsor Border Hub', hubLat: 42.33, hubLon: -83.05 },
  'United Kingdom': { lat: 51.51, lon: -0.13, hubCity: 'Port of Southampton EV Terminal', hubLat: 50.90, hubLon: -1.40 },
  Germany: { lat: 52.52, lon: 13.40, hubCity: 'Bremerhaven Auto Port', hubLat: 53.55, hubLon: 8.58 },
  France: { lat: 48.86, lon: 2.35, hubCity: 'Le Havre RoRo Terminal', hubLat: 49.49, hubLon: 0.11 },
  Netherlands: { lat: 52.37, lon: 4.90, hubCity: 'Port of Rotterdam Terminal', hubLat: 51.92, hubLon: 4.48 },
  Switzerland: { lat: 47.37, lon: 8.54, hubCity: 'Port of Rotterdam EV Corridor', hubLat: 51.92, hubLon: 4.48 },
  'United Arab Emirates': { lat: 25.20, lon: 55.27, hubCity: 'Jebel Ali Port, Dubai', hubLat: 24.99, hubLon: 55.06 },
  Australia: { lat: -33.87, lon: 151.21, hubCity: 'Port Kembla Auto Terminal', hubLat: -34.47, hubLon: 150.90 },
  Japan: { lat: 35.68, lon: 139.69, hubCity: 'Yokohama Daikoku Pier', hubLat: 35.46, hubLon: 139.68 },
  Singapore: { lat: 1.35, lon: 103.82, hubCity: 'PSA Tanjong Pagar Terminal', hubLat: 1.27, hubLon: 103.84 },
  Nigeria: { lat: 6.52, lon: 3.38, hubCity: 'Lagos / Tin Can EV Customs Port', hubLat: 6.43, hubLon: 3.34 },
  'South Africa': { lat: -33.92, lon: 18.42, hubCity: 'Port of Durban Car Terminal', hubLat: -29.87, hubLon: 31.03 },
};

const US_CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  austin: { lat: 30.27, lon: -97.74 },
  miami: { lat: 25.76, lon: -80.19 },
  'new york': { lat: 40.71, lon: -74.01 },
  'los angeles': { lat: 34.05, lon: -118.24 },
  san: { lat: 37.77, lon: -122.42 },
  seattle: { lat: 47.61, lon: -122.33 },
  chicago: { lat: 41.88, lon: -87.63 },
  dallas: { lat: 32.78, lon: -96.80 },
  houston: { lat: 29.76, lon: -95.37 },
  atlanta: { lat: 33.75, lon: -84.39 },
  denver: { lat: 39.74, lon: -104.99 },
  phoenix: { lat: 33.45, lon: -112.07 },
  boston: { lat: 42.36, lon: -71.06 },
  berlin: { lat: 52.52, lon: 13.40 },
  london: { lat: 51.51, lon: -0.13 },
  dubai: { lat: 25.20, lon: 55.27 },
  toronto: { lat: 43.65, lon: -79.38 },
  tokyo: { lat: 35.68, lon: 139.69 },
  sydney: { lat: -33.87, lon: 151.21 },
  lagos: { lat: 6.52, lon: 3.38 },
};

function resolveDestinationCoords(country?: string, city?: string) {
  const cleanCity = (city || '').trim().toLowerCase();
  const matchedCityKey = Object.keys(US_CITY_COORDS).find((k) => cleanCity.includes(k));
  const countryMeta = COUNTRY_COORDS[country || 'United States'] || {
    lat: 34.05,
    lon: -118.24,
    hubCity: 'Port of Houston Export Hub',
    hubLat: 29.76,
    hubLon: -95.36,
  };
  const destLat = matchedCityKey ? US_CITY_COORDS[matchedCityKey].lat : countryMeta.lat;
  const destLon = matchedCityKey ? US_CITY_COORDS[matchedCityKey].lon : countryMeta.lon;
  return {
    destLat,
    destLon,
    hubCity: countryMeta.hubCity,
    hubLat: countryMeta.hubLat,
    hubLon: countryMeta.hubLon,
  };
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function interpolateAlongWaypoints(
  waypoints: [RouteWaypoint, RouteWaypoint, RouteWaypoint],
  t: number
): { lat: number; lon: number } {
  const clamped = Math.max(0, Math.min(1, t));
  if (clamped <= 0.5) {
    const localT = clamped * 2;
    return {
      lat: waypoints[0].lat + (waypoints[1].lat - waypoints[0].lat) * localT,
      lon: waypoints[0].lon + (waypoints[1].lon - waypoints[0].lon) * localT,
    };
  }
  const localT = (clamped - 0.5) * 2;
  return {
    lat: waypoints[1].lat + (waypoints[2].lat - waypoints[1].lat) * localT,
    lon: waypoints[1].lon + (waypoints[2].lon - waypoints[1].lon) * localT,
  };
}

export function resolveWonPrizeRouteTelemetry(prize: WonPrizeItem): ShipmentRouteTelemetry {
  const progress = getWonVehicleShipmentProgress(prize);
  const isAustinOrigin = (prize.title || '').toLowerCase().includes('cybertruck') || (prize.title || '').toLowerCase().includes('model y');
  const originLat = isAustinOrigin ? 30.22 : 37.49;
  const originLon = isAustinOrigin ? -97.62 : -121.94;
  const originLabel = isAustinOrigin ? 'Giga Texas Dispatch, Austin' : 'Fremont EV Plant, CA';

  const country = prize.shippingAddress?.country || 'United States';
  const city = prize.shippingAddress?.city || 'Destination City';
  const { destLat, destLon, hubCity, hubLat, hubLon } = resolveDestinationCoords(country, city);

  let routeFraction = 0.28;
  let stageLabel = 'Verified · Staged at Origin';
  let etaLabel = 'Est. 5–9 Business Days';

  if (prize.shippingStatus === 'delivered') {
    routeFraction = 1;
    stageLabel = 'Delivered to Destination';
    etaLabel = 'Handover Completed';
  } else if (prize.shippingStatus === 'shipped') {
    routeFraction = 0.78;
    stageLabel = 'In Transit to Destination';
    etaLabel = 'Est. 1–3 Business Days';
  } else if (prize.shippingStatus === 'documentation_ready') {
    routeFraction = 0.52;
    stageLabel = 'Cleared Regional Logistics Hub';
    etaLabel = 'Est. 3–5 Business Days';
  } else if (prize.shippingStatus === 'approved' || progress.isAdminVerified) {
    routeFraction = 0.25;
    stageLabel = 'Verified · Carrier Loading';
    etaLabel = 'Dispatch Scheduled Within 24h';
  }

  const waypoints: [RouteWaypoint, RouteWaypoint, RouteWaypoint] = [
    {
      id: 'origin',
      title: 'Origin Plant',
      cityLabel: originLabel,
      lat: originLat,
      lon: originLon,
      reached: true,
      detail: `VIN ${prize.vinAssigned || 'Allocated'} · Title & Inspection Passed`,
    },
    {
      id: 'hub',
      title: 'Transit & Customs Hub',
      cityLabel: hubCity,
      lat: hubLat,
      lon: hubLon,
      reached: routeFraction >= 0.5,
      detail: routeFraction >= 0.5 ? 'Export Manifest Cleared' : 'Queued for Hub Transfer',
    },
    {
      id: 'destination',
      title: 'Final Destination',
      cityLabel: `${city}, ${country}`,
      lat: destLat,
      lon: destLon,
      reached: routeFraction >= 1,
      detail: prize.shippingAddress?.street || 'Verified Recipient Dropoff',
    },
  ];

  const pos = interpolateAlongWaypoints(waypoints, routeFraction);
  const totalDistanceKm =
    haversineKm(originLat, originLon, hubLat, hubLon) +
    haversineKm(hubLat, hubLon, destLat, destLon);

  return {
    trackingNumber: prize.trackingNumber || 'Pending',
    vehicleTitle: prize.title,
    carrierName: prize.carrierName || 'Apex Bonded Enclosed EV Carrier',
    progressFraction: routeFraction,
    progressPercent: Math.round(routeFraction * 100),
    stageLabel,
    etaLabel,
    distanceKm: Math.max(250, totalDistanceKm),
    currentLat: pos.lat,
    currentLon: pos.lon,
    waypoints,
  };
}

export function resolveVehicleOrderRouteTelemetry(order: VehicleOrder): ShipmentRouteTelemetry {
  const isAustinOrigin = (order.model || '').toLowerCase().includes('cybertruck') || (order.model || '').toLowerCase().includes('model y');
  const originLat = isAustinOrigin ? 30.22 : 37.49;
  const originLon = isAustinOrigin ? -97.62 : -121.94;
  const originLabel = isAustinOrigin ? 'Giga Texas Dispatch, Austin' : 'Fremont EV Plant, CA';

  const city = order.shippingAddress?.city || 'Los Angeles';
  const state = order.shippingAddress?.state || '';
  const { destLat, destLon, hubCity, hubLat, hubLon } = resolveDestinationCoords('United States', city);

  let routeFraction = 0.15;
  let stageLabel = 'Order Confirmed · Preparing Carrier';
  if (order.status === 'carrier_assigned') {
    routeFraction = 0.35;
    stageLabel = 'Carrier Assigned · Departing Origin';
  } else if (order.status === 'in_transit') {
    routeFraction = 0.65;
    stageLabel = 'Highway Enclosed Carrier In Transit';
  } else if (order.status === 'out_for_delivery') {
    routeFraction = 0.88;
    stageLabel = 'Out for Final Driveway Delivery';
  } else if (order.status === 'delivered') {
    routeFraction = 1;
    stageLabel = 'Delivered';
  }

  const waypoints: [RouteWaypoint, RouteWaypoint, RouteWaypoint] = [
    {
      id: 'origin',
      title: 'Origin Hub',
      cityLabel: originLabel,
      lat: originLat,
      lon: originLon,
      reached: true,
      detail: `VIN ${order.vinAssigned || 'Allocated'}`,
    },
    {
      id: 'hub',
      title: 'Regional Relay',
      cityLabel: hubCity,
      lat: hubLat,
      lon: hubLon,
      reached: routeFraction >= 0.5,
      detail: routeFraction >= 0.5 ? 'Carrier Checkpoint Logged' : 'Scheduled Highway Relay',
    },
    {
      id: 'destination',
      title: 'Delivery Address',
      cityLabel: state ? `${city}, ${state}` : city,
      lat: destLat,
      lon: destLon,
      reached: routeFraction >= 1,
      detail: order.shippingAddress?.street || 'Customer Driveway',
    },
  ];

  const pos = interpolateAlongWaypoints(waypoints, routeFraction);
  const totalDistanceKm =
    haversineKm(originLat, originLon, hubLat, hubLon) +
    haversineKm(hubLat, hubLon, destLat, destLon);

  return {
    trackingNumber: order.trackingNumber,
    vehicleTitle: order.vehicleName,
    carrierName: order.carrierName || 'Reliable Carriers Inc.',
    progressFraction: routeFraction,
    progressPercent: Math.round(routeFraction * 100),
    stageLabel,
    etaLabel: order.estimatedDelivery || '3 - 5 Business Days',
    distanceKm: Math.max(250, totalDistanceKm),
    currentLat: pos.lat,
    currentLon: pos.lon,
    waypoints,
  };
}
