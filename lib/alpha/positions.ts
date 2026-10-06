import { prisma } from '@/lib/db';
import { facilityContractId } from '@/lib/stellar/keys';

// An investor financial position in one facility, as the read model sees it. Soroban holds the authoritative
// units; this view adds amounts and status for the interface. Positions are not transferable.

export type PositionStatus = 'RESERVED' | 'FUNDED' | 'ACTIVE' | 'PARTIALLY_REPAID' | 'SETTLED' | 'RECOVERED' | 'CLOSED';

export type Position = {
  facilityId: string;
  facilityNo: string;
  investorWallet: string | null;
  participationUnits: number;
  committedAmount: number;
  deployedAmount: number;
  principalReturned: number;
  incomeReceived: number;
  recoveryReceived: number;
  outstandingExposure: number;
  status: PositionStatus;
  facilityStatus: string;
  transferable: false;
};

export function positionStatus(input: { facilityStatus: string; settledEarly: boolean; deployed: number; principalReturned: number; recoveryReceived: number }): PositionStatus {
  const { facilityStatus, settledEarly, deployed, principalReturned, recoveryReceived } = input;
  if (facilityStatus === 'CLOSED' && recoveryReceived > 0) return 'RECOVERED';
  if (facilityStatus === 'CLOSED') return 'CLOSED';
  if (facilityStatus === 'COMPLETED') return settledEarly ? 'SETTLED' : 'CLOSED';
  if (deployed > 0 && principalReturned > 0) return 'PARTIALLY_REPAID';
  if (['ACTIVE', 'LATE', 'GRACE', 'DEFAULTED', 'DEFAULT_NOTICE', 'REPOSSESSION', 'ASSET_SALE', 'RECOVERY'].includes(facilityStatus)) return 'ACTIVE';
  if (['FUNDED', 'FULLY_FUNDED', 'ASSET_DELIVERY_PENDING', 'RELEASED'].includes(facilityStatus)) return 'FUNDED';
  return 'RESERVED';
}

export function exposure(input: { committed: number; principalReturned: number; recoveryReceived: number; closed: boolean }) {
  if (input.closed) return 0;
  return Math.max(Math.round((input.committed - input.principalReturned - input.recoveryReceived) * 100) / 100, 0);
}

export async function positionsForInvestor(investorId: string): Promise<Position[]> {
  const allocations = await prisma.facilityAllocation.findMany({ where: { investorId }, orderBy: { createdAt: 'asc' } });
  if (allocations.length === 0) return [];
  const facilities = await prisma.facility.findMany({ where: { id: { in: allocations.map((row) => row.facilityId) } } });
  const wallet = await prisma.userWallet.findUnique({ where: { userId_provider: { userId: investorId, provider: 'EMBEDDED' } } });
  return allocations.map((allocation) => {
    const facility = facilities.find((row) => row.id === allocation.facilityId);
    const facilityStatus = facility?.status || 'UNKNOWN';
    const closed = ['CLOSED', 'COMPLETED'].includes(facilityStatus);
    return {
      facilityId: allocation.facilityId,
      facilityNo: facility?.facilityNo || '',
      investorWallet: wallet?.publicKey || null,
      participationUnits: allocation.participationUnits,
      committedAmount: allocation.allocatedAmount,
      deployedAmount: allocation.deployedAmount || (['ACTIVE', 'LATE', 'COMPLETED', 'CLOSED'].includes(facilityStatus) ? allocation.allocatedAmount : 0),
      principalReturned: allocation.principalReturned,
      incomeReceived: allocation.leaseIncomeReceived,
      recoveryReceived: allocation.recoveryReceived,
      outstandingExposure: exposure({ committed: allocation.allocatedAmount, principalReturned: allocation.principalReturned, recoveryReceived: allocation.recoveryReceived, closed }),
      status: positionStatus({ facilityStatus, settledEarly: Boolean(facility?.settledEarly), deployed: allocation.deployedAmount, principalReturned: allocation.principalReturned, recoveryReceived: allocation.recoveryReceived }),
      facilityStatus,
      transferable: false,
    };
  });
}

export const DIGITAL_PARTICIPATION_NOTICE =
  'Digital participation record — legal rights remain subject to the applicable facility agreements and regulatory structure. This is not a security certificate or proof of legal title. Testnet values have no monetary value.';

export async function certificateFor(investorId: string, facilityId: string) {
  const positions = await positionsForInvestor(investorId);
  const position = positions.find((row) => row.facilityId === facilityId);
  if (!position) return null;
  const events = await prisma.chainEvent.findMany({ where: { entityType: 'Investment', entityId: { in: (await prisma.facilityAllocation.findMany({ where: { investorId, facilityId }, select: { investmentId: true } })).map((row) => row.investmentId) } } });
  return {
    notice: DIGITAL_PARTICIPATION_NOTICE,
    network: 'Stellar Testnet',
    asset: 'VTAED',
    contractId: facilityContractId(),
    issuedAt: new Date().toISOString(),
    position,
    chainReferences: events.map((event) => ({ eventType: event.eventType, transactionHash: event.txHash, ledger: event.ledger })),
  };
}
