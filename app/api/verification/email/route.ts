import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { sendEmailCode, verifyEmailCode } from '@/lib/email/verification';
import { rateLimit } from '@/lib/security/rate-limit';
import { assertSameOrigin } from '@/lib/security/origin';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    assertSameOrigin(request);
    rateLimit(request, 'email-code', 5);
    const body = await request.json();
    if (body.action === 'verify') {
      const ok = await verifyEmailCode(session.user.id, String(body.code || ''));
      if (!ok) return NextResponse.json({ error: 'Email code is invalid or expired' }, { status: 400 });
      return NextResponse.json({ success: true, accountStatus: 'PHONE_PENDING' });
    }
    await sendEmailCode(session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Email verification failed' }, { status: 400 });
  }
}
