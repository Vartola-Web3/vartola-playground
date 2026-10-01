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
        status: 'OPEN',
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ pools });
  } catch (error) {
    console.error('Pools fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch pools' }, { status: 500 });
  }
}
