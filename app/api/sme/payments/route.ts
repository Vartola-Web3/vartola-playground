import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { recordRepayment } from '@/lib/lifecycle/service';
import { creditWallet, ensureWallet, financialMode, simulationDate } from '@/lib/simulation/ledger';
import { stellarReviewUrl } from '@/lib/stellar/explorer';
import { latestReviewUrls, recordTopUp } from '@/lib/stellar/record';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SME') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const wallet = await ensureWallet('SME', session.user.id, session.user.name || 'SME');
  const facilities = await prisma.facility.findMany({
    where: { application: { company: { users: { some: { id: session.user.id } } } }, status: 'ACTIVE' },
    include: { payments: { orderBy: { paymentNo: 'asc' } }, application: true },
  });
  const today = await simulationDate();
  const entries = await prisma.simLedgerEntry.findMany({ where: { walletId: wallet.id }, orderBy: { createdAt: 'desc' }, take: 8 });
  const topUpLinks = await latestReviewUrls('TopUp', entries.map((entry) => entry.id));
  return NextResponse.json({
    wallet: {
      ...wallet,
      entries: entries.map((entry) => ({
        id: entry.id,
        type: entry.type,
        amount: entry.amount,
        description: entry.description,
        createdAt: entry.createdAt,
        reviewUrl: topUpLinks.get(entry.id) || null,
      })),
    },
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
        reviewUrl: stellarReviewUrl(payment.stellarTxHash),
      })),
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SME') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  try {
    if (body.action === 'topup') {
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0 || amount > 5000000) throw new Error('Enter an amount between AED 1 and AED 5,000,000');
      const idempotencyKey = `sme-topup:${session.user.id}:${Date.now()}`;
      const wallet = await creditWallet({
        ownerType: 'SME', ownerId: session.user.id, amount, type: 'DEMO_TOP_UP',
        idempotencyKey, actorId: session.user.id,
        description: `Top-up${body.reference ? ` · ${String(body.reference).slice(0, 80)}` : ''}`,
        label: session.user.name || 'SME',
      });
      const recorded = await recordTopUp(idempotencyKey, { ownerType: 'SME', amount, reference: body.reference || '' });
      return NextResponse.json({ success: true, wallet, reviewUrl: recorded?.reviewUrl || null });
    }
    await recordRepayment(body.facilityId, session.user.id, Number(body.amount), body.key || `sme:${body.facilityId}:${Date.now()}`);
    const mode = await financialMode();
    return NextResponse.json({ success: true, settlement: mode === 'STELLAR_TESTNET' ? 'Stellar Testnet queued' : 'Simulation Ledger' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Payment failed' }, { status: 400 });
  }
}
