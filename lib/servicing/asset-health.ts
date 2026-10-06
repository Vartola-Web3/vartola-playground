// Asset servicing lifecycle, internal Asset Health Score and verification panel.
// The health score is an internal, non-regulated indicator. Verification counts only checks someone has recorded,
// each with its source; nothing is described as verified by an API unless the source says so.

export const ASSET_LIFECYCLE = ['PURCHASED', 'REGISTERED', 'INSURED', 'DELIVERED', 'ACTIVE', 'MAINTENANCE', 'REVALUATION', 'RENEWAL', 'RECOVERY', 'DISPOSAL'] as const;
export type AssetStage = (typeof ASSET_LIFECYCLE)[number];

export type AssetServicing = {
  stage: AssetStage;
  registrationExpiry: string | null;
  insuranceExpiry: string | null;
  nextMaintenanceDue: string | null;
  lastMaintenanceAt: string | null;
  maintenanceCount: number;
  downtimeDays: number;
  usage: number | null; // odometer or hours, where applicable
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'UNKNOWN';
  purchaseValue: number | null;
  latestValuation: number | null;
  valuationSource: string | null;
  ageYears: number | null;
  usefulLifeYears: number | null;
  accident: boolean;
  recoveryStatus: 'NONE' | 'INITIATED' | 'RECOVERED' | 'SOLD';
  documentsComplete: number; // 0..1
};

export type HealthLabel = 'HEALTHY' | 'WATCH' | 'AT RISK';

const clamp = (value: number) => Math.max(0, Math.min(100, value));
const DAY = 86_400_000;

function expiryScore(date: string | null, now: Date) {
  if (!date) return 40; // unknown is treated as a weak signal, not as good
  const days = (new Date(date).getTime() - now.getTime()) / DAY;
  if (days < 0) return 0;
  if (days < 30) return 50;
  if (days < 90) return 80;
  return 100;
}

export function assetHealth(asset: AssetServicing, now = new Date()) {
  const insurance = expiryScore(asset.insuranceExpiry, now);
  const registration = expiryScore(asset.registrationExpiry, now);
  const maintenance = !asset.nextMaintenanceDue ? 60 : new Date(asset.nextMaintenanceDue).getTime() < now.getTime() ? 20 : 100;
  const condition = { EXCELLENT: 100, GOOD: 85, FAIR: 60, POOR: 25, UNKNOWN: 50 }[asset.condition];
  const age = asset.ageYears !== null && asset.usefulLifeYears ? clamp(100 - (asset.ageYears / asset.usefulLifeYears) * 100) : 60;
  const valuation = asset.latestValuation !== null && asset.purchaseValue ? clamp((asset.latestValuation / asset.purchaseValue) * 110) : 55;
  const documentation = clamp(asset.documentsComplete * 100);
  const downtime = clamp(100 - asset.downtimeDays * 3);
  const parts = { insurance, registration, maintenance, condition, age, valuation, documentation, downtime };
  const weights = { insurance: 0.18, registration: 0.1, maintenance: 0.16, condition: 0.16, age: 0.1, valuation: 0.12, documentation: 0.1, downtime: 0.08 } as const;
  let score = 0;
  for (const key of Object.keys(weights) as (keyof typeof weights)[]) score += parts[key] * weights[key];
  if (asset.accident) score -= 10;
  if (asset.recoveryStatus !== 'NONE') score = Math.min(score, 35);
  score = Math.round(clamp(score));
  const label: HealthLabel = score >= 75 ? 'HEALTHY' : score >= 50 ? 'WATCH' : 'AT RISK';
  return { score, label, parts, modelVersion: 'asset-health-v1', notice: 'Internal indicator, not a regulated valuation or rating.' };
}

// Signal for the facility risk engine: the asset component can only move within a bounded range.
export const healthSignal = (score: number) => Math.max(-10, Math.min(10, Math.round((score - 60) / 4)));

export type Check = { name: string; verified: boolean; source: 'MANUAL' | 'SUPPLIER' | 'DOCUMENT' | 'PROVIDER' | 'API' | 'ON-CHAIN ATTESTATION' | null };

export const VERIFICATION_CHECKS = ['VIN verified', 'Invoice verified', 'Supplier verified', 'Delivery verified', 'Registration verified', 'Insurance verified'] as const;

export function verificationPanel(checks: Check[]) {
  const rows = VERIFICATION_CHECKS.map((name) => {
    const found = checks.find((check) => check.name === name);
    return { name, verified: Boolean(found?.verified && found.source), source: found?.verified ? found.source : null };
  });
  const done = rows.filter((row) => row.verified).length;
  return { rows, done, total: rows.length, label: `${done} / ${rows.length} VERIFIED` };
}

export const PASSPORT_EVENTS = ['ASSET CREATED', 'DOCUMENT VERIFIED', 'DELIVERED', 'REGISTERED', 'INSURED', 'ACTIVATED', 'MAINTAINED', 'VALUED', 'RECOVERED', 'DISPOSED'] as const;
