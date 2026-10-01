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

    return NextResponse.json({
      publicKey: user?.stellarPublicKey || null,
      balance,
    });
  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}
