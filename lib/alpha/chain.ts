import { createHash } from 'crypto';
import { prisma } from '@/lib/db';
import { xdr } from '@stellar/stellar-sdk';
import { adminKeypair, registryContractId, requireContracts } from '@/lib/stellar/keys';
import { callContract, scAddress, scBool, scI128, scString, scU32 } from '@/lib/stellar/soroban/call';
import { embeddedSigner, ensureEmbeddedWallet } from '@/lib/stellar/wallets/provider';
import { mirrorChainEvent } from '@/lib/alpha/journal';
import { entityHash, jurisdictionCode, userIdHash } from '@/lib/alpha/identity';
import { assertUnitMultiple, bps, participationUnits, vtaedToStroops } from '@/lib/alpha/money';

const ROLE: Record<string, number> = { INVESTOR: 1, SME: 2, SUPPLIER: 3 };

export async function registerWalletOnChain(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  const wallet = await ensureEmbeddedWallet(userId);
  if (wallet.status === 'CHAIN_REGISTERED') return wallet;
  const { registry } = requireContracts();
  const result = await callContract({
    contractId: registry,
    method: 'register_wallet',
    signer: adminKeypair(),
    args: [
      scAddress(wallet.publicKey),
      scString(userIdHash(userId)),
      scU32(ROLE[user.role] || 2),
      scU32(jurisdictionCode(user.country || 'AE')),
      scI128(vtaedToStroops(10_000_000)),
    ],
  });
  const updated = await prisma.userWallet.update({
    where: { id: wallet.id },
    data: { status: 'CHAIN_REGISTERED' },
  });
  await mirrorChainEvent({
    eventType: 'WalletRegistered',
    txHash: result.hash,
    ledger: result.ledger,
    contractId: registry,
    entityType: 'User',
    entityId: userId,
    title: 'Wallet registered',
  });
  return updated;
}

export async function syncComplianceOnChain(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  const wallet = await prisma.userWallet.findUnique({ where: { userId_provider: { userId, provider: 'EMBEDDED' } } });
  if (!wallet) return;
  const registry = registryContractId();
  if (!registry) return;
  const subject = user.role === 'SME' && user.companyId
    ? { subjectType: 'COMPANY', subjectId: user.companyId, method: 'set_kyb_status' }
    : { subjectType: 'INDIVIDUAL', subjectId: user.id, method: 'set_kyc_status' };
  const compliance = await prisma.complianceCase.findUnique({
    where: { subjectType_subjectId: subject },
  });
  if (!compliance) return;
  const approved = compliance.status === 'VERIFIED' || compliance.status === 'APPROVED';
  const result = await callContract({
    contractId: registry,
    method: subject.method,
    signer: adminKeypair(),
    args: [scAddress(wallet.publicKey), scBool(approved)],
  });
  await mirrorChainEvent({
    eventType: approved ? 'ComplianceApproved' : 'ComplianceUpdated',
    txHash: result.hash,
    ledger: result.ledger,
    contractId: registry,
    entityType: 'User',
    entityId: userId,
  });
}

export async function ensureFacilityOnChain(facilityId: string) {
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    include: { application: true, supplier: true, beneficiary: true },
  });
  if (!facility?.application) throw new Error('Facility not found');
  if (facility.chainStatus === 'CHAIN_CONFIRMED') return facility;
  const supplierAddress = facility.supplier?.payoutPublicKey || facility.beneficiary?.walletAddress;
  if (!supplierAddress) throw new Error('Assign a supplier payout address before Alpha funding');
  const sme = await prisma.user.findFirst({ where: { companyId: facility.application.companyId, role: 'SME' } });
  if (!sme) throw new Error('The SME account for this facility is missing');
  const borrower = await registerWalletOnChain(sme.id);
  const { facility: contractId } = requireContracts();
  const schedule = createHash('sha256').update(`${facility.id}:${facility.term}`).digest('hex');
  const result = await callContract({
    contractId,
    method: 'create_facility',
    signer: adminKeypair(),
    args: [
      scString(facility.id),
      scAddress(borrower.publicKey),
      scString(userIdHash(sme.id)),
      scString(entityHash('application', facility.applicationId)),
      scI128(vtaedToStroops(facility.financeAmount)),
      scI128(vtaedToStroops(facility.application.smeContribution || 0)),
      scU32(facility.term),
      scString(schedule),
      scAddress(supplierAddress),
      scU32((bps(facility.reserveRate) << 16) + bps(facility.serviceFeeRate)),
    ],
  });
  await prisma.facility.update({
    where: { id: facility.id },
    data: { chainStatus: 'CHAIN_CONFIRMED', stellarTxHash: result.hash, unitValue: 100 },
  });
  await mirrorChainEvent({
    eventType: 'FacilityCreated',
    txHash: result.hash,
    ledger: result.ledger,
    contractId,
    entityType: 'Facility',
    entityId: facility.id,
    title: 'Facility created',
  });
  return prisma.facility.findUniqueOrThrow({ where: { id: facility.id } });
}

