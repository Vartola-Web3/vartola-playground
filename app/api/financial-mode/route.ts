import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { financialMode } from '@/lib/simulation/ledger';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ mode: await financialMode() });
}
