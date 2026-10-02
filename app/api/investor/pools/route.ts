import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pools = await prisma.pool.findMany({
      where: {
        status: { in: ['OPEN', 'FUNDING', 'ACTIVE'] },
      },
      include: {
        facilities: {
          include: { application: { select: { applicationNo: true, assetDescription: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    for (const pool of pools) {
      const raisedAmount = pool.facilities.reduce((sum, facility) => sum + facility.financeAmount, 0);
      pool.raisedAmount = raisedAmount;
    }

    return NextResponse.json({ pools });
  } catch (error) {
    console.error('Pools fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch pools' }, { status: 500 });
  }
}
