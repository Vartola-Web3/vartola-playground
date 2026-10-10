import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';
import type { PrismaClient } from '@prisma/client';
import { createTestDatabase, type TestDatabase } from '../../test-utils/integration-db';
import { approveBeneficiary, createFacilityScenario } from '../../test-utils/factories';

// Integration tests: they run the real lifecycle services against a throwaway SQLite database that carries
// the real schema. No mocks are used for the ledger, the wallets, or the Prisma read model.

let db: TestDatabase;
let prisma: PrismaClient;
let service: typeof import('@/lib/lifecycle/service');

before(async () => {
  db = await createTestDatabase();
  prisma = db.prisma;
  service = await import('@/lib/lifecycle/service');
});

after(async () => {
  if (prisma) await prisma.$disconnect();
  if (db) db.cleanup();
});

test('recording an installment pays the investor and returns principal', async () => {
  const s = await createFacilityScenario(prisma);

  const payment = await service.recordRepayment(s.facility.id, s.operations.id, s.facility.monthlyPayment, `repay-${s.facility.id}-1`);

  assert.equal(payment.status, 'PAID');
  assert.equal(payment.paidAmount, s.facility.monthlyPayment);

  const allocation = await prisma.facilityAllocation.findUniqueOrThrow({ where: { id: s.allocation.id } });
  assert.ok(allocation.principalReturned > 0, 'principal must be returned to the investor position');

  const distributions = await prisma.distribution.findMany({ where: { facilityId: s.facility.id } });
  assert.equal(distributions.length, 1);
  assert.equal(distributions[0].principalAmount + distributions[0].leaseIncomeAmount, s.facility.monthlyPayment);

  const investorWallet = await prisma.simWallet.findUniqueOrThrow({
    where: { ownerType_ownerId: { ownerType: 'INVESTOR', ownerId: s.investor.id } },
  });
  assert.equal(investorWallet.available, s.facility.monthlyPayment);

  const smeWallet = await prisma.simWallet.findUniqueOrThrow({
    where: { ownerType_ownerId: { ownerType: 'SME', ownerId: s.sme.id } },
  });
  assert.equal(smeWallet.available, s.facility.monthlyPayment * s.facility.term - s.facility.monthlyPayment);
});

test('paying every installment completes the facility', async () => {
  const s = await createFacilityScenario(prisma, { financeAmount: 60_000, term: 3, monthlyPayment: 20_000 });

  for (let index = 1; index <= 3; index += 1) {
    await service.recordRepayment(s.facility.id, s.operations.id, 20_000, `repay-${s.facility.id}-${index}`);
  }

  const facility = await prisma.facility.findUniqueOrThrow({ where: { id: s.facility.id } });
  assert.equal(facility.status, 'COMPLETED');

  const unpaid = await prisma.payment.count({ where: { facilityId: s.facility.id, status: { not: 'PAID' } } });
  assert.equal(unpaid, 0);
});

test('a wrong installment amount is rejected without touching the wallet', async () => {
  const s = await createFacilityScenario(prisma);

  await assert.rejects(
    () => service.recordRepayment(s.facility.id, s.operations.id, 1, `bad-${s.facility.id}`),
    /must equal the installment amount/,
  );

  const smeWallet = await prisma.simWallet.findUniqueOrThrow({
    where: { ownerType_ownerId: { ownerType: 'SME', ownerId: s.sme.id } },
  });
  assert.equal(smeWallet.available, s.facility.monthlyPayment * s.facility.term, 'a rejected payment must not debit the SME');

  const paid = await prisma.payment.count({ where: { facilityId: s.facility.id, status: 'PAID' } });
  assert.equal(paid, 0);
});

test('release is blocked until an approved beneficiary exists, then credits the supplier', async () => {
  const s = await createFacilityScenario(prisma, { reserved: true });
  await service.ensureChecklists(s.facility.id);
  await prisma.facilityReleaseCondition.updateMany({ where: { facilityId: s.facility.id }, data: { status: 'VERIFIED' } });

  await assert.rejects(
    () => service.releaseFacilityFunds(s.facility.id, s.operations.id),
    /beneficiary/i,
  );

  const beneficiary = await approveBeneficiary(prisma, s.facility.id);
  const release = await service.releaseFacilityFunds(s.facility.id, s.operations.id);

  assert.equal(release.status, 'RELEASED');
  const facility = await prisma.facility.findUniqueOrThrow({ where: { id: s.facility.id } });
  assert.equal(facility.status, 'ASSET_DELIVERY_PENDING');

  const supplierWallet = await prisma.simWallet.findUniqueOrThrow({
    where: { ownerType_ownerId: { ownerType: 'SUPPLIER', ownerId: beneficiary.id } },
  });
  assert.equal(supplierWallet.available, s.facility.financeAmount);
});

test('activation requires a release and delivery checks, then deploys reserved capital', async () => {
  const s = await createFacilityScenario(prisma, { reserved: true });

  await assert.rejects(
    () => service.activateFacility(s.facility.id, s.operations.id),
    /release is required/i,
  );

  await service.ensureChecklists(s.facility.id);
  await prisma.facilityReleaseCondition.updateMany({ where: { facilityId: s.facility.id }, data: { status: 'VERIFIED' } });
  await approveBeneficiary(prisma, s.facility.id);
  await service.releaseFacilityFunds(s.facility.id, s.operations.id);

  await assert.rejects(
    () => service.activateFacility(s.facility.id, s.operations.id),
    /delivery checks/i,
  );

  await prisma.facilityActivationCheck.updateMany({ where: { facilityId: s.facility.id }, data: { status: 'VERIFIED' } });
  await service.activateFacility(s.facility.id, s.operations.id);

  const facility = await prisma.facility.findUniqueOrThrow({ where: { id: s.facility.id } });
  assert.equal(facility.status, 'ACTIVE');

  const allocation = await prisma.facilityAllocation.findUniqueOrThrow({ where: { id: s.allocation.id } });
  assert.equal(allocation.status, 'DEPLOYED');
  assert.equal(allocation.reservedAmount, 0);
  assert.equal(allocation.deployedAmount, s.facility.financeAmount);
});
