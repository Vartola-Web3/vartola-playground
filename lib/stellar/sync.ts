import { prisma } from '@/lib/db';
import { enqueueJob, processJob } from '@/lib/stellar/outbox/queue';

type SyncItem = {
  entityType: 'Pool' | 'Facility' | 'Investment' | 'Payment' | 'Wallet';
  entityId: string;
  payload: Record<string, unknown>;
};

async function canonicalItems(): Promise<SyncItem[]> {
  const [pools, facilities, investments, payments, wallets] = await Promise.all([
    prisma.pool.findMany({
      select: { id: true, poolNo: true, poolName: true, targetAmount: true, raisedAmount: true, status: true },
    }),
    prisma.facility.findMany({
      select: { id: true, facilityNo: true, poolId: true, financeAmount: true, fundedAmount: true, monthlyPayment: true, term: true, leaseYield: true, serviceFeeRate: true, reserveRate: true, status: true },
    }),
    prisma.investment.findMany({
      select: { id: true, investorId: true, poolId: true, amount: true, shares: true, reservedAmount: true, deployedAmount: true, principalReturned: true, leaseIncomeReceived: true, status: true },
    }),
    prisma.payment.findMany({
      where: { paidAt: { not: null } },
      select: { id: true, facilityId: true, paymentNo: true, amount: true, paidAmount: true, principalComponent: true, leaseIncomeComponent: true, serviceFee: true, reserveComponent: true, status: true, paidAt: true },
    }),
    prisma.simWallet.findMany({
      select: { id: true, ownerType: true, ownerId: true, currency: true, available: true, reserved: true, deployed: true },
    }),
  ]);

  return [
    ...pools.map((payload) => ({ entityType: 'Pool' as const, entityId: payload.id, payload })),
    ...facilities.map((payload) => ({ entityType: 'Facility' as const, entityId: payload.id, payload })),
    ...investments.map((payload) => ({ entityType: 'Investment' as const, entityId: payload.id, payload })),
    ...payments.map((payload) => ({ entityType: 'Payment' as const, entityId: payload.id, payload: { ...payload, paidAt: payload.paidAt?.toISOString() } })),
    ...wallets.map((payload) => ({ entityType: 'Wallet' as const, entityId: payload.id, payload })),
  ];
}

export async function getTestnetSyncStatus() {
  const items = await canonicalItems();
  const synced = await prisma.stellarTransaction.findMany({
    where: { type: 'SYNC_SNAPSHOT', status: 'CONFIRMED' },
    select: { entityType: true, entityId: true },
  });
  const keys = new Set(synced.map((row) => `${row.entityType}:${row.entityId}`));
  return { total: items.length, synced: items.filter((item) => keys.has(`${item.entityType}:${item.entityId}`)).length };
}

export async function syncDemoStateToTestnet() {
  const items = await canonicalItems();
  const existing = await prisma.stellarTransaction.findMany({
    where: { type: 'SYNC_SNAPSHOT', status: { in: ['PENDING', 'SUBMITTED', 'CONFIRMED'] } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, entityType: true, entityId: true, status: true },
  });
  const confirmedKeys = new Set(existing.filter((row) => row.status === 'CONFIRMED').map((row) => `${row.entityType}:${row.entityId}`));
  const resumable = new Map(existing.filter((row) => row.status === 'PENDING').map((row) => [`${row.entityType}:${row.entityId}`, row.id]));
  const pending = items.filter((item) => !confirmedKeys.has(`${item.entityType}:${item.entityId}`));
  let confirmed = 0;
  const failures: string[] = [];

  for (const item of pending) {
    const key = `${item.entityType}:${item.entityId}`;
    const jobId = resumable.get(key) || await enqueueJob({
        type: 'SYNC_SNAPSHOT', entityType: item.entityType, entityId: item.entityId,
        payload: { schema: 'vartola.snapshot.v1', syncedAt: new Date().toISOString(), state: item.payload },
      });
    const txHash = await processJob(jobId);
    if (txHash) {
      confirmed += 1;
      if (item.entityType === 'Pool') await prisma.pool.update({ where: { id: item.entityId }, data: { stellarTxHash: txHash } });
      if (item.entityType === 'Facility') await prisma.facility.update({ where: { id: item.entityId }, data: { stellarTxHash: txHash } });
      if (item.entityType === 'Investment') await prisma.investment.update({ where: { id: item.entityId }, data: { stellarTxHash: txHash } });
      if (item.entityType === 'Payment') await prisma.payment.update({ where: { id: item.entityId }, data: { stellarTxHash: txHash } });
    } else failures.push(`${item.entityType}:${item.entityId}`);
  }

  const status = await getTestnetSyncStatus();
  return { ...status, attempted: pending.length, confirmed, failures };
}

export async function publishPoolSnapshot(poolId: string) {
  const { financialMode } = await import('@/lib/simulation/ledger');
  if ((await financialMode()) !== 'STELLAR_TESTNET') return null;
  const pool = await prisma.pool.findUnique({
    where: { id: poolId },
    include: { facilities: { select: { facilityNo: true, financeAmount: true, stellarTxHash: true } } },
  });
  if (!pool) throw new Error('Opportunity not found');
  const jobId = await enqueueJob({
    type: 'SYNC_SNAPSHOT',
    entityType: 'Pool',
    entityId: pool.id,
    payload: {
      schema: 'vartola.opportunity.v1',
      poolNo: pool.poolNo,
      name: pool.poolName,
      targetAmount: pool.targetAmount,
      raisedAmount: pool.raisedAmount,
      status: pool.status,
      facilities: pool.facilities.map((facility) => facility.facilityNo),
    },
  });
  const txHash = await processJob(jobId);
  if (!txHash) {
    const job = await prisma.stellarTransaction.findUnique({ where: { id: jobId } });
    throw new Error(job?.error || 'Stellar did not confirm this opportunity');
  }
  await prisma.pool.update({ where: { id: poolId }, data: { stellarTxHash: txHash } });
  return txHash;
}
