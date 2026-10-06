import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { beginEnrollment, confirmEnrollment, mfaState } from '@/lib/auth/mfa';
import { isAlphaMode } from '@/lib/config/app-mode';

export const dynamic = 'force-dynamic';

// Self-service second-factor enrolment for the signed-in administrator. It never acts on another account.
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ alpha: isAlphaMode(), ...(await mfaState(session.user.id)) });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  try {
    if (body?.action === 'begin') return NextResponse.json(await beginEnrollment(session.user.id, session.user.email));
    if (body?.action === 'confirm') {
      const ok = await confirmEnrollment(session.user.id, String(body.code || ''));
      return ok ? NextResponse.json({ enrolled: true }) : NextResponse.json({ error: 'That code was not accepted' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not complete the request' }, { status: 400 });
  }
}
