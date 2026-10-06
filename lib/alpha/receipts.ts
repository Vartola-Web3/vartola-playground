import { createHash } from 'crypto';
import { prisma } from '@/lib/db';
import { facilityContractId } from '@/lib/stellar/keys';

// Financial receipts are built from confirmed chain references only. A receipt carries no private data:
// facility, operation, wallet address, amount, asset, time, transaction hash, ledger and contract.
// receiptHash is the SHA-256 of the canonical receipt body, so anyone can recompute it; the transaction hash
// then proves on Stellar Testnet that the operation happened.

export type ReceiptType = 'INVESTMENT' | 'RELEASE' | 'REPAYMENT' | 'DISTRIBUTION' | 'SETTLEMENT' | 'RECOVERY';

export type Receipt = {
  receiptHash: string;
  type: ReceiptType;
  title: string;
  facilityId: string;
  facilityNo: string;
  operationType: string;
  wallet: string | null;
  amount: number;
  asset: 'VTAED';
  timestamp: string;
  transactionHash: string;
  ledger: number;
  contractId: string;
  explorerUrl: string;
};

const TITLES: Record<ReceiptType, string> = {
  INVESTMENT: 'Investment receipt',
  RELEASE: 'Release receipt',
  REPAYMENT: 'Repayment receipt',
  DISTRIBUTION: 'Distribution receipt',
  SETTLEMENT: 'Settlement receipt',
  RECOVERY: 'Recovery receipt',
};

const REAL_HASH = /^[a-f0-9]{64}$/i;
export const explorerTx = (hash: string) => `https://stellar.expert/explorer/testnet/tx/${hash}`;

export function canonicalReceipt(body: Omit<Receipt, 'receiptHash' | 'title' | 'explorerUrl'>) {
  const ordered = {
    amount: body.amount,
    asset: body.asset,
    contractId: body.contractId,
    facilityId: body.facilityId,
    ledger: body.ledger,
    operationType: body.operationType,
    timestamp: body.timestamp,
    transactionHash: body.transactionHash,
    type: body.type,
    wallet: body.wallet,
  };
  return JSON.stringify(ordered);
}

export function hashReceipt(body: Omit<Receipt, 'receiptHash' | 'title' | 'explorerUrl'>) {
  return createHash('sha256').update(canonicalReceipt(body)).digest('hex');
}

export function makeReceipt(input: Omit<Receipt, 'receiptHash' | 'title' | 'explorerUrl' | 'asset'>): Receipt {
  const body = { ...input, asset: 'VTAED' as const };
  return { ...body, receiptHash: hashReceipt(body), title: TITLES[input.type], explorerUrl: explorerTx(input.transactionHash) };
}

// Receipts for one facility. When investorId is given, investor-specific rows (investment, distribution) are limited
// to that investor; facility-wide rows (release, repayment, settlement, recovery) are always included.
export async function receiptsForFacility(facilityId: string, investorId?: string): Promise<Receipt[]> {
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    include: { releases: true, recoveries: true, payments: true, allocations: true },
  });
  if (!facility) return [];
  const contractId = facilityContractId();
  const hashes = new Set<string>();
  const out: Receipt[] = [];

  const investorIds = investorId ? [investorId] : facility.allocations.map((row) => row.investorId);
  const wallets = await prisma.userWallet.findMany({ where: { provider: 'EMBEDDED', userId: { in: facility.allocations.map((row) => row.investorId) } } });
  const walletOf = new Map(wallets.map((row) => [row.userId, row.publicKey]));

  const investments = await prisma.investment.findMany({
    where: { id: { in: facility.allocations.filter((row) => investorIds.includes(row.investorId)).map((row) => row.investmentId) } },
  });
  const add = (receipt: Omit<Parameters<typeof makeReceipt>[0], 'ledger'>, hash: string | null | undefined) => {
    if (!hash || !REAL_HASH.test(hash)) return;
    hashes.add(hash);
    out.push(makeReceipt({ ...receipt, ledger: 0, transactionHash: hash }));
  };

  for (const investment of investments) {
    const allocation = facility.allocations.find((row) => row.investmentId === investment.id);
    add({ type: 'INVESTMENT', facilityId, facilityNo: facility.facilityNo, operationType: 'subscribe_and_reserve', wallet: walletOf.get(investment.investorId) || null, amount: allocation?.allocatedAmount ?? investment.amount, timestamp: investment.subscribedAt.toISOString(), contractId, transactionHash: '' }, investment.stellarTxHash);
  }
  for (const release of facility.releases) {
    add({ type: 'RELEASE', facilityId, facilityNo: facility.facilityNo, operationType: 'release_supplier_payment', wallet: null, amount: release.amount, timestamp: release.createdAt.toISOString(), contractId, transactionHash: '' }, release.txHash);
  }
  for (const payment of facility.payments.filter((row) => row.status === 'PAID')) {
    add({ type: 'REPAYMENT', facilityId, facilityNo: facility.facilityNo, operationType: 'record_repayment', wallet: null, amount: payment.paidAmount ?? payment.amount, timestamp: (payment.paidAt || payment.createdAt).toISOString(), contractId, transactionHash: '' }, payment.stellarTxHash);
  }
  const distributions = await prisma.distribution.findMany({
    where: { facilityId, ...(investorId ? { investment: { investorId } } : {}) },
    include: { investment: true },
  });
  for (const distribution of distributions) {
    add({ type: 'DISTRIBUTION', facilityId, facilityNo: facility.facilityNo, operationType: 'distribute_pro_rata', wallet: walletOf.get(distribution.investment.investorId) || null, amount: distribution.amount, timestamp: distribution.distributedAt.toISOString(), contractId, transactionHash: '' }, distribution.stellarTxHash);
  }
  if (facility.settledEarly) {
    const audit = await prisma.auditLog.findFirst({ where: { entityType: 'Facility', entityId: facilityId, action: 'EARLY_SETTLEMENT' }, orderBy: { createdAt: 'desc' } });
    const parsed = audit?.changes ? (JSON.parse(audit.changes) as { amount?: number; txHash?: string }) : {};
    add({ type: 'SETTLEMENT', facilityId, facilityNo: facility.facilityNo, operationType: 'settle', wallet: null, amount: parsed.amount ?? 0, timestamp: (facility.closedAt || facility.updatedAt).toISOString(), contractId, transactionHash: '' }, parsed.txHash || facility.stellarTxHash);
  }
  for (const recovery of facility.recoveries) {
    add({ type: 'RECOVERY', facilityId, facilityNo: facility.facilityNo, operationType: 'record_recovery', wallet: null, amount: recovery.netProceeds, timestamp: recovery.createdAt.toISOString(), contractId, transactionHash: '' }, recovery.txHash);
  }

  // Ledger numbers come from the indexed chain events.
  const events = await prisma.chainEvent.findMany({ where: { txHash: { in: [...hashes] } } });
  const ledgerOf = new Map(events.map((row) => [row.txHash, row.ledger]));
  return out
    .map((receipt) => makeReceipt({ ...receipt, ledger: ledgerOf.get(receipt.transactionHash) || 0 }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
