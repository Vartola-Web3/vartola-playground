import { distributeByUnits, splitRecovery, splitRepayment, splitSettlement, type ReservePolicy } from './waterfall-v2';

// Partner sandbox scenarios. They run the same waterfall engine on seeded illustrative numbers. They are NOT
// transactions: no Testnet call is made and no real facility is touched. VTAED amounts have no monetary value.

const FACILITY = { financeAmount: 150_000, termMonths: 24, units: 1_500, gross: 7_000, feeBps: 100 };
const RESERVE: ReservePolicy = { reserveRateBps: 50, reserveTarget: 5_000, permittedUses: ['SHORTFALL', 'RECOVERY_COST'] };
const HOLDERS = [{ id: 'Investor A', units: 750 }, { id: 'Investor B', units: 450 }, { id: 'Investor C', units: 300 }];

export type ScenarioView = {
  key: string;
  name: string;
  steps: string[];
  financial: Record<string, string>;
  asset: string;
  chain: string;
  operational: string;
};

const n = (value: number) => value.toLocaleString('en-US');

function repay(index: number, remaining: number, reserveBalance: number) {
  return splitRepayment({ gross: FACILITY.gross, feeBps: FACILITY.feeBps, reserve: RESERVE, reserveBalance, financeAmount: FACILITY.financeAmount, termMonths: FACILITY.termMonths, paymentIndex: index, remainingPrincipal: remaining });
}

export function buildScenarios(): ScenarioView[] {
  const first = repay(1, FACILITY.financeAmount, 0);
  const remainingAfterOne = FACILITY.financeAmount - first.principal;
  const dist = distributeByUnits(first.principal + first.income, HOLDERS);
  const early = splitSettlement(remainingAfterOne, 900, 1_000, 300);
  const recovery = splitRecovery({ grossProceeds: 90_000, servicingCost: 1_000, recoveryCost: 4_000, principalOutstanding: remainingAfterOne, accruedIncome: 0, reserveBalance: first.reserve, reserveMayCoverShortfall: false });
  return [
    {
      key: 'normal', name: 'Normal facility',
      steps: ['Create facility', 'Underwrite and attest risk', 'Fund by investors', 'Lock escrow', 'Attest release conditions', 'Authorize and release to supplier', 'Deliver asset', 'Activate', 'Repay', 'Distribute'],
      financial: { 'Monthly payment': `${n(FACILITY.gross)} VTAED`, 'Fee': `${n(first.fee)}`, 'Reserve': `${n(first.reserve)}`, 'Principal': `${n(first.principal)}`, 'Income': `${n(first.income)}`, 'Distributed': `${n(dist.distributed)} (dust ${dist.dust})`, 'Outstanding': `${n(remainingAfterOne)}` },
      asset: 'Delivered, registered, insured, active', chain: 'ACTIVE; repayment and distribution events emitted', operational: 'Servicing: payments on schedule',
    },
    {
      key: 'early', name: 'Early settlement',
      steps: ['Operations quotes settlement', 'SME pays settlement', 'Waterfall allocates principal and income', 'Fee to treasury', 'Facility closes once'],
      financial: { 'Settlement due': `${n(early.due)}`, 'Principal': `${n(early.principal)}`, 'Income (after rebate)': `${n(early.income)}`, 'Fee': `${n(early.fee)}` },
      asset: 'Released from financing after settlement', chain: 'COMPLETED; a second close is rejected', operational: 'Closed',
    },
    {
      key: 'late', name: 'Late payment',
      steps: ['Payment due', 'Reminder', 'Grace', 'Late', 'Cure or restructuring review'],
      financial: { 'Amount overdue': `${n(FACILITY.gross)} VTAED`, 'Stage': 'LATE (periods are facility parameters)', 'Investor impact': 'Distribution deferred until cure' },
      asset: 'In service; insurance and registration checked', chain: 'LATE status attested by operations', operational: 'Collections case open; promise to pay recorded',
    },
    {
      key: 'default', name: 'Default and recovery',
      steps: ['Default notice', 'Default', 'Lawful recovery under the applicable agreement and applicable law', 'Asset sale', 'Recovery waterfall', 'Distribution', 'Close'],
      financial: { 'Sale proceeds': '90,000 VTAED', 'Permitted costs': `${n(recovery.costs)}`, 'To principal': `${n(recovery.principal)}`, 'Shortfall': `${n(recovery.shortfall)}`, 'Residual': `${n(recovery.residual)}` },
      asset: 'Recovered and disposed', chain: 'CLOSED; recovery cannot exceed realised proceeds', operational: 'Recovery workspace: expenses, offers, final proceeds recorded',
    },
    {
      key: 'supplier', name: 'Supplier failure',
      steps: ['Escrow funded', 'Supplier cancels or delivers the wrong asset', 'Release stays locked', 'Choose: replace supplier, refund escrow, amend with authorization, or cancel'],
      financial: { 'Escrow held': `${n(FACILITY.financeAmount)} VTAED`, 'Capital released': '0', 'Term change': 'Only with explicit authorization' },
      asset: 'Not delivered', chain: 'Release locked; refund available while unreleased', operational: 'Supplier failure case recorded; no silent term change',
    },
    {
      key: 'insurance', name: 'Insurance event',
      steps: ['Accident or theft reported', 'Claim filed', 'Assessed', 'Proceeds received', 'Applied per facility terms'],
      financial: { 'Claim, deductible and proceeds': 'Recorded per claim', 'Allocation': 'Not automated until facility terms permit it' },
      asset: 'Damaged, total loss or stolen', chain: 'Asset status changed; facility continues or moves to recovery', operational: 'Claim reference, insurer and facility impact tracked',
    },
  ];
}
