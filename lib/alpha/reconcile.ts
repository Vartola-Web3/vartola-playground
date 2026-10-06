import { prisma } from '@/lib/db';
import { facilityContractId } from '@/lib/stellar/keys';
import { viewContract, scString, scAddress, sorobanServer } from '@/lib/stellar/soroban/call';
import { vtaedToStroops, stroopsToVtaed } from '@/lib/alpha/money';

// Reconciliation compares the authoritative Soroban state with the Prisma read model. It only reads from the
// chain and never rewrites chain history. A finding is either a warning (stale or incomplete projection) or an
// error (amounts or state disagree).

export type Severity = 'warning' | 'error';
export type Finding = { severity: Severity; code: string; message: string; facilityId?: string };
export type ReconStatus = 'HEALTHY' | 'WARNING' | 'FAILED';

// Facility status codes in the contract (see contracts/soroban/facility_contract).
export const CHAIN_STATUS: Record<number, string> = {
  1: 'APPROVED', 2: 'FUNDING', 3: 'FUNDED', 4: 'RELEASE_READY', 5: 'RELEASED', 6: 'ACTIVE', 7: 'LATE', 8: 'DEFAULTED',
  9: 'RECOVERY', 10: 'REPAID', 11: 'CLOSED', 12: 'GRACE', 13: 'DEFAULT_NOTICE', 14: 'REPOSSESSION', 15: 'ASSET_SALE',
};

// Database statuses that are consistent with each chain status.
export const EXPECTED_DB: Record<number, string[]> = {
  1: ['PENDING_FUNDING', 'APPROVED'],
  2: ['FUNDING', 'PENDING_FUNDING'],
  3: ['FUNDED', 'FULLY_FUNDED'],
  4: ['FUNDED', 'FULLY_FUNDED', 'RELEASE_READY'],
  5: ['ASSET_DELIVERY_PENDING', 'RELEASED'],
  6: ['ACTIVE'],
  7: ['LATE', 'PAYMENT_LATE'],
  8: ['DEFAULTED'],
  9: ['RECOVERY'],
  10: ['COMPLETED'],
  11: ['CLOSED', 'COMPLETED'],
  12: ['GRACE'],
  13: ['DEFAULT_NOTICE'],
  14: ['REPOSSESSION', 'REPOSSESSED', 'REPOSSESSION_PENDING'],
  15: ['ASSET_SALE', 'RESALE_PENDING'],
};

export type ChainFacility = { status: number; fundedStroops: bigint; issuedUnits: bigint; principalOutstandingStroops: bigint; positions: Record<string, bigint> };
export type DbFacility = {
  id: string;
  facilityNo: string;
  status: string;
  financeAmount: number;
  fundedAmount: number;
  participationUnits: number;
  principalReturned: number;
  allocations: { investorWallet: string | null; units: number }[];
};

const TOLERANCE_STROOPS = BigInt(1000); // 0.0001 VTAED

function differs(a: bigint, b: bigint) {
  const diff = a > b ? a - b : b - a;
  return diff > TOLERANCE_STROOPS;
}

// Pure comparison of one facility. Easy to test without a network.
export function compareFacility(chain: ChainFacility, db: DbFacility): Finding[] {
  const findings: Finding[] = [];
  const add = (severity: Severity, code: string, message: string) => findings.push({ severity, code, message, facilityId: db.id });
  const expected = EXPECTED_DB[chain.status] || [];
  if (!expected.includes(db.status)) {
    add('error', 'STATUS_MISMATCH', `${db.facilityNo}: chain is ${CHAIN_STATUS[chain.status] || chain.status}, database is ${db.status}`);
  }
  if (differs(chain.fundedStroops, vtaedToStroops(db.fundedAmount))) {
    add('error', 'FUNDED_AMOUNT_MISMATCH', `${db.facilityNo}: chain funded ${stroopsToVtaed(chain.fundedStroops)}, database ${db.fundedAmount}`);
  }
  if (chain.issuedUnits !== BigInt(db.participationUnits)) {
    add('error', 'UNIT_MISMATCH', `${db.facilityNo}: chain issued ${chain.issuedUnits} units, database ${db.participationUnits}`);
  }
  const outstandingDb = vtaedToStroops(Math.max(db.financeAmount - db.principalReturned, 0));
  const closed = chain.status === 11 || chain.status === 10;
  if (!closed && differs(chain.principalOutstandingStroops, outstandingDb)) {
    add('error', 'PRINCIPAL_MISMATCH', `${db.facilityNo}: chain outstanding ${stroopsToVtaed(chain.principalOutstandingStroops)}, database ${stroopsToVtaed(outstandingDb)}`);
  }
  for (const allocation of db.allocations) {
    if (!allocation.investorWallet) {
      add('warning', 'MISSING_WALLET', `${db.facilityNo}: an investor position has no wallet to compare`);
      continue;
    }
    const onChain = chain.positions[allocation.investorWallet];
    if (onChain === undefined) {
      add('error', 'MISSING_POSITION', `${db.facilityNo}: investor ${allocation.investorWallet.slice(0, 8)}… has no position on chain`);
    } else if (onChain !== BigInt(allocation.units)) {
      add('error', 'POSITION_MISMATCH', `${db.facilityNo}: investor ${allocation.investorWallet.slice(0, 8)}… chain ${onChain} units, database ${allocation.units}`);
    }
  }
  return findings;
}

