import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { readStoredDocument } from '@/lib/services/document-access';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const doc = await prisma.document.findUnique({
    where: { id },
    include: { application: { select: { companyId: true, id: true } } },
  });
  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const role = session.user.role;

  if (role === 'SME') {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true },
    });
    if (user?.companyId !== doc.application.companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } else if (!['UNDERWRITER', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const buf = await readStoredDocument(doc.storagePath, doc.fileName);
  if (!buf) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
  const safeName = doc.fileName.split(/[/\\]/).pop() || 'document';
  return new NextResponse(buf, {
    headers: {
      'Content-Type': doc.mimeType || 'application/pdf',
      'Content-Disposition': `inline; filename="${safeName}"`,
    },
  });
}
