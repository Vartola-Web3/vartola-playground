import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { getStellarProvider } from '@/lib/stellar/providers';
import { financialMode } from '@/lib/simulation/ledger';
import { getTestnetOperator } from '@/lib/stellar/operator';
import { isAdminOperator } from '@/lib/auth/roles';

async function readiness() {
  const problems: string[] = [];
  let publicKey: string | null = null;
  if ((process.env.STELLAR_NETWORK || 'testnet') !== 'testnet') problems.push('Only Stellar Testnet can be enabled from this demo');
  try {
      publicKey = getTestnetOperator().publicKey();
      const provider = await getStellarProvider();
      if (!(await provider.isHealthy())) problems.push('Stellar provider is unavailable');
      await provider.getAccount(publicKey).catch(() => problems.push('The Stellar operator account is not funded on Testnet'));
  } catch (error) {
    problems.push(error instanceof Error ? error.message : 'The Stellar operator configuration is invalid');
  }
  return { ready: problems.length === 0, problems, publicKey };
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdminOperator(session.user.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ mode: await financialMode(), readiness: await readiness() });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  if (body.action === 'provision') {
    const operator = getTestnetOperator();
    const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(operator.publicKey())}`);
    if (!response.ok) {
      const details = await response.text();
      return NextResponse.json({ error: `Friendbot could not fund the Testnet operator: ${details.slice(0, 160)}` }, { status: 502 });
    }
    return NextResponse.json({ success: true, mode: await financialMode(), readiness: await readiness() });
  }
  const mode = body.mode === 'STELLAR_TESTNET' ? 'STELLAR_TESTNET' : body.mode === 'SIMULATION' ? 'SIMULATION' : null;
  if (!mode) return NextResponse.json({ error: 'Unsupported financial mode' }, { status: 400 });
  const state = await readiness();
  if (mode === 'STELLAR_TESTNET' && !state.ready) {
    return NextResponse.json({ error: 'Stellar Testnet is not ready', readiness: state }, { status: 409 });
  }
  await prisma.systemSettings.upsert({
    where: { key: 'FINANCIAL_MODE' },
    update: { value: mode },
    create: { key: 'FINANCIAL_MODE', value: mode, category: 'financial' },
  });
  await prisma.auditLog.create({
    data: { userId: session.user.id, action: 'FINANCIAL_MODE_CHANGED', entityType: 'SystemSettings', entityId: 'FINANCIAL_MODE', changes: JSON.stringify({ mode }) },
  });
  return NextResponse.json({ success: true, mode, readiness: state });
}
