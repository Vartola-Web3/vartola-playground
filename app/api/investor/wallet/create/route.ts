import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

import { prisma } from '@/lib/db';
import { Keypair } from '@stellar/stellar-sdk';

export async function POST() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'INVESTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keypair = Keypair.random();
    const publicKey = keypair.publicKey();

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        stellarPublicKey: publicKey,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'WALLET_CREATED',
        entityType: 'User',
        entityId: session.user.id,
        changes: JSON.stringify({ publicKey }),
      },
    });

    return NextResponse.json({ success: true, publicKey });
  } catch (error) {
    console.error('Wallet creation error:', error);
    return NextResponse.json({ error: 'Failed to create wallet' }, { status: 500 });
  }
}
