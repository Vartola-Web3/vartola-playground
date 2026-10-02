import { prisma } from '@/lib/db';
import { ACTIVATION_CHECKS, RELEASE_CONDITIONS, allocateShares, isReady, splitPayment } from '@/lib/lifecycle/rules';
import { sendEmail } from '@/lib/services/email';
import { moveReservedToDeployed, payInvestor, debitWallet, creditWallet } from '@/lib/simulation/ledger';

async function audit(userId: string, action: string, entityId: string, changes: object) {
  await prisma.auditLog.create({
    data: { userId, action, entityType: 'Facility', entityId, changes: JSON.stringify(changes) },
  });
}

export async function ensureChecklists(facilityId: string) {
  for (const [conditionType, label] of RELEASE_CONDITIONS) {
    await prisma.facilityReleaseCondition.upsert({
      where: { facilityId_conditionType: { facilityId, conditionType } },
      update: {},
      create: { facilityId, conditionType, label, status: conditionType === 'FULLY_FUNDED' ? 'PENDING' : 'PENDING' },
    });
  }
  for (const [checkType, label] of ACTIVATION_CHECKS) {
    await prisma.facilityActivationCheck.upsert({
      where: { facilityId_checkType: { facilityId, checkType } },
      update: {},
      create: { facilityId, checkType, label },
    });
  }
}

export async function refreshFundingStatus(facilityId: string) {
  const facility = await prisma.facility.findUnique({ where: { id: facilityId }, include: { releaseConditions: true } });
  if (!facility) throw new Error('Facility not found');
  const funded = facility.fundedAmount >= facility.financeAmount;
  if (funded) {
    await prisma.facilityReleaseCondition.updateMany({
      where: { facilityId, conditionType: 'FULLY_FUNDED' },
      data: { status: 'VERIFIED', verifiedAt: new Date() },
    });
  }
  const conditions = await prisma.facilityReleaseCondition.findMany({ where: { facilityId } });
  if (isReady(facility.fundedAmount, facility.financeAmount, conditions) && !['RELEASED', 'ACTIVE', 'COMPLETED'].includes(facility.status)) {
    await prisma.facility.update({ where: { id: facilityId }, data: { status: 'READY_FOR_RELEASE' } });
  } else if (funded && facility.status === 'FUNDING') {
    await prisma.facility.update({ where: { id: facilityId }, data: { status: 'FULLY_FUNDED' } });
  }
}

export async function releaseFacilityFunds(facilityId: string, actorId: string) {
  const existing = await prisma.facilityRelease.findUnique({ where: { facilityId } });
  if (existing) throw new Error('Facility was already released');
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    include: { releaseConditions: true, beneficiary: true },
  });
  if (!facility) throw new Error('Facility not found');
  if (!facility.beneficiary || facility.beneficiary.verificationStatus !== 'APPROVED') {
    throw new Error('Approved beneficiary is required');
  }
  if (!isReady(facility.fundedAmount, facility.financeAmount, facility.releaseConditions)) {
    throw new Error('Release conditions are incomplete');
  }
  if (facility.financeAmount <= 0) throw new Error('Release amount is invalid');

  const release = await prisma.facilityRelease.create({
    data: {
      facilityId,
      amount: facility.financeAmount,
      idempotencyKey: `release:${facilityId}`,
      status: 'RELEASED',
      txHash: null,
    },
  });
  await prisma.facility.update({ where: { id: facilityId }, data: { status: 'ASSET_DELIVERY_PENDING' } });
  if (facility.beneficiary) {
    await creditWallet({
      ownerType: 'SUPPLIER',
      ownerId: facility.beneficiary.id,
      amount: facility.financeAmount,
      type: 'FACILITY_RELEASE',
      idempotencyKey: `release-credit:${facilityId}`,
      actorId,
      description: 'Simulation ledger release to approved beneficiary. No blockchain hash.',
      label: facility.beneficiary.legalName,
    });
  }
  await prisma.walletLedger.create({
    data: { userId: actorId, type: 'DEPLOY', amount: facility.financeAmount, refId: facilityId, note: 'Release recorded. Chain settlement pending.' },
  });
  await audit(actorId, 'FUNDS_RELEASED', facilityId, { amount: facility.financeAmount, beneficiary: facility.beneficiary.legalName });
  return release;
}

export async function activateFacility(facilityId: string, actorId: string) {
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    include: { activationChecks: true, allocations: true },
  });
  if (!facility) throw new Error('Facility not found');
  const released = await prisma.facilityRelease.findUnique({ where: { facilityId } });
  if (!released) throw new Error('Release is required before activation');
  const pending = facility.activationChecks.filter((check) => check.status !== 'VERIFIED');
  if (pending.length > 0) throw new Error('Delivery checks are incomplete');

  const start = new Date();
  await prisma.$transaction(async (tx) => {
    for (const allocation of facility.allocations) {
      if (allocation.reservedAmount <= 0) continue;
      await tx.facilityAllocation.update({
        where: { id: allocation.id },
        data: {
          deployedAmount: allocation.deployedAmount + allocation.reservedAmount,
          reservedAmount: 0,
          status: 'DEPLOYED',
        },
      });
      await tx.investment.update({
        where: { id: allocation.investmentId },
        data: {
          reservedAmount: { decrement: allocation.reservedAmount },
          deployedAmount: { increment: allocation.reservedAmount },
        },
      });
    }
    await tx.facility.update({
      where: { id: facilityId },
      data: { status: 'ACTIVE', activatedAt: start, incomeStartDate: start },
    });
  });
  await audit(actorId, 'FACILITY_ACTIVATED', facilityId, { incomeStartDate: start.toISOString() });
  for (const allocation of facility.allocations) {
    await moveReservedToDeployed(allocation.investorId, allocation.reservedAmount, `deploy:${facilityId}:${allocation.id}`);
  }
}

