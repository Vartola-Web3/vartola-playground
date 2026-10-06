import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { saveUploads } from '@/lib/services/save-uploads';
import { sendEmail } from '@/lib/services/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const application = await prisma.application.findUnique({
    where: { id },
    include: { company: true },
  });
  if (!application || application.status === 'ARCHIVED') {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  const role = session.user.role;
  if (role === 'SME') {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true },
    });
    if (user?.companyId !== application.companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } else if (role !== 'UNDERWRITER' && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const form = await request.formData();
  const message = String(form.get('message') || '').trim();
  const kind = form.get('kind') === 'DOCUMENT_REQUEST' ? 'DOCUMENT_REQUEST' : 'MESSAGE';
  const files = form.getAll('files').filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (!message && files.length === 0) {
    return NextResponse.json({ error: 'Add a message or an attachment' }, { status: 400 });
  }
  if (kind === 'DOCUMENT_REQUEST' && role === 'SME') {
    return NextResponse.json({ error: 'Only the underwriter can request files' }, { status: 403 });
  }

  const saved = files.length > 0 ? await saveUploads(files, id, session.user.id) : [];

  await prisma.underwritingReview.create({
    data: {
      applicationId: id,
      reviewedBy: session.user.id,
      decision: kind,
      comments: message || `Attached ${saved.length} file(s)`,
      conditions: saved.length
        ? JSON.stringify(saved.map((file) => ({ id: file.id, fileName: file.fileName })))
        : null,
    },
  });

  const recipients =
    role === 'SME'
      ? await prisma.user.findMany({ where: { role: 'UNDERWRITER', isActive: true }, select: { email: true } })
      : await prisma.user.findMany({
          where: { companyId: application.companyId, role: 'SME', isActive: true },
          select: { email: true },
        });
  const emails = new Set(recipients.map((person) => person.email));
  if (role !== 'SME' && application.company.contactEmail) emails.add(application.company.contactEmail);
  const subject =
    kind === 'DOCUMENT_REQUEST'
      ? `File request on ${application.applicationNo}`
      : `New ticket message on ${application.applicationNo}`;
  const bodyText = `${session.user.name || 'Vartola'} wrote:\n${message || 'See attached files.'}${
    saved.length ? `\nAttachments: ${saved.map((file) => file.fileName).join(', ')}` : ''
  }`;
  await Promise.all([...emails].map((to) => sendEmail({ to, subject, body: bodyText })));

  const reviews = await prisma.underwritingReview.findMany({
    where: { applicationId: id },
    include: { reviewer: { select: { name: true, role: true } } },
    orderBy: { reviewedAt: 'asc' },
  });

  return NextResponse.json({ success: true, reviews });
}
