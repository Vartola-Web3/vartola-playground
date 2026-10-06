import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { isAdminOperator } from '@/lib/auth/roles';
import { saveAssetPassport } from '@/lib/alpha/passport';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdminOperator(session.user.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const passport = await saveAssetPassport(body);
    return NextResponse.json({ passport });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Passport failed' }, { status: 400 });
  }
}
