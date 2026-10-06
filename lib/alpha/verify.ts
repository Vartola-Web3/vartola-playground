import { prisma } from '@/lib/db';
import { facilityContractId } from '@/lib/stellar/keys';
import { viewContract, scString } from '@/lib/stellar/soroban/call';
import { CHAIN_STATUS } from '@/lib/alpha/reconcile';
import { latestFacilityRisk } from '@/lib/risk-engine/facility-risk-store';
import { scoreDrivers } from '@/lib/risk-engine/facility-score';
import { stroopsToVtaed } from '@/lib/alpha/money';

// Public facility verification. It reads the contract live and lists only chain references and counts.
// It never returns SME details, KYC data, wallets, bank details, or documents.

export type FacilityProof = {
  facilityNo: string;
  network: 'Stellar Testnet';
  contractId: string;
  asset: 'VTAED';
  lifecycleState: string;
  chainRead: 'LIVE' | 'UNAVAILABLE';
  fundingPercent: number;
  totalUnits: number;
  principalOutstanding: number | null;
  documentAttestations: number;
  assetAttestations: number;
  risk: { grade: string; score: number; modelVersion: string; improves: string[]; increases: string[]; notice: string } | null;
  events: { eventType: string; ledger: number; transactionHash: string; explorerUrl: string }[];
  note: string;
};

export async function facilityProof(idOrNumber: string): Promise<FacilityProof | null> {
  const facility = await prisma.facility.findFirst({ where: { OR: [{ id: idOrNumber }, { facilityNo: idOrNumber }], chainStatus: 'CHAIN_CONFIRMED' } });
  if (!facility) return null;
  const contractId = facilityContractId();
  let lifecycleState = facility.status;
  let chainRead: FacilityProof['chainRead'] = 'UNAVAILABLE';
  let funded = facility.fundedAmount;
  let units = facility.participationUnits;
  let outstanding: number | null = null;
  try {
    const status = Number(await viewContract(contractId, 'facility_status', [scString(facility.id)]));
    funded = stroopsToVtaed(BigInt(await viewContract(contractId, 'funded_amount', [scString(facility.id)]) as bigint));
    units = Number(await viewContract(contractId, 'issued_units', [scString(facility.id)]));
    outstanding = stroopsToVtaed(BigInt(await viewContract(contractId, 'principal_outstanding', [scString(facility.id)]) as bigint));
    lifecycleState = CHAIN_STATUS[status] || lifecycleState;
    chainRead = 'LIVE';
  } catch {
    chainRead = 'UNAVAILABLE';
  }
  const [events, documentAttestations, passports, risk] = await Promise.all([
    prisma.chainEvent.findMany({ where: { OR: [{ entityId: facility.id }, { txHash: facility.stellarTxHash || '-' }] }, orderBy: { createdAt: 'asc' }, take: 60 }),
    prisma.documentAttestation.count({ where: { facilityId: facility.id } }),
    prisma.assetPassport.count({ where: { facilityId: facility.id, chainTxHash: { not: null } } }),
    latestFacilityRisk(facility.id),
  ]);
  return {
    facilityNo: facility.facilityNo,
    network: 'Stellar Testnet',
    contractId,
    asset: 'VTAED',
    lifecycleState,
    chainRead,
    fundingPercent: facility.financeAmount > 0 ? Math.min(Math.round((funded / facility.financeAmount) * 1000) / 10, 100) : 0,
    totalUnits: units,
    principalOutstanding: outstanding,
    documentAttestations,
    assetAttestations: passports,
    risk: risk ? { grade: risk.result.grade, score: risk.result.score, modelVersion: risk.result.modelVersion, ...scoreDrivers(risk.result), notice: 'Rule-based internal score. It is not a credit rating issued by a regulated ratings agency.' } : null,
    events: events.map((event) => ({ eventType: event.eventType, ledger: event.ledger, transactionHash: event.txHash, explorerUrl: `https://stellar.expert/explorer/testnet/tx/${event.txHash}` })),
    note: 'Stellar Testnet record. VTAED has no monetary value. No private or personal information is shown.',
  };
}
