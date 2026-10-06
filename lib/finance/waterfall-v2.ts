// Programmable waterfall v2. One engine for normal repayment, early settlement, default recovery and asset sale.
// It mirrors contracts/soroban/finance_math in integer arithmetic (amounts are integer minor units, never floats)
// and adds the facility-configurable reserve and cost lines. Terms come from the facility; nothing here is a
// hard-coded legal waterfall and a reserve is not a guarantee of investor protection.

export type ReservePolicy = {
  reserveRateBps: number; // share of each gross payment diverted to the reserve
  reserveTarget: number; // reserve stops accruing once the balance reaches this amount (0 = no cap)
  permittedUses: ('SHORTFALL' | 'SERVICING_COST' | 'RECOVERY_COST' | 'INSURANCE_DEDUCTIBLE' | 'OTHER_CONFIGURED')[];
};

export const NO_RESERVE: ReservePolicy = { reserveRateBps: 0, reserveTarget: 0, permittedUses: [] };

export type RepaymentInput = {
  gross: number;
  feeBps: number;
  reserve: ReservePolicy;
  reserveBalance: number;
  financeAmount: number;
  termMonths: number;
  paymentIndex: number;
  remainingPrincipal: number;
};

export type RepaymentSplit = { fee: number; reserve: number; net: number; principal: number; income: number; residual: number };

const bps = (amount: number, rate: number) => Math.floor((amount * rate) / 10_000);

export function splitRepayment(input: RepaymentInput): RepaymentSplit {
  const gross = Math.max(0, Math.floor(input.gross));
  const fee = bps(gross, input.feeBps);
  let reserve = bps(gross, input.reserve.reserveRateBps);
  if (input.reserve.reserveTarget > 0) reserve = Math.min(reserve, Math.max(0, input.reserve.reserveTarget - input.reserveBalance));
  const net = Math.max(0, gross - fee - reserve);
  const remaining = Math.max(0, input.remainingPrincipal);
  const equal = input.termMonths > 0 ? Math.floor(input.financeAmount / input.termMonths) : 0;
  const due = input.paymentIndex >= input.termMonths ? remaining : Math.min(equal, remaining);
  const principal = Math.min(due, net, remaining);
  const income = Math.max(0, net - principal);
  return { fee, reserve, net, principal, income, residual: 0 };
}

export type SettlementSplit = { due: number; principal: number; income: number; fee: number };

export function splitSettlement(principalOutstanding: number, accruedIncome: number, fee: number, rebate: number): SettlementSplit {
  const principal = Math.max(0, principalOutstanding);
  return { due: principal + Math.max(0, accruedIncome) + Math.max(0, fee) - Math.max(0, rebate), principal, income: Math.max(0, accruedIncome - Math.max(0, rebate)), fee: Math.max(0, fee) };
}

export type RecoveryInput = {
  grossProceeds: number;
  servicingCost: number; // permitted servicing cost
  recoveryCost: number; // permitted recovery and sale cost
  principalOutstanding: number;
  accruedIncome: number;
  reserveBalance: number;
  reserveMayCoverShortfall: boolean; // only when the facility terms permit it
};

export type RecoverySplit = {
  costs: number;
  reserveApplied: number;
  principal: number;
  income: number;
  residual: number;
  investorDistribution: number;
  shortfall: number;
};

// Order: permitted costs, then principal, then accrued income, then residual. A reserve may fill a shortfall on
// principal and income only where the facility terms allow it. Distribution can never exceed realised proceeds
// plus the reserve applied.
export function splitRecovery(input: RecoveryInput): RecoverySplit {
  const proceeds = Math.max(0, input.grossProceeds);
  const costs = Math.min(proceeds, Math.max(0, input.servicingCost) + Math.max(0, input.recoveryCost));
  const available = proceeds - costs;
  const principalDue = Math.max(0, input.principalOutstanding);
  const incomeDue = Math.max(0, input.accruedIncome);
  const owed = principalDue + incomeDue;
  const reserveApplied = input.reserveMayCoverShortfall ? Math.min(Math.max(0, input.reserveBalance), Math.max(0, owed - available)) : 0;
  const pool = available + reserveApplied;
  const principal = Math.min(pool, principalDue);
  const income = Math.min(pool - principal, incomeDue);
  const residual = pool - principal - income;
  return { costs, reserveApplied, principal, income, residual, investorDistribution: principal + income, shortfall: Math.max(0, owed - principal - income) };
}

// Deterministic distribution by participation units. Remainders (dust) stay with the facility, never over-distribute.
export function distributeByUnits(amount: number, holders: { id: string; units: number }[]) {
  const total = holders.reduce((sum, holder) => sum + holder.units, 0);
  if (total <= 0 || amount <= 0) return { shares: holders.map((holder) => ({ id: holder.id, amount: 0 })), distributed: 0, dust: Math.max(0, amount) };
  const shares = holders.map((holder) => ({ id: holder.id, amount: Math.floor((amount * holder.units) / total) }));
  const distributed = shares.reduce((sum, share) => sum + share.amount, 0);
  return { shares, distributed, dust: amount - distributed };
}
