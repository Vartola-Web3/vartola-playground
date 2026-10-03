import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const accessToken = process.env.TRANSAK_WEBHOOK_SECRET || '';
  if (!accessToken) return NextResponse.json({ error: 'Webhook is not configured' }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  if (typeof body.data !== 'string') return NextResponse.json({ error: 'Missing signed payload' }, { status: 400 });
  let payload: Record<string, unknown>;
  try {
    const verified = await jwtVerify(body.data, new TextEncoder().encode(accessToken));
    payload = verified.payload as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }
  const webhookData = (payload.webhookData || payload) as Record<string, unknown>;
  const partnerOrderId = String(webhookData.partnerOrderId || webhookData.partner_order_id || '');
  if (!partnerOrderId) return NextResponse.json({ error: 'Missing partner order reference' }, { status: 400 });
  const order = await prisma.rampOrder.findUnique({ where: { id: partnerOrderId } });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  await prisma.rampOrder.update({
    where: { id: order.id },
    data: {
      providerOrderId: String(webhookData.id || order.providerOrderId || ''),
      status: String(webhookData.status || payload.eventID || order.status),
      digitalAmount: Number(webhookData.cryptoAmount || webhookData.crypto_amount) || order.digitalAmount,
      feeAmount: Number(webhookData.totalFee || webhookData.feeAmount) || order.feeAmount,
      transactionHash: String(webhookData.transactionHash || webhookData.transaction_hash || '') || order.transactionHash,
    },
  });
  return NextResponse.json({ received: true });
}
