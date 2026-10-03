import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { financialMode } from '@/lib/simulation/ledger';
import { getTestnetSyncStatus, syncDemoStateToTestnet } from '@/lib/stellar/sync';
import { isAdminOperator } from '@/lib/auth/roles';

async function admin() {
  const session = await auth();
  return session?.user?.role === 'ADMIN' ? session : null;
}

async function viewer() {
  const session = await auth();
  return session?.user && isAdminOperator(session.user.role) ? session : null;
}

export async function GET() {
  if (!(await viewer())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ ...(await getTestnetSyncStatus()), mode: await financialMode() });
}

export async function POST() {
  if (!(await admin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((await financialMode()) !== 'STELLAR_TESTNET') {
    return NextResponse.json({ error: 'Switch to Stellar Testnet before synchronizing.' }, { status: 409 });
  }
  const result = await syncDemoStateToTestnet();
  return NextResponse.json({ success: result.failures.length === 0, ...result }, { status: result.failures.length ? 207 : 200 });
}
