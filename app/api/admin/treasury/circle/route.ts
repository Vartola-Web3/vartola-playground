import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { isAdminOperator } from '@/lib/auth/roles';
import { circleConfigured, circleEnvironment, getCircleBalances } from '@/lib/integrations/circle';

export const dynamic = 'force-dynamic';

// Admin-only treasury connectivity check. Proves the Circle sandbox credential works by reading
// business-account balances. The key is never returned; only the environment, status and balances leave the server.
export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdminOperator(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!circleConfigured()) {
    return NextResponse.json(
      { configured: false, environment: circleEnvironment(), error: 'Circle sandbox credentials are not configured.' },
      { status: 503 },
    );
  }
  try {
    const balances = await getCircleBalances();
    return NextResponse.json({ configured: true, environment: circleEnvironment(), balances });
  } catch (error) {
    return NextResponse.json(
      { configured: true, environment: circleEnvironment(), error: error instanceof Error ? error.message : 'Circle request failed' },
      { status: 502 },
    );
  }
}
