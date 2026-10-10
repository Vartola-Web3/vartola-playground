import { createHash } from 'crypto';
import { prisma } from '@/lib/db';
import { isReady } from '@/lib/lifecycle/rules';
import {
  activateOnChain,
  advanceOnChain,
  attestReleaseCondition,
  authorizeRelease,
  lockRelease,
  RELEASE_CONDITION_CODES,
  recoverOnChain,
  releaseToSupplier,
  repayOnChain,
  settleOnChain,
  setAssetStatus,
  syncComplianceOnChain,
} from '@/lib/alpha/chain';
import {
  bps,
  distributeByUnits,
  incomeComponent,
  netAmount,
  platformFee,
  principalComponent,
  reserveAmount,
  settlementAmount,
  stroopsToVtaed,
  vtaedToStroops,
} from '@/lib/alpha/money';

async function payerForFacility(facilityId: string) {
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    include: { application: true, allocations: { orderBy: { createdAt: 'asc' } }, payments: true, releaseConditions: true, activationChecks: true, supplier: true, beneficiary: true },
  });
  if (!facility?.application) throw new Error('Facility not found');
  const payer = await prisma.user.findFirst({ where: { companyId: facility.application.companyId, role: 'SME' } });
  if (!payer) throw new Error('SME account is missing');
  return { facility, payer };
}

