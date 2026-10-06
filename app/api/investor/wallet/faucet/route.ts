import { NextResponse } from 'next/server';
import { isAlphaMode } from '@/lib/config/app-mode';
import { auth } from '@/lib/auth/auth';

import { prisma } from '@/lib/db';
import { creditWallet } from '@/lib/simulation/ledger';
import { recordTopUp } from '@/lib/stellar/record';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'INVESTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (isAlphaMode()) {
      return NextResponse.json({ error: 'Alpha mode uses the VTAED distribution account. Demo top-ups stay in Demo mode.' }, { status: 400 });
    }
    const body = await request.json().catch(() => ({}));
    const faucetAmount = Number(body.amount || 10000);
    if (!Number.isFinite(faucetAmount) || faucetAmount <= 0 || faucetAmount > 5000000) {
      return NextResponse.json({ error: 'Enter an amount between AED 1 and AED 5,000,000' }, { status: 400 });
    }
    const idempotencyKey = `investor-topup:${session.user.id}:${Date.now()}`;
    const wallet = await creditWallet({
      ownerType: 'INVESTOR',
      ownerId: session.user.id,
      amount: faucetAmount,
      type: 'DEMO_TOP_UP',
      idempotencyKey,
      actorId: session.user.id,
      description: `Top-up${body.reference ? ` · ${String(body.reference).slice(0, 80)}` : ''}`,
      label: user?.name || 'Investor',
    });
    const recorded = await recordTopUp(idempotencyKey, { ownerType: 'INVESTOR', amount: faucetAmount, reference: body.reference || '' });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'FAUCET_REQUESTED',
        entityType: 'User',
        entityId: session.user.id,
        changes: JSON.stringify({ amount: faucetAmount }),
      },
    });

    return NextResponse.json({
      success: true,
      amount: faucetAmount,
      newBalance: wallet?.available || faucetAmount,
      reviewUrl: recorded?.reviewUrl || null,
    });
  } catch (error) {
    console.error('Faucet request error:', error);
    return NextResponse.json({ error: 'Failed to process faucet request' }, { status: 500 });
  }
}
