import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/sandbox/store';
import { buildEvidence } from '@/lib/sandbox/evidence';
import { SANDBOX_COOKIE } from '@/lib/sandbox/constants';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await cookies();
  if (store.get(SANDBOX_COOKIE)?.value !== id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const session = await getSession(id);
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(buildEvidence(session.state), {
    headers: { 'Content-Disposition': `attachment; filename="sandbox-${id}.json"` },
  });
}
