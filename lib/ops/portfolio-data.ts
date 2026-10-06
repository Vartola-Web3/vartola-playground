import { prisma } from '@/lib/db';
import { isAlphaMode } from '@/lib/config/app-mode';
import { computeExpectedLoss, portfolioExpectedLoss, type ExpectedLossResult } from '@/lib/risk-engine/expected-loss';
import type { Exposure } from '@/lib/risk-engine/portfolio';

// Read-model aggregation for the portfolio risk and treasury pages. Everything is derived from Prisma rows that
// mirror confirmed state; nothing is invented. In Demo mode the values are simulated demo data.

const DRAWN = ['ACTIVE', 'CURRENT', 'LATE', 'PAYMENT_LATE', 'GRACE', 'DEFAULT_NOTICE', 'DEFAULTED', 'REPOSSESSION', 'ASSET_SALE', 'RECOVERY'];
const LATE = ['LATE', 'PAYMENT_LATE', 'GRACE'];
const DEFAULTED = ['DEFAULT_NOTICE', 'DEFAULTED', 'REPOSSESSION', 'ASSET_SALE'];
const LIQUIDITY: Record<string, 'high' | 'medium' | 'low'> = { VEHICLE: 'high', TRUCK: 'high', VAN: 'high', FLEET: 'high', EQUIPMENT: 'medium', MACHINERY: 'medium' };

export const gradeOf = (tier: string | null | undefined): 'A' | 'B' | 'C' | 'D' => {
  const letter = (tier || '').replace('TIER_', '').toUpperCase();
  return letter === 'A' || letter === 'B' || letter === 'C' || letter === 'D' ? letter : 'C';
};

const round = (value: number) => Math.round(value * 100) / 100;

export async function loadExposures() {
  const facilities = await prisma.facility.findMany({
    where: { status: { in: DRAWN } },
    include: { application: { include: { company: true } }, supplier: true, payments: true },
  });
  const rows: (Exposure & { el: ExpectedLossResult })[] = facilities.map((facility) => {
    const returned = facility.payments.filter((payment) => payment.status === 'PAID').reduce((sum, payment) => sum + payment.principalComponent, 0);
    const outstanding = Math.max(0, round(facility.financeAmount - returned));
    const assetType = facility.application?.assetType || 'Unspecified';
    const grade = gradeOf(facility.riskTier || facility.application?.riskTier);
    const liquidity = LIQUIDITY[assetType.toUpperCase().split(/[^A-Z]/)[0]] || 'medium';
    const el = computeExpectedLoss({ grade, outstandingPrincipal: outstanding, assetValue: facility.application?.assetValue || facility.financeAmount, financeAmount: facility.financeAmount, liquidity, status: facility.status });
    return {
      facilityId: facility.id,
      facilityNo: facility.facilityNo,
      sme: facility.application?.company?.legalName || 'Unknown',
      supplier: facility.supplier?.companyName || 'Unassigned',
      assetClass: assetType,
      sector: facility.application?.company?.industry || 'Unspecified',
      geography: facility.application?.company?.emirate || 'Unspecified',
      grade,
      outstanding,
      assetValue: facility.application?.assetValue || facility.financeAmount,
      status: facility.status,
      pd: el.pd,
      lgd: el.lgd,
      el,
    };
  });
  return rows;
}

