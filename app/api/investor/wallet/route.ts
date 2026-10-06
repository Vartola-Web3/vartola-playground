import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { latestReviewUrls } from '@/lib/stellar/record';

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'INVESTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    const [sim, positions] = await Promise.all([
      prisma.simWallet.findUnique({
        where: { ownerType_ownerId: { ownerType: 'INVESTOR', ownerId: session.user.id } },
        include: { entries: { orderBy: { createdAt: 'desc' }, take: 6 } },
      }),
      prisma.investment.findMany({ where: { investorId: session.user.id } }),
    ]);

    const entries = sim?.entries || [];
    const topUpLinks = await latestReviewUrls('TopUp', entries.map((entry) => entry.id));
    return NextResponse.json({
      publicKey: user?.stellarPublicKey || null,
      balance: sim?.available || 0,
      reserved: sim?.reserved || 0,
      deployed: sim?.deployed || 0,
      pending: sim?.reserved || 0,
      returned: positions.reduce((sum, item) => sum + item.principalReturned, 0),
      income: positions.reduce((sum, item) => sum + item.leaseIncomeReceived, 0),
      reinvest: sim?.available || 0,
      transactions: entries.map((entry) => ({
        id: entry.id,
        description: entry.description || entry.type,
        amount: entry.direction === 'OUT' ? -entry.amount : entry.amount,
        at: entry.createdAt,
        reviewUrl: topUpLinks.get(entry.id) || null,
      })),
    });
  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}
