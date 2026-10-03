import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySumsubWebhook } from '@/lib/integrations/sumsub';

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
  }
  return NextResponse.json({ received: true });
}
