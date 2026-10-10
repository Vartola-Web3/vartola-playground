import type { PrismaClient } from '@prisma/client';

// Small factories for integration tests. They create realistic, self-contained records with unique keys so
// parallel test files never collide. They take the Prisma client as an argument (never import the singleton),
// so the harness controls which database is used.

let counter = 0;
const suffix = () => `${Date.now()}-${process.pid}-${++counter}`;

export async function createCompanyWithUsers(prisma: PrismaClient) {
  const key = suffix();
  const company = await prisma.company.create({
    data: {
      tradeLicenseNo: `TL-${key}`,
      legalName: `Test Logistics ${key}`,
      tradingName: `Test ${key}`,
      emirate: 'Dubai',
      industry: 'LOGISTICS',
      establishedDate: new Date('2020-01-01'),
      monthlyRevenue: 120_000,
      monthlyExpenses: 70_000,
      liabilities: 40_000,
      contactEmail: `company-${key}@test.ae`,
      contactPhone: '+971500000000',
      address: 'Dubai, UAE',
    },
  });
  const sme = await prisma.user.create({
    data: { email: `sme-${key}@test.ae`, passwordHash: 'not-a-real-hash', name: 'Test SME', role: 'SME', companyId: company.id },
  });
  const investor = await prisma.user.create({
    data: { email: `investor-${key}@test.ae`, passwordHash: 'not-a-real-hash', name: 'Test Investor', role: 'INVESTOR' },
  });
  const operations = await prisma.user.create({
    data: { email: `ops-${key}@test.ae`, passwordHash: 'not-a-real-hash', name: 'Test Operations', role: 'ADMIN' },
  });
  return { company, sme, investor, operations };
}

export type FacilityScenario = Awaited<ReturnType<typeof createFacilityScenario>>;

export async function createFacilityScenario(
  prisma: PrismaClient,
  options: { financeAmount?: number; term?: number; monthlyPayment?: number; reserved?: boolean } = {},
) {
  const { company, sme, investor, operations } = await createCompanyWithUsers(prisma);
  const key = suffix();
  const financeAmount = options.financeAmount ?? 120_000;
  const term = options.term ?? 12;
  const monthlyPayment = options.monthlyPayment ?? 12_000;
  const units = Math.round(financeAmount / 100);
  const reserved = options.reserved ?? false;
  const start = new Date('2026-10-01T00:00:00.000Z');

  const application = await prisma.application.create({
    data: {
      applicationNo: `APP-${key}`,
      companyId: company.id,
      submittedBy: sme.id,
      assetType: 'CARGO_VAN',
      unitCount: 2,
      assetDescription: 'Delivery vans',
      assetValue: financeAmount + 30_000,
      smeContribution: 30_000,
      financeAmount,
      requestedTerm: term,
      status: reserved ? 'FUNDED' : 'APPROVED',
    },
  });

  const pool = await prisma.pool.create({
    data: {
      poolNo: `POOL-${key}`,
      poolName: `Test Pool ${key}`,
      targetAmount: financeAmount,
      raisedAmount: financeAmount,
      minInvestment: 1_000,
      targetReturn: 12,
      status: 'ACTIVE',
      assetFocus: 'LOGISTICS',
    },
  });

  const facility = await prisma.facility.create({
    data: {
      facilityNo: `FAC-${key}`,
      applicationId: application.id,
      poolId: pool.id,
      financeAmount,
      term,
      monthlyPayment,
      fundedAmount: financeAmount,
      participationUnits: units,
      unitValue: 100,
      serviceFeeRate: 0,
      reserveRate: 0,
      status: reserved ? 'FULLY_FUNDED' : 'ACTIVE',
      activatedAt: reserved ? null : start,
      incomeStartDate: reserved ? null : start,
    },
  });

  const investment = await prisma.investment.create({
    data: {
      investorId: investor.id,
      poolId: pool.id,
      amount: financeAmount,
      shares: financeAmount,
      status: 'ACTIVE',
      reservedAmount: reserved ? financeAmount : 0,
      deployedAmount: reserved ? 0 : financeAmount,
      participationUnits: units,
    },
  });

  const allocation = await prisma.facilityAllocation.create({
    data: {
      investmentId: investment.id,
      facilityId: facility.id,
      investorId: investor.id,
      poolId: pool.id,
      allocatedAmount: financeAmount,
      reservedAmount: reserved ? financeAmount : 0,
      deployedAmount: reserved ? 0 : financeAmount,
      participationUnits: units,
      status: reserved ? 'RESERVED' : 'DEPLOYED',
    },
  });

  for (let index = 1; index <= term; index += 1) {
    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + index);
    await prisma.payment.create({
      data: { facilityId: facility.id, paymentNo: index, dueDate, amount: monthlyPayment, status: 'SCHEDULED' },
    });
  }

  // Fund the SME wallet so installments can be paid without an external top-up.
  await prisma.simWallet.create({
    data: { ownerType: 'SME', ownerId: sme.id, currency: 'tAED', available: monthlyPayment * term },
  });
  await prisma.simWallet.create({
    data: { ownerType: 'INVESTOR', ownerId: investor.id, currency: 'tAED' },
  });

  return { company, sme, investor, operations, application, pool, facility, investment, allocation };
}

export async function approveBeneficiary(prisma: PrismaClient, facilityId: string) {
  return prisma.beneficiary.create({
    data: { type: 'SUPPLIER', legalName: `Supplier ${suffix()}`, verificationStatus: 'APPROVED' },
  }).then((beneficiary) => prisma.facility.update({ where: { id: facilityId }, data: { beneficiaryId: beneficiary.id } }).then(() => beneficiary));
}
