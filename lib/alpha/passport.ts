import { createHash } from 'crypto';
import { prisma } from '@/lib/db';
import { isAlphaMode } from '@/lib/config/app-mode';
import { anchorPassport } from '@/lib/alpha/chain';

const CODE: Record<string, number> = { UNKNOWN: 0, PENDING: 1, VERIFIED: 2, FAILED: 3, NONE: 0, ACTIVE: 2 };

export async function saveAssetPassport(input: {
  facilityId: string;
  assetId: string;
  serial: string;
  assetType?: string;
  manufacturer?: string;
  model?: string;
  year?: number;
  purchaseValue?: number;
  supplierName?: string;
  legalOwner?: string;
  operatorName?: string;
  insuranceStatus?: string;
  registrationStatus?: string;
  deliveryStatus?: string;
  valuation?: number;
  recoveryStatus?: string;
}) {
  const serialHash = createHash('sha256').update(input.serial).digest('hex');
  const passport = await prisma.assetPassport.create({
    data: {
      facilityId: input.facilityId,
      assetId: input.assetId,
      serialHash,
      assetType: input.assetType || '',
      manufacturer: input.manufacturer || '',
      model: input.model || '',
      year: input.year,
      purchaseValue: input.purchaseValue,
      supplierName: input.supplierName || '',
      legalOwner: input.legalOwner || '',
      operatorName: input.operatorName || '',
      insuranceStatus: input.insuranceStatus || 'UNKNOWN',
      registrationStatus: input.registrationStatus || 'UNKNOWN',
      deliveryStatus: input.deliveryStatus || 'UNKNOWN',
      valuation: input.valuation,
      recoveryStatus: input.recoveryStatus || 'NONE',
    },
  });
  if (!isAlphaMode()) return passport;
  const anchored = await anchorPassport({
    assetId: input.assetId,
    serialHash,
    facilityId: input.facilityId,
    insuranceStatus: CODE[input.insuranceStatus || 'UNKNOWN'] ?? 0,
    registrationStatus: CODE[input.registrationStatus || 'UNKNOWN'] ?? 0,
    deliveryStatus: CODE[input.deliveryStatus || 'UNKNOWN'] ?? 0,
    recoveryStatus: CODE[input.recoveryStatus || 'NONE'] ?? 0,
  });
  return prisma.assetPassport.update({ where: { id: passport.id }, data: { chainTxHash: anchored.hash } });
}
