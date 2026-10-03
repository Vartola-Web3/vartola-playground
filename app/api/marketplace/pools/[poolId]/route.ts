import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { poolAvailable } from '@/lib/marketplace/allocate';
import { poolRiskScore } from '@/lib/marketplace/risk';
import { stellarReviewUrl } from '@/lib/stellar/explorer';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ poolId: string }> },
) {
  const { poolId } = await params;
  const pool = await prisma.pool.findFirst({
    where: {
      id: poolId,
      status: { not: 'DRAFT' },
      facilities: { some: {} },
    },
    include: {
      facilities: {
        include: {
          application: { include: { company: true } },
          payments: { where: { status: { in: ['SCHEDULED', 'LATE'] } }, orderBy: { dueDate: 'asc' }, take: 1 },
        },
      },
    },
  });

  if (!pool) {
    return NextResponse.json({ error: 'Opportunity not found or it has no linked assets.' }, { status: 404 });
  }

  const companies = new Set(pool.facilities.map((facility) => facility.application.companyId));
  const facilityIds = pool.facilities.map((facility) => facility.id);
  const [payments, distributions, investments, releases, recoveries] = await Promise.all([
    prisma.payment.findMany({ where: { facilityId: { in: facilityIds } }, select: { id: true } }),
    prisma.distribution.findMany({ where: { facilityId: { in: facilityIds } }, select: { id: true } }),
    prisma.investment.findMany({ where: { poolId: pool.id }, select: { id: true } }),
    prisma.facilityRelease.findMany({ where: { facilityId: { in: facilityIds } }, select: { id: true } }),
    prisma.facilityRecovery.findMany({ where: { facilityId: { in: facilityIds } }, select: { id: true } }),
  ]);
  const matches = [
    { entityType: 'Pool', entityId: pool.id },
    ...idsOf('Facility', facilityIds),
    ...idsOf('Payment', payments.map((row) => row.id)),
    ...idsOf('Distribution', distributions.map((row) => row.id)),
    ...idsOf('Investment', investments.map((row) => row.id)),
    ...idsOf('FacilityRelease', releases.map((row) => row.id)),
    ...idsOf('FacilityRecovery', recoveries.map((row) => row.id)),
  ];
  const operations = await prisma.stellarTransaction.findMany({
    where: { status: 'CONFIRMED', OR: matches },
    orderBy: { createdAt: 'desc' },
    select: { id: true, type: true, entityType: true, txHash: true, payload: true, confirmedAt: true, createdAt: true },
  });
  const references = operations.flatMap((operation) => {
    const reviewUrl = stellarReviewUrl(operation.txHash);
    if (!reviewUrl) return [];
    let amount: number | null = null;
    try {
      const payload = JSON.parse(operation.payload) as { amount?: unknown; gross?: unknown; targetAmount?: unknown };
      const value = payload.gross ?? payload.amount ?? payload.targetAmount;
      if (typeof value === 'number') amount = value;
    } catch {
      amount = null;
    }
    return [{
      id: operation.id,
      label: referenceLabel(operation.type, operation.entityType),
      amount,
      at: operation.confirmedAt || operation.createdAt,
      reviewUrl,
    }];
  });
  const risk = pool.riskScore
    ? { score: pool.riskScore, rating: pool.riskRating || 'B' }
    : poolRiskScore({
        companyQuality: 72,
        assetQuality: 78,
        diversification: Math.min(100, companies.size * 18),
        smeContribution: 70,
        concentrationRisk: pool.facilities.length <= 1 ? 80 : 30,
      });

  return NextResponse.json({
    pool: {
      id: pool.id,
      poolNo: pool.poolNo,
      reviewUrl: stellarReviewUrl(pool.stellarTxHash),
      references,
      poolName: pool.poolName,
      description: pool.description,
      fleetType: pool.fleetType,
      assetFocus: pool.assetFocus,
      status: pool.status,
      targetAmount: pool.targetAmount,
      raisedAmount: pool.raisedAmount,
      available: poolAvailable(pool.targetAmount, pool.raisedAmount),
      minInvestment: pool.minInvestment,
      indicativeYield: pool.targetReturn,
      termMonths: pool.termMonths,
      companies: companies.size,
      facilities: pool.facilities.length,
      assets: pool.facilities.length,
      unitCount: pool.facilities.reduce((sum, facility) => sum + (facility.application.unitCount || 1), 0),
      riskScore: risk.score,
      riskRating: risk.rating,
      incompletePolicy: pool.incompletePolicy,
      businesses: [...companies].map((companyId) => {
        const facility = pool.facilities.find((candidate) => candidate.application.companyId === companyId);
        const company = facility?.application.company;
        return {
          name: company?.tradingName || company?.legalName || 'Operator',
          legalName: company?.legalName,
          industry: company?.industry || 'Logistics',
          emirate: company?.emirate,
          since: company?.establishedDate,
          score: facility?.application.companyRiskScore,
          tier: facility?.application.riskTier,
        };
      }),
      vehicles: pool.facilities.map((facility) => ({
        no: facility.facilityNo,
        description: facility.application.assetDescription,
        type: facility.application.assetType,
        units: facility.application.unitCount,
        value: facility.application.assetValue,
        contribution: facility.application.smeContribution,
        financeAmount: facility.financeAmount,
        status: facility.status,
      })),
    },
  });
}

function idsOf(entityType: string, entityIds: string[]) {
  return entityIds.length ? [{ entityType, entityId: { in: entityIds } }] : [];
}

function referenceLabel(type: string, entityType: string) {
  if (type === 'RECORD_PAYMENT') return 'Installment';
  if (type === 'DISTRIBUTE_PAYMENT') return 'Profit distribution';
  if (type === 'SUBSCRIBE_POOL') return 'Investment';
  if (type === 'CREATE_FACILITY') return 'Asset';
  if (type === 'ACTIVATE_FACILITY') return 'Activation';
  if (type === 'RELEASE_FUNDS') return 'Release';
  if (type === 'RECORD_RECOVERY') return 'Recovery';
  if (type === 'FUND_WALLET') return 'Top-up';
  if (entityType === 'Pool') return 'Opportunity';
  return type.replaceAll('_', ' ');
}