export async function recordRepayment(facilityId: string, actorId: string, gross: number, key: string) {
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    include: { allocations: true, payments: true, application: true },
  });
  if (!facility) throw new Error('Facility not found');
  if (facility.incomeStartDate == null || facility.status !== 'ACTIVE') throw new Error('Income starts only after the facility is active');
  const payer = await prisma.user.findFirst({ where: { companyId: facility.application?.companyId, role: 'SME' } });
  if (payer) await debitWallet('SME', payer.id, gross, `sme-pay:${key}`, facility.facilityNo);
  const parts = splitPayment(gross, facility.serviceFeeRate, facility.reserveRate);
  const payment = await prisma.payment.create({
    data: {
      facilityId,
      paymentNo: facility.payments.length + 1,
      dueDate: new Date(),
      amount: gross,
      paidAmount: gross,
      paidAt: new Date(),
      status: 'PAID',
      principalComponent: parts.principal,
      leaseIncomeComponent: parts.leaseIncome,
      serviceFee: parts.serviceFee,
      reserveComponent: parts.reserve,
      idempotencyKey: key,
    },
  });
  const shares = allocateShares(
    facility.allocations.map((row) => ({ id: row.id, deployedAmount: row.deployedAmount })),
    parts.principal,
    parts.leaseIncome
  );
  for (const share of shares) {
    if (share.principal + share.leaseIncome <= 0) continue;
    const allocation = facility.allocations.find((row) => row.id === share.id)!;
    await prisma.distribution.create({
      data: {
        investmentId: allocation.investmentId,
        paymentId: payment.id,
        facilityId,
        amount: share.principal + share.leaseIncome,
        principalAmount: share.principal,
        leaseIncomeAmount: share.leaseIncome,
        status: 'CONFIRMED',
      },
    });
    await prisma.facilityAllocation.update({
      where: { id: allocation.id },
      data: {
        principalReturned: { increment: share.principal },
        leaseIncomeReceived: { increment: share.leaseIncome },
      },
    });
    await prisma.investment.update({
      where: { id: allocation.investmentId },
      data: {
        principalReturned: { increment: share.principal },
        leaseIncomeReceived: { increment: share.leaseIncome },
      },
    });
    await prisma.walletLedger.create({
      data: {
        userId: allocation.investorId,
        type: 'LEASE_INCOME',
        amount: share.principal + share.leaseIncome,
        refId: payment.id,
        note: `${facility.facilityNo}. Settlement: Simulation Ledger`,
      },
    });
    await payInvestor(allocation.investorId, share.principal, share.leaseIncome, `dist:${payment.id}:${allocation.id}`);
  }
  await audit(actorId, 'REPAYMENT_RECEIVED', facilityId, parts);
  const investors = await prisma.user.findMany({
    where: { id: { in: facility.allocations.map((row) => row.investorId) } },
    select: { email: true },
  });
  await Promise.all(investors.map((person) => sendEmail({
    to: person.email,
    subject: `Repayment recorded for ${facility.facilityNo}`,
    body: 'A facility repayment was allocated to your deployed position. This is a testnet demo.',
  })));
  return payment;
}

export async function settleEarly(facilityId: string, actorId: string, amount: number) {
  await recordRepayment(facilityId, actorId, amount, `settle:${facilityId}`);
  await prisma.facility.update({
    where: { id: facilityId },
    data: { status: 'COMPLETED', settledEarly: true, closedAt: new Date() },
  });
  await audit(actorId, 'EARLY_SETTLEMENT', facilityId, { amount });
}

export async function markStatus(facilityId: string, actorId: string, status: string, reason: string) {
  const allowed = ['PAYMENT_LATE', 'DEFAULT_REVIEW', 'DEFAULTED', 'REPOSSESSION_PENDING', 'REPOSSESSED', 'RESALE_PENDING', 'CLOSED'];
  if (!allowed.includes(status)) throw new Error('Status is not allowed');
  await prisma.facility.update({ where: { id: facilityId }, data: { status } });
  await audit(actorId, status, facilityId, { reason });
}

export async function recordRecovery(facilityId: string, actorId: string, netProceeds: number) {
  const facility = await prisma.facility.findUnique({ where: { id: facilityId }, include: { allocations: true } });
  if (!facility) throw new Error('Facility not found');
  await prisma.facilityRecovery.create({ data: { facilityId, netProceeds, note: 'Recovery proceeds' } });
  const shares = allocateShares(
    facility.allocations.map((row) => ({ id: row.id, deployedAmount: Math.max(row.deployedAmount - row.principalReturned, 0) })),
    netProceeds,
    0
  );
  for (const share of shares) {
    if (share.principal <= 0) continue;
    const allocation = facility.allocations.find((row) => row.id === share.id)!;
    await prisma.facilityAllocation.update({
      where: { id: allocation.id },
      data: { recoveryReceived: { increment: share.principal } },
    });
    await prisma.walletLedger.create({
      data: { userId: allocation.investorId, type: 'RECOVERY', amount: share.principal, refId: facilityId, note: 'Recovery' },
    });
  }
  await prisma.facility.update({ where: { id: facilityId }, data: { status: 'RECOVERED' } });
  await audit(actorId, 'RECOVERY_DISTRIBUTED', facilityId, { netProceeds });
}
