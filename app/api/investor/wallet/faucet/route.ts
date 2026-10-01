import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'INVESTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.stellarPublicKey) {
      return NextResponse.json({ error: 'No wallet found' }, { status: 400 });
    }

    const faucetAmount = 10000;
    const newBalance = 50000 + faucetAmount;

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
      newBalance,
    });
  } catch (error) {
    console.error('Faucet request error:', error);
    return NextResponse.json({ error: 'Failed to process faucet request' }, { status: 500 });
  }
}