export async function alphaRecordRepayment(facilityId: string, actorId: string, gross: number, key: string) {
  const { facility, payer } = await payerForFacility(facilityId);
  if (facility.status !== 'ACTIVE') throw new Error('Income starts only after the facility is active');
  const scheduled = facility.payments.filter((row) => row.status !== 'PAID').sort((a, b) => a.paymentNo - b.paymentNo)[0];
  if (!scheduled) throw new Error('No unpaid installment is available');
  if (Math.abs(gross - scheduled.amount) > 0.01) throw new Error(`Payment amount must equal the installment amount ${scheduled.amount}`);
  await prisma.payment.update({ where: { id: scheduled.id }, data: { chainStatus: 'CHAIN_PENDING' } });
  try {
    const result = await repayOnChain(facilityId, payer.id, gross, scheduled.paymentNo, key);
    const grossStroops = vtaedToStroops(gross);
    const feeBps = bps(facility.serviceFeeRate);
    const reserveBps = bps(facility.reserveRate);
    const net = netAmount(grossStroops, feeBps, reserveBps);
    const returned = facility.allocations.reduce((sum, row) => sum + row.principalReturned, 0);
    const remaining = vtaedToStroops(Math.max(facility.financeAmount - returned, 0));
    const principal = principalComponent(vtaedToStroops(facility.financeAmount), facility.term, scheduled.paymentNo, remaining, net);
    const income = incomeComponent(net, principal);
    const shares = distributeByUnits(
      facility.allocations.map((row) => ({ units: BigInt(row.participationUnits) })),
      principal,
      income,
    );
    await prisma.payment.update({
      where: { id: scheduled.id },
      data: {
        paidAmount: gross,
        paidAt: new Date(),
        status: 'PAID',
        chainStatus: 'CHAIN_CONFIRMED',
        stellarTxHash: result.hash,
        principalComponent: stroopsToVtaed(principal),
        leaseIncomeComponent: stroopsToVtaed(income),
        serviceFee: stroopsToVtaed(platformFee(grossStroops, feeBps)),
        reserveComponent: stroopsToVtaed(reserveAmount(grossStroops, reserveBps)),
        idempotencyKey: key,
      },
    });
    for (let index = 0; index < facility.allocations.length; index += 1) {
      const allocation = facility.allocations[index];
      const share = shares[index];
      const principalAmount = stroopsToVtaed(share.principal);
      const incomeAmount = stroopsToVtaed(share.income);
      await prisma.distribution.create({
        data: {
          investmentId: allocation.investmentId,
          paymentId: scheduled.id,
          facilityId,
          amount: principalAmount + incomeAmount,
          principalAmount,
          leaseIncomeAmount: incomeAmount,
          status: 'CONFIRMED',
          chainStatus: 'CHAIN_CONFIRMED',
          stellarTxHash: result.hash,
        },
      });
      await prisma.facilityAllocation.update({
        where: { id: allocation.id },
        data: {
          principalReturned: { increment: principalAmount },
          leaseIncomeReceived: { increment: incomeAmount },
        },
      });
      await prisma.investment.update({
        where: { id: allocation.investmentId },
        data: {
          principalReturned: { increment: principalAmount },
          leaseIncomeReceived: { increment: incomeAmount },
        },
      });
    }
    const outstanding = remaining - principal;
    await prisma.facility.update({
      where: { id: facilityId },
      data: { status: outstanding <= BigInt(0) ? 'COMPLETED' : facility.status, chainStatus: 'CHAIN_CONFIRMED', stellarTxHash: result.hash },
    });
    await prisma.auditLog.create({
      data: { userId: actorId, action: 'REPAYMENT_RECORDED', entityType: 'Facility', entityId: facilityId, changes: JSON.stringify({ txHash: result.hash, gross }) },
    });
    return prisma.payment.findUniqueOrThrow({ where: { id: scheduled.id } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Repayment failed on Soroban';
    await prisma.payment.update({ where: { id: scheduled.id }, data: { chainStatus: 'CHAIN_FAILED' } });
    throw new Error(message);
  }
}

export async function alphaRelease(facilityId: string, actorId: string) {
  const { facility } = await payerForFacility(facilityId);
  const supplierAddress = facility.supplier?.payoutPublicKey || facility.beneficiary?.walletAddress;
  if (!supplierAddress) throw new Error('Approved supplier payout address is required');
  if (!isReady(facility.fundedAmount, facility.financeAmount, facility.releaseConditions)) {
    throw new Error('Release conditions are incomplete');
  }
  // Escrow is locked first, then each condition is attested on chain by its responsible role with the hash of its
  // evidence, then the administrator authorizes and the treasury role pays the approved supplier.
  const hash = (text: string) => createHash('sha256').update(text).digest('hex');
  const verified = (type: string) => facility.releaseConditions.find((row) => row.conditionType === type && (row.status === 'VERIFIED' || row.status === 'WAIVED'));
  const mapping: [number, string[], string][] = [
    [RELEASE_CONDITION_CODES.SME_CONTRIBUTION, ['SME_CONTRIBUTION'], 'sme-contribution'],
    [RELEASE_CONDITION_CODES.AGREEMENT, ['LEASE_SIGNED'], 'agreement'],
    [RELEASE_CONDITION_CODES.INVOICE, ['INVOICE'], 'invoice'],
    [RELEASE_CONDITION_CODES.ASSET_IDENTIFIED, ['VEHICLE'], 'asset'],
    [RELEASE_CONDITION_CODES.INSURANCE, ['INSURANCE'], 'insurance'],
    [RELEASE_CONDITION_CODES.COMPLIANCE, ['COMPLIANCE', 'KYB'], 'compliance'],
    [RELEASE_CONDITION_CODES.FINAL_APPROVAL, ['UNDERWRITING'], 'final-approval'],
  ];
  const locked = await lockRelease(facilityId);
  const attested: { condition: number; txHash: string }[] = [];
  for (const [code, types, label] of mapping) {
    const rows = types.map(verified).filter(Boolean);
    if (rows.length === 0) throw new Error(`Release condition ${label} is not verified`);
    const evidence = hash(`${facilityId}:${label}:${rows.map((row) => `${row!.conditionType}@${row!.verifiedAt?.toISOString() || ''}`).join(',')}`);
    const result = await attestReleaseCondition(facilityId, code, evidence);
    attested.push({ condition: code, txHash: result.hash });
  }
  if (facility.supplier && (facility.supplier.status !== 'APPROVED' || facility.supplier.kybStatus !== 'APPROVED')) throw new Error('The supplier is not approved');
  const supplierEvidence = hash(`${facilityId}:supplier:${facility.supplier?.id || facility.beneficiary?.id || ''}`);
  const supplierResult = await attestReleaseCondition(facilityId, RELEASE_CONDITION_CODES.SUPPLIER_APPROVED, supplierEvidence);
  attested.push({ condition: RELEASE_CONDITION_CODES.SUPPLIER_APPROVED, txHash: supplierResult.hash });
  const authorized = await authorizeRelease(facilityId);
  const released = await releaseToSupplier(facilityId);
  const release = await prisma.facilityRelease.create({
    data: {
      facilityId,
      amount: facility.financeAmount,
      idempotencyKey: `release:${facilityId}`,
      status: 'RELEASED',
      chainStatus: 'CHAIN_CONFIRMED',
      txHash: released.hash,
    },
  });
  await prisma.facility.update({ where: { id: facilityId }, data: { status: 'ASSET_DELIVERY_PENDING', chainStatus: 'CHAIN_CONFIRMED', stellarTxHash: released.hash } });
  await prisma.auditLog.create({
    data: { userId: actorId, action: 'FUNDS_RELEASED', entityType: 'Facility', entityId: facilityId, changes: JSON.stringify({ txHash: released.hash, locked: locked.hash, authorized: authorized.hash, attested, supplierAddress }) },
  });
  return release;
}

export async function alphaActivate(facilityId: string, actorId: string) {
  const { facility, payer } = await payerForFacility(facilityId);
  const released = await prisma.facilityRelease.findUnique({ where: { facilityId } });
  if (!released) throw new Error('Release is required before activation');
  if (facility.activationChecks.some((check) => check.status !== 'VERIFIED')) throw new Error('Delivery checks are incomplete');
  await syncComplianceOnChain(payer.id);
  const result = await activateOnChain(facilityId);
  const passport = await prisma.assetPassport.findFirst({ where: { facilityId }, orderBy: { createdAt: 'desc' } });
  if (passport) {
    await setAssetStatus(facilityId, passport.assetId, 3, 1).catch((error) => console.error(`Asset delivery event failed for facility ${facilityId}:`, error instanceof Error ? error.message : error));
    await setAssetStatus(facilityId, passport.assetId, 4, 1).catch((error) => console.error(`Asset activation event failed for facility ${facilityId}:`, error instanceof Error ? error.message : error));
  }
  const start = new Date();
  await prisma.facility.update({
    where: { id: facilityId },
    data: { status: 'ACTIVE', activatedAt: start, incomeStartDate: start, chainStatus: 'CHAIN_CONFIRMED', stellarTxHash: result.hash },
  });
  for (const allocation of facility.allocations) {
    await prisma.facilityAllocation.update({
      where: { id: allocation.id },
      data: { deployedAmount: allocation.reservedAmount, reservedAmount: 0, status: 'DEPLOYED' },
    });
  }
  await prisma.auditLog.create({
    data: { userId: actorId, action: 'FACILITY_ACTIVATED', entityType: 'Facility', entityId: facilityId, changes: JSON.stringify({ txHash: result.hash }) },
  });
}

export async function alphaSettle(facilityId: string, actorId: string, amount: number) {
  const { facility, payer } = await payerForFacility(facilityId);
  const returned = facility.allocations.reduce((sum, row) => sum + row.principalReturned, 0);
  const outstanding = vtaedToStroops(Math.max(facility.financeAmount - returned, 0));
  const fee = platformFee(outstanding, bps(facility.serviceFeeRate));
  const due = settlementAmount(outstanding, BigInt(0), fee, BigInt(0));
  const dueVtaed = stroopsToVtaed(due);
  if (Math.abs(amount - dueVtaed) > 0.05) {
    throw new Error(`Settlement amount must equal outstanding principal plus the settlement fee (${dueVtaed} VTAED)`);
  }
  const result = await settleOnChain(facilityId, payer.id, 0, stroopsToVtaed(fee), 0, `settle:${facilityId}`);
  await prisma.facility.update({
    where: { id: facilityId },
    data: { status: 'COMPLETED', settledEarly: true, closedAt: new Date(), chainStatus: 'CHAIN_CONFIRMED', stellarTxHash: result.hash },
  });
  await prisma.auditLog.create({
    data: { userId: actorId, action: 'EARLY_SETTLEMENT', entityType: 'Facility', entityId: facilityId, changes: JSON.stringify({ amount: dueVtaed, txHash: result.hash }) },
  });
}

export async function alphaMarkStatus(facilityId: string, actorId: string, status: string, reason: string) {
  const result = await advanceOnChain(facilityId, status);
  await prisma.facility.update({ where: { id: facilityId }, data: { status, chainStatus: 'CHAIN_CONFIRMED', stellarTxHash: result.hash } });
  await prisma.auditLog.create({
    data: { userId: actorId, action: status, entityType: 'Facility', entityId: facilityId, changes: JSON.stringify({ reason, txHash: result.hash }) },
  });
}

export async function alphaRecover(facilityId: string, actorId: string, saleProceeds: number, recoveryCosts = 0) {
  const { facility } = await payerForFacility(facilityId);
  const result = await recoverOnChain(facilityId, saleProceeds + recoveryCosts, recoveryCosts, `recover:${facilityId}:${Date.now()}`);
  // Mirror the on-chain allocation into the read model: recovery goes to principal first, pro rata to units.
  const returned = facility.allocations.reduce((sum, row) => sum + row.principalReturned, 0);
  const outstanding = vtaedToStroops(Math.max(facility.financeAmount - returned, 0));
  const net = vtaedToStroops(saleProceeds);
  const recovered = net < outstanding ? net : outstanding;
  const shares = distributeByUnits(facility.allocations.map((row) => ({ units: BigInt(row.participationUnits) })), recovered, BigInt(0));
  for (let index = 0; index < facility.allocations.length; index += 1) {
    await prisma.facilityAllocation.update({ where: { id: facility.allocations[index].id }, data: { recoveryReceived: { increment: stroopsToVtaed(shares[index].principal) } } });
  }
  const soldPassport = await prisma.assetPassport.findFirst({ where: { facilityId }, orderBy: { createdAt: 'desc' } });
  if (soldPassport) {
    await setAssetStatus(facilityId, soldPassport.assetId, 5, 1).catch(() => undefined);
    await setAssetStatus(facilityId, soldPassport.assetId, 6, 1).catch(() => undefined);
    await prisma.assetPassport.update({ where: { id: soldPassport.id }, data: { recoveryStatus: 'DISPOSED' } });
  }
  const recovery = await prisma.facilityRecovery.create({
    data: { facilityId, netProceeds: saleProceeds, note: 'On-chain recovery', chainStatus: 'CHAIN_CONFIRMED', txHash: result.hash },
  });
  await prisma.facility.update({ where: { id: facilityId }, data: { status: 'CLOSED', chainStatus: 'CHAIN_CONFIRMED', stellarTxHash: result.hash } });
  await prisma.auditLog.create({
    data: { userId: actorId, action: 'RECOVERY_DISTRIBUTED', entityType: 'Facility', entityId: facilityId, changes: JSON.stringify({ saleProceeds, recoveryCosts, txHash: result.hash }) },
  });
  return recovery;
}