export async function subscribeAndReserve(investorId: string, facilityId: string, amount: number) {
  const wallet = await registerWalletOnChain(investorId);
  await syncComplianceOnChain(investorId);
  const { keypair } = await embeddedSigner(investorId);
  const { facility } = requireContracts();
  const stroops = assertUnitMultiple(amount);
  try {
    await callContract({
      contractId: facility,
      method: 'subscribe',
      signer: keypair,
      args: [scAddress(wallet.publicKey), scString(facilityId), scI128(stroops)],
    });
    const reserved = await callContract({
      contractId: facility,
      method: 'reserve',
      signer: keypair,
      args: [scAddress(wallet.publicKey), scString(facilityId)],
    });
    return { txHash: reserved.hash, ledger: reserved.ledger, units: participationUnits(amount) };
  } catch (error) {
    try {
      await callContract({
        contractId: facility,
        method: 'cancel_subscription',
        signer: keypair,
        args: [scAddress(wallet.publicKey), scString(facilityId)],
      });
    } catch {
      // The reservation either never started or already moved into escrow.
    }
    throw error;
  }
}

async function adminCall(method: string, args: xdr.ScVal[], facilityId: string, eventType: string) {
  const { facility } = requireContracts();
  const result = await callContract({
    contractId: facility,
    method,
    signer: adminKeypair(),
    args,
  });
  await mirrorChainEvent({
    eventType,
    txHash: result.hash,
    ledger: result.ledger,
    contractId: facility,
    entityType: 'Facility',
    entityId: facilityId,
    title: eventType,
  });
  return result;
}

export function authorizeRelease(facilityId: string) {
  return adminCall('authorize_release', [scString(facilityId)], facilityId, 'ReleaseAuthorized');
}

export function releaseToSupplier(facilityId: string) {
  return adminCall('release_to_supplier', [scString(facilityId)], facilityId, 'FundsReleased');
}

export function activateOnChain(facilityId: string) {
  return adminCall('activate_facility', [scString(facilityId)], facilityId, 'FacilityActivated');
}

export async function repayOnChain(facilityId: string, payerId: string, gross: number, paymentIndex: number, idempotency: string) {
  const wallet = await registerWalletOnChain(payerId);
  const { keypair } = await embeddedSigner(payerId);
  const { facility } = requireContracts();
  const result = await callContract({
    contractId: facility,
    method: 'record_repayment',
    signer: keypair,
    args: [scAddress(wallet.publicKey), scString(facilityId), scI128(vtaedToStroops(gross)), scU32(paymentIndex), scString(idempotency)],
  });
  await mirrorChainEvent({
    eventType: 'RepaymentRecorded',
    txHash: result.hash,
    ledger: result.ledger,
    contractId: facility,
    entityType: 'Facility',
    entityId: facilityId,
  });
  await mirrorChainEvent({
    eventType: 'DistributionExecuted',
    txHash: result.hash,
    ledger: result.ledger,
    contractId: facility,
    entityType: 'Facility',
    entityId: facilityId,
  });
  return result;
}

