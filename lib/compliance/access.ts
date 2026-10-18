import { prisma } from '@/lib/db';
import { isAlphaMode } from '@/lib/config/app-mode';

// Compliance gate for financial actions.
//
// In Alpha mode, investing and submitting a financing application require a VERIFIED compliance case.
// Demo mode stays permissive so the seeded walkthrough works without provider credentials.

export type ComplianceSubject = { subjectType: 'INDIVIDUAL' | 'COMPANY'; subjectId: string };

export function subjectForUser(user: { id: string; role: string; companyId?: string | null }): ComplianceSubject {
  return user.role === 'SME' && user.companyId
    ? { subjectType: 'COMPANY', subjectId: user.companyId }
    : { subjectType: 'INDIVIDUAL', subjectId: user.id };
}

export async function complianceStatus(subject: ComplianceSubject) {
  const row = await prisma.complianceCase.findUnique({
    where: { subjectType_subjectId: { subjectType: subject.subjectType, subjectId: subject.subjectId } },
  });
  return row?.status ?? 'NOT_STARTED';
}

export async function assertVerifiedInAlpha(subject: ComplianceSubject) {
  if (!isAlphaMode()) return;
  const status = await complianceStatus(subject);
  if (status !== 'VERIFIED') {
    throw new Error(`Identity verification is required before this action (current status: ${status})`);
  }
}
