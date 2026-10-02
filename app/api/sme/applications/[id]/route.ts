import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        company: true,
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        reviews: {
          include: {
            reviewer: {
              select: { name: true },
            },
          },
          orderBy: { reviewedAt: 'desc' },
        },
        facility: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (session.user.role === 'SME') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true },
      });

      if (user?.companyId !== application.companyId) {
        return NextResponse.json({ error: 'Access forbidden: You can only view your own company applications' }, { status: 403 });
      }
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Application fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.assetDescription) updates.assetDescription = body.assetDescription;
    if (body.assetValue) updates.assetValue = body.assetValue;
    if (body.smeContribution) updates.smeContribution = body.smeContribution;
    if (body.financeAmount) updates.financeAmount = body.financeAmount;
    if (body.requestedTerm) updates.requestedTerm = body.requestedTerm;

    const application = await prisma.application.update({
      where: { id },
      data: updates,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'APPLICATION_UPDATED',
        entityType: 'Application',
        entityId: application.id,
        changes: JSON.stringify(updates),
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error('Application update error:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
