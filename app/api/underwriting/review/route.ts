import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth/auth';

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'UNDERWRITER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { applicationId, underwriterId, decision, comments, conditions, riskTier, riskScores } = body;

    // Create review record
    await prisma.underwritingReview.create({
      data: {
        applicationId,
        reviewedBy: underwriterId,
        decision,
        comments,
        conditions,
        recommendedTier: riskTier,
      },
    });

    // Update application status and risk scores
    const newStatus =
      decision === 'APPROVED' || decision === 'CONDITIONALLY_APPROVED' ? 'APPROVED' : 'REJECTED';

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        companyRiskScore: riskScores.companyRiskScore,
        assetRiskScore: riskScores.assetRiskScore,
        dealRiskScore: riskScores.dealRiskScore,
        riskTier,
        approvedAt: decision === 'APPROVED' || decision === 'CONDITIONALLY_APPROVED' ? new Date() : null,
        approvedBy: decision === 'APPROVED' || decision === 'CONDITIONALLY_APPROVED' ? underwriterId : null,
        rejectedAt: decision === 'REJECTED' ? new Date() : null,
        rejectionReason: decision === 'REJECTED' ? comments : null,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: underwriterId,
        action: `REVIEW_APPLICATION_${decision}`,
        entityType: 'Application',
        entityId: applicationId,
        changes: JSON.stringify({ decision, riskTier, ...riskScores }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
