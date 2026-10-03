import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { createTransakWidgetUrl, transakConfigured } from '@/lib/integrations/transak';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!transakConfigured()) return NextResponse.json({ error: 'Transak Sandbox is ready in code but needs its sandbox key.' }, { status: 503 });
  const body = await request.json();
  const amount = Number(body.amount);
  const direction = body.direction === 'SELL' ? 'SELL' : 'BUY';
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: 'Enter a valid amount' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { companyId: true } });
  const compliance = await prisma.complianceCase.findFirst({
    where: { subjectId: { in: [session.user.id, ...(user?.companyId ? [user.companyId] : [])] }, status: 'VERIFIED' },
  });
  if (!compliance) return NextResponse.json({ error: 'Identity verification is required before funding or withdrawal.' }, { status: 403 });
  const order = await prisma.rampOrder.create({
    data: { userId: session.user.id, provider: 'TRANSAK', direction, fiatAmount: amount, status: 'CREATED' },
  });
  const url = createTransakWidgetUrl({ userId: session.user.id, email: session.user.email, amount, walletAddress: body.walletAddress, direction, orderId: order.id });
  return NextResponse.json({ orderId: order.id, checkoutUrl: url });
}
