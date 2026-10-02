import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { authConfig } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'INVESTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    const balance = user?.stellarPublicKey ? 50000 : 0;
    const [sim, positions] = await Promise.all([
      prisma.simWallet.findUnique({
        where: { ownerType_ownerId: { ownerType: 'INVESTOR', ownerId: session.user.id } },
        include: { entries: { orderBy: { createdAt: 'desc' }, take: 6 } },
      }),
      prisma.investment.findMany({ where: { investorId: session.user.id } }),
    ]);

    return NextResponse.json({
      publicKey: user?.stellarPublicKey || null,
      balance,
      pending: sim?.reserved || 0,
      returned: positions.reduce((sum, item) => sum + item.principalReturned, 0),
      income: positions.reduce((sum, item) => sum + item.leaseIncomeReceived, 0),
      reinvest: sim?.available || balance,
      transactions: (sim?.entries || []).map((entry) => ({
        id: entry.id,
        description: entry.description || entry.type,
        amount: entry.direction === 'OUT' ? -entry.amount : entry.amount,
        at: entry.createdAt,
      })),
    });
  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}
