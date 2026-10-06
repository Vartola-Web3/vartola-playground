import { prisma } from '@/lib/db';
import { storeDocument } from '@/lib/storage/document-provider';
import { releaseStatusLabel, validateSubmission, type SubmissionInput } from './rules';

export async function supplierForUser(userId: string) {
  const link = await prisma.supplierUser.findUnique({ where: { userId }, include: { supplier: true } });
  return link?.supplier ?? null;
}

// Facilities assigned to this supplier, with what the supplier needs to see: nothing about investors or the SME's
// private data.
export async function assignedFacilities(supplierId: string) {
  const facilities = await prisma.facility.findMany({
    where: { supplierId },
    include: { releases: true, application: { select: { assetDescription: true, assetType: true, unitCount: true } }, activationChecks: true },
    orderBy: { createdAt: 'desc' },
  });
  const submissions = await prisma.supplierSubmission.findMany({ where: { supplierId }, orderBy: { createdAt: 'desc' } });
  return facilities.map((facility) => ({
    id: facility.id,
    facilityNo: facility.facilityNo,
    asset: facility.application?.assetDescription || '',
    assetType: facility.application?.assetType || '',
    units: facility.application?.unitCount || 1,
    financeAmount: facility.financeAmount,
    status: facility.status,
    releaseStatus: releaseStatusLabel(facility.status, facility.releases.length > 0),
    deliveryCheck: facility.activationChecks.find((check) => check.checkType === 'DELIVERED')?.status || 'PENDING',
    submissions: submissions.filter((row) => row.facilityId === facility.id),
  }));
}

export async function submitEvidence(input: { userId: string; facilityId: string; fields: SubmissionInput; file?: { bytes: Buffer; name: string; type: string } }) {
  const supplier = await supplierForUser(input.userId);
  if (!supplier) throw new Error('This account is not linked to a supplier');
  if (supplier.kybStatus !== 'APPROVED') throw new Error('Supplier verification (KYB) must be approved before submitting');
  const facility = await prisma.facility.findFirst({ where: { id: input.facilityId, supplierId: supplier.id } });
  if (!facility) throw new Error('This facility is not assigned to your company');
  const checked = validateSubmission({ ...input.fields, hasFile: Boolean(input.file) });
  if (!checked.ok) throw new Error(checked.error);

  let documentHash: string | null = null;
  let storagePath: string | null = null;
  if (input.file) {
    const stored = await storeDocument(input.file.bytes, input.file.name, input.file.type);
    documentHash = stored.hash;
    storagePath = stored.path;
  }
  const row = await prisma.supplierSubmission.create({
    data: { supplierId: supplier.id, facilityId: facility.id, kind: checked.value.kind, reference: checked.value.reference, amount: checked.value.amount, serialHash: checked.value.serialHash, documentHash, storagePath },
  });
  // A delivery confirmation only marks the delivery check as supplier-confirmed. Operations still verify it.
  if (checked.value.kind === 'DELIVERY_CONFIRMATION') {
    await prisma.facilityActivationCheck.updateMany({ where: { facilityId: facility.id, checkType: 'DELIVERED', status: 'PENDING' }, data: { status: 'SUPPLIER_CONFIRMED' } });
  }
  await prisma.auditLog.create({ data: { userId: input.userId, action: `SUPPLIER_${checked.value.kind}`, entityType: 'Facility', entityId: facility.id, changes: JSON.stringify({ submissionId: row.id, documentHash }) } });
  return row;
}
