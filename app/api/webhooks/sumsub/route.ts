import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySumsubWebhook } from '@/lib/integrations/sumsub';
import { mapSumsubEvent, nextComplianceState, type SumsubEvent } from '@/lib/integrations/sumsub-status';
import { syncComplianceOnChain } from '@/lib/alpha/chain';
import { isAlphaMode } from '@/lib/config/app-mode';

type Payload = SumsubEvent & { applicantId?: string; externalUserId?: string };

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!verifySumsubWebhook(rawBody, request.headers.get('x-payload-digest'))) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }
  let event: Payload;
  try {
    event = JSON.parse(rawBody) as Payload;
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const providerRef = event.externalUserId || event.applicantId;
  if (!providerRef) return NextResponse.json({ error: 'Missing applicant reference' }, { status: 400 });

  // Apply the decision and the account status in one transaction so a retry or duplicate delivery cannot
  // leave them out of step. Replaying the same event is a no-op.
  const outcome = await prisma.$transaction(async (tx) => {
    const compliance = await tx.complianceCase.findFirst({ where: { OR: [{ providerRef }, { subjectId: providerRef }] } });
    if (!compliance) return { applied: false, reason: 'unknown-subject' as const };
    const next = nextComplianceState(compliance.status, mapSumsubEvent(event));
    if (!next) return { applied: false, reason: 'no-change' as const };
    await tx.complianceCase.update({
      where: { id: compliance.id },
      data: {
        providerRef: event.applicantId || compliance.providerRef,
        status: next,
        reviewReason: event.reviewResult?.moderationComment || '',
        verifiedAt: next === 'VERIFIED' ? new Date() : null,
      },
    });
    const user = compliance.subjectType === 'INDIVIDUAL'
      ? await tx.user.findUnique({ where: { id: compliance.subjectId } })
      : await tx.user.findFirst({ where: { companyId: compliance.subjectId, role: 'SME' } });
    if (user) {
      if (next === 'VERIFIED' && user.accountStatus !== 'ACTIVE') await tx.user.update({ where: { id: user.id }, data: { accountStatus: 'ACTIVE' } });
      if (next === 'REJECTED') await tx.user.update({ where: { id: user.id }, data: { accountStatus: 'REJECTED' } });
    }
    await tx.auditLog.create({ data: { userId: user?.id || compliance.subjectId, action: 'KYC_STATUS_CHANGED', entityType: 'ComplianceCase', entityId: compliance.id, changes: JSON.stringify({ from: compliance.status, to: next, provider: 'SUMSUB', type: event.type || null }) } });
    return { applied: true as const, next, userId: user?.id };
  });

  // The registry permission follows the decision after the database commit. Only VERIFIED grants it; a rejection
  // or review request clears it. No personal data is sent to the chain.
  if (outcome.applied && outcome.userId && isAlphaMode()) {
    try {
      await syncComplianceOnChain(outcome.userId);
    } catch (error) {
      console.error('Registry compliance sync failed:', error);
    }
  }
  return NextResponse.json({ received: true, applied: outcome.applied });
}
