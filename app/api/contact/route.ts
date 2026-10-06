import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/security/rate-limit';
import { assertSameOrigin } from '@/lib/security/origin';
import { hashIp, notificationText, validateInquiry } from '@/lib/contact/inquiry';

export const dynamic = 'force-dynamic';

// Public endpoint. Same-origin only, rate limited, honeypot and timing checks, validated and length-limited.
// Provider keys are read only on the server. The notification carries no message body or personal details.
async function notify(text: string) {
  const url = process.env.EMAIL_PROVIDER_URL;
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  if (!url || !to) return false;
  try {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.EMAIL_PROVIDER_TOKEN || ''}` }, body: JSON.stringify({ to, subject: 'New Vartola enquiry', body: text, template: 'CONTACT_NOTIFICATION' }) });
    return response.ok;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    rateLimit(request, 'contact', 5, 10 * 60_000);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Request blocked' }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  const result = validateInquiry(body);
  if (!result.ok) {
    // A tripped honeypot or timing check gets a generic success so a bot learns nothing, and nothing is stored.
    if (result.spam) return NextResponse.json({ ok: true });
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  try {
    const row = await prisma.contactInquiry.create({
      data: { ...result.value, status: result.spam ? 'SPAM' : 'NEW', ipHash: hashIp(ip) },
      select: { id: true },
    });
    if (!result.spam) {
      const sent = await notify(notificationText(result.value));
      if (sent) await prisma.contactInquiry.update({ where: { id: row.id }, data: { notified: true } }).catch(() => undefined);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('contact submission failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'We could not record your message. Please try again shortly.' }, { status: 500 });
  }
}
