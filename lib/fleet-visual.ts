export type FleetVisualType =
  | 'MOTORCYCLE_ONLY'
  | 'VAN_ONLY'
  | 'PICKUP_ONLY'
  | 'SMALL_TRUCK_ONLY'
  | 'MEDIUM_TRUCK_ONLY'
  | 'MOTORCYCLE_VAN'
  | 'VAN_PICKUP'
  | 'VAN_TRUCK'
  | 'MOTORCYCLE_TRUCK'
  | 'PICKUP_TRUCK'
  | 'MIXED_LAST_MILE'
  | 'MIXED_LOGISTICS'
  | 'FULL_MIXED_FLEET';

const folder: Record<FleetVisualType, string> = {
  MOTORCYCLE_ONLY: 'motorcycle-only',
  VAN_ONLY: 'van-only',
  PICKUP_ONLY: 'pickup-only',
  SMALL_TRUCK_ONLY: 'small-truck-only',
  MEDIUM_TRUCK_ONLY: 'medium-truck-only',
  MOTORCYCLE_VAN: 'motorcycle-van',
  VAN_PICKUP: 'van-pickup',
  VAN_TRUCK: 'van-truck',
  MOTORCYCLE_TRUCK: 'motorcycle-truck',
  PICKUP_TRUCK: 'pickup-truck',
  MIXED_LAST_MILE: 'mixed-last-mile',
  MIXED_LOGISTICS: 'mixed-logistics',
  FULL_MIXED_FLEET: 'full-mixed-fleet',
};

export function getFleetVisualType(counts: { motorcycles?: number; vans?: number; pickups?: number; smallTrucks?: number; mediumTrucks?: number }): FleetVisualType {
  const m = counts.motorcycles || 0;
  const v = counts.vans || 0;
  const p = counts.pickups || 0;
  const s = counts.smallTrucks || 0;
  const t = (counts.mediumTrucks || 0) + s;
  const kinds = [m > 0, v > 0, p > 0, t > 0].filter(Boolean).length;
  if (kinds >= 4 || (m && v && p && t)) return 'FULL_MIXED_FLEET';
  if (m && v && p) return 'MIXED_LAST_MILE';
  if (v && p && t) return 'MIXED_LOGISTICS';
  if (m && v) return 'MOTORCYCLE_VAN';
  if (v && p) return 'VAN_PICKUP';
  if (v && t) return 'VAN_TRUCK';
  if (m && t) return 'MOTORCYCLE_TRUCK';
  if (p && t) return 'PICKUP_TRUCK';
  if (m) return 'MOTORCYCLE_ONLY';
  if (v) return 'VAN_ONLY';
  if (p) return 'PICKUP_ONLY';
  if (s && !counts.mediumTrucks) return 'SMALL_TRUCK_ONLY';
  if (t) return 'MEDIUM_TRUCK_ONLY';
  return 'FULL_MIXED_FLEET';
}

export function fleetImage(type: FleetVisualType, size: 'hero' | 'card' | 'thumbnail' = 'card') {
  return `/assets/fleet/${folder[type]}/${size}.jpg`;
}

export function countsFromAssetTypes(types: string[]) {
  const counts = { motorcycles: 0, vans: 0, pickups: 0, smallTrucks: 0, mediumTrucks: 0 };
  for (const type of types) {
    if (type.includes('MOTOR')) counts.motorcycles += 1;
    else if (type.includes('VAN')) counts.vans += 1;
    else if (type.includes('PICKUP')) counts.pickups += 1;
    else if (type.includes('MEDIUM')) counts.mediumTrucks += 1;
    else if (type.includes('TRUCK')) counts.smallTrucks += 1;
  }
  return counts;
}
