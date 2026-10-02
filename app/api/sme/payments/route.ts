import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { recordRepayment } from '@/lib/lifecycle/service';
import { ensureWallet, simulationDate } from '@/lib/simulation/ledger';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SME') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const wallet = await ensureWallet('SME', session.user.id, session.user.name || 'SME');
  const facilities = await prisma.facility.findMany({
    where: { application: { company: { users: { some: { id: session.user.id } } } }, status: 'ACTIVE' },
    include: { payments: { orderBy: { paymentNo: 'asc' } }, application: true },
  });
  const today = await simulationDate();
  return NextResponse.json({
    wallet,
    today: today.toISOString(),
    facilities: facilities.map((facility) => ({
      id: facility.id,
      facilityNo: facility.facilityNo,
      description: facility.application.assetDescription,
      monthly: facility.monthlyPayment,
      payments: facility.payments.map((payment) => ({
        id: payment.id,
        paymentNo: payment.paymentNo,
        dueDate: payment.dueDate,
        amount: payment.amount,
        status: payment.status === 'PAID' ? 'PAID' : payment.dueDate < today ? 'DUE' : 'UPCOMING',
      })),
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SME') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  try {
    await recordRepayment(body.facilityId, session.user.id, Number(body.amount), body.key || `sme:${body.facilityId}:${Date.now()}`);
    return NextResponse.json({ success: true, settlement: 'Simulation Ledger' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Payment failed' }, { status: 400 });
  }
}
