import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { creditWallet, setSimulationDate, simulationDate } from '@/lib/simulation/ledger';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const wallets = await prisma.simWallet.findMany({ include: { entries: { orderBy: { createdAt: 'desc' }, take: 8 } }, orderBy: { label: 'asc' } });
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } });
  return NextResponse.json({ wallets, users, simulationDate: (await simulationDate()).toISOString(), mode: 'SIMULATION' });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  if (body.action === 'credit') {
    await creditWallet({
      ownerType: body.ownerType,
      ownerId: body.ownerId,
      amount: Number(body.amount),
      type: 'SIMULATION_CREDIT',
      idempotencyKey: `credit:${body.ownerId}:${Date.now()}`,
      actorId: session.user.id,
      description: body.reason || 'Demo funding',
      label: body.label || '',
    });
  }
  if (body.action === 'clock') {
    const current = await simulationDate();
    current.setDate(current.getDate() + Number(body.days || 0));
    await setSimulationDate(current.toISOString());
  }
  return NextResponse.json({ success: true, settlement: 'Simulation Ledger' });
}
