import { prisma } from '@/lib/db';

export async function financialMode() {
  const row = await prisma.systemSettings.findUnique({ where: { key: 'FINANCIAL_MODE' } });
  return row?.value || 'SIMULATION';
}

export async function simulationDate() {
  const row = await prisma.systemSettings.findUnique({ where: { key: 'SIMULATION_DATE' } });
  return row?.value ? new Date(row.value) : new Date();
}

export async function setSimulationDate(iso: string) {
  await prisma.systemSettings.upsert({
    where: { key: 'SIMULATION_DATE' },
    update: { value: iso },
    create: { key: 'SIMULATION_DATE', value: iso, category: 'simulation' },
  });
}

export async function ensureWallet(ownerType: string, ownerId: string, label = '') {
  return prisma.simWallet.upsert({
    where: { ownerType_ownerId: { ownerType, ownerId } },
    update: { label: label || undefined },
    create: { ownerType, ownerId, label },
  });
}

export async function creditWallet(input: {
  ownerType: string;
  ownerId: string;
  amount: number;
  type: string;
  idempotencyKey: string;
  actorId: string;
  description: string;
  label?: string;
}) {
  if (input.amount <= 0) throw new Error('Amount must be positive');
  const wallet = await ensureWallet(input.ownerType, input.ownerId, input.label || '');
  const existing = await prisma.simLedgerEntry.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  if (existing) return wallet;
  const before = wallet.available;
  const after = before + input.amount;
  await prisma.$transaction([
    prisma.simWallet.update({ where: { id: wallet.id }, data: { available: after } }),
    prisma.simLedgerEntry.create({
      data: {
        walletId: wallet.id,
        type: input.type,
        direction: 'IN',
        amount: input.amount,
        balanceBefore: before,
        balanceAfter: after,
        idempotencyKey: input.idempotencyKey,
        description: input.description,
        createdBy: input.actorId,
      },
    }),
  ]);
  return prisma.simWallet.findUnique({ where: { id: wallet.id } });
}

export async function moveAvailableToReserved(ownerId: string, amount: number, key: string, actorId: string) {
  const wallet = await ensureWallet('INVESTOR', ownerId);
  if (wallet.available + 0.001 < amount) throw new Error('Insufficient wallet balance');
  const existing = await prisma.simLedgerEntry.findUnique({ where: { idempotencyKey: key } });
  if (existing) return wallet;
  await prisma.$transaction([
    prisma.simWallet.update({
      where: { id: wallet.id },
      data: { available: wallet.available - amount, reserved: wallet.reserved + amount },
    }),
    prisma.simLedgerEntry.create({
      data: {
        walletId: wallet.id,
        type: 'INVESTMENT_RESERVE',
        direction: 'OUT',
        amount,
        balanceBefore: wallet.available,
        balanceAfter: wallet.available - amount,
        idempotencyKey: key,
        description: 'Investment reserved. Simulation ledger.',
        createdBy: actorId,
      },
    }),
  ]);
}

export async function moveReservedToDeployed(ownerId: string, amount: number, key: string) {
  const wallet = await ensureWallet('INVESTOR', ownerId);
  const existing = await prisma.simLedgerEntry.findUnique({ where: { idempotencyKey: key } });
  if (existing || amount <= 0) return;
  await prisma.$transaction([
    prisma.simWallet.update({
      where: { id: wallet.id },
      data: {
        reserved: Math.max(wallet.reserved - amount, 0),
        deployed: wallet.deployed + amount,
      },
    }),
    prisma.simLedgerEntry.create({
      data: {
        walletId: wallet.id,
        type: 'FACILITY_DEPLOYMENT',
        direction: 'OUT',
        amount,
        balanceBefore: wallet.reserved,
        balanceAfter: Math.max(wallet.reserved - amount, 0),
        idempotencyKey: key,
        description: 'Reserved capital deployed. Simulation ledger.',
        createdBy: 'system',
      },
    }),
  ]);
}

export async function debitWallet(ownerType: string, ownerId: string, amount: number, key: string, description: string) {
  const wallet = await ensureWallet(ownerType, ownerId);
  if (wallet.available + 0.001 < amount) throw new Error('Insufficient wallet balance');
  const existing = await prisma.simLedgerEntry.findUnique({ where: { idempotencyKey: key } });
  if (existing) return;
  await prisma.$transaction([
    prisma.simWallet.update({ where: { id: wallet.id }, data: { available: wallet.available - amount } }),
    prisma.simLedgerEntry.create({
      data: {
        walletId: wallet.id,
        type: 'INSTALLMENT_PAYMENT',
        direction: 'OUT',
        amount,
        balanceBefore: wallet.available,
        balanceAfter: wallet.available - amount,
        idempotencyKey: key,
        description,
        createdBy: ownerId,
      },
    }),
  ]);
}

export async function payInvestor(ownerId: string, principal: number, income: number, key: string) {
  const wallet = await ensureWallet('INVESTOR', ownerId);
  const total = principal + income;
  if (total <= 0) return;
  const existing = await prisma.simLedgerEntry.findUnique({ where: { idempotencyKey: key } });
  if (existing) return;
  await prisma.$transaction([
    prisma.simWallet.update({
      where: { id: wallet.id },
      data: {
        available: wallet.available + total,
        deployed: Math.max(wallet.deployed - principal, 0),
      },
    }),
    prisma.simLedgerEntry.create({
      data: {
        walletId: wallet.id,
        type: 'PRINCIPAL_DISTRIBUTION',
        direction: 'IN',
        amount: total,
        balanceBefore: wallet.available,
        balanceAfter: wallet.available + total,
        idempotencyKey: key,
        description: `Principal ${principal} and lease income ${income}. Simulation ledger.`,
        createdBy: 'system',
      },
    }),
  ]);
}
