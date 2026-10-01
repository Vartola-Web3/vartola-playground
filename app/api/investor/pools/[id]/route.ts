import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await prisma.pool.findUnique({
      where: { id },
    });

    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
    }

    return NextResponse.json({ pool });
  } catch (error) {
    console.error('Pool fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch pool' }, { status: 500 });
  }
}
