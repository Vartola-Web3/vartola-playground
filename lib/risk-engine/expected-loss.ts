import { createHash } from 'crypto';

// Internal Vartola expected-loss estimate. EL = PD x LGD x EAD.
// This is NOT a regulated external credit rating and uses no credit bureau data. Every assumption is explicit and
// configurable; changing a default requires a new model version so old estimates stay reproducible.

export const EXPECTED_LOSS_MODEL_VERSION = 'vartola-el-v1';
export const EXPECTED_LOSS_NOTICE = 'Internal Vartola risk estimate. Not a regulated credit rating. Testnet values are simulated.';

export type ExpectedLossAssumptions = {
  // 12-month probability of default by facility risk grade.
  pdByGrade: Record<'A' | 'B' | 'C' | 'D', number>;
  // Share of the financed asset value expected to be realised on resale after recovery, before costs.
  recoveryRateByLiquidity: { high: number; medium: number; low: number };
  recoveryCostRate: number; // share of realised proceeds consumed by recovery and sale costs
  distressedPdFloor: number; // PD floor once a facility is late, in default or in recovery
  stressedStatuses: string[];
};

export const DEFAULT_ASSUMPTIONS: ExpectedLossAssumptions = {
  pdByGrade: { A: 0.01, B: 0.03, C: 0.08, D: 0.2 },
  recoveryRateByLiquidity: { high: 0.7, medium: 0.55, low: 0.35 },
  recoveryCostRate: 0.1,
  distressedPdFloor: 0.35,
  stressedStatuses: ['LATE', 'PAYMENT_LATE', 'GRACE', 'DEFAULT_NOTICE', 'DEFAULTED', 'REPOSSESSION', 'ASSET_SALE', 'RECOVERY'],
};

export type ExpectedLossInput = {
  grade: 'A' | 'B' | 'C' | 'D';
  outstandingPrincipal: number; // EAD basis
  accruedIncome?: number; // unpaid income added to exposure at default
  assetValue: number; // current valuation when known, otherwise purchase value
  financeAmount: number;
  liquidity?: 'high' | 'medium' | 'low';
  status?: string;
  reserveBalance?: number; // reserve may only reduce loss when the facility terms allow it; see applyReserve
  applyReserve?: boolean;
};

export type ExpectedLossResult = {
  modelVersion: string;
  pd: number;
  lgd: number;
  ead: number;
  expectedLoss: number;
  riskGrade: ExpectedLossInput['grade'];
  inputSnapshotHash: string;
  calculatedAt: string;
  explanation: string[];
  notice: string;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const money = (value: number) => Math.round(value * 100) / 100;

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as object).sort().map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function lossGivenDefault(input: ExpectedLossInput, assumptions = DEFAULT_ASSUMPTIONS) {
  const exposure = Math.max(0, input.outstandingPrincipal + (input.accruedIncome || 0));
  if (exposure <= 0) return 0;
  const recoveryRate = assumptions.recoveryRateByLiquidity[input.liquidity || 'medium'];
  const realised = Math.max(0, input.assetValue) * recoveryRate * (1 - assumptions.recoveryCostRate);
  const reserve = input.applyReserve ? Math.max(0, input.reserveBalance || 0) : 0;
  return clamp01((exposure - realised - reserve) / exposure);
}

export function computeExpectedLoss(input: ExpectedLossInput, assumptions = DEFAULT_ASSUMPTIONS, now = new Date()): ExpectedLossResult {
  const stressed = assumptions.stressedStatuses.includes((input.status || '').toUpperCase());
  const basePd = assumptions.pdByGrade[input.grade];
  const pd = clamp01(stressed ? Math.max(basePd, assumptions.distressedPdFloor) : basePd);
  const ead = money(Math.max(0, input.outstandingPrincipal + (input.accruedIncome || 0)));
  const lgd = lossGivenDefault(input, assumptions);
  const expectedLoss = money(pd * lgd * ead);
  return {
    modelVersion: EXPECTED_LOSS_MODEL_VERSION,
    pd,
    lgd: Math.round(lgd * 10000) / 10000,
    ead,
    expectedLoss,
    riskGrade: input.grade,
    inputSnapshotHash: createHash('sha256').update(canonical({ version: EXPECTED_LOSS_MODEL_VERSION, input, assumptions })).digest('hex'),
    calculatedAt: now.toISOString(),
    explanation: [
      `PD ${(pd * 100).toFixed(1)}% from grade ${input.grade}${stressed ? ` (raised to the distressed floor because the facility is ${input.status})` : ''}`,
      `LGD ${(lgd * 100).toFixed(1)}%: asset value ${money(input.assetValue)} x ${assumptions.recoveryRateByLiquidity[input.liquidity || 'medium']} recovery x (1 - ${assumptions.recoveryCostRate} cost) against exposure ${ead}`,
      `EAD ${ead} (outstanding principal${input.accruedIncome ? ' plus accrued income' : ''})`,
      `Expected loss = ${pd} x ${Math.round(lgd * 10000) / 10000} x ${ead} = ${expectedLoss}`,
    ],
    notice: EXPECTED_LOSS_NOTICE,
  };
}

// Portfolio expected loss is the sum of facility expected losses; no diversification benefit is assumed.
export function portfolioExpectedLoss(rows: ExpectedLossResult[]) {
  const totalEad = money(rows.reduce((sum, row) => sum + row.ead, 0));
  const totalEl = money(rows.reduce((sum, row) => sum + row.expectedLoss, 0));
  return { exposure: totalEad, expectedLoss: totalEl, lossRate: totalEad > 0 ? Math.round((totalEl / totalEad) * 10000) / 10000 : 0 };
}
