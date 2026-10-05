import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySumsubWebhook } from '@/lib/integrations/sumsub';
import { syncComplianceOnChain } from '@/lib/alpha/chain';
import { isAlphaMode } from '@/lib/config/app-mode';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!verifySumsubWebhook(rawBody, request.headers.get('x-payload-digest'))) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }
  const event = JSON.parse(rawBody) as {
    applicantId?: string;
    externalUserId?: string;
    reviewResult?: { reviewAnswer?: string; moderationComment?: string };
    type?: string;
  };
  const providerRef = event.externalUserId || event.applicantId;
  if (!providerRef) return NextResponse.json({ error: 'Missing applicant reference' }, { status: 400 });
  const approved = event.reviewResult?.reviewAnswer === 'GREEN';
  const rejected = event.reviewResult?.reviewAnswer === 'RED';
  const status = approved ? 'VERIFIED' : rejected ? 'REJECTED' : 'IN_REVIEW';
  const compliance = await prisma.complianceCase.findFirst({
    where: { OR: [{ providerRef }, { subjectId: providerRef }] },
  });
  if (compliance) {
    await prisma.complianceCase.update({
      where: { id: compliance.id },
      data: {
        providerRef: event.applicantId || compliance.providerRef,
        status,
        reviewReason: event.reviewResult?.moderationComment || '',
        verifiedAt: approved ? new Date() : null,
      },
    });
    if (approved) {
      const user = compliance.subjectType === 'INDIVIDUAL'
        ? await prisma.user.findUnique({ where: { id: compliance.subjectId } })
        : await prisma.user.findFirst({ where: { companyId: compliance.subjectId, role: 'SME' } });
      if (user && user.accountStatus !== 'ACTIVE') {
        await prisma.user.update({ where: { id: user.id }, data: { accountStatus: rejected ? 'REJECTED' : 'ACTIVE' } });
      }
      if (isAlphaMode() && user) {
        try {
          await syncComplianceOnChain(user.id);
        } catch (error) {
          console.error('Registry compliance sync failed:', error);
        }
      }
    }
    if (rejected && compliance.subjectType === 'INDIVIDUAL') {
      await prisma.user.update({ where: { id: compliance.subjectId }, data: { accountStatus: 'REJECTED' } }).catch(() => undefined);
    }
  }
  return NextResponse.json({ received: true });
}