export async function portfolioRisk() {
  const rows = await loadExposures();
  const total = portfolioExpectedLoss(rows.map((row) => row.el));
  const sum = (filter: (row: (typeof rows)[number]) => boolean) => round(rows.filter(filter).reduce((acc, row) => acc + row.outstanding, 0));
  const points: Record<string, number> = { A: 4, B: 3, C: 2, D: 1 };
  const weight = rows.reduce((acc, row) => acc + row.outstanding, 0);
  const avg = weight > 0 ? rows.reduce((acc, row) => acc + points[row.grade] * row.outstanding, 0) / weight : 0;
  const weighted = weight > 0 ? (avg >= 3.5 ? 'A' : avg >= 2.5 ? 'B' : avg >= 1.5 ? 'C' : 'D') : null;
  return {
    rows,
    exposure: total.exposure,
    expectedLoss: total.expectedLoss,
    lossRate: total.lossRate,
    weightedGrade: weighted,
    lateExposure: sum((row) => LATE.includes(row.status)),
    defaultExposure: sum((row) => DEFAULTED.includes(row.status)),
    recoveryExposure: sum((row) => row.status === 'RECOVERY'),
    highRisk: rows.filter((row) => row.grade === 'D' || row.grade === 'C').map((row) => row.facilityNo),
    mode: isAlphaMode() ? 'ALPHA (Stellar Testnet)' : 'DEMO (simulated data)',
  };
}

export async function treasurySummary() {
  const [facilities, investments, releases, payments, recoveries, ops] = await Promise.all([
    prisma.facility.findMany({ select: { id: true, status: true, financeAmount: true, fundedAmount: true, reserveRate: true, chainStatus: true } }),
    prisma.investment.findMany({ select: { amount: true, deployedAmount: true, principalReturned: true, leaseIncomeReceived: true, status: true } }),
    prisma.facilityRelease.findMany({ select: { amount: true, status: true, chainStatus: true } }),
    prisma.payment.findMany({ select: { amount: true, paidAmount: true, status: true, principalComponent: true, reserveComponent: true } }),
    prisma.facilityRecovery.findMany({ select: { netProceeds: true } }),
    prisma.opsRecord.findMany({ where: { kind: 'FACILITY_RESERVE' } }),
  ]);
  const total = (values: number[]) => round(values.reduce((a, b) => a + b, 0));
  const deployedFacilities = facilities.filter((row) => DRAWN.includes(row.status) || ['COMPLETED', 'CLOSED'].includes(row.status));
  const principalPaid = total(payments.filter((row) => row.status === 'PAID').map((row) => row.principalComponent));
  const reserveBalance = total(ops.map((row) => {
    try { return Number((JSON.parse(row.data) as { reserveBalance?: number }).reserveBalance || 0); } catch { return 0; }
  }));
  return {
    totalCommitted: total(investments.filter((row) => row.status !== 'CANCELLED').map((row) => row.amount)),
    totalFunded: total(facilities.map((row) => row.fundedAmount)),
    totalDeployed: total(releases.filter((row) => row.status !== 'FAILED').map((row) => row.amount)),
    escrowBalance: total(facilities.filter((row) => ['FULLY_FUNDED', 'FUNDED', 'PENDING_FUNDING', 'RELEASE_LOCKED', 'RELEASE_AUTHORIZED'].includes(row.status)).map((row) => row.fundedAmount)),
    supplierReleases: total(releases.filter((row) => row.status === 'RELEASED' || row.status === 'COMPLETED' || row.chainStatus === 'CHAIN_CONFIRMED').map((row) => row.amount)),
    expectedRepayments: total(payments.map((row) => row.amount)),
    receivedRepayments: total(payments.filter((row) => row.status === 'PAID').map((row) => row.paidAmount ?? row.amount)),
    outstandingPrincipal: round(total(deployedFacilities.filter((row) => DRAWN.includes(row.status)).map((row) => row.financeAmount)) - principalPaid),
    investorLiabilities: total(investments.filter((row) => row.status === 'ACTIVE').map((row) => row.deployedAmount - row.principalReturned)),
    reserveBalance,
    recoveryBalance: total(recoveries.map((row) => row.netProceeds)),
    settlementAmounts: total(facilities.filter((row) => row.status === 'COMPLETED').map((row) => row.financeAmount)),
    chainConfirmedFacilities: facilities.filter((row) => row.chainStatus === 'CHAIN_CONFIRMED').length,
    facilities: facilities.length,
    mode: isAlphaMode() ? 'ALPHA' : 'DEMO',
  };
}
