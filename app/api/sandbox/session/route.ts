import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSession } from '@/lib/sandbox/store';
import { nextActions } from '@/lib/sandbox/engine';
import { rateLimit } from '@/lib/security/rate-limit';
import { SANDBOX_COOKIE, SANDBOX_SCENARIOS } from '@/lib/sandbox/constants';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    rateLimit(request, 'sandbox-create', 5);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as { scenarioKey?: string };
  const scenarioKey = body.scenarioKey && SANDBOX_SCENARIOS.includes(body.scenarioKey) ? body.scenarioKey : 'normal';

  const { id, state } = await createSession(scenarioKey);
  const store = await cookies();
  store.set(SANDBOX_COOKIE, id, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 });

  return NextResponse.json({ id, state, actions: nextActions(state) });
}
