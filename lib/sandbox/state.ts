import { ACTIVATION_CHECKS, RELEASE_CONDITIONS } from '@/lib/lifecycle/rules';

// Interactive sandbox — pure state model. No database, no network. Money stays inside this object.
// The same waterfall engine and lifecycle rules used by the platform are reused, so the numbers match.

export type SandboxRole = 'SME' | 'INVESTOR' | 'UNDERWRITER' | 'OPERATIONS' | 'SUPPLIER';

export type FacilityPhase =
  | 'APPLICATION'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'POOL_OPEN'
  | 'FUNDING'
  | 'RELEASE_READY'
  | 'RELEASED'
  | 'DELIVERY_PENDING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'SETTLED'
  | 'DEFAULTED'
  | 'RECOVERED';

export type Wallet = { available: number; reserved: number; deployed: number };
export type ConditionState = 'PENDING' | 'VERIFIED';
export type PaymentState = 'SCHEDULED' | 'PAID';

export type Retention = { at: string; actor: SandboxRole; type: string; amount: number; direction: 'IN' | 'OUT'; note: string };
export type TimelineEntry = { at: string; type: string; detail: string };
export type Distribution = { paymentNo: number; investorId: string; principal: number; income: number };
export type RecoveryEntry = { investorId: string; amount: number };

export type SandboxState = {
  version: 1;
  scenarioKey: string;
  seed: number;
  clock: string;
  phase: FacilityPhase;
  actor: SandboxRole;
  facility: {
    financeAmount: number;
    termMonths: number;
    monthlyPayment: number;
    feeBps: number;
    reserveRateBps: number;
    reserveTarget: number;
    units: number;
    unitValue: number;
  };
  pool: { target: number; raised: number; status: 'CLOSED' | 'OPEN' | 'ACTIVE' | 'COMPLETED' };
  sme: { name: string; wallet: Wallet; contribution: number; contributionPaid: boolean };
  investors: Array<{
    id: string;
    name: string;
    units: number;
    wallet: Wallet;
    principalReturned: number;
    incomeReceived: number;
    recoveryReceived: number;
  }>;
  supplier: { name: string; wallet: Wallet; approved: boolean };
  reserveBalance: number;
  conditions: Array<{ type: string; label: string; status: ConditionState }>;
  checks: Array<{ type: string; label: string; status: ConditionState }>;
  payments: Array<{ no: number; dueDate: string; amount: number; principal: number; income: number; fee: number; reserve: number; status: PaymentState }>;
  distributions: Distribution[];
  recovery: RecoveryEntry[];
  ledger: Retention[];
  timeline: TimelineEntry[];
  flags: { settled: boolean; defaulted: boolean; recovered: boolean };
};

export const FACILITY_DEFAULTS = {
  financeAmount: 150_000,
  termMonths: 24,
  monthlyPayment: 7_000,
  feeBps: 100,
  reserveRateBps: 50,
  reserveTarget: 5_000,
  units: 1_500,
  unitValue: 100,
} as const;

export const HOLDERS = [
  { id: 'investor-a', name: 'Investor A', units: 750 },
  { id: 'investor-b', name: 'Investor B', units: 450 },
  { id: 'investor-c', name: 'Investor C', units: 300 },
] as const;

export const SCENARIO_KEYS = ['normal', 'early', 'late', 'default', 'supplier', 'insurance'] as const;
export type ScenarioKey = (typeof SCENARIO_KEYS)[number];

const wallet = (available = 0): Wallet => ({ available, reserved: 0, deployed: 0 });

export function initialState(scenarioKey: string = 'normal', seed = 1, clock = '2026-10-01T00:00:00.000Z'): SandboxState {
  const f = FACILITY_DEFAULTS;
  return {
    version: 1,
    scenarioKey,
    seed,
    clock,
    phase: 'APPLICATION',
    actor: 'SME',
    facility: { ...f },
    pool: { target: f.financeAmount, raised: 0, status: 'CLOSED' },
    sme: { name: 'Desert Mile Logistics', wallet: wallet(f.monthlyPayment * f.termMonths), contribution: 30_000, contributionPaid: false },
    investors: HOLDERS.map((holder) => ({
      id: holder.id,
      name: holder.name,
      units: holder.units,
      wallet: wallet(holder.units * f.unitValue),
      principalReturned: 0,
      incomeReceived: 0,
      recoveryReceived: 0,
    })),
    supplier: { name: 'Gulf Fleet Motors', wallet: wallet(), approved: true },
    reserveBalance: 0,
    conditions: RELEASE_CONDITIONS.map(([type, label]) => ({ type, label, status: 'PENDING' as ConditionState })),
    checks: ACTIVATION_CHECKS.map(([type, label]) => ({ type, label, status: 'PENDING' as ConditionState })),
    payments: [],
    distributions: [],
    recovery: [],
    ledger: [],
    timeline: [],
    flags: { settled: false, defaulted: false, recovered: false },
  };
}
