import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth/auth';
import { poolAvailable } from '@/lib/marketplace/allocate';
import { poolRiskScore } from '@/lib/marketplace/risk';
import { stellarReviewUrl } from '@/lib/stellar/explorer';

export async function GET() {
  const session = await auth();
  const investorId = session?.user?.role === 'INVESTOR' ? session.user.id : '';
  const pools = await prisma.pool.findMany({
    where: {
      status: { in: ['OPEN', 'PARTIALLY_FUNDED', 'FUNDING'] },
      facilities: { some: {} },
    },
    include: {
      facilities: {
        include: {
          application: { include: { company: true } },
          payments: { where: { status: { in: ['SCHEDULED', 'LATE'] } }, orderBy: { dueDate: 'asc' }, take: 1 },
        },
      },
      investments: { where: { investorId } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    pools: pools.map((pool) => {
      const companies = new Set(pool.facilities.map((facility) => facility.application.companyId));
      const assets = pool.facilities.length;
      const risk = pool.riskScore
        ? { score: pool.riskScore, rating: pool.riskRating || 'B' }
        : poolRiskScore({
            companyQuality: 72,
            assetQuality: 78,
            diversification: Math.min(100, companies.size * 18),
            smeContribution: 70,
            concentrationRisk: assets <= 1 ? 80 : 30,
          });
      return {
        id: pool.id,
        poolNo: pool.poolNo,
        reviewUrl: stellarReviewUrl(pool.stellarTxHash),
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
        assets,
        riskScore: risk.score,
        riskRating: risk.rating,
        incompletePolicy: pool.incompletePolicy,
        businesses: [...companies].map((companyId) => {
          const facility = pool.facilities.find((item) => item.application.companyId === companyId);
          const company = facility?.application.company;
          return {
            name: company?.legalName || 'Operator',
            industry: company?.industry || 'Logistics',
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
          financeAmount: facility.financeAmount,
          status: facility.status,
        })),
        unitCount: pool.facilities.reduce((sum, facility) => sum + (facility.application.unitCount || 1), 0),
        nextPayment: (() => {
          const next = pool.facilities.flatMap((facility) => facility.payments).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];
          return next ? { dueDate: next.dueDate, amount: next.amount } : null;
        })(),
        myInvestment: pool.investments.length
          ? {
              amount: pool.investments.reduce((sum, item) => sum + item.amount, 0),
              income: pool.investments.reduce((sum, item) => sum + item.leaseIncomeReceived, 0),
              status: pool.investments[0].status,
            }
          : null,
      };
    }).filter((pool) => pool.available > 0 && pool.assets > 0),
  });
}