export async function settleOnChain(facilityId: string, payerId: string, accrued: number, fee: number, rebate: number, idempotency: string) {
  const wallet = await registerWalletOnChain(payerId);
  const { keypair } = await embeddedSigner(payerId);
  const { facility } = requireContracts();
  const result = await callContract({
    contractId: facility,
    method: 'settle',
    signer: keypair,
    args: [
      scAddress(wallet.publicKey),
      scString(facilityId),
      scI128(vtaedToStroops(accrued)),
      scI128(vtaedToStroops(fee)),
      scI128(vtaedToStroops(rebate)),
      scString(idempotency),
    ],
  });
  await mirrorChainEvent({
    eventType: 'FacilityClosed',
    txHash: result.hash,
    ledger: result.ledger,
    contractId: facility,
    entityType: 'Facility',
    entityId: facilityId,
  });
  return result;
}

const STATUS_CODE: Record<string, number> = {
  GRACE: 12,
  LATE: 7,
  PAYMENT_LATE: 7,
  DEFAULT_NOTICE: 13,
  DEFAULTED: 8,
  REPOSSESSION: 14,
  REPOSSESSION_PENDING: 14,
  REPOSSESSED: 14,
  ASSET_SALE: 15,
  RESALE_PENDING: 15,
  RECOVERY: 9,
  CLOSED: 11,
};

export async function advanceOnChain(facilityId: string, status: string) {
  const code = STATUS_CODE[status];
  if (!code) throw new Error('Status is not allowed');
  const result = await adminCall('advance_status', [scString(facilityId), scU32(code)], facilityId, status === 'DEFAULTED' || status === '8' ? 'FacilityDefaulted' : 'FacilityLate');
  return result;
}

export async function recoverOnChain(facilityId: string, saleProceeds: number, recoveryCosts: number, idempotency: string) {
  const admin = adminKeypair();
  const { facility } = requireContracts();
  const result = await callContract({
    contractId: facility,
    method: 'record_recovery',
    signer: admin,
    args: [
      scAddress(admin.publicKey()),
      scString(facilityId),
      scI128(vtaedToStroops(saleProceeds)),
      scI128(vtaedToStroops(recoveryCosts)),
      scString(idempotency),
    ],
  });
  await mirrorChainEvent({
    eventType: 'RecoveryRecorded',
    txHash: result.hash,
    ledger: result.ledger,
    contractId: facility,
    entityType: 'Facility',
    entityId: facilityId,
  });
  return result;
}

export async function attestDocumentOnChain(input: {
  facilityId?: string | null;
  documentHash: string;
  documentType: string;
  entityHash: string;
  verificationStatus?: number;
}) {
  const { facility } = requireContracts();
  const result = await callContract({
    contractId: facility,
    method: 'attest_document',
    signer: adminKeypair(),
    args: [scString(input.documentHash), scString(input.documentType), scString(input.entityHash), scU32(input.verificationStatus ?? 1)],
  });
  if (input.facilityId) {
    await mirrorChainEvent({
      eventType: 'DocumentAttested',
      txHash: result.hash,
      ledger: result.ledger,
      contractId: facility,
      entityType: 'Facility',
      entityId: input.facilityId,
      payload: { documentHash: input.documentHash, documentType: input.documentType },
    });
  }
  return result;
}

export async function anchorPassport(input: {
  assetId: string;
  serialHash: string;
  facilityId: string;
  insuranceStatus: number;
  registrationStatus: number;
  deliveryStatus: number;
  recoveryStatus: number;
}) {
  return adminCall('upsert_passport', [
    scString(input.assetId),
    scString(input.serialHash),
    scString(input.facilityId),
    scU32(input.insuranceStatus),
    scU32(input.registrationStatus),
    scU32(input.deliveryStatus),
    scU32(input.recoveryStatus),
  ], input.facilityId, 'AssetPassportAnchored');
}

export async function setFacilityContractOnRegistry(facilityContract: string) {
  const registry = registryContractId();
  if (!registry) throw new Error('Wallet registry contract is not configured');
  return callContract({
    contractId: registry,
    method: 'set_facility_contract',
    signer: adminKeypair(),
    args: [scAddress(facilityContract)],
  });
}

export async function setEnforceKyc(enabled: boolean) {
  const registry = registryContractId();
  if (!registry) throw new Error('Wallet registry contract is not configured');
  return callContract({
    contractId: registry,
    method: 'set_enforce_kyc',
    signer: adminKeypair(),
    args: [scBool(enabled)],
  });
}
