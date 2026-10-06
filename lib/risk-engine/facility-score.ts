import { createHash } from 'crypto';
import { RISK_ENGINE_CONFIG } from './config';

// Deterministic, explainable facility risk score. This is a rule-based model, not machine learning, and not a
// credit rating issued by a regulated ratings agency. Higher is safer, on the same 0-100 scale as the existing
// business, asset and deal scores.
//
// Two model versions exist so that old scores stay reproducible:
//   facility-risk-v1  business, asset, deal and servicing only
//   facility-risk-v2  adds concentration, SME contribution, finance-to-value, payment capacity and asset liquidity
// Changing any weight or threshold requires a new version.

export const FACILITY_RISK_MODEL_V1 = 'facility-risk-v1';
export const FACILITY_RISK_MODEL_VERSION = 'facility-risk-v2';

export const FACILITY_RISK_WEIGHTS_V1 = { business: 0.3, asset: 0.25, deal: 0.3, servicing: 0.15 } as const;
export const FACILITY_RISK_WEIGHTS = {
  business: 0.22,
  asset: 0.18,
  deal: 0.22,
  servicing: 0.14,
  concentration: 0.08,
  contribution: 0.06,
  financeToValue: 0.05,
  paymentCapacity: 0.03,
  liquidity: 0.02,
} as const;

export type FacilityProfile = {
  assetValue: number;
  smeContribution: number;
  financeAmount: number;
  monthlyPayment: number;
  monthlyNetCashFlow: number | null; // revenue minus expenses, when the company reported both
  concentrationPct: number; // this company's share of all financed facilities, 0-100
  liquidityScore: number | null; // asset resale liquidity on the same 0-100 scale, when known
};

export type FacilityRiskInput = {
  businessScore: number;
  assetScore: number;
  dealScore: number;
  servicing: {
    status: string;
    paidOnTime: number;
    paidLate: number;
    missed: number;
    scheduled: number;
  };
  profile?: FacilityProfile;
};

export type ComponentName = keyof typeof FACILITY_RISK_WEIGHTS;

export type FacilityRiskResult = {
  modelVersion: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  components: Partial<Record<ComponentName, number>>;
  weights: Record<string, number>;
  inputSnapshotHash: string;
  calculatedAt: string;
  explanation: string[];
};

const clamp = (value: number) => Math.max(0, Math.min(100, value));
const round1 = (value: number) => Math.round(value * 10) / 10;

// Servicing score starts at 100 and loses points for late or missed installments and for distressed status.
export function servicingScore(input: FacilityRiskInput['servicing']) {
  let score = 100;
  score -= input.paidLate * 5;
  score -= input.missed * 20;
  const status = input.status.toUpperCase();
  if (['GRACE', 'LATE', 'PAYMENT_LATE'].includes(status)) score -= 15;
  if (['DEFAULT_NOTICE', 'DEFAULTED', 'REPOSSESSION', 'ASSET_SALE', 'RECOVERY'].includes(status)) score = Math.min(score, 25);
  return clamp(score);
}

// SME contribution as a share of the asset value: 0% scores 20, 40% or more scores 100.
export function contributionScore(assetValue: number, smeContribution: number) {
  if (assetValue <= 0) return 50;
  return clamp(20 + (smeContribution / assetValue) * 100 * 2);
}

// Finance-to-value: 60% or less scores 100, 100% or more scores 20.
export function financeToValueScore(assetValue: number, financeAmount: number) {
  if (assetValue <= 0) return 50;
  const ratio = financeAmount / assetValue;
  if (ratio <= 0.6) return 100;
  if (ratio >= 1) return 20;
  return clamp(100 - ((ratio - 0.6) / 0.4) * 80);
}

// Payment burden against net monthly cash flow: 30% or less scores 100, 100% or more scores 10.
export function paymentCapacityScore(monthlyPayment: number, monthlyNetCashFlow: number | null) {
  if (monthlyNetCashFlow === null) return 50;
  if (monthlyNetCashFlow <= 0) return 10;
  const burden = monthlyPayment / monthlyNetCashFlow;
  if (burden <= 0.3) return 100;
  if (burden >= 1) return 10;
  return clamp(100 - ((burden - 0.3) / 0.7) * 90);
}

// Portfolio concentration: a company with 10% or less of financed facilities scores 100, 50% or more scores 20.
export function concentrationScore(concentrationPct: number) {
  if (concentrationPct <= 10) return 100;
  if (concentrationPct >= 50) return 20;
  return clamp(100 - ((concentrationPct - 10) / 40) * 80);
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as object).sort().map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export const versionFor = (input: FacilityRiskInput) => (input.profile ? FACILITY_RISK_MODEL_VERSION : FACILITY_RISK_MODEL_V1);

