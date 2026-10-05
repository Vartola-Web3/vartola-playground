import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { sendOtp, verifyOtp } from '@/lib/phone/provider';
import { rateLimit } from '@/lib/security/rate-limit';
import { assertSameOrigin } from '@/lib/security/origin';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    assertSameOrigin(request);
    rateLimit(request, 'phone-code', 5);
    const body = await request.json();
    const phone = String(body.phone || '');
    if (!phone) return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    if (body.action === 'verify') {
      const ok = await verifyOtp(session.user.id, phone, String(body.code || ''));
      if (!ok) return NextResponse.json({ error: 'Phone code is invalid or expired' }, { status: 400 });
      return NextResponse.json({ success: true });
    }
    await sendOtp(session.user.id, phone);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Phone verification failed' }, { status: 400 });
  }
}
