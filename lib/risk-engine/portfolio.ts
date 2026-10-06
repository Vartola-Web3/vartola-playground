// Portfolio concentration and scenario analysis. Pure functions so they can be tested and benchmarked.
// Scenario analysis is not a forecast.

export type Exposure = {
  facilityId: string;
  facilityNo: string;
  sme: string;
  supplier: string;
  assetClass: string;
  sector: string;
  geography: string;
  grade: 'A' | 'B' | 'C' | 'D';
  outstanding: number;
  assetValue: number;
  status: string;
  pd: number;
  lgd: number;
};

export type Concentration = { key: string; exposure: number; share: number; breach: boolean };

export const DEFAULT_LIMITS = { sme: 0.25, supplier: 0.3, assetClass: 0.5, sector: 0.4, geography: 0.6, grade: 0.7 };

export function concentrationBy(rows: Exposure[], field: 'sme' | 'supplier' | 'assetClass' | 'sector' | 'geography' | 'grade', limit = DEFAULT_LIMITS[field]): Concentration[] {
  const total = rows.reduce((sum, row) => sum + row.outstanding, 0);
  const groups = new Map<string, number>();
  for (const row of rows) groups.set(row[field] || 'Unspecified', (groups.get(row[field] || 'Unspecified') || 0) + row.outstanding);
  return [...groups.entries()]
    .map(([key, exposure]) => {
      const share = total > 0 ? exposure / total : 0;
      return { key, exposure: Math.round(exposure * 100) / 100, share: Math.round(share * 10000) / 10000, breach: share > limit };
    })
    .sort((a, b) => b.exposure - a.exposure);
}

export const topExposures = (rows: Exposure[], count = 5) => [...rows].sort((a, b) => b.outstanding - a.outstanding).slice(0, count);

// A breach is "upcoming" when a group is within 80% of its limit.
export function upcomingBreaches(rows: Exposure[]) {
  const out: { dimension: string; key: string; share: number; limit: number }[] = [];
  for (const dimension of Object.keys(DEFAULT_LIMITS) as (keyof typeof DEFAULT_LIMITS)[]) {
    for (const group of concentrationBy(rows, dimension)) {
      const limit = DEFAULT_LIMITS[dimension];
      if (group.share > limit * 0.8 && rows.length > 1) out.push({ dimension, key: group.key, share: group.share, limit });
    }
  }
  return out;
}

export type Scenario = {
  name: string;
  defaultMultiplier: number; // multiplies every PD
  recoveryHaircut: number; // reduces realised value by this share (0.2 = 20% lower)
  depreciationShock: number; // reduces asset value by this share
  delayedShare: number; // share of exposure assumed to pay late (affects cash timing only)
  supplierFailure?: string; // supplier name whose facilities are fully stressed
};

export const SCENARIOS: Scenario[] = [
  { name: 'Base case', defaultMultiplier: 1, recoveryHaircut: 0, depreciationShock: 0, delayedShare: 0 },
  { name: 'Higher default rate (PD x2)', defaultMultiplier: 2, recoveryHaircut: 0, depreciationShock: 0, delayedShare: 0.05 },
  { name: 'Lower recovery value (-30%)', defaultMultiplier: 1, recoveryHaircut: 0.3, depreciationShock: 0, delayedShare: 0 },
  { name: 'Asset depreciation shock (-20%)', defaultMultiplier: 1, recoveryHaircut: 0, depreciationShock: 0.2, delayedShare: 0 },
  { name: 'Payment delays (20% of exposure late)', defaultMultiplier: 1.25, recoveryHaircut: 0, depreciationShock: 0, delayedShare: 0.2 },
  { name: 'Combined stress', defaultMultiplier: 2, recoveryHaircut: 0.3, depreciationShock: 0.2, delayedShare: 0.2 },
];

export type ScenarioResult = { name: string; exposure: number; expectedLoss: number; lossRate: number; expectedRecovery: number; delayedExposure: number; note: string };

export function runScenario(rows: Exposure[], scenario: Scenario, recoveryRate = 0.55, costRate = 0.1): ScenarioResult {
  let exposure = 0;
  let loss = 0;
  let recovery = 0;
  for (const row of rows) {
    exposure += row.outstanding;
    const supplierHit = scenario.supplierFailure && row.supplier === scenario.supplierFailure;
    const pd = Math.min(1, (supplierHit ? 1 : row.pd * scenario.defaultMultiplier));
    const value = row.assetValue * (1 - scenario.depreciationShock) * recoveryRate * (1 - scenario.recoveryHaircut) * (1 - costRate);
    const lgd = row.outstanding > 0 ? Math.max(0, Math.min(1, (row.outstanding - value) / row.outstanding)) : 0;
    loss += pd * lgd * row.outstanding;
    recovery += pd * Math.min(row.outstanding, value);
  }
  const round = (value: number) => Math.round(value * 100) / 100;
  return {
    name: scenario.name,
    exposure: round(exposure),
    expectedLoss: round(loss),
    lossRate: exposure > 0 ? Math.round((loss / exposure) * 10000) / 10000 : 0,
    expectedRecovery: round(recovery),
    delayedExposure: round(exposure * scenario.delayedShare),
    note: 'SCENARIO ANALYSIS, NOT A FORECAST',
  };
}
