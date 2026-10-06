import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { certificateFor } from '@/lib/alpha/positions';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ facilityId: string }> }) {
  const { facilityId } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== 'INVESTOR') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const certificate = await certificateFor(session.user.id, facilityId);
  if (!certificate) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return new NextResponse(JSON.stringify(certificate, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="participation-${certificate.position.facilityNo}.json"` },
  });
}
