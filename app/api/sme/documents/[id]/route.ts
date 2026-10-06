import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { readStoredDocument } from '@/lib/services/document-access';
import { deleteDocument } from '@/lib/services/storage';
import { rememberOperation } from '@/lib/firebase/operations';

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

// Deletes a document: authorize, remove the stored object, remove the metadata, and write an audit event.
// Funded applications keep their documents, because the document hash may already be attested on-chain.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const doc = await prisma.document.findUnique({ where: { id }, include: { application: { select: { companyId: true, status: true, id: true } } } });
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (session.user.role === 'SME') {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { companyId: true } });
    if (user?.companyId !== doc.application.companyId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } else if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (['FUNDED', 'ACTIVE', 'COMPLETED'].includes(doc.application.status)) {
    return NextResponse.json({ error: 'Documents of a funded application cannot be deleted' }, { status: 409 });
  }

  try {
    await deleteDocument(doc.storagePath);
  } catch (error) {
    console.error('Document object deletion failed:', error);
    return NextResponse.json({ error: 'The stored file could not be deleted' }, { status: 502 });
  }
  await prisma.$transaction([
    prisma.document.delete({ where: { id } }),
    prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DOCUMENT_DELETED',
        entityType: 'Document',
        entityId: id,
        changes: JSON.stringify({ applicationId: doc.application.id, documentType: doc.documentType, documentHash: doc.documentHash }),
      },
    }),
  ]);
  await rememberOperation({ id: `Document_${id}`, title: 'Document deleted', kind: 'DOCUMENT_DELETED', status: 'DELETED', entityType: 'Document', entityId: id });
  return NextResponse.json({ deleted: true });
}
