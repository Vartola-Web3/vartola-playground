import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { creditWallet, setSimulationDate, simulationDate } from '@/lib/simulation/ledger';
import { isAdminOperator } from '@/lib/auth/roles';

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdminOperator(session.user.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const wallets = await prisma.simWallet.findMany({ include: { entries: { orderBy: { createdAt: 'desc' }, take: 8 } }, orderBy: { label: 'asc' } });
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, companyId: true } });
  const compliance = await prisma.complianceCase.findMany({ orderBy: { updatedAt: 'desc' } });
  return NextResponse.json({ wallets, users, compliance, simulationDate: (await simulationDate()).toISOString(), mode: 'SIMULATION' });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdminOperator(session.user.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
  if (body.action === 'compliance') {
    const user = await prisma.user.findUnique({ where: { id: body.ownerId }, select: { role: true, companyId: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const subjectType = user.role === 'SME' ? 'COMPANY' : 'INDIVIDUAL';
    const subjectId = user.role === 'SME' ? user.companyId || body.ownerId : body.ownerId;
    const approved = body.status === 'VERIFIED';
    await prisma.complianceCase.upsert({
      where: { subjectType_subjectId: { subjectType, subjectId } },
      update: { provider: 'SIMULATION', status: approved ? 'VERIFIED' : 'REJECTED', verifiedAt: approved ? new Date() : null },
      create: { subjectType, subjectId, provider: 'SIMULATION', status: approved ? 'VERIFIED' : 'REJECTED', verifiedAt: approved ? new Date() : null },
    });
  }
  return NextResponse.json({ success: true, settlement: 'Simulation Ledger' });
}