export function summarize(findings: Finding[]): ReconStatus {
  if (findings.some((item) => item.severity === 'error')) return 'FAILED';
  if (findings.length > 0) return 'WARNING';
  return 'HEALTHY';
}

async function readChainFacility(contractId: string, facilityId: string, wallets: string[]): Promise<ChainFacility> {
  const status = Number(await viewContract(contractId, 'facility_status', [scString(facilityId)]));
  const fundedStroops = BigInt(await viewContract(contractId, 'funded_amount', [scString(facilityId)]) as bigint);
  const issuedUnits = BigInt(await viewContract(contractId, 'issued_units', [scString(facilityId)]) as bigint);
  const principalOutstandingStroops = BigInt(await viewContract(contractId, 'principal_outstanding', [scString(facilityId)]) as bigint);
  const positions: Record<string, bigint> = {};
  for (const wallet of wallets) {
    positions[wallet] = BigInt(await viewContract(contractId, 'position_units', [scString(facilityId), scAddress(wallet)]) as bigint);
  }
  return { status, fundedStroops, issuedUnits, principalOutstandingStroops, positions };
}

export async function reconcile() {
  const contractId = facilityContractId();
  const findings: Finding[] = [];
  const checkedAt = new Date().toISOString();
  if (!contractId) {
    return { status: 'FAILED' as ReconStatus, checkedAt, contractId: '', facilities: 0, findings: [{ severity: 'error' as Severity, code: 'NO_CONTRACT', message: 'The facility contract is not configured' }] };
  }
  const facilities = await prisma.facility.findMany({
    where: { chainStatus: 'CHAIN_CONFIRMED' },
    include: { allocations: true },
  });
  const wallets = await prisma.userWallet.findMany({ where: { provider: 'EMBEDDED', userId: { in: facilities.flatMap((row) => row.allocations.map((a) => a.investorId)) } } });
  const walletOf = new Map(wallets.map((row) => [row.userId, row.publicKey]));
  for (const facility of facilities) {
    const allocations = facility.allocations.map((row) => ({
      investorWallet: walletOf.get(row.investorId) || null,
      units: row.participationUnits,
    }));
    const principalReturned = facility.allocations.reduce((sum, row) => sum + row.principalReturned, 0);
    try {
      const chain = await readChainFacility(contractId, facility.id, allocations.map((row) => row.investorWallet).filter((value): value is string => Boolean(value)));
      findings.push(...compareFacility(chain, {
        id: facility.id,
        facilityNo: facility.facilityNo,
        status: facility.status,
        financeAmount: facility.financeAmount,
        fundedAmount: facility.fundedAmount,
        participationUnits: facility.participationUnits,
        principalReturned,
        allocations,
      }));
    } catch (error) {
      findings.push({ severity: 'error', code: 'CHAIN_READ_FAILED', facilityId: facility.id, message: `${facility.facilityNo}: could not read the chain (${error instanceof Error ? error.message.slice(0, 120) : 'unknown error'})` });
    }
  }

  // Transactions recorded locally must exist on chain, and paid installments must have a recorded chain event.
  const payments = await prisma.payment.findMany({ where: { chainStatus: 'CHAIN_CONFIRMED', stellarTxHash: { not: null } }, take: 200 });
  const server = sorobanServer();
  for (const payment of payments) {
    const hash = payment.stellarTxHash as string;
    const onChain = await server.getTransaction(hash).then((row) => row.status === 'SUCCESS').catch(() => false);
    if (!onChain) {
      findings.push({ severity: 'error', code: 'LOCAL_TX_MISSING_ON_CHAIN', facilityId: payment.facilityId, message: `Payment ${payment.paymentNo} references ${hash.slice(0, 12)}… which is not a confirmed chain transaction` });
    }
    const event = await prisma.chainEvent.findFirst({ where: { txHash: hash, eventType: 'RepaymentRecorded' } });
    if (!event) {
      findings.push({ severity: 'warning', code: 'EVENT_NOT_PROJECTED', facilityId: payment.facilityId, message: `Payment ${payment.paymentNo} has no RepaymentRecorded event in the read model; run a re-index` });
    }
  }
  const pendingChain = await prisma.payment.count({ where: { chainStatus: 'CHAIN_PENDING' } });
  if (pendingChain > 0) findings.push({ severity: 'warning', code: 'STALE_PENDING', message: `${pendingChain} payment(s) are still CHAIN_PENDING` });

  return { status: summarize(findings), checkedAt, contractId, facilities: facilities.length, findings };
}
