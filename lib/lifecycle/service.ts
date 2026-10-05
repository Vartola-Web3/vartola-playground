import { prisma } from '@/lib/db';
import { ACTIVATION_CHECKS, RELEASE_CONDITIONS, allocateShares, isReady, splitPayment } from '@/lib/lifecycle/rules';
import { sendEmail } from '@/lib/services/email';
import { moveReservedToDeployed, payInvestor, debitWallet, creditWallet, simulationDate } from '@/lib/simulation/ledger';
import { tryRecordChainEvent } from '@/lib/stellar/record';

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
    data: { userId: actorId, type: 'DEPLOY', amount: facility.financeAmount, refId: facilityId, note: 'Release recorded on Stellar Testnet when the network confirms it.' },
  });
  await tryRecordChainEvent({
    type: 'RELEASE_FUNDS',
    entityType: 'FacilityRelease',
    entityId: release.id,
    payload: { facilityId, facilityNo: facility.facilityNo, amount: facility.financeAmount },
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
  await tryRecordChainEvent({
    type: 'ACTIVATE_FACILITY',
    entityType: 'Facility',
    entityId: facilityId,
    payload: { facilityNo: facility.facilityNo, amount: facility.financeAmount },
  });
}

export async function activateFundedSimulationPool(poolId: string, actorId: string) {
  const pool = await prisma.pool.findUnique({
    where: { id: poolId },
    include: {
      facilities: {
        include: {
          allocations: true,
          payments: true,
          application: { include: { company: { include: { users: { where: { role: 'SME' } } } } } },
        },
      },
    },
  });
  if (!pool || pool.raisedAmount + 0.001 < pool.targetAmount) return;
  const start = await simulationDate();

  for (const facility of pool.facilities) {
    if (facility.fundedAmount + 0.001 < facility.financeAmount || ['ACTIVE', 'COMPLETED'].includes(facility.status)) continue;
    const sme = facility.application.company.users[0];
    if (!sme) throw new Error('The financed company needs an SME wallet owner');

    await creditWallet({
      ownerType: 'SME', ownerId: sme.id, amount: facility.financeAmount, type: 'FACILITY_DISBURSEMENT',
      idempotencyKey: `facility-disbursement:${facility.id}`, actorId,
      description: `Simulation funding released for ${facility.facilityNo}`, label: facility.application.company.tradingName || facility.application.company.legalName,
    });

    await prisma.$transaction(async (tx) => {
      for (const allocation of facility.allocations) {
        if (allocation.reservedAmount <= 0) continue;
        await tx.facilityAllocation.update({
          where: { id: allocation.id },
          data: { deployedAmount: { increment: allocation.reservedAmount }, reservedAmount: 0, status: 'DEPLOYED' },
        });
        await tx.investment.update({
          where: { id: allocation.investmentId },
          data: { reservedAmount: { decrement: allocation.reservedAmount }, deployedAmount: { increment: allocation.reservedAmount }, activatedAt: start },
        });
      }
      await tx.facility.update({
        where: { id: facility.id },
        data: { status: 'ACTIVE', activatedAt: start, incomeStartDate: start },
      });
      await tx.application.update({ where: { id: facility.applicationId }, data: { status: 'FUNDED' } });
      if (facility.payments.length === 0) {
        for (let index = 1; index <= facility.term; index++) {
          const dueDate = new Date(start);
          dueDate.setMonth(dueDate.getMonth() + index);
          await tx.payment.create({
            data: { facilityId: facility.id, paymentNo: index, dueDate, amount: facility.monthlyPayment, status: 'SCHEDULED' },
          });
        }
      }
    });

    for (const allocation of facility.allocations) {
      await moveReservedToDeployed(allocation.investorId, allocation.reservedAmount, `deploy:${facility.id}:${allocation.id}`);
    }
    await tryRecordChainEvent({
      type: 'ACTIVATE_FACILITY',
      entityType: 'Facility',
      entityId: facility.id,
      payload: { facilityNo: facility.facilityNo, amount: facility.financeAmount },
    });
    await audit(actorId, 'SIMULATION_FACILITY_ACTIVATED', facility.id, { amount: facility.financeAmount, smeId: sme.id });
  }
  await prisma.pool.update({ where: { id: pool.id }, data: { status: 'ACTIVE' } });
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
  const feeSplit = splitPayment(gross, facility.serviceFeeRate, facility.reserveRate);
  const scheduledRows = facility.payments
    .filter((row) => row.status !== 'PAID')
    .sort((a, b) => a.paymentNo - b.paymentNo);
  const scheduled = scheduledRows[0];
  if (!scheduled) throw new Error('No unpaid installment is available');
  if (Math.abs(gross - scheduled.amount) > 0.01) throw new Error(`Payment amount must equal the installment amount ${scheduled.amount}`);
  const alreadyReturned = facility.allocations.reduce((sum, row) => sum + row.principalReturned, 0);
  const remainingPrincipal = Math.max(Math.round((facility.financeAmount - alreadyReturned) * 100) / 100, 0);
  const equalPrincipal = Math.round((facility.financeAmount / Math.max(facility.term, 1)) * 100) / 100;
  const principal = Math.min(
    remainingPrincipal,
    feeSplit.net,
    scheduledRows.length <= 1 ? remainingPrincipal : equalPrincipal,
  );
  const parts = {
    ...feeSplit,
    principal,
    leaseIncome: Math.round((feeSplit.net - principal) * 100) / 100,
  };
  const payment = await prisma.payment.update({
    where: { id: scheduled.id },
    data: {
      paidAmount: gross, paidAt: new Date(), status: 'PAID',
      principalComponent: parts.principal, leaseIncomeComponent: parts.leaseIncome,
      serviceFee: parts.serviceFee, reserveComponent: parts.reserve, idempotencyKey: key,
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
    const distribution = await prisma.distribution.create({
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
    await tryRecordChainEvent({
      type: 'DISTRIBUTE_PAYMENT',
      entityType: 'Distribution',
      entityId: distribution.id,
      payload: {
        facilityId,
        paymentId: payment.id,
        amount: share.principal + share.leaseIncome,
        principal: share.principal,
        income: share.leaseIncome,
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
        note: `${facility.facilityNo}. Profit distribution`,
      },
    });
    await payInvestor(allocation.investorId, share.principal, share.leaseIncome, `dist:${payment.id}:${allocation.id}`);
  }
  await audit(actorId, 'REPAYMENT_RECEIVED', facilityId, parts);
  const principalLeft = Math.round((remainingPrincipal - principal) * 100) / 100;
  if (scheduledRows.length <= 1 && principalLeft <= 0.01) {
    await prisma.facility.update({
      where: { id: facilityId },
      data: { status: 'COMPLETED', closedAt: new Date() },
    });
    if (facility.poolId) {
      const stillOpen = await prisma.facility.count({
        where: { poolId: facility.poolId, status: { not: 'COMPLETED' } },
      });
      if (stillOpen === 0) {
        await prisma.pool.update({ where: { id: facility.poolId }, data: { status: 'COMPLETED' } });
      }
    }
  }
  await tryRecordChainEvent({
    type: 'RECORD_PAYMENT',
    entityType: 'Payment',
    entityId: payment.id,
    payload: { facilityId, facilityNo: facility.facilityNo, paymentNo: payment.paymentNo, gross, ...parts },
  });
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
  const recovery = await prisma.facilityRecovery.create({ data: { facilityId, netProceeds, note: 'Recovery proceeds' } });
  await tryRecordChainEvent({
    type: 'RECORD_RECOVERY',
    entityType: 'FacilityRecovery',
    entityId: recovery.id,
    payload: { facilityId, facilityNo: facility.facilityNo, netProceeds },
  });
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
