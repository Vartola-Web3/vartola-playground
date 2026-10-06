import { prisma } from '@/lib/db';
import { computeFacilityRisk, type FacilityRiskInput } from './facility-score';

// Calculates and records a facility risk score. The full result (model version, input snapshot hash, score,
// grade, timestamp) is written to the audit log so any score can be reproduced from its inputs.
export async function scoreFacility(facilityId: string, actorId: string) {
  const facility = await prisma.facility.findUnique({ where: { id: facilityId }, include: { application: { include: { company: true } }, payments: true } });
  if (!facility?.application) throw new Error('Facility not found');
  const application = facility.application;
  const now = Date.now();
  const company = application.company;
  const [allFinanced, companyFinanced] = await Promise.all([
    prisma.facility.aggregate({ _sum: { financeAmount: true }, where: { status: { notIn: ['COMPLETED', 'CLOSED'] } } }),
    prisma.facility.aggregate({ _sum: { financeAmount: true }, where: { status: { notIn: ['COMPLETED', 'CLOSED'] }, application: { companyId: application.companyId } } }),
  ]);
  const portfolio = allFinanced._sum.financeAmount || 0;
  const mine = companyFinanced._sum.financeAmount || 0;
  const net = company?.monthlyRevenue != null && company?.monthlyExpenses != null ? company.monthlyRevenue - company.monthlyExpenses : null;
  const paid = facility.payments.filter((row) => row.status === 'PAID');
  const input: FacilityRiskInput = {
    businessScore: application.companyRiskScore ?? 50,
    assetScore: application.assetRiskScore ?? 50,
    dealScore: application.dealRiskScore ?? 50,
    servicing: {
      status: facility.status,
      paidOnTime: paid.filter((row) => !row.paidAt || row.paidAt.getTime() <= row.dueDate.getTime() + 5 * 86400000).length,
      paidLate: paid.filter((row) => row.paidAt && row.paidAt.getTime() > row.dueDate.getTime() + 5 * 86400000).length,
      missed: facility.payments.filter((row) => row.status !== 'PAID' && row.dueDate.getTime() < now - 30 * 86400000).length,
      scheduled: facility.payments.length,
    },
    profile: {
      assetValue: application.assetValue,
      smeContribution: application.smeContribution || 0,
      financeAmount: facility.financeAmount,
      monthlyPayment: facility.monthlyPayment,
      monthlyNetCashFlow: net,
      concentrationPct: portfolio > 0 ? Math.round((mine / portfolio) * 1000) / 10 : 100,
      liquidityScore: null,
    },
  };
  const result = computeFacilityRisk(input);
  await prisma.auditLog.create({
    data: { userId: actorId, action: 'FACILITY_RISK_SCORED', entityType: 'Facility', entityId: facilityId, changes: JSON.stringify({ input, result }) },
  });
  return result;
}

export async function latestFacilityRisk(facilityId: string) {
  const row = await prisma.auditLog.findFirst({ where: { entityType: 'Facility', entityId: facilityId, action: 'FACILITY_RISK_SCORED' }, orderBy: { createdAt: 'desc' } });
  return row?.changes ? (JSON.parse(row.changes) as { input: FacilityRiskInput; result: ReturnType<typeof computeFacilityRisk> }) : null;
}
