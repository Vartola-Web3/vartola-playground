import { prisma } from '@/lib/db';
import { positionsForInvestor, type Position } from './positions';
import { latestFacilityRisk } from '@/lib/risk-engine/facility-risk-store';

// Portfolio analytics from the indexed read model (which mirrors confirmed chain state).
// All values are Testnet VTAED. They are simulated and have no monetary value.

export const TESTNET_NOTE = 'Testnet VTAED values are simulated and have no monetary value.';

const DEFAULT_STATUSES = ['DEFAULTED', 'DEFAULT_NOTICE', 'REPOSSESSION', 'ASSET_SALE', 'RECOVERY'];
const LATE_STATUSES = ['LATE', 'PAYMENT_LATE', 'GRACE'];
// Principal is only outstanding once the supplier has been paid and the facility is running.
const DRAWN_STATUSES = ['ACTIVE', ...LATE_STATUSES, ...DEFAULT_STATUSES];
const GRADE_POINTS: Record<string, number> = { A: 4, B: 3, C: 2, D: 1 };

export function gradeFromPoints(points: number): 'A' | 'B' | 'C' | 'D' {
  if (points >= 3.5) return 'A';
  if (points >= 2.5) return 'B';
  if (points >= 1.5) return 'C';
  return 'D';
}

export type InvestorAnalytics = {
  totalDeployed: number;
  outstandingPrincipal: number;
  principalReturned: number;
  incomeReceived: number;
  recoveryReceived: number;
  weightedRiskGrade: 'A' | 'B' | 'C' | 'D' | null;
  activeFacilities: number;
  lateFacilities: number;
  defaultExposure: number;
  note: string;
};

// Pure aggregation so it can be tested without a database.
export function summarizeInvestor(positions: Position[], grades: Record<string, string | null>): InvestorAnalytics {
  const sum = (pick: (row: Position) => number) => Math.round(positions.reduce((total, row) => total + pick(row), 0) * 100) / 100;
  let weight = 0;
  let points = 0;
  for (const row of positions) {
    const grade = grades[row.facilityId];
    if (grade && GRADE_POINTS[grade] && row.committedAmount > 0) {
      weight += row.committedAmount;
      points += GRADE_POINTS[grade] * row.committedAmount;
    }
  }
  return {
    totalDeployed: sum((row) => row.deployedAmount),
    outstandingPrincipal: sum((row) => row.outstandingExposure),
    principalReturned: sum((row) => row.principalReturned),
    incomeReceived: sum((row) => row.incomeReceived),
    recoveryReceived: sum((row) => row.recoveryReceived),
    weightedRiskGrade: weight > 0 ? gradeFromPoints(points / weight) : null,
    activeFacilities: positions.filter((row) => row.facilityStatus === 'ACTIVE').length,
    lateFacilities: positions.filter((row) => LATE_STATUSES.includes(row.facilityStatus)).length,
    defaultExposure: sum((row) => (DEFAULT_STATUSES.includes(row.facilityStatus) ? row.outstandingExposure : 0)),
    note: TESTNET_NOTE,
  };
}

export async function investorAnalytics(investorId: string): Promise<InvestorAnalytics> {
  const positions = await positionsForInvestor(investorId);
  const grades: Record<string, string | null> = {};
  for (const row of positions) grades[row.facilityId] = (await latestFacilityRisk(row.facilityId))?.result.grade || null;
  return summarizeInvestor(positions, grades);
}

export type AdminAnalytics = {
  onChainValue: number;
  totalFacilities: number;
  fundingRate: number;
  repaymentRate: number;
  outstandingPrincipal: number;
  lateExposure: number;
  defaultExposure: number;
  recoveryRate: number;
  note: string;
};

export type FacilityFigures = { status: string; financeAmount: number; fundedAmount: number; principalReturned: number; recoveryReceived: number; scheduledDue: number; paid: number };

export function summarizeAdmin(rows: FacilityFigures[]): AdminAnalytics {
  const round = (value: number) => Math.round(value * 100) / 100;
  const target = rows.reduce((total, row) => total + row.financeAmount, 0);
  const funded = rows.reduce((total, row) => total + row.fundedAmount, 0);
  const due = rows.reduce((total, row) => total + row.scheduledDue, 0);
  const paid = rows.reduce((total, row) => total + row.paid, 0);
  const outstanding = (row: FacilityFigures) => (DRAWN_STATUSES.includes(row.status) ? Math.max(row.financeAmount - row.principalReturned - row.recoveryReceived, 0) : 0);
  const defaultRows = rows.filter((row) => DEFAULT_STATUSES.includes(row.status) || (row.status === 'CLOSED' && row.recoveryReceived > 0));
  const defaulted = defaultRows.reduce((total, row) => total + row.financeAmount - row.principalReturned, 0);
  const recovered = defaultRows.reduce((total, row) => total + row.recoveryReceived, 0);
  return {
    onChainValue: round(funded),
    totalFacilities: rows.length,
    fundingRate: target > 0 ? round(funded / target) : 0,
    repaymentRate: due > 0 ? round(paid / due) : 0,
    outstandingPrincipal: round(rows.reduce((total, row) => total + outstanding(row), 0)),
    lateExposure: round(rows.filter((row) => LATE_STATUSES.includes(row.status)).reduce((total, row) => total + outstanding(row), 0)),
    defaultExposure: round(rows.filter((row) => DEFAULT_STATUSES.includes(row.status)).reduce((total, row) => total + outstanding(row), 0)),
    recoveryRate: defaulted > 0 ? round(recovered / defaulted) : 0,
    note: TESTNET_NOTE,
  };
}

export async function adminAnalytics(): Promise<AdminAnalytics> {
  const facilities = await prisma.facility.findMany({ where: { chainStatus: 'CHAIN_CONFIRMED' }, include: { allocations: true, payments: true } });
  return summarizeAdmin(facilities.map((facility) => ({
    status: facility.status,
    financeAmount: facility.financeAmount,
    fundedAmount: facility.fundedAmount,
    principalReturned: facility.allocations.reduce((total, row) => total + row.principalReturned, 0),
    recoveryReceived: facility.allocations.reduce((total, row) => total + row.recoveryReceived, 0),
    scheduledDue: facility.payments.filter((row) => row.status === 'PAID' || row.dueDate.getTime() <= Date.now()).reduce((total, row) => total + row.amount, 0),
    paid: facility.payments.filter((row) => row.status === 'PAID').reduce((total, row) => total + (row.paidAmount ?? row.amount), 0),
  })));
}
