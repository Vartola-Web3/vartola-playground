import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { linkExternalWallet, walletView } from '@/lib/stellar/wallets/provider';
import { assertSameOrigin } from '@/lib/security/origin';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ wallets: await walletView(session.user.id) });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    assertSameOrigin(request);
    const body = await request.json();
    const wallet = await linkExternalWallet(session.user.id, String(body.publicKey || ''));
    return NextResponse.json({ publicKey: wallet.publicKey, provider: wallet.provider, status: wallet.status });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not link wallet' }, { status: 400 });
  }
}
