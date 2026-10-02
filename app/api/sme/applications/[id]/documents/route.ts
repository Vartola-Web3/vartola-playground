import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { saveUploads } from '@/lib/services/save-uploads';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session || session.user.role !== 'SME') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true },
    });

    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    if (user?.companyId !== application.companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (['APPROVED', 'REJECTED', 'FUNDED', 'ARCHIVED', 'CLOSED'].includes(application.status)) {
      return NextResponse.json(
        { error: `Cannot upload documents in status ${application.status}` },
        { status: 400 }
      );
    }

    const form = await request.formData();
    const files = form.getAll('files').filter((entry): entry is File => entry instanceof File && entry.size > 0);
    if (files.length === 0) {
      return NextResponse.json({ error: 'No documents provided' }, { status: 400 });
    }

    const documents = await saveUploads(files, id, session.user.id);

    // After fulfilling a document request, move conditionally approved back to under review
    let nextStatus = application.status;
    if (application.status === 'CONDITIONALLY_APPROVED') {
      nextStatus = 'UNDER_REVIEW';
      await prisma.application.update({
        where: { id },
        data: { status: nextStatus },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DOCUMENTS_UPLOADED',
        entityType: 'Application',
        entityId: id,
        changes: JSON.stringify({ count: documents.length, status: nextStatus }),
      },
    });

    // Visible signal for underwriter: system review entry
    try {
      const underwriter = await prisma.user.findFirst({ where: { role: 'UNDERWRITER' } });
      if (underwriter) {
        const fileNames = documents
          .map((d: { fileName?: string }) => d.fileName)
          .filter(Boolean)
          .join(', ');
        await prisma.underwritingReview.create({
          data: {
            applicationId: id,
            reviewedBy: underwriter.id,
            decision: 'DOCUMENTS_RECEIVED',
            comments: `SME uploaded ${documents.length} document(s): ${fileNames}`,
            conditions: null,
          },
        });
      }
    } catch (e) {
      console.error('review note failed', e);
    }

    const updated = await prisma.application.findUnique({
      where: { id },
      include: {
        documents: { orderBy: { uploadedAt: 'desc' } },
        reviews: {
          include: { reviewer: { select: { name: true, role: true } } },
          orderBy: { reviewedAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: 'Failed to upload documents' }, { status: 500 });
  }
}
