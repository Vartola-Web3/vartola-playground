import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !['UNDERWRITER', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { applicationId } = await request.json();
  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }
  if (['APPROVED', 'FUNDED'].includes(application.status)) {
    return NextResponse.json({ error: 'Approved applications stay on record' }, { status: 400 });
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: 'ARCHIVED' },
  });
  await prisma.underwritingReview.create({
    data: {
      applicationId,
      reviewedBy: session.user.id,
      decision: 'ARCHIVED',
      comments: 'Archived by the underwriting desk. Hidden from the applicant.',
    },
  });

  return NextResponse.json({ success: true });
}