export function snapshotHash(input: FacilityRiskInput) {
  return createHash('sha256').update(canonical({ version: versionFor(input), input })).digest('hex');
}

export function gradeFor(score: number): FacilityRiskResult['grade'] {
  const { A, B, C } = RISK_ENGINE_CONFIG.tierThresholds;
  if (score >= A) return 'A';
  if (score >= B) return 'B';
  if (score >= C) return 'C';
  return 'D';
}

export function computeFacilityRisk(input: FacilityRiskInput, now = new Date()): FacilityRiskResult {
  const base = {
    business: clamp(input.businessScore),
    asset: clamp(input.assetScore),
    deal: clamp(input.dealScore),
    servicing: servicingScore(input.servicing),
  };
  const servicingText = `Servicing ${base.servicing} (late ${input.servicing.paidLate}, missed ${input.servicing.missed}, status ${input.servicing.status})`;
  if (!input.profile) {
    const weights = FACILITY_RISK_WEIGHTS_V1;
    const score = Math.round(base.business * weights.business + base.asset * weights.asset + base.deal * weights.deal + base.servicing * weights.servicing);
    return {
      modelVersion: FACILITY_RISK_MODEL_V1,
      score,
      grade: gradeFor(score),
      components: base,
      weights,
      inputSnapshotHash: snapshotHash(input),
      calculatedAt: now.toISOString(),
      explanation: [`Business ${base.business} × ${weights.business}`, `Asset ${base.asset} × ${weights.asset}`, `Deal ${base.deal} × ${weights.deal}`, `${servicingText} × ${weights.servicing}`],
    };
  }
  const profile = input.profile;
  const components: Record<ComponentName, number> = {
    ...base,
    concentration: concentrationScore(profile.concentrationPct),
    contribution: contributionScore(profile.assetValue, profile.smeContribution),
    financeToValue: financeToValueScore(profile.assetValue, profile.financeAmount),
    paymentCapacity: paymentCapacityScore(profile.monthlyPayment, profile.monthlyNetCashFlow),
    liquidity: profile.liquidityScore === null ? 50 : clamp(profile.liquidityScore),
  };
  let raw = 0;
  for (const name of Object.keys(FACILITY_RISK_WEIGHTS) as ComponentName[]) raw += components[name] * FACILITY_RISK_WEIGHTS[name];
  const score = Math.round(raw);
  return {
    modelVersion: FACILITY_RISK_MODEL_VERSION,
    score,
    grade: gradeFor(score),
    components,
    weights: FACILITY_RISK_WEIGHTS,
    inputSnapshotHash: snapshotHash(input),
    calculatedAt: now.toISOString(),
    explanation: (Object.keys(FACILITY_RISK_WEIGHTS) as ComponentName[]).map((name) => `${name} ${round1(components[name])} × ${FACILITY_RISK_WEIGHTS[name]}`),
  };
}

const IMPROVES: Record<ComponentName, string> = {
  business: 'Stronger company financials: revenue, cash flow, lower liabilities.',
  asset: 'A newer, more liquid asset type with a stronger resale market.',
  deal: 'A shorter term and a lower finance-to-value structure.',
  servicing: 'On-time payments and no missed installments.',
  concentration: 'A smaller share of the portfolio with this one company.',
  contribution: 'A larger SME contribution toward the asset price.',
  financeToValue: 'Financing a smaller share of the asset value.',
  paymentCapacity: 'A payment that is a smaller share of monthly net cash flow.',
  liquidity: 'An asset that is easier to resell.',
};

const INCREASES: Record<ComponentName, string> = {
  business: 'Weak company financials or high liabilities.',
  asset: 'An asset with weaker resale value.',
  deal: 'A long term or high finance-to-value deal.',
  servicing: 'Late or missed payments, or a facility in grace, late or default.',
  concentration: 'A large share of the portfolio is with one company.',
  contribution: 'A small SME contribution.',
  financeToValue: 'Financing close to the full asset value.',
  paymentCapacity: 'The payment is a large share of monthly net cash flow, or cash flow is unknown.',
  liquidity: 'The asset may be hard to resell, or liquidity is unknown.',
};

// What would improve the score and what is holding it down, ranked by weighted effect. Only components below 70
// can hold the score down; only components below 100 can still improve it.
export function scoreDrivers(result: FacilityRiskResult) {
  const entries = (Object.entries(result.components) as [ComponentName, number][]).map(([name, value]) => ({ name, value, gap: (100 - value) * (result.weights[name] ?? 0) }));
  const improves = entries.filter((row) => row.value < 100).sort((a, b) => b.gap - a.gap).slice(0, 3).map((row) => IMPROVES[row.name]);
  const increases = entries.filter((row) => row.value < 70).sort((a, b) => a.value - b.value).slice(0, 3).map((row) => INCREASES[row.name]);
  return { improves, increases };
}
