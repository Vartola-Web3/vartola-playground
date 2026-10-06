import { createHash } from 'crypto';

// What a supplier may submit. A supplier gives evidence to operations. It can never approve a release, change a
// facility's financial terms, or skip compliance: no function here touches release conditions, amounts of the
// facility, or compliance state.

export const SUBMISSION_KINDS = ['INVOICE', 'ASSET_DETAILS', 'DELIVERY_CONFIRMATION', 'DELIVERY_EVIDENCE'] as const;
export type SubmissionKind = (typeof SUBMISSION_KINDS)[number];

export type SubmissionInput = { kind: string; reference?: string; amount?: number | null; serial?: string; hasFile?: boolean };

export type ValidSubmission = { kind: SubmissionKind; reference: string; amount: number | null; serialHash: string | null };

export function hashSerial(serial: string) {
  return createHash('sha256').update(`vartola-serial:${serial.trim().toUpperCase()}`).digest('hex');
}

export function validateSubmission(input: SubmissionInput): { ok: true; value: ValidSubmission } | { ok: false; error: string } {
  if (!SUBMISSION_KINDS.includes(input.kind as SubmissionKind)) return { ok: false, error: 'Unknown submission type' };
  const kind = input.kind as SubmissionKind;
  const reference = (input.reference || '').trim().slice(0, 120);
  if (kind === 'INVOICE') {
    if (!reference) return { ok: false, error: 'An invoice reference is required' };
    if (!input.amount || !Number.isFinite(input.amount) || input.amount <= 0) return { ok: false, error: 'A positive invoice amount is required' };
    if (!input.hasFile) return { ok: false, error: 'Attach the invoice as a PDF, JPG or PNG' };
  }
  if (kind === 'ASSET_DETAILS') {
    const serial = (input.serial || '').trim();
    if (serial.length < 5 || serial.length > 40) return { ok: false, error: 'Enter the VIN or serial number (5 to 40 characters)' };
  }
  if (kind === 'DELIVERY_EVIDENCE' && !input.hasFile) return { ok: false, error: 'Attach the delivery evidence' };
  return {
    ok: true,
    value: {
      kind,
      reference,
      amount: kind === 'INVOICE' ? Number(input.amount) : null,
      serialHash: kind === 'ASSET_DETAILS' ? hashSerial(input.serial as string) : null,
    },
  };
}

// Release status shown to the supplier. It reflects what operations decided; the supplier cannot change it.
export function releaseStatusLabel(facilityStatus: string, released: boolean) {
  if (released) return 'Payment released to your account';
  if (['FUNDED', 'FULLY_FUNDED'].includes(facilityStatus)) return 'Funded. Waiting for release checks.';
  if (['PENDING_FUNDING', 'FUNDING'].includes(facilityStatus)) return 'Funding in progress';
  if (['ACTIVE', 'LATE', 'COMPLETED', 'CLOSED'].includes(facilityStatus)) return 'Delivered and active';
  return facilityStatus.replaceAll('_', ' ').toLowerCase();
}
